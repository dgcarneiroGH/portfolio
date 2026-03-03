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
      ]
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

  describe('#currentYear (signal)', () => {
    it('should expose the current year', () => {
      expect(component.currentYear()).toBe(new Date().getFullYear());
    });
  });

  describe('#footerText (computed)', () => {
    it('should contain the current year in the footer text', () => {
      const year = new Date().getFullYear();
      expect(component.footerText()).toContain(String(year));
    });

    it('should contain "Portfolio" in the footer text', () => {
      expect(component.footerText()).toContain('Portfolio');
    });

    it('should match the format "© YYYY - Portfolio"', () => {
      const year = new Date().getFullYear();
      expect(component.footerText()).toBe(`© ${year} - Portfolio`);
    });
  });

  describe('#links (signal)', () => {
    it('should expose the social media profiles', () => {
      expect(component.links()).toEqual(SOCIAL_MEDIA_PROFILES);
    });

    it('should include a LinkedIn profile', () => {
      const linkedin = component.links().find(l => l.title === 'LinkedIn');
      expect(linkedin).toBeTruthy();
    });

    it('should include a GitHub profile', () => {
      const github = component.links().find(l => l.title === 'GitHub');
      expect(github).toBeTruthy();
    });

    it('should have a valid URL for each social profile that starts with https', () => {
      const externalLinks = component.links().filter(l => l.profileUrl.startsWith('http'));
      externalLinks.forEach(link => {
        expect(link.profileUrl).toMatch(/^https:\/\//);
      });
    });
  });

  describe('accessibility', () => {
    it('should render social links as anchor elements', () => {
      const anchors = fixture.nativeElement.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>;
      expect(anchors.length).toBeGreaterThan(0);
    });
  });
});
