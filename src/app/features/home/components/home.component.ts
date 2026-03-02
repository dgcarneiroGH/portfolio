import { CommonModule } from '@angular/common';
import { Component, ElementRef, signal, AfterViewInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OscillatorComponent } from '../../../shared/components/oscillator/oscillator.component';
import { AnimateDirective } from '../../../shared/directives/animate.directive';
import { CERTS } from '../../certs/constants/certs.constants';
import { Cert } from '../../certs/interfaces/certs.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    TranslateModule,
    AnimateDirective,
    OscillatorComponent,
    CommonModule
  ]
})
export class HomeComponent implements AfterViewInit {
  private _certs = signal<Cert[]>(CERTS);
  certs = this._certs.asReadonly();

  animationInitialized = signal(false);

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    window.scrollTo(0, 0);
    const logos = this.el.nativeElement.querySelectorAll('.cert-img');

    logos.forEach((logo: HTMLElement, index: number) => {
      logo.style.top = '2vh';
      logo.style.left = `${(index + 1) * (90 / (logos.length + 1))}vw`;
      logo.style.animationDelay = `${index + 2}s`;
    });

    this.animationInitialized.set(true);
  }
}
