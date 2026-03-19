import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FocusableDirective } from './focusable.directive';

@Component({
  template: `
    <div class="regular-div" appFocusable>Regular Div</div>
    <div class="div-with-tabindex" appFocusable tabindex="2">Div with existing tabindex</div>
    <div class="div-with-role" appFocusable role="menu">Div with existing role</div>
    <button class="native-button" appFocusable>Native Button</button>
    <input class="native-input" appFocusable type="text" />
    <a class="native-link" appFocusable href="#test">Native Link</a>
    <div class="div-with-both" appFocusable tabindex="1" role="menuitem">Div with both</div>
  `,
  imports: [FocusableDirective],
})
class TestHostComponent {}

describe('FocusableDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    const directiveElements = fixture.debugElement.queryAll(By.directive(FocusableDirective));
    expect(directiveElements).toHaveSize(7);
    expect(component).toBeTruthy();
  });

  describe('Non-interactive elements', () => {
    it('should add tabindex="0" to regular div elements', () => {
      const divElement = fixture.nativeElement.querySelector('.regular-div') as HTMLElement;
      
      expect(divElement.getAttribute('tabindex')).toBe('0');
    });

    it('should add role="button" to regular div elements', () => {
      const divElement = fixture.nativeElement.querySelector('.regular-div') as HTMLElement;
      
      expect(divElement.getAttribute('role')).toBe('button');
    });

    it('should not override existing tabindex', () => {
      const divElement = fixture.nativeElement.querySelector('.div-with-tabindex') as HTMLElement;
      
      expect(divElement.getAttribute('tabindex')).toBe('2');
    });

    it('should not override existing role', () => {
      const divElement = fixture.nativeElement.querySelector('.div-with-role') as HTMLElement;
      
      expect(divElement.getAttribute('role')).toBe('menu');
    });

    it('should not override existing tabindex or role', () => {
      const divElement = fixture.nativeElement.querySelector('.div-with-both') as HTMLElement;
      
      expect(divElement.getAttribute('tabindex')).toBe('1');
      expect(divElement.getAttribute('role')).toBe('menuitem');
    });
  });

  describe('Interactive elements', () => {
    it('should not add tabindex to native button elements', () => {
      const buttonElement = fixture.nativeElement.querySelector('.native-button') as HTMLButtonElement;
      
      // Native buttons are already focusable, shouldn't add tabindex
      expect(buttonElement.hasAttribute('tabindex')).toBeFalse();
    });

    it('should not add role to native button elements', () => {
      const buttonElement = fixture.nativeElement.querySelector('.native-button') as HTMLButtonElement;
      
      // Native buttons already have implicit button role
      expect(buttonElement.hasAttribute('role')).toBeFalse();
    });

    it('should not add tabindex to native input elements', () => {
      const inputElement = fixture.nativeElement.querySelector('.native-input') as HTMLInputElement;
      
      expect(inputElement.hasAttribute('tabindex')).toBeFalse();
    });

    it('should not add role to native input elements', () => {
      const inputElement = fixture.nativeElement.querySelector('.native-input') as HTMLInputElement;
      
      expect(inputElement.hasAttribute('role')).toBeFalse();
    });

    it('should not add tabindex to native link elements', () => {
      const linkElement = fixture.nativeElement.querySelector('.native-link') as HTMLAnchorElement;
      
      expect(linkElement.hasAttribute('tabindex')).toBeFalse();
    });

    it('should not add role to native link elements', () => {
      const linkElement = fixture.nativeElement.querySelector('.native-link') as HTMLAnchorElement;
      
      expect(linkElement.hasAttribute('role')).toBeFalse();
    });
  });

  describe('Accessibility Integration', () => {
    it('should make non-interactive elements keyboard accessible', () => {
      const divElement = fixture.nativeElement.querySelector('.regular-div') as HTMLElement;
      
      // Element should be focusable
      expect(divElement.getAttribute('tabindex')).toBe('0');
      
      // Element should have semantic meaning
      expect(divElement.getAttribute('role')).toBe('button');
      
      // Element should be in tab order
      expect(parseInt(divElement.getAttribute('tabindex')!)).toBeGreaterThanOrEqual(0);
    });

    it('should preserve semantic meaning when role exists', () => {
      const menuElement = fixture.nativeElement.querySelector('.div-with-role') as HTMLElement;
      
      expect(menuElement.getAttribute('role')).toBe('menu');
      expect(menuElement.getAttribute('tabindex')).toBe('0');
    });

    it('should respect custom tab order', () => {
      const customTabElement = fixture.nativeElement.querySelector('.div-with-tabindex') as HTMLElement;
      
      expect(customTabElement.getAttribute('tabindex')).toBe('2');
    });

    it('should work with different element types', () => {
      // Test that directive works on various HTML elements
      const elements = [
        '.regular-div',
        '.div-with-tabindex',
        '.div-with-role'
      ];

      elements.forEach(selector => {
        const element = fixture.nativeElement.querySelector(selector) as HTMLElement;
        expect(element).toBeTruthy(`Element ${selector} should exist`);
        expect(element.getAttribute('tabindex')).toBeTruthy(`Element ${selector} should have tabindex`);
      });
    });
  });

  describe('Directive Attachment', () => {
    it('should attach to all elements with appFocusable', () => {
      const directiveElements = fixture.debugElement.queryAll(By.directive(FocusableDirective));
      
      expect(directiveElements).toHaveSize(7);
      
      directiveElements.forEach((debugElement, index) => {
        const directive = debugElement.injector.get(FocusableDirective);
        expect(directive).toBeTruthy(`Directive instance ${index} should exist`);
      });
    });

    it('should properly initialize all directive instances', () => {
      // All elements should have been processed after ngOnInit
      const regularDiv = fixture.nativeElement.querySelector('.regular-div') as HTMLElement;
      const nativeButton = fixture.nativeElement.querySelector('.native-button') as HTMLButtonElement;
      
      expect(regularDiv.getAttribute('tabindex')).toBe('0');
      expect(regularDiv.getAttribute('role')).toBe('button');
      
      expect(nativeButton.hasAttribute('tabindex')).toBeFalse();
      expect(nativeButton.hasAttribute('role')).toBeFalse();
    });
  });
});