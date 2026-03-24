import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ReviewFormData, ReviewsFormComponent } from './reviews-form.component';

const mockLoader = {
  getTranslation: () => of({
    '07_CONTACT.NAME_PLACEHOLDER': 'Tu nombre (Opcional)',
    '07_CONTACT.EMAIL_PLACEHOLDER': 'Tu correo electrónico *',
    'REVIEW.MESSAGE_PLACEHOLDER': 'Escribe tu reseña aquí... *',
    'REVIEW.RATING_LABEL': 'Valora tu experiencia *',
    'REVIEW.ACCEPT_LINKEDIN': 'Acepto que compartas esto por LinkedIn *',
    'REVIEW.SUBMIT_BUTTON': 'Enviar Reseña →'
  })
};

describe('ReviewsFormComponent', () => {
  let component: ReviewsFormComponent;
  let fixture: ComponentFixture<ReviewsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReviewsFormComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
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

  describe('Form Validation', () => {
    it('should be invalid when empty because of required fields', () => {
      expect(component.form.valid).toBeFalse();
      expect(component.form.get('email')?.valid).toBeFalse();
      expect(component.form.get('message')?.valid).toBeFalse();
      expect(component.form.get('acceptsLinkedIn')?.valid).toBeFalse();
    });

    it('should allow empty fullname', () => {
      const nameControl = component.form.get('fullName');
      nameControl?.setValue('');
      expect(nameControl?.valid).toBeTrue();
    });

    it('should mandate valid email', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.valid).toBeFalse();
      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBeTrue();
    });

    it('should mandate 1-5 rating', () => {
      const ratingControl = component.form.get('rating');
      // starts at 0, thus invalid
      expect(ratingControl?.valid).toBeFalse();
      ratingControl?.setValue(1);
      expect(ratingControl?.valid).toBeTrue();
      ratingControl?.setValue(6);
      expect(ratingControl?.valid).toBeFalse();
    });
  });

  describe('setRating', () => {
    it('should set the rating value in the form control', () => {
      component.setRating(4);
      expect(component.form.get('rating')?.value).toBe(4);
    });

    it('should not allow values out of bounds to be set via method', () => {
      component.setRating(6);
      expect(component.form.get('rating')?.value).toBe(5); // assuming bounded
      component.setRating(0);
      expect(component.form.get('rating')?.value).toBe(1); // assuming bounded
    });
  });

  describe('submit', () => {
    it('should emit data when valid', () => {
      let emittedObj: ReviewFormData | undefined;
      component.submitted.subscribe(val => emittedObj = val);

      component.form.setValue({
        fullName: 'John Doe',
        email: 'john@example.com',
        message: 'Great experience!',
        rating: 5,
        acceptsLinkedIn: true
      });

      component.submit();

      expect(emittedObj).toBeDefined();
      expect(emittedObj?.email).toBe('john@example.com');
      expect(emittedObj?.rating).toBe(5);
    });

    it('should not emit when invalid', () => {
      let spy = jasmine.createSpy('submitSpy');
      component.submitted.subscribe(spy);

      // Leaves fields empty, invalid
      component.submit();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
