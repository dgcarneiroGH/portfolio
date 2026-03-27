import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ReviewsService } from '../../services/reviews.service';
import { ReviewsFormComponent } from './reviews-form.component';

const mockTranslations = {
  'FORM.NAME_PLACEHOLDER': 'Your name',
  'FORM.EMAIL_PLACEHOLDER': 'you@email.com',
  'FORM.REVIEW_MESSAGE_PLACEHOLDER': 'Write your review...',
  'FORM.SUBMIT_BUTTON': 'Send',
  'FORM.SUBMIT_LOADING': 'Sending...',
  'FORM.REQUIRED_ERROR': 'Required',
  'FORM.EMAIL_REQUIRED_ERROR': 'Required and valid',
  'FORM.FORM_ERROR': 'Error. Please try again.',
  'REVIEWS.FORM_SUCCESS': 'Thank you for your review!'
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
      providers: [
        { provide: ReviewsService, useValue: reviewsServiceSpy }
      ]
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

  it('should initialise hoveredRating at 0', () => {
    expect(component.hoveredRating()).toBe(0);
  });

  it('should render the form when not yet submitted', () => {
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy();
  });

  // ─── Form validation ───────────────────────────────────────────────────────

  describe('Form validation', () => {
    it('should be invalid when empty (email and message required)', () => {
      expect(component.form.valid).toBeFalse();
      expect(component.form.get('email')?.valid).toBeFalse();
      expect(component.form.get('message')?.valid).toBeFalse();
    });

    it('should allow empty fullName', () => {
      component.form.get('fullName')?.setValue('');
      expect(component.form.get('fullName')?.valid).toBeTrue();
    });

    it('should reject invalid email formats', () => {
      const emailCtrl = component.form.get('email')!;
      emailCtrl.setValue('not-an-email');
      expect(emailCtrl.valid).toBeFalse();
    });

    it('should accept a valid email', () => {
      component.form.get('email')!.setValue('test@example.com');
      expect(component.form.get('email')!.valid).toBeTrue();
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
      component.form.setValue({ fullName: 'Test User', email: 'user@test.com', message: 'Great!', rating: 5 });
    });

    it('should call ReviewsService.sendReview with correct payload', fakeAsync(() => {
      component.submit();
      tick();

      expect(reviewsServiceSpy.sendReview).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ email: 'user@test.com', message: 'Great!', rating: 5, origin: 'nomacoda_portfolio' })
      );
    }));

    it('should set formStatus.loading to true while request is in flight', fakeAsync(() => {
      let loadingDuringCall = false;
      reviewsServiceSpy.sendReview.and.callFake(() => {
        loadingDuringCall = component.formStatus().loading;
        return of({ success: true });
      });

      component.submit();
      tick();

      expect(loadingDuringCall).toBeTrue();
    }));

    it('should set formStatus.success after successful submission', fakeAsync(() => {
      component.submit();
      tick();

      expect(component.formStatus().success).toBe('REVIEWS.FORM_SUCCESS');
      expect(component.formStatus().loading).toBeFalse();
    }));

    it('should reset the form after successful submission', fakeAsync(() => {
      component.submit();
      tick();

      expect(component.form.get('rating')?.value).toBe(0);
      expect(component.hoveredRating()).toBe(0);
    }));

    it('should show success state in the DOM after submission', fakeAsync(() => {
      component.submit();
      tick();
      fixture.detectChanges();

      const successEl = fixture.nativeElement.querySelector('.success-state');
      expect(successEl).toBeTruthy();
      const formEl = fixture.nativeElement.querySelector('form');
      expect(formEl).toBeFalsy();
    }));
  });

  // ─── submit() – error path ─────────────────────────────────────────────────

  describe('submit() – error', () => {
    beforeEach(() => {
      reviewsServiceSpy.sendReview.and.returnValue(throwError(() => new Error('Server error')));
      component.form.setValue({ fullName: '', email: 'user@test.com', message: 'Great!', rating: 4 });
    });

    it('should set formStatus.error on failure', fakeAsync(() => {
      component.submit();
      tick();

      expect(component.formStatus().error).toBe('FORM.FORM_ERROR');
      expect(component.formStatus().loading).toBeFalse();
    }));
  });

  // ─── submit() – invalid ────────────────────────────────────────────────────

  describe('submit() – invalid form', () => {
    it('should not call the service when the form is invalid', () => {
      component.submit(); // form is empty → invalid
      expect(reviewsServiceSpy.sendReview).not.toHaveBeenCalled();
    });
  });
});
