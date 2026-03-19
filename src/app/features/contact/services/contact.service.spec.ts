import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { ContactService } from './contact.service';
import { ContactInquiry } from '../interfaces/contact-inquiry.interface';
import { environment } from '../../../../environments/environment';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  const mockContactInquiry: ContactInquiry = {
    fullName: 'John Doe',
    email: 'john@example.com',
    message: 'Hello, this is a test message',
    creationDate: new Date().toISOString(),
    origin: 'nomacoda_portfolio'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ContactService
      ]
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensure no unexpected requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#sendInquiry', () => {
    it('should send POST request to contact endpoint with correct data and headers', () => {
      const mockResponse = { success: true, data: { id: 'inquiry123' } };

      service.sendInquiry(mockContactInquiry).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(environment.contactEndpoint);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockContactInquiry);

      // Verify Content-Type header is set
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush(mockResponse);
    });

    it('should handle HTTP error responses', () => {
      const errorResponse = {
        error: 'Internal server error',
        message: 'Server error occurred'
      };

      service.sendInquiry(mockContactInquiry).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toEqual(errorResponse);
        }
      });

      const req = httpMock.expectOne(environment.contactEndpoint);
      expect(req.request.method).toBe('POST');

      req.flush(errorResponse, { status: 500, statusText: 'Server Error' });
    });

    it('should include correct headers in request', () => {
      service.sendInquiry(mockContactInquiry).subscribe();

      const req = httpMock.expectOne(environment.contactEndpoint);

      // Verify Content-Type header is set (no X-Portfolio-Token as it's handled by Netlify Function)
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      // Verify request body is the expected object
      expect(req.request.body).toEqual(mockContactInquiry);

      req.flush({ success: true });
    });

    it('should handle different contact inquiry formats', () => {
      const minimalInquiry: ContactInquiry = {
        fullName: 'Jane',
        email: 'jane@example.com',
        message: 'Hi',
        creationDate: new Date().toISOString(),
        origin: 'nomacoda_portfolio'
      };

      service.sendInquiry(minimalInquiry).subscribe();

      const req = httpMock.expectOne(environment.contactEndpoint);
      expect(req.request.body).toEqual(minimalInquiry);

      req.flush({ success: true });
    });
  });
});
