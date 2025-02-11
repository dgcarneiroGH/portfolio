import { CommonModule, NgIf, UpperCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toggle-button',
  standalone: true,
  imports: [FormsModule, UpperCasePipe, CommonModule],
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})
export class ToggleButtonComponent {
  @Input() isChecked = false;
  @Input() label = '';
  //#region styles
  //TODO: En lugar de esto, el input indicará si pertenece a un filtro y hará todos los cambios de estilo necesarios
  @Input() toggleHeight = '34px';
  @Input() sliderHeight = '26px';
  @Input() textLeft = false;
  //#endregion
  @Output() check: EventEmitter<any> = new EventEmitter<any>();

  toggle(event: Event) {
    this.check.emit(event);
  }
}
