import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { N8nServiceComponent } from './n8n-service.component';

describe('N8nServiceComponent', () => {
  let fixture: ComponentFixture<N8nServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [N8nServiceComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(N8nServiceComponent);
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
