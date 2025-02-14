import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToggleButtonComponent } from '../toggle-button/toggle-button.component';
import { CommonModule } from '@angular/common';
import { ICertFilter, ICertFilterItem } from 'src/app/interfaces';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [ToggleButtonComponent, CommonModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent {
  showOptions = false;

  @Input() filterParams!: ICertFilter[];
  @Output() filter: EventEmitter<void> = new EventEmitter<void>();

  check(selected: boolean, item: ICertFilterItem) {
    item.selected = selected;
    this.filter.emit();
  }
}
