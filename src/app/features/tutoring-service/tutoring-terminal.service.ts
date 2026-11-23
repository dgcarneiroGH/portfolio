import {
  computed,
  inject,
  Injectable,
  OnDestroy,
  signal
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  subjectListFor,
  TutoringSubject,
  TutoringSubjectId
} from './constants/tutoring.constants';

/** Tono visual de un segmento de línea del terminal (familia $discord-*). */
export type TerminalTone =
  | 'accent'
  | 'success'
  | 'muted'
  | 'info'
  | 'warning'
  | 'link'
  | 'plain'
  | 'error';

/** Tipo de línea del log: determina la estructura de render en el componente. */
export type TerminalLineKind =
  | 'banner'
  | 'boot'
  | 'question'
  | 'options'
  | 'input'
  | 'echo'
  | 'error'
  | 'system';

/** Segmento de línea: clave i18n o texto literal, con su tono de color. */
export interface TerminalPart {
  readonly tone: TerminalTone;
  readonly key?: string;
  readonly text?: string;
  readonly params?: Record<string, string | number>;
}

/** Línea del log del terminal (inmutable; el id evita re-render de @for). */
export interface TerminalLine {
  readonly id: number;
  readonly kind: TerminalLineKind;
  readonly parts: readonly TerminalPart[];
  /** true para el banner ASCII (<pre>, sin traducir). */
  readonly pre?: boolean;
}

/** Paso activo del cuestionario (4 preguntas + confirmación de envío). */
export type TerminalStep =
  | 'CYCLE'
  | 'YEAR'
  | 'SUBJECTS'
  | 'HOURS'
  | 'CONFIRM'
  | 'SENT';

/** Respuestas normalizadas del alumno. */
export interface TutoringAnswers {
  cycle: string;
  year: string;
  subjects: readonly TutoringSubjectId[];
  hours: string;
}

/** Lead listo para el formulario de contacto (mensaje oculto al usuario). */
export interface TutoringLead {
  readonly message: string;
}

/** Línea tal y como la pinta el componente en cada instante. */
export interface DisplayLine {
  readonly id: number;
  readonly kind: TerminalLineKind;
  readonly parts: readonly TerminalPart[];
  readonly pre: boolean;
  /** true en la línea que se está escribiendo (caret en el extremo). */
  readonly typing: boolean;
}

// ---------- Velocidades del tecleo (afinables) ----------
/** ms por carácter de las líneas que se teclean. */
export const TYPING_CHAR_MS = 10;
/** Ritmo fijo por línea de opción (lista rápida, sin tecleo parcial). */
export const TYPING_OPTION_LINE_MS = 50;
/** Pausa entre opciones consecutivas. */
export const TYPING_OPTION_GAP_MS = 25;
/** Pausa entre el resto de líneas. */
export const TYPING_LINE_GAP_MS = 60;
/** Techo/mínimo del coste de una línea tecleada (evita eternidades y flashes). */
export const TYPING_LINE_MIN_MS = 60;
export const TYPING_LINE_MAX_MS = 420;
/** Intervalo del ticker del motor. */
export const TYPING_TICK_MS = 16;

/** Líneas que aparecen de golpe (en un terminal real el eco es instantáneo). */
const INSTANT_KINDS: readonly TerminalLineKind[] = ['input', 'echo', 'banner'];

/** Longitud total del texto de una línea (para el coste de tecleo). */
function lineTextLength(line: TerminalLine): number {
  return line.parts.reduce((sum, part) => sum + (part.text?.length ?? 0), 0);
}

/** Coste de tecleo de una línea (0 = aparece de golpe). */
function lineCostMs(line: TerminalLine): number {
  if (line.pre || INSTANT_KINDS.includes(line.kind)) return 0;
  if (line.kind === 'options') return TYPING_OPTION_LINE_MS;
  return Math.min(
    Math.max(lineTextLength(line) * TYPING_CHAR_MS, TYPING_LINE_MIN_MS),
    TYPING_LINE_MAX_MS
  );
}

