import {
  Component,
  ElementRef,
  inject,
  Renderer2,
  signal,
  viewChild
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OscillatorComponent } from '../../../shared/components/oscillator/oscillator.component';
import { AnimateDirective } from '../../../shared/directives/animate.directive';
import { ContactFormComponent } from './contact-form/contact-form.component';

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
  private _renderer = inject(Renderer2);

  nomacodaImgWrapper = viewChild<ElementRef>('nomacodaImgWrapper');

  private _animationDelay = signal(3000);
  private _actualYear = signal(new Date().getFullYear());

  animationDelay = this._animationDelay.asReadonly();
  actualYear = this._actualYear.asReadonly();

  isSwinging = signal(false);

  public triggerSwing() {
    const wrapper = this.nomacodaImgWrapper();
    if (!wrapper) return;

    this.isSwinging.set(true);

    this._renderer.removeClass(wrapper.nativeElement, 'swing-active');

    void wrapper.nativeElement.offsetWidth;
    this._renderer.addClass(wrapper.nativeElement, 'swing-active');

    setTimeout(() => {
      const currentWrapper = this.nomacodaImgWrapper();
      if (currentWrapper) {
        this._renderer.removeClass(
          currentWrapper.nativeElement,
          'swing-active'
        );
      }
      this.isSwinging.set(false);
    }, 10000);
  }
}
