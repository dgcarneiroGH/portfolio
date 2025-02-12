import { Component } from '@angular/core';
import { ToggleButtonComponent } from '../toggle-button/toggle-button.component';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [ToggleButtonComponent],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent {
  filterParams = [
    {
      id: 'platform',
      label: 'Plataforma',
      items: [
        { label: 'Udemy', id: 'udemy' },
        { label: 'Scrum.org', id: 'scrum' }
      ]
    },
    {
      id: 'tech',
      label: 'Lenguaje',
      items: [
        { label: 'Angular', id: 'angular' },
        { label: 'React', id: 'react' },
        { label: 'Unreal Engine', id: 'unreal' },
        { label: 'Flutter', id: 'scrum' }
      ]
    }
  ];

  check(event: Event, paramId: string, itemId: string) {
    console.log({ event });
    console.log({ paramId });
    console.log({ itemId });
  }
}
