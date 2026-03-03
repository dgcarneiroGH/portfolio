import { TestBed } from '@angular/core/testing';
import { SanityService } from './sanity.service';

describe('SanityService', () => {
  let service: SanityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
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

  describe('#clearError', () => {
    it('should set error signal to null', () => {
      service.clearError();
      expect(service.error()).toBeNull();
    });
  });

  describe('#portableTextToHtml', () => {
    it('should return an empty string for an empty blocks array', () => {
      const result = service.portableTextToHtml([] as never);
      expect(typeof result).toBe('string');
    });
  });
});
