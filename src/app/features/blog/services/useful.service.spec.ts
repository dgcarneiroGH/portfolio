import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { UsefulService } from './useful.service';

describe('UsefulService', () => {
  let service: UsefulService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsefulService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UsefulService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensure no unexpected requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#markUseful', () => {
    it('should POST the postId to the useful endpoint and emit the returned count', () => {
      let emittedCount: number | undefined;

      service.markUseful('post.abc').subscribe((count) => {
        emittedCount = count;
      });

      const req = httpMock.expectOne(environment.usefulEndpoint);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual({ postId: 'post.abc' });

      req.flush({ success: true, count: 7 });

      expect(emittedCount).toBe(7);
    });
  });
});
