import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
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
  styleUrls: ['./sections-wrapper.component.scss']
})
export class SectionsWrapperComponent {
  private _actualYear = signal(new Date().getFullYear());
  actualYear = this._actualYear.asReadonly();
}
