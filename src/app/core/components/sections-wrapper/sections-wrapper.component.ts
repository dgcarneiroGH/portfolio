import { Component } from '@angular/core';
import { HomeComponent } from 'src/app/features/01_home/components/home.component';
import { AboutComponent } from 'src/app/features/02_about/components/about.component';
import { SkillsComponent } from 'src/app/features/03_skills/components/skills.component';
import { ProjectsComponent } from 'src/app/features/05_projects/components/projects.component';
import { CertsComponent } from 'src/app/features/06_certs/components/certs.component';
import { OscillatorComponent } from 'src/app/shared/components/oscillator/oscillator.component';
import { ExperienceComponent } from '../../../features/04_experience/components/experience.component';
import { ContactComponent } from '../../../features/07_contact/components/contact.component';

@Component({
  selector: 'app-sections-wrapper',
  imports: [
    HomeComponent,
    AboutComponent,
    SkillsComponent,
    ExperienceComponent,
    ContactComponent,
    ProjectsComponent,
    CertsComponent,
    OscillatorComponent
  ],
  templateUrl: './sections-wrapper.component.html',
  styleUrl: './sections-wrapper.component.scss'
})
export class SectionsWrapperComponent {}
