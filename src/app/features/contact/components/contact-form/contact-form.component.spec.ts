import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactFormComponent } from './contact-form.component';
import { of, throwError } from 'rxjs';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { ContactService } from '../services/contact.service';

class MockContactService {
  sendInquiry() {
    return of({});
  }
}

describe('ContactFormComponent', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;
  let contactService: ContactService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFormComponent, ReactiveFormsModule, LoadingComponent],
      providers: [{ provide: ContactService, useClass: MockContactService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    contactService = TestBed.inject(ContactService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form invalid initially', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should validate form fields', () => {
    component.form.setValue({ fullName: 'Jo', email: 'bad', message: 'short' });
    expect(component.form.invalid).toBeTrue();
    component.form.setValue({
      fullName: 'John Doe',
      email: 'john@email.com',
      message: 'Mensaje válido y largo'
    });
    expect(component.form.valid).toBeTrue();
  });

  it('should call sendInquiry and show success', () => {
    spyOn(contactService, 'sendInquiry').and.returnValue(of({}));
    component.form.setValue({
      fullName: 'John Doe',
      email: 'john@email.com',
      message: 'Mensaje válido y largo'
    });
    component.submit();
    expect(contactService.sendInquiry).toHaveBeenCalled();
    expect(component.formStatus().success).toBeTruthy();
    expect(component.formStatus().loading).toBeFalse();
  });

  it('should show error on sendInquiry failure', () => {
    spyOn(contactService, 'sendInquiry').and.returnValue(
      throwError(() => new Error('fail'))
    );
    component.form.setValue({
      fullName: 'John Doe',
      email: 'john@email.com',
      message: 'Mensaje válido y largo'
    });
    component.submit();
    expect(component.formStatus().error).toBeTruthy();
    expect(component.formStatus().loading).toBeFalse();
  });
});
