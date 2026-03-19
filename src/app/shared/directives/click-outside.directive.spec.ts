import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  template: `
    <div class="container">
      <div class="target" appClickOutside (appClickOutside)="onClickOutside()">
        <button class="inside-button">Inside Button</button>
      </div>
      <button class="outside-button">Outside Button</button>
    </div>
  `,
  imports: [ClickOutsideDirective],
})
class TestHostComponent {
  clickOutsideCount = 0;

  onClickOutside(): void {
    this.clickOutsideCount++;
  }
}

describe('ClickOutsideDirective', () => {
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
    const directiveElement = fixture.debugElement.query(By.directive(ClickOutsideDirective));
    expect(directiveElement).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should not emit when clicking inside the element', () => {
    const targetElement = fixture.nativeElement.querySelector('.target') as HTMLElement;
    const insideButton = fixture.nativeElement.querySelector('.inside-button') as HTMLButtonElement;

    // Click inside the target element
    targetElement.click();
    expect(component.clickOutsideCount).toBe(0);

    // Click on inside button
    insideButton.click();
    expect(component.clickOutsideCount).toBe(0);
  });

  it('should emit when clicking outside the element', () => {
    const outsideButton = fixture.nativeElement.querySelector('.outside-button') as HTMLButtonElement;

    // Click outside button
    outsideButton.click();
    expect(component.clickOutsideCount).toBe(1);
  });

  it('should emit when clicking on document body', () => {
    // Simulate clicking on document body
    document.body.click();
    expect(component.clickOutsideCount).toBe(1);
  });

  it('should emit multiple times for multiple outside clicks', () => {
    const outsideButton = fixture.nativeElement.querySelector('.outside-button') as HTMLButtonElement;

    // Multiple clicks outside
    outsideButton.click();
    outsideButton.click();
    document.body.click();

    expect(component.clickOutsideCount).toBe(3);
  });

  it('should handle nested elements correctly', () => {
    const container = fixture.nativeElement.querySelector('.container') as HTMLElement;
    const target = fixture.nativeElement.querySelector('.target') as HTMLElement;

    // Click on container (outside target)
    container.click();
    expect(component.clickOutsideCount).toBe(1);

    // Click on target itself (inside)
    target.click();
    expect(component.clickOutsideCount).toBe(1); // Should not increment
  });

  it('should attach directive to element', () => {
    const directiveElement = fixture.debugElement.query(By.directive(ClickOutsideDirective));
    const directive = directiveElement.injector.get(ClickOutsideDirective);
    
    expect(directive).toBeTruthy();
    expect(directive.appClickOutside).toBeDefined();
  });
});