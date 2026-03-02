import { Component, signal, computed } from '@angular/core';
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
  private _projects = signal<Project[]>(
    PROJECTS.sort((a, b) => b.year - a.year)
  );
  private _expandedIndex = signal<number | null>(null);

  projects = this._projects.asReadonly();
  expandedIndex = this._expandedIndex.asReadonly();

  hasExpandedProject = computed(() => this._expandedIndex() !== null);

  onExpandRequest(index: number): void {
    this._expandedIndex.set(this._expandedIndex() === index ? null : index);
  }
}
