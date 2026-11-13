import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewInquiry } from '../../interfaces/review-inquiry.interface';
import { ReviewsService } from '../../services/reviews.service';

interface FormStatus {
  loading: boolean;
  success?: string;
  error?: string;
}

@Component({
  selector: 'app-reviews-form',
  standalone: true,
  providers:[ReviewsService],
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './reviews-form.component.html',
  styleUrl: './reviews-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewsFormComponent {
  private fb = inject(FormBuilder);
  private reviewsService = inject(ReviewsService);

  finished = output<void>();

  formStatus = signal<FormStatus>({ loading: false });

  stars = [1, 2, 3, 4, 5];
  hoveredRating = signal(0);

  form = this.fb.nonNullable.group({
    fullName: [''],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required]],
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
  });

  get currentRating(): number {
    return this.form.get('rating')?.value || 0;
  }

  setRating(rating: number): void {
    const clampedRating = Math.max(1, Math.min(5, rating));
    this.form.get('rating')?.setValue(clampedRating);
    this.form.get('rating')?.markAsTouched();
    this.form.get('rating')?.markAsDirty();
  }

  setHovered(star: number): void {
    this.hoveredRating.set(star);
  }

  clearHovered(): void {
    this.hoveredRating.set(0);
  }

  backToReviews(): void {
    this.formStatus.set({ loading: false });
    this.finished.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formStatus.set({ loading: true });

    const review: ReviewInquiry = {
      ...this.form.value,
      creationDate: new Date().toISOString(),
      origin: 'nomacoda_portfolio'
    } as ReviewInquiry;

    this.reviewsService.sendReview(review).subscribe({
      next: () => {
        this.formStatus.set({
          loading: false,
          success: 'REVIEWS.FORM_SUCCESS'
        });
        this.form.reset({ fullName: '', email: '', message: '', rating: 0 });
        this.hoveredRating.set(0);
      },
      error: () => {
        this.formStatus.set({
          loading: false,
          error: 'FORM.FORM_ERROR'
        });
      }
    });
  }

  invalid(property: string): boolean | undefined {
    return this.form.get(property)?.invalid && this.form.get(property)?.touched;
  }
}
