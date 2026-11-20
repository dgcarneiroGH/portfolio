import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ServicesComponent } from './services.component';

const mockLoader = { getTranslation: () => of({}) };

describe('ServicesComponent', () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ServicesComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useValue: mockLoader }
        })
      ],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the heading and the three intro paragraphs', () => {
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.services-title')).toBeTruthy();
    expect(el.querySelector('.services-title-highlight'))
      .withContext('parte resaltada del título')
      .toBeTruthy();
    expect(el.querySelectorAll('.services-paragraph').length).toBe(3);
  });

  it('renders three service cards with heading, description and bullets', () => {
    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('.services-card');

    expect(cards.length).toBe(3);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      expect(card.querySelector('h3')).withContext(`card ${i} heading`).toBeTruthy();
      expect(card.querySelector('.services-card-description'))
        .withContext(`card ${i} description`)
        .toBeTruthy();
      expect(card.querySelectorAll('.services-card-bullet').length)
        .withContext(`card ${i} bullets`)
        .toBe(3);
    }
  });

  it('renders one card per accent variant', () => {
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.services-card--angular')).toBeTruthy();
    expect(el.querySelector('.services-card--n8n')).toBeTruthy();
    expect(el.querySelector('.services-card--tutoring')).toBeTruthy();
  });

  it('renders a stat (value + label) per card', () => {
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.services-card-stat').length).toBe(3);
    expect(el.querySelectorAll('.services-card-stat-value').length).toBe(3);
    expect(el.querySelectorAll('.services-card-stat-label').length).toBe(3);
  });

  it('renders each card CTA as a link to its service page', () => {
    const el = fixture.nativeElement as HTMLElement;
    const ctas = el.querySelectorAll<HTMLAnchorElement>('a.services-card-cta');

    expect(ctas.length).toBe(3);
    expect(el.querySelector('button.services-card-cta')).toBe(null);
    expect(Array.from(ctas).map((cta) => cta.getAttribute('href'))).toEqual([
      '/angular',
      '/n8n',
      '/tutoring'
    ]);
  });

  describe('destino de navegación', () => {
    it('asigna a cada tarjeta el enlace a su página propia', () => {
      expect(component.services.map((service) => service.link)).toEqual([
        '/angular',
        '/n8n',
        '/tutoring'
      ]);
    });
  });
});
