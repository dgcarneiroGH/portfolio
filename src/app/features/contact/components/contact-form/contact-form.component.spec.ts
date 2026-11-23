import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';
import { WebMigrationWizardService } from '../../../angular-service/web-migration-wizard.service';
import { N8nWorkflowService } from '../../../n8n-service/components/n8n-workflow.service';
import { TutoringTerminalService } from '../../../tutoring-service/tutoring-terminal.service';
import { ContactInquiry } from '../../interfaces/contact-inquiry.interface';
import { ContactService } from '../../services/contact.service';
import { ContactFormComponent } from './contact-form.component';

// Mock TranslateLoader
const mockTranslations = {
  'CONTACT.FORM_NAME': 'Name',
  'CONTACT.FORM_EMAIL': 'Email',
  'CONTACT.FORM_MESSAGE': 'Message',
  'CONTACT.NAME_PLACEHOLDER': 'Your name or company',
  'CONTACT.MESSAGE_PLACEHOLDER': 'Write your message or question here...',
  'CONTACT.SUBMIT_BUTTON': 'Send message',
  'CONTACT.RESPONSE_INTRO': 'Guaranteed response within',
  'CONTACT.RESPONSE_TIME': '< 24 business hours',
  'CONTACT.FORM_SUCCESS': 'Message sent successfully!',
  'CONTACT.FORM_ERROR': 'Error sending message',
  'FORM.EMAIL_PLACEHOLDER': 'you@email.com',
  'FORM.NAME_ERROR': 'Name is required',
  'FORM.EMAIL_ERROR': 'Invalid email format.',
  'FORM.MESSAGE_ERROR': 'Message is required',
  'FORM.SUBMIT_LOADING': 'Sending...',
  WIZARD: {
    DISCLAIMER: 'Non-binding offer',
    MESSAGES: {
      CREATE: 'CREATE_MSG',
      MAINTENANCE: 'MAINTENANCE_MSG',
      MIGRATE_AMOUNT: 'MIGRATE_MSG {{amount}}',
      MIGRATE_UNKNOWN: 'MIGRATE_UNKNOWN_MSG'
    }
  },
  N8N_WIZARD: {
    DISCLAIMER: 'N8N_DISCLAIMER',
    MESSAGES: {
      LEAD: 'N8N_LEAD {{task}} {{hours}} {{objective}}'
    }
  },
  TUTORING: {
    TERMINAL: {
      MESSAGE: {
        WITH_PROJECT: 'TUTORING_PFC {{cycle}} {{year}} {{subjects}} {{hours}}',
        DISCLAIMER: 'TUTORING_DISCLAIMER'
      },
      SUBJECTS: {
        FCT: 'TUTORING_SUBJ1',
        DATABASES: 'TUTORING_SUBJ3',
        WEB_SERVER: 'TUTORING_SUBJ13'
      }
    }
  }
};

const mockLoader = {
  getTranslation: () => of(mockTranslations)
};

