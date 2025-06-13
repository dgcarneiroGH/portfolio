import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AnimateDirective } from 'src/app/shared/directives/animate.directive';
import { ParallaxHeaderDirective } from 'src/app/shared/directives/parallax-header.directive';
import { EXPERIENCES } from '../constants/experience.constants';
import { TimelineDirective } from '../directives/timeline.directive';
import { Experience } from '../interfaces/experience.interface';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [
    TimelineDirective,
    TranslateModule,
    AnimateDirective,
    ParallaxHeaderDirective
  ],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent implements OnInit {
  experience: Experience[] = EXPERIENCES;

  ngOnInit(): void {
    //Added to avoid errors on show cards
    window.scrollTo({ top: 15, behavior: 'smooth' });
  }
}
