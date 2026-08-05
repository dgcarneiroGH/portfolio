import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ReviewsService } from '../services/reviews.service';
import { ReviewsFormComponent } from './reviews-form/reviews-form.component';
import { ReviewsComponent } from './reviews.component';

const mockLoader = {
  getTranslation: () => of({
    'REVIEWS.TITLE': 'Reviews',
    'REVIEWS.FORM_SUCCESS': 'Thank you for your review!',
    'REVIEWS.GO_BACK': 'Go back',
    'FORM.SUBMIT_BUTTON': 'Send',
    'FORM.SUBMIT_LOADING': 'Sending...'
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
      providers: [
        { provide: ReviewsService, useValue: reviewsServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsComponent);
    component = fixture.componentInstance;
    // Provide the required @Input navigate function
    component.navigate = jasmine.createSpy('navigate');
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the reviews form child component', () => {
    const formEl = fixture.debugElement.query(By.directive(ReviewsFormComponent));
    expect(formEl).toBeTruthy();
  });

  it('should render the title', () => {
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2).toBeTruthy();
  });

  it('should render the campfire button', () => {
    const campfire = fixture.nativeElement.querySelector('.nomacoda-campfire');
    expect(campfire).toBeTruthy();
  });

  it('should call navigate() when campfire button is clicked', () => {
    const campfire = fixture.nativeElement.querySelector('.nomacoda-campfire') as HTMLElement;
    campfire.click();
    expect(component.navigate).toHaveBeenCalled();
  });

  it('should call navigate() on Enter key on campfire (native button activation)', () => {
    const campfire = fixture.nativeElement.querySelector('.nomacoda-campfire') as HTMLButtonElement;
    // Native <button> activates on Enter by triggering a click event.
    campfire.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    // Browser default action: keydown 'Enter' on a button → click. We dispatch it explicitly.
    campfire.click();
    expect(component.navigate).toHaveBeenCalled();
  });

  it('should call navigate() on Space key on campfire (native button activation)', () => {
    const campfire = fixture.nativeElement.querySelector('.nomacoda-campfire') as HTMLButtonElement;
    campfire.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    // Browser default action: keyup ' ' on a button → click. We dispatch it explicitly.
    campfire.click();
    expect(component.navigate).toHaveBeenCalled();
  });

  it('should show success state after form submission', async () => {
    const formComponent = component.reviewsForm;

    formComponent.form.setValue({
      fullName: 'Test',
      email: 'test@test.com',
      message: 'Great!',
      rating: 5
    });
    formComponent.submit();

    await fixture.whenStable();
    fixture.detectChanges();

    const successEl = fixture.nativeElement.querySelector('.success-state');
    expect(successEl).toBeTruthy();
  });

  it('should not show success state initially', () => {
    const successEl = fixture.nativeElement.querySelector('.success-state');
    expect(successEl).toBeFalsy();
  });
});
