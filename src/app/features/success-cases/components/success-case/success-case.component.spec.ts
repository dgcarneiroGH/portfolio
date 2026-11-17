import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { SuccessCaseComponent } from './success-case.component';
import { SuccessCase } from '../../interfaces/success-case.interface';

const mockLoader = {
  getTranslation: () =>
    of({
      SUCCESS_CASES: {
        ALT_BABE: 'Alt de prueba',
        DETAIL_TECH: 'Tecnologías',
        DETAIL_YEAR: 'Año',
        PROBLEM_BABE: 'Problema de prueba.',
        PROBLEM_LABEL: 'El problema',
        SLIDE_LABEL: 'Diapositiva {{current}} de {{total}}: {{name}}',
        SOLUTION_BABE: 'Solución de prueba.',
        SOLUTION_LABEL: 'La solución',
        VIEW_PROJECT: 'Ver proyecto {{name}}'
      }
    })
};

const TEST_CASE: SuccessCase = {
  year: 2023,
  coverImgSrc: 'assets/images/projects/babe',
  name: 'Babé y CIA',
  problem: 'SUCCESS_CASES.PROBLEM_BABE',
  solution: 'SUCCESS_CASES.SOLUTION_BABE',
  url: 'https://example.com',
  altKey: 'SUCCESS_CASES.ALT_BABE',
  technologies: ['Angular', 'Django']
};

describe('SuccessCaseComponent', () => {
  let fixture: ComponentFixture<SuccessCaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SuccessCaseComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es-ES');
    await firstValueFrom(translate.use('es-ES'));

    fixture = TestBed.createComponent(SuccessCaseComponent);
    fixture.componentRef.setInput('successCase', TEST_CASE);
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('total', 6);
    fixture.componentRef.setInput('active', true);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the visible title, year and pills', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('.case-title');
    expect(title?.textContent?.trim()).toBe('Babé y CIA');
    expect(title?.classList.contains('sr-only')).toBeFalse();
    expect(el.querySelector('.case-year')?.textContent).toContain('2023');
    const pills = el.querySelectorAll('li[app-tech-pill]');
    expect(pills.length).toBe(2);
  });

  it('should render problem and solution as titled blocks', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const blocks = el.querySelectorAll('.case-block');
    expect(blocks.length).toBe(2);

    const problemTitle = blocks[0].querySelector('.case-block-title');
    expect(problemTitle?.textContent?.trim()).toBe('El problema');
    expect(blocks[0].querySelector('.case-block-text')?.textContent).toContain('Problema de prueba');

    const solutionTitle = blocks[1].querySelector('.case-block-title');
    expect(solutionTitle?.textContent?.trim()).toBe('La solución');
    expect(blocks[1].querySelector('.case-block-text')?.textContent).toContain('Solución de prueba');
  });

  it('should render the cover image with translated alt', () => {
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.case-cover img');
    expect(img?.getAttribute('src')).toBe('assets/images/projects/babe.avif');
    expect(img?.getAttribute('alt')).toBe('Alt de prueba');
  });

  it('should mark inactive slides as aria-hidden and remove their link from tab order', () => {
    fixture.componentRef.setInput('active', false);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const article = el.querySelector('article');
    expect(article?.getAttribute('aria-hidden')).toBe('true');
    const link = el.querySelector('.case-link');
    expect(link?.getAttribute('tabindex')).toBe('-1');
  });

  it('should keep the active slide link in tab order and expose the slide label', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const article = el.querySelector('article');
    expect(article?.getAttribute('aria-hidden')).toBe('false');
    expect(article?.getAttribute('aria-roledescription')).toBe('slide');
    expect(article?.getAttribute('aria-label')).toBe('Diapositiva 1 de 6: Babé y CIA');
    const link = el.querySelector('.case-link');
    expect(link?.getAttribute('tabindex')).toBeNull();
  });

  it('should not render any info button', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.info-btn')).toBeNull();
  });
});
