import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, map, pairwise, startWith } from 'rxjs';
import { LangSelectorComponent } from './core/components/lang-selector/lang-selector.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { LangService } from './core/services/lang.service';

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
    SidebarComponent,
    RouterOutlet,
    RouterLink,
    LangSelectorComponent,
    TranslateModule
  ],
})
export class AppComponent {
  private _langService = inject(LangService);
  private _router = inject(Router);

  isBlogRoute = toSignal(
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.includes('/blog'))
    ),
    { initialValue: this._router.url.includes('/blog') }
  );

  constructor() {
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
