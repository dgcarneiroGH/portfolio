import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { HomeComponent } from 'src/app/features/01_home/components/home.component';
import { AboutComponent } from 'src/app/features/02_about/components/about.component';
import { SkillsComponent } from 'src/app/features/03_skills/components/skills.component';
import { ProjectsComponent } from 'src/app/features/05_projects/components/projects.component';
import { CertsComponent } from 'src/app/features/06_certs/components/certs.component';
import { ExperienceComponent } from '../../../features/04_experience/components/experience.component';
import { ContactComponent } from '../../../features/07_contact/components/contact.component';
import { DynamicScriptService } from '../../services/dynamic-script.service';

@Component({
  selector: 'app-sections-wrapper',
  imports: [
    HomeComponent,
    AboutComponent,
    SkillsComponent,
    ExperienceComponent,
    ContactComponent,
    ProjectsComponent,
    CertsComponent
  ],
  templateUrl: './sections-wrapper.component.html',
  styleUrl: './sections-wrapper.component.scss'
})
export class SectionsWrapperComponent implements OnInit, OnDestroy {
  private dsService = inject(DynamicScriptService);

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  screenHeight!: number;
  screenWidth!: number;

  ngOnInit(): void {
    this.getScreenSize();

    if (this.screenWidth > 768) {
      this.dsService
        .load('oscillator')
        .then(() => {
          this.oscillate(false);
        })
        .catch((error) => console.log(error));
    }
  }

  oscillate(value: boolean) {
    (window as any).initOscillator(value);
  }

  ngOnDestroy(): void {
    // Remove all the event listeners oscillating in background.
    if (typeof (window as any).initOscillator !== 'undefined') {
      this.oscillate(true);
    }
  }
}
