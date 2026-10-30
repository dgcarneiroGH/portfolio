import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import { provideRouter } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { ProcessedPost } from '../../models/processed-post.model';
import { UsefulService } from '../../services/useful.service';
import { BlogArticleComponent } from './blog-article.component';

// Register locales for the per-locale DatePipe (longDate) assertions
registerLocaleData(localeEn, 'en-US');
registerLocaleData(localeEs, 'es-ES');

// Clave de persistencia del "me resultó útil" para el mockPost (id 'post-1')
const USEFUL_STORAGE_KEY = 'blog.useful.post-1';
// Clave del post B (id 'post-2') usado en el test de respuesta tardía
const POST_B_STORAGE_KEY = 'blog.useful.post-2';

const TRANSLATIONS: Record<string, object> = {
  'en-US': {
    BLOG: {
      BACK_TO_BLOG_ARIA: 'Back to the blog articles list',
      BACK_TO_BLOG: 'Back to blog list',
      ARTICLE: {
        BACK: 'Back to blog',
        USEFUL: 'I FOUND THIS USEFUL',
        SHARE: 'Share:',
        SHARE_LINKEDIN_ARIA: 'Share on LinkedIn',
        PREV: 'Previous Article',
        NEXT: 'Next Article',
        PUBLISHED_ON: 'Published: {{date}}',
        AUTHOR_NAME: 'Nomacoda // Diego',
        AUTHOR_ROLE: 'DEV.LEAD & ARCHITECT',
        AUTHOR_BIO:
          'Frontend Developer & Automations with social purpose. Exploring intersections between high-altitude code, serene design and healthcare impact.',
        AUTHOR_CTA: 'Connect & Collaborate',
        AUTHOR_PHOTO_ALT: 'Photo of Diego (Nomacoda)',
        NAV_ARIA: 'Article navigation'
      }
    }
  },
  'es-ES': {
    BLOG: {
      BACK_TO_BLOG_ARIA: 'Volver a la lista de artículos del blog',
      BACK_TO_BLOG: 'Volver a la lista del blog',
      ARTICLE: {
        BACK: 'Volver al blog',
        USEFUL: 'ME RESULTÓ ÚTIL',
        SHARE: 'Compartir:',
        SHARE_LINKEDIN_ARIA: 'Compartir en LinkedIn',
        PREV: 'Artículo Anterior',
        NEXT: 'Siguiente Artículo',
        PUBLISHED_ON: 'Publicado: {{date}}',
        AUTHOR_NAME: 'Nomacoda // Diego',
        AUTHOR_ROLE: 'DEV.LEAD & ARCHITECT',
        AUTHOR_BIO:
          'Desarrollador Frontend & Automatizaciones con propósito social. Explorando intersecciones entre código de alta montaña, diseño sereno e impacto biosanitario.',
        AUTHOR_CTA: 'Conectar & Colaborar',
        AUTHOR_PHOTO_ALT: 'Foto de Diego (Nomacoda)',
        NAV_ARIA: 'Navegación entre artículos'
      }
    }
  }
};

const mockLoader = {
  getTranslation: (lang: string) =>
    of(TRANSLATIONS[lang] ?? TRANSLATIONS['en-US'])
};

// Normaliza el texto renderizado: el template inserta saltos de línea e
// indentación alrededor de las interpolaciones
const textOf = (el: Element | null): string =>
  (el?.textContent ?? '').replace(/\s+/g, ' ').trim();

const mockPost: ProcessedPost = {
  id: 'post-1',
  slug: 'test-article',
  publishedAt: new Date(2024, 0, 15, 12, 0, 0),
  title: 'Test Article Title',
  excerpt: 'Test excerpt',
  body: '<h2>Primer apartado</h2><p>Párrafo con <strong>negrita</strong> y un <a href="/blog">enlace</a>.</p>' as unknown as SafeHtml,
  imageUrl: 'https://cdn.example.com/hero.jpg',
  category: 'news',
  usefulCount: 3
};

// Artículos adyacentes para la navegación anterior/siguiente (Task 4c)
const mockPrevPost: ProcessedPost = {
  ...mockPost,
  id: 'post-0',
  slug: 'previous-article',
  title: 'Previous Article Title',
  publishedAt: new Date(2023, 11, 1, 12, 0, 0)
};

