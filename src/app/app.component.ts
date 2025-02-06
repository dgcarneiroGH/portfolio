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

  private dsService = inject(DynamicScriptService);
  private fontService = inject(FontService);
  private router = inject(Router);

  private scrollSubject = new Subject<Event>();
  private atBottom = false;
  private currentIndex = 0;
  private isNavigating = false;

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      this.navigationInterceptor(event as RouterEvent);
    });

    this.scrollSubject.pipe(debounceTime(100)).subscribe((event) => {
      this.handleScroll(event);
    });

    this.fontService.loadFonts();
    // this.loadScripts();
  }

  onScroll(event: Event) {
    this.scrollSubject.next(event);
  }

  onWheel(event: WheelEvent): void {
    if (this.atBottom && event.deltaY > 0) {
      this.navigateToNextSection();
    }
  }

  private handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    this.atBottom = scrollTop + clientHeight >= scrollHeight;
  }

  private navigateToNextSection() {
    if (this.isNavigating) return;
    this.isNavigating = true;

    if (this.currentIndex < NavMenuItems.length - 1) {
      this.currentIndex++;
      this.router.navigate([NavMenuItems[this.currentIndex].link]);
    }

    setTimeout(() => {
      this.isNavigating = false;
    }, 1000);
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
    }
    if (event instanceof NavigationEnd) {
      setTimeout(() => {
        this.loading = false;
      }, 2000);
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      setTimeout(() => {
        this.loading = false;
      }, 2000);
    }
    if (event instanceof NavigationError) {
      setTimeout(() => {
        this.loading = false;
      }, 2000);
    }
  }
}
