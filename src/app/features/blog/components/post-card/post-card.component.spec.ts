import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';
import { SanityService } from '../../../../core/services/sanity.service';
import { PostCardComponent } from './post-card.component';
import { BLOG_FILTERS } from '../../constants/blog-filter.constants';
import { PostCategoryType } from '../../models/blog-filter.model';
import { SanityImage } from '../../../../core/models/sanity.models';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

// Register locales for tests
registerLocaleData(localeEs, 'es-ES');
registerLocaleData(localeEn, 'en-US');

describe('PostCardComponent', () => {
  let component: PostCardComponent;
  let fixture: ComponentFixture<PostCardComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSanityService: jasmine.SpyObj<SanityService>;
  let mockImageBuilder: jasmine.SpyObj<any>;

  beforeEach(async () => {
    // Create mock image builder chain
    const mockUrlMethod = jasmine
      .createSpy('url')
      .and.returnValue('https://example.com/image.jpg');
    const mockHeightMethod = jasmine
      .createSpy('height')
      .and.returnValue({ url: mockUrlMethod });
    const mockWidthMethod = jasmine
      .createSpy('width')
      .and.returnValue({ height: mockHeightMethod });
    mockImageBuilder = mockWidthMethod;

    // Create service mocks
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSanityService = jasmine.createSpyObj('SanityService', ['imageBuilder']);
    mockSanityService.imageBuilder.and.returnValue({
      width: mockWidthMethod
    } as any);

    await TestBed.configureTestingModule({
      imports: [PostCardComponent, ButtonComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SanityService, useValue: mockSanityService },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostCardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#inputs', () => {
    it('should accept and store title input', () => {
      const testTitle = 'Test Blog Post Title';
      fixture.componentRef.setInput('title', testTitle);
      fixture.detectChanges();

      expect(component.title).toBe(testTitle);
    });

    it('should accept and store date input', () => {
      const testDate = new Date('2024-01-01');
      fixture.componentRef.setInput('date', testDate);
      fixture.detectChanges();

      expect(component.date).toBe(testDate);
    });

    it('should accept and store excerpt input', () => {
      const testExcerpt = 'This is a test excerpt for the blog post.';
      fixture.componentRef.setInput('excerpt', testExcerpt);
      fixture.detectChanges();

      expect(component.excerpt).toBe(testExcerpt);
    });

    it('should accept and store slug input', () => {
      const testSlug = 'test-blog-post';
      fixture.componentRef.setInput('slug', testSlug);
      fixture.detectChanges();

      expect(component.slug).toBe(testSlug);
    });

    it('should accept and store currentLocale input', () => {
      const testLocale = 'en-US';
      fixture.componentRef.setInput('currentLocale', testLocale);
      fixture.detectChanges();

      expect(component.currentLocale).toBe(testLocale);
    });

    it('should accept and store optional image input', () => {
      const testImage: SanityImage = {
        _type: 'image',
        asset: {
          _ref: 'image-test123',
          _type: 'reference'
        }
      };
      fixture.componentRef.setInput('image', testImage);
      fixture.detectChanges();

      expect(component.image).toBe(testImage);
    });

    it('should accept and store optional category input', () => {
      const testCategory = PostCategoryType.CODERS4CHANGE;
      fixture.componentRef.setInput('category', testCategory);
      fixture.detectChanges();

      expect(component.category).toBe(testCategory);
    });

    it('should handle undefined optional inputs', () => {
      fixture.componentRef.setInput('image', undefined);
      fixture.componentRef.setInput('category', undefined);
      fixture.detectChanges();

      expect(component.image).toBeUndefined();
      expect(component.category).toBeUndefined();
    });
  });

  describe('#categoryLabel getter', () => {
    it('should return null when category is undefined', () => {
      fixture.componentRef.setInput('category', undefined);
      fixture.detectChanges();

      expect(component.categoryLabel).toBeNull();
    });

    it('should return null when category is null', () => {
      fixture.componentRef.setInput('category', null);
      fixture.detectChanges();

      expect(component.categoryLabel).toBeNull();
    });

    it('should return correct label for CODERS4CHANGE category', () => {
      fixture.componentRef.setInput('category', PostCategoryType.CODERS4CHANGE);
      fixture.detectChanges();

      const expectedFilter = BLOG_FILTERS.find(
        (f) => f.category === PostCategoryType.CODERS4CHANGE
      );
      expect(component.categoryLabel).toBe(expectedFilter!.label);
    });

    it('should return correct label for MINDFUL_CODE category', () => {
      fixture.componentRef.setInput('category', PostCategoryType.MINDFUL_CODE);
      fixture.detectChanges();

      const expectedFilter = BLOG_FILTERS.find(
        (f) => f.category === PostCategoryType.MINDFUL_CODE
      );
      expect(component.categoryLabel).toBe(expectedFilter!.label);
    });

    it('should return correct label for N8N_WORKFLOWS category', () => {
      fixture.componentRef.setInput('category', PostCategoryType.N8N_WORKFLOWS);
      fixture.detectChanges();

      const expectedFilter = BLOG_FILTERS.find(
        (f) => f.category === PostCategoryType.N8N_WORKFLOWS
      );
      expect(component.categoryLabel).toBe(expectedFilter!.label);
    });

    it('should return correct label for NEWS category', () => {
      fixture.componentRef.setInput('category', PostCategoryType.NEWS);
      fixture.detectChanges();

      const expectedFilter = BLOG_FILTERS.find(
        (f) => f.category === PostCategoryType.NEWS
      );
      expect(component.categoryLabel).toBe(expectedFilter!.label);
    });

    it('should return null for unknown category', () => {
      fixture.componentRef.setInput('category', 'UNKNOWN_CATEGORY' as any);
      fixture.detectChanges();

      expect(component.categoryLabel).toBeNull();
    });
  });

  describe('#bgUrl getter', () => {
    it('should return empty string when image is undefined', () => {
      fixture.componentRef.setInput('image', undefined);
      fixture.detectChanges();

      expect(component.bgUrl).toBe('');
    });

    it('should return empty string when image is null', () => {
      fixture.componentRef.setInput('image', null);
      fixture.detectChanges();

      expect(component.bgUrl).toBe('');
    });

    it('should return formatted image URL when image is provided', () => {
      const testImage: SanityImage = {
        _type: 'image',
        asset: {
          _ref: 'image-test123',
          _type: 'reference'
        }
      };

      fixture.componentRef.setInput('image', testImage);
      fixture.detectChanges();

      expect(component.bgUrl).toBe('https://example.com/image.jpg');
      expect(mockSanityService.imageBuilder).toHaveBeenCalledWith(testImage);
    });

    it('should call sanity service imageBuilder with correct dimensions', () => {
      const testImage: SanityImage = {
        _type: 'image',
        asset: {
          _ref: 'image-test123',
          _type: 'reference'
        }
      };

      // Setup more detailed mock to verify the chain calls
      const mockUrl = jasmine
        .createSpy('url')
        .and.returnValue('https://example.com/image.jpg');
      const mockHeight = jasmine
        .createSpy('height')
        .and.returnValue({ url: mockUrl });
      const mockWidth = jasmine
        .createSpy('width')
        .and.returnValue({ height: mockHeight });
      mockSanityService.imageBuilder.and.returnValue({
        width: mockWidth
      } as any);

      fixture.componentRef.setInput('image', testImage);
      fixture.detectChanges();

      // Access the getter to trigger the chain
      const url = component.bgUrl;

      expect(mockSanityService.imageBuilder).toHaveBeenCalledWith(testImage);
      expect(mockWidth).toHaveBeenCalledWith(1200);
      expect(mockHeight).toHaveBeenCalledWith(800);
      expect(mockUrl).toHaveBeenCalled();
      expect(url).toBe('https://example.com/image.jpg');
    });

    it('should handle null URL from sanity service', () => {
      const testImage: SanityImage = {
        _type: 'image',
        asset: {
          _ref: 'image-test123',
          _type: 'reference'
        }
      };

      // Mock the chain to return null
      const mockUrl = jasmine.createSpy('url').and.returnValue(null);
      const mockHeight = jasmine
        .createSpy('height')
        .and.returnValue({ url: mockUrl });
      const mockWidth = jasmine
        .createSpy('width')
        .and.returnValue({ height: mockHeight });
      mockSanityService.imageBuilder.and.returnValue({
        width: mockWidth
      } as any);

      fixture.componentRef.setInput('image', testImage);
      fixture.detectChanges();

      expect(component.bgUrl).toBe('');
    });
  });

  describe('#navigateToPostDetail', () => {
    it('should navigate to correct blog post URL', () => {
      const testSlug = 'my-awesome-post';
      fixture.componentRef.setInput('slug', testSlug);
      fixture.detectChanges();

      component.navigateToPostDetail();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/blog/my-awesome-post'
      ]);
    });

    it('should handle empty slug', () => {
      fixture.componentRef.setInput('slug', '');
      fixture.detectChanges();

      component.navigateToPostDetail();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/blog/']);
    });

    it('should handle slug with special characters', () => {
      const testSlug = 'post-with-special-chars-123';
      fixture.componentRef.setInput('slug', testSlug);
      fixture.detectChanges();

      component.navigateToPostDetail();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/blog/post-with-special-chars-123'
      ]);
    });
  });

  describe('#component integration', () => {
    it('should work with all required inputs set', () => {
      const testData = {
        title: 'Integration Test Post',
        date: new Date('2024-01-15'),
        excerpt: 'This is an integration test excerpt.',
        slug: 'integration-test-post',
        currentLocale: 'en-US',
        category: PostCategoryType.CODERS4CHANGE,
        image: {
          _type: 'image' as const,
          asset: {
            _ref: 'image-integration123',
            _type: 'reference' as const
          }
        }
      };

      // Set all inputs
      Object.entries(testData).forEach(([key, value]) => {
        fixture.componentRef.setInput(key, value);
      });
      fixture.detectChanges();

      // Verify all properties are set
      expect(component.title).toBe(testData.title);
      expect(component.date).toBe(testData.date);
      expect(component.excerpt).toBe(testData.excerpt);
      expect(component.slug).toBe(testData.slug);
      expect(component.currentLocale).toBe(testData.currentLocale);
      expect(component.category).toBe(testData.category);
      expect(component.image).toBe(testData.image);

      // Verify computed properties work
      expect(component.categoryLabel).toBeTruthy();
      expect(component.bgUrl).toBe('https://example.com/image.jpg');
    });

    it('should work with only required inputs set', () => {
      const requiredData = {
        title: 'Required Only Post',
        date: new Date('2024-01-15'),
        excerpt: 'This post has only required fields.',
        slug: 'required-only-post',
        currentLocale: 'es-ES'
      };

      // Set only required inputs
      Object.entries(requiredData).forEach(([key, value]) => {
        fixture.componentRef.setInput(key, value);
      });
      fixture.detectChanges();

      // Verify required properties are set
      expect(component.title).toBe(requiredData.title);
      expect(component.date).toBe(requiredData.date);
      expect(component.excerpt).toBe(requiredData.excerpt);
      expect(component.slug).toBe(requiredData.slug);
      expect(component.currentLocale).toBe(requiredData.currentLocale);

      // Verify optional properties are undefined
      expect(component.category).toBeUndefined();
      expect(component.image).toBeUndefined();

      // Verify computed properties handle undefined values
      expect(component.categoryLabel).toBeNull();
      expect(component.bgUrl).toBe('');
    });
  });

  describe('#service dependencies', () => {
    it('should inject Router service', () => {
      expect(component['_router']).toBeTruthy();
      expect(component['_router']).toBe(mockRouter);
    });

    it('should inject SanityService', () => {
      expect(component['_sanityService']).toBeTruthy();
      expect(component['_sanityService']).toBe(mockSanityService);
    });
  });

  describe('#edge cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(1000);
      fixture.componentRef.setInput('title', longTitle);
      fixture.detectChanges();

      expect(component.title).toBe(longTitle);
    });

    it('should handle very long excerpt', () => {
      const longExcerpt =
        'This is a very long excerpt that goes on and on. '.repeat(50);
      fixture.componentRef.setInput('excerpt', longExcerpt);
      fixture.detectChanges();

      expect(component.excerpt).toBe(longExcerpt);
    });

    it('should handle future date', () => {
      const futureDate = new Date('2030-12-31');
      fixture.componentRef.setInput('date', futureDate);
      fixture.detectChanges();

      expect(component.date).toBe(futureDate);
    });

    it('should handle past date', () => {
      const pastDate = new Date('1990-01-01');
      fixture.componentRef.setInput('date', pastDate);
      fixture.detectChanges();

      expect(component.date).toBe(pastDate);
    });

    it('should handle slug with unicode characters', () => {
      const unicodeSlug = 'post-with-áéíóú-characters';
      fixture.componentRef.setInput('slug', unicodeSlug);
      fixture.detectChanges();

      component.navigateToPostDetail();
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/blog/post-with-áéíóú-characters'
      ]);
    });
  });
});
