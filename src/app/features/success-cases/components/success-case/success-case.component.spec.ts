import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { SuccessCaseComponent } from './success-case.component';
import { SuccessCase } from '../../interfaces/success-case.interface';

const mockLoader = {
  getTranslation: () =>
    of({
      SUCCESS_CASES: {
        ALT_BABE: 'Alt de prueba',
        DETAIL_TECH: 'Tecnologías',
        OPEN_DETAIL: 'Más información de {{name}}'
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
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render sr-only title and pills, but no visible description', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('.case-title');
    expect(title?.textContent?.trim()).toBe('Babé y CIA');
    expect(title?.classList.contains('sr-only')).toBeTrue();
    expect(el.querySelector('.case-description')).toBeNull();
    const pills = el.querySelectorAll('li[app-tech-pill]');
    expect(pills.length).toBe(2);
  });

  it('should render the cover image with translated alt', () => {
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.case-cover img');
    expect(img?.getAttribute('src')).toBe('assets/images/projects/babe.avif');
    expect(img?.getAttribute('alt')).toBe('Alt de prueba');
  });

  it('should emit openRequest with the index when the info button is clicked', () => {
    fixture.detectChanges();
    const emitted: number[] = [];
    fixture.componentInstance.openRequest.subscribe((i) => emitted.push(i));
    const btn = fixture.debugElement.query(By.css('.info-btn'));
    btn.nativeElement.click();
    expect(emitted).toEqual([0]);
  });
});
