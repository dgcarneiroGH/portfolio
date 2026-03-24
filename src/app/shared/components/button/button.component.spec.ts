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
      expect(component.ariaLabel()).toBeUndefined();
      expect(component.ariaDescribedBy()).toBeUndefined();
    });
  });

  describe('#input signals', () => {
    it('should accept and store color input', () => {
      fixture.componentRef.setInput('color', 'blue');
      fixture.detectChanges();
      expect(component.color()).toBe('blue');
    });

    it('should accept and store disabled input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(component.disabled()).toBe(true);
    });

    it('should accept and store text input', () => {
      const testText = 'Click me!';
      fixture.componentRef.setInput('text', testText);
      fixture.detectChanges();
      expect(component.text()).toBe(testText);
    });

    it('should accept and store ariaLabel input', () => {
      const testLabel = 'Submit form';
      fixture.componentRef.setInput('ariaLabel', testLabel);
      fixture.detectChanges();
      expect(component.ariaLabel()).toBe(testLabel);
    });

    it('should accept and store ariaDescribedBy input', () => {
      const testDescribedBy = 'help-text';
      fixture.componentRef.setInput('ariaDescribedBy', testDescribedBy);
      fixture.detectChanges();
      expect(component.ariaDescribedBy()).toBe(testDescribedBy);
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

    it('should handle lowercase hex colors', () => {
      fixture.componentRef.setInput('color', '#abc');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('170, 187, 204');
    });

    it('should handle uppercase hex colors', () => {
      fixture.componentRef.setInput('color', '#ABC123');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('171, 193, 35');
    });

    it('should handle hex colors without # prefix', () => {
      fixture.componentRef.setInput('color', '123abc');
      fixture.detectChanges();
      // Colors without # are not treated as hex, returned as-is
      expect(component.cssColor()).toBe('123abc');
    });

    it('should handle edge case black color', () => {
      fixture.componentRef.setInput('color', '#000');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('0, 0, 0');
    });

    it('should handle edge case white color', () => {
      fixture.componentRef.setInput('color', '#ffffff');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('255, 255, 255');
    });

    it('should return named colors as-is', () => {
      const namedColors = ['red', 'blue', 'green', 'transparent', 'inherit'];
      namedColors.forEach((color) => {
        fixture.componentRef.setInput('color', color);
        fixture.detectChanges();
        expect(component.cssColor()).toBe(color);
      });
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

    it('should call preventDefault on Enter and Space keys', () => {
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });

      const preventDefaultSpyEnter = spyOn(enterEvent, 'preventDefault');
      const preventDefaultSpySpace = spyOn(spaceEvent, 'preventDefault');

      component.onKeyDown(enterEvent);
      component.onKeyDown(spaceEvent);

      expect(preventDefaultSpyEnter).toHaveBeenCalled();
      expect(preventDefaultSpySpace).toHaveBeenCalled();
    });

    it('should NOT call preventDefault on other keys', () => {
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      const preventDefaultSpy = spyOn(tabEvent, 'preventDefault');

      component.onKeyDown(tabEvent);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should NOT call preventDefault when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = spyOn(enterEvent, 'preventDefault');

      component.onKeyDown(enterEvent);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('#edge cases and integration', () => {
    it('should handle multiple rapid clicks', () => {
      let clickCount = 0;
      outputToObservable(component.buttonClick).subscribe(() => clickCount++);

      component.onClick();
      component.onClick();
      component.onClick();

      expect(clickCount).toBe(3);
    });

    it('should not emit when rapidly clicking a disabled button', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      let clickCount = 0;
      outputToObservable(component.buttonClick).subscribe(() => clickCount++);

      component.onClick();
      component.onClick();
      component.onClick();

      expect(clickCount).toBe(0);
    });

    it('should work with all inputs configured', () => {
      fixture.componentRef.setInput('color', '#ff6600');
      fixture.componentRef.setInput('disabled', false);
      fixture.componentRef.setInput('text', 'Test Button');
      fixture.componentRef.setInput('ariaLabel', 'Test action button');
      fixture.componentRef.setInput('ariaDescribedBy', 'button-help');
      fixture.detectChanges();

      expect(component.color()).toBe('#ff6600');
      expect(component.disabled()).toBe(false);
      expect(component.text()).toBe('Test Button');
      expect(component.ariaLabel()).toBe('Test action button');
      expect(component.ariaDescribedBy()).toBe('button-help');
      expect(component.cssColor()).toBe('255, 102, 0');

      let emitted = false;
      outputToObservable(component.buttonClick).subscribe(
        () => (emitted = true)
      );

      component.onClick();
      expect(emitted).toBe(true);
    });

    it('should handle state changes dynamically', () => {
      // Start enabled
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();

      let clickCount = 0;
      outputToObservable(component.buttonClick).subscribe(() => clickCount++);

      component.onClick();
      expect(clickCount).toBe(1);

      // Disable the button
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      component.onClick();
      expect(clickCount).toBe(1); // Should remain 1

      // Enable again
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();

      component.onClick();
      expect(clickCount).toBe(2); // Should increment
    });

    it('should handle color changes dynamically', () => {
      fixture.componentRef.setInput('color', 'red');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('red');

      fixture.componentRef.setInput('color', '#123456');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('18, 52, 86');

      fixture.componentRef.setInput('color', '#abc');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('170, 187, 204');
    });
  });

  describe('#additional edge cases for hex conversion', () => {
    it('should handle invalid hex colors gracefully', () => {
      // The component doesn't validate hex, so invalid hex will still be processed
      fixture.componentRef.setInput('color', '#gggggg');
      fixture.detectChanges();
      // This will result in NaN values, but we test that it doesn't crash
      const result = component.cssColor();
      expect(typeof result).toBe('string');
    });

    it('should handle empty hex values', () => {
      fixture.componentRef.setInput('color', '#');
      fixture.detectChanges();
      const result = component.cssColor();
      expect(typeof result).toBe('string');
    });

    it('should handle hex values with mixed case', () => {
      fixture.componentRef.setInput('color', '#AbC123');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('171, 193, 35');
    });

    it('should handle 3-digit hex with mixed case', () => {
      fixture.componentRef.setInput('color', '#A1b');
      fixture.detectChanges();
      expect(component.cssColor()).toBe('170, 17, 187');
    });
  });
});
