import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('overlay', () => {
    it('should render the overlay container', () => {
      const overlay = fixture.debugElement.query(By.css('[data-testid="loading-overlay"]'));
      expect(overlay).toBeTruthy();
    });

    it('should have role="status" for screen readers', () => {
      const overlay = fixture.nativeElement.querySelector('[data-testid="loading-overlay"]') as HTMLElement;
      expect(overlay.getAttribute('role')).toBe('status');
    });

    it('should have aria-busy="true"', () => {
      const overlay = fixture.nativeElement.querySelector('[data-testid="loading-overlay"]') as HTMLElement;
      expect(overlay.getAttribute('aria-busy')).toBe('true');
    });

    it('should have inert attribute to block user interaction', () => {
      const overlay = fixture.nativeElement.querySelector('[data-testid="loading-overlay"]') as HTMLElement;
      expect(overlay.hasAttribute('inert')).toBeTrue();
    });
  });

  describe('spinner image (loading.avif)', () => {
    it('should render the spinner image', () => {
      const spinner = fixture.nativeElement.querySelector('[data-testid="loading-spinner"]') as HTMLImageElement;
      expect(spinner).toBeTruthy();
    });

    it('should have an empty alt (decorative, spinning ring)', () => {
      const spinner = fixture.nativeElement.querySelector('[data-testid="loading-spinner"]') as HTMLImageElement;
      expect(spinner.alt).toBe('');
    });

    it('should have aria-hidden="true" on the spinner', () => {
      const spinner = fixture.nativeElement.querySelector('[data-testid="loading-spinner"]') as HTMLImageElement;
      expect(spinner.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have the loading-spin CSS class for the rotation animation', () => {
      const spinner = fixture.nativeElement.querySelector('[data-testid="loading-spinner"]') as HTMLImageElement;
      expect(spinner.classList.contains('loading-spin')).toBeTrue();
    });
  });

  describe('nomacoda image (nomacoda_full_transparent.avif)', () => {
    it('should render the nomacoda image', () => {
      const logo = fixture.nativeElement.querySelector('[data-testid="loading-nomacoda"]') as HTMLImageElement;
      expect(logo).toBeTruthy();
    });

    it('should have alt="Nomacoda"', () => {
      const logo = fixture.nativeElement.querySelector('[data-testid="loading-nomacoda"]') as HTMLImageElement;
      expect(logo.alt).toBe('Nomacoda');
    });
  });

  describe('composite layout', () => {
    it('should render the composite wrapper', () => {
      const composite = fixture.debugElement.query(By.css('[data-testid="loading-composite"]'));
      expect(composite).toBeTruthy();
    });

    it('should render the spinner before the logo in the DOM (spinner is behind logo)', () => {
      const composite = fixture.nativeElement.querySelector('[data-testid="loading-composite"]') as HTMLElement;
      const children = Array.from(composite.children) as HTMLElement[];
      const spinnerIndex = children.findIndex(el => el.getAttribute('data-testid') === 'loading-spinner');
      const logoIndex = children.findIndex(el => el.getAttribute('data-testid') === 'loading-nomacoda');
      expect(spinnerIndex).toBeLessThan(logoIndex);
    });
  });
});
