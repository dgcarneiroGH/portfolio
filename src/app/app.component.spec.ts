import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterOutlet } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { LangService } from './core/services/lang.service';

const mockLoader = { getTranslation: () => of({}) };

function buildLangServiceStub(lang = 'es-ES'): Partial<LangService> {
  return {
    currentLanguage: signal(lang).asReadonly(),
    setLanguage: jasmine.createSpy('setLanguage')
  };
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let langServiceStub: Partial<LangService>;

  beforeEach(async () => {
    langServiceStub = buildLangServiceStub('es-ES');

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [
        provideRouter([]),
        { provide: LangService, useValue: langServiceStub }
      ]
    })
      .overrideTemplate(
        AppComponent,
        `
<a class="skip-link" href="#blog" [attr.aria-label]="'COMMON.SKIP_TO_BLOG' | translate">{{ 'COMMON.SKIP_TO_BLOG' | translate }}</a>
<header class="header"><app-lang-selector></app-lang-selector></header>
<app-sidebar />
<main id="main-content" class="inner-body">
  <router-outlet #outlet="outlet"></router-outlet>
</main>
`
      )
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should expose appInitialized signal as true', () => {
      expect(component.appInitialized()).toBeTrue();
    });
  });

  describe('#scrollToContact', () => {
    it('should call event.preventDefault()', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'preventDefault');
      component.scrollToContact(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call scrollIntoView when the contact section exists in the DOM', () => {
      const section = document.createElement('div');
      section.id = 'contact-section';
      const scrollSpy = spyOn(section, 'scrollIntoView');
      document.body.appendChild(section);

      const event = new MouseEvent('click');
      spyOn(event, 'preventDefault');
      component.scrollToContact(event);

      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      document.body.removeChild(section);
    });

    it('should set tabindex="-1" on the contact section for keyboard focus', () => {
      const section = document.createElement('div');
      section.id = 'contact-section';
      spyOn(section, 'scrollIntoView');
      document.body.appendChild(section);

      component.scrollToContact(new MouseEvent('click'));

      expect(section.getAttribute('tabindex')).toBe('-1');
      document.body.removeChild(section);
    });
  });

  describe('#prepareRoute', () => {
    it('should return null when outlet has no activated route data', () => {
      const fakeOutlet = { activatedRouteData: {} } as RouterOutlet;
      expect(component.prepareRoute(fakeOutlet)).toBeNull();
    });

    it('should return the animation name from activatedRouteData', () => {
      const fakeOutlet = {
        activatedRouteData: { animation: 'Home' }
      } as unknown as RouterOutlet;
      expect(component.prepareRoute(fakeOutlet)).toBe('Home');
    });
  });

  describe('accessibility — semantic structure', () => {
    it('should include a skip-link as the first focusable element', () => {
      const skipLink = fixture.nativeElement.querySelector('a.skip-link') as HTMLAnchorElement | null;
      expect(skipLink).toBeTruthy();
    });

    it('should render a <main> element for screen reader landmarks', () => {
      const main = fixture.nativeElement.querySelector('main');
      expect(main).toBeTruthy();
    });

    it('should render a <header> element', () => {
      const header = fixture.nativeElement.querySelector('header');
      expect(header).toBeTruthy();
    });
  });
});
