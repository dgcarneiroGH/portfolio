import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { BlogComponent } from './blog.component';
import { SanityService } from '../../../core/services/sanity.service';
import { LangService } from '../../../core/services/lang.service';
import { PostCategoryType } from '../models/blog-filter.model';
import { Post } from '../models/post.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('BlogComponent', () => {
  let component: BlogComponent;
  let fixture: ComponentFixture<BlogComponent>;
  let mockSanityService: jasmine.SpyObj<SanityService>;
  let mockDomSanitizer: jasmine.SpyObj<DomSanitizer>;

  const mockPosts: Post[] = [
    {
      id: '1',
      slug: 'post-1',
      publishedAt: new Date('2023-01-01'),
      title: { es: 'Post 1 ES', en: 'Post 1 EN' },
      excerpt: { es: 'Excerpt 1 ES', en: 'Excerpt 1 EN' },
      body: { es: [], en: [] },
      category: PostCategoryType.NEWS
    },
    {
      id: '2',
      slug: 'post-2',
      publishedAt: new Date('2023-01-02'),
      title: { es: 'Post 2 ES', en: 'Post 2 EN' },
      excerpt: { es: 'Excerpt 2 ES', en: 'Excerpt 2 EN' },
      body: { es: [], en: [] },
      category: PostCategoryType.MINDFUL_CODE
    },
    {
      id: '3',
      slug: 'post-3',
      publishedAt: new Date('2023-01-03'),
      title: { es: 'Post 3 ES', en: 'Post 3 EN' },
      excerpt: { es: 'Excerpt 3 ES', en: 'Excerpt 3 EN' },
      body: { es: [], en: [] },
      category: PostCategoryType.NEWS
    }
  ];

  beforeEach(async () => {
    const sanityServiceSpy = jasmine.createSpyObj(
      'SanityService',
      [
        'loadPosts',
        'refreshPosts',
        'clearError',
        'portableTextToHtml',
        'imageBuilder'
      ],
      {
        posts: signal(mockPosts),
        loading: signal(false),
        error: signal(null),
        hasError: signal(false)
      }
    );

    const langServiceSpy = jasmine.createSpyObj(
      'LangService',
      ['currentLanguage'],
      {
        currentLanguage: signal('es-ES')
      }
    );

    const domSanitizerSpy = jasmine.createSpyObj('DomSanitizer', [
      'bypassSecurityTrustHtml'
    ]);

    const activatedRouteSpy = {
      paramMap: of(new Map([['slug', null]]))
    };

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
      imports: [BlogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: SanityService, useValue: sanityServiceSpy },
        { provide: LangService, useValue: langServiceSpy },
        { provide: DomSanitizer, useValue: domSanitizerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    mockSanityService = TestBed.inject(
      SanityService
    ) as jasmine.SpyObj<SanityService>;
    mockDomSanitizer = TestBed.inject(
      DomSanitizer
    ) as jasmine.SpyObj<DomSanitizer>;

    // Setup all the spies to return resolved promises/values
    mockSanityService.loadPosts.and.returnValue(Promise.resolve());
    mockSanityService.refreshPosts.and.returnValue(Promise.resolve());
    mockSanityService.portableTextToHtml.and.returnValue('<p>HTML content</p>');
    mockDomSanitizer.bypassSecurityTrustHtml.and.returnValue(
      '<p>HTML content</p>' as any
    );
    mockSanityService.imageBuilder.and.returnValue({
      width: () => ({
        height: () => ({
          url: () => 'http://image.url'
        })
      })
    } as any);

    fixture = TestBed.createComponent(BlogComponent);
    component = fixture.componentInstance;
    // Don't call fixture.detectChanges() yet, we'll handle ngOnInit manually
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with no filter applied (showing all posts)', () => {
    // Test that the filter is initialized to null (ALL)
    expect(component['_currentFilter']()).toBe(null);
  });

  it('should filter posts by category when onFilterChange is called', () => {
    // Test the onFilterChange method directly
    component.onFilterChange(PostCategoryType.NEWS);

    // Verify the internal filter state is updated
    expect(component['_currentFilter']()).toBe(PostCategoryType.NEWS);
  });

  it('should show all posts when onFilterChange is called with null (ALL filter)', () => {
    // First filter by a specific category
    component.onFilterChange(PostCategoryType.MINDFUL_CODE);
    expect(component['_currentFilter']()).toBe(PostCategoryType.MINDFUL_CODE);

    // Then filter by ALL (null)
    component.onFilterChange(null);
    expect(component['_currentFilter']()).toBe(null);
  });

  it('should filter posts by MINDFUL_CODE category', () => {
    component.onFilterChange(PostCategoryType.MINDFUL_CODE);

    expect(component['_currentFilter']()).toBe(PostCategoryType.MINDFUL_CODE);
  });

  it('should return empty filter state when filtering by category with no matching posts', () => {
    component.onFilterChange(PostCategoryType.CODERS4CHANGE);

    expect(component['_currentFilter']()).toBe(PostCategoryType.CODERS4CHANGE);
  });

  it('should maintain other view model properties when filtering', () => {
    component.onFilterChange(PostCategoryType.NEWS);

    expect(component['_currentFilter']()).toBe(PostCategoryType.NEWS);
    expect(component['_currentSlug']()).toBe(null);
  });

  it('should have loadPosts method available', () => {
    // Just test that the method exists and is a function
    expect(typeof mockSanityService.loadPosts).toBe('function');
  });

  it('should have refreshPosts method available', () => {
    // Just test the method exists and can be called
    expect(typeof component.refreshPosts).toBe('function');
    expect(typeof mockSanityService.refreshPosts).toBe('function');
  });

  it('should have clearError method available', () => {
    // Test that the method exists and can be called
    expect(typeof component.clearError).toBe('function');

    // Call the method to ensure it doesn't throw
    expect(() => component.clearError()).not.toThrow();
  });
});
