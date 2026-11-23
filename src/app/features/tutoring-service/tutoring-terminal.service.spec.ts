import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TutoringTerminalService } from './tutoring-terminal.service';
import {
  normalizeCycle,
  normalizeHours,
  normalizeYear,
  parseSubjectSelection
} from './tutoring-terminal.service';

/**
 * Lógica pura del terminal de tutorías (/tutoring): normalización de las
 * respuestas tecleadas y parseo del multi-select de asignaturas (por números
 * sobre la LISTA ACTIVA según ciclo/año, Review Focus del plan). Se exportan
 * desde el fichero del servicio (patrón web-migration-wizard.service.ts) para
 * poder testearlas sin Angular.
 */
describe('Lógica pura del terminal de tutorías', () => {
  describe('normalizeCycle', () => {
    it('acepta daw/dam con espacios y mayúsculas, y normaliza', () => {
      expect(normalizeCycle('daw')).toBe('DAW');
      expect(normalizeCycle('DAW')).toBe('DAW');
      expect(normalizeCycle(' dam ')).toBe('DAM');
      expect(normalizeCycle('Dam')).toBe('DAM');
    });

    it('rechaza cualquier otro valor', () => {
      expect(normalizeCycle('')).toBeNull();
      expect(normalizeCycle('   ')).toBeNull();
      expect(normalizeCycle('dfk')).toBeNull();
      expect(normalizeCycle('daw dam')).toBeNull();
      expect(normalizeCycle('desarrollo de aplicaciones web')).toBeNull();
    });
  });

  describe('normalizeYear', () => {
    it('acepta 1/2 con o sin º y normaliza a 1º/2º', () => {
      expect(normalizeYear('1')).toBe('1º');
      expect(normalizeYear('1º')).toBe('1º');
      expect(normalizeYear(' 2 ')).toBe('2º');
      expect(normalizeYear('2º')).toBe('2º');
    });

    it('rechaza cualquier otro valor', () => {
      expect(normalizeYear('')).toBeNull();
      expect(normalizeYear('3')).toBeNull();
      expect(normalizeYear('1st')).toBeNull();
      expect(normalizeYear('primero')).toBeNull();
    });
  });

  describe('parseSubjectSelection (multi-select por números sobre la lista activa)', () => {
    it('acepta números simples y listas separadas por comas (índices 0-based)', () => {
      expect(parseSubjectSelection('1', 5)).toEqual([0]);
      expect(parseSubjectSelection('1,3,4', 5)).toEqual([0, 2, 3]);
    });

    it('tolera espacios, ceros a la izquierda y comas dobles; devuelve orden de lista', () => {
      expect(parseSubjectSelection(' 3 , 01 ', 5)).toEqual([0, 2]);
      expect(parseSubjectSelection(' 1 , 3 ', 5)).toEqual([0, 2]);
      expect(parseSubjectSelection('1,,3', 5)).toEqual([0, 2]);
    });

    it('deduplica conservando el orden de la lista', () => {
      expect(parseSubjectSelection('3,3,3', 5)).toEqual([2]);
      expect(parseSubjectSelection('4,1', 5)).toEqual([0, 3]);
    });

    it('valida contra la longitud de la lista activa', () => {
      // Con 4 opciones (2º DAW), la 5 no existe.
      expect(parseSubjectSelection('5', 4)).toBeNull();
      // Con 5 opciones (1º), la 4 sí existe pero la 6 no.
      expect(parseSubjectSelection('5', 5)).toEqual([4]);
      expect(parseSubjectSelection('6', 5)).toBeNull();
    });

    it('rechaza números fuera de rango, tokens no numéricos y vacío', () => {
      expect(parseSubjectSelection('0', 5)).toBeNull();
      expect(parseSubjectSelection('14', 5)).toBeNull();
      expect(parseSubjectSelection('1,x', 5)).toBeNull();
      expect(parseSubjectSelection('', 5)).toBeNull();
      expect(parseSubjectSelection('   ', 5)).toBeNull();
    });
  });

  describe('normalizeHours', () => {
    it('recorta espacios y añade la h a los números enteros', () => {
      expect(normalizeHours('4')).toBe('4h');
      expect(normalizeHours(' 4 ')).toBe('4h');
      expect(normalizeHours('12')).toBe('12h');
    });

    it('rechaza lo que no sea un número puro', () => {
      expect(normalizeHours('4h')).toBeNull();
      expect(normalizeHours('Intensivo')).toBeNull();
      expect(normalizeHours('6 horas')).toBeNull();
      expect(normalizeHours('4.5')).toBeNull();
      expect(normalizeHours('-4')).toBeNull();
    });

    it('rechaza vacío', () => {
      expect(normalizeHours('')).toBeNull();
      expect(normalizeHours('   ')).toBeNull();
    });
  });
});