/** Pausa tras una línea (las opciones consecutivas van en ráfaga). */
function gapAfterMs(line: TerminalLine, next?: TerminalLine): number {
  if (line.kind === 'options' && next?.kind === 'options') {
    return TYPING_OPTION_GAP_MS;
  }
  return TYPING_LINE_GAP_MS;
}

/** Coste total de la línea + su pausa. */
function segmentMs(line: TerminalLine, next?: TerminalLine): number {
  return lineCostMs(line) + gapAfterMs(line, next);
}

/** Corta los segmentos de una línea al número de caracteres visibles. */
function truncateParts(
  parts: readonly TerminalPart[],
  chars: number
): TerminalPart[] {
  const out: TerminalPart[] = [];
  let budget = chars;
  for (const part of parts) {
    const text = part.text ?? '';
    if (budget <= 0) break;
    if (text.length <= budget) {
      out.push(part);
      budget -= text.length;
    } else {
      out.push({ ...part, text: text.slice(0, budget) });
      budget = 0;
    }
  }
  return out;
}

/** 'daw'/'DAW '/'dam' → 'DAW'|'DAM'; resto → null. */
export function normalizeCycle(value: string): 'DAW' | 'DAM' | null {
  const clean = value.trim().toUpperCase();
  if (clean === 'DAW') return 'DAW';
  if (clean === 'DAM') return 'DAM';
  return null;
}

/** '1'/'1º' → '1º', '2'/'2º' → '2º'; resto → null. */
export function normalizeYear(value: string): '1º' | '2º' | null {
  const clean = value.trim();
  if (clean === '1' || clean === '1º') return '1º';
  if (clean === '2' || clean === '2º') return '2º';
  return null;
}

/**
 * Multi-select por números separados por comas sobre la LISTA ACTIVA: devuelve
 * índices 0-based, deduplicados y ordenados según la lista. Tolerante
 * a espacios y ceros a la izquierda (' 3 , 01 ' → [2, 0]). Cualquier token no
 * numérico o fuera de 1..listLength → null.
 */
export function parseSubjectSelection(
  value: string,
  listLength: number
): number[] | null {
  const tokens = value.trim().split(',');
  const picked = new Set<number>();
  for (const token of tokens) {
    const clean = token.trim();
    // Comas dobles ('1,,3'): el token vacío se salta, no invalida.
    if (!clean) continue;
    if (!/^\d+$/.test(clean)) return null;
    const option = Number(clean);
    if (option < 1 || option > listLength) return null;
    picked.add(option - 1);
  }
  // Entrada vacía o solo comas: sin selección válida → null.
  if (picked.size === 0) return null;
  return [...picked].sort((a, b) => a - b);
}

/**
 * Horas semanales: recorta espacios; solo acepta números enteros puros y
 * añade la 'h' ('4' → '4h'). Cualquier otro texto → null (error + re-pregunta;
 * elección del usuario 2026-11-23: solo números).
 */
export function normalizeHours(value: string): string | null {
  const clean = value.trim();
  if (!/^\d+$/.test(clean)) return null;
  return `${clean}h`;
}

/**
 * Confirmación de envío (Y/N) en el paso final: acepta y/yes/sí/si → true,
 * n/no → false; vacío o cualquier otro valor → null.
 */
export function normalizeConfirm(value: string): boolean | null {
  const clean = value.trim().toLowerCase();
  if (['y', 'yes', 'sí', 'si'].includes(clean)) return true;
  if (['n', 'no'].includes(clean)) return false;
  return null;
}

/** Ruta de claves i18n del terminal. */
const KEYS = 'TUTORING.TERMINAL';

