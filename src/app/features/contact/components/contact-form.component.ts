import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ContactService } from '../services/contact.service';
import { ContactInquiry } from '../interfaces/contact-inquiry.interface';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';

interface FormStatus {
  loading: boolean;
  success?: string;
  error?: string;
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);

  formStatus = signal<FormStatus>({
    loading: false
  });
  //   loading = signal(false);
  //   success = signal<string | null>(null);
  //   error = signal<string | null>(null);

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  submit() {
    if (this.form.invalid) return;

    this.formStatus.set({ loading: true });
    // this.loading.set(true);
    // this.success.set(null);
    // this.error.set(null);

    const inquiry: ContactInquiry = {
      ...this.form.value,
      creationDate: new Date().toISOString(),
      origin: 'nomacoda_portfolio'
    } as ContactInquiry;
    this.contactService.sendInquiry(inquiry).subscribe({
      next: () => {
        // TODO:Translate
        this.formStatus.set({
          loading: false,
          success: '¡Mensaje enviado correctamente!'
        });
        this.form.reset();
      },
      error: () => {
        this.formStatus.set({
          loading: false,
          error: 'Error al enviar el mensaje. Inténtalo de nuevo.'
        });
      }
    });
  }
}
