import { Component, inject, Input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ContactFormComponent } from './contact-form/contact-form.component';
@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [
    TranslateModule,
    ContactFormComponent
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  @Input() navigate?: () => void;

  private _router = inject(Router);

  private _animationDelay = signal(3000);
  private _actualYear = signal(new Date().getFullYear());

  animationDelay = this._animationDelay.asReadonly();
  actualYear = this._actualYear.asReadonly();

  goToReviews(): void {
    if (this.navigate) {
      this.navigate();
    } else {
      this._router.navigate(['/reviews']);
    }
  }
}