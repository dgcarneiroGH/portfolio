import { CommonModule } from '@angular/common';
import { Component, Input, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewsFormComponent } from './reviews-form/reviews-form.component';
import { AnimateDirective } from '../../../shared/directives/animate.directive';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReviewsFormComponent,
    AnimateDirective
  ],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent {
  @Input() navigate!: () => void;
  @ViewChild(ReviewsFormComponent) reviewsForm!: ReviewsFormComponent;

  private _animationDelay = signal(3000);
  animationDelay = this._animationDelay.asReadonly();
}
