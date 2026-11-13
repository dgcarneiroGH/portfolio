import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { AboutComponent } from './about.component';

const mockLoader = {
  getTranslation: () =>
    of({
      ABOUT: {
        ABOUT_ME: 'Sobre mí',
        TITLE_PURPOSE: 'Front-End con propósito',
        TITLE_SOCIAL_IMPACT: 'Impacto social real',
        TITLE_STRATEGY: 'Estrategia y detalle',
        TITLE_CLIENT_PARTNER: 'Cliente = socio',
        PARAGRAPH_INTRO: 'Párrafo 1',
        PARAGRAPH_SOCIAL_IMPACT: 'Párrafo 2',
        PARAGRAPH_STRATEGY: 'Párrafo 3',
        PARAGRAPH_CLIENT_PARTNER: 'Párrafo 4',
        CAPTION_PROFESSIONAL: 'Caption 1',
        CAPTION_REFLECTION: 'Caption 2',
        CAPTION_RHYTHM: 'Caption 3',
        CAPTION_TRUST: 'Caption 4',
        PHOTO_ALT_PROFESSIONAL: 'Alt 1',
        PHOTO_ALT_REFLECTION: 'Alt 2',
        PHOTO_ALT_MUSIC: 'Alt 3',
        PHOTO_ALT_COLLABORATION: 'Alt 4'
      }
    })
};

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AboutComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es-ES');
    await firstValueFrom(translate.use('es-ES'));

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('heading hierarchy (WCAG)', () => {
    it('should render an sr-only h2 section title and h3 badges inside cards', () => {
      const el = fixture.nativeElement as HTMLElement;
      const h2 = el.querySelector('h2.sr-only');
      expect(h2?.textContent).toContain('Sobre mí');

      const badges = el.querySelectorAll('h3.about-badge');
      expect(badges.length).toBe(4);
    });

    it('should not skip heading levels (no h1/h4+)', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('h1')).toBe(null);
      expect(el.querySelector('h4, h5, h6')).toBe(null);
    });
  });

  describe('structure', () => {
    it('should render 4 horizontal cards', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('.about-card').length).toBe(4);
    });

    it('should mark only the second card as flipped (photo right on desktop, top on mobile)', () => {
      const el = fixture.nativeElement as HTMLElement;
      const cards = el.querySelectorAll('.about-card');
      expect(cards[0].classList.contains('about-card--flip')).toBe(false);
      expect(cards[1].classList.contains('about-card--flip')).toBe(true);
      expect(cards[2].classList.contains('about-card--flip')).toBe(false);
      expect(cards[3].classList.contains('about-card--flip')).toBe(false);
    });

    it('should place the photo first in cards 1 and 3 (photo on top in column) and last in cards 2 and 4', () => {
      const el = fixture.nativeElement as HTMLElement;
      const cards = Array.from(el.querySelectorAll('.about-card'));
      const children = cards.map((card) =>
        Array.from(card.children).map((child) => child.tagName.toLowerCase())
      );
      expect(children[0][0]).toBe('app-photo');
      expect(children[2][0]).toBe('app-photo');
      expect(children[1][children[1].length - 1]).toBe('app-photo');
      expect(children[3][children[3].length - 1]).toBe('app-photo');
    });

    it('should render 4 photos', () => {
      const el = fixture.nativeElement as HTMLElement;
      const figures = el.querySelectorAll('.about-card figure');
      expect(figures.length).toBe(4);
    });

    it('should mark decorative orbs as aria-hidden', () => {
      const el = fixture.nativeElement as HTMLElement;
      const orbs = el.querySelector('.about-orbs');
      expect(orbs?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('accent variants', () => {
    it('should use blue photo accent on card 1, amber on card 2 and neutral elsewhere', () => {
      const el = fixture.nativeElement as HTMLElement;
      const figures = el.querySelectorAll('.about-card figure');
      expect(figures[0].classList.contains('photo--blue')).toBe(true);
      expect(figures[1].classList.contains('photo--amber')).toBe(true);
      expect(figures[2].classList.contains('photo--amber')).toBe(false);
      expect(figures[2].classList.contains('photo--blue')).toBe(false);
      expect(figures[3].classList.contains('photo--amber')).toBe(false);
      expect(figures[3].classList.contains('photo--blue')).toBe(false);
    });

    it('should use amber badge on card 2 and neutral badge on card 3 (default blue elsewhere)', () => {
      const el = fixture.nativeElement as HTMLElement;
      const badges = el.querySelectorAll('h3.about-badge');
      expect(badges.length).toBe(4);
      expect(badges[0].classList.contains('about-badge--amber')).toBe(false);
      expect(badges[0].classList.contains('about-badge--neutral')).toBe(false);
      expect(badges[1].classList.contains('about-badge--amber')).toBe(true);
      expect(badges[2].classList.contains('about-badge--neutral')).toBe(true);
      expect(badges[3].classList.contains('about-badge--amber')).toBe(false);
      expect(badges[3].classList.contains('about-badge--neutral')).toBe(false);
    });
  });
});