/**
 * Máquina de estados del terminal: la clase solo llama a TranslateService.instant
 * para componer el lead y los ecos de asignaturas (las líneas del log
 * referencian claves i18n y las traduce el componente con el pipe).
 * Traducciones mínimas para verificar el cableado real de ngx-translate
 * (patrón web-migration-wizard.service.spec).
 */
const mockTranslations = {
  'TUTORING.TERMINAL.MESSAGE.WITH_PROJECT':
    'PROYECTO_MSG {{cycle}} {{year}} {{subjects}} {{hours}}',
  'TUTORING.TERMINAL.MESSAGE.DISCLAIMER': 'DISCLAIMER_TEXT',
  'TUTORING.TERMINAL.QUESTIONS.CONFIRM': '¿CONTACTAR? (Y/N)',
  'TUTORING.TERMINAL.ERRORS.CONFIRM': 'ERR_CONFIRM',
  'TUTORING.TERMINAL.ERRORS.HOURS': 'ERR_HOURS',
  'TUTORING.TERMINAL.SUMMARY.DISPATCH': 'DISPATCH_LINE',
  'TUTORING.TERMINAL.SUBJECTS.FCT': 'SUBJ1',
  'TUTORING.TERMINAL.SUBJECTS.PROGRAMMING': 'SUBJ2',
  'TUTORING.TERMINAL.SUBJECTS.DATABASES': 'SUBJ3',
  'TUTORING.TERMINAL.SUBJECTS.WEB_SERVER': 'SUBJ6',
  'TUTORING.TERMINAL.SUBJECTS.INTERFACES': 'SUBJ8'
};

