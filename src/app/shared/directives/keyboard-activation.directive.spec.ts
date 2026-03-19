import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KeyboardActivationDirective } from './keyboard-activation.directive';

@Component({
  template: `
    <div 
      class="interactive-element"
      appKeyboardActivation
      (appKeyboardActivation)="onActivation($event)"
      role="button"
      tabindex="0"
    >
      Interactive Element
    </div>
  `,
  imports: [KeyboardActivationDirective],
})
class TestHostComponent {
  activationEvents: Event[] = [];
  
  onActivation(event: Event): void {
    this.activationEvents.push(event);
  }
}

describe('KeyboardActivationDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let directiveElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    directiveElement = fixture.nativeElement.querySelector('.interactive-element') as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    const directiveDebugElement = fixture.debugElement.query(By.directive(KeyboardActivationDirective));
    expect(directiveDebugElement).toBeTruthy();
    expect(component).toBeTruthy();
  });

  describe('Keyboard Activation', () => {
    it('should emit on Enter key press', () => {
      const enterEvent = new KeyboardEvent('keydown', { 
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });

      directiveElement.dispatchEvent(enterEvent);
      
      expect(component.activationEvents).toHaveSize(1);
      expect(component.activationEvents[0]).toBeInstanceOf(KeyboardEvent);
      expect((component.activationEvents[0] as KeyboardEvent).key).toBe('Enter');
    });

    it('should emit on Space key press', () => {
      const spaceEvent = new KeyboardEvent('keydown', { 
        key: ' ',
        bubbles: true,
        cancelable: true
      });

      directiveElement.dispatchEvent(spaceEvent);
      
      expect(component.activationEvents).toHaveSize(1);
      expect(component.activationEvents[0]).toBeInstanceOf(KeyboardEvent);
      expect((component.activationEvents[0] as KeyboardEvent).key).toBe(' ');
    });

    it('should prevent default and stop propagation for activation keys', () => {
      const enterEvent = new KeyboardEvent('keydown', { 
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      
      spyOn(enterEvent, 'preventDefault');
      spyOn(enterEvent, 'stopPropagation');

      directiveElement.dispatchEvent(enterEvent);
      
      expect(enterEvent.preventDefault).toHaveBeenCalled();
      expect(enterEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should not emit on non-activation keys', () => {
      const arrowEvent = new KeyboardEvent('keydown', { 
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true
      });

      const tabEvent = new KeyboardEvent('keydown', { 
        key: 'Tab',
        bubbles: true,
        cancelable: true
      });

      const escapeEvent = new KeyboardEvent('keydown', { 
        key: 'Escape',
        bubbles: true,
        cancelable: true
      });

      directiveElement.dispatchEvent(arrowEvent);
      directiveElement.dispatchEvent(tabEvent);
      directiveElement.dispatchEvent(escapeEvent);
      
      expect(component.activationEvents).toHaveSize(0);
    });
  });

  describe('Mouse Activation', () => {
    it('should emit on mouse click', () => {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });

      directiveElement.dispatchEvent(clickEvent);
      
      expect(component.activationEvents).toHaveSize(1);
      expect(component.activationEvents[0]).toBeInstanceOf(MouseEvent);
    });

    it('should handle both keyboard and mouse events', () => {
      const enterEvent = new KeyboardEvent('keydown', { 
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });

      directiveElement.dispatchEvent(enterEvent);
      directiveElement.dispatchEvent(clickEvent);
      
      expect(component.activationEvents).toHaveSize(2);
      expect(component.activationEvents[0]).toBeInstanceOf(KeyboardEvent);
      expect(component.activationEvents[1]).toBeInstanceOf(MouseEvent);
    });
  });

  describe('Accessibility Integration', () => {
    it('should work with proper ARIA attributes', () => {
      // Verify element has proper accessibility attributes in test template
      expect(directiveElement.getAttribute('role')).toBe('button');
      expect(directiveElement.getAttribute('tabindex')).toBe('0');
    });

    it('should support multiple activation methods for accessibility', () => {
      // This directive enables both mouse and keyboard interaction
      // which is essential for accessibility compliance
      
      // Test keyboard activation (for keyboard users)
      const enterEvent = new KeyboardEvent('keydown', { 
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      directiveElement.dispatchEvent(enterEvent);
      
      // Test mouse activation (for mouse users)
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      directiveElement.dispatchEvent(clickEvent);
      
      expect(component.activationEvents).toHaveSize(2);
    });
  });
});