import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ContactInquiry } from '../interfaces/contact-inquiry.interface';
import { SubmitResponse } from '../../../core/interfaces/common.interface';

@Injectable()
export class ContactService {
  private http = inject(HttpClient);
  private contactEndpoint = environment.contactEndpoint;

  sendInquiry(data: ContactInquiry): Observable<SubmitResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<SubmitResponse>(this.contactEndpoint, data, {
      headers
    });
  }
}
