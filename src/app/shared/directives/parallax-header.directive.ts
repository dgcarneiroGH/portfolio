import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appParallaxHeader]',
  standalone: true
})
export class ParallaxHeaderDirective implements OnInit {
  @Input() parallaxContent?: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.onWindowScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const section = this.el.nativeElement.parentElement as HTMLElement;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const activationThreshold = windowHeight * 0.4;

    if (
      rect.top > activationThreshold ||
      rect.bottom <= 0 ||
      rect.top >= windowHeight
    ) {
      this.setStyles(this.el.nativeElement, {
        opacity: 0,
        pointerEvents: 'none'
      });
      if (this.parallaxContent)
        this.setStyles(this.parallaxContent, {
          opacity: 0,
          pointerEvents: 'none'
        });
      return;
    }

    const top = rect.top;
    let progress = 0;
    if (top < 0) progress = Math.min(Math.abs(top) / windowHeight, 1);

    this.setStyles(this.el.nativeElement, {
      position: 'fixed',
      left: 0,
      width: '100%',
      top: `calc(70vh - ${progress * 35}vh)`,
      transform: `translateY(-70vh) scale(${2 - progress})`,
      opacity: `${1 - progress * 0.2}`,
      pointerEvents: 'none',
      zIndex: 10,
      transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)'
    });

    if (this.parallaxContent) {
      this.setStyles(this.parallaxContent, {
        opacity: `${progress}`,
        pointerEvents: progress > 0.05 ? 'auto' : 'none',
        transition: 'opacity 0.3s cubic-bezier(0.4,0,0.2,1)'
      });
    }
  }

  private setStyles(
    element: HTMLElement,
    styles: { [key: string]: string | number }
  ) {
    for (const key in styles) {
      this.renderer.setStyle(element, key, styles[key]);
    }
  }
}
