import { CommonModule } from '@angular/common';
import { Component, input, signal, computed, effect } from '@angular/core';
import { AnimateDirective } from '../../../../shared/directives/animate.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-skill',
  standalone: true,
  imports: [CommonModule, AnimateDirective, TranslateModule],
  templateUrl: './skill.component.html',
  styleUrl: './skill.component.scss'
})
export class SkillComponent {
  progress = input.required<number>();
  text = input.required<string>();
  years = input.required<number>();
  logoSrc = input.required<string>();
  altKey = input.required<string>();
  showProgressBar = input<boolean>(false);

  private _currentStrokeDasharray = signal('0 200');
  currentStrokeDasharray = this._currentStrokeDasharray.asReadonly();

  constructor() {
    effect(() => {
      if (this.showProgressBar()) {
        setTimeout(() => {
          this._currentStrokeDasharray.set(this.strokeDasharray());
        }, 300);
      }
    });
  }

  strokeDasharray = computed(() => {
    const radius = 50;
    const circumference = Math.PI * radius;
    const progressLength = (this.progress() / 100) * circumference;
    return `${progressLength} ${circumference - progressLength}`;
  });

  experienceText = computed(() => {
    const years = this.years();
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  });

  toggleProgress(): void {
    // Como showProgressBar ahora es un input, no podemos modificarlo
    // Este método podría emitir un evento al padre si fuera necesario
    console.log(
      'Toggle requested, but showProgressBar is now controlled by parent'
    );
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleProgress();
    }
  }
}
