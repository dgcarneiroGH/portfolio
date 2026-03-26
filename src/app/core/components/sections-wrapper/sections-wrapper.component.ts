import { CommonModule } from '@angular/common';
import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AboutComponent } from '../../../features/about/components/about.component';
import { ContactComponent } from '../../../features/contact/components/contact.component';
import { ExperienceComponent } from '../../../features/experience/components/experience.component';
import { HomeComponent } from '../../../features/home/components/home.component';
import { ProjectsComponent } from '../../../features/projects/components/projects.component';
import { ReviewsComponent } from '../../../features/reviews/components/reviews.component';

@Component({
  selector: 'app-sections-wrapper',
  standalone: true,
  imports: [
    HomeComponent,
    AboutComponent,
    ExperienceComponent,
    ContactComponent,
    ProjectsComponent,
    ReviewsComponent,
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './sections-wrapper.component.html',
  styleUrls: ['./sections-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionsWrapperComponent {
  private _actualYear = signal(new Date().getFullYear());
  actualYear = this._actualYear.asReadonly();

  activeSlide = signal(0);

  goToSlide(target: number) {
    const direction = target > this.activeSlide() ? 'forward' : 'backward';
    document.documentElement.setAttribute('data-slide-dir', direction);

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(() => {
        this.activeSlide.set(target);
      });
    } else {
      this.activeSlide.set(target);
    }

    setTimeout(() => {
      document.documentElement.removeAttribute('data-slide-dir');
    }, 400);
  }
}