describe('ContactFormComponent', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;
  let contactServiceSpy: jasmine.SpyObj<ContactService>;

  const validFormData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    message: 'This is a valid test message with more than 10 characters'
  };

  beforeEach(async () => {
    contactServiceSpy = jasmine.createSpyObj('ContactService', ['sendInquiry']);
    contactServiceSpy.sendInquiry.and.returnValue(of({ success: true }));

    await TestBed.configureTestingModule({
      imports: [
        ContactFormComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [{ provide: ContactService, useValue: contactServiceSpy }]
    }).compileComponents();

    // El componente declara providers:[ContactService], que sombrearía el
    // provider del TestBed: overrideProvider lo sustituye en todos los niveles.
    TestBed.overrideProvider(ContactService, {
      useValue: contactServiceSpy
    });

    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should have form invalid initially', () => {
      expect(component.form.invalid).toBeTrue();
      expect(component.formStatus().loading).toBeFalse();
      expect(component.formStatus().success).toBeUndefined();
      expect(component.formStatus().error).toBeUndefined();
    });

    it('should validate fullName field', () => {
      const fullNameControl = component.form.get('fullName');

      fullNameControl?.setValue('');
      expect(fullNameControl?.hasError('required')).toBeTrue();

      fullNameControl?.setValue('Jo');
      expect(fullNameControl?.hasError('minlength')).toBeTrue();

      fullNameControl?.setValue('John Doe');
      expect(fullNameControl?.valid).toBeTrue();
    });

    it('should validate email field', () => {
      const emailControl = component.form.get('email');

      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBeTrue();

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTrue();

      emailControl?.setValue('john@example.com');
      expect(emailControl?.valid).toBeTrue();
    });

    it('should validate message field', () => {
      const messageControl = component.form.get('message');

      messageControl?.setValue('');
      expect(messageControl?.hasError('required')).toBeTrue();

      messageControl?.setValue('short');
      expect(messageControl?.hasError('minlength')).toBeTrue();

      messageControl?.setValue(
        'This is a valid message with enough characters'
      );
      expect(messageControl?.valid).toBeTrue();
    });

    it('should return validation status correctly via invalid method', () => {
      expect(component.invalid('fullName')).toBeFalsy();
      expect(component.invalid('email')).toBeFalsy();
      expect(component.invalid('message')).toBeFalsy();

      component.form.get('fullName')?.markAsTouched();
      component.form.get('email')?.markAsTouched();
      component.form.get('message')?.markAsTouched();

      expect(component.invalid('fullName')).toBeTruthy();
      expect(component.invalid('email')).toBeTruthy();
      expect(component.invalid('message')).toBeTruthy();

      component.form.patchValue(validFormData);

      expect(component.invalid('fullName')).toBeFalsy();
      expect(component.invalid('email')).toBeFalsy();
      expect(component.invalid('message')).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should not submit when form is invalid', () => {
      component.form.patchValue({
        fullName: 'Jo',
        email: 'invalid-email',
        message: 'short'
      });

      component.submit();

      expect(contactServiceSpy.sendInquiry).not.toHaveBeenCalled();
      expect(component.formStatus().loading).toBeFalse();
    });

    it('should set loading state to true during submission', () => {
      // Setup a Subject to control when the observable completes
      const responseSubject = new Subject<{ success: boolean }>();
      contactServiceSpy.sendInquiry.and.returnValue(
        responseSubject.asObservable()
      );

      component.form.patchValue(validFormData);
      component.submit();

      expect(component.formStatus().loading).toBeTrue();
      expect(component.formStatus().success).toBeUndefined();

      responseSubject.next({ success: true });
      responseSubject.complete();

      expect(component.formStatus().loading).toBeFalse();
      expect(component.formStatus().success).toBe('CONTACT.FORM_SUCCESS');
    });

    it('should send correct data to service on successful submission', () => {
      component.form.patchValue(validFormData);
      component.submit();

      const expectedInquiry: Partial<ContactInquiry> = {
        fullName: validFormData.fullName,
        email: validFormData.email,
        message: validFormData.message,
        origin: 'nomacoda_portfolio'
      };

      expect(contactServiceSpy.sendInquiry).toHaveBeenCalledWith(
        jasmine.objectContaining(expectedInquiry)
      );

      const actualCall = contactServiceSpy.sendInquiry.calls.mostRecent()
        .args[0] as ContactInquiry;
      expect(actualCall.creationDate).toBeDefined();
      expect(typeof actualCall.creationDate).toBe('string');
    });

    it('should handle successful submission', () => {
      contactServiceSpy.sendInquiry.and.returnValue(of({ success: true }));

      component.form.patchValue(validFormData);
      component.submit();

      expect(component.formStatus().success).toBe('CONTACT.FORM_SUCCESS');
      expect(component.formStatus().loading).toBeFalse();
      expect(component.formStatus().error).toBeUndefined();
      expect(component.form.pristine).toBeTrue();
    });

    it('should handle submission error', () => {
      contactServiceSpy.sendInquiry.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      component.form.patchValue(validFormData);
      component.submit();

      expect(component.formStatus().error).toBe('CONTACT.FORM_ERROR');
      expect(component.formStatus().loading).toBeFalse();
      expect(component.formStatus().success).toBeUndefined();
    });
  });

  describe('DOM Accessibility', () => {
    it('should have proper form attributes', () => {
      const form = fixture.nativeElement.querySelector('form');
      expect(form).toBeTruthy();
      expect(form.getAttribute('novalidate')).toBe('');
    });

    it('should have <label for=> for every input', () => {
      const nameLabel = fixture.nativeElement.querySelector(
        'label[for="contact-fullName"]'
      ) as HTMLLabelElement;
      const emailLabel = fixture.nativeElement.querySelector(
        'label[for="contact-email"]'
      ) as HTMLLabelElement;
      const messageLabel = fixture.nativeElement.querySelector(
        'label[for="contact-message"]'
      ) as HTMLLabelElement;

      expect(nameLabel).toBeTruthy();
      expect(emailLabel).toBeTruthy();
      expect(messageLabel).toBeTruthy();

      const nameInput = fixture.nativeElement.querySelector(
        '#contact-fullName'
      ) as HTMLInputElement;
      const emailInput = fixture.nativeElement.querySelector(
        '#contact-email'
      ) as HTMLInputElement;
      const messageInput = fixture.nativeElement.querySelector(
        '#contact-message'
      ) as HTMLTextAreaElement;

      expect(nameInput).toBeTruthy();
      expect(nameInput.getAttribute('autocomplete')).toBe('name');

      expect(emailInput).toBeTruthy();
      expect(emailInput.getAttribute('autocomplete')).toBe('email');

      expect(messageInput).toBeTruthy();
    });

    it('should mark required fields with aria-required', () => {
      const nameInput = fixture.nativeElement.querySelector(
        '#contact-fullName'
      ) as HTMLInputElement;
      const emailInput = fixture.nativeElement.querySelector(
        '#contact-email'
      ) as HTMLInputElement;
      const messageInput = fixture.nativeElement.querySelector(
        '#contact-message'
      ) as HTMLTextAreaElement;

      expect(nameInput.getAttribute('aria-required')).toBe('true');
      expect(emailInput.getAttribute('aria-required')).toBe('true');
      expect(messageInput.getAttribute('aria-required')).toBe('true');
    });

    it('shows error messages with proper ARIA attributes and connects them via aria-describedby', () => {
      component.form.get('fullName')?.setValue('Jo');
      component.form.get('fullName')?.markAsTouched();
      fixture.detectChanges();

      const nameInput = fixture.nativeElement.querySelector(
        '#contact-fullName'
      ) as HTMLInputElement;
      expect(nameInput.getAttribute('aria-invalid')).toBe('true');
      expect(nameInput.getAttribute('aria-describedby')).toBe(
        'contact-fullName-error'
      );

      const errorMessage = fixture.nativeElement.querySelector(
        '#contact-fullName-error'
      );
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.getAttribute('role')).toBe('alert');
    });

    it('should have an accessible name from its visible text', () => {
      const submitButton = fixture.nativeElement.querySelector(
        '[type="submit"]'
      ) as HTMLButtonElement;

      expect(submitButton).toBeTruthy();
      expect((submitButton.textContent || '').trim().length).toBeGreaterThan(0);
    });

    it('should disable submit button when form is invalid', () => {
      const submitButton = fixture.nativeElement.querySelector(
        '[type="submit"]'
      ) as HTMLButtonElement;
      expect(submitButton.disabled).toBeTrue();

      component.form.patchValue(validFormData);
      fixture.detectChanges();

      expect(submitButton.disabled).toBeFalse();
    });

    it('should disable submit button when loading', () => {
      component.form.patchValue(validFormData);
      fixture.detectChanges();

      component.formStatus.set({ loading: true });
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector(
        '[type="submit"]'
      ) as HTMLButtonElement;
      expect(submitButton.disabled).toBeTrue();
    });

    it('should show success message with proper accessibility attributes', () => {
      component.formStatus.set({
        loading: false,
        success: 'CONTACT.FORM_SUCCESS'
      });
      fixture.detectChanges();

      const successState =
        fixture.nativeElement.querySelector('.success-state');
      expect(successState).toBeTruthy();
      expect(successState.getAttribute('role')).toBe('status');
      expect(successState.getAttribute('aria-live')).toBe('polite');
    });
  });

  describe('Disabled submit focus indicator (WCAG 2.4.7)', () => {
    it('should NOT show a persistent outline when disabled (disabled buttons cannot receive focus, so a persistent outline would be visual noise)', () => {
      const btn = fixture.nativeElement.querySelector(
        '.submit-btn'
      ) as HTMLButtonElement;
      btn.disabled = true;
      fixture.detectChanges();
      const style = window.getComputedStyle(btn);
      expect(style.outlineStyle).not.toBe('solid');
      expect(style.outlineColor).not.toBe('rgb(41, 182, 246)');
    });
  });

  describe('Mensaje preconstruido del wizard de migración', () => {
    // Este spec no configura defaultLanguage: el idioma debe cargarse antes
    // de que el servicio genere el mensaje con translate.instant().
    async function prepareWizardLead(): Promise<void> {
      const translate = TestBed.inject(TranslateService);
      translate.setDefaultLang('en');
      await firstValueFrom(translate.use('en'));

      const wizard = TestBed.inject(WebMigrationWizardService);
      wizard.answerWeb(true);
      wizard.answerWordPress(true);
      wizard.setHostingAmount(180);
      wizard.finishHosting();
      wizard.prepareLead();
    }

    function createFormWithLead(): ComponentFixture<ContactFormComponent> {
      const leadFixture = TestBed.createComponent(ContactFormComponent);
      leadFixture.detectChanges();
      return leadFixture;
    }

    it('prellena el mensaje oculto y oculta el textarea cuando hay lead pendiente', async () => {
      await prepareWizardLead();
      const leadFixture = createFormWithLead();

      expect(leadFixture.componentInstance.messagePrefilled()).toBeTrue();
      expect(leadFixture.componentInstance.form.get('message')?.value).toContain(
        'MIGRATE_MSG 180'
      );
      expect(leadFixture.componentInstance.form.get('message')?.value).toContain(
        'Non-binding offer'
      );
      expect(
        leadFixture.nativeElement.querySelector('#contact-message')
      ).toBeNull();
    });

    it('muestra el textarea normal cuando no hay lead pendiente', () => {
      expect(fixture.componentInstance.messagePrefilled()).toBeFalse();
      expect(
        fixture.nativeElement.querySelector('#contact-message')
      ).not.toBeNull();
    });

    it('el lead se consume una sola vez: el siguiente formulario vuelve al estado normal', async () => {
      await prepareWizardLead();
      const first = createFormWithLead();
      expect(first.componentInstance.messagePrefilled()).toBeTrue();

      const second = createFormWithLead();
      expect(second.componentInstance.messagePrefilled()).toBeFalse();
      expect(
        second.nativeElement.querySelector('#contact-message')
      ).not.toBeNull();
    });

    it('envía el mensaje preconstruido al servicio aunque el textarea esté oculto', async () => {
      await prepareWizardLead();
      const leadFixture = createFormWithLead();
      const component = leadFixture.componentInstance;
      component.form.patchValue({
        fullName: 'John Doe',
        email: 'john@example.com'
      });
      component.submit();

      const actualCall = contactServiceSpy.sendInquiry.calls.mostRecent()
        .args[0] as ContactInquiry;
      expect(actualCall.message).toContain('MIGRATE_MSG 180');
      expect(actualCall.message).toContain('Non-binding offer');
    });
  });

  describe('Mensaje preconstruido del workflow n8n', () => {
    async function prepareN8nLead(): Promise<void> {
      const translate = TestBed.inject(TranslateService);
      translate.setDefaultLang('en');
      await firstValueFrom(translate.use('en'));

      const workflow = TestBed.inject(N8nWorkflowService);
      workflow.setTask('Sincronizar pedidos');
      workflow.setHours(6);
      workflow.setObjective('Descansar los viernes');
      workflow.prepareLead();
    }

    function createFormWithLead(): ComponentFixture<ContactFormComponent> {
      const leadFixture = TestBed.createComponent(ContactFormComponent);
      leadFixture.detectChanges();
      return leadFixture;
    }

    it('prellena el mensaje oculto del workflow n8n y oculta el textarea', async () => {
      await prepareN8nLead();
      const leadFixture = createFormWithLead();

      expect(leadFixture.componentInstance.messagePrefilled()).toBeTrue();
      expect(leadFixture.componentInstance.form.get('message')?.value).toContain(
        'N8N_LEAD Sincronizar pedidos 6 Descansar los viernes'
      );
      expect(leadFixture.componentInstance.form.get('message')?.value).toContain(
        'N8N_DISCLAIMER'
      );
      expect(
        leadFixture.nativeElement.querySelector('#contact-message')
      ).toBeNull();
    });

    it('el lead n8n se consume una sola vez', async () => {
      await prepareN8nLead();
      const first = createFormWithLead();
      expect(first.componentInstance.messagePrefilled()).toBeTrue();

      const second = createFormWithLead();
      expect(second.componentInstance.messagePrefilled()).toBeFalse();
      expect(
        second.nativeElement.querySelector('#contact-message')
      ).not.toBeNull();
    });
  });

  describe('Mensaje preconstruido de la terminal de tutorías', () => {
    async function prepareTutoringLead(): Promise<void> {
      const translate = TestBed.inject(TranslateService);
      translate.setDefaultLang('es-ES');
      await firstValueFrom(translate.use('es-ES'));

      const terminal = TestBed.inject(TutoringTerminalService);
      terminal.submit('daw');
      terminal.submit('2');
      terminal.submit('1,3');
      terminal.submit('4');
      terminal.prepareLead();
    }

    function createFormWithLead(): ComponentFixture<ContactFormComponent> {
      const leadFixture = TestBed.createComponent(ContactFormComponent);
      leadFixture.detectChanges();
      return leadFixture;
    }

    it('prellena el mensaje oculto del terminal y oculta el textarea', async () => {
      await prepareTutoringLead();
      const leadFixture = createFormWithLead();

      expect(leadFixture.componentInstance.messagePrefilled()).toBeTrue();
      expect(leadFixture.componentInstance.form.get('message')?.value).toContain(
        'TUTORING_PFC DAW 2º TUTORING_SUBJ1 y TUTORING_SUBJ13 4h'
      );
      expect(leadFixture.componentInstance.form.get('message')?.value).toContain(
        'TUTORING_DISCLAIMER'
      );
      expect(
        leadFixture.nativeElement.querySelector('#contact-message')
      ).toBeNull();
    });

    it('el lead de tutorías se consume una sola vez', async () => {
      await prepareTutoringLead();
      const first = createFormWithLead();
      expect(first.componentInstance.messagePrefilled()).toBeTrue();

      const second = createFormWithLead();
      expect(second.componentInstance.messagePrefilled()).toBeFalse();
      expect(
        second.nativeElement.querySelector('#contact-message')
      ).not.toBeNull();
    });
  });
});
