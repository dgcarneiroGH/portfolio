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

    fixture.componentRef.setInput('imgBase', 'me_reflection');
    fixture.componentRef.setInput('altText', 'Diego Carneiro profile photo');
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  describe('creation', () => {
    it('should create with required inputs', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('srcset', () => {
    it('should build srcset from imgBase with 480w and 960w variants', () => {
      expect(component.srcset()).toBe(
        'assets/images/photos/me_reflection-480.avif 480w, assets/images/photos/me_reflection-960.avif 960w'
      );
    });
  });

  describe('accessibility — figure semantics', () => {
    it('should render a figure with an img carrying the provided altText', () => {
      const img = fixture.nativeElement.querySelector(
        'img'
      ) as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.alt).toBe('Diego Carneiro profile photo');
    });
  });

  describe('accent variants', () => {
    it('should default to neutral accent (no amber or blue class)', () => {
      expect(fixture.nativeElement.querySelector('.photo--amber')).toBe(null);
      expect(fixture.nativeElement.querySelector('.photo--blue')).toBe(null);
    });

    it('should apply the amber class when accent is amber', () => {
      fixture.componentRef.setInput('accent', 'amber');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.photo--amber')).toBeTruthy();
    });

    it('should apply the blue class when accent is blue', () => {
      fixture.componentRef.setInput('accent', 'blue');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.photo--blue')).toBeTruthy();
    });
  });
});
