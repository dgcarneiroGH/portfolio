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

describe('FocusableDirective (deprecated)', () => {
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

  it('should attach to all elements with appFocusable', () => {
    const directiveElements = fixture.debugElement.queryAll(By.directive(FocusableDirective));
    expect(directiveElements).toHaveSize(7);
    expect(component).toBeTruthy();
  });

  it('preserves developer-set tabindex on host elements (no longer overridden)', () => {
    // The deprecated directive no longer mutates host attributes.
    expect(fixture.nativeElement.querySelector('.div-with-tabindex')?.getAttribute('tabindex')).toBe('2');
    expect(fixture.nativeElement.querySelector('.div-with-role')?.getAttribute('role')).toBe('menu');
    expect(fixture.nativeElement.querySelector('.div-with-both')?.getAttribute('tabindex')).toBe('1');
    expect(fixture.nativeElement.querySelector('.div-with-both')?.getAttribute('role')).toBe('menuitem');
  });

  it('does NOT auto-add tabindex=0 to non-interactive elements (deprecated)', () => {
    expect(fixture.nativeElement.querySelector('.regular-div')?.getAttribute('tabindex')).toBeNull();
    expect(fixture.nativeElement.querySelector('.regular-div')?.getAttribute('role')).toBeNull();
  });

  it('still exists on the page for backward compatibility', () => {
    const div = fixture.nativeElement.querySelector('.regular-div') as HTMLElement;
    expect(div).toBeTruthy();
  });
});
