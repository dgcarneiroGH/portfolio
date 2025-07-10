import {
  Component,
  ElementRef,
  inject,
  Renderer2,
  ViewChild
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OscillatorComponent } from 'src/app/shared/components/oscillator/oscillator.component';
import { AnimateDirective } from 'src/app/shared/directives/animate.directive';
import { CONTACT_METHODS } from '../constants/contact.constants';
import { ContactMethod } from '../interfaces/contact.interface';

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
