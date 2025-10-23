import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ContactComponent } from '../../../features/contact/components/contact.component';
import { ExperienceComponent } from '../../../features/experience/components/experience.component';
import { HomeComponent } from '../../../features/home/components/home.component';
import { AboutComponent } from '../../../features/about/components/about.component';
import { ProjectsComponent } from '../../../features/projects/components/projects.component';
import { LazyLoadContainerComponent } from '../../../shared/components/lazy-load-container/lazy-load-container.component';

@Component({
  selector: 'app-sections-wrapper',
  standalone: true,
  imports: [
    HomeComponent,
    AboutComponent,
    ExperienceComponent,
    ContactComponent,
    ProjectsComponent,
    CommonModule,
    LazyLoadContainerComponent
  ],
  templateUrl: './sections-wrapper.component.html',
  styleUrls: ['./sections-wrapper.component.scss']
})
export class SectionsWrapperComponent {
  actualYear: number = new Date().getFullYear();
}
