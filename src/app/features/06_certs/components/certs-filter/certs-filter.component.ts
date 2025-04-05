import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CertFilter,
  CertFilterItem
} from 'src/app/features/06_certs/interfaces/certs.interface';
import { ToggleButtonComponent } from '../../../../shared/components/toggle-button/toggle-button.component';

@Component({
  selector: 'app-certs-filter',
  standalone: true,
  imports: [ToggleButtonComponent, CommonModule],
  templateUrl: './certs-filter.component.html',
  styleUrl: './certs-filter.component.scss'
})
export class CertsFilterComponent {
  showOptions = false;

  @Input() filterParams!: CertFilter[];
  @Output() filter: EventEmitter<void> = new EventEmitter<void>();

  check(selected: boolean, item: CertFilterItem) {
    item.selected = selected;
    this.filter.emit();
  }
}
