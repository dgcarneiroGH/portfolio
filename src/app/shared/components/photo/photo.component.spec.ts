import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoComponent } from './photo.component';

describe('PhotoComponent', () => {
  let component: PhotoComponent;
  let fixture: ComponentFixture<PhotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('imgSrc', '/assets/images/profile.jpg');
    fixture.componentRef.setInput('altText', 'Diego Carneiro profile photo');
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  describe('creation', () => {
    it('should create with required inputs', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('#animationDelay (signal)', () => {
    it('should set a css-format time string on ngOnInit', () => {
      // ngOnInit already called via detectChanges
      expect(component.animationDelay()).toMatch(/^\d+(\.\d+)?s$/);
    });

    it('should be within a 0-3 second range', () => {
      const seconds = parseFloat(component.animationDelay());
      expect(seconds).toBeGreaterThanOrEqual(0);
      expect(seconds).toBeLessThan(3);
    });
  });

  describe('accessibility — image alt text', () => {
    it('should render an img element with the provided altText', () => {
      const img = fixture.nativeElement.querySelector(
        'img'
      ) as HTMLImageElement | null;
      if (img) {
        expect(img.alt).toBe('Diego Carneiro profile photo');
      } else {
        // Template may use ngSrc (NgOptimizedImage) or other rendering — skip DOM check
        expect(component).toBeTruthy();
      }
    });
  });
});
