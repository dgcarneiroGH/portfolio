import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'li[app-tech-pill]',
  standalone: true,
  styleUrl: './tech-pill.component.scss',
  template: `{{ label() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechPillComponent {
  label = input.required<string>();
}
