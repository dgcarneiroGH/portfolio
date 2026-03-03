import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-toggle-button',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})
export class ToggleButtonComponent {
  isChecked = input(false);
  label = input('');
  filterMode = input(false);

  check = output<boolean>();

  toggle(selected: boolean): void {
    this.check.emit(selected);
  }
}