describe('TutoringTerminalService (máquina de estados)', () => {
  function service(): TutoringTerminalService {
    return TestBed.inject(TutoringTerminalService);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: { getTranslation: () => of(mockTranslations) } }
        })
      ]
    }).compileComponents();
    await TestBed.inject(TranslateService).use('es-ES');
  });

  it('el comando clear reinicia el terminal en cualquier paso (case-insensitive)', () => {
    const terminal = service();
    terminal.submit('daw');
    terminal.submit('2');
    terminal.submit('CLEAR ');
    expect(terminal.step()).toBe('CYCLE');
    expect(terminal.lines()[0].kind).toBe('banner');
    // Log inicial completo (9 líneas), sin rastro del flujo anterior.
    expect(terminal.lines().length).toBe(9);
    expect(terminal.answers().cycle).toBe('');
  });

  it('clear también funciona en CONFIRM y en SENT', () => {
    const terminal = service();
    terminal.submit('daw');
    terminal.submit('2');
    terminal.submit('1');
    terminal.submit('4');
    terminal.submit('y');
    expect(terminal.step()).toBe('SENT');
    terminal.submit('clear');
    expect(terminal.step()).toBe('CYCLE');
    expect(terminal.consumePendingLead()).toBeNull();
  });

  it('las preguntas ya no llevan el hint de clear (es chrome fijo del componente)', () => {
    const terminal = service();
    const questions = terminal.lines().filter((l) => l.kind === 'question');
    expect(questions.length).toBeGreaterThan(0);
    for (const q of questions) {
      expect(q.parts.some((p) => p.text === 'clear')).toBeFalse();
      expect(q.parts.some((p) => p.key?.includes('CLEAR_HINT'))).toBeFalse();
    }
  });

  it('arranca en CYCLE con el log inicial (banner, boot y pregunta de ciclo)', () => {
    const terminal = service();
    expect(terminal.step()).toBe('CYCLE');
    expect(terminal.lines()[0].kind).toBe('banner');
    expect(terminal.lines().some((l) => l.kind === 'boot')).toBeTrue();
    expect(terminal.lines().some((l) => l.kind === 'question')).toBeTrue();
    expect(terminal.answers().cycle).toBe('');
  });

  it('ignora Enter vacío en cualquier paso: ni línea nueva ni cambio de paso', () => {
    const terminal = service();
    const before = terminal.lines().length;
    terminal.submit('');
    terminal.submit('   ');
    expect(terminal.step()).toBe('CYCLE');
    expect(terminal.lines().length).toBe(before);
  });

  it('flujo feliz 2º DAW: 4 opciones con FCT primera y lead de proyecto', () => {
    const terminal = service();
    terminal.submit('daw');
    expect(terminal.step()).toBe('YEAR');
    expect(terminal.answers().cycle).toBe('DAW');
    expect(terminal.lines().some((l) => l.kind === 'echo')).toBeTrue();

    terminal.submit('2');
    expect(terminal.step()).toBe('SUBJECTS');
    const optionLines = terminal.lines().filter((l) => l.kind === 'options');
    expect(optionLines.length).toBe(4);
    // FCT va primera y destacada (tono accent).
    expect(optionLines[0].parts[1]?.tone).toBe('accent');
    expect(optionLines[0].parts[1]?.key).toContain('FCT');

    terminal.submit('1,3');
    expect(terminal.step()).toBe('HOURS');
    expect(terminal.answers().subjects).toEqual(['FCT', 'WEB_SERVER']);

    terminal.submit('4');
    expect(terminal.answers().hours).toBe('4h');
    expect(terminal.step()).toBe('CONFIRM');
    // Sin bloque de payload visible (como n8n): el mensaje viaja oculto en el
    // lead; en el log quedan los mensajes de build y la pregunta de envío.
    expect(
      terminal.lines().some((l) =>
        l.parts.some(
          (p) => p.key === 'TUTORING.TERMINAL.SUMMARY.READY' || p.text?.includes('PROYECTO_MSG')
        )
      )
    ).toBeFalse();
    const last = terminal.lines()[terminal.lines().length - 1];
    expect(last.kind).toBe('question');
    expect(last.parts.some((p) => p.key === 'TUTORING.TERMINAL.QUESTIONS.CONFIRM')).toBeTrue();
    expect(terminal.lines().some((l) => l.kind === 'system' && l.parts.some((p) => p.key === 'TUTORING.TERMINAL.SUMMARY.SOCKET_OK'))).toBeTrue();
  });

  it('1º comparte troncal: 5 opciones sin destacada', () => {
    const terminal = service();
    terminal.submit('dam');
    terminal.submit('1');
    const optionLines = terminal.lines().filter((l) => l.kind === 'options');
    expect(optionLines.length).toBe(5);
    expect(optionLines.some((l) => l.parts.some((p) => p.tone === 'accent'))).toBeFalse();
  });

  it('2º DAM: 6 opciones y el eco muestra las etiquetas traducidas', () => {
    const terminal = service();
    terminal.submit('dam');
    terminal.submit('2');
    expect(terminal.lines().filter((l) => l.kind === 'options').length).toBe(6);

    terminal.submit('1,3');
    const echo = terminal.lines().filter((l) => l.kind === 'echo').at(-1);
    expect(echo?.parts.at(-1)?.text).toContain('SUBJ1 y SUBJ8');
    expect(terminal.answers().subjects).toEqual(['FCT', 'INTERFACES']);
  });

  it('entrada inválida: línea de error y la pregunta se repite (sin avanzar)', () => {
    const terminal = service();
    const before = terminal.lines().length;
    terminal.submit('dfk');
    expect(terminal.step()).toBe('CYCLE');
    const last = terminal.lines()[terminal.lines().length - 1];
    expect(last.kind).toBe('question');
    expect(
      terminal.lines().some((l) => l.kind === 'error' && l.parts.some((p) => p.key === 'TUTORING.TERMINAL.ERRORS.CYCLE'))
    ).toBeTrue();
    expect(terminal.lines().length).toBeGreaterThan(before);
  });

  it('multi-select inválido: error con el máximo de la lista activa y re-listado', () => {
    const terminal = service();
    terminal.submit('daw');
    terminal.submit('2'); // 2º DAW: lista de 4
    terminal.submit('9');
    expect(terminal.step()).toBe('SUBJECTS');
    const errorLine = terminal.lines().find((l) => l.kind === 'error');
    expect(
      errorLine?.parts.some((p) => p.key === 'TUTORING.TERMINAL.ERRORS.SUBJECTS' && p.params?.['max'] === 4)
    ).toBeTrue();
    expect(terminal.lines().filter((l) => l.kind === 'options').length).toBe(8); // 4 iniciales + 4 re-listadas
  });

  it('el paso final pregunta el envío (Y/N) y prepara el lead oculto al confirmar', () => {
    const terminal = service();
    expect(terminal.prepareLead()).toBeNull();

    terminal.submit('daw');
    terminal.submit('2');
    terminal.submit('1');
    terminal.submit('4');
    expect(terminal.step()).toBe('CONFIRM');

    // El lead oculto se prepara en el servicio (el componente solo navega).
    const lead = terminal.prepareLead();
    expect(lead).not.toBeNull();
    expect(lead!.message).toBe('PROYECTO_MSG DAW 2º SUBJ1 4h\n\nDISCLAIMER_TEXT');

    expect(terminal.consumePendingLead()).not.toBeNull();
    expect(terminal.consumePendingLead()).toBeNull();
  });

  it('Y (con sí/si/yes) imprime la línea de dispatch y pasa a SENT con lead oculto', () => {
    const terminal = service();
    terminal.submit('daw');
    terminal.submit('2');
    terminal.submit('1');
    terminal.submit('4');
    terminal.submit('sí');

    expect(terminal.step()).toBe('SENT');
    expect(
      terminal.lines().some((l) => l.kind === 'system' && l.parts.some((p) => p.key === 'TUTORING.TERMINAL.SUMMARY.DISPATCH'))
    ).toBeTrue();
    expect(terminal.consumePendingLead()).not.toBeNull();
  });

  it('N reinicia el terminal directamente', () => {
    const terminal = service();
    terminal.submit('daw');
    terminal.submit('2');
    terminal.submit('1');
    terminal.submit('4');
    terminal.submit('n');

    expect(terminal.step()).toBe('CYCLE');
    expect(terminal.lines()[0].kind).toBe('banner');
    expect(terminal.answers().cycle).toBe('');
    expect(terminal.consumePendingLead()).toBeNull();
  });

  it('respuesta no reconocida en CONFIRM: error (Y/N) y re-pregunta', () => {
    const terminal = service();
    terminal.submit('daw');
    terminal.submit('2');
    terminal.submit('1');
    terminal.submit('4');
    const before = terminal.lines().length;
    terminal.submit('quizá');

    expect(terminal.step()).toBe('CONFIRM');
    const last = terminal.lines()[terminal.lines().length - 1];
    expect(last.kind).toBe('question');
    expect(
      terminal.lines().some((l) => l.kind === 'error' && l.parts.some((p) => p.key === 'TUTORING.TERMINAL.ERRORS.CONFIRM'))
    ).toBeTrue();
    expect(terminal.lines().length).toBeGreaterThan(before);
  });

  it('Enter vacío en CONFIRM no hace nada', () => {
    const terminal = service();
    terminal.submit('daw');
    terminal.submit('2');
    terminal.submit('1');
    terminal.submit('4');
    const before = terminal.lines().length;
    terminal.submit('');
    expect(terminal.step()).toBe('CONFIRM');
    expect(terminal.lines().length).toBe(before);
  });

  it('horas no numéricas: línea de error y re-pregunta (solo números)', () => {
    const terminal = service();
    terminal.submit('daw');
    terminal.submit('2');
    terminal.submit('1,3'); // FCT + WEB_SERVER en 2º DAW
    expect(terminal.step()).toBe('HOURS');
    const before = terminal.lines().length;
    terminal.submit('abc');
    expect(terminal.step()).toBe('HOURS');
    expect(terminal.answers().hours).toBe('');
    const error = terminal.lines()[terminal.lines().length - 2];
    expect(error.kind).toBe('error');
    expect(
      error.parts.some((p) => p.key === 'TUTORING.TERMINAL.ERRORS.HOURS')
    ).toBeTrue();
    const last = terminal.lines()[terminal.lines().length - 1];
    expect(last.kind).toBe('question');
    expect(
      last.parts.some((p) => p.key === 'TUTORING.TERMINAL.QUESTIONS.HOURS')
    ).toBeTrue();
    expect(terminal.lines().length).toBeGreaterThan(before);
  });

  it('siempre usa la plantilla WITH_PROJECT, haya FCT o no', () => {
    const terminal = service();
    terminal.submit('dam');
    terminal.submit('1');
    terminal.submit('1');
    terminal.submit('6');
    const lead = terminal.prepareLead();
    expect(lead!.message).toBe('PROYECTO_MSG DAM 1º SUBJ2 6h\n\nDISCLAIMER_TEXT');
  });

  it('restart: log inicial, paso CYCLE y lead pendiente a null', () => {
    const terminal = service();
    terminal.submit('daw');
    terminal.restart();
    expect(terminal.step()).toBe('CYCLE');
    expect(terminal.answers().cycle).toBe('');
    expect(terminal.lines()[0].kind).toBe('banner');
    expect(terminal.consumePendingLead()).toBeNull();
  });
});

