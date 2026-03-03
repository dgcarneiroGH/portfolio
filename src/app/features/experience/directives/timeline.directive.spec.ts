import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TimelineDirective } from './timeline.directive';

@Component({
  template: `<div appTimeline customClassName="in-view" style="height:10px"></div>`,
  imports: [TimelineDirective]
})
class TestHostComponent {}

describe('TimelineDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    hostEl = fixture.debugElement.query(By.directive(TimelineDirective)).nativeElement as HTMLElement;
  });

  afterEach(() => fixture.destroy());

  describe('creation', () => {
    it('should attach to the host element', () => {
      expect(hostEl).toBeTruthy();
    });
  });

  describe('#isElementInViewport', () => {
    it('should return true when element is fully inside the viewport', () => {
      const directive = fixture.debugElement
        .query(By.directive(TimelineDirective))
        .injector.get(TimelineDirective);

      // Mock getBoundingClientRect to simulate in-viewport element
      spyOn(hostEl, 'getBoundingClientRect').and.returnValue({
        top: 10, left: 10, bottom: 100, right: 200,
        width: 190, height: 90, x: 10, y: 10,
        toJSON: () => ({})
      } as DOMRect);

      expect(directive.isElementInViewport(hostEl)).toBeTrue();
    });

    it('should return false when element is below the viewport', () => {
      const directive = fixture.debugElement
        .query(By.directive(TimelineDirective))
        .injector.get(TimelineDirective);

      spyOn(hostEl, 'getBoundingClientRect').and.returnValue({
        top: 9999, left: 0, bottom: 10000, right: 200,
        width: 200, height: 1, x: 0, y: 9999,
        toJSON: () => ({})
      } as DOMRect);

      expect(directive.isElementInViewport(hostEl)).toBeFalse();
    });
  });

  describe('#toggleView', () => {
    it('should add className when element is visible', () => {
      const directive = fixture.debugElement
        .query(By.directive(TimelineDirective))
        .injector.get(TimelineDirective);

      spyOn(directive, 'isElementInViewport').and.returnValue(true);
      hostEl.classList.remove('in-view');

      directive.toggleView();

      expect(hostEl.classList.contains('in-view')).toBeTrue();
    });

    it('should remove className when element is out of viewport', () => {
      const directive = fixture.debugElement
        .query(By.directive(TimelineDirective))
        .injector.get(TimelineDirective);

      // First add the class
      spyOn(directive, 'isElementInViewport').and.returnValue(false);
      hostEl.classList.add('in-view');

      directive.toggleView();

      expect(hostEl.classList.contains('in-view')).toBeFalse();
    });

    it('should NOT add duplicate className when already in viewport', () => {
      const directive = fixture.debugElement
        .query(By.directive(TimelineDirective))
        .injector.get(TimelineDirective);

      spyOn(directive, 'isElementInViewport').and.returnValue(true);
      hostEl.classList.add('in-view');

      directive.toggleView();

      const count = Array.from(hostEl.classList).filter(c => c === 'in-view').length;
      expect(count).toBe(1);
    });
  });
});
