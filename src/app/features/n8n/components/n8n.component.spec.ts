import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { N8nComponent } from './n8n.component';

describe('N8nComponent', () => {
  let fixture: ComponentFixture<N8nComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [N8nComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(N8nComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders an empty root section (placeholder pendiente de diseño)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('section.n8n')).toBeTruthy();
    expect(el.textContent?.trim()).toBe('');
  });
});
