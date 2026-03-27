import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReviewInquiry } from '../interfaces/review-inquiry.interface';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let httpMock: HttpTestingController;

  const mockEndpoint = 'http://localhost:8888/.netlify/functions/reviews';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReviewsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ReviewsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sendReview', () => {
    it('should POST review data to the reviews endpoint', () => {
      const mockReview: ReviewInquiry = {
        email: 'test@example.com',
        message: 'Great experience!',
        rating: 5,
        creationDate: '2026-03-27T00:00:00.000Z',
        origin: 'nomacoda_portfolio'
      };

      service.sendReview(mockReview).subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(mockEndpoint);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual(mockReview);
      req.flush({ success: true });
    });

    it('should include optional fullName when provided', () => {
      const mockReview: ReviewInquiry = {
        fullName: 'John Doe',
        email: 'john@example.com',
        message: 'Excellent!',
        rating: 4,
        creationDate: '2026-03-27T00:00:00.000Z',
        origin: 'nomacoda_portfolio'
      };

      service.sendReview(mockReview).subscribe();

      const req = httpMock.expectOne(mockEndpoint);
      expect(req.request.body.fullName).toBe('John Doe');
      req.flush({ success: true });
    });

    it('should propagate HTTP errors', () => {
      const mockReview: ReviewInquiry = {
        email: 'fail@example.com',
        message: 'Should fail',
        rating: 3,
        creationDate: '2026-03-27T00:00:00.000Z',
        origin: 'nomacoda_portfolio'
      };

      let errorThrown = false;
      service.sendReview(mockReview).subscribe({
        error: () => { errorThrown = true; }
      });

      const req = httpMock.expectOne(mockEndpoint);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(errorThrown).toBeTrue();
    });
  });
});
