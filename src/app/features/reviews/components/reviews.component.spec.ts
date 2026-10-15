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
      'REVIEWS.ADD_REVIEW': 'Añadir reseña',
      'REVIEWS.EMPTY_TITLE': 'Aún no existen reseñas, sé tú el primero',
      'REVIEWS.RATING_ARIA': '{{count}} de 5 estrellas'
    })
};

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

  it('should render a review card per review by default', () => {
    const cards = fixture.debugElement.queryAll(By.directive(ReviewCardComponent));
    expect(cards.length).toBe(component.reviews().length);
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should show the empty state with the big CTA when there are no reviews', () => {
    fixture.componentRef.setInput('reviews', []);
    fixture.detectChanges();

    const emptyEl = fixture.nativeElement.querySelector('.reviews-empty');
    expect(emptyEl).toBeTruthy();

    const cards = fixture.debugElement.queryAll(By.directive(ReviewCardComponent));
    expect(cards.length).toBe(0);

    const cta = fixture.nativeElement.querySelector('.empty-cta') as HTMLButtonElement;
    expect(cta).toBeTruthy();
  });

  it('should show the form when the header pill is clicked', () => {
    const pill = fixture.nativeElement.querySelector('.leave-review-btn') as HTMLButtonElement;
    pill.click();
    fixture.detectChanges();

    const formEl = fixture.debugElement.query(By.directive(ReviewsFormComponent));
    expect(formEl).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.reviews-grid')).toBeFalsy();
  });

  it('should show the form from the empty state CTA', () => {
    fixture.componentRef.setInput('reviews', []);
    fixture.detectChanges();

    const cta = fixture.nativeElement.querySelector('.empty-cta') as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(ReviewsFormComponent))).toBeTruthy();
  });

  it('should return to the list view when the form emits finished', () => {
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
    component.openForm();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.leave-review-btn')).toBeFalsy();
  });
});
