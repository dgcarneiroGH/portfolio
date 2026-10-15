import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { REVIEWS } from '../constants/reviews.const';
import { Review } from '../interfaces/review.interface';
import { ReviewCardComponent } from './review-card/review-card.component';
import { ReviewsFormComponent } from './reviews-form/reviews-form.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [TranslateModule, ReviewCardComponent, ReviewsFormComponent],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewsComponent {
  reviews = input<Review[]>(REVIEWS);

  view = signal<'list' | 'form'>('list');

  openForm(): void {
    this.view.set('form');
  }

  backToList(): void {
    this.view.set('list');
  }
}
