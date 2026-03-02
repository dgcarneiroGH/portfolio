import { Component, OnInit, signal, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SKILLS } from '../constants/skills.constants';
import { Skill } from '../interfaces/skills.interface';
import { SkillComponent } from './skill/skill.component';
import { ToggleButtonComponent } from '../../../shared/components/toggle-button/toggle-button.component';
import { ParallaxHeaderDirective } from '../../../shared/directives/parallax-header.directive';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [
    SkillComponent,
    ToggleButtonComponent,
    TranslateModule,
    ParallaxHeaderDirective
  ],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent {
  private _showAllProgressBars = signal(false);
  private _skills = signal<Skill[]>(
    SKILLS.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience)
  );
  private _startingYear = signal(2021);

  showAllProgressBars = this._showAllProgressBars.asReadonly();
  skills = this._skills.asReadonly();
  startingYear = this._startingYear.asReadonly();

  totalYearsOfExperience = computed(() => {
    return new Date().getFullYear() - this._startingYear();
  });

  skillsWithProgress = computed(() => {
    const total = this.totalYearsOfExperience();
    return this._skills().map((skill) => ({
      ...skill,
      progress:
        total === 0 ? 0 : Math.round((skill.yearsOfExperience / total) * 100)
    }));
  });

  public calcProgress(yearsOfExp: number): number {
    const total = this.totalYearsOfExperience();
    if (total === 0) return 0;
    return Math.round((yearsOfExp / total) * 100);
  }

  public showAll(show: boolean): void {
    this._showAllProgressBars.set(show);
  }
}
