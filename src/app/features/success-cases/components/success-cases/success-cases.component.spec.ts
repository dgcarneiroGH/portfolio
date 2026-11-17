import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { SuccessCasesComponent } from './success-cases.component';

const mockLoader = {
  getTranslation: () =>
    of({
      SUCCESS_CASES: {
        TITLE: 'Casos de éxito',
        DETAIL_TECH: 'Tecnologías',
        DETAIL_YEAR: 'Año',
        PREV_CASE: 'Caso anterior',
        NEXT_CASE: 'Caso siguiente',
        GOTO_CASE: 'Ir al caso {{name}}',
        DOTS_ARIA: 'Ir a un caso concreto',
        SLIDE_LABEL: 'Diapositiva {{current}} de {{total}}: {{name}}'
      }
    })
};

describe('SuccessCasesComponent', () => {
  let fixture: ComponentFixture<SuccessCasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SuccessCasesComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es-ES');
    await firstValueFrom(translate.use('es-ES'));

    fixture = TestBed.createComponent(SuccessCasesComponent);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render 6 slides in the track', () => {
    fixture.detectChanges();
    const slides = fixture.nativeElement.querySelectorAll('app-success-case');
    expect(slides.length).toBe(6);
  });

  it('should activate only the current slide and hide the others', () => {
    fixture.detectChanges();
    const slides = fixture.nativeElement.querySelectorAll('app-success-case article');
    expect(slides[0].getAttribute('aria-hidden')).toBe('false');
    expect(slides[1].getAttribute('aria-hidden')).toBe('true');
  });

  it('should advance with the next arrow and wrap around after the last case', () => {
    fixture.detectChanges();
    const nextBtn = fixture.debugElement.queryAll(By.css('.carousel-arrow'))[1];
    for (let i = 0; i < 6; i++) {
      nextBtn.nativeElement.click();
      fixture.detectChanges();
    }
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    // Una vuelta completa: la primera slide vuelve a estar activa.
    const slides = fixture.nativeElement.querySelectorAll('app-success-case article');
    expect(slides[0].getAttribute('aria-hidden')).toBe('false');
  });

  it('should go back with the prev arrow and wrap around to the last case', () => {
    fixture.detectChanges();
    const prevBtn = fixture.debugElement.queryAll(By.css('.carousel-arrow'))[0];
    prevBtn.nativeElement.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(5);
  });

  it('should jump to a case via the dots', () => {
    fixture.detectChanges();
    const dots = fixture.debugElement.queryAll(By.css('.carousel-dot'));
    expect(dots.length).toBe(6);
    dots[3].nativeElement.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(3);
    expect(
      dots[3].nativeElement.getAttribute('aria-current')
    ).toBe('true');
  });

  it('should navigate with the keyboard arrows', () => {
    fixture.detectChanges();
    const carousel = fixture.debugElement.query(By.css('.carousel'));
    carousel.triggerEventHandler('keydown.arrowright', {});
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);

    carousel.triggerEventHandler('keydown.arrowleft', {});
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it('should swipe to the next case when dragging left beyond the threshold', () => {
    fixture.detectChanges();
    const viewport = fixture.debugElement.query(By.css('.carousel-viewport'));
    viewport.triggerEventHandler('pointerdown', { clientX: 300 });
    viewport.triggerEventHandler('pointerup', { clientX: 200 });
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
  });

  it('should swipe to the previous case when dragging right beyond the threshold', () => {
    fixture.componentInstance.goTo(2);
    fixture.detectChanges();
    const viewport = fixture.debugElement.query(By.css('.carousel-viewport'));
    viewport.triggerEventHandler('pointerdown', { clientX: 200 });
    viewport.triggerEventHandler('pointerup', { clientX: 320 });
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
  });

  it('should ignore small pointer movements below the swipe threshold', () => {
    fixture.detectChanges();
    const viewport = fixture.debugElement.query(By.css('.carousel-viewport'));
    viewport.triggerEventHandler('pointerdown', { clientX: 300 });
    viewport.triggerEventHandler('pointerup', { clientX: 280 });
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });
});
