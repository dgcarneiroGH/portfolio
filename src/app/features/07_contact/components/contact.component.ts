import { Component } from '@angular/core';
import { AnimateComponent } from 'src/app/core/components/animate/animate.component';
import { CONTACT_METHODS } from '../constants/contact.constants';
import { ContactMethod } from '../interfaces/contact.interface';

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent extends AnimateComponent {
  override animationDelay = 3000;

  contactMethods: ContactMethod[] = CONTACT_METHODS;
}
