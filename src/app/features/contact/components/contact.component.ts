import {
  Component,
  ElementRef,
  inject,
  Input,
  Renderer2,
  signal,
  viewChild
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OscillatorComponent } from '../../../shared/components/oscillator/oscillator.component';
import { AnimateDirective } from '../../../shared/directives/animate.directive';
import { ContactFormComponent } from './contact-form/contact-form.component';

import { Output, EventEmitter } from '@angular/core';
@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [
    TranslateModule,
    AnimateDirective,
    OscillatorComponent,
    ContactFormComponent
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  @Input() navigate!: () => void;

  private _animationDelay = signal(3000);
  private _actualYear = signal(new Date().getFullYear());

  animationDelay = this._animationDelay.asReadonly();
  actualYear = this._actualYear.asReadonly();
}
