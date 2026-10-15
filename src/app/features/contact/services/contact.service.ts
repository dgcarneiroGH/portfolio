import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ContactInquiry } from '../interfaces/contact-inquiry.interface';

@Injectable()
export class ContactService {
  private http = inject(HttpClient);
  private contactEndpoint = environment.contactEndpoint;

  sendInquiry(data: ContactInquiry): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.contactEndpoint, data, { headers });
  }
}
