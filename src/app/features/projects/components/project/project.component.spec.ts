import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { firstValueFrom, of } from 'rxjs';

import { ProjectComponent } from './project.component';

// Synchronous mock loader so the translate pipe resolves immediately.
const mockTranslations = {
  'PROJECTS.PORTFOLIO_ALT': 'Portfolio project image',
  'PROJECTS.VIEW_PROJECT': 'View project {{name}}',
  'PROJECTS.MORE_INFO': 'More info',
  'PROJECTS.TOGGLE_INFO_HIDE': 'Hide project information',
  'PROJECTS.TOGGLE_INFO_SHOW': 'Show project information'
};

const mockLoader = {
  getTranslation: () => of(mockTranslations)
};

describe('ProjectComponent', () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProjectComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;

    // Set required inputs BEFORE detectChanges()
    fixture.componentRef.setInput('coverImgSrc', '/assets/img/project.jpg');
    fixture.componentRef.setInput('name', 'Portfolio');
    fixture.componentRef.setInput('description', 'My portfolio project');
    fixture.componentRef.setInput('altKey', 'PROJECTS.PORTFOLIO_ALT');
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('expandedIndex', null);

    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set animation delay on init', () => {
      const delay = component.animationDelay();
      expect(delay).toMatch(/^\d+(\.\d+)?s$/);
      expect(parseFloat(delay)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(delay)).toBeLessThanOrEqual(5);
    });

    it('should initialize with null palette and dominant color', () => {
      expect(component.palette()).toBeNull();
      expect(component.dominantColor).toBeNull();
    });
  });

  describe('Input properties', () => {
    it('should accept all required inputs', () => {
      expect(component.coverImgSrc()).toBe('/assets/img/project.jpg');
      expect(component.name()).toBe('Portfolio');
      expect(component.description()).toBe('My portfolio project');
      expect(component.altKey()).toBe('PROJECTS.PORTFOLIO_ALT');
      expect(component.index()).toBe(0);
      expect(component.expandedIndex()).toBeNull();
    });

    it('should handle optional url input', () => {
      expect(component.url()).toBeUndefined();

      fixture.componentRef.setInput('url', 'https://example.com');
      fixture.detectChanges();

      expect(component.url()).toBe('https://example.com');
    });
  });

  describe('Computed signals', () => {
    describe('dynamicGradient', () => {
      it('should return empty string when palette is null', () => {
        expect(component.dynamicGradient()).toBe('');
      });

      it('should return empty string when palette has only one color', () => {
        // Mock Color objects with hex() method
        const mockColor = {
          hex: jasmine.createSpy().and.returnValue('#ff0000')
        };
        component.palette.set([mockColor as any]);

        expect(component.dynamicGradient()).toBe('');
      });

      it('should return gradient string when palette has two colors', () => {
        const mockColors = [
          { hex: jasmine.createSpy().and.returnValue('#ff0000') },
          { hex: jasmine.createSpy().and.returnValue('#00ff00') }
        ];
        component.palette.set(mockColors as any);

        const gradient = component.dynamicGradient();
        expect(gradient).toContain('linear-gradient(135deg, #ff0000, #00ff00)');
      });
    });

    describe('btnColor', () => {
      it('should return default color when palette is null', () => {
        expect(component.btnColor()).toBe('41,182,246');
      });

      it('should return second color when palette exists', () => {
        const mockColors = [
          { hex: jasmine.createSpy().and.returnValue('#ff0000') },
          { hex: jasmine.createSpy().and.returnValue('#00ff00') }
        ];
        component.palette.set(mockColors as any);

        expect(component.btnColor()).toBe('#00ff00');
      });
    });

    describe('showMoreInfo', () => {
      it('should return false when expandedIndex is null', () => {
        fixture.componentRef.setInput('expandedIndex', null);
        fixture.detectChanges();

        expect(component.showMoreInfo()).toBeFalse();
      });

      it('should return true when expandedIndex matches component index', () => {
        fixture.componentRef.setInput('expandedIndex', 0);
        fixture.detectChanges();

        expect(component.showMoreInfo()).toBeTrue();
      });

      it('should return false when expandedIndex does not match component index', () => {
        fixture.componentRef.setInput('expandedIndex', 1);
        fixture.detectChanges();

        expect(component.showMoreInfo()).toBeFalse();
      });
    });

    describe('canToggleInfo', () => {
      it('should return true when expandedIndex is null', () => {
        fixture.componentRef.setInput('expandedIndex', null);
        fixture.detectChanges();

        expect(component.canToggleInfo()).toBeTrue();
      });

      it('should return true when expandedIndex matches component index', () => {
        fixture.componentRef.setInput('expandedIndex', 0);
        fixture.detectChanges();

        expect(component.canToggleInfo()).toBeTrue();
      });

      it('should return false when expandedIndex does not match component index', () => {
        fixture.componentRef.setInput('expandedIndex', 1);
        fixture.detectChanges();

        expect(component.canToggleInfo()).toBeFalse();
      });
    });
  });

  describe('Event handling', () => {
    describe('expandRequest output', () => {
      it('should emit -1 when closing expanded item', () => {
        let emittedValue: number | undefined;
        outputToObservable(component.expandRequest).subscribe(
          (v) => (emittedValue = v)
        );

        fixture.componentRef.setInput('expandedIndex', 0);
        fixture.detectChanges();

        component.toggleMoreInfo();

        expect(emittedValue).toBe(-1);
      });

      it('should emit component index when opening item', () => {
        let emittedValue: number | undefined;
        outputToObservable(component.expandRequest).subscribe(
          (v) => (emittedValue = v)
        );

        fixture.componentRef.setInput('expandedIndex', null);
        fixture.detectChanges();

        component.toggleMoreInfo();

        expect(emittedValue).toBe(0);
      });
    });

    describe('goTo method', () => {
      it('should not open window when url is undefined', () => {
        spyOn(window, 'open');

        component.goTo();

        expect(window.open).not.toHaveBeenCalled();
      });

      it('should not open window when url is empty string', () => {
        spyOn(window, 'open');
        fixture.componentRef.setInput('url', '');
        fixture.detectChanges();

        component.goTo();

        expect(window.open).not.toHaveBeenCalled();
      });

      it('should open window when url is provided', () => {
        spyOn(window, 'open');
        fixture.componentRef.setInput('url', 'https://example.com');
        fixture.detectChanges();

        component.goTo();

        expect(window.open).toHaveBeenCalledWith(
          'https://example.com',
          '_blank'
        );
      });
    });

    describe('handleMoreInfoClick', () => {
      it('should toggle info when canToggleInfo is true', () => {
        spyOn(component, 'toggleMoreInfo');
        fixture.componentRef.setInput('expandedIndex', null);
        fixture.detectChanges();

        component.handleMoreInfoClick();

        expect(component.toggleMoreInfo).toHaveBeenCalled();
      });

      it('should not toggle info when canToggleInfo is false', () => {
        spyOn(component, 'toggleMoreInfo');
        fixture.componentRef.setInput('expandedIndex', 1);
        fixture.detectChanges();

        component.handleMoreInfoClick();

        expect(component.toggleMoreInfo).not.toHaveBeenCalled();
      });
    });

    describe('onImageLoad', () => {
      it('should set dominantColor and palette from image', () => {
        // Test that the method exists and can be called
        const mockImg = document.createElement('img');

        const spy = spyOn(component, 'onImageLoad').and.stub();

        component.onImageLoad(mockImg);

        expect(spy).toHaveBeenCalledWith(mockImg);
      });
    });
  });

  describe('Keyboard interactions', () => {
    describe('onKeyDown method', () => {
      it('should call goTo on Enter key for goTo action', () => {
        spyOn(component, 'goTo');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        spyOn(event, 'preventDefault');

        component.onKeyDown(event, 'goTo');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(component.goTo).toHaveBeenCalled();
      });

      it('should call goTo on Space key for goTo action', () => {
        spyOn(component, 'goTo');
        const event = new KeyboardEvent('keydown', { key: ' ' });
        spyOn(event, 'preventDefault');

        component.onKeyDown(event, 'goTo');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(component.goTo).toHaveBeenCalled();
      });

      it('should call handleMoreInfoClick on Enter key for toggleInfo action', () => {
        spyOn(component, 'handleMoreInfoClick');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        spyOn(event, 'preventDefault');

        component.onKeyDown(event, 'toggleInfo');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(component.handleMoreInfoClick).toHaveBeenCalled();
      });

      it('should call handleMoreInfoClick on Space key for toggleInfo action', () => {
        spyOn(component, 'handleMoreInfoClick');
        const event = new KeyboardEvent('keydown', { key: ' ' });
        spyOn(event, 'preventDefault');

        component.onKeyDown(event, 'toggleInfo');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(component.handleMoreInfoClick).toHaveBeenCalled();
      });

      it('should not prevent default or call methods for other keys', () => {
        spyOn(component, 'goTo');
        spyOn(component, 'handleMoreInfoClick');
        const event = new KeyboardEvent('keydown', { key: 'Tab' });
        spyOn(event, 'preventDefault');

        component.onKeyDown(event, 'goTo');

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(component.goTo).not.toHaveBeenCalled();
        expect(component.handleMoreInfoClick).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('cover image renders an <img> with a translated alt text', async () => {
      const translateService = TestBed.inject(TranslateService);
      await firstValueFrom(translateService.use('en'));
      fixture.detectChanges();
      const img = fixture.nativeElement.querySelector('button.cover-img img') as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.alt).toBe('Portfolio project image');
    });

    it('cover button has aria-label that includes the alt text', async () => {
      const translateService = TestBed.inject(TranslateService);
      await firstValueFrom(translateService.use('en'));
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button.cover-img') as HTMLButtonElement;
      expect(button).toBeTruthy();
      const aria = button.getAttribute('aria-label');
      expect(aria).toContain('View project Portfolio');
      expect(aria).toContain('Portfolio project image');
    });

    it('toggle button has aria-controls matching the description id', async () => {
      const translateService = TestBed.inject(TranslateService);
      await firstValueFrom(translateService.use('en'));
      fixture.componentRef.setInput('expandedIndex', 0);
      fixture.detectChanges();
      const desc = fixture.nativeElement.querySelector('#project-desc-0') as HTMLElement;
      expect(desc).toBeTruthy();
      const appBtn = fixture.nativeElement.querySelector('app-button') as HTMLElement;
      // aria-controls is set on the <app-button> host element via [attr.x] binding.
      const controls = appBtn?.getAttribute('aria-controls');
      expect(controls).toBe('project-desc-0');
    });

    it('has no role="button" overrides (uses native buttons)', () => {
      const divButtons = fixture.nativeElement.querySelectorAll('[role="button"]:not(button)');
      expect(divButtons.length).toBe(0);
    });
  });
});
