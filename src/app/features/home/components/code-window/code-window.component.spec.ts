import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { HERO_CODE_LINES, HERO_LOG_MESSAGES } from './code-lines';
import { HERO_CLOCK, HERO_DISPLAY_ENV, HeroClock } from './code-runtime';
import { HeroCodeWindowComponent } from './code-window.component';

const mockLoader = { getTranslation: () => of({}) };

/** Reloj determinista: timers y frames manuales (sin zone.js no hay fakeAsync). */
class FakeClock implements HeroClock {
  time = 0;

  private _seq = 0;
  private readonly _timers = new Map<number, { at: number; fn: () => void }>();
  private readonly _frames = new Map<number, (time: number) => void>();

  get pendingTimers(): number {
    return this._timers.size;
  }

  get pendingFrames(): number {
    return this._frames.size;
  }

  now(): number {
    return this.time;
  }

  setTimeout(fn: () => void, ms: number): unknown {
    const id = ++this._seq;
    this._timers.set(id, { at: this.time + ms, fn });
    return id;
  }

  clearTimeout(handle: unknown): void {
    this._timers.delete(handle as number);
  }

  requestFrame(fn: (t: number) => void): unknown {
    const id = ++this._seq;
    this._frames.set(id, fn);
    return id;
  }

  cancelFrame(handle: unknown): void {
    this._frames.delete(handle as number);
  }

  /** Avanza el tiempo: un pase de frames, y timers vencidos en orden. */
  advance(ms: number): void {
    const end = this.time + ms;

    const runFrames = (): void => {
      if (!this._frames.size) {
        return;
      }
      const fns = [...this._frames.values()];
      this._frames.clear();
      for (const fn of fns) {
        fn(this.time);
      }
    };

    for (;;) {
      runFrames();

      const due = [...this._timers.entries()]
        .filter(([, timer]) => timer.at <= end)
        .sort((a, b) => a[1].at - b[1].at);

      if (!due.length) {
        break;
      }

      const [id, timer] = due[0];
      this._timers.delete(id);
      this.time = Math.max(this.time, timer.at);
      timer.fn();
    }

    this.time = end;
    runFrames();
  }
}

