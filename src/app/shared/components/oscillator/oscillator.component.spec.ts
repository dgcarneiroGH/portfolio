import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { OscillatorComponent } from './oscillator.component';

describe('OscillatorComponent', () => {
  let component: OscillatorComponent;
  let fixture: ComponentFixture<OscillatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OscillatorComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(OscillatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) fixture.destroy();
  });

  it('should decorate host with aria-hidden="true"', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('should have a non-focusable canvas descendant', () => {
    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.tabIndex).toBe(-1);
    expect(canvas.hasAttribute('tabindex')).toBeFalse();
  });
});