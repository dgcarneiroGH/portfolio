import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ReviewFormData, ReviewsFormComponent } from './reviews-form/reviews-form.component';
import { ReviewsComponent } from './reviews.component';

const mockLoader = {  
  getTranslation: () => of({
    'REVIEW.TITLE': 'Dejanos tu reseña',
    'REVIEW.SUCCESS': '¡Gracias por tu reseña!'
  })
};

describe('ReviewsComponent', () => {
  let component: ReviewsComponent;
  let fixture: ComponentFixture<ReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReviewsComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ]
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

  it('should render the form initially', () => {
    const formElement = fixture.debugElement.query(By.directive(ReviewsFormComponent));
    expect(formElement).toBeTruthy();
    const successElement = fixture.debugElement.query(By.css('.success-state'));
    expect(successElement).toBeFalsy();
  });

  it('should show success message on submission', async () => {
    const fakeData: ReviewFormData = {
      fullName: 'John',
      email: 'john@example.com',
      message: 'Great!',
      rating: 5,
      acceptsLinkedIn: true
    };

    component.onSubmit(fakeData);
    await new Promise(resolve => setTimeout(resolve, 1100)); // wait for api delay
    fixture.detectChanges();

    const formElement = fixture.debugElement.query(By.directive(ReviewsFormComponent));
    expect(formElement).toBeFalsy();

    const successElement = fixture.debugElement.query(By.css('.success-state'));
    expect(successElement).toBeTruthy();
    expect(successElement.nativeElement.textContent).toContain('REVIEW.SUCCESS');
  });
});
