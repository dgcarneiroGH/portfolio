import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SKILLS } from '../../constants/skills.constants';
import { Skill } from '../../interfaces/skill.interface';

@Component({
  selector: 'app-skills',
  standalone: true,
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  imports: [TranslateModule]
})
export class SkillsComponent {
  readonly skills: Skill[] = SKILLS;
}