/** IO falso capturable: emite intersecciones bajo demanda del test. */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  disconnected = false;

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(): void {
    /* noop: los tests disparan el callback manualmente vía emit() */
  }
  unobserve(): void {
    /* noop */
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  disconnect(): void {
    this.disconnected = true;
  }

  emit(isIntersecting: boolean): void {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

async function setup(
  overrides?: {
    clock?: FakeClock;
    env?: Partial<{ reducedMotion: boolean; finePointer: boolean; hover: boolean }>;
  }
): Promise<{
  fixture: ComponentFixture<HeroCodeWindowComponent>;
  clock: FakeClock;
  io: FakeIntersectionObserver;
}> {
  await TestBed.configureTestingModule({
    imports: [
      HeroCodeWindowComponent,
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useValue: mockLoader }
      })
    ],
    providers: [
      provideZonelessChangeDetection(),
      ...(overrides?.clock
        ? [{ provide: HERO_CLOCK, useValue: overrides.clock }]
        : []),
      ...(overrides?.env
        ? [
            {
              provide: HERO_DISPLAY_ENV,
              useValue: {
                reducedMotion: false,
                finePointer: true,
                hover: true,
                ...overrides.env
              }
            }
          ]
        : [])
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(HeroCodeWindowComponent);
  fixture.detectChanges();

  const clock = overrides?.clock ?? new FakeClock();
  const io = FakeIntersectionObserver.instances.at(-1)!;
  return { fixture, clock, io };
}

let originalIntersectionObserver: unknown;

function installFakeIO(): void {
  originalIntersectionObserver = (window as Window & { IntersectionObserver: unknown })
    .IntersectionObserver;
  (window as Window & { IntersectionObserver: unknown }).IntersectionObserver =
    FakeIntersectionObserver;
  FakeIntersectionObserver.instances = [];
}

function restoreIO(): void {
  (window as Window & { IntersectionObserver: unknown }).IntersectionObserver =
    originalIntersectionObserver;
}

describe('HeroCodeWindowComponent — máquina de estados', () => {
  let fixture: ComponentFixture<HeroCodeWindowComponent>;
  let clock: FakeClock;
  let io: FakeIntersectionObserver;

  beforeEach(async () => {
    installFakeIO();
    clock = new FakeClock();
    const s = await setup({ clock });
    fixture = s.fixture;
    io = s.io;
  });

  afterEach(() => {
    fixture.destroy();
    restoreIO();
  });

  /** Avanza el reloj y vacía CD/effects (zoneless: el DOM no se toca solo). */
  function advanceAndDetect(ms: number): void {
    clock.advance(ms);
    fixture.detectChanges();
  }

  it('arranca en idle con el área de código vacía y el caret en la línea 1', () => {
    const root = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance;

    expect(component.state()).toBe('idle');
    expect(root.querySelectorAll('[class*="tok-"]').length).toBe(0);
    expect(root.querySelector('.hcw__caret')).toBeTruthy();
  });

  it('no empieza a escribir antes de los 400ms de arranque', () => {
    io.emit(true);

    advanceAndDetect(399);
    expect(fixture.componentInstance.state()).toBe('idle');

    advanceAndDetect(1);
    expect(fixture.componentInstance.state()).toBe('typing');
  });

  it('termina el typing dentro del presupuesto y pasa a compiling', () => {
    io.emit(true);
    advanceAndDetect(3200);
    const component = fixture.componentInstance;

    expect(component.state()).toBe('compiling');
    expect(component.revealedChars()).toBe(component.totalChars);
  });

  it('pasa a compiled en 700-900ms y muestra el tiempo de compilación (184-420ms)', () => {
    io.emit(true);
    advanceAndDetect(3200); // typing completo → compiling
    advanceAndDetect(650); // aún dentro del suelo de 700ms
    expect(fixture.componentInstance.state()).toBe('compiling');
    advanceAndDetect(1000); // el effect programa el fin del build (700-900ms)
    const component = fixture.componentInstance;

    expect(component.state()).toBe('compiled');

    const root = fixture.nativeElement as HTMLElement;
    const status = root.querySelector('.hcw__status-ok')?.textContent ?? '';
    const ms = Number(/in (\d+)ms/.exec(status)?.[1]);
    expect(ms).toBeGreaterThanOrEqual(184);
    expect(ms).toBeLessThanOrEqual(420);
  });

  it('el caret se apaga con fade al terminar el typing (200ms)', () => {
    // Duraciones deterministas: 20 líneas × 115ms = 2300ms de typing.
    spyOn(Math, 'random').and.returnValue(0.5);
    io.emit(true);

    advanceAndDetect(2900); // typing terminó en 400+2300=2800; caret aún vivo
    let root = fixture.nativeElement as HTMLElement;
    const caret = root.querySelector<HTMLElement>('.hcw__caret')!;
    expect(caret.classList.contains('is-dying')).toBeTrue();

    advanceAndDetect(300); // caret muere a los 2800+200=3000ms
    root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.hcw__caret')!.classList.contains('is-off')).toBeTrue();
  });

  it('el caret único se desplaza con transform siguiendo la línea activa', () => {
    io.emit(true);
    advanceAndDetect(600); // 400 arranque + 200ms de typing (línea 1-2)

    const transform = fixture.componentInstance.caretTransform();
    const y = Number(/translate\([\d.]+px, ([\d.]+)px\)/.exec(transform)?.[1]);
    expect(y).toBeGreaterThan(12); // por debajo de la línea 1 (padding ~12px)
  });

  it('el typing es one-shot: nunca vuelve a escribir tras compiled', () => {
    io.emit(true);
    advanceAndDetect(3200);
    advanceAndDetect(1000);
    const component = fixture.componentInstance;
    const revealedAfterCompile = component.revealedChars();

    io.emit(false);
    io.emit(true);
    advanceAndDetect(5000);

    expect(component.state()).toBe('compiled');
    expect(component.revealedChars()).toBe(revealedAfterCompile);
  });

  it('tras compiled el DOM contiene exactamente los tokens de HERO_CODE_LINES', () => {
    io.emit(true);
    advanceAndDetect(3200);
    advanceAndDetect(1000);

    const root = fixture.nativeElement as HTMLElement;
    const expected = HERO_CODE_LINES.reduce(
      (sum, line) => sum + line.tokens.length,
      0
    );
    const rendered = root.querySelectorAll('[class*="tok-"]').length;

    expect(rendered).toBe(expected);
  });

  it('la línea activa sigue al cursor mientras escribe', () => {
    io.emit(true);
    advanceAndDetect(600); // 400 de arranque + 200ms de typing

    const root = fixture.nativeElement as HTMLElement;
    const activeRows = root.querySelectorAll('.hcw__row.is-active');

    expect(activeRows.length).toBe(1);
    const num = Number(activeRows[0].querySelector('.hcw__num')?.textContent);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(2);
  });

  it('reserva su alto final desde el frame 0: el panel no crece con el typing (E1/CLS)', () => {
    const root = fixture.nativeElement as HTMLElement;
    const code = root.querySelector<HTMLElement>('.hcw__code')!;
    const panel = root.querySelector<HTMLElement>('.hcw')!;

    const codeHeightAtIdle = code.offsetHeight;
    const panelHeightAtIdle = panel.offsetHeight;

    io.emit(true);
    advanceAndDetect(3200);
    advanceAndDetect(1000); // compiled

    expect(code.offsetHeight).toBe(codeHeightAtIdle);
    expect(panel.offsetHeight).toBe(panelHeightAtIdle);
  });
});

describe('HeroCodeWindowComponent — reduced-motion, pausa y cleanup', () => {
  let clock: FakeClock;

  /** Doc.hidden falsificable: visibilitychange es lo que lee el componente. */
  function setHidden(hidden: boolean): void {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hidden
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }

  afterEach(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false
    });
  });

  it('con prefers-reduced-motion arranca idle con TODO el código y sin timers', async () => {
    installFakeIO();
    clock = new FakeClock();
    const s = await setup({ clock, env: { reducedMotion: true } });
    const fixture = s.fixture;
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.state()).toBe('idle');
    expect(component.fullRender()).toBeTrue();
    expect(clock.pendingTimers).toBe(0);
    expect(clock.pendingFrames).toBe(0);

    clock.advance(5000);
    fixture.detectChanges();

    expect(component.state()).toBe('idle');
    expect(component.revealedChars()).toBe(0);

    const root = fixture.nativeElement as HTMLElement;
    const expected = HERO_CODE_LINES.reduce(
      (sum, line) => sum + line.tokens.length,
      0
    );
    expect(root.querySelectorAll('[class*="tok-"]').length).toBe(expected);

    fixture.destroy();
    restoreIO();
  });

  it('con reduced-motion no se crea ni observer, ni ciclos, y el log queda fijo', async () => {
    installFakeIO();
    clock = new FakeClock();
    const s = await setup({ clock, env: { reducedMotion: true } });
    const fixture = s.fixture;
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Contrato fuerte: con reduced-motion el componente no llega a crear IO.
    expect(FakeIntersectionObserver.instances.length).toBe(0);
    expect(clock.pendingTimers).toBe(0);
    expect(clock.pendingFrames).toBe(0);

    clock.advance(10000);
    fixture.detectChanges();

    expect(component.state()).toBe('idle');

    const logText = (fixture.nativeElement as HTMLElement)
      .querySelector('.hcw__log-text')
      ?.textContent?.trim();
    expect(logText).toBe(HERO_LOG_MESSAGES[0]);

    fixture.destroy();
    restoreIO();
  });

  it('al destruir el componente no queda ningún timer, frame ni observer', async () => {
    installFakeIO();
    clock = new FakeClock();
    const s = await setup({ clock });
    const fixture = s.fixture;
    const io = s.io;
    fixture.detectChanges();

    io.emit(true);
    clock.advance(3200); // typing en marcha o acabado → timers programados

    fixture.destroy();

    expect(clock.pendingTimers).toBe(0);
    expect(clock.pendingFrames).toBe(0);
    expect(io.disconnected).toBeTrue();
    restoreIO();
  });

  it('el typing se congela fuera de viewport y se reanuda al volver', async () => {
    installFakeIO();
    clock = new FakeClock();
    const s = await setup({ clock });
    const fixture = s.fixture;
    const component = fixture.componentInstance;
    const io = s.io;
    fixture.detectChanges();

    io.emit(true);
    clock.advance(800); // 400 arranque + 400ms de typing
    fixture.detectChanges();
    const frozen = component.revealedChars();
    expect(frozen).toBeGreaterThan(0);

    io.emit(false);
    clock.advance(1500);
    fixture.detectChanges();
    expect(component.revealedChars()).toBe(frozen);

    io.emit(true);
    clock.advance(3200);
    fixture.detectChanges();
    expect(component.revealedChars()).toBe(component.totalChars);

    fixture.destroy();
    restoreIO();
  });

  it('el typing se congela con la pestaña oculta y se reanuda al volver', async () => {
    installFakeIO();
    clock = new FakeClock();
    const s = await setup({ clock });
    const fixture = s.fixture;
    const component = fixture.componentInstance;
    const io = s.io;
    fixture.detectChanges();

    io.emit(true);
    clock.advance(800);
    fixture.detectChanges();
    const frozen = component.revealedChars();

    setHidden(true);
    clock.advance(1500);
    fixture.detectChanges();
    expect(component.revealedChars()).toBe(frozen);

    setHidden(false);
    clock.advance(3200);
    fixture.detectChanges();
    expect(component.revealedChars()).toBe(component.totalChars);

    fixture.destroy();
    restoreIO();
  });
});

