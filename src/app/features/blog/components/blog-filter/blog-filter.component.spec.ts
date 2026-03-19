import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlogFilterComponent } from './blog-filter.component';
import { BLOG_FILTERS } from '../../constants/blog-filter.constants';
import { By } from '@angular/platform-browser';

describe('BlogFilterComponent', () => {
  let component: BlogFilterComponent;
  let fixture: ComponentFixture<BlogFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogFilterComponent]
    }).compileComponents();

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
    const pills = fixture.debugElement.queryAll(By.css('[data-testid="filter-pill"]'));
    expect(pills.length).toBe(BLOG_FILTERS.length);
  });

  it('should display the filter label text on each pill', () => {
    const pills = fixture.debugElement.queryAll(By.css('[data-testid="filter-pill"]'));
    BLOG_FILTERS.forEach((filter, index) => {
      expect(pills[index].nativeElement.textContent.trim()).toBe(filter.label);
    });
  });

  it('should render buttons of type "button"', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button[data-testid="filter-pill"]') as NodeListOf<HTMLButtonElement>;
    buttons.forEach((btn) => {
      expect(btn.type).toBe('button');
    });
  });
});
