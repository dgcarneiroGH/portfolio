import { OnInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AnimateComponent } from '../../animate/animate.component';
import { ISkills } from '../../../interfaces';
import { SKILLS } from '../../../constants';
import { AbilityComponent } from '../../shared/ability/ability.component';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [ AbilityComponent],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent extends AnimateComponent implements OnInit {
  override animationDelay = 2000;
  @ViewChild('experience') experience!: ElementRef;
  isMakisuOpen: boolean = true;
  override showMakisus: boolean = true;
  skills: ISkills = SKILLS;
  startingYear: number = 2021;
  yearsOfExperience!: number;

  ngOnInit(): void {
    this.yearsOfExperience = new Date().getFullYear() - this.startingYear;
  }

  toggleExperience() {
    this.isMakisuOpen = !this.isMakisuOpen;
    if (this.isMakisuOpen) {
      this.renderer.removeClass(this.experience.nativeElement, 'fade-in');
      this.renderer.addClass(this.experience.nativeElement, 'fade-out');
    } else {
      this.renderer.addClass(this.experience.nativeElement, 'fade-in');
      this.renderer.removeClass(this.experience.nativeElement, 'fade-out');
    }
  }
}
