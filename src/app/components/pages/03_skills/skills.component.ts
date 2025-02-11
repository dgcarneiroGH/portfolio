import { OnInit, Component } from '@angular/core';
import { AnimateComponent } from '../../animate/animate.component';
import { ISkill } from '../../../interfaces';
import { SKILLS } from '../../../constants';
import { SkillComponent } from '../../shared/skill/skill.component';
import { ToggleButtonComponent } from '../../shared/toggle-button/toggle-button.component';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [SkillComponent, ToggleButtonComponent],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent extends AnimateComponent implements OnInit {
  override animationDelay = 2000;

  showAllProgressBars = false;

  skills: ISkill[] = SKILLS.sort(
    (a, b) => b.yearsOfExperience - a.yearsOfExperience
  );
  startingYear = 2021;
  totalYearsOfExperience!: number;

  ngOnInit(): void {
    this.totalYearsOfExperience = new Date().getFullYear() - this.startingYear;
  }

  public calcProgress(yearsOfExp: number) {
    if (this.totalYearsOfExperience === 0) return 0;
    return Math.round((yearsOfExp / this.totalYearsOfExperience) * 100);
  }

  public showAll(show: boolean) {
    this.showAllProgressBars = show;
  }
}
