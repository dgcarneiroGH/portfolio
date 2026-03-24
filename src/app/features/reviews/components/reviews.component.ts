import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewFormData, ReviewsFormComponent } from './reviews-form/reviews-form.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReviewsFormComponent],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent {
  status = signal<'idle' | 'loading' | 'success'>('idle');

  onSubmit(data: ReviewFormData): void {
    this.status.set('loading');
    // Fake API Call
    setTimeout(() => {
      this.status.set('success');
    }, 1000);
  }
}
