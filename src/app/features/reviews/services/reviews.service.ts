import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReviewInquiry } from '../interfaces/review-inquiry.interface';

@Injectable()
export class ReviewsService {
  private http = inject(HttpClient);
  private reviewsEndpoint = environment.reviewsEndpoint;

  sendReview(data: ReviewInquiry): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.reviewsEndpoint, data, { headers });
  }
}
