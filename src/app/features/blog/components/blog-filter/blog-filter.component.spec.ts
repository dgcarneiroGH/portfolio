import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlogFilterComponent } from './blog-filter.component';
import { BLOG_FILTERS } from '../../constants/blog-filter.constants';
import { By } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('BlogFilterComponent', () => {
  let component: BlogFilterComponent;
  let fixture: ComponentFixture<BlogFilterComponent>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const translateServiceSpy = jasmine.createSpyObj(
      'TranslateService',
      ['get', 'instant', 'setDefaultLang', 'use'],
      {
        onLangChange: of(),
        onTranslationChange: of(),
        onDefaultLangChange: of()
      }
    );

    translateServiceSpy.get.and.returnValue(of('translated text'));
    translateServiceSpy.instant.and.returnValue('translated text');

    await TestBed.configureTestingModule({
      imports: [BlogFilterComponent, TranslateModule.forRoot()],
      providers: [{ provide: TranslateService, useValue: translateServiceSpy }]
    }).compileComponents();

    translateService = TestBed.inject(
      TranslateService
    ) as jasmine.SpyObj<TranslateService>;
    fixture = TestBed.createComponent(BlogFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the BLOG_FILTERS constant', () => {
    expect(component.filters).toEqual(BLOG_FILTERS);
  });

  it('should render one pill button per filter', () => {
    const pills = fixture.debugElement.queryAll(
      By.css('[data-testid="filter-pill"]')
    );
    expect(pills.length).toBe(BLOG_FILTERS.length);
  });

  it('should display the filter label text on each pill', () => {
    const pills = fixture.debugElement.queryAll(
      By.css('[data-testid="filter-pill"]')
    );
    // Since we're using a mock that returns 'translated text' for all translations,
    // we just verify that each pill has some text content
    pills.forEach((pill) => {
      expect(pill.nativeElement.textContent.trim()).toBe('translated text');
    });
  });

  it('should render buttons of type "button"', () => {
    const buttons = fixture.nativeElement.querySelectorAll(
      'button[data-testid="filter-pill"]'
    ) as NodeListOf<HTMLButtonElement>;
    buttons.forEach((btn) => {
      expect(btn.type).toBe('button');
    });
  });

  it('should initialize with ALL filter selected (null category)', () => {
    expect(component.selectedFilter()).toBe(null);
  });

  it('should mark ALL filter as selected initially', () => {
    const allFilter = BLOG_FILTERS.find((f) => f.category === null);
    expect(component.isFilterSelected(allFilter!)).toBe(true);
  });

  it('should add active class to selected filter', () => {
    fixture.detectChanges();
    const pills = fixture.debugElement.queryAll(
      By.css('[data-testid="filter-pill"]')
    );
    const allFilterButton = pills[0]; // ALL es el primer filtro

    expect(allFilterButton.nativeElement.classList.contains('active')).toBe(
      true
    );
  });

  it('should select filter when selectFilter is called', () => {
    const testFilter = BLOG_FILTERS[1]; // Cualquier filtro que no sea ALL
    component.selectFilter(testFilter);

    expect(component.selectedFilter()).toBe(testFilter.category);
    expect(component.isFilterSelected(testFilter)).toBe(true);
  });

  it('should emit filterChange event when selectFilter is called', () => {
    spyOn(component.filterChange, 'emit');
    const testFilter = BLOG_FILTERS[2];

    component.selectFilter(testFilter);

    expect(component.filterChange.emit).toHaveBeenCalledWith(
      testFilter.category
    );
  });

  it('should update active class when different filter is selected', () => {
    const testFilter = BLOG_FILTERS[1]; // No ALL filter
    component.selectFilter(testFilter);
    fixture.detectChanges();

    const pills = fixture.debugElement.queryAll(
      By.css('[data-testid="filter-pill"]')
    );
    const selectedPillButton = pills[1].nativeElement;
    const notSelectedPillButton = pills[0].nativeElement; // ALL button

    expect(selectedPillButton.classList.contains('active')).toBe(true);
    expect(notSelectedPillButton.classList.contains('active')).toBe(false);
  });

  it('should handle clicking on filter buttons', () => {
    spyOn(component, 'selectFilter');
    const pills = fixture.debugElement.queryAll(
      By.css('[data-testid="filter-pill"]')
    );
    const testButton = pills[2];

    testButton.nativeElement.click();

    expect(component.selectFilter).toHaveBeenCalledWith(BLOG_FILTERS[2]);
  });
});
