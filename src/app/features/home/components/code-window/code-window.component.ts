import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HERO_CODE_LINES, HERO_LOG_MESSAGES, Token } from './code-lines';
import { HERO_CLOCK, HERO_DISPLAY_ENV } from './code-runtime';

/** Estados del panel: el typing es one-shot, `compiled` es terminal. */
export type HeroCodeState = 'idle' | 'typing' | 'compiling' | 'compiled';

/** Ventana de la agenda de typing (ms por línea, con jitter). */
const LINE_MS_MIN = 105;
const LINE_MS_MAX = 125;
/** Presupuesto total del typing (ms), acorde a E1/DoD. */
const TYPING_TOTAL_MIN = 2200;
const TYPING_TOTAL_MAX = 3200;
const TYPING_TOTAL_TARGET = 2350;
/** Retardo de arranque cuando el panel ya es visible al cargar (ms). */
const BOOT_DELAY_MS = 400;
/** Vida del caret tras terminar el typing (fade-out). */
const CARET_FADE_MS = 200;
/** Ventana de la simulación de compilación. */
const COMPILE_MIN_MS = 700;
const COMPILE_MAX_MS = 900;
/** Tiempo de compilación mostrado (aleatorio, una vez por montaje). */
const COMPILE_DISPLAY_MIN = 184;
const COMPILE_DISPLAY_RANGE = 420 - COMPILE_DISPLAY_MIN;
/** E6: ciclo del log (hold 4.5s, fades 180ms). */
const LOG_HOLD_MS = 4500;
const LOG_FADE_MS = 180;
/** E7: jitter de métricas (1.8-2.5s) e interpolación (400ms). */
const METRIC_JITTER_MIN_MS = 1800;
const METRIC_JITTER_MAX_MS = 2500;
const METRIC_ANIM_MS = 400;
const MEM_MIN = 38;
const MEM_RANGE = 46 - MEM_MIN + 1;
const CPU_MIN = 1;
const CPU_RANGE = 4 - CPU_MIN + 1;
/** E4: retardo de intención de hover y autocierre táctil. */
const TOOLTIP_DELAY_MS = 120;
const TOOLTIP_TOUCH_CLOSE_MS = 2000;

interface MetricsAnim {
  fromMem: number;
  toMem: number;
  fromCpu: number;
  toCpu: number;
  start: number;
}

/**
 * Ventana de código "viva" del hero (`developer.config.ts`).
 *
 * Elemento 100% decorativo: el bloque raíz se expone como `role="img"` con
 * etiqueta traducida y cada región interior es `aria-hidden="true"`, sin
 * ningún nodo con foco. El typing avanza por `requestAnimationFrame` con
 * diff de índice y todo timer/frame pasa por el reloj inyectable
 * (`HERO_CLOCK`), que se cancela al destruir el componente. Todo se pausa
 * con el panel fuera de viewport o con la pestaña oculta (E12).
 */
