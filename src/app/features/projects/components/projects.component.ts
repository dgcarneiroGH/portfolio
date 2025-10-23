import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PROJECTS } from '../constants/projects.constants';
import { Project } from '../interfaces/project.interface';
import { ProjectComponent } from './project/project.component';
import { ParallaxHeaderDirective } from '../../../shared/directives/parallax-header.directive';

@Component({
  standalone: true,
  selector: 'app-projects',
  imports: [ProjectComponent, TranslateModule, ParallaxHeaderDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  projects: Project[] = PROJECTS.sort((a, b) => b.year - a.year);
  expandedIndex: number | null = null;

  onExpandRequest(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}
