import { Component } from '@angular/core';
import { AnimateComponent } from '../animate/animate.component';
import { EXPERIENCES } from '../../constants';
import { IExperience } from '../../interfaces';
import { TimelineDirective } from '../../directives/timeline.directive';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [TimelineDirective],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent extends AnimateComponent {
  experience: IExperience[] = EXPERIENCES;
}