@Component({
  selector: 'app-code-window',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './code-window.component.html',
  styleUrl: './code-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroCodeWindowComponent {
  /** Fuente de verdad del snippet (tipada, nunca hardcodeada en template). */
  readonly lines = HERO_CODE_LINES;
  /** Cola circular de logs (E6). */
  readonly logMessages = HERO_LOG_MESSAGES;

  /** Máquina de estados del panel. */
  readonly state = signal<HeroCodeState>('idle');
  /** Caracteres visibles del snippet en el momento actual. */
  readonly revealedChars = signal(0);
  /** `true` durante los 200ms de fade-out del caret tras el typing. */
  readonly caretDying = signal(false);
  /** Transform del caret único (fuera del flujo → cero CLS al moverse). */
  readonly caretTransform = signal('translate(0px, 0px)');
  /** Caret oculto (opacity 0) cuando no hay typing activo que lo justifique. */
  readonly caretOff = computed(() => {
    const state = this.state();
    if (this.fullRender()) {
      return true;
    }
    if (state === 'typing') {
      return false;
    }
    if (state === 'compiling') {
      return !this.caretDying();
    }
    return state !== 'idle';
  });
  /** Render estático completo (reduced-motion / fallback sin animación). */
  readonly fullRender = signal(false);

  // E4 · hover de inspección
  readonly hoveredLine = signal<number | null>(null);
  readonly tooltipVisible = signal(false);
  readonly tooltipTop = signal(0);

  // E6 · log rotativo
  readonly logIndex = signal(0);
  readonly logHidden = signal(false);

  // E7 · métricas vivas
  readonly memMb = signal(42);
  readonly cpuPct = signal(2);

  // E9 · fades de scroll interno
  readonly scrollFades = signal({ top: false, bottom: false });

  /** Línea bajo el cursor del typing (null cuando no hay typing activo). */
  readonly activeLine = computed<number | null>(() => {
    const state = this.state();
    if (state === 'typing') {
      return this._lineIndexAtRevealed();
    }
    if (state === 'compiling' && this.caretDying()) {
      return this.lines.length - 1;
    }
    return state === 'idle' ? 0 : null;
  });

  /** Tiempo de compilación mostrado: aleatorio, una vez por montaje. */
  readonly compileMs = signal(
    COMPILE_DISPLAY_MIN + Math.round(Math.random() * COMPILE_DISPLAY_RANGE)
  );

  /** Número total de caracteres del snippet (para tests y estado final). */
  readonly totalChars: number;

  private readonly _clock = inject(HERO_CLOCK);
  private readonly _env = inject(HERO_DISPLAY_ENV);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _host = inject(ElementRef<HTMLElement>);
  private readonly _codeRegion = viewChild.required<ElementRef<HTMLElement>>('codeRegion');

  private readonly _lineStarts: number[] = [];
  private readonly _lineLengths: number[] = [];
  private readonly _lineDurations: number[] = [];

  private readonly _timers = new Set<unknown>();
  private readonly _frames = new Map<string, unknown>();
  private readonly _inView = signal(false);
  private readonly _pageVisible = signal(true);

  private _io: IntersectionObserver | null = null;
  private _bootReady = false;
  private _typedOnce = false;
  private _typingElapsed = 0;
  private _typingLast = 0;
  private _lastActiveLine = -1;

  private _logTimer: unknown = null;
  private _logStarted = false;
  private _metricsTimer: unknown = null;
  private _metricsAnim: MetricsAnim | null = null;
  private _tooltipTimer: unknown = null;
  private _tooltipCloseTimer: unknown = null;

  /** El typing (y el resto de ciclos) solo corren visibles y con pestaña activa. */
  private _isRunning(): boolean {
    return this._inView() && this._pageVisible();
  }

  constructor() {
    this.totalChars = this._prepareSchedule();

    afterNextRender(() => {
      if (this._env.reducedMotion) {
        // E11: reduced-motion → código completo, ni un timer programado.
        this.fullRender.set(true);
        return;
      }

      // Caret "en espera" en la primera línea (idle con motion permitido).
      this._positionCaret(0);

      // "Ya visible al cargar": arranque diferido tras 400ms.
      this._schedule(() => {
        this._bootReady = true;
        this._tryStartTyping();
      }, BOOT_DELAY_MS);

      if (typeof IntersectionObserver === 'function') {
        this._io = new IntersectionObserver(
          (entries) => this._onIntersection(entries),
          { threshold: 0.35 }
        );
        this._io.observe(this._host.nativeElement);
      } else {
        // Fallback sin IO: se considera siempre en viewport.
        this._bootReady = true;
        this._inView.set(true);
      }

      // E12: pestaña oculta → pausa global sin perder posición.
      document.addEventListener('visibilitychange', this._onVisibilityChange);

      // E8: spotlight solo con puntero fino y sin reduced-motion.
      if (this._env.finePointer) {
        const host = this._host.nativeElement;
        host.addEventListener('pointerenter', this._onSpotEnter);
        host.addEventListener('pointermove', this._onSpotMove, { passive: true });
        host.addEventListener('pointerleave', this._onSpotLeave);
      }
    });

    // E5: al entrar en compiling se programa el fin de build (700-900ms).
    effect(() => {
      if (this.state() === 'compiling') {
        this._schedule(
          () => this.state.set('compiled'),
          COMPILE_MIN_MS + Math.random() * (COMPILE_MAX_MS - COMPILE_MIN_MS)
        );
      }
    });

    this._destroyRef.onDestroy(() => this._cleanup());
  }

  /** Tokens visibles de la línea `index` en el frame actual. */
  visibleTokens(index: number): Token[] {
    const line = this.lines[index];
    if (this.fullRender()) {
      return line.tokens;
    }

    const visible = this.revealedChars() - this._lineStarts[index];
    if (visible <= 0) {
      return [];
    }

    const out: Token[] = [];
    let remaining = Math.min(visible, this._lineLengths[index]);
    for (const token of line.tokens) {
      if (remaining <= 0) {
        break;
      }
      if (token.text.length <= remaining) {
        out.push(token);
        remaining -= token.text.length;
      } else {
        out.push({ text: token.text.slice(0, remaining), kind: token.kind });
        remaining = 0;
      }
    }
    return out;
  }

  /** Clave i18n completa del tooltip de la línea en hover ('' si no lleva). */
  tooltipKey(): string {
    const index = this.hoveredLine();
    if (index === null) {
      return '';
    }
    const hintKey = this.lines[index]?.hintKey;
    return hintKey ? `HOME.${hintKey}` : '';
  }

  // ————————————————— E4 · hover / tap de inspección —————————————————

  onLineEnter(index: number, event: Event): void {
    if (!this._env.hover || !this._tooltipsAllowed()) {
      return;
    }
    this._rememberHover(index, event);

    if (!this.lines[index].hintKey) {
      return;
    }
    this._cancelTimer(this._tooltipTimer);
    this._tooltipTimer = this._schedule(() => {
      this.tooltipVisible.set(true);
    }, TOOLTIP_DELAY_MS);
  }

  onLineLeave(): void {
    if (!this._env.hover) {
      return;
    }
    this.hoveredLine.set(null);
    this._cancelTimer(this._tooltipTimer);
    this.tooltipVisible.set(false);
  }

  onLineTap(index: number, event: Event): void {
    // En táctil no hay hover: el tap manda (E4).
    if (this._env.hover || !this._tooltipsAllowed()) {
      return;
    }
    if (!this.lines[index].hintKey) {
      return;
    }
    this._rememberHover(index, event);
    this.tooltipVisible.set(true);

    this._cancelTimer(this._tooltipCloseTimer);
    this._tooltipCloseTimer = this._schedule(() => {
      this.tooltipVisible.set(false);
      this.hoveredLine.set(null);
    }, TOOLTIP_TOUCH_CLOSE_MS);
  }

  private _tooltipsAllowed(): boolean {
    if (this._env.reducedMotion) {
      return this.fullRender();
    }
    return this.state() === 'compiled';
  }

  private _rememberHover(index: number, event: Event): void {
    this.hoveredLine.set(index);
    const row = event.currentTarget as HTMLElement | null;
    if (!row) {
      return;
    }

    // Coordenada VISUAL respecto al panel (el offsetParent de las filas es
    // .hcw__body, no .hcw): se mide con rects y se acota al área de código,
    // para que filas scrolleadas fuera de vista no saquen el tooltip
    // del panel (E4). Una lectura de layout por hover.
    const host = this._host.nativeElement;
    const hostTop = host.getBoundingClientRect().top;
    const rowTop = row.getBoundingClientRect().top - hostTop;

    const codeRect = this._codeRegion().nativeElement.getBoundingClientRect();
    const min = codeRect.top - hostTop + 2;
    const max = Math.max(min, codeRect.bottom - hostTop - 28);
    this.tooltipTop.set(Math.min(Math.max(rowTop, min), max));
  }

  // ————————————————— E6 · log rotativo —————————————————

  private _syncLog(): void {
    this._cancelTimer(this._logTimer);
    this._logTimer = null;

    if (!this._isRunning() || this._env.reducedMotion) {
      // Pausa (o reduced-motion): sin ciclo; si estaba fundiéndose, visible.
      this.logHidden.set(false);
      return;
    }

    if (!this._logStarted) {
      this._logStarted = true;
      this.logIndex.set(0);
      this.logHidden.set(false);
    }
    this._scheduleLogHold();
  }

  private _scheduleLogHold(): void {
    if (!this._isRunning()) {
      // Defensa extra: nunca re-armar el ciclo con el panel en pausa (E6/E12).
      return;
    }
    this._logTimer = this._schedule(() => {
      this.logHidden.set(true); // fade-out (el texto se queda mientras funde)

      // El timer de swap ocupa el MISMO slot: pausar en pleno fade-out
      // rompe la cadena y evita que el log siga ciclando oculto (E6).
      this._logTimer = this._schedule(() => {
        // Swap bajo el fade-out; el fade-in lo cubre la misma transición.
        this.logIndex.set((this.logIndex() + 1) % HERO_LOG_MESSAGES.length);
        this.logHidden.set(false);
        this._scheduleLogHold();
      }, LOG_FADE_MS);
    }, LOG_HOLD_MS);
  }

  // ————————————————— E7 · métricas vivas —————————————————

  private _syncMetrics(): void {
    this._cancelTimer(this._metricsTimer);
    this._metricsTimer = null;
    this._cancelFrame('metrics');
    this._metricsAnim = null;

    if (!this._isRunning() || this._env.reducedMotion) {
      return;
    }
    this._metricsTimer = this._schedule(
      () => this._jitterMetrics(),
      METRIC_JITTER_MIN_MS + Math.random() * (METRIC_JITTER_MAX_MS - METRIC_JITTER_MIN_MS)
    );
  }

  private _jitterMetrics(): void {
    this._metricsAnim = {
      fromMem: this.memMb(),
      toMem: MEM_MIN + Math.floor(Math.random() * MEM_RANGE),
      fromCpu: this.cpuPct(),
      toCpu: CPU_MIN + Math.floor(Math.random() * CPU_RANGE),
      start: this._clock.now()
    };

    const step = (): void => {
      const anim = this._metricsAnim;
      if (!anim) {
        return;
      }
      // Interpolación: el binding redondea → repaint solo si cambia el entero.
      const progress = Math.min(1, (this._clock.now() - anim.start) / METRIC_ANIM_MS);
      this.memMb.set(Math.round(anim.fromMem + (anim.toMem - anim.fromMem) * progress));
      this.cpuPct.set(Math.round(anim.fromCpu + (anim.toCpu - anim.fromCpu) * progress));

      if (progress < 1) {
        this._scheduleFrame('metrics', step);
      } else {
        this._metricsAnim = null;
        this._syncMetrics();
      }
    };

    this._scheduleFrame('metrics', step);
  }

  // ————————————————— E8 · spotlight de puntero —————————————————

  private readonly _onSpotEnter = (): void => {
    this._host.nativeElement.classList.add('is-spotlit');
  };

  private readonly _onSpotLeave = (): void => {
    this._host.nativeElement.classList.remove('is-spotlit');
  };

  private readonly _onSpotMove = (event: PointerEvent): void => {
    const x = event.clientX;
    const y = event.clientY;
    // Throttle a un frame: la lectura de layout también va dentro del rAF.
    this._scheduleFrame('spotlight', () => {
      const rect = this._host.nativeElement.getBoundingClientRect();
      const style = this._host.nativeElement.style;
      style.setProperty('--mx', `${Math.round(x - rect.left)}px`);
      style.setProperty('--my', `${Math.round(y - rect.top)}px`);
    });
  };

  // ————————————————— E9 · scroll interno —————————————————

  onCodeScroll(): void {
    this._updateFades();
  }

  private _updateFades(): void {
    const el = this._codeRegion().nativeElement;
    const top = el.scrollTop > 1;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    const current = this.scrollFades();
    if (current.top !== top || current.bottom !== bottom) {
      this.scrollFades.set({ top, bottom });
    }
  }

  /** Auto-scroll suave para seguir la línea activa, solo si hace falta. */
  private _followTyping(lineIndex: number): void {
    const el = this._codeRegion().nativeElement;
    if (el.scrollHeight <= el.clientHeight) {
      return;
    }
    const row = el.children[lineIndex] as HTMLElement | undefined;
    if (!row) {
      return;
    }
    const rowBottom = row.offsetTop + row.offsetHeight;
    if (rowBottom > el.scrollTop + el.clientHeight) {
      el.scrollTo({
        top: rowBottom - el.clientHeight + 8,
        behavior: 'smooth'
      });
    }
  }

  // ————————————————— máquina de estados y motor —————————————————

  private _prepareSchedule(): number {
    let acc = 0;
    for (const line of this.lines) {
      const len = line.tokens.reduce((sum, token) => sum + token.text.length, 0);
      this._lineStarts.push(acc);
      this._lineLengths.push(len);
      acc += len;
      this._lineDurations.push(LINE_MS_MIN + Math.random() * (LINE_MS_MAX - LINE_MS_MIN));
    }

    // El presupuesto total (2200-3200ms) es inviolable: se reescala el jitter.
    const total = this._lineDurations.reduce((sum, ms) => sum + ms, 0);
    if (total < TYPING_TOTAL_MIN || total > TYPING_TOTAL_MAX) {
      const factor = TYPING_TOTAL_TARGET / total;
      for (let i = 0; i < this._lineDurations.length; i++) {
        this._lineDurations[i] *= factor;
      }
    }

    return acc;
  }

  private _lineIndexAtRevealed(): number {
    const revealed = this.revealedChars();
    let index = 0;
    for (let i = 0; i < this._lineStarts.length; i++) {
      if (this._lineStarts[i] <= revealed) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }

  private readonly _onVisibilityChange = (): void => {
    this._pageVisible.set(!document.hidden);

    if (this._isRunning()) {
      this._tryStartTyping();
      this._resumeTyping();
      this._syncLog();
      this._syncMetrics();
    } else {
      this._syncLog();
      this._syncMetrics();
    }
  };

  private _onIntersection(entries: IntersectionObserverEntry[]): void {
    const entry = entries[entries.length - 1];
    this._inView.set(entry.isIntersecting);

    if (entry.isIntersecting) {
      this._tryStartTyping();
      this._resumeTyping();
      this._syncLog();
      this._syncMetrics();
    } else {
      this._syncLog();
      this._syncMetrics();
    }
  }

  private _tryStartTyping(): void {
    if (this._typedOnce || !this._bootReady || !this._isRunning() || this._env.reducedMotion) {
      return;
    }
    this._startTyping();
  }

  /** Reanuda el typing tras una pausa (viewport/pestaña). */
  private _resumeTyping(): void {
    if (this.state() === 'typing' && this._isRunning()) {
      this._scheduleFrame('typing', () => this._onTypingFrame());
    }
  }

  private _startTyping(): void {
    this._typedOnce = true;
    this._typingElapsed = 0;
    this._typingLast = this._clock.now();
    this.state.set('typing');
    this._scheduleFrame('typing', () => this._onTypingFrame());
  }

  private _onTypingFrame(): void {
    const now = this._clock.now();
    const running = this._isRunning();

    // El tiempo solo avanza con el panel visible (pausa sin perder posición).
    if (running) {
      this._typingElapsed += now - this._typingLast;
    }
    this._typingLast = now;

    let revealed = 0;
    let lineStart = 0;
    for (let i = 0; i < this._lineDurations.length; i++) {
      const duration = this._lineDurations[i];
      const fraction = Math.min(
        1,
        Math.max(0, (this._typingElapsed - lineStart) / duration)
      );
      revealed += Math.floor(this._lineLengths[i] * fraction);
      lineStart += duration;
    }
    this.revealedChars.set(revealed);

    if (revealed >= this.totalChars) {
      this._finishTyping();
      return;
    }

    if (running) {
      const active = this._lineIndexAtRevealed();
      if (active !== this._lastActiveLine) {
        this._lastActiveLine = active;
        this._followTyping(active);
      }
      // El caret sigue el final del texto visible (lectura del frame previo).
      this._positionCaret(active);
      this._scheduleFrame('typing', () => this._onTypingFrame());
    }
  }

  /**
   * Coloca el caret único (fuera del flujo) al final del texto visible de la
   * línea activa. Se mueve con `transform`, que no cuenta como layout shift.
   */
  private _positionCaret(lineIndex: number): void {
    const code = this._codeRegion().nativeElement;
    const row = code.children[lineIndex] as HTMLElement | undefined;
    const line = row ? (row.children[1] as HTMLElement | undefined) : undefined;
    if (!row || !line) {
      return;
    }

    const tokens = line.children;
    const last = tokens.length ? (tokens[tokens.length - 1] as HTMLElement) : null;
    const x = last ? last.offsetLeft + last.offsetWidth : line.offsetLeft;
    this.caretTransform.set(`translate(${x}px, ${row.offsetTop}px)`);
  }

  private _finishTyping(): void {
    this.revealedChars.set(this.totalChars);
    this.caretDying.set(true);
    this._schedule(() => this.caretDying.set(false), CARET_FADE_MS);
    this._updateFades();
    // El fin del build lo programa el effect() al observar 'compiling'.
    this.state.set('compiling');
  }

  // ————————————————— scheduling y cleanup —————————————————

  /** Programa un timer registrado: se cancela solo o con el destroy. */
  private _schedule(fn: () => void, ms: number): unknown {
    const handle = this._clock.setTimeout(() => {
      this._timers.delete(handle);
      fn();
    }, ms);
    this._timers.add(handle);
    return handle;
  }

  private _cancelTimer(handle: unknown): void {
    if (handle !== null) {
      this._clock.clearTimeout(handle);
      this._timers.delete(handle);
    }
  }

  /** Un slot de frame por tarea ('typing', 'metrics', …): nunca duplicados. */
  private _scheduleFrame(key: string, fn: () => void): void {
    if (this._frames.has(key)) {
      return;
    }
    const handle = this._clock.requestFrame(() => {
      this._frames.delete(key);
      fn();
    });
    this._frames.set(key, handle);
  }

  private _cancelFrame(key: string): void {
    const handle = this._frames.get(key);
    if (handle !== undefined) {
      this._clock.cancelFrame(handle);
      this._frames.delete(key);
    }
  }

  private _cleanup(): void {
    this._io?.disconnect();
    this._io = null;
    document.removeEventListener('visibilitychange', this._onVisibilityChange);

    const host = this._host.nativeElement;
    host.removeEventListener('pointerenter', this._onSpotEnter);
    host.removeEventListener('pointermove', this._onSpotMove);
    host.removeEventListener('pointerleave', this._onSpotLeave);

    for (const handle of this._timers) {
      this._clock.clearTimeout(handle);
    }
    this._timers.clear();
    for (const handle of this._frames.values()) {
      this._clock.cancelFrame(handle);
    }
    this._frames.clear();
  }
}
