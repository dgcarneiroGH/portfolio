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
    it('should send POST request to webhook URL with correct data and headers', () => {
      const mockResponse = { success: true, id: 'inquiry123' };

      service.sendInquiry(mockContactInquiry).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(environment.n8nWebhookUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockContactInquiry);

      // Verify custom header is set
      expect(req.request.headers.get('X-Portfolio-Token')).toBe(
        '6d5ea5db9d3b060e8e35da3ba913f3fac117db4fae2afe2e9c926f48abf734f5'
      );

      req.flush(mockResponse);
    });

    it('should handle HTTP error responses', () => {
      const errorMessage = 'Server error occurred';

      service.sendInquiry(mockContactInquiry).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(environment.n8nWebhookUrl);
      expect(req.request.method).toBe('POST');

      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });

    it('should include all required headers in request', () => {
      service.sendInquiry(mockContactInquiry).subscribe();

      const req = httpMock.expectOne(environment.n8nWebhookUrl);

      // Verify custom header is set
      expect(req.request.headers.get('X-Portfolio-Token')).toBe(
        '6d5ea5db9d3b060e8e35da3ba913f3fac117db4fae2afe2e9c926f48abf734f5'
      );

      // Verify request body is the expected object (JSON will be set automatically)
      expect(req.request.body).toEqual(mockContactInquiry);

      req.flush({});
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

      const req = httpMock.expectOne(environment.n8nWebhookUrl);
      expect(req.request.body).toEqual(minimalInquiry);

      req.flush({ success: true });
    });
  });
});
