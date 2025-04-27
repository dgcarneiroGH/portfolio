import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  Input,
  Renderer2
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Blast from 'blast-vanilla';

@Directive({
  selector: '[appAnimate]',
  standalone: true
})
export class AnimateDirective implements AfterViewInit {
  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private _translate = inject(TranslateService);

  @Input('appAnimate') animationDelay: number = 1500;
  @Input() translationKey?: string;

  ngAfterViewInit(): void {
    const element = this.el.nativeElement;

    if (!element) return;

    if (this.translationKey) {
      // Si tenemos una clave de traducción, usamos el servicio de traducción
      this._translate.get(this.translationKey).subscribe((translatedText) => {
        if (translatedText) {
          element.innerHTML = translatedText;
          this._runBlastLogic(element);
        }
      });

      this._translate.onLangChange.subscribe(() => {
        this._translate
          .get(this.translationKey!)
          .subscribe((translatedText) => {
            if (translatedText) {
              element.innerHTML = translatedText;
              this._runBlastLogic(element);
            }
          });
      });
    } else {
      // Si no hay clave de traducción, usamos el texto original
      const originalText = element.textContent;
      if (originalText) {
        element.innerHTML = originalText;
        this._runBlastLogic(element);
      }
    }
  }

  private _runBlastLogic(element: HTMLElement) {
    const isParagraphWithWords =
      element.tagName.toLowerCase() === 'p' && element.id === 'animatedText';

    // Aplica Blast
    new Blast(element, {
      returnGenerated: true,
      delimiter: isParagraphWithWords ? 'word' : 'character',
      tag: 'span',
      customClass: '',
      aria: true
    });

    this.animateElements(element.children, isParagraphWithWords);
  }

  private animateElements(elements: HTMLCollection, byWord: boolean): void {
    let timer = 0;

    Array.from(elements).forEach((element) => {
      setTimeout(() => {
        this.renderer.addClass(element, 'animated');
        this.renderer.addClass(element, 'bounceIn');
      }, timer);

      timer += byWord ? 300 : 100;

      setTimeout(() => {
        this.renderer.removeClass(element, 'animated');
        this.renderer.removeClass(element, 'bounceIn');
        this.renderer.setStyle(element, 'opacity', 1);

        // Hover animaciones
        element.addEventListener('mouseenter', () => {
          this.renderer.addClass(element, 'animated');
          this.renderer.addClass(element, 'rubberBand');
        });
        element.addEventListener('mouseleave', () => {
          this.renderer.removeClass(element, 'animated');
          this.renderer.removeClass(element, 'rubberBand');
        });
      }, this.animationDelay);
    });
  }
}
