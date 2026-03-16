import { provideZonelessChangeDetection } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default inputs', () => {
      expect(component.color()).toBe('transparent');
      expect(component.disabled()).toBeFalse();
      expect(component.text()).toBe('');
    });
  });

  describe('#cssColor (computed)', () => {
    it('should return the color as-is when not a hex value', () => {
      fixture.componentRef.setInput('color', 'blue');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('blue');
    });

    it('should convert a 6-digit hex color to "r, g, b" format', () => {
      fixture.componentRef.setInput('color', '#ff0080');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('255, 0, 128');
    });

    it('should convert a 3-digit shorthand hex to 6-digit rgb', () => {
      fixture.componentRef.setInput('color', '#fff');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('255, 255, 255');
    });
  });

  describe('#onClick', () => {
    it('should emit buttonClick when not disabled', () => {
      let emitted = false;
      outputToObservable(component.buttonClick).subscribe(
        () => (emitted = true)
      );

      component.onClick();

      expect(emitted).toBeTrue();
    });

    it('should NOT emit buttonClick when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      let emitted = false;
      outputToObservable(component.buttonClick).subscribe(
        () => (emitted = true)
      );

      component.onClick();

      expect(emitted).toBeFalse();
    });
  });

  describe('#onKeyDown — keyboard accessibility', () => {
    it('should emit buttonClick on Enter key', () => {
      let emitted = false;
      outputToObservable(component.buttonClick).subscribe(
        () => (emitted = true)
      );

      component.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(emitted).toBeTrue();
    });

    it('should emit buttonClick on Space key', () => {
      let emitted = false;
      outputToObservable(component.buttonClick).subscribe(
        () => (emitted = true)
      );

      component.onKeyDown(new KeyboardEvent('keydown', { key: ' ' }));

      expect(emitted).toBeTrue();
    });

    it('should NOT emit when Enter is pressed and button is disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      let emitted = false;
      outputToObservable(component.buttonClick).subscribe(
        () => (emitted = true)
      );

      component.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(emitted).toBeFalse();
    });

    it('should NOT emit on any other key', () => {
      let emitted = false;
      outputToObservable(component.buttonClick).subscribe(
        () => (emitted = true)
      );

      component.onKeyDown(new KeyboardEvent('keydown', { key: 'Tab' }));

      expect(emitted).toBeFalse();
    });
  });
});
