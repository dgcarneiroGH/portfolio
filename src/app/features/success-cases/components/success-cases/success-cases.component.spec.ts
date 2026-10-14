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
        OPEN_DETAIL: 'Más información de {{name}}',
        CLOSE: 'Cerrar detalle',
        DETAIL_YEAR: 'Año'
      },
      PROJECTS: {
        DESCRIPTION_BABE: 'd1',
        DESCRIPTION_DATALAIA: 'd2',
        DESCRIPTION_DISCAMINO: 'd3',
        DESCRIPTION_HERMES: 'd4',
        DESCRIPTION_LALIGA: 'd5',
        DESCRIPTION_PORTAL_CONVOCATORIAS: 'd6',
        PROJECT_BABE_ALT: 'a1',
        PROJECT_DATALAIA_ALT: 'a2',
        PROJECT_DISCAMINO_ALT: 'a3',
        PROJECT_ARCELOR_ALT: 'a4',
        PROJECT_LALIGA_ALT: 'a5',
        PROJECT_PORTAL_CONVOCATORIAS_ALT: 'a6',
        VIEW_PROJECT: 'Ver proyecto {{name}}'
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

  it('should render 6 cards', () => {
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('app-success-case');
    expect(cards.length).toBe(6);
  });

  it('should open the detail modal when a card requests it', () => {
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('app-success-case .info-btn'));
    btn.nativeElement.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-success-case-detail')).toBeTruthy();
  });

  it('should close the modal when the detail emits closed', () => {
    fixture.detectChanges();
    fixture.debugElement.query(By.css('app-success-case .info-btn')).nativeElement.click();
    fixture.detectChanges();
    const closeBtn = fixture.nativeElement.querySelector('.detail-close');
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-success-case-detail')).toBeFalsy();
  });
});
