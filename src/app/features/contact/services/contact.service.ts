import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContactInquiry } from '../interfaces/contact-inquiry.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private webhookUrl = environment.n8nWebhookUrl;

  sendInquiry(data: ContactInquiry): Observable<any> {
    return this.http.post(this.webhookUrl, data);
  }
}