/**
 * Motor de tecleo (typewriter, 2026-11-21): el log se revela progresivamente
 * con reloj simulado (jasmine.clock). `lines()` sigue siendo la fuente de
 * verdad; `displayLines()` es lo que pinta el componente.
 */
describe('Motor de tecleo (typewriter)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: { getTranslation: () => of(mockTranslations) } }
        })
      ]
    }).compileComponents();
    await TestBed.inject(TranslateService).use('es-ES');
    // El reloj se instala antes de que cada test cree el servicio (el ticker
    // del motor debe quedar registrado en el reloj simulado).
    jasmine.clock().install();
  });

  afterEach(() => jasmine.clock().uninstall());

  it('al arrancar solo el banner está visible y el motor está tecleando', () => {
    const terminal = TestBed.inject(TutoringTerminalService);
    const shown = terminal.displayLines();
    expect(shown.length).toBe(1);
    expect(shown[0].kind).toBe('banner');
    expect(terminal.isTyping()).toBeTrue();
  });

  it('las líneas instantáneas (input/echo) aparecen de golpe; el resto teclea', () => {
    const terminal = TestBed.inject(TutoringTerminalService);
    jasmine.clock().tick(6000);
    expect(terminal.isTyping()).toBeFalse();
    expect(terminal.displayLines().length).toBe(terminal.lines().length);

    terminal.submit('daw');
    // El input (eco del usuario, instantáneo) queda visible en su gap; la
    // pregunta del paso YEAR llega justo detrás, tecleándose.
    const shown = terminal.displayLines();
    expect(shown.at(-1)?.kind).toBe('input');
    expect(shown.at(-1)?.typing).toBeTrue();

    jasmine.clock().tick(1500);
    expect(terminal.displayLines().length).toBe(terminal.lines().length);
    expect(terminal.isTyping()).toBeFalse();
  });

  it('el cursor avanza con el tiempo: pregunta a medias entre dos ticks', () => {
    const terminal = TestBed.inject(TutoringTerminalService);
    jasmine.clock().tick(6000);
    terminal.submit('x'); // inválido: error + re-pregunta
    jasmine.clock().tick(1000); // el error teclea y termina
    expect(terminal.displayLines().length).toBe(terminal.lines().length);
  });

  it('flushTyping revela todo el log pendiente al instante', () => {
    const terminal = TestBed.inject(TutoringTerminalService);
    expect(terminal.displayLines().length).toBeLessThan(terminal.lines().length);
    terminal.flushTyping();
    expect(terminal.displayLines().length).toBe(terminal.lines().length);
    expect(terminal.isTyping()).toBeFalse();
  });

  it('submit mientras teclea hace flush primero y procesa la respuesta', () => {
    const terminal = TestBed.inject(TutoringTerminalService);
    terminal.submit('daw'); // flush del arranque + procesa
    expect(terminal.step()).toBe('YEAR');
    terminal.flushTyping();
    expect(terminal.displayLines().length).toBe(terminal.lines().length);
  });

  it('las opciones se revelan en ráfaga: más rápidas que una pregunta', () => {
    const terminal = TestBed.inject(TutoringTerminalService);
    terminal.submit('daw');
    terminal.flushTyping();
    terminal.submit('2'); // pregunta de asignaturas + 4 opciones (2º DAW)

    // Poco después: la pregunta ya está y las opciones NO todas.
    jasmine.clock().tick(400);
    const kinds = terminal.displayLines().map((d) => d.kind);
    expect(kinds.filter((k) => k === 'options').length).toBeLessThan(4);

    // Más tarde: toda la lista y el motor parado.
    jasmine.clock().tick(4000);
    const shown = terminal.displayLines();
    expect(shown.filter((d) => d.kind === 'options').length).toBe(4);
    expect(terminal.isTyping()).toBeFalse();
  });

  it('con prefers-reduced-motion no hay tecleo: todo visible de inmediato', () => {
    // Stub ANTES de crear el servicio: TestBed se reconfigura por completo.
    spyOn(window, 'matchMedia').and.callFake((query: string) =>
      ({
        matches: /reduce/.test(query),
        addEventListener: () => undefined,
        removeEventListener: () => undefined
      }) as unknown as MediaQueryList
    );
    const fresh = TestBed.inject(TutoringTerminalService);
    expect(fresh.displayLines().length).toBe(fresh.lines().length);
    expect(fresh.isTyping()).toBeFalse();
  });

  it('clear reinicia y vuelve a teclear la secuencia de arranque', () => {
    const terminal = TestBed.inject(TutoringTerminalService);
    jasmine.clock().tick(6000);
    terminal.submit('daw');
    terminal.submit('clear');
    expect(terminal.step()).toBe('CYCLE');
    // Reinicia tecleando: menos líneas visibles que las del log real.
    expect(terminal.displayLines().length).toBeLessThan(terminal.lines().length);
    expect(terminal.isTyping()).toBeTrue();
    jasmine.clock().tick(6000);
    expect(terminal.displayLines().length).toBe(terminal.lines().length);
    expect(terminal.isTyping()).toBeFalse();
  });
});
