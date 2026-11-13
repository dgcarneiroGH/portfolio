import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Abstracción de reloj del panel de código. Toda programación de timers y
 * frames del componente pasa por aquí: permite cancelar todo en `destroy`
 * (sin fugas) y hacer los tests deterministas con un fake en lugar de
 * `fakeAsync` (este proyecto es zoneless, sin zone.js).
 */
export interface HeroClock {
  now(): number;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
  requestFrame(fn: (time: number) => void): unknown;
  cancelFrame(handle: unknown): void;
}

/** Implementación real del navegador. */
export const BROWSER_HERO_CLOCK: HeroClock = {
  now: () => performance.now(),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  requestFrame: (fn) => requestAnimationFrame(fn),
  cancelFrame: (handle) => cancelAnimationFrame(handle as number)
};

export const HERO_CLOCK = new InjectionToken<HeroClock>('HERO_CLOCK', {
  providedIn: 'root',
  factory: () => BROWSER_HERO_CLOCK
});

/**
 * Capacidades del entorno detectadas una vez por montaje (equivalente
 * protegido de `matchMedia`): reduced motion, puntero fino y capacidad de
 * hover. Los tests sobreescriben el token en lugar de tocar `window`.
 */
export interface HeroDisplayEnv {
  readonly reducedMotion: boolean;
  readonly finePointer: boolean;
  readonly hover: boolean;
}

function matches(query: string): boolean {
  return typeof matchMedia === 'function' && matchMedia(query).matches;
}

export const HERO_DISPLAY_ENV = new InjectionToken<HeroDisplayEnv>(
  'HERO_DISPLAY_ENV',
  {
    providedIn: 'root',
    factory: (): HeroDisplayEnv => {
      if (!isPlatformBrowser(inject(PLATFORM_ID))) {
        // Sin navegador: el fallback estático (R6) es reduced-motion.
        return { reducedMotion: true, finePointer: false, hover: false };
      }

      return {
        reducedMotion: matches('(prefers-reduced-motion: reduce)'),
        finePointer: matches('(pointer: fine)'),
        hover: matches('(hover: hover)')
      };
    }
  }
);
