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
import { TranslateModule } from '@ngx-translate/core';
import { ArrowNavigatorComponent } from './core/components/arrow-navigator/arrow-navigator.component';
import { LangSelectorComponent } from './core/components/lang-selector/lang-selector.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { NAV_MENU_ITEMS } from './core/constants/nav-menu.constants';
import { DynamicScriptService } from './core/services/dynamic-script.service';
import { FontService } from './core/services/font.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    RouterOutlet,
    CommonModule,
    ArrowNavigatorComponent,
    LangSelectorComponent,
    TranslateModule
  ],
  animations: []
})
export class AppComponent implements OnInit {
  loading = true;

  private _fontService = inject(FontService);
  private _router = inject(Router);
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
    if (!outlet.isActivated) return 0; // Evita problemas en la primera carga

    const currentId = this._currentSectionId ?? 0;
    const previousId = this._previousSectionId ?? 0;

    return currentId >= previousId ? currentId : currentId - 1;
  }

  public navigateToSection(offset: number): void {
    if (this._isNavigating) return;

    const nextSectionId = this._currentSectionId + offset;
    if (nextSectionId < 0 || nextSectionId >= NAV_MENU_ITEMS.length) return;

    this._previousSectionId = this._currentSectionId; // 🔥 Corregido: primero asignamos el anterior correctamente
    this._currentSectionId = nextSectionId;
    this._isNavigating = true;

    this._router
      .navigate([NAV_MENU_ITEMS[this._currentSectionId].link])
      .then(() => {
        setTimeout(() => (this._isNavigating = false), 1000);
      });
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
    this._currentSectionId = NAV_MENU_ITEMS.findIndex(
      (item) => item.link === url
    );
    this._previousSectionId = this._currentSectionId - 1;

    this._currentSectionId === 0
      ? (this.isNavigatingFirstSection = true)
      : (this.isNavigatingFirstSection = false);
    this._currentSectionId === NAV_MENU_ITEMS.length - 1
      ? (this.isNavigatingLastSection = true)
      : (this.isNavigatingLastSection = false);
  }
}
