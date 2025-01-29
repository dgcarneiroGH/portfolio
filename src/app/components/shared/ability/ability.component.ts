import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ability',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ability.component.html',
  styleUrl: './ability.component.scss'
})
export class AbilityComponent {
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
    console.log('this.isProgressVisible', this.isProgressVisible);

    setTimeout(() => {
      this.currentStrokeDasharray = this.strokeDasharray;
    }, 300);
  }
}
