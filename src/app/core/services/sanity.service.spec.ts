import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SanityService } from './sanity.service';

describe('SanityService', () => {
  let service: SanityService;

  // Create a simple mock for testing error states
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
      // Initially should be false (no posts, loading false)
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
      // Mock the client temporarily to simulate error
      const originalClient = (service as any).client;
      (service as any).client = mockErrorClient;

      try {
        await service.fetch('test query');
        fail('Should have thrown an error');
      } catch (error) {
        expect(service.error()).toContain('Error fetching data:');
        expect(service.hasError()).toBeTruthy();
      } finally {
        // Restore original client
        (service as any).client = originalClient;
      }
    });

    it('should call client.fetch with provided parameters', async () => {
      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve({ data: 'test' }));

      const originalClient = (service as any).client;
      (service as any).client = mockClient;

      try {
        await service.fetch('*[_type == "test"]', { param: 'value' });
        expect(mockClient.fetch).toHaveBeenCalledWith('*[_type == "test"]', {
          param: 'value'
        });
      } finally {
        (service as any).client = originalClient;
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

    it('should handle blocks with links and formatting', () => {
      const mockBlocks = [
        {
          _type: 'block',
          children: [
            { text: 'Check out ', _type: 'span' },
            {
              text: 'this link',
              _type: 'span',
              marks: ['link'],
              markDefs: [{ _type: 'link', href: 'https://example.com' }]
            }
          ]
        }
      ] as never;

      const result = service.portableTextToHtml(mockBlocks);
      expect(typeof result).toBe('string');
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

      const originalClient = (service as any).client;
      (service as any).client = mockClient;

      try {
        await service.loadCategories();
        expect(loadingDuringExecution).toBeTruthy();
      } finally {
        (service as any).client = originalClient;
      }
    });

    it('should set loading to false after completion', async () => {
      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve([]));

      const originalClient = (service as any).client;
      (service as any).client = mockClient;

      try {
        await service.loadCategories();
        expect(service.loading()).toBeFalse();
      } finally {
        (service as any).client = originalClient;
      }
    });

    it('should handle errors and update error state', async () => {
      const originalClient = (service as any).client;
      (service as any).client = mockErrorClient;

      try {
        await service.loadCategories();
        expect(service.error()).toContain('Error loading categories:');
        expect(service.hasError()).toBeTruthy();
        expect(service.loading()).toBeFalse();
      } finally {
        (service as any).client = originalClient;
      }
    });

    it('should clear error state at start', async () => {
      // Set initial error
      (service as any)._error.set('Previous error');
      expect(service.hasError()).toBeTruthy();

      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve([]));

      const originalClient = (service as any).client;
      (service as any).client = mockClient;

      try {
        await service.loadCategories();
        expect(service.error()).toBeNull();
      } finally {
        (service as any).client = originalClient;
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

      const originalClient = (service as any).client;
      (service as any).client = mockClient;

      try {
        await service.loadPosts();
        expect(loadCategoriesSpy).toHaveBeenCalled();
      } finally {
        (service as any).client = originalClient;
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
      const originalClient = (service as any).client;
      (service as any).client = mockClient;

      try {
        await service.loadPosts();
        expect(loadingDuringExecution).toBeTruthy();
        expect(service.loading()).toBeFalse();
      } finally {
        (service as any).client = originalClient;
      }
    });

    it('should handle errors correctly', async () => {
      spyOn(service, 'loadCategories').and.returnValue(Promise.resolve());
      const originalClient = (service as any).client;
      (service as any).client = mockErrorClient;

      try {
        await service.loadPosts();
        expect(service.error()).toContain('Error loading posts:');
        expect(service.hasError()).toBeTruthy();
        expect(service.loading()).toBeFalse();
      } finally {
        (service as any).client = originalClient;
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

      // Mock categories to be loaded first
      spyOn(service, 'loadCategories').and.callFake(() => {
        // Simulate categories being loaded
        (service as any)._categories.set([
          { id: 'test-cat', name: { es: 'Test', en: 'Test' }, value: 'test' }
        ]);
        return Promise.resolve();
      });

      const originalClient = (service as any).client;
      (service as any).client = mockClient;

      try {
        await service.loadPosts();

        expect(service.posts().length).toBe(1);
        expect(service.postsCount()).toBe(1);
        expect(service.isReady()).toBeTruthy();
      } finally {
        (service as any).client = originalClient;
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
      // Start with error
      const originalClient = (service as any).client;
      (service as any).client = mockErrorClient;

      try {
        await service.loadCategories();
      } catch {
        // Expected error
      }

      expect(service.hasError()).toBeTruthy();
      expect(service.loading()).toBeFalse();

      // Clear error and verify recovery
      service.clearError();
      expect(service.hasError()).toBeFalse();
      expect(service.error()).toBeNull();

      // Restore client for future tests
      (service as any).client = originalClient;
    });

    it('should handle multiple sequential operations', async () => {
      const mockClient = jasmine.createSpyObj('client', ['fetch']);
      mockClient.fetch.and.returnValue(Promise.resolve([]));

      const originalClient = (service as any).client;
      (service as any).client = mockClient;

      try {
        await service.loadCategories();
        expect(service.error()).toBeNull();

        service.clearError();
        expect(service.error()).toBeNull();

        await service.refreshPosts();
        expect(mockClient.fetch).toHaveBeenCalled();
      } finally {
        (service as any).client = originalClient;
      }
    });
  });
});
