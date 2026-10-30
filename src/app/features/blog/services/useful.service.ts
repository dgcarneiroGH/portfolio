import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable()
export class UsefulService {
  private http = inject(HttpClient);
  private usefulEndpoint = environment.usefulEndpoint;

  markUseful(postId: string): Observable<number> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<{ success: boolean; count: number }>(
        this.usefulEndpoint,
        { postId },
        { headers }
      )
      .pipe(map((response) => response.count));
  }
}
