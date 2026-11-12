import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter } from '@angular/router';
import { SECTIONS } from '../../constants/sections.constants';
import { SectionsNavService } from '../../../../core/services/sections-nav.service';
import { SectionsPageComponent } from './sections-page.component';

/**
 * Stubs de los 5 componentes de sección: el spec del sections-page valida
 * su propio esqueleto (envoltorios apilados con id), no el contenido de cada
 * sección, que tiene specs propias.
 */
@Component({ selector: 'app-home', template: '' })
class HomeStub {}

@Component({ selector: 'app-about', template: '' })
class AboutStub {}

@Component({ selector: 'app-success-cases', template: '' })
class SuccessCasesStub {}

@Component({ selector: 'app-reviews', template: '' })
class ReviewsStub {}

@Component({ selector: 'app-contact', template: '' })
class ContactStub {}

/**
 * IO falso controlable: registra los targets observados y permite disparar
 * callbacks de intersección desde los tests. Sustituye al stub global de
 * src/test.ts (no-op) durante estos specs.
 */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly observed: Element[] = [];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.push(target);
  }

  unobserve(): void {}

  disconnect(): void {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Dispara el callback con los targets observados marcados como visibles. */
  fire(visibleIds: Set<string>): void {
    const entries = this.observed.map(
      (target) =>
        ({ target, isIntersecting: visibleIds.has(target.id) }) as IntersectionObserverEntry
    );
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

@Component({ selector: 'dummy-page', template: '' })
class DummyPage {}

const TEST_ROUTES: Routes = [
  { path: '', component: DummyPage },
  { path: 'about-me', component: DummyPage },
  { path: 'success-cases', component: DummyPage },
  { path: 'reviews', component: DummyPage },
  { path: 'contact', component: DummyPage }
];

describe('SectionsPageComponent', () => {
  let fixture: ComponentFixture<SectionsPageComponent>;
  let router: Router;
  let originalIntersectionObserver: unknown;

  /** Última instancia del IO falso creada (la del fixture bajo test). */
  function spy(): FakeIntersectionObserver {
    const instance = FakeIntersectionObserver.instances.at(-1);
    expect(instance).withContext('el componente crea un IntersectionObserver').toBeTruthy();
    return instance!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionsPageComponent],
      providers: [provideZonelessChangeDetection(), provideRouter(TEST_ROUTES)]
    })
      .overrideComponent(SectionsPageComponent, {
        set: {
          imports: [HomeStub, AboutStub, SuccessCasesStub, ReviewsStub, ContactStub]
        }
      })
      .compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');

    originalIntersectionObserver = window.IntersectionObserver;
    (window as Window & { IntersectionObserver: unknown }).IntersectionObserver =
      FakeIntersectionObserver;
    FakeIntersectionObserver.instances = [];

    fixture = TestBed.createComponent(SectionsPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    (window as Window & { IntersectionObserver: unknown }).IntersectionObserver =
      originalIntersectionObserver;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the 5 sections stacked in order with their ids', () => {
    const el = fixture.nativeElement as HTMLElement;
    const wrappers = el.querySelectorAll('.sections-page__section');
    expect(wrappers.length).toBe(5);
    const ids = Array.from(wrappers).map((wrapper) => wrapper.id);
    expect(ids).toEqual(['home', 'about-me', 'success-cases', 'reviews', 'contact']);
  });

  it('renders each section component inside its own wrapper', () => {
    const el = fixture.nativeElement as HTMLElement;
    const wrappers = el.querySelectorAll('.sections-page__section');
    expect(wrappers[0].querySelector('app-home')).toBeTruthy();
    expect(wrappers[1].querySelector('app-about')).toBeTruthy();
    expect(wrappers[2].querySelector('app-success-cases')).toBeTruthy();
    expect(wrappers[3].querySelector('app-reviews')).toBeTruthy();
    expect(wrappers[4].querySelector('app-contact')).toBeTruthy();
  });

  describe('scroll-spy', () => {
    it('observa las 5 secciones del one-pager', () => {
      expect(spy().observed.length).toBe(SECTIONS.length);
      expect(spy().observed.map((el) => el.id)).toEqual([
        'home',
        'about-me',
        'success-cases',
        'reviews',
        'contact'
      ]);
    });

    it('actualiza la sección activa y sincroniza la URL con replaceUrl al cruzar el umbral', () => {
      spy().fire(new Set(['about-me']));

      expect(router.navigateByUrl).toHaveBeenCalledWith('/about-me', { replaceUrl: true });
    });

    it('elige la primera sección en orden DOM cuando dos se solapan en el umbral', () => {
      spy().fire(new Set(['home', 'about-me']));

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('navega a la última sección visible cuando la primera ya no intersecta', () => {
      spy().fire(new Set(['contact']));

      expect(router.navigateByUrl).toHaveBeenCalledWith('/contact', { replaceUrl: true });
    });

    it('desconecta el observer al destruirse el componente', () => {
      const instance = spy();
      const disconnectSpy = spyOn(instance, 'disconnect');

      fixture.destroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('navegación y scroll', () => {
    let navService: SectionsNavService;

    beforeEach(() => {
      navService = TestBed.inject(SectionsNavService);
      // Navegaciones reales (el spy global del beforeEach solo cuenta llamadas).
      (router.navigateByUrl as jasmine.Spy).and.callThrough();
    });

    it('navegación de usuario (navbar/CTA): scroll suave a la sección de la URL', async () => {
      const scrollToSpy = spyOn(navService, 'scrollTo').and.callThrough();

      await router.navigateByUrl('/contact');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(scrollToSpy).toHaveBeenCalledWith('contact', 'smooth');
    });

    it('navegación originada por el spy: solo URL, sin scroll', async () => {
      const scrollToSpy = spyOn(navService, 'scrollTo');

      spy().fire(new Set(['reviews']));
      await fixture.whenStable();
      fixture.detectChanges();

      expect(scrollToSpy).not.toHaveBeenCalled();
      expect(navService.activeSection()).toBe('reviews');
    });

    it('deep link: scroll instantáneo a la sección de la URL y sin navegación del spy', async () => {
      await router.navigateByUrl('/about-me');
      await fixture.whenStable();

      // Higiene: desacoplar el primer fixture del documento para que el
      // segundo no duplique los ids de sección en el DOM de test.
      fixture.elementRef.nativeElement.remove();

      const scrollToSpy = spyOn(navService, 'scrollTo').and.callThrough();
      const navCallsBefore = (router.navigateByUrl as jasmine.Spy).calls.count();

      const deepFixture = TestBed.createComponent(SectionsPageComponent);
      deepFixture.detectChanges();
      await deepFixture.whenStable();
      deepFixture.detectChanges();

      expect(scrollToSpy).toHaveBeenCalledWith('about-me', 'auto');
      expect((router.navigateByUrl as jasmine.Spy).calls.count()).toBe(navCallsBefore);

      deepFixture.destroy();
    });

    it('back/forward del navegador (popstate): scroll instantáneo a la sección', async () => {
      const scrollToSpy = spyOn(navService, 'scrollTo').and.callThrough();

      window.dispatchEvent(new PopStateEvent('popstate'));
      await router.navigateByUrl('/reviews');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(scrollToSpy).toHaveBeenCalledWith('reviews', 'auto');
    });
  });
});

