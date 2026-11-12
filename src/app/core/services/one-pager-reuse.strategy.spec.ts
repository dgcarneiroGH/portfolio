import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouteReuseStrategy,
  Router,
  RouterOutlet,
  Routes,
  provideRouter
} from '@angular/router';
import { By } from '@angular/platform-browser';
import { OnePagerReuseStrategy } from './one-pager-reuse.strategy';

/**
 * Snapshots mínimos para probar la lógica pura de shouldReuseRoute sin
 * montar el router completo. A y B son objetos distintos con el mismo
 * data.onePager, como ocurre entre dos rutas one-pager distintas.
 */
const onePagerConfigA = { data: { onePager: true } };
const onePagerConfigB = { data: { onePager: true } };
const otherConfig = { data: {} };

function snap(routeConfig: object): ActivatedRouteSnapshot {
  return { routeConfig } as unknown as ActivatedRouteSnapshot;
}

@Component({ selector: 'dummy-a', template: '' })
class DummyA {}

@Component({ selector: 'dummy-b', template: '' })
class DummyB {}

@Component({ selector: 'dummy-blog', template: '' })
class DummyBlog {}

@Component({
  selector: 'test-host',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
class HostComponent {}

const TEST_ROUTES: Routes = [
  { path: 'a', component: DummyA, data: { onePager: true } },
  { path: 'b', component: DummyB, data: { onePager: true } },
  { path: 'blog', component: DummyBlog }
];

describe('OnePagerReuseStrategy', () => {
  describe('lógica pura', () => {
    let strategy: OnePagerReuseStrategy;

    beforeEach(() => {
      strategy = new OnePagerReuseStrategy();
    });

    it('reutiliza la instancia cuando ambas rutas son one-pager (configs distintas)', () => {
      expect(strategy.shouldReuseRoute(snap(onePagerConfigA), snap(onePagerConfigB))).toBeTrue();
    });

    it('NO reutiliza cuando una de las dos rutas no es one-pager (blog ↔ secciones)', () => {
      expect(strategy.shouldReuseRoute(snap(otherConfig), snap(onePagerConfigA))).toBeFalse();
      expect(strategy.shouldReuseRoute(snap(onePagerConfigA), snap(otherConfig))).toBeFalse();
    });

    it('mantiene el comportamiento base cuando la configuración de ruta coincide', () => {
      const config = { data: {} };
      expect(strategy.shouldReuseRoute(snap(config), snap(config))).toBeTrue();
    });
  });

  describe('comportamiento con el router', () => {
    let fixture: ComponentFixture<HostComponent>;
    let router: Router;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [
          provideZonelessChangeDetection(),
          provideRouter(TEST_ROUTES),
          { provide: RouteReuseStrategy, useClass: OnePagerReuseStrategy }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(HostComponent);
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });

    afterEach(() => fixture.destroy());

    async function navigate(url: string): Promise<void> {
      await router.navigateByUrl(url);
      await fixture.whenStable();
      fixture.detectChanges();
    }

    function currentInstance(): unknown {
      const dummy =
        fixture.debugElement.query(By.directive(DummyA)) ??
        fixture.debugElement.query(By.directive(DummyB));
      return dummy?.componentInstance;
    }

    it('reutiliza la misma instancia del componente al navegar entre rutas one-pager', async () => {
      await navigate('/a');
      const first = currentInstance();
      expect(first).toBeTruthy();

      await navigate('/b');
      expect(currentInstance()).toBe(first);
    });

    it('destruye la instancia al salir del one-pager (blog) y crea una nueva al volver', async () => {
      await navigate('/a');
      const sectionsInstance = currentInstance();

      await navigate('/blog');
      expect(fixture.debugElement.query(By.directive(DummyBlog))).toBeTruthy();
      expect(currentInstance()).toBeFalsy();

      await navigate('/b');
      expect(currentInstance()).not.toBe(sectionsInstance);
    });
  });
});
