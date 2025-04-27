import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AnimateDirective } from 'src/app/shared/directives/animate.directive';
import { CONTACT_METHODS } from '../constants/contact.constants';
import { ContactMethod } from '../interfaces/contact.interface';

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [TranslateModule, AnimateDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  public animationDelay = 3000;
  contactMethods: ContactMethod[] = CONTACT_METHODS;
}
