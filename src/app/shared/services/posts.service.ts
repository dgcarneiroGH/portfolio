import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IMediumBlogPostsResponse } from '../interfaces';
import { MEDIUM_INTEGRATION_URL } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private _http = inject(HttpClient);

  getPosts(): Observable<IMediumBlogPostsResponse> {
    return this._http.get<IMediumBlogPostsResponse>(MEDIUM_INTEGRATION_URL);
  }
}
