import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface ReviewFormData {
  fullName?: string;
  email: string;
  message: string;
  rating: number;
}

@Component({
  selector: 'app-reviews-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './reviews-form.component.html',
  styleUrls: ['./reviews-form.component.scss']
})
export class ReviewsFormComponent {
  form: FormGroup;
  submitted = output<ReviewFormData>();

  stars = [1, 2, 3, 4, 5];
  hoveredRating = signal(0);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fullName: [''],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]],
      rating: [0, [Validators.max(5)]],
    });
  }

  setRating(rating: number): void {
    if (rating < 1) rating = 1;
    if (rating > 5) rating = 5;
    this.form.get('rating')?.setValue(rating);
    this.form.get('rating')?.markAsTouched();
    this.form.get('rating')?.markAsDirty();
  }

  setHovered(star: number): void {
    this.hoveredRating.set(star);
  }

  clearHovered(): void {
    this.hoveredRating.set(0);
  }

  submit(): void {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
      this.form.reset({ rating: 0 }); 
    } else {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
    }
  }

  invalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
