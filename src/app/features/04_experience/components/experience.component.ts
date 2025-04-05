import { Component, OnInit } from '@angular/core';
import { AnimateComponent } from 'src/app/core/components/animate/animate.component';
import { TimelineDirective } from '../../../directives/timeline.directive';
import { EXPERIENCES } from '../constants/experience.constants';
import { Experience } from '../interfaces/experience.interface';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [TimelineDirective],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent extends AnimateComponent implements OnInit {
  experience: Experience[] = EXPERIENCES;

  ngOnInit(): void {
    //Added to avoid errors on show cards
    window.scrollTo({ top: 10, behavior: 'smooth' });
  }
}
