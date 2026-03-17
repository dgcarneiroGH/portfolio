import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContactInquiry } from '../interfaces/contact-inquiry.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private webhookUrl = environment.n8nWebhookUrl;

  sendInquiry(data: ContactInquiry): Observable<any> {
    // TODO:Una vez terminado, queda pendiente almacenar este token a través de una Netlify Function.
    // También se debe añadir a Cloudflare un limitador de llamadas a este endpoint, para evitar hackeos que rompan el servidor por saturación de peticiones.
    const headers = new HttpHeaders({
      'X-Portfolio-Token':
        '6d5ea5db9d3b060e8e35da3ba913f3fac117db4fae2afe2e9c926f48abf734f5'
    });

    return this.http.post(this.webhookUrl, data, { headers });
  }
}
