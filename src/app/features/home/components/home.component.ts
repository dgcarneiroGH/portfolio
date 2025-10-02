import { Component, ElementRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OscillatorComponent } from 'src/app/shared/components/oscillator/oscillator.component';
import { AnimateDirective } from 'src/app/shared/directives/animate.directive';
import { CERTS } from '../../certs/constants/certs.constants';
import { Cert } from '../../certs/interfaces/certs.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
export class HomeComponent {
  certs: Cert[] = CERTS;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const logos = this.el.nativeElement.querySelectorAll('.cert-img');
    logos.forEach((logo: HTMLElement, index: number) => {
      console.log({ logo });
      console.log({ index });

      // Posición aleatoria dentro del viewport
      const top = Math.random() * 80 + 10; // entre 10% y 90%
      const left = Math.random() * 80 + 10; // entre 10% y 90%

      logo.style.top = `${top}vh`;
      logo.style.left = `${left}vw`;

      // Delay incremental (aparecen uno tras otro)
      logo.style.animationDelay = `${index + 2}s`;
    });
  }
}
