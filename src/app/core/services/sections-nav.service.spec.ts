import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter } from '@angular/router';
import { SectionsNavService } from './sections-nav.service';

@Component({ selector: 'dummy-nav-page', template: '' })
class DummyNavPage {}

const NAV_ROUTES: Routes = [
  { path: '', component: DummyNavPage },
  { path: 'about-me', component: DummyNavPage },
  {
    path: 'contact',
    component: DummyNavPage,
    // Resolver lento: mantiene la navegación "en vuelo" durante el test
    // para reproducir la carrera spy ↔ navegación de usuario.
    resolve: { slow: () => new Promise((resolve) => setTimeout(() => resolve(true), 50)) }
  },
  { path: 'reviews', component: DummyNavPage }
];

describe('SectionsNavService', () => {
  let service: SectionsNavService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter(NAV_ROUTES)]
    }).compileComponents();

    service = TestBed.inject(SectionsNavService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
  });

  it('empieza con home como sección activa', () => {
    expect(service.activeSection()).toBe('home');
  });

  describe('updateActive', () => {
    it('navega a la URL de la sección con replaceUrl y actualiza la señal', () => {
      service.updateActive('reviews');

      expect(service.activeSection()).toBe('reviews');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/reviews', { replaceUrl: true });
    });

    it('no navega si la sección activa ya es la solicitada', () => {
      service.updateActive('home');

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('dos cruces del spy: solo la última navegación queda marcada', () => {
      service.updateActive('reviews');
      service.updateActive('contact');

      // La navegación de reviews fue superseded: su marcador se limpia con el
      // finally de su promesa; el vigente es el de contact.
      expect(service.consumeSpyNavigation('/reviews')).toBeFalse();
      expect(service.consumeSpyNavigation('/contact')).toBeTrue();
      expect(service.consumeSpyNavigation('/contact')).toBeFalse();
    });
  });

  describe('consumeSpyNavigation', () => {
    it('devuelve false cuando no hay navegación del spy pendiente', () => {
      expect(service.consumeSpyNavigation('/')).toBeFalse();
      expect(service.consumeSpyNavigation('/contact')).toBeFalse();
    });

    it('devuelve true una única vez tras un updateActive, y solo con SU url', () => {
      service.updateActive('about-me');

      expect(service.consumeSpyNavigation('/contact')).toBeFalse();
      expect(service.consumeSpyNavigation('/about-me')).toBeTrue();
      expect(service.consumeSpyNavigation('/about-me')).toBeFalse();
    });
  });

  describe('sectionFromUrl', () => {
    it('resuelve la sección desde la URL del router', () => {
      expect(service.sectionFromUrl('/')).toBe('home');
      expect(service.sectionFromUrl('')).toBe('home');
      expect(service.sectionFromUrl('/about-me')).toBe('about-me');
      expect(service.sectionFromUrl('/success-cases')).toBe('success-cases');
      expect(service.sectionFromUrl('/contact')).toBe('contact');
    });

    it('descarta query params y devuelve null fuera del one-pager', () => {
      expect(service.sectionFromUrl('/about-me?x=1')).toBe('about-me');
      expect(service.sectionFromUrl('/blog')).toBeNull();
      expect(service.sectionFromUrl('/algo-que-no-existe')).toBeNull();
    });
  });

  describe('scrollTo', () => {
    it('hace scrollIntoView suave y mueve el foco a la sección', () => {
      const section = document.createElement('div');
      section.id = 'reviews';
      document.body.appendChild(section);
      const scrollSpy = spyOn(section, 'scrollIntoView');
      const focusSpy = spyOn(section, 'focus');

      service.scrollTo('reviews');

      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
      expect(section.getAttribute('tabindex')).toBe('-1');

      document.body.removeChild(section);
    });

    it('respeta el behavior indicado (instantáneo para deep links)', () => {
      const section = document.createElement('div');
      section.id = 'contact';
      document.body.appendChild(section);
      const scrollSpy = spyOn(section, 'scrollIntoView');
      spyOn(section, 'focus');

      service.scrollTo('contact', 'auto');

      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });

      document.body.removeChild(section);
    });

    it('no falla si la sección no existe en el DOM', () => {
      expect(() => service.scrollTo('reviews')).not.toThrow();
    });
  });

  describe('regresión: marcador de spy por URL (no contador)', () => {
    it('la supersession de una navegación del spy limpia su marcador sin tocar el de la posterior', async () => {
      let resolveA!: (value: boolean) => void;
      let resolveB!: (value: boolean) => void;
      const promiseA = new Promise<boolean>((resolve) => (resolveA = resolve));
      const promiseB = new Promise<boolean>((resolve) => (resolveB = resolve));
      (router.navigateByUrl as jasmine.Spy).and.returnValues(promiseA, promiseB);

      service.updateActive('reviews'); // marcador '/reviews', promesa A en vuelo
      service.updateActive('contact'); // marcador '/contact' (sobrescribe; A será superseded)

      resolveA(false); // A cancelada/superseded: nunca habrá NavigationEnd de A
      await Promise.resolve();
      await Promise.resolve();

      // El marcador vigente es el de contact: solo su URL lo consume.
      expect(service.consumeSpyNavigation('/reviews')).toBeFalse();
      expect(service.consumeSpyNavigation('/contact')).toBeTrue();
      expect(service.consumeSpyNavigation('/contact')).toBeFalse();

      resolveB(true);
    });

    it('un marcador ya consumido no clasifica como spy una navegación de usuario posterior', () => {
      service.updateActive('reviews');
      expect(service.consumeSpyNavigation('/reviews')).toBeTrue();

      // Navegación de usuario a la MISMA URL (clic en el navbar): no es del spy.
      expect(service.consumeSpyNavigation('/reviews')).toBeFalse();
    });
  });

  describe('navegación de usuario en vuelo (router real)', () => {
    beforeEach(() => {
      (router.navigateByUrl as jasmine.Spy).and.callThrough();
    });

    it('el spy no supersede una navegación de usuario en curso: el clic manda', async () => {
      const userNav = router.navigateByUrl('/contact');
      service.updateActive('reviews'); // cruce del spy DURANTE la navegación del usuario

      await userNav;

      expect(router.url).toBe('/contact');
    });

    it('sin navegación de usuario en vuelo, el spy vuelve a sincronizar la URL', async () => {
      await router.navigateByUrl('/contact');

      service.updateActive('reviews');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(router.url).toBe('/reviews');
    });
  });
});
