import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { OscillatorComponent } from './oscillator.component';

describe('OscillatorComponent', () => {
  let component: OscillatorComponent;
  let fixture: ComponentFixture<OscillatorComponent>;
  let restoreIntersectionObserver: (() => void) | undefined;
  let fixtureDestroyed = false;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OscillatorComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(OscillatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    restoreIntersectionObserver?.();
    restoreIntersectionObserver = undefined;
    if (fixture && !fixtureDestroyed) fixture.destroy();
    fixtureDestroyed = false;
  });

  it('should decorate host with aria-hidden="true"', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('should have a non-focusable canvas descendant', () => {
    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.tabIndex).toBe(-1);
    expect(canvas.hasAttribute('tabindex')).toBeFalse();
  });

  it('should resume the animation loop when the canvas becomes visible again after being hidden', () => {
    // Detener la instancia auto-creada para instalar los mocks limpiamente
    fixture.destroy();
    fixtureDestroyed = true;

    // Mock de IntersectionObserver con control manual del callback
    let ioCallback!: IntersectionObserverCallback;
    class FakeIntersectionObserver {
      observe = jasmine.createSpy('observe');
      unobserve = jasmine.createSpy('unobserve');
      disconnect = jasmine.createSpy('disconnect');
      constructor(cb: IntersectionObserverCallback) {
        ioCallback = cb;
      }
    }
    const originalIO = window.IntersectionObserver;
    (window as any).IntersectionObserver = FakeIntersectionObserver;
    restoreIntersectionObserver = () => {
      (window as any).IntersectionObserver = originalIO;
    };

    // Contador de frames programados por el loop del componente
    // (identidad de _loop; excluye rAF internos del scheduler zoneless)
    let loopRafCount = 0;
    let lastLoopCb: FrameRequestCallback | undefined;
    spyOn(window, 'requestAnimationFrame').and.callFake(
      (cb: FrameRequestCallback) => {
        if (cb === (component as any)['_loop']) {
          loopRafCount++;
          lastLoopCb = cb;
        }
        return 1;
      }
    );

    fixture = TestBed.createComponent(OscillatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // ngAfterViewInit → _initOscillator → _loop programa el primer frame
    expect(loopRafCount).toBe(1);

    // El observer reporta el estado inicial: canvas fuera del viewport
    const fakeObserver = { disconnect: () => {} } as unknown as IntersectionObserver;
    ioCallback(
      [{ isIntersecting: false } as unknown as IntersectionObserverEntry],
      fakeObserver
    );

    // El frame ya programado se ejecuta con _running === false
    lastLoopCb!(performance.now());

    // El usuario scrollea y el canvas vuelve a ser visible
    ioCallback(
      [{ isIntersecting: true } as unknown as IntersectionObserverEntry],
      fakeObserver
    );

    // El loop debe re-programar un frame; con el bug (frameId huérfano) no lo hace
    expect(loopRafCount).toBe(2);
  });
});