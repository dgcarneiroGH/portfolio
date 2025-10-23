import {
  Component,
  ElementRef,
  inject,
  Renderer2,
  ViewChild
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
  @ViewChild('nomacodaImgWrapper') nomacodaImgWrapper!: ElementRef;

  private _renderer = inject(Renderer2);

  animationDelay = 3000;
  contactMethods: ContactMethod[] = CONTACT_METHODS;
  actualYear: number = new Date().getFullYear();

  public triggerSwing() {
    if (!this.nomacodaImgWrapper) return;

    this._renderer.removeClass(
      this.nomacodaImgWrapper.nativeElement,
      'swing-active'
    );

    void this.nomacodaImgWrapper.nativeElement.offsetWidth;
    this._renderer.addClass(
      this.nomacodaImgWrapper.nativeElement,
      'swing-active'
    );
    setTimeout(() => {
      this._renderer.removeClass(
        this.nomacodaImgWrapper.nativeElement,
        'swing-active'
      );
    }, 10000);
  }
}
