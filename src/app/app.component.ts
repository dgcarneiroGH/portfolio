import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, map, pairwise, startWith } from 'rxjs';
import { FooterComponent } from './core/components/footer/footer.component';
import { HeaderComponent } from './core/components/header/header.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { LangService } from './core/services/lang.service';
import { SectionsNavService } from './core/services/sections-nav.service';

/** Routes ordered by position (left → right). Index determines slide direction. */
const ROUTE_ORDER: Record<string, number> = { '/': 0, '/blog': 1 };

function routeIndex(url: string): number {
  if (url.startsWith('/blog')) return 1;
  return 0;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    RouterOutlet,    
    TranslateModule
  ],
})
export class AppComponent {
  private _langService = inject(LangService);
  private _router = inject(Router);
  private _sectionsNav = inject(SectionsNavService);

  isBlogRoute = toSignal(
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.includes('/blog'))
    ),
    { initialValue: this._router.url.includes('/blog') }
  );

  /** Página de la última navegación ('one-pager' | '/blog' | '/404'…); null = aún sin navegar. */
  private _lastPage: string | null = null;

  constructor() {
    // Scroll nativo del navegador desactivado: el one-pager controla el
    // scroll (deep links, back/forward, spy) y el restoration del router está
    // en 'disabled'. Única fuente de verdad para la posición de scroll.
    history.scrollRestoration = 'manual';

    // WCAG 3.1.1: Keep <html lang> in sync with the active locale
    effect(() => {
      document.documentElement.lang = this._langService.currentLanguage();
    });

    // Track nav direction for CSS View Transition slide animation
    this._router.events.pipe(
      filter((e): e is NavigationStart => e instanceof NavigationStart),
      startWith(null),
      pairwise()
    ).subscribe(([prev, curr]) => {
      if (!curr) return;
      const fromUrl = prev ? (prev as NavigationStart).url : this._router.url;
      const fromIdx = routeIndex(fromUrl);
      const toIdx = routeIndex(curr.url);
      const dir = toIdx > fromIdx ? 'forward' : toIdx < fromIdx ? 'backward' : null;
      if (dir) {
        document.documentElement.setAttribute('data-slide-dir', dir);
      } else {
        document.documentElement.removeAttribute('data-slide-dir');
      }
    });

    // WCAG 2.4.3: Move focus to <main> after SPA navigation so keyboard users
    // land on the new content rather than on a stale element.
    // Con el one-pager: el foco solo salta al CAMBIAR de página
    // (one-pager ↔ blog ↔ 404). Entre secciones no hay cambio de contenido y
    // el foco lo coloca scrollTo() del SectionsNavService; moverlo aquí
    // robaría el foco en cada cruce del scroll-spy.
    this._router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((e) => {
      const url = e.urlAfterRedirects;
      const isOnePager = this._sectionsNav.sectionFromUrl(url) !== null;

      // Destinos fuera del one-pager (blog, 404): el scroll de la página
      // anterior persistiría (restoration 'disabled') → volver arriba.
      if (!isOnePager) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }

      const page = isOnePager ? 'one-pager' : url.split('?')[0];
      if (page !== this._lastPage) {
        this._lastPage = page;
        const main = document.getElementById('main-content');
        if (!main) return;
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
      }
    });
  }

  scrollToContact(event: Event): void {
    event.preventDefault();
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      contactSection.setAttribute('tabindex', '-1');
      contactSection.focus({ preventScroll: true });
    }
  }
}
