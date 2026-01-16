import {
  Component,
  ElementRef,
  inject,
  Renderer2,
  viewChild,
  signal,
  computed
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CONTACT_METHODS } from '../constants/contact.constants';
import { ContactMethod } from '../interfaces/contact.interface';
import { AnimateDirective } from '../../../shared/directives/animate.directive';
import { OscillatorComponent } from '../../../shared/components/oscillator/oscillator.component';

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [TranslateModule, AnimateDirective, OscillatorComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private _renderer = inject(Renderer2);

  nomacodaImgWrapper = viewChild<ElementRef>('nomacodaImgWrapper');

  private _animationDelay = signal(3000);
  private _contactMethods = signal<ContactMethod[]>(CONTACT_METHODS);
  private _actualYear = signal(new Date().getFullYear());

  animationDelay = this._animationDelay.asReadonly();
  contactMethods = this._contactMethods.asReadonly();
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
