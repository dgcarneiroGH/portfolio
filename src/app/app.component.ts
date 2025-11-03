import {
  animate,
  group,
  query,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LangSelectorComponent } from './core/components/lang-selector/lang-selector.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';

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
  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }
}
