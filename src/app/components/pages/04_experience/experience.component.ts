import { Component, OnInit } from '@angular/core';
import { EXPERIENCES } from '../../../constants';
import { TimelineDirective } from '../../../directives/timeline.directive';
import { IExperience } from '../../../interfaces';
import { AnimateComponent } from '../../animate/animate.component';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [TimelineDirective],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent extends AnimateComponent implements OnInit {
  experience: IExperience[] = EXPERIENCES;

  ngOnInit(): void {
    //Added to avoid errors on show cards
    window.scrollTo({ top: 10, behavior: 'smooth' });
  }
}