/** Banner ASCII del mock (literal, sin traducir). */
const BANNER_ART = [
  '  _  _  ___  __  __   _   ___ ___  ___   _     ___ _    ___ ',
  ' | \\| |/ _ \\|  \\/  | /_\\ / __/ _ \\|   \\ /_\\   / __| |  |_ _|',
  ' | .` | (_) | |\\/| |/ _ \\ (_| (_) | |) / _ \\ | (__| |__ | |',
  ' |_|\\_|\\___/|_|  |_/_/ \\_\\___\\___/|___/_/ \\_\\ \\___|____|___|'
].join('\n');

/**
 * Estado y máquina de estados del terminal de tutorías (/tutoring).
 * El log crece por líneas inmutables; el input lo pinta el componente (una
 * sola línea de comandos bajo el log). Solo el lead y el eco de asignaturas
 * resuelven valores traducidos con TranslateService.instant; el resto de
 * líneas referencian claves i18n que el componente traduce con el pipe
 * (patrón web-migration-wizard.service.ts).
 */
@Injectable({ providedIn: 'root' })
export class TutoringTerminalService implements OnDestroy {
  private readonly translate = inject(TranslateService);

  /** Contador de ids del log (debe declararse antes de _lines). */
  private nextLineId = 0;

  private readonly _step = signal<TerminalStep>('CYCLE');
  private readonly _answers = signal<TutoringAnswers>({
    cycle: '',
    year: '',
    subjects: [],
    hours: ''
  });
  private readonly _lines = signal<readonly TerminalLine[]>(
    this.buildInitialLines()
  );
  private readonly _pendingLead = signal<TutoringLead | null>(null);

  /** Reloj del motor de tecleo: ms simulados transcurridos del log. */
  private readonly _clock = signal(0);
  /** prefers-reduced-motion: el efecto se desactiva por completo. */
  private readonly _reducedMotion = signal(this.readReducedMotion());
  /** Id del ticker activo (null = motor parado). */
  private tickerId: ReturnType<typeof setInterval> | null = null;

  readonly step = this._step.asReadonly();
  readonly answers = this._answers.asReadonly();
  readonly lines = this._lines.asReadonly();
  readonly pendingLead = this._pendingLead.asReadonly();

