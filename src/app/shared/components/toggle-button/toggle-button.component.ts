import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toggle-button',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})
export class ToggleButtonComponent {
  @Input() isChecked = false;
  @Input() label = '';
  @Input() filterMode = false;

  @Output() check: EventEmitter<boolean> = new EventEmitter<boolean>();

  toggle(selected: boolean) {
    this.check.emit(selected);
  }
}
