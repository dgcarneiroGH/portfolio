import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ReviewsService } from '../services/reviews.service';
import { ReviewCardComponent } from './review-card/review-card.component';
import { ReviewsFormComponent } from './reviews-form/reviews-form.component';
import { ReviewsComponent } from './reviews.component';

const mockLoader = {
  getTranslation: () =>
    of({
      'ROUTE.REVIEWS': 'Opiniones',
      'REVIEWS.LEAVE_REVIEW': 'Dejar reseña',
      'REVIEWS.RATING_ARIA': '{{count}} de 5 estrellas'
    })
};

// Reseñas de prueba: la constante REVIEWS está vacía por defecto y, con el
// listado vacío, el componente no renderiza nada (la sección se oculta).
const MOCK_REVIEWS = [
  { fullName: 'Ana G.', message: 'Excelente trabajo', rating: 5 },
  { fullName: 'Luis P.', message: 'Muy profesional', rating: 4 }
];

describe('ReviewsComponent', () => {
  let component: ReviewsComponent;
  let fixture: ComponentFixture<ReviewsComponent>;
  let reviewsServiceSpy: jasmine.SpyObj<ReviewsService>;
  beforeEach(async () => {
    reviewsServiceSpy = jasmine.createSpyObj('ReviewsService', ['sendReview']);
    reviewsServiceSpy.sendReview.and.returnValue(of({ success: true }));

    await TestBed.configureTestingModule({
      imports: [
        ReviewsComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })
      ],
      providers: [{ provide: ReviewsService, useValue: reviewsServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('oculta la sección por completo cuando no hay reseñas', () => {
    // Sin reseñas no se renderiza nada: ni header con CTA ni empty state.
    fixture.componentRef.setInput('reviews', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('section.reviews')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.leave-review-btn')).toBeFalsy();
    expect(fixture.debugElement.queryAll(By.directive(ReviewCardComponent)).length).toBe(0);
  });

  it('la section raíz no lleva id: el ancla lo pone el envoltorio del one-pager', () => {
    // Con el listado vacío no hay sección: hay que darle reseñas.
    fixture.componentRef.setInput('reviews', MOCK_REVIEWS);
    fixture.detectChanges();

    const rootSection = fixture.nativeElement.querySelector('section.reviews');
    expect(rootSection).toBeTruthy();
    expect(rootSection.id).toBe('');
  });

  it('should render a review card per provided review', () => {
    // La constante REVIEWS está vacía por defecto: el listado llega vía input.
    fixture.componentRef.setInput('reviews', MOCK_REVIEWS);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.directive(ReviewCardComponent));
    expect(cards.length).toBe(component.reviews().length);
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should show the form when the header pill is clicked', () => {
    fixture.componentRef.setInput('reviews', MOCK_REVIEWS);
    fixture.detectChanges();

    const pill = fixture.nativeElement.querySelector('.leave-review-btn') as HTMLButtonElement;
    pill.click();
    fixture.detectChanges();

    const formEl = fixture.debugElement.query(By.directive(ReviewsFormComponent));
    expect(formEl).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.reviews-grid')).toBeFalsy();
  });

  it('should return to the list view when the form emits finished', () => {
    fixture.componentRef.setInput('reviews', MOCK_REVIEWS);
    fixture.detectChanges();

    component.openForm();
    fixture.detectChanges();

    const formComponent = fixture.debugElement.query(
      By.directive(ReviewsFormComponent)
    ).componentInstance as ReviewsFormComponent;
    formComponent.finished.emit();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(ReviewsFormComponent))).toBeFalsy();
    expect(fixture.debugElement.queryAll(By.directive(ReviewCardComponent)).length).toBe(
      component.reviews().length
    );
  });

  it('should hide the header pill while the form is open', () => {
    fixture.componentRef.setInput('reviews', MOCK_REVIEWS);
    fixture.detectChanges();

    component.openForm();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.leave-review-btn')).toBeFalsy();
  });
});