describe('HeroCodeWindowComponent — efectos E4/E5/E6/E7/E8/E9', () => {
  let fixture: ComponentFixture<HeroCodeWindowComponent>;
  let clock: FakeClock;
  let io: FakeIntersectionObserver;

  beforeEach(async () => {
    installFakeIO();
    clock = new FakeClock();
    const s = await setup({ clock });
    fixture = s.fixture;
    io = s.io;
  });

  afterEach(() => {
    fixture.destroy();
    restoreIO();
    // Higiene: el test de pestaña oculta redefine document.hidden; devolverlo.
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false
    });
  });

  function advanceAndDetect(ms: number): void {
    clock.advance(ms);
    fixture.detectChanges();
  }

  function compiled(): void {
    io.emit(true);
    advanceAndDetect(3200);
    advanceAndDetect(1000);
  }

  function rows(): NodeListOf<HTMLElement> {
    return (fixture.nativeElement as HTMLElement).querySelectorAll('.hcw__row');
  }

  function tooltip(): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector('.hcw__tooltip')!;
  }

  // — E5 · ciclo de compilación —

  it('muestra ⧗ Compiling… durante la compilación y el check verde al acabar', () => {
    io.emit(true);
    advanceAndDetect(3200); // compiling

    let root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.hcw__status-busy')?.textContent).toContain('⧗');
    expect(root.querySelector('.hcw__status-ok')).toBeNull();

    advanceAndDetect(1000); // compiled
    root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.hcw__status-ok')).toBeTruthy();
    expect(root.querySelector('.hcw__status-busy')).toBeNull();
  });

  // — E6 · log rotativo —

  it('rota el log: hold 4.5s + fade 180ms + fade 180ms y vuelta circular', () => {
    io.emit(true);
    advanceAndDetect(600);
    const textOf = () =>
      (fixture.nativeElement as HTMLElement)
        .querySelector('.hcw__log-text')
        ?.textContent?.trim();

    for (let i = 1; i <= 4; i++) {
      advanceAndDetect(4500 + 180 + 180);
      expect(textOf()).toBe(HERO_LOG_MESSAGES[i % HERO_LOG_MESSAGES.length]);
    }
  });

  it('pausa el log fuera de viewport y lo reanuda al volver', () => {
    io.emit(true);
    advanceAndDetect(600);
    const textOf = () =>
      (fixture.nativeElement as HTMLElement)
        .querySelector('.hcw__log-text')
        ?.textContent?.trim();

    io.emit(false);
    clock.advance(9000);
    fixture.detectChanges();
    expect(textOf()).toBe(HERO_LOG_MESSAGES[0]);

    io.emit(true);
    advanceAndDetect(4860);
    expect(textOf()).toBe(HERO_LOG_MESSAGES[1]);
  });

  it('pausa el log también en mitad del fade de salida (180ms) sin que siga ciclando', () => {
    io.emit(true);
    advanceAndDetect(600);
    const textOf = () =>
      (fixture.nativeElement as HTMLElement)
        .querySelector('.hcw__log-text')
        ?.textContent?.trim();

    // t absoluto 600+3950=4550 → dentro de la ventana de fade (4500-4680ms)
    clock.advance(3950);
    io.emit(false);
    clock.advance(9000);
    fixture.detectChanges();

    expect(textOf()).toBe(HERO_LOG_MESSAGES[0]);

    io.emit(true);
    advanceAndDetect(4860);
    expect(textOf()).toBe(HERO_LOG_MESSAGES[1]);
  });

  it('muestra el primer mensaje de log fijo desde el arranque', () => {
    io.emit(true);
    advanceAndDetect(600);

    const text = (fixture.nativeElement as HTMLElement)
      .querySelector('.hcw__log-text')
      ?.textContent?.trim();
    expect(text).toBe(HERO_LOG_MESSAGES[0]);
  });

  // — E7 · métricas vivas —

  it('jitter de MEM (38-46) y CPU (1-4) mientras está visible', () => {
    io.emit(true);
    advanceAndDetect(600);
    const component = fixture.componentInstance;
    const mem0 = component.memMb();
    const cpu0 = component.cpuPct();

    clock.advance(20000); // ~8 oportunidades de jitter
    fixture.detectChanges();

    const mem = component.memMb();
    const cpu = component.cpuPct();
    expect(mem).toBeGreaterThanOrEqual(38);
    expect(mem).toBeLessThanOrEqual(46);
    expect(cpu).toBeGreaterThanOrEqual(1);
    expect(cpu).toBeLessThanOrEqual(4);
    expect(mem !== mem0 || cpu !== cpu0).toBeTrue();
  });

  it('congela las métricas con la pestaña oculta', () => {
    io.emit(true);
    advanceAndDetect(600);
    const component = fixture.componentInstance;
    const mem0 = component.memMb();

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true
    });
    document.dispatchEvent(new Event('visibilitychange'));
    clock.advance(20000);
    fixture.detectChanges();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false
    });

    expect(component.memMb()).toBe(mem0);
  });

  // — E4 · hover de inspección —

  it('hover sobre una línea con hint muestra el tooltip tras 120ms (en compiled)', () => {
    compiled();

    rows()[3].dispatchEvent(new Event('pointerenter')); // línea 'stack'
    advanceAndDetect(0);
    expect(tooltip().classList.contains('is-visible')).toBeFalse(); // aún no

    advanceAndDetect(120);
    expect(tooltip().classList.contains('is-visible')).toBeTrue();
    expect(tooltip().textContent).toContain('HOME.CODE_HINT_STACK');
  });

  it('cierra el tooltip inmediatamente al salir', () => {
    compiled();

    rows()[3].dispatchEvent(new Event('pointerenter'));
    advanceAndDetect(120);
    expect(tooltip().classList.contains('is-visible')).toBeTrue();

    rows()[3].dispatchEvent(new Event('pointerleave'));
    advanceAndDetect(0);
    expect(tooltip().classList.contains('is-visible')).toBeFalse();
  });

  it('posiciona el tooltip en la coordenada visual de la fila (no en offsetTop del body)', () => {
    compiled();

    const root = fixture.nativeElement as HTMLElement;
    const host = root.querySelector<HTMLElement>('.hcw')!;
    const row = rows()[3];

    row.dispatchEvent(new Event('pointerenter'));
    advanceAndDetect(120);

    const expected =
      row.getBoundingClientRect().top - host.getBoundingClientRect().top;
    expect(fixture.componentInstance.tooltipTop()).toBeCloseTo(expected, 0);
  });

  it('no muestra tooltips durante el typing', () => {
    io.emit(true);
    advanceAndDetect(600); // typing

    rows()[3].dispatchEvent(new Event('pointerenter'));
    advanceAndDetect(500);
    expect(tooltip().classList.contains('is-visible')).toBeFalse();
  });

  it('las líneas sin hint no abren tooltip', () => {
    compiled();

    rows()[0].dispatchEvent(new Event('pointerenter')); // comentario sin hint
    advanceAndDetect(200);
    expect(tooltip().classList.contains('is-visible')).toBeFalse();
  });

  // — E8 · spotlight de puntero —

  it('spotlight: sigue el puntero con --mx/--my y se apaga al salir (puntero fino)', () => {
    const host = fixture.nativeElement as HTMLElement;

    host.dispatchEvent(new Event('pointerenter'));
    host.dispatchEvent(new PointerEvent('pointermove', { clientX: 120, clientY: 40 }));
    advanceAndDetect(0); // el frame throttle escribe las custom properties

    expect(host.classList.contains('is-spotlit')).toBeTrue();
    expect(host.style.getPropertyValue('--mx')).toContain('px');
    expect(host.style.getPropertyValue('--my')).toContain('px');

    host.dispatchEvent(new Event('pointerleave'));
    fixture.detectChanges();
    expect(host.classList.contains('is-spotlit')).toBeFalse();
  });

  // — E9 · scroll interno con fade —

  it('los fades de scroll aparecen según scrollTop y scrollHeight', () => {
    const code = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.hcw__code')!;
    // Alto determinista ANTES de compilar: no depende del dvh del runner
    // (headless 800×600 vs headed maximizado darían overflow distintos).
    code.style.maxHeight = '80px';

    compiled();
    fixture.detectChanges();

    const fadeTop = (fixture.nativeElement as HTMLElement).querySelector('.hcw__fade--top')!;
    const fadeBottom = (fixture.nativeElement as HTMLElement).querySelector('.hcw__fade--bottom')!;

    expect(fadeTop.classList.contains('is-on')).toBeFalse();
    expect(fadeBottom.classList.contains('is-on')).toBeTrue();

    code.scrollTop = 9999;
    code.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(fadeTop.classList.contains('is-on')).toBeTrue();
    expect(fadeBottom.classList.contains('is-on')).toBeFalse();
  });
});

