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
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly translate = inject(TranslateService);

  @Input('appAnimate') animationDelay!: number;
  @Input() translationKey!: string;

  ngAfterViewInit(): void {
    const element = this.el.nativeElement;
    if (!element) return;

    this._initializeText(element);
  }

  private _initializeText(element: HTMLElement): void {
    this.translate.get(this.translationKey!).subscribe((text) => {
      if (text) {
        element.innerHTML = text;
        this._animateText(element);
      }
    });

    this.translate.onLangChange.subscribe(() => {
      this.translate.get(this.translationKey!).subscribe((text) => {
        if (text) {
          element.innerHTML = text;
          this._animateText(element);
        }
      });
    });
  }

  private _animateText(element: HTMLElement): void {
    const isParagraphWithWords = element.tagName.toLowerCase() === 'p';

    this._applyBlastAnimation(element, isParagraphWithWords);
    this._animateElements(element.children, isParagraphWithWords);
  }

  private _applyBlastAnimation(
    element: HTMLElement,
    isParagraphWithWords: boolean
  ): void {
    new Blast(element, {
      returnGenerated: true,
      delimiter: isParagraphWithWords ? 'word' : 'character',
      tag: 'span',
      customClass: '',
      aria: true
    });
  }

  private _animateElements(elements: HTMLCollection, byWord: boolean): void {
    let timer = 0;

    Array.from(elements).forEach((element) => {
      this._addInitialAnimation(element, timer);
      timer += byWord ? 300 : 100;

      this._addFinalAnimation(element);
    });
  }

  private _addInitialAnimation(element: Element, timer: number): void {
    setTimeout(() => {
      this.renderer.addClass(element, 'animated');
      this.renderer.addClass(element, 'bounceIn');
    }, timer);
  }

  private _addFinalAnimation(element: Element): void {
    setTimeout(() => {
      this._removeInitialAnimation(element);
      this._addHoverAnimation(element);
    }, this.animationDelay);
  }

  private _removeInitialAnimation(element: Element): void {
    this.renderer.removeClass(element, 'animated');
    this.renderer.removeClass(element, 'bounceIn');
    this.renderer.setStyle(element, 'opacity', 1);
  }

  private _addHoverAnimation(element: Element): void {
    element.addEventListener('mouseenter', () => {
      this.renderer.addClass(element, 'animated');
      this.renderer.addClass(element, 'rubberBand');
    });

    element.addEventListener('mouseleave', () => {
      this.renderer.removeClass(element, 'animated');
      this.renderer.removeClass(element, 'rubberBand');
    });
  }
}
