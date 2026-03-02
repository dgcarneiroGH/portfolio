import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appKeyboardActivation]',
  standalone: true
})
export class KeyboardActivationDirective {
  @Output() appKeyboardActivation = new EventEmitter<KeyboardEvent>();

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Enter or Space activates the element
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      this.appKeyboardActivation.emit(event);
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    // Emit the same event for mouse clicks to unify handling
    this.appKeyboardActivation.emit(event as any);
  }
}
