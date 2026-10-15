import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ReviewsService } from '../../services/reviews.service';
import { ReviewsFormComponent } from './reviews-form.component';

const mockTranslations = {
  'FORM.NAME_PLACEHOLDER': 'Your name',
  'FORM.EMAIL_ARIA': 'Your email address',
  'FORM.EMAIL_REQUIRED_ERROR': 'Required and valid',
  'FORM.REVIEW_MESSAGE_PLACEHOLDER': 'Write your review...',
  'FORM.SUBMIT_BUTTON': 'Send',
  'FORM.SUBMIT_LOADING': 'Sending...',
  'FORM.REQUIRED_ERROR': 'Required',
  'FORM.FORM_ERROR': 'Error. Please try again.',
  'REVIEWS.FORM_SUCCESS': 'Thank you for your review!',
  'REVIEWS.FORM_SUCCESS_SUBTEXT': 'A committee of experts will review it before publishing',
  'REVIEWS.BACK_TO_REVIEWS': 'Back to reviews',
  'REVIEWS.RATING_LABEL': 'Rating',
  'REVIEWS.STAR_ARIA': '{{count}} stars'
};

const mockLoader = { getTranslation: () => of(mockTranslations) };

describe('ReviewsFormComponent', () => {
  let component: ReviewsFormComponent;
  let fixture: ComponentFixture<ReviewsFormComponent>;
  let reviewsServiceSpy: jasmine.SpyObj<ReviewsService>;

  beforeEach(async () => {
    reviewsServiceSpy = jasmine.createSpyObj('ReviewsService', ['sendReview']);
    reviewsServiceSpy.sendReview.and.returnValue(of({ success: true }));

    await TestBed.configureTestingModule({
      imports: [
        ReviewsFormComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })
      ],
      providers: [{ provide: ReviewsService, useValue: reviewsServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Form initial state ────────────────────────────────────────────────────

  it('should initialise formStatus with loading: false', () => {
    expect(component.formStatus()).toEqual({ loading: false });
  });

  it('should render the form when not yet submitted', () => {
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy();
  });

  // ─── Form validation ───────────────────────────────────────────────────────

  describe('Form validation', () => {
    it('should be invalid when empty (email, message and rating required)', () => {
      expect(component.form.valid).toBeFalse();
      expect(component.form.get('email')?.valid).toBeFalse();
      expect(component.form.get('message')?.valid).toBeFalse();
      expect(component.form.get('rating')?.valid).toBeFalse();
    });

    it('should allow empty fullName (optional)', () => {
      component.form.get('fullName')?.setValue('');
      expect(component.form.get('fullName')?.valid).toBeTrue();
    });

    it('should reject invalid email formats', () => {
      const emailCtrl = component.form.get('email')!;
      emailCtrl.setValue('not-an-email');
      expect(emailCtrl.valid).toBeFalse();
    });

    it('should reject a rating above 5', () => {
      component.form.get('rating')!.setValue(6);
      expect(component.form.get('rating')!.valid).toBeFalse();
    });

    it('should accept a rating between 1 and 5', () => {
      component.form.get('rating')!.setValue(3);
      expect(component.form.get('rating')!.valid).toBeTrue();
    });
  });

  // ─── setRating ─────────────────────────────────────────────────────────────

  describe('setRating', () => {
    it('should set the rating value in the form control', () => {
      component.setRating(4);
      expect(component.form.get('rating')?.value).toBe(4);
    });

    it('should clamp value to minimum 1', () => {
      component.setRating(0);
      expect(component.form.get('rating')?.value).toBe(1);
    });

    it('should clamp value to maximum 5', () => {
      component.setRating(6);
      expect(component.form.get('rating')?.value).toBe(5);
    });

    it('should mark rating as touched and dirty', () => {
      component.setRating(3);
      expect(component.form.get('rating')?.touched).toBeTrue();
      expect(component.form.get('rating')?.dirty).toBeTrue();
    });
  });

  // ─── Hover ─────────────────────────────────────────────────────────────────

  describe('setHovered / clearHovered', () => {
    it('should update hoveredRating when a star is hovered', () => {
      component.setHovered(3);
      expect(component.hoveredRating()).toBe(3);
    });

    it('should reset hoveredRating to 0 on clearHovered', () => {
      component.setHovered(5);
      component.clearHovered();
      expect(component.hoveredRating()).toBe(0);
    });
  });

  // ─── invalid() helper ──────────────────────────────────────────────────────

  describe('invalid()', () => {
    it('should return undefined for a pristine control', () => {
      expect(component.invalid('email')).toBeFalsy();
    });

    it('should return true for a touched invalid control', () => {
      const ctrl = component.form.get('email')!;
      ctrl.setValue('bad');
      ctrl.markAsTouched();
      expect(component.invalid('email')).toBeTrue();
    });
  });

  // ─── submit() – success path ───────────────────────────────────────────────

  describe('submit() – success', () => {
    beforeEach(() => {
      component.form.setValue({
        fullName: 'Test User',
        email: 'user@test.com',
        message: 'Great!',
        rating: 5
      });
    });

    it('should call ReviewsService.sendReview with correct payload', () => {
      component.submit();

      expect(reviewsServiceSpy.sendReview).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          email: 'user@test.com',
          message: 'Great!',
          rating: 5,
          origin: 'nomacoda_portfolio'
        })
      );
    });

    it('should set formStatus.success after successful submission', () => {
      component.submit();

      expect(component.formStatus().success).toBe('REVIEWS.FORM_SUCCESS');
      expect(component.formStatus().loading).toBeFalse();
    });

    it('should reset the form after successful submission', () => {
      component.submit();

      expect(component.form.get('rating')?.value).toBe(0);
      expect(component.hoveredRating()).toBe(0);
    });

    it('should show success state with back button after submission', () => {
      component.submit();
      fixture.detectChanges();

      const successEl = fixture.nativeElement.querySelector('.success-state');
      expect(successEl).toBeTruthy();
      const backBtn = fixture.nativeElement.querySelector('.back-btn') as HTMLButtonElement;
      expect(backBtn).toBeTruthy();
      expect(fixture.nativeElement.querySelector('form')).toBeFalsy();
    });

    it('should emit finished when the back button is clicked', () => {
      component.submit();
      fixture.detectChanges();

      let emitted = false;
      component.finished.subscribe(() => (emitted = true));

      const backBtn = fixture.nativeElement.querySelector('.back-btn') as HTMLButtonElement;
      backBtn.click();

      expect(emitted).toBeTrue();
    });
  });

  // ─── submit() – error path ─────────────────────────────────────────────────

  describe('submit() – error', () => {
    beforeEach(() => {
      reviewsServiceSpy.sendReview.and.returnValue(throwError(() => new Error('Server error')));
      component.form.setValue({
        fullName: '',
        email: 'user@test.com',
        message: 'Great!',
        rating: 4
      });
    });

    it('should set formStatus.error on failure', () => {
      component.submit();

      expect(component.formStatus().error).toBe('FORM.FORM_ERROR');
      expect(component.formStatus().loading).toBeFalse();
    });
  });

  // ─── submit() – invalid form ───────────────────────────────────────────────

  describe('submit() – invalid form', () => {
    it('should not call the service when the form is invalid', () => {
      component.submit(); // form is empty → invalid
      expect(reviewsServiceSpy.sendReview).not.toHaveBeenCalled();
    });
  });

  // ─── Accessibility ─────────────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('email input has an associated <label for="reviews-email">', () => {
      const label = fixture.nativeElement.querySelector(
        'label[for="reviews-email"]'
      ) as HTMLLabelElement;
      const input = fixture.nativeElement.querySelector('#reviews-email') as HTMLInputElement;
      expect(label).toBeTruthy();
      expect(input).toBeTruthy();
    });

    it('marks email as aria-invalid and aria-describedby after invalid+touched', () => {
      component.form.get('email')!.setValue('not-an-email');
      component.form.get('email')!.markAsTouched();
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('#reviews-email') as HTMLInputElement;
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe('reviews-email-error');
    });

    it('marks required inputs with required and aria-required', () => {
      ['reviews-email', 'reviews-message'].forEach((id) => {
        const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
        expect(input.required).toBeTrue();
        expect(input.getAttribute('aria-required')).toBe('true');
      });
    });

    it('rating group exposes role="radiogroup" with 5 radio buttons', () => {
      const group = fixture.nativeElement.querySelector('[role="radiogroup"]') as HTMLElement;
      expect(group).toBeTruthy();
      const radios = fixture.nativeElement.querySelectorAll('[role="radio"]');
      expect(radios.length).toBe(5);
    });

    it('rating buttons reflect aria-checked and emit a translated aria-label', () => {
      component.setRating(3);
      fixture.detectChanges();
      const starThree = fixture.nativeElement.querySelectorAll('[role="radio"]')[2] as HTMLButtonElement;
      expect(starThree.getAttribute('aria-checked')).toBe('true');
      const aria = starThree.getAttribute('aria-label');
      expect(aria).toBeTruthy();
      expect(aria!.length).toBeGreaterThan(0);
    });

    it('error messages are announced with role="alert"', () => {
      component.form.get('email')!.setValue('bad');
      component.form.get('email')!.markAsTouched();
      fixture.detectChanges();
      const alert = fixture.nativeElement.querySelector('#reviews-email-error');
      expect(alert?.getAttribute('role')).toBe('alert');
    });
  });
});
