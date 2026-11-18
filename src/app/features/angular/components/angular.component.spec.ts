import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularComponent } from './angular.component';

describe('AngularComponent', () => {
  let fixture: ComponentFixture<AngularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(AngularComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders an empty root section (placeholder pendiente de diseño)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('section.angular')).toBeTruthy();
    expect(el.textContent?.trim()).toBe('');
  });
});
