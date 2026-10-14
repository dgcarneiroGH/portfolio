import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewsFormComponent } from './reviews-form/reviews-form.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReviewsFormComponent    
  ],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent {
  @Input() navigate?: () => void;
  @ViewChild(ReviewsFormComponent) reviewsForm!: ReviewsFormComponent;

  private _router = inject(Router);

  private _animationDelay = signal(3000);
  animationDelay = this._animationDelay.asReadonly();

  goBack(): void {
    if (this.navigate) {
      this.navigate();
    } else {
      this._router.navigate(['/contact']);
    }
  }
}
