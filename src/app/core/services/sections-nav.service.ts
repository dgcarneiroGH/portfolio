import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router
} from '@angular/router';
import {
  SectionId,
  SECTIONS,
  isSectionId
} from '../../features/sections/constants/sections.constants';

/**
 * Navegación del one-pager: sincroniza la URL del router con la sección
 * visible (scroll-spy) y hace scroll a la sección indicada por la URL.
 *
 * - El spy llama a `updateActive(id)` al cruzar umbrales: actualiza la señal
 *   y navega con `replaceUrl` (el navbar se ilumina vía routerLinkActive).
 * - La navegación del spy se identifica por MARCADOR DE URL (no contador):
 *   una navegación del spy superseded/cancelada emite NavigationCancel y
 *   nunca NavigationEnd, así que un contador quedaría fugado y el siguiente
 *   clic del navbar se comería el consumo (clic muerto). El marcador se
 *   limpia con el `finally` de la promesa de navegación.
 * - Mientras hay una navegación de usuario en curso, el spy no navega: el
 *   clic del usuario manda y el próximo cruce del spy re-sincroniza la URL.
 *
 * La transición de vista entre rutas one-pager se salta en main.ts
 * (withViewTransitions.onViewTransitionCreated), porque el DOM no cambia.
 */
@Injectable({ providedIn: 'root' })
export class SectionsNavService {
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  /** Sección activa según el spy (o sincronizada tras navegación de usuario). */
  private readonly _activeSection = signal<SectionId>('home');
  readonly activeSection = this._activeSection.asReadonly();

  /** URL objetivo de la navegación del spy pendiente (null = ninguna). */
  private _spyTargetUrl: string | null = null;

  /** id de la navegación de usuario en curso (null = ninguna). */
  private _userNavId: number | null = null;

  constructor() {
    // Clasificación de navegaciones: NavigationStart se emite de forma
    // síncrona dentro de navigateByUrl, por lo que el marcador del spy ya
    // está puesto cuando le toca. El id permite limpiar el flag en el evento
    // terminal aunque la navegación se cancele (autocuración).
    this._router.events
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          if (this._spyTargetUrl === null || event.url !== this._spyTargetUrl) {
            this._userNavId = event.id;
          }
          return;
        }

        const isTerminal =
          event instanceof NavigationEnd ||
          event instanceof NavigationSkipped ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError;
        if (isTerminal && this._userNavId === event.id) {
          this._userNavId = null;
        }
      });
  }

  /** Marca la sección como activa y sincroniza la URL (navegación del spy). */
  updateActive(id: SectionId): void {
    if (this._activeSection() === id) {
      return;
    }

    const section = SECTIONS.find((candidate) => candidate.id === id);
    if (!section) {
      return;
    }

    // No pisar una navegación de usuario en curso: el clic del usuario manda.
    if (this._userNavId !== null) {
      return;
    }

    this._activeSection.set(id);
    this._spyTargetUrl = section.url;
    const navigation = this._router.navigateByUrl(section.url, { replaceUrl: true });
    void Promise.resolve(navigation).finally(() => {
      // Limpia SOLO si el marcador sigue siendo el de ESTA navegación: una
      // navegación posterior del spy lo habrá sobrescrito.
      if (this._spyTargetUrl === section.url) {
        this._spyTargetUrl = null;
      }
    });
  }

  /**
   * `true` si la navegación recién terminada la originó el spy: la URL
   * asentada coincide con el marcador (que se consume). Con una navegación
   * del spy cancelada, su marcador se limpia sin llegar a consumirse.
   */
  consumeSpyNavigation(settledUrl: string): boolean {
    if (this._spyTargetUrl !== null && this._spyTargetUrl === settledUrl) {
      this._spyTargetUrl = null;
      return true;
    }

    return false;
  }

  /** Resuelve el id de sección desde una URL del router (null fuera del one-pager). */
  sectionFromUrl(url: string): SectionId | null {
    const path = url.split('?')[0] ?? '';
    const normalized = path === '' ? '/' : path;
    const match = SECTIONS.find((section) => section.url === normalized);
    return match ? match.id : null;
  }

  /** Sincroniza la señal de sección activa con una URL (navegación de usuario). */
  setActiveFromUrl(url: string): void {
    const id = this.sectionFromUrl(url);
    if (id) {
      this._activeSection.set(id);
    }
  }

  /**
   * Hace scroll a la sección y mueve el foco a ella (WCAG 2.4.3): tras
   * navegar con el teclado, el foco aterriza en el contenido nuevo.
   */
  scrollTo(id: SectionId, behavior: ScrollBehavior = 'smooth'): void {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior, block: 'start' });
    element.setAttribute('tabindex', '-1');
    element.focus({ preventScroll: true });
  }
}
