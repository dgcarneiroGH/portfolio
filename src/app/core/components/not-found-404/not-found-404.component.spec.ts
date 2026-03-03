import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NotFound404Component } from './not-found-404.component';

const mockLoader = { getTranslation: () => of({}) };

describe('NotFound404Component', () => {
  let component: NotFound404Component;
  let fixture: ComponentFixture<NotFound404Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotFound404Component,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })
      ],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound404Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
