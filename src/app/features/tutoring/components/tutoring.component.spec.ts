import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutoringComponent } from './tutoring.component';

describe('TutoringComponent', () => {
  let fixture: ComponentFixture<TutoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutoringComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TutoringComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders an empty root section (placeholder pendiente de diseño)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('section.tutoring')).toBeTruthy();
    expect(el.textContent?.trim()).toBe('');
  });
});
