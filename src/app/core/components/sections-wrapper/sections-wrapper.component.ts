import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AboutComponent } from 'src/app/features/about/components/about.component';
import { CertsComponent } from 'src/app/features/certs/components/certs.component';
import { HomeComponent } from 'src/app/features/home/components/home.component';
import { ProjectsComponent } from 'src/app/features/projects/components/projects.component';
import { SkillsComponent } from 'src/app/features/skills/components/skills.component';
import { LazyLoadContainerComponent } from 'src/app/shared/components/lazy-load-container/lazy-load-container.component';
import { ContactComponent } from '../../../features/contact/components/contact.component';
import { ExperienceComponent } from '../../../features/experience/components/experience.component';

@Component({
  selector: 'app-sections-wrapper',
  standalone: true,
  imports: [
    HomeComponent,
    AboutComponent,
    SkillsComponent,
    ExperienceComponent,
    ContactComponent,
    ProjectsComponent,
    CertsComponent,
    CommonModule,
    LazyLoadContainerComponent
  ],
  templateUrl: './sections-wrapper.component.html',
  styleUrls: ['./sections-wrapper.component.scss']
})
export class SectionsWrapperComponent {
  actualYear: number = new Date().getFullYear();
}
