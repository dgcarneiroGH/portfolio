import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal
} from '@angular/core';
import { NavigationEnd, NavigationSkipped, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent } from 'rxjs';
import { AboutComponent } from '../../../about/components/about.component';
import { ContactComponent } from '../../../contact/components/contact.component';
import { HomeComponent } from '../../../home/components/home.component';
import { ReviewsComponent } from '../../../reviews/components/reviews.component';
import { SuccessCasesComponent } from '../../../success-cases/components/success-cases/success-cases.component';
import { SectionId, SECTIONS, isSectionId } from '../../constants/sections.constants';
import { SectionsNavService } from '../../../../core/services/sections-nav.service';

/**
 * Página única (one-pager) del portfolio: apila las 5 secciones en orden
 * (home → about → success-cases → reviews → contact) para poder recorrerlas
 * scrolleando. El scroll-spy (SectionsNavService) sincroniza la URL con la
 * sección visible y el navbar refleja la sección activa vía routerLinkActive.
 *
 * Scroll a sección:
 * - Deep link / primera activación → instantáneo (el usuario pidió ese punto).
 * - Navegación de usuario (navbar, CTA) → suave.
 * - Back/forward del navegador → instantáneo.
 * - Navegación originada por el spy → sin scroll (solo URL).
 */
@Component({
  selector: 'app-sections-page',
  standalone: true,
  imports: [
    HomeComponent,
    AboutComponent,
    SuccessCasesComponent,
    ReviewsComponent,
    ContactComponent
  ],
  templateUrl: './sections-page.component.html',
  styleUrl: './sections-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionsPageComponent {
  private readonly _nav = inject(SectionsNavService);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  /** La activación inicial (scroll desde la URL) ya se gestionó. */
  private readonly _initialized = signal(false);

  /** popstate pendiente: la próxima navegación es back/forward del navegador. */
  private _popstatePending = false;

  /** Secciones que intersectan la banda de detección (35%–45% del viewport). */
  private readonly _visibleSections = new Map<SectionId, boolean>();

  private readonly _observer = new IntersectionObserver(
    (entries) => this._onIntersection(entries),
    { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
  );

  constructor() {
    afterNextRender(() => {
      // Deep link / primera activación: scroll instantáneo ANTES de observar
      // la sección. Las entregas del IntersectionObserver son asíncronas
      // (pasos de rendering), así que su callback inicial llega siempre con
      // el scroll ya aplicado y la señal ya sincronizada con la URL: el deep
      // link no puede ser sobrescrito por el spy.
      const initial = this._nav.sectionFromUrl(this._router.url);
      if (initial) {
        this._nav.setActiveFromUrl(this._router.url);
        this._nav.scrollTo(initial, 'auto');
      }

      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          this._observer.observe(element);
        }
      }

      this._initialized.set(true);
    });

    // NavigationEnd + NavigationSkipped (clic en el enlace de la sección
    // actual): deciden si hay scroll a sección.
    this._router.events
      .pipe(
        filter(
          (event): event is NavigationEnd | NavigationSkipped =>
            event instanceof NavigationEnd || event instanceof NavigationSkipped
        ),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((event) => this._onNavigationSettled(event));

    // Back/forward del navegador: popstate se dispara antes de que el router
    // complete la navegación, así el flag ya está listo en NavigationEnd.
    fromEvent(window, 'popstate')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._popstatePending = true;
      });

    this._destroyRef.onDestroy(() => this._observer.disconnect());
  }

  private _onNavigationSettled(event: NavigationEnd | NavigationSkipped): void {
    if (!this._initialized()) {
      return;
    }

    // URL asentada: urlAfterRedirects en NavigationEnd, url en NavigationSkipped.
    const settledUrl = 'urlAfterRedirects' in event ? event.urlAfterRedirects : event.url;

    if (this._nav.consumeSpyNavigation(settledUrl)) {
      return;
    }

    const section = this._nav.sectionFromUrl(this._router.url);
    if (!section) {
      return;
    }

    const behavior: ScrollBehavior = this._popstatePending ? 'auto' : 'smooth';
    this._popstatePending = false;

    this._nav.setActiveFromUrl(this._router.url);
    this._nav.scrollTo(section, behavior);
  }

  private _onIntersection(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      const id = entry.target.id;
      if (isSectionId(id)) {
        this._visibleSections.set(id, entry.isIntersecting);
      }
    }

    // Primera sección en orden DOM que intersecta la banda: con solape en el
    // límite mantiene la sección previa (histéresis, sin parpadeos de URL).
    for (const section of SECTIONS) {
      if (this._visibleSections.get(section.id)) {
        this._nav.updateActive(section.id);
        break;
      }
    }
  }
}
