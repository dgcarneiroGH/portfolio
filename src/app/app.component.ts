import {
  animate,
  group,
  query,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LangSelectorComponent } from './core/components/lang-selector/lang-selector.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { LangService } from './core/services/lang.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    RouterOutlet,
    LangSelectorComponent,
    TranslateModule
  ],
  animations: [
    trigger('routeAnimations', [
      transition('Home => Blog', [
        style({ position: 'relative' }),
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%'
            })
          ],
          { optional: true }
        ),
        query(
          ':enter',
          [style({ transform: 'translateX(100%)', opacity: 0 })],
          { optional: true }
        ),
        group([
          query(
            ':leave',
            [
              animate(
                '300ms ease',
                style({ transform: 'translateX(-20%)', opacity: 0 })
              )
            ],
            { optional: true }
          ),
          query(
            ':enter',
            [
              animate(
                '300ms ease',
                style({ transform: 'translateX(0%)', opacity: 1 })
              )
            ],
            { optional: true }
          )
        ])
      ]),
      transition('Blog => Home', [
        style({ position: 'relative' }),
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%'
            })
          ],
          { optional: true }
        ),
        query(
          ':enter',
          [style({ transform: 'translateX(-100%)', opacity: 0 })],
          { optional: true }
        ),
        group([
          query(
            ':leave',
            [
              animate(
                '300ms ease',
                style({ transform: 'translateX(20%)', opacity: 0 })
              )
            ],
            { optional: true }
          ),
          query(
            ':enter',
            [
              animate(
                '300ms ease',
                style({ transform: 'translateX(0%)', opacity: 1 })
              )
            ],
            { optional: true }
          )
        ])
      ])
    ])
  ]
})
export class AppComponent {
  private _langService = inject(LangService);
  appInitialized = signal(true);

  constructor() {
    // WCAG 3.1.1: Keep <html lang> in sync with the active locale
    effect(() => {
      document.documentElement.lang = this._langService.currentLanguage();
    });
  }

  scrollToContact(event: Event): void {
    event.preventDefault();
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Move focus into the section for keyboard users
      contactSection.setAttribute('tabindex', '-1');
      contactSection.focus({ preventScroll: true });
    }
  }

  prepareRoute(outlet: RouterOutlet): string | null {
    return (
      (outlet &&
        outlet.activatedRouteData &&
        outlet.activatedRouteData['animation']) ||
      null
    );
  }
}
