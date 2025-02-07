import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill.component.html',
  styleUrl: './skill.component.scss'
})
export class SkillComponent {
  @Input() progress!: number;
  @Input() text!: string;
  @Input() years!: number;
  @Input() logoSrc!: string;

  currentStrokeDasharray = '0 200';
  isProgressVisible = false;

  get strokeDasharray(): string {
    const radius = 50;
    const circumference = Math.PI * radius;
    const progressLength = (this.progress / 100) * circumference;
    return `${progressLength} ${circumference - progressLength}`;
  }

  get experienceText(): string {
    return `${this.years} ${this.years === 1 ? 'año' : 'años'}`;
  }

  showProgress() {
    this.isProgressVisible = !this.isProgressVisible;

    setTimeout(() => {
      this.currentStrokeDasharray = this.strokeDasharray;
    }, 300);
  }
}