const mockNextPost: ProcessedPost = {
  ...mockPost,
  id: 'post-2',
  slug: 'next-article',
  title: 'Next Article Title',
  publishedAt: new Date(2024, 2, 20, 12, 0, 0)
};

describe('BlogArticleComponent', () => {
  let component: BlogArticleComponent;
  let fixture: ComponentFixture<BlogArticleComponent>;
  let usefulServiceSpy: jasmine.SpyObj<UsefulService>;

  beforeEach(async () => {
    usefulServiceSpy = jasmine.createSpyObj<UsefulService>('UsefulService', [
      'markUseful'
    ]);
    localStorage.removeItem(USEFUL_STORAGE_KEY);
    localStorage.removeItem(POST_B_STORAGE_KEY);

    TestBed.configureTestingModule({
      imports: [
        BlogArticleComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    });
    // UsefulService se declara en el `providers` del propio componente (no
    // usa providedIn: 'root'): la sobrescritura debe registrarse antes de
    // compilar para que el componente inyecte el spy y no el service real.
    TestBed.overrideProvider(UsefulService, { useValue: usefulServiceSpy });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(BlogArticleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('post', mockPost);
    fixture.componentRef.setInput('currentLocale', 'en-US');
    TestBed.inject(TranslateService).use('en-US');
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    localStorage.removeItem(USEFUL_STORAGE_KEY);
    localStorage.removeItem(POST_B_STORAGE_KEY);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#inputs', () => {
    it('should expose the post and currentLocale inputs as signals', () => {
      expect(component.post()).toBe(mockPost);
      expect(component.currentLocale()).toBe('en-US');
    });
  });

  describe('#template rendering', () => {
    it('should render the post title as the only h1 of the article', () => {
      const el = fixture.nativeElement as HTMLElement;
      const title = el.querySelector('.article__title');

      expect(title).not.toBeNull();
      expect(title?.textContent?.trim()).toBe('Test Article Title');
      expect(el.querySelectorAll('h1').length).toBe(1);
    });

    it('should render the publish date localized with the currentLocale', () => {
      const el = fixture.nativeElement as HTMLElement;
      const date = el.querySelector('.article__header__date');

      expect(date).not.toBeNull();
      expect(date?.textContent?.trim()).toBe('January 15, 2024');
    });

    it('should render the hero image with the post url and the post title as alt', () => {
      const el = fixture.nativeElement as HTMLElement;
      const image = el.querySelector('.article__image') as HTMLImageElement;

      expect(image).not.toBeNull();
      expect(image.getAttribute('src')).toBe(
        'https://cdn.example.com/hero.jpg'
      );
      expect(image.getAttribute('alt')).toBe('Test Article Title');
    });

    it('should render the body html inside the article body container', () => {
      const el = fixture.nativeElement as HTMLElement;
      const body = el.querySelector('.article__body') as HTMLElement;

      expect(body).not.toBeNull();
      expect(body.querySelector('h2')?.textContent).toContain(
        'Primer apartado'
      );
      expect(body.querySelector('p')?.textContent).toContain('Párrafo con');
      expect(body.querySelector('strong')?.textContent).toContain('negrita');
      expect(body.querySelector('a')?.getAttribute('href')).toBe('/blog');
    });

    it('should render the back link as a pill whose accessible name is its visible text, with a decorative icon', () => {
      const el = fixture.nativeElement as HTMLElement;
      const back = el.querySelector(
        '.article__header__back'
      ) as HTMLAnchorElement;

      expect(back).not.toBeNull();
      // WCAG 2.5.3 (Label in Name): el nombre accesible es el texto visible;
      // un aria-label que lo sustituya queda prohibido (ruling del redesign).
      expect(back.getAttribute('aria-label')).toBeNull();
      expect(back.textContent?.trim()).toContain('Back to blog');

      const icon = back.querySelector('svg');
      expect(icon).not.toBeNull();
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
      expect(back.querySelector('img')).toBeNull();
    });

    it('should hide the decorative glow from assistive technology', () => {
      const el = fixture.nativeElement as HTMLElement;
      const glow = el.querySelector('.article__figure__glow');

      expect(glow).not.toBeNull();
      expect(glow?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('#i18n', () => {
    it('should translate the back link label with the active language', () => {
      TestBed.inject(TranslateService).use('es-ES');
      fixture.detectChanges();

      const back = (fixture.nativeElement as HTMLElement).querySelector(
        '.article__header__back'
      ) as HTMLAnchorElement;

      expect(back.textContent?.trim()).toContain('Volver al blog');
      expect(back.getAttribute('aria-label')).toBeNull();
    });
  });

  describe('#locales', () => {
    it('should format the date in spanish when currentLocale is es-ES', () => {
      fixture.componentRef.setInput('currentLocale', 'es-ES');
      fixture.detectChanges();

      const date = (fixture.nativeElement as HTMLElement).querySelector(
        '.article__header__date'
      );

      expect(date?.textContent?.trim()).toBe('15 de enero de 2024');
    });
  });

  describe('#edge cases', () => {
    it('should not render the figure when the post has no image', () => {
      const noImagePost: ProcessedPost = { ...mockPost, imageUrl: '' };
      fixture.componentRef.setInput('post', noImagePost);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;

      expect(el.querySelector('.article__image')).toBeNull();
      expect(el.querySelector('.article__figure')).toBeNull();
    });
  });

  describe('#useful button', () => {
    it('should render the useful control as a button whose accessible name is the visible label + count (no aria-label) with aria-pressed false', () => {
      const el = fixture.nativeElement as HTMLElement;
      const useful = el.querySelector('.article__useful') as HTMLButtonElement;

      expect(useful).not.toBeNull();
      expect(useful.tagName).toBe('BUTTON');
      expect(useful.getAttribute('type')).toBe('button');
      expect(useful.getAttribute('aria-pressed')).toBe('false');
      // WCAG 2.5.3: sin aria-label — el nombre accesible proviene del texto
      // visible (label + contador); aria-pressed comunica el estado del toggle.
      expect(useful.getAttribute('aria-label')).toBeNull();
      expect(useful.textContent).toContain('I FOUND THIS USEFUL');
      expect(useful.textContent).toContain('3');

      const count = useful.querySelector('.article__useful__count');
      expect(count?.textContent?.trim()).toBe('3');
    });

    it('should send the POST on click, show the optimistic count, persist the flag and settle on the authoritative count', () => {
      const authoritativeCount$ = new Subject<number>();
      usefulServiceSpy.markUseful.and.returnValue(authoritativeCount$);

      const useful = (fixture.nativeElement as HTMLElement).querySelector(
        '.article__useful'
      ) as HTMLButtonElement;

      useful.click();
      fixture.detectChanges();

      expect(usefulServiceSpy.markUseful).toHaveBeenCalledOnceWith('post-1');
      expect(useful.getAttribute('aria-pressed')).toBe('true');
      expect(
        useful.querySelector('.article__useful__count')?.textContent?.trim()
      ).toBe('4');
      expect(localStorage.getItem(USEFUL_STORAGE_KEY)).toBe('true');

      authoritativeCount$.next(7);
      fixture.detectChanges();

      expect(
        useful.querySelector('.article__useful__count')?.textContent?.trim()
      ).toBe('7');
    });

    it('should not let a late successful response from the previous post overwrite the current post badge', () => {
      const authoritativeCount$ = new Subject<number>();
      usefulServiceSpy.markUseful.and.returnValue(authoritativeCount$);

      const useful = (fixture.nativeElement as HTMLElement).querySelector(
        '.article__useful'
      ) as HTMLButtonElement;

      useful.click();
      fixture.detectChanges();

      expect(usefulServiceSpy.markUseful).toHaveBeenCalledOnceWith('post-1');

      // La instancia se reutiliza al navegar anterior/siguiente (misma ruta,
      // cambia el param): el post de turno pasa a B antes de que llegue la
      // respuesta en vuelo del post A.
      const postB: ProcessedPost = {
        ...mockPost,
        id: 'post-2',
        slug: 'next-article',
        usefulCount: 9
      };
      fixture.componentRef.setInput('post', postB);
      fixture.detectChanges();

      authoritativeCount$.next(7); // count autoritativo del post A
      fixture.detectChanges();

      // El badge muestra el count propio de B (9), ni el optimista de A (4)
      // ni el autoritativo de A (7).
      expect(
        useful.querySelector('.article__useful__count')?.textContent?.trim()
      ).toBe('9');
      // La respuesta tardía no marca el artículo actual.
      expect(useful.getAttribute('aria-pressed')).toBe('false');
      expect(localStorage.getItem(POST_B_STORAGE_KEY)).toBeNull();
      // El click de A sí llegó al backend: su marca persiste legítimamente
      // (solo el error revierte el flag persistido).
      expect(localStorage.getItem(USEFUL_STORAGE_KEY)).toBe('true');
    });

    it('should clean the persisted mark of a failed click even when the error arrives after switching posts', () => {
      spyOn(console, 'error'); // suppress expected error log
      const failingCount$ = new Subject<number>();
      usefulServiceSpy.markUseful.and.returnValue(failingCount$);

      const useful = (fixture.nativeElement as HTMLElement).querySelector(
        '.article__useful'
      ) as HTMLButtonElement;

      useful.click();
      fixture.detectChanges();

      expect(localStorage.getItem(USEFUL_STORAGE_KEY)).toBe('true');

      const postB: ProcessedPost = {
        ...mockPost,
        id: 'post-2',
        slug: 'next-article',
        usefulCount: 9
      };
      fixture.componentRef.setInput('post', postB);
      fixture.detectChanges();

      failingCount$.error(new Error('Fallo simulado del servicio'));
      fixture.detectChanges();

      // El badge de B conserva su propio count (el error de A no lo toca)...
      expect(
        useful.querySelector('.article__useful__count')?.textContent?.trim()
      ).toBe('9');
      expect(useful.getAttribute('aria-pressed')).toBe('false');
      // ...y el click fallido de A no deja marca persistida, llegue cuando
      // llegue la respuesta.
      expect(localStorage.getItem(USEFUL_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem(POST_B_STORAGE_KEY)).toBeNull();
    });

    it('should not call the service again on a repeated click while already marked', () => {
      usefulServiceSpy.markUseful.and.returnValue(of(7));

      const useful = (fixture.nativeElement as HTMLElement).querySelector(
        '.article__useful'
      ) as HTMLButtonElement;

      useful.click();
      useful.click();
      fixture.detectChanges();

      expect(usefulServiceSpy.markUseful).toHaveBeenCalledTimes(1);
      expect(useful.getAttribute('aria-pressed')).toBe('true');
    });

    it('should restore the marked state from localStorage on init and keep the guard', () => {
      localStorage.setItem(USEFUL_STORAGE_KEY, 'true');

      const restoredFixture = TestBed.createComponent(BlogArticleComponent);
      restoredFixture.componentRef.setInput('post', mockPost);
      restoredFixture.componentRef.setInput('currentLocale', 'en-US');
      restoredFixture.detectChanges();

      const restored = (
        restoredFixture.nativeElement as HTMLElement
      ).querySelector('.article__useful') as HTMLButtonElement;

      expect(restored.getAttribute('aria-pressed')).toBe('true');

      restored.click();
      restoredFixture.detectChanges();

      expect(usefulServiceSpy.markUseful).not.toHaveBeenCalled();

      restoredFixture.destroy();
    });

    it('should revert the optimistic count, the marked state and the persisted flag when the service fails', () => {
      spyOn(console, 'error'); // suppress expected error log
      usefulServiceSpy.markUseful.and.returnValue(
        throwError(() => new Error('Fallo simulado del servicio'))
      );

      const useful = (fixture.nativeElement as HTMLElement).querySelector(
        '.article__useful'
      ) as HTMLButtonElement;

      useful.click();
      fixture.detectChanges();

      expect(usefulServiceSpy.markUseful).toHaveBeenCalledOnceWith('post-1');
      expect(useful.getAttribute('aria-pressed')).toBe('false');
      expect(
        useful.querySelector('.article__useful__count')?.textContent?.trim()
      ).toBe('3');
      expect(localStorage.getItem(USEFUL_STORAGE_KEY)).toBeNull();
    });
  });

  describe('#linkedin share', () => {
    it('should render the LinkedIn share as a real anchor with target, rel and the current post url', () => {
      const share = (fixture.nativeElement as HTMLElement).querySelector(
        '.article__share-linkedin'
      ) as HTMLAnchorElement;

      expect(share).not.toBeNull();
      expect(share.tagName).toBe('A');
      expect(share.getAttribute('target')).toBe('_blank');
      expect(share.getAttribute('rel')).toBe('noopener noreferrer');
      expect(share.getAttribute('href')).toBe(
        'https://www.linkedin.com/sharing/share-offsite/?url=' +
          encodeURIComponent(`${window.location.origin}/#/blog/test-article`)
      );
    });

    it('should recompute the LinkedIn share url when the post input changes', () => {
      // La instancia se reutiliza al navegar anterior/siguiente (misma ruta,
      // cambia el param): la url compartida debe seguir al post de turno.
      fixture.componentRef.setInput('post', {
        ...mockPost,
        slug: 'another-article'
      });
      fixture.detectChanges();

      const share = (fixture.nativeElement as HTMLElement).querySelector(
        '.article__share-linkedin'
      ) as HTMLAnchorElement;

      expect(share.getAttribute('href')).toBe(
        'https://www.linkedin.com/sharing/share-offsite/?url=' +
          encodeURIComponent(`${window.location.origin}/#/blog/another-article`)
      );
    });

    it('should keep the share prompt as plain text with the translated label', () => {
      const el = fixture.nativeElement as HTMLElement;
      const shareLabel = el.querySelector('.article__share__label');

      expect(shareLabel).not.toBeNull();
      expect(shareLabel?.tagName).toBe('SPAN');
      expect(shareLabel?.textContent?.trim()).toBe('Share:');
    });

    it('should hide the decorative icons of the useful button and the LinkedIn link from assistive technology', () => {
      const el = fixture.nativeElement as HTMLElement;
      const usefulIcon = el.querySelector('.article__useful svg');
      const linkedinIcon = el.querySelector('.article__share-linkedin svg');

      for (const icon of [usefulIcon, linkedinIcon]) {
        expect(icon).not.toBeNull();
        expect(icon?.getAttribute('aria-hidden')).toBe('true');
        expect(icon?.getAttribute('focusable')).toBe('false');
      }
    });

    it('should translate the useful and share labels with the active language', () => {
      TestBed.inject(TranslateService).use('es-ES');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const useful = el.querySelector('.article__useful') as HTMLButtonElement;
      const shareLabel = el.querySelector('.article__share__label');
      const linkedin = el.querySelector('.article__share-linkedin');

      expect(useful.textContent).toContain('ME RESULTÓ ÚTIL');
      expect(useful.getAttribute('aria-label')).toBeNull();
      expect(shareLabel?.textContent?.trim()).toBe('Compartir:');
      expect(linkedin?.getAttribute('aria-label')).toBe(
        'Compartir en LinkedIn'
      );
    });
  });

  describe('#prev/next navigation', () => {
    const setNavigation = (
      previous: ProcessedPost | null,
      next: ProcessedPost | null
    ): void => {
      fixture.componentRef.setInput('previous', previous);
      fixture.componentRef.setInput('next', next);
      fixture.detectChanges();
    };

    it('should not render any nav when there is no previous and no next post', () => {
      const el = fixture.nativeElement as HTMLElement;

      expect(el.querySelector('.article__nav')).toBeNull();
    });

    it('should render the two adjacent links with the slug route, the translated label and the title', () => {
      setNavigation(mockPrevPost, mockNextPost);

      const el = fixture.nativeElement as HTMLElement;
      const nav = el.querySelector('.article__nav');

      expect(nav).not.toBeNull();
      expect(nav?.getAttribute('aria-label')).toBe('Article navigation');

      const links = el.querySelectorAll('.article__nav__link');
      expect(links.length).toBe(2);

      const prev = links[0] as HTMLAnchorElement;
      const next = links[1] as HTMLAnchorElement;

      expect(prev.getAttribute('href')).toBe('/blog/previous-article');
      expect(textOf(prev)).toContain('Previous Article');
      expect(textOf(prev)).toContain('Previous Article Title');

      expect(next.getAttribute('href')).toBe('/blog/next-article');
      expect(textOf(next)).toContain('Next Article');
      expect(textOf(next)).toContain('Next Article Title');
    });

    it('should show the adjacent dates with the d MMM y pattern and the current locale', () => {
      setNavigation(mockPrevPost, mockNextPost);

      const el = fixture.nativeElement as HTMLElement;
      const dates = el.querySelectorAll('.article__nav__date');

      expect(dates.length).toBe(2);
      expect(textOf(dates[0])).toBe('Published: 1 Dec 2023');
      expect(textOf(dates[1])).toBe('Published: 20 Mar 2024');
    });

    it('should render only the previous card when the next post is missing', () => {
      setNavigation(mockPrevPost, null);

      const el = fixture.nativeElement as HTMLElement;
      const links = el.querySelectorAll('.article__nav__link');

      expect(links.length).toBe(1);
      expect((links[0] as HTMLAnchorElement).getAttribute('href')).toBe(
        '/blog/previous-article'
      );
    });

    it('should render only the next card when the previous post is missing', () => {
      setNavigation(null, mockNextPost);

      const el = fixture.nativeElement as HTMLElement;
      const links = el.querySelectorAll('.article__nav__link');

      expect(links.length).toBe(1);
      expect((links[0] as HTMLAnchorElement).getAttribute('href')).toBe(
        '/blog/next-article'
      );
    });

    it('should keep the nav arrows decorative', () => {
      setNavigation(mockPrevPost, mockNextPost);

      const el = fixture.nativeElement as HTMLElement;
      const arrows = el.querySelectorAll('.article__nav__link svg');

      expect(arrows.length).toBe(2);
      for (const arrow of Array.from(arrows)) {
        expect(arrow.getAttribute('aria-hidden')).toBe('true');
        expect(arrow.getAttribute('focusable')).toBe('false');
      }
    });

    it('should translate the navigation with the active language and locale', () => {
      setNavigation(mockPrevPost, mockNextPost);
      TestBed.inject(TranslateService).use('es-ES');
      fixture.componentRef.setInput('currentLocale', 'es-ES');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const nav = el.querySelector('.article__nav');
      const labels = el.querySelectorAll('.article__nav__label');
      const dates = el.querySelectorAll('.article__nav__date');

      expect(nav?.getAttribute('aria-label')).toBe(
        'Navegación entre artículos'
      );
      expect(textOf(labels[0])).toBe('Artículo Anterior');
      expect(textOf(labels[1])).toBe('Siguiente Artículo');
      expect(textOf(dates[0])).toBe('Publicado: 1 dic 2023');
      expect(textOf(dates[1])).toBe('Publicado: 20 mar 2024');
    });
  });

  describe('#author card', () => {
    it('should render the author avatar with a meaningful alt and a decorative status dot', () => {
      const el = fixture.nativeElement as HTMLElement;

      expect(el.querySelector('.article__author')).not.toBeNull();

      const photo = el.querySelector(
        '.article__author__photo'
      ) as HTMLImageElement;
      expect(photo.getAttribute('src')).toBe(
        'assets/images/nomacoda/author.avif'
      );
      expect(photo.getAttribute('alt')).toBe('Photo of Diego (Nomacoda)');

      const dot = el.querySelector('.article__author__dot');
      expect(dot).not.toBeNull();
      expect(dot?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should render the author name, role badge and bio', () => {
      const el = fixture.nativeElement as HTMLElement;

      expect(textOf(el.querySelector('.article__author__name'))).toBe(
        'Nomacoda // Diego'
      );
      expect(textOf(el.querySelector('.article__author__role'))).toBe(
        'DEV.LEAD & ARCHITECT'
      );
      expect(textOf(el.querySelector('.article__author__bio'))).toContain(
        'Frontend Developer & Automations'
      );
    });

    it('should render the CTA as an anchor to the contact page whose accessible name is its visible text plus a decorative arrow', () => {
      const el = fixture.nativeElement as HTMLElement;
      const cta = el.querySelector(
        '.article__author__cta'
      ) as HTMLAnchorElement;

      expect(cta).not.toBeNull();
      expect(cta.getAttribute('href')).toBe('/contact');
      // WCAG 2.5.3: el nombre accesible es el texto visible
      // ("Connect & Collaborate"); sin aria-label que lo sustituya.
      expect(cta.getAttribute('aria-label')).toBeNull();
      expect(textOf(cta)).toContain('Connect & Collaborate');

      const arrow = cta.querySelector('svg');
      expect(arrow).not.toBeNull();
      expect(arrow?.getAttribute('aria-hidden')).toBe('true');
      expect(arrow?.getAttribute('focusable')).toBe('false');
    });

    it('should translate the author card with the active language', () => {
      TestBed.inject(TranslateService).use('es-ES');
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const photo = el.querySelector(
        '.article__author__photo'
      ) as HTMLImageElement;
      const cta = el.querySelector(
        '.article__author__cta'
      ) as HTMLAnchorElement;

      expect(photo.getAttribute('alt')).toBe('Foto de Diego (Nomacoda)');
      expect(textOf(el.querySelector('.article__author__bio'))).toContain(
        'Desarrollador Frontend & Automatizaciones'
      );
      expect(textOf(cta)).toContain('Conectar & Colaborar');
      expect(cta.getAttribute('aria-label')).toBeNull();
    });
  });
});
