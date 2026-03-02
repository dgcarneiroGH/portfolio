import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFocusable]',
  standalone: true
})
export class FocusableDirective implements OnInit {
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const element = this.elementRef.nativeElement;

    // Make element focusable if it's not already
    if (
      !element.hasAttribute('tabindex') &&
      !['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)
    ) {
      this.renderer.setAttribute(element, 'tabindex', '0');
    }

    // Add role if needed
    if (
      !element.hasAttribute('role') &&
      !['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)
    ) {
      this.renderer.setAttribute(element, 'role', 'button');
    }
  }
}
