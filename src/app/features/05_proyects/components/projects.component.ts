import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AnimateComponent } from 'src/app/core/components/animate/animate.component';
import { PROJECTS } from '../constants/projects.constants';
import { Project } from '../interfaces/project.interface';
import { ProjectComponent } from './project/project.component';

@Component({
  standalone: true,
  selector: 'app-projects',
  imports: [ProjectComponent, TranslateModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent extends AnimateComponent {
  projects: Project[] = PROJECTS.sort((a, b) => b.year - a.year);
}
