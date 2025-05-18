import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AnimateDirective } from 'src/app/shared/directives/animate.directive';
import { PROJECTS } from '../constants/projects.constants';
import { Project } from '../interfaces/project.interface';
import { ProjectComponent } from './project/project.component';

@Component({
  standalone: true,
  selector: 'app-projects',
  imports: [ProjectComponent, TranslateModule, AnimateDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  projects: Project[] = PROJECTS.sort((a, b) => b.year - a.year);
}
