import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ContactComponent } from './contact.component';

const mockLoader = { getTranslation: () => of({}) };

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContactComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideRouter([]), provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('renders the intro heading and the contact form slot', () => {
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.intro-title')).toBeTruthy();
    expect(el.querySelector('.intro-description')).toBeTruthy();
    expect(el.querySelector('app-contact-form')).toBeTruthy();
  });

  it('goToReviews uses the injected navigate callback when provided', () => {
    const router = TestBed.inject(Router);
    const routerSpy = spyOn(router, 'navigate');
    const navigate = jasmine.createSpy('navigate');
    fixture.componentRef.setInput('navigate', navigate);

    component.goToReviews();

    expect(navigate).toHaveBeenCalled();
    expect(routerSpy).not.toHaveBeenCalled();
  });

  it('goToReviews falls back to router navigation to /reviews', () => {
    const router = TestBed.inject(Router);
    const routerSpy = spyOn(router, 'navigate');

    component.goToReviews();

    expect(routerSpy).toHaveBeenCalledWith(['/reviews']);
  });

  it('exposes the current year and the animation delay', () => {
    expect(component.actualYear()).toBe(new Date().getFullYear());
    expect(component.animationDelay()).toBe(3000);
  });
});
