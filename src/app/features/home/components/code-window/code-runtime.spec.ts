import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BROWSER_HERO_CLOCK,
  HERO_CLOCK,
  HERO_DISPLAY_ENV,
  HeroDisplayEnv
} from './code-runtime';

describe('BROWSER_HERO_CLOCK', () => {
  let clock: jasmine.Clock;

  beforeEach(() => {
    clock = jasmine.clock().install();
  });

  afterEach(() => {
    clock.uninstall();
  });

  it('now() devuelve un timestamp numérico no negativo', () => {
    const now = BROWSER_HERO_CLOCK.now();

    expect(typeof now).toBe('number');
    expect(now).toBeGreaterThanOrEqual(0);
  });

  it('setTimeout programa y clearTimeout cancela (con reloj de jasmine)', () => {
    let fired = 0;
    BROWSER_HERO_CLOCK.setTimeout(() => fired++, 100);

    clock.tick(100);
    expect(fired).toBe(1);

    const second = BROWSER_HERO_CLOCK.setTimeout(() => fired++, 100);
    BROWSER_HERO_CLOCK.clearTimeout(second);
    clock.tick(100);
    expect(fired).toBe(1);
  });

  it('requestFrame/cancelFrame delegan en requestAnimationFrame/cancelAnimationFrame', () => {
    const frameSpy = spyOn(window, 'requestAnimationFrame').and.returnValue(42);
    const cancelSpy = spyOn(window, 'cancelAnimationFrame');
    const frame = () => {
      /* callback simulado: solo se verifica el delegado del navegador */
    };

    BROWSER_HERO_CLOCK.requestFrame(frame);
    BROWSER_HERO_CLOCK.cancelFrame(42);

    expect(frameSpy).toHaveBeenCalledWith(frame);
    expect(cancelSpy).toHaveBeenCalledWith(42);
  });
});

describe('HERO_CLOCK', () => {
  it('resuelve a la implementación del navegador por defecto', () => {
    expect(TestBed.inject(HERO_CLOCK)).toBe(BROWSER_HERO_CLOCK);
  });
});

describe('HERO_DISPLAY_ENV', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('en plataforma servidor usa el fallback estático (reduced-motion)', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
    });

    expect(TestBed.inject(HERO_DISPLAY_ENV)).toEqual({
      reducedMotion: true,
      finePointer: false,
      hover: false
    });
  });

  it('en navegador lee matchMedia para las tres capacidades', () => {
    const queries: string[] = [];
    const respond = new Map<string, boolean>([
      ['(prefers-reduced-motion: reduce)', true],
      ['(pointer: fine)', true],
      ['(hover: hover)', true]
    ]);
    spyOn(window, 'matchMedia').and.callFake((query: string) => {
      queries.push(query);
      return { matches: respond.get(query) ?? false } as MediaQueryList;
    });

    const env = TestBed.inject<HeroDisplayEnv>(HERO_DISPLAY_ENV);

    expect(env).toEqual({
      reducedMotion: true,
      finePointer: true,
      hover: true
    });
    expect(queries).toEqual([
      '(prefers-reduced-motion: reduce)',
      '(pointer: fine)',
      '(hover: hover)'
    ]);
  });

  it('sin matchMedia disponible, todas las capacidades son false salvo reduced-motion', () => {
    const original = window.matchMedia;
    (window as { matchMedia?: unknown }).matchMedia = undefined;

    try {
      const env = TestBed.inject<HeroDisplayEnv>(HERO_DISPLAY_ENV);

      expect(env).toEqual({
        reducedMotion: false,
        finePointer: false,
        hover: false
      });
    } finally {
      window.matchMedia = original;
    }
  });
});
