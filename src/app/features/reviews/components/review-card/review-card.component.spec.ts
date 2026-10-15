import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Review } from '../../interfaces/review.interface';
import { ReviewCardComponent } from './review-card.component';

const mockLoader = {
  getTranslation: () => of({ 'REVIEWS.RATING_ARIA': '{{count}} de 5 estrellas' })
};

const mockReview: Review = {
  fullName: 'Carlos M.',
  role: 'CEO & Founder • Startup SaaS',
  message: 'Gran trabajo.',
  rating: 4,
  tag: 'Angular • Telemetría',
  category: 'Automatización',
  variant: 'amber'
};

describe('ReviewCardComponent', () => {
  let component: ReviewCardComponent;
  let fixture: ComponentFixture<ReviewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReviewCardComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('review', mockReview);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render name, role, message, tag and category', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.name')?.textContent).toContain('Carlos M.');
    expect(el.querySelector('.role')?.textContent).toContain('CEO & Founder');
    expect(el.querySelector('.message')?.textContent).toContain('Gran trabajo.');
    expect(el.querySelector('.tag-chip')?.textContent?.trim()).toBe('Angular • Telemetría');
    expect(el.querySelector('.category')?.textContent?.trim()).toBe('Automatización');
  });

  it('should hide role, tag and category when absent', () => {
    const minimal: Review = { fullName: 'Ana', message: 'Bien.', rating: 5 };
    fixture.componentRef.setInput('review', minimal);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.role')).toBeFalsy();
    expect(el.querySelector('.tag-chip')).toBeFalsy();
    expect(el.querySelector('.category')).toBeFalsy();
    expect(el.querySelector('.card-footer')).toBeFalsy();
  });

  it('should light stars according to rating', () => {
    const stars = fixture.nativeElement.querySelectorAll('.star');
    expect(stars.length).toBe(5);
    const lit = fixture.nativeElement.querySelectorAll('.star.lit');
    expect(lit.length).toBe(4);
  });

  it('should expose an accessible rating label', () => {
    const rating = fixture.nativeElement.querySelector('.rating') as HTMLElement;
    expect(rating.getAttribute('role')).toBe('img');
    expect(rating.getAttribute('aria-label')).toBeTruthy();
  });

  it('should apply the variant class and default to teal', () => {
    const card = fixture.nativeElement.querySelector('.review-card') as HTMLElement;
    expect(card.classList.contains('variant-amber')).toBeTrue();

    const minimal: Review = { fullName: 'Ana', message: 'Bien.', rating: 5 };
    fixture.componentRef.setInput('review', minimal);
    fixture.detectChanges();
    expect(card.classList.contains('variant-teal')).toBeTrue();
  });
});
