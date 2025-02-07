import { Component, inject, OnInit } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterEvent,
  RouterOutlet
} from '@angular/router';
import { DynamicScriptService } from './services/dynamic-script.service';
import { FontService } from './services/font.service';
import { NavigationMenuComponent } from './components/core/navigation-menu/navigation-menu.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SidebarComponent } from './components/core/sidebar/sidebar.component';
import { debounceTime, Subject } from 'rxjs';
import { NavMenuItems } from './constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    NavigationMenuComponent,
    RouterOutlet,
    SpinnerComponent
  ]
})
export class AppComponent implements OnInit {
  loading = true;

  // private dsService = inject(DynamicScriptService);
  private _fontService = inject(FontService);
  private _router = inject(Router);

  private _scrollSubject = new Subject<Event>();
  private _atTop = false;
  private _atBottom = false;
  private _currentSectionId = 0;
  private _isNavigating = false;

  ngOnInit(): void {
    this._router.events.subscribe((event) => {
      this.navigationInterceptor(event as RouterEvent);
    });

    this._scrollSubject.pipe(debounceTime(100)).subscribe((event) => {
      this._handleScroll(event);
    });

    this._fontService.loadFonts();
    // this.loadScripts();
  }

  onScroll(event: Event) {
    this._scrollSubject.next(event);
  }

  onWheel(event: WheelEvent): void {
    if (this._atBottom && event.deltaY > 0) this._navigateToSection(1);

    if (this._atTop && event.deltaY < 0) this._navigateToSection(-1);
  }

  private _handleScroll(event: Event) {
    const { scrollTop, scrollHeight, clientHeight } =
      event.target as HTMLElement;

    this._atBottom = scrollTop + clientHeight >= scrollHeight;
    this._atTop = scrollTop === 0;
  }

  private _navigateToSection(offset: number): void {
    if (this._isNavigating) return;

    const nextSectionId = this._currentSectionId + offset;

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

  // loadScripts = async (): Promise<void> => {
  //   try {
  //     await this.dsService.load('jquery');
  //     await this.dsService.load('skills');
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
      return;
    }

    if (
      event instanceof NavigationEnd ||
      event instanceof NavigationCancel ||
      event instanceof NavigationError
    ) {
      this._getCurrentSectionId(event.url);
      this._stopLoading();
    }
  }

  private _getCurrentSectionId(url: string): void {
    this._currentSectionId = NavMenuItems.findIndex(
      (item) => item.link === url
    );
  }

  private _stopLoading(): void {
    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }
}
