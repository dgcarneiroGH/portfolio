import { Component, OnInit } from '@angular/core';
import { AnimateComponent } from '../../animate/animate.component';
import { IContactMethod } from 'src/app/interfaces';
import { CONTACT_METHODS } from 'src/app/constants';

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent extends AnimateComponent {
  override animationDelay = 3000;

  contactMethods: IContactMethod[] = CONTACT_METHODS;
}
