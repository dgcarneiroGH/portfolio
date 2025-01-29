import { OnInit, Component } from '@angular/core';
import { AnimateComponent } from '../../animate/animate.component';
import { ISkill } from '../../../interfaces';
import { SKILLS } from '../../../constants';
import { AbilityComponent } from '../../shared/ability/ability.component';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [AbilityComponent],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent extends AnimateComponent implements OnInit {
  override animationDelay = 2000;
  // @ViewChild('experience') experience!: ElementRef;
  // isMakisuOpen: boolean = true;
  // override showMakisus: boolean = true;
  skills: ISkill[] = SKILLS;
  startingYear = 2021;
  totalYearsOfExperience!: number;

  ngOnInit(): void {
    this.totalYearsOfExperience = new Date().getFullYear() - this.startingYear;
  }

  public calcProgress(yearsOfExp: number) {
    if (this.totalYearsOfExperience === 0) return 0;
    return Math.round((yearsOfExp / this.totalYearsOfExperience) * 100);
  }

  // toggleExperience() {
  //   this.isMakisuOpen = !this.isMakisuOpen;
  //   if (this.isMakisuOpen) {
  //     this.renderer.removeClass(this.experience.nativeElement, 'fade-in');
  //     this.renderer.addClass(this.experience.nativeElement, 'fade-out');
  //   } else {
  //     this.renderer.addClass(this.experience.nativeElement, 'fade-in');
  //     this.renderer.removeClass(this.experience.nativeElement, 'fade-out');
  //   }
  // }
}