  constructor() {
    // reduced-motion puede cambiar en caliente: se sigue en vivo (WCAG).
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener?.('change', (e) => {
        this._reducedMotion.set(e.matches);
        this.syncTyping();
      });
    }
    this.syncTyping();
  }

  ngOnDestroy(): void {
    this.stopTicker();
  }

  /** Líneas visibles en este instante (la última, recortada, tecleándose). */
  readonly displayLines = computed<readonly DisplayLine[]>(() => {
    const all = this._lines();
    const cursor = this._clock();
    const out: DisplayLine[] = [];
    let t = 0;
    for (let i = 0; i < all.length; i++) {
      const line = all[i];
      const cost = lineCostMs(line);
      const gap = gapAfterMs(line, all[i + 1]);
      if (cursor < t) break;
      const endTyping = t + cost;
      if (cursor >= endTyping) {
        const inGap = cursor < endTyping + gap;
        out.push({
          id: line.id,
          kind: line.kind,
          parts: line.parts,
          pre: line.pre ?? false,
          typing: inGap
        });
        t = endTyping + gap;
        if (inGap) break;
        continue;
      }
      // Tecleándose: la línea aún no está completa.
      if (line.kind === 'options') break; // ráfaga: todo o nada
      const chars = Math.min(
        Math.floor((cursor - t) / TYPING_CHAR_MS),
        lineTextLength(line)
      );
      out.push({
        id: line.id,
        kind: line.kind,
        parts: truncateParts(line.parts, chars),
        pre: line.pre ?? false,
        typing: true
      });
      break;
    }
    return out;
  });

  /** true mientras quede log pendiente de revelar. */
  readonly isTyping = computed<boolean>(() => {
    if (this._reducedMotion()) return false;
    const all = this._lines();
    let total = 0;
    for (let i = 0; i < all.length; i++) {
      total += segmentMs(all[i], all[i + 1]);
    }
    return this._clock() < total;
  });

  /** Callback de fin de tecleo (navegación diferida del componente). */
  private typingDoneCallback: (() => void) | null = null;

  /**
   * Registra la reacción al terminar el tecleo (o al hacer flush con log
   * pendiente). Llamada síncrona desde el ticker: determinista en tests con
   * reloj simulado, donde el scheduler de zoneless no es fiable.
   */
  onTypingDone(callback: () => void): void {
    this.typingDoneCallback = callback;
  }

  /** Completa todo el tecleo pendiente al instante (escape del usuario). */
  flushTyping(): void {
    const hadPending = this.isTyping();
    this.stopTicker();
    const all = this._lines();
    let total = 0;
    for (let i = 0; i < all.length; i++) {
      total += segmentMs(all[i], all[i + 1]);
    }
    this._clock.set(total);
    if (hadPending) this.typingDoneCallback?.();
  }

  /** Respuesta tecleada: '' se ignora; `clear` reinicia; válida → avanza. */
  submit(raw: string): void {
    if (!raw.trim()) return;

    // Mientras el sistema teclea, un Enter del usuario vuelca el log
    // completo al instante y procesa la respuesta (el input nunca se bloquea).
    this.flushTyping();

    // Comando nativo del terminal: "clear" vuelve a empezar en cualquier
    // paso (incluido CONFIRM y SENT, donde el input está a la espera).
    if (raw.trim().toLowerCase() === 'clear') {
      this.restart();
      return;
    }

    switch (this._step()) {
      case 'CYCLE':
        this.submitCycle(raw);
        break;
      case 'YEAR':
        this.submitYear(raw);
        break;
      case 'SUBJECTS':
        this.submitSubjects(raw);
        break;
      case 'HOURS':
        this.submitHours(raw);
        break;
      case 'CONFIRM':
        this.submitConfirm(raw);
        break;
      case 'SENT':
        // Sesión enviada: sin más entradas hasta clear & restart.
        break;
    }
  }

  /** "clear & restart": log inicial, paso CYCLE y respuestas a cero. */
  restart(): void {
    this._step.set('CYCLE');
    this._answers.set({ cycle: '', year: '', subjects: [], hours: '' });
    this._lines.set(this.buildInitialLines());
    this._pendingLead.set(null);
    // La secuencia de arranque se teclea de nuevo (rápida por los clamps).
    this._clock.set(0);
    this.syncTyping();
  }

  // ---------- Motor de tecleo ----------

  /** Lee la preferencia de movimiento reducido (con guard SSR). */
  private readReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Arranca o detiene el ticker según quede log pendiente. */
  private syncTyping(): void {
    if (this._reducedMotion()) {
      this.flushTyping();
      return;
    }
    if (this.isTyping() && this.tickerId === null) {
      this.tickerId = setInterval(() => {
        this._clock.update((clock) => clock + TYPING_TICK_MS);
        if (!this.isTyping()) {
          this.stopTicker();
          // Fin de tecleo notificado en línea: el componente reacciona
          // (navegación diferida) sin depender del scheduler de zoneless.
          this.typingDoneCallback?.();
        }
      }, TYPING_TICK_MS);
    }
  }

  private stopTicker(): void {
    if (this.tickerId !== null) {
      clearInterval(this.tickerId);
      this.tickerId = null;
    }
  }

  /**
   * Lead preconstruido oculto (como en n8n): solo con el cuestionario
   * completado y mientras el usuario esté en la pregunta de envío. Mensaje
   * único WITH_PROJECT (elección del usuario 2026-11-21), haya FCT o no.
   */
  prepareLead(): TutoringLead | null {
    if (this._step() !== 'CONFIRM') return null;

    const { cycle, year, subjects, hours } = this._answers();
    const message = `${this.translate.instant(`${KEYS}.MESSAGE.WITH_PROJECT`, {
      cycle,
      year,
      subjects: this.subjectsLabel(subjects),
      hours
    })}\n\n${this.translate.instant(`${KEYS}.MESSAGE.DISCLAIMER`)}`;
    const lead: TutoringLead = { message };
    this._pendingLead.set(lead);
    return lead;
  }

  /** Consumo único del lead por el formulario de contacto. */
  consumePendingLead(): TutoringLead | null {
    const lead = this._pendingLead();
    if (lead) this._pendingLead.set(null);
    return lead;
  }

  // ---------- Flujos por paso ----------

  private submitCycle(raw: string): void {
    const cycle = normalizeCycle(raw);
    this.appendInputLine(raw);
    if (!cycle) {
      this.appendErrorLine(`${KEYS}.ERRORS.CYCLE`);
      this.appendQuestionCycle();
      return;
    }
    this._answers.update((a) => ({ ...a, cycle }));
    this.appendEchoLine(`${KEYS}.ECHO.CYCLE`, cycle, 'plain');
    this._step.set('YEAR');
    this.appendQuestionYear();
  }

  private submitYear(raw: string): void {
    const year = normalizeYear(raw);
    this.appendInputLine(raw);
    if (!year) {
      this.appendErrorLine(`${KEYS}.ERRORS.YEAR`);
      this.appendQuestionYear();
      return;
    }
    this._answers.update((a) => ({ ...a, year }));
    this.appendEchoLine(`${KEYS}.ECHO.YEAR`, year, 'plain');
    this._step.set('SUBJECTS');
    this.appendQuestionSubjects();
    // La lista de asignaturas depende del ciclo y el año respondidos.
    this.appendOptionLines();
  }

  private submitSubjects(raw: string): void {
    const list = this.activeSubjectList();
    const indices = parseSubjectSelection(raw, list.length);
    this.appendInputLine(raw);
    if (!indices) {
      this.appendErrorLine(`${KEYS}.ERRORS.SUBJECTS`, { max: list.length });
      this.appendOptionLines();
      return;
    }
    const subjects = indices.map((i) => list[i].id);
    this._answers.update((a) => ({ ...a, subjects }));
    this.appendEchoLine(
      `${KEYS}.ECHO.SUBJECTS`,
      this.subjectsLabel(subjects),
      'accent'
    );
    this._step.set('HOURS');
    this.appendQuestionHours();
  }

  private submitHours(raw: string): void {
    const hours = normalizeHours(raw);
    this.appendInputLine(raw);
    if (!hours) {
      this.appendErrorLine(`${KEYS}.ERRORS.HOURS`);
      this.appendQuestionHours();
      return;
    }
    this._answers.update((a) => ({ ...a, hours }));
    this.appendEchoLine(`${KEYS}.ECHO.HOURS`, hours, 'plain');
    this._step.set('CONFIRM');
    this.appendSummary();
    this.appendQuestionConfirm();
  }

  /**
   * Paso final: "¡Mensaje guardado! ¿Deseas contactar...? (Y/N)".
   * Y → línea de dispatch + lead oculto + SENT (el componente navega);
   * N → reinicio directo del terminal; otra cosa → error y re-pregunta.
   */
  private submitConfirm(raw: string): void {
    const confirmed = normalizeConfirm(raw);
    this.appendInputLine(raw);
    if (confirmed === null) {
      this.appendErrorLine(`${KEYS}.ERRORS.CONFIRM`);
      this.appendQuestionConfirm();
      return;
    }
    if (!confirmed) {
      // El usuario descarta: reinicio directo (sin líneas intermedias).
      this.restart();
      return;
    }
    this.appendLine('system', [
      { tone: 'success', key: `${KEYS}.SUMMARY.DISPATCH` }
    ]);
    this.prepareLead();
    this._step.set('SENT');
  }

  // ---------- Composición de líneas ----------

  /**
   * Resuelve el texto de los segmentos con translate.instant: el motor de
   * tecleo necesita caracteres, y el log queda congelado en el idioma del
   * momento (como un terminal real). key/params se conservan para los tests.
   */
  private resolveParts(parts: readonly TerminalPart[]): TerminalPart[] {
    return parts.map((part) => ({
      ...part,
      text:
        part.text ??
        this.translate.instant(part.key as string, part.params)
    }));
  }

  private appendLine(kind: TerminalLineKind, parts: readonly TerminalPart[], pre?: boolean): void {
    this._lines.update((lines) => [
      ...lines,
      { id: this.nextLineId++, kind, parts: this.resolveParts(parts), pre }
    ]);
    this.syncTyping();
  }

  private appendInputLine(raw: string): void {
    this.appendLine('input', [
      ...promptParts(),
      { tone: 'plain', text: raw }
    ]);
  }

  private appendErrorLine(key: string, params?: Record<string, string | number>): void {
    this.appendLine('error', [
      { tone: 'error', text: '✗ ' },
      { tone: 'error', key, params }
    ]);
  }

  private appendEchoLine(primaryKey: string, value: string, tone: TerminalTone): void {
    this.appendLine('echo', [
      { tone: 'success', text: '✔ ' },
      { tone: 'muted', key: primaryKey },
      { tone, text: ` ${value}` }
    ]);
  }

  private appendQuestionCycle(): void {
    this.appendLine('question', [
      { tone: 'info', text: '? ' },
      { tone: 'plain', key: `${KEYS}.QUESTIONS.CYCLE` },
      { tone: 'muted', key: `${KEYS}.QUESTIONS.CYCLE_HINT` }
    ]);
  }

  private appendQuestionYear(): void {
    this.appendLine('question', [
      { tone: 'info', text: '? ' },
      { tone: 'plain', key: `${KEYS}.QUESTIONS.YEAR` },
      { tone: 'muted', key: `${KEYS}.QUESTIONS.YEAR_HINT` }
    ]);
  }

  private appendQuestionSubjects(): void {
    this.appendLine('question', [
      { tone: 'info', text: '? ' },
      { tone: 'plain', key: `${KEYS}.QUESTIONS.SUBJECTS` },
      { tone: 'muted', key: `${KEYS}.QUESTIONS.SUBJECTS_HINT` }
    ]);
  }

  private appendQuestionHours(): void {
    this.appendLine('question', [
      { tone: 'info', text: '? ' },
      { tone: 'plain', key: `${KEYS}.QUESTIONS.HOURS` },
      { tone: 'muted', key: `${KEYS}.QUESTIONS.HOURS_HINT` }
    ]);
  }

  /**
   * Opciones de la lista activa (según ciclo y año respondidos); FCT va
   * primera con tono accent (color/estilo de línea diferente al resto).
   */
  private appendOptionLines(): void {
    const list = this.activeSubjectList();
    for (let i = 0; i < list.length; i++) {
      const subject = list[i];
      const tone: TerminalTone = subject.highlighted ? 'accent' : 'plain';
      this.appendLine('options', [
        { tone: 'link', text: `[${i + 1}] ` },
        { tone, key: `${KEYS}.SUBJECTS.${subject.id}` }
      ]);
    }
  }

  /** Lista activa a partir de las respuestas de ciclo y año. */
  private activeSubjectList(): readonly TutoringSubject[] {
    const { cycle, year } = this._answers();
    return subjectListFor(cycle, year);
  }

  private appendSummary(): void {
    this.appendLine('system', [
      { tone: 'success', text: '✔ ' },
      { tone: 'success', key: `${KEYS}.SUMMARY.BUILDING` }
    ]);
    this.appendLine('system', [{ tone: 'muted', key: `${KEYS}.SUMMARY.BUILD_OK` }]);
    this.appendLine('system', [{ tone: 'muted', key: `${KEYS}.SUMMARY.SOCKET_OK` }]);
  }

  /** Pregunta final de envío (mismo formato que el resto de preguntas). */
  private appendQuestionConfirm(): void {
    this.appendLine('question', [
      { tone: 'info', text: '? ' },
      { tone: 'plain', key: `${KEYS}.QUESTIONS.CONFIRM` },
      { tone: 'muted', key: `${KEYS}.QUESTIONS.CONFIRM_HINT` }
    ]);
  }

  private buildInitialLines(): TerminalLine[] {
    const lines: TerminalLine[] = [
      { id: this.nextLineId++, kind: 'banner', parts: this.resolveParts([{ tone: 'accent', text: BANNER_ART }]), pre: true },
      { id: this.nextLineId++, kind: 'system', parts: this.resolveParts([{ tone: 'success', key: `${KEYS}.BANNER.TITLE` }]), pre: false },
      { id: this.nextLineId++, kind: 'system', parts: this.resolveParts([{ tone: 'muted', key: `${KEYS}.BANNER.DESCRIPTION` }]), pre: false },
      { id: this.nextLineId++, kind: 'system', parts: this.resolveParts([{ tone: 'muted', key: `${KEYS}.BANNER.HINT` }]), pre: false },
      { id: this.nextLineId++, kind: 'input', parts: this.resolveParts([...promptParts(), { tone: 'warning', text: './solicitar_tutoria.sh --interactive' }]), pre: false },
      { id: this.nextLineId++, kind: 'boot', parts: this.resolveParts(bootParts(`${KEYS}.BOOT.CHECK_MODULES`)), pre: false },
      { id: this.nextLineId++, kind: 'boot', parts: this.resolveParts(bootParts(`${KEYS}.BOOT.CHECK_CHANNEL`)), pre: false },
      { id: this.nextLineId++, kind: 'system', parts: this.resolveParts([{ tone: 'plain', key: `${KEYS}.BOOT.START` }]), pre: false }
    ];
    this.appendQuestionCycleInto(lines);
    return lines;
  }

  /** Variante de appendQuestionCycle para el log inicial (sin signal). */
  private appendQuestionCycleInto(lines: TerminalLine[]): void {
    lines.push({
      id: this.nextLineId++,
      kind: 'question',
      parts: this.resolveParts([
        { tone: 'info', text: '? ' },
        { tone: 'plain', key: `${KEYS}.QUESTIONS.CYCLE` },
        { tone: 'muted', key: `${KEYS}.QUESTIONS.CYCLE_HINT` }
      ]),
      pre: false
    });
  }

  // ---------- Mensaje del lead ----------

  /** Etiquetas traducidas de las asignaturas, unidas con conector por locale. */
  private subjectsLabel(subjects: readonly TutoringSubjectId[]): string {
    const labels = subjects.map((id) =>
      this.translate.instant(`${KEYS}.SUBJECTS.${id}`)
    );
    const connector = (this.translate.currentLang ?? '').startsWith('es')
      ? ' y '
      : ' and ';
    if (labels.length <= 1) return labels.join('');
    return `${labels.slice(0, -1).join(', ')}${connector}${labels[labels.length - 1]}`;
  }
}

/** Prompt común de la línea de comandos (estilo del mock). */
function promptParts(): TerminalPart[] {
  return [
    { tone: 'success', text: 'nomacoda@student' },
    { tone: 'muted', text: ':' },
    { tone: 'accent', text: '~' },
    { tone: 'plain', text: '$ ' }
  ];
}

/** Líneas de arranque con marcador i y [OK] en verde. */
function bootParts(primaryKey: string): TerminalPart[] {
  return [
    { tone: 'info', text: 'i ' },
    { tone: 'muted', key: primaryKey },
    { tone: 'success', text: ' [OK]' }
  ];
}