describe('HeroCodeWindowComponent — a11y y estructura', () => {
  let fixture: ComponentFixture<HeroCodeWindowComponent>;

  beforeEach(async () => {
    fixture = (await setup()).fixture;
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should expose the window as an image with a translated accessible name', () => {
    const root = fixture.nativeElement as HTMLElement;
    const panel = root.querySelector<HTMLElement>('.hcw');

    expect(panel?.getAttribute('role')).toBe('img');
    expect(panel?.getAttribute('aria-label')).toContain('HOME.CODE_WINDOW_ARIA');
  });

  it('should mark every decorative part as aria-hidden', () => {
    const root = fixture.nativeElement as HTMLElement;
    const parts = root.querySelectorAll(
      '.hcw__chrome, .hcw__body, .hcw__status, .hcw__log, .hcw__tooltip, .hcw__fade--top, .hcw__fade--bottom'
    );
    const decorative = root.querySelectorAll('[aria-hidden="true"]');

    expect(parts.length).toBe(7);
    expect(decorative.length).toBe(parts.length);
  });

  it('should render no focusable elements inside the decorative panel', () => {
    const root = fixture.nativeElement as HTMLElement;
    const focusables = root.querySelectorAll('a, button, input, select, textarea, [tabindex]');

    expect(focusables.length).toBe(0);
  });

  it('should render one gutter number per code line, in order', () => {
    const root = fixture.nativeElement as HTMLElement;
    const numbers = Array.from(root.querySelectorAll<HTMLElement>('.hcw__num'));

    expect(numbers.length).toBe(20);
    expect(numbers.map((n) => n.textContent?.trim())).toEqual(
      Array.from({ length: 20 }, (_, i) => String(i + 1))
    );
  });
});

