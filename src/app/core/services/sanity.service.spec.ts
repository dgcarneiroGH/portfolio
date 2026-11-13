import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SanityService } from './sanity.service';

/** Vista de los miembros private del servicio usados en tests. */
interface SanityServiceInternals {
  client: { fetch: (...args: unknown[]) => Promise<unknown> };
  _error: { set: (value: string | null) => void };
  _categories: { set: (value: unknown[]) => void };
}

function internals(service: SanityService): SanityServiceInternals {
  return service as unknown as SanityServiceInternals;
}

describe('SanityService', () => {
  let service: SanityService;

  const mockErrorClient = {
    fetch: () => Promise.reject(new Error('Mock error'))
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(SanityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#signal state', () => {
    it('should start with empty posts', () => {
      expect(service.posts()).toEqual([]);
    });

    it('should start with loading = false', () => {
      expect(service.loading()).toBeFalse();
    });

    it('should start with no error', () => {
      expect(service.error()).toBeNull();
    });

    it('should report postsCount as 0 initially', () => {
      expect(service.postsCount()).toBe(0);
    });

    it('should report hasError as false initially', () => {
      expect(service.hasError()).toBeFalse();
    });

    it('should report isReady as false initially', () => {
      expect(service.isReady()).toBeFalse();
    });
  });

  describe('#computed properties', () => {
    it('should compute postsCount based on posts array length', () => {
      expect(service.postsCount()).toBe(service.posts().length);
    });

    it('should compute hasError as false when error is null', () => {
      service.clearError();
      expect(service.hasError()).toBeFalse();
    });

    it('should compute isReady based on loading and posts', () => {
      expect(service.isReady()).toBeFalse();
    });
  });

  describe('#clearError', () => {
    it('should set error signal to null', () => {
      service.clearError();
      expect(service.error()).toBeNull();
    });

    it('should reset hasError computed to false', () => {
      service.clearError();
      expect(service.hasError()).toBeFalse();
    });
  });

  describe('#fetch method', () => {
    it('should handle fetch errors and set error state', async () => {
      spyOn(console, 'error');
      const originalClient = internals(service).client;
      internals(service).client = mockErrorClient;

      try {
        await service.fetch('test query');
        fail('Should have thrown an error');
      } catch {
        expect(service.error()).toContain('Error fetching data:');
        expect(service.hasError()).toBeTruthy();
      } finally {
        internals(service).client = originalClient;
      }
    });

    it('should call client.fetch with provided parameters', async () => {
      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve({ data: 'test' }));

      const originalClient = internals(service).client;
      internals(service).client = mockClient;

      try {
        await service.fetch('*[_type == "test"]', { param: 'value' });
        expect(mockClient.fetch).toHaveBeenCalledWith('*[_type == "test"]', {
          param: 'value'
        });
      } finally {
        internals(service).client = originalClient;
      }
    });
  });

  describe('#imageBuilder method', () => {
    it('should return a builder object', () => {
      const mockSource = { _id: 'test-image', _type: 'image' };
      const result = service.imageBuilder(mockSource);
      expect(result).toBeDefined();
    });

    it('should handle different source types', () => {
      expect(() => service.imageBuilder({ _ref: 'test' })).not.toThrow();
      expect(() => service.imageBuilder(null)).not.toThrow();
      expect(() => service.imageBuilder(undefined)).not.toThrow();
    });
  });

  describe('#portableTextToHtml', () => {
    it('should return a string for empty blocks array', () => {
      const result = service.portableTextToHtml([] as never);
      expect(typeof result).toBe('string');
    });

    it('should return a string for valid blocks array', () => {
      const mockBlocks = [
        {
          _type: 'block',
          children: [{ text: 'Test content', _type: 'span' }],
          style: 'normal'
        }
      ] as never;

      const result = service.portableTextToHtml(mockBlocks);
      expect(typeof result).toBe('string');
    });

    it('should handle blocks with different components', () => {
      const mockBlocks = [
        {
          _type: 'block',
          style: 'h1',
          children: [{ text: 'Header', _type: 'span' }]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [{ text: 'Paragraph', _type: 'span' }]
        }
      ] as never;

      const result = service.portableTextToHtml(mockBlocks);
      expect(typeof result).toBe('string');
    });

    it('should render external links with target and rel', () => {
      // Los marks referencian markDefs por `_key`, no por `_type`.
      const mockBlocks = [
        {
          _type: 'block',
          children: [
            { text: 'Check out ', _type: 'span' },
            { text: 'this link', _type: 'span', marks: ['l1'] }
          ],
          markDefs: [{ _type: 'link', _key: 'l1', href: 'https://example.com' }]
        }
      ] as never;

      const result = service.portableTextToHtml(mockBlocks);

      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('should render internal links without target or rel', () => {
      const mockBlocks = [
        {
          _type: 'block',
          children: [{ text: 'internal', _type: 'span', marks: ['l2'] }],
          markDefs: [{ _type: 'link', _key: 'l2', href: '/blog' }]
        }
      ] as never;

      const result = service.portableTextToHtml(mockBlocks);

      expect(result).toContain('href="/blog"');
      expect(result).not.toContain('target="_blank"');
      expect(result).not.toContain('rel="noopener');
    });

    it('should render headings, inline marks, lists and images', () => {
      const fakeBuilder = {
        width: () => ({ url: () => 'https://cdn.example.com/img-1200.png' })
      };
      spyOn(service, 'imageBuilder').and.returnValue(fakeBuilder as never);

      const mockBlocks = [
        {
          _type: 'block',
          style: 'h1',
          children: [{ text: 'Title', _type: 'span' }]
        },
        {
          _type: 'block',
          style: 'h2',
          children: [{ text: 'Subtitle', _type: 'span' }]
        },
        {
          _type: 'block',
          style: 'h3',
          children: [{ text: 'Sub-sub', _type: 'span' }]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            { text: 'x', _type: 'span', marks: ['strong'] },
            { text: 'y', _type: 'span', marks: ['em'] },
            { text: 'z', _type: 'span', marks: ['code'] }
          ]
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{ text: 'item uno', _type: 'span' }]
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'number',
          children: [{ text: 'item dos', _type: 'span' }]
        },
        { _type: 'image', asset: { _ref: 'x' }, alt: 'Foto de prueba' },
        { _type: 'image', asset: { _ref: 'y' } }
      ] as never;

      const html = service.portableTextToHtml(mockBlocks);

      expect(html).toContain('<h2>Title</h2>');
      expect(html).toContain('<h2>Subtitle</h2>');
      expect(html).toContain('<h3>Sub-sub</h3>');
      expect(html).toContain('<strong>x</strong><em>y</em><code>z</code>');
      expect(html).toContain('<li>item uno</li>');
      expect(html).toContain('<li>item dos</li>');
      expect(html).toContain('src="https://cdn.example.com/img-1200.png"');
      expect(html).toContain('alt="Foto de prueba"');
      expect(html).toContain('alt=""');
    });
  });

  describe('#loadCategories method', () => {
    it('should set loading to true initially', async () => {
      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      let loadingDuringExecution = false;

      mockClient.fetch.and.callFake(() => {
        loadingDuringExecution = service.loading();
        return Promise.resolve([]);
      });

      const originalClient = internals(service).client;
      internals(service).client = mockClient;

      try {
        await service.loadCategories();
        expect(loadingDuringExecution).toBeTruthy();
      } finally {
        internals(service).client = originalClient;
      }
    });

    it('should set loading to false after completion', async () => {
      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve([]));

      const originalClient = internals(service).client;
      internals(service).client = mockClient;

      try {
        await service.loadCategories();
        expect(service.loading()).toBeFalse();
      } finally {
        internals(service).client = originalClient;
      }
    });

    it('should handle errors and update error state', async () => {
      spyOn(console, 'error');
      const originalClient = internals(service).client;
      internals(service).client = mockErrorClient;

      try {
        await service.loadCategories();
        expect(service.error()).toContain('Error loading categories:');
        expect(service.hasError()).toBeTruthy();
        expect(service.loading()).toBeFalse();
      } finally {
        internals(service).client = originalClient;
      }
    });

    it('should clear error state at start', async () => {
      internals(service)._error.set('Previous error');
      expect(service.hasError()).toBeTruthy();

      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve([]));

      const originalClient = internals(service).client;
      internals(service).client = mockClient;

      try {
        await service.loadCategories();
        expect(service.error()).toBeNull();
      } finally {
        internals(service).client = originalClient;
      }
    });
  });

  describe('#loadPosts method', () => {
    it('should call loadCategories first', async () => {
      const loadCategoriesSpy = spyOn(
        service,
        'loadCategories'
      ).and.returnValue(Promise.resolve());
      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve([]));

      const originalClient = internals(service).client;
      internals(service).client = mockClient;

      try {
        await service.loadPosts();
        expect(loadCategoriesSpy).toHaveBeenCalled();
      } finally {
        internals(service).client = originalClient;
      }
    });

    it('should set loading states correctly', async () => {
      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      let loadingDuringExecution = false;

      mockClient.fetch.and.callFake(() => {
        loadingDuringExecution = service.loading();
        return Promise.resolve([]);
      });

      spyOn(service, 'loadCategories').and.returnValue(Promise.resolve());
      const originalClient = internals(service).client;
      internals(service).client = mockClient;

      try {
        await service.loadPosts();
        expect(loadingDuringExecution).toBeTruthy();
        expect(service.loading()).toBeFalse();
      } finally {
        internals(service).client = originalClient;
      }
    });

    it('should handle errors correctly', async () => {
      spyOn(console, 'error');
      spyOn(service, 'loadCategories').and.returnValue(Promise.resolve());
      const originalClient = internals(service).client;
      internals(service).client = mockErrorClient;

      try {
        await service.loadPosts();
        expect(service.error()).toContain('Error loading posts:');
        expect(service.hasError()).toBeTruthy();
        expect(service.loading()).toBeFalse();
      } finally {
        internals(service).client = originalClient;
      }
    });

    it('should update computed properties after loading posts', async () => {
      const mockPosts = [
        {
          _id: 'post1',
          titleES: 'Test Title',
          titleEN: 'Test Title EN',
          excerptES: 'Test excerpt',
          bodyES: [],
          slug: 'test-post',
          publishedAt: '2024-01-01T00:00:00Z',
          category: 'test-cat'
        }
      ];

      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve(mockPosts));

      spyOn(service, 'loadCategories').and.callFake(() => {
        internals(service)._categories.set([
          { id: 'test-cat', name: { es: 'Test', en: 'Test' }, value: 'test' }
        ]);
        return Promise.resolve();
      });

      const originalClient = internals(service).client;
      internals(service).client = mockClient;

      try {
        await service.loadPosts();

        expect(service.posts().length).toBe(1);
        expect(service.postsCount()).toBe(1);
        expect(service.isReady()).toBeTruthy();
      } finally {
        internals(service).client = originalClient;
      }
    });

    it('should default usefulCount to 0 when the raw post lacks it', async () => {
      const mockPosts = [
        {
          _id: 'post1',
          titleES: 'Test Title',
          titleEN: 'Test Title EN',
          excerptES: 'Test excerpt',
          bodyES: [],
          slug: 'test-post',
          publishedAt: '2024-01-01T00:00:00Z',
          category: 'test-cat'
        }
      ];

      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve(mockPosts));

      spyOn(service, 'loadCategories').and.returnValue(Promise.resolve());

      const originalClient = internals(service).client;
      internals(service).client = mockClient;

      try {
        await service.loadPosts();
        expect(service.posts()[0].usefulCount).toBe(0);
      } finally {
        internals(service).client = originalClient;
      }
    });

    it('should map usefulCount from the raw post when present', async () => {
      const mockPosts = [
        {
          _id: 'post1',
          titleES: 'Test Title',
          titleEN: 'Test Title EN',
          excerptES: 'Test excerpt',
          bodyES: [],
          slug: 'test-post',
          publishedAt: '2024-01-01T00:00:00Z',
          category: 'test-cat',
          usefulCount: 148
        }
      ];

      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve(mockPosts));

      spyOn(service, 'loadCategories').and.returnValue(Promise.resolve());

      const originalClient = internals(service).client;
      internals(service).client = mockClient;

      try {
        await service.loadPosts();
        expect(service.posts()[0].usefulCount).toBe(148);
      } finally {
        internals(service).client = originalClient;
      }
    });

    it('should apply fallbacks when the raw post lacks optional fields', async () => {
      const mockPosts = [
        {
          _id: 'post-min',
          slug: 'post-min',
          publishedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve(mockPosts));
      spyOn(service, 'loadCategories').and.returnValue(Promise.resolve());

      const originalClient = internals(service).client;
      internals(service).client = mockClient;

      try {
        await service.loadPosts();

        const post = service.posts()[0];
        expect(post.title).toEqual({ es: '', en: '' });
        expect(post.excerpt).toEqual({ es: '' });
        expect('en' in post.excerpt).toBeFalse();
        expect(post.body).toEqual({ es: [] });
        expect('en' in post.body).toBeFalse();
        expect(post.image).toBeUndefined();
      } finally {
        internals(service).client = originalClient;
      }
    });
  });

  describe('#refreshPosts method', () => {
    it('should call loadPosts', async () => {
      const loadPostsSpy = spyOn(service, 'loadPosts').and.returnValue(
        Promise.resolve()
      );

      await service.refreshPosts();

      expect(loadPostsSpy).toHaveBeenCalled();
    });

    it('should return a Promise', () => {
      spyOn(service, 'loadPosts').and.returnValue(Promise.resolve());

      const result = service.refreshPosts();

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('#integration scenarios', () => {
    it('should maintain consistent state through error and recovery', async () => {
      spyOn(console, 'error');
      const originalClient = internals(service).client;
      internals(service).client = mockErrorClient;

      try {
        await service.loadCategories();
      } catch {
        // Expected error
      }

      expect(service.hasError()).toBeTruthy();
      expect(service.loading()).toBeFalse();

      service.clearError();
      expect(service.hasError()).toBeFalse();
      expect(service.error()).toBeNull();

      internals(service).client = originalClient;
    });

    it('should handle multiple sequential operations', async () => {
      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve([]));

      const originalClient = internals(service).client;
      internals(service).client = mockClient;

      try {
        await service.loadCategories();
        expect(service.error()).toBeNull();

        service.clearError();
        expect(service.error()).toBeNull();

        await service.refreshPosts();
        expect(mockClient.fetch).toHaveBeenCalled();
      } finally {
        internals(service).client = originalClient;
      }
    });
  });
});
