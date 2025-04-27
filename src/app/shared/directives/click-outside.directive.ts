import {
  Directive,
  ElementRef,
  EventEmitter,
  inject,
  Output
} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  private elementRef = inject(ElementRef);

  @Output() appClickOutside = new EventEmitter<void>();

  constructor() {
    document.addEventListener('click', (event: MouseEvent) => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.appClickOutside.emit();
      }
    });
  }
}