describe('HeroCodeWindowComponent — E4 táctil (hover: none)', () => {
  let fixture: ComponentFixture<HeroCodeWindowComponent>;
  let clock: FakeClock;
  let io: FakeIntersectionObserver;

  beforeEach(async () => {
    installFakeIO();
    clock = new FakeClock();
    const s = await setup({ clock, env: { hover: false } });
    fixture = s.fixture;
    io = s.io;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    restoreIO();
  });

  it('el tap muestra el hint de negocio y se cierra a los 2s', () => {
    io.emit(true);
    clock.advance(3200); // typing completo
    fixture.detectChanges(); // flush del effect → programa el compile
    clock.advance(1000); // compile termina
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const row = root.querySelectorAll<HTMLElement>('.hcw__row')[3];
    const tooltip = root.querySelector<HTMLElement>('.hcw__tooltip')!;

    row.dispatchEvent(new Event('pointerdown'));
    fixture.detectChanges();
    expect(tooltip.classList.contains('is-visible')).toBeTrue();

    clock.advance(2000);
    fixture.detectChanges();
    expect(tooltip.classList.contains('is-visible')).toBeFalse();
  });
});

describe('HeroCodeWindowComponent — E8 spotlight sin puntero fino', () => {
  let fixture: ComponentFixture<HeroCodeWindowComponent>;
  let clock: FakeClock;

  beforeEach(async () => {
    installFakeIO();
    clock = new FakeClock();
    const s = await setup({ clock, env: { finePointer: false } });
    fixture = s.fixture;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    restoreIO();
  });

  it('no reacciona al puntero', () => {
    const host = fixture.nativeElement as HTMLElement;

    host.dispatchEvent(new Event('pointerenter'));
    host.dispatchEvent(new PointerEvent('pointermove', { clientX: 10, clientY: 10 }));
    clock.advance(0);
    fixture.detectChanges();

    expect(host.classList.contains('is-spotlit')).toBeFalse();
    expect(host.style.getPropertyValue('--mx')).toBe('');
  });
});
