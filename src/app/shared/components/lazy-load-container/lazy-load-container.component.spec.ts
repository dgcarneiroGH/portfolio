import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LazyLoadContainerComponent } from './lazy-load-container.component';

const mockLoader = { getTranslation: () => of({}) };

describe('LazyLoadContainerComponent', () => {
  let component: LazyLoadContainerComponent;
  let fixture: ComponentFixture<LazyLoadContainerComponent>;
  let observeSpy: jasmine.Spy;
  let disconnectSpy: jasmine.Spy;
  let intersectionCallback!: IntersectionObserverCallback;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalIntersectionObserver: any;

  beforeEach(async () => {
    // Save original so we can restore it after each test
    originalIntersectionObserver = window.IntersectionObserver;

    // Stub IntersectionObserver so Karma doesn't need the real browser API
    observeSpy = jasmine.createSpy('observe');
    disconnectSpy = jasmine.createSpy('disconnect');

    class MockIntersectionObserver {
      constructor(cb: IntersectionObserverCallback) {
        intersectionCallback = cb;
      }
      observe = observeSpy;
      disconnect = disconnectSpy;
      unobserve = jasmine.createSpy('unobserve');
    }
    (window as Window & { IntersectionObserver: unknown }).IntersectionObserver = MockIntersectionObserver;

    await TestBed.configureTestingModule({
      imports: [
        LazyLoadContainerComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LazyLoadContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    // Restore the original IntersectionObserver to avoid test pollution
    (window as Window & { IntersectionObserver: unknown }).IntersectionObserver = originalIntersectionObserver;
  });

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should start as NOT visible', () => {
      expect(component.isVisible()).toBeFalse();
    });
  });

  describe('IntersectionObserver integration', () => {
    it('should call observe on ngOnInit', () => {
      expect(observeSpy).toHaveBeenCalled();
    });

    it('should become visible when IntersectionObserver fires an intersecting entry', () => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      fixture.detectChanges();

      expect(component.isVisible()).toBeTrue();
    });

    it('should NOT become visible when entry is NOT intersecting', () => {
      intersectionCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      fixture.detectChanges();

      expect(component.isVisible()).toBeFalse();
    });

    it('should disconnect the observer once the element becomes visible', () => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should disconnect on ngOnDestroy', () => {
      component.ngOnDestroy();
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('#loadingImage (computed)', () => {
    it('should return the Spanish loading image by default', () => {
      expect(component.loadingImage()).toContain('loading_es.avif');
    });
  });
});
