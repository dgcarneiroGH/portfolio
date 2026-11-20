import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutoringServiceComponent } from './tutoring-service.component';

describe('TutoringServiceComponent', () => {
  let fixture: ComponentFixture<TutoringServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutoringServiceComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TutoringServiceComponent);
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
