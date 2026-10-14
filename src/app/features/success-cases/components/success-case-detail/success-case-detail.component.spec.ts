import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { SuccessCaseDetailComponent } from './success-case-detail.component';
import { SuccessCase } from '../../interfaces/success-case.interface';

const mockLoader = {
  getTranslation: () =>
    of({
      SUCCESS_CASES: {
        ALT_BABE: 'Alt de prueba',
        CLOSE: 'Cerrar detalle',
        DETAIL_TECH: 'Tecnologías',
        DETAIL_YEAR: 'Año',
        PROBLEM_BABE: 'Problema de prueba.',
        PROBLEM_LABEL: 'El problema:',
        SOLUTION_BABE: 'Solución de prueba.',
        SOLUTION_LABEL: 'La solución:',
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
  altKey: 'SUCCESS_CASES.ALT_BABE',
  technologies: ['Angular', 'Django']
};

describe('SuccessCaseDetailComponent', () => {
  let fixture: ComponentFixture<SuccessCaseDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SuccessCaseDetailComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es-ES');
    await firstValueFrom(translate.use('es-ES'));

    fixture = TestBed.createComponent(SuccessCaseDetailComponent);
    fixture.componentRef.setInput('successCase', TEST_CASE);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create and render a dialog', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('should render year, technologies and problem/solution paragraphs', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.detail-year')?.textContent).toContain('2023');
    expect(el.querySelectorAll('li[app-tech-pill]').length).toBe(2);

    const descriptions = el.querySelectorAll('.detail-description');
    expect(descriptions.length).toBe(2);

    const problem = descriptions[0];
    expect(problem.querySelector('strong')?.textContent).toBe('El problema:');
    expect(problem.textContent).toContain('Problema de prueba');

    const solution = descriptions[1];
    expect(solution.querySelector('strong')?.textContent).toBe('La solución:');
    expect(solution.textContent).toContain('Solución de prueba');
  });

  it('should emit closed on Escape keydown', () => {
    fixture.detectChanges();
    const closed: boolean[] = [];
    fixture.componentInstance.closed.subscribe(() => closed.push(true));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(closed).toEqual([true]);
  });

  it('should lock and restore body scroll', () => {
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');
    fixture.destroy();
    expect(document.body.style.overflow).toBe('');
  });
});
