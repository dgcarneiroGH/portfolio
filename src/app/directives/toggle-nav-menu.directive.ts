import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appToggleNavMenu]',
  standalone: true
})
export class ToggleNavMenuDirective {
  @Input('customClassName') className!: string;

  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  @HostListener('click') onClick() {
    if (this.elementRef.nativeElement.classList.contains(this.className)) {
      this.renderer.removeClass(this.elementRef.nativeElement, this.className);
    } else {
      this.renderer.addClass(this.elementRef.nativeElement, this.className);
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.elementRef.nativeElement.classList.contains(this.className)) {
      this.renderer.removeClass(this.elementRef.nativeElement, this.className);
    }
  }
}
