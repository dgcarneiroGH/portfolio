import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  // Selector de atributo sobre <li> a propósito: dentro de <ul> solo se admite
  // <li> como hijo; un selector de elemento rompería la semántica de la lista
  // (a11y). Excepción documentada a la regla component-selector.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[app-tech-pill]',
  standalone: true,
  styleUrl: './tech-pill.component.scss',
  template: `{{ label() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechPillComponent {
  label = input.required<string>();
}
