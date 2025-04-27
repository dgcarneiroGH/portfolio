import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AnimateDirective } from 'src/app/shared/directives/animate.directive';

@Component({
  selector: 'app-skill',
  standalone: true,
  imports: [CommonModule, AnimateDirective],
  templateUrl: './skill.component.html',
  styleUrl: './skill.component.scss'
})
export class SkillComponent {
  @Input() progress!: number;
  @Input() text!: string;
  @Input() years!: number;
  @Input() logoSrc!: string;

  private _showProgressBar = false;
  @Input()
  get showProgressBar(): boolean {
    return this._showProgressBar;
  }
  set showProgressBar(value: boolean) {
    this._showProgressBar = value;

    if (value)
      setTimeout(() => {
        this.currentStrokeDasharray = this.strokeDasharray;
      }, 300);
  }

  currentStrokeDasharray = '0 200';

  get strokeDasharray(): string {
    const radius = 50;
    const circumference = Math.PI * radius;
    const progressLength = (this.progress / 100) * circumference;
    return `${progressLength} ${circumference - progressLength}`;
  }

  get experienceText(): string {
    return `${this.years} ${this.years === 1 ? 'año' : 'años'}`;
  }

  toggleProgress(): void {
    this.showProgressBar = !this.showProgressBar;
  }
}
