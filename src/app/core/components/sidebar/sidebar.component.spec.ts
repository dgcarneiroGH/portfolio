import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SOCIAL_MEDIA_PROFILES } from '../../constants/sidebar.constants';
import { SidebarComponent } from './sidebar.component';

const mockLoader = { getTranslation: () => of({}) };

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SidebarComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('#links', () => {
    it('should expose the social media profiles', () => {
      expect(component.links).toEqual(SOCIAL_MEDIA_PROFILES);
    });

    it('should include a WhatsApp profile pointing to wa.me', () => {
      const whatsapp = component.links.find((l) => l.title === 'WhatsApp');
      expect(whatsapp).toBeTruthy();
      expect(whatsapp?.profileUrl).toMatch(/^https:\/\/wa\.me\//);
    });

    it('should map every link to a known inline icon', () => {
      const knownIcons = ['linkedin', 'instagram', 'github', 'cv', 'email', 'whatsapp'];
      component.links.forEach((link) => {
        expect(knownIcons).toContain(link.icon);
      });
    });
  });

  describe('template', () => {
    it('should render a nav landmark with an accessible name', () => {
      const nav = fixture.nativeElement.querySelector('nav.dock');
      expect(nav).toBeTruthy();
      expect(nav.getAttribute('aria-label')).toBeTruthy();
    });

    it('should render one anchor per link with an accessible name', () => {
      const anchors = fixture.nativeElement.querySelectorAll(
        'a.dock__item'
      ) as NodeListOf<HTMLAnchorElement>;
      expect(anchors.length).toBe(component.links.length);
      anchors.forEach((anchor) => {
        expect(anchor.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should open links in a new tab safely', () => {
      const anchors = fixture.nativeElement.querySelectorAll(
        'a.dock__item'
      ) as NodeListOf<HTMLAnchorElement>;
      anchors.forEach((anchor) => {
        expect(anchor.getAttribute('target')).toBe('_blank');
        expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
      });
    });

    it('should decorate inline icons as aria-hidden', () => {
      const icons = fixture.nativeElement.querySelectorAll(
        'svg.dock__icon'
      ) as NodeListOf<SVGSVGElement>;
      expect(icons.length).toBe(component.links.length);
      icons.forEach((icon) => {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });

  describe('toggle', () => {
    it('should be open by default with aria-expanded true', () => {
      expect(component.open()).toBe(true);

      const nav = fixture.nativeElement.querySelector('nav.dock');
      expect(nav.classList.contains('dock--closed')).toBe(false);

      const toggle = fixture.nativeElement.querySelector(
        '.dock__toggle'
      ) as HTMLButtonElement;
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(toggle.getAttribute('aria-controls')).toBe('dock-panel');
      expect(toggle.getAttribute('aria-label')).toBeTruthy();
    });

    it('should control the panel referenced by aria-controls', () => {
      const panel = fixture.nativeElement.querySelector('#dock-panel');
      expect(panel).toBeTruthy();
    });

    it('should collapse when the toggle is clicked', async () => {
      const toggle = fixture.nativeElement.querySelector(
        '.dock__toggle'
      ) as HTMLButtonElement;
      toggle.click();
      await fixture.whenStable();

      expect(component.open()).toBe(false);
      const nav = fixture.nativeElement.querySelector('nav.dock');
      expect(nav.classList.contains('dock--closed')).toBe(true);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('should reopen when the toggle is clicked again', async () => {
      const toggle = fixture.nativeElement.querySelector(
        '.dock__toggle'
      ) as HTMLButtonElement;

      toggle.click();
      await fixture.whenStable();
      toggle.click();
      await fixture.whenStable();

      expect(component.open()).toBe(true);
      const nav = fixture.nativeElement.querySelector('nav.dock');
      expect(nav.classList.contains('dock--closed')).toBe(false);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });
  });
});