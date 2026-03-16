import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CertsFilterComponent } from './certs-filter.component';

const mockLoader = { getTranslation: () => of({}) };

describe('CertsFilterComponent', () => {
  let component: CertsFilterComponent;
  let fixture: ComponentFixture<CertsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CertsFilterComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(CertsFilterComponent);
    component = fixture.componentInstance;
    // filterParams is required (@Input), provide a default
    component.filterParams = [];
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
