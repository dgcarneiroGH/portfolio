import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ContactInquiry } from '../../interfaces/contact-inquiry.interface';
import { ContactService } from '../../services/contact.service';
import { WebMigrationWizardService } from '../../../angular-service/web-migration-wizard.service';

interface FormStatus {
  loading: boolean;
  success?: string;
  error?: string;
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  providers:[ContactService],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);

  /**
   * Lead del wizard de migración (/angular): se consume una sola vez en el
   * arranque; si existe, el campo MENSAJE se prellena (oculto al usuario)
   * y se envía igualmente con el formulario.
   */
  readonly messagePrefilled = signal(false);

  formStatus = signal<FormStatus>({
    loading: false
  });

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor() {
    const lead = inject(WebMigrationWizardService).consumePendingLead();
    if (lead) {
      this.form.patchValue({ message: lead.message });
      this.messagePrefilled.set(true);
    }
  }

  submit() {
    if (this.form.invalid) return;

    this.formStatus.set({ loading: true });

    const inquiry: ContactInquiry = {
      ...this.form.value,
      creationDate: new Date().toISOString(),
      origin: 'nomacoda_portfolio'
    } as ContactInquiry;
    this.contactService.sendInquiry(inquiry).subscribe({
      next: () => {
        this.formStatus.set({
          loading: false,
          success: 'CONTACT.FORM_SUCCESS'
        });
        this.form.reset();
      },
      error: () => {
        this.formStatus.set({
          loading: false,
          error: 'CONTACT.FORM_ERROR'
        });
      }
    });
  }

  invalid(property: string): boolean | undefined {
    return this.form.get(property)?.invalid && this.form.get(property)?.touched;
  }
}