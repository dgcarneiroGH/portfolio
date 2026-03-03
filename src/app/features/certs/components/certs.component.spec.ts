import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CertsComponent } from './certs.component';

const mockLoader = { getTranslation: () => of({}) };

describe('CertsComponent', () => {
  let component: CertsComponent;
  let fixture: ComponentFixture<CertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CertsComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
