import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Review } from '../../interfaces/review.interface';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewCardComponent {
  review = input.required<Review>();

  stars = [1, 2, 3, 4, 5];

  variant = computed(() => this.review().variant ?? 'teal');

  isLit(star: number): boolean {
    return this.review().rating >= star;
  }
}
