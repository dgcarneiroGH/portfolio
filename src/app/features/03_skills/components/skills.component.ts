import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AnimateComponent } from 'src/app/core/components/animate/animate.component';
import { SkillComponent } from 'src/app/features/03_skills/components/skill/skill.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { SKILLS } from '../constants/skills.constants';
import { Skill } from '../interfaces/skills.interface';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [SkillComponent, ToggleButtonComponent, TranslateModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent extends AnimateComponent implements OnInit {
  override animationDelay = 2000;

  showAllProgressBars = false;

  skills: Skill[] = SKILLS.sort(
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
