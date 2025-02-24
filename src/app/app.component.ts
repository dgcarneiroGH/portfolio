import {
  animate,
  group,
  query,
  style,
  transition,
  trigger
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  Router,
  RouterEvent,
  RouterOutlet
} from '@angular/router';
import { SidebarComponent } from './components/core/sidebar/sidebar.component';
import { ArrowNavigatorComponent } from './components/shared/arrow-navigator/arrow-navigator.component';
import { NavMenuItems } from './constants';
import { DynamicScriptService } from './services/dynamic-script.service';
import { FontService } from './services/font.service';
import { ScrollService } from './services/scroll.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    RouterOutlet,
    CommonModule,
    ArrowNavigatorComponent
  ],
  animations: [
    trigger('routeAnimations', [
      // Transición de siguiente sección (de abajo hacia arriba)
      transition(':increment', [
        query(
          ':enter, :leave',
          style({
            position: 'absolute',
            width: '100vw',
            left: '3vw',
            'overflow-x': 'hidden'
          }),
          { optional: true }
        ),
        group([
          query(
            ':leave',
            [
              animate(
                '600ms ease-in-out',
                style({ transform: 'translateY(-100%)', opacity: 0 })
              )
            ],
            { optional: true }
          ),
          query(
            ':enter',
            [
              style({ transform: 'translateY(100%)', opacity: 0 }),
              animate(
                '600ms ease-in-out',
                style({ transform: 'translateY(0)', opacity: 1 })
              )
            ],
            { optional: true }
          )
        ])
      ]),

      // Transición de sección anterior (de arriba hacia abajo)
      transition(':decrement', [
        query(
          ':enter, :leave',
          style({
            position: 'absolute',
            width: '100vw',
            left: '3vw',
            'overflow-x': 'hidden'
          }),
          { optional: true }
        ),
        group([
          query(
            ':leave',
            [
              animate(
                '600ms ease-in-out',
                style({ transform: 'translateY(100%)', opacity: 0 })
              )
            ],
            { optional: true }
          ),
          query(
            ':enter',
            [
              style({ transform: 'translateY(-100%)', opacity: 0 }),
              animate(
                '600ms ease-in-out',
                style({ transform: 'translateY(0)', opacity: 1 })
              )
            ],
            { optional: true }
          )
        ])
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  loading = true;

  private _fontService = inject(FontService);
  private _router = inject(Router);
  private _scrollService = inject(ScrollService);
  private _dsService = inject(DynamicScriptService);

  public isNavigatingFirstSection = false;
  public isNavigatingLastSection = false;

  private _previousSectionId!: number;
  private _currentSectionId!: number;

  private _isNavigating = false;

  ngOnInit(): void {
    this._router.events.subscribe((event) => {
      this.navigationInterceptor(event as RouterEvent);
    });

    // Obtener la sección actual desde la URL
    this._getCurrentSectionId(this._router.url);

    this._fontService.loadFonts();
    this.loadScripts();
  }

  getRouteAnimation(outlet: RouterOutlet) {
    const currentId = this._currentSectionId;
    const previousId = this._previousSectionId;

    return currentId > previousId ? currentId : currentId - 1; // Define si es forward o backward
  }

  public navigateToSection(offset: number): void {
    if (this._isNavigating) return;

    const nextSectionId = this._currentSectionId + offset;
    this._previousSectionId = this._currentSectionId - offset;

    if (
      (offset > 0 && nextSectionId > NavMenuItems.length - 1) ||
      (offset < 0 && nextSectionId < 0)
    )
      return;

    this._isNavigating = true;
    this._currentSectionId = nextSectionId;
    this._router.navigate([NavMenuItems[this._currentSectionId].link]);

    setTimeout(() => (this._isNavigating = false), 1000);
  }

  loadScripts = async (): Promise<void> => {
    try {
      await this._dsService.load('jquery');
      await this._dsService.load('skills');
    } catch (error) {
      console.error(error);
    }
  };

  navigationInterceptor(event: RouterEvent): void {
    if (
      event instanceof NavigationEnd ||
      event instanceof NavigationCancel ||
      event instanceof NavigationError
    ) {
      this._getCurrentSectionId(event.url);
    }
  }

  private _getCurrentSectionId(url: string): void {
    this._currentSectionId = NavMenuItems.findIndex(
      (item) => item.link === url
    );
    this._previousSectionId = this._currentSectionId - 1;

    this._currentSectionId === 0
      ? (this.isNavigatingFirstSection = true)
      : (this.isNavigatingFirstSection = false);
    this._currentSectionId === NavMenuItems.length - 1
      ? (this.isNavigatingLastSection = true)
      : (this.isNavigatingLastSection = false);
  }
}
