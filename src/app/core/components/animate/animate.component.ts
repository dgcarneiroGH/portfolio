import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Renderer2,
  ViewChild
} from '@angular/core';
import Blast from 'blast-vanilla';

@Component({
  selector: 'app-animate',
  standalone: true,
  template: ''
})
export class AnimateComponent implements AfterViewInit {
  animationDelay = 1500;
  document: Document = inject(DOCUMENT);
  renderer = inject(Renderer2);
  // showMakisus = false;
  // @ViewChild('title') titlePieces!: ElementRef;
  @ViewChild('container', { static: false }) container!: ElementRef;

  ngAfterViewInit() {
    const elements = this.document.querySelectorAll('h1, p');

    elements.forEach((element) => {
      const isParagraphWithWords = !!(
        element.tagName.toLowerCase() === 'p' &&
        element.id &&
        element.id === 'animatedText'
      );

      // Configurar Blast para caracteres o palabras
      new Blast(element, {
        returnGenerated: true,
        delimiter: isParagraphWithWords ? 'word' : 'character',
        tag: 'span',
        customClass: '',
        aria: true
      });

      this.animateElements(element.children, isParagraphWithWords);
    });
    // if (this.showMakisus) {
    //   this.loadMakisus();
    // }

    // new Blast('h1', {
    //   returnGenerated: true,
    //   delimiter: 'character',
    //   tag: 'span',
    //   search: false,
    //   customClass: '',
    //   aria: true,
    //   debug: false,
    //   name: 'blast'
    // });

    // let elements: HTMLCollection = this.titlePieces.nativeElement.children;
    // let timer = 0;
    // for (const element of Array.from(elements)) {
    //   if (element.innerHTML === ',') {
    //     this.insertAfter(element, this.document.createElement('br'));
    //   }

    //   setTimeout(() => {
    //     this.renderer.addClass(element, 'animated');
    //     this.renderer.addClass(element, 'bounceIn');
    //   }, timer);

    //   timer += 100;

    //   setTimeout(() => {
    //     this.renderer.removeClass(element, 'animated');
    //     this.renderer.removeClass(element, 'bounceIn');
    //     this.renderer.setStyle(element, 'opacity', 1);
    //     element.addEventListener('mouseenter', () => {
    //       this.renderer.addClass(element, 'animated');
    //       this.renderer.addClass(element, 'rubberBand');
    //     });
    //     element.addEventListener('mouseleave', () => {
    //       this.renderer.removeClass(element, 'animated');
    //       this.renderer.removeClass(element, 'rubberBand');
    //     });
    //   }, this.animationDelay);
    // }
  }

  private animateElements(elements: HTMLCollection, byWord: boolean) {
    let timer = 0;

    Array.from(elements).forEach((element) => {
      setTimeout(() => {
        this.renderer.addClass(element, 'animated');
        this.renderer.addClass(element, 'bounceIn');
      }, timer);

      timer += byWord ? 300 : 100; //More time to animate words

      setTimeout(() => {
        this.renderer.removeClass(element, 'animated');
        this.renderer.removeClass(element, 'bounceIn');
        this.renderer.setStyle(element, 'opacity', 1);

        // Eventos de hover
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

  // insertAfter(referenceNode: Node, newNode: Node): void {
  //   (referenceNode.parentNode as Node).insertBefore(
  //     newNode,
  //     referenceNode.nextSibling
  //   );
  // }

  // loadMakisus() {
  //   const $ = (window as any).jQuery;

  //   if ($.fn.makisu.enabled) {
  //     const $techSkills = $('.tech-skills');
  //     const $mgmtSkills = $('.mgmt-skills');
  //     const $softSkills = $('.soft-skills');

  //     // Create Makisus
  //     $techSkills.makisu({
  //       selector: 'dd',
  //       overlap: 0.85,
  //       speed: 1.7
  //     });

  //     $mgmtSkills.makisu({
  //       selector: 'dd',
  //       overlap: 0.6,
  //       speed: 0.85
  //     });

  //     $softSkills.makisu({
  //       selector: 'dd',
  //       overlap: 0.2,
  //       speed: 0.5
  //     });

  //     // Open all
  //     $('.list').makisu('open');

  //     // Toggle on click
  //     $('.toggle').on('click', function () {
  //       $('.list').makisu('toggle');
  //     });
  //   } else {
  //     console.error('Error loading Makisus');
  //   }
  // }
}
