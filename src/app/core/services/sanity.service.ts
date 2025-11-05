import { Injectable } from '@angular/core';
import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { from, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SanityService {
  private client: SanityClient;
  private builder: ReturnType<typeof imageUrlBuilder>;

  constructor() {
    this.client = createClient({
      projectId: environment.sanity.projectId,
      dataset: environment.sanity.dataset,
      apiVersion: environment.sanity.apiVersion,
      useCdn: environment.sanity.useCdn,
      token: environment.sanity.token // opcional
    });

    this.builder = imageUrlBuilder(this.client);
  }

  // Ejecuta una consulta GROQ y devuelve una Promise
  fetch<T = any>(query: string, params?: Record<string, unknown>): Promise<T> {
    return this.client.fetch<T>(query, params as any);
  }

  // Devuelve Observable (opcional)
  fetch$<T = any>(
    query: string,
    params?: Record<string, unknown>
  ): Observable<T> {
    return from(this.fetch<T>(query, params));
  }

  // Construir URL para imágenes Sanity
  imageUrl(source: any) {
    return this.builder.image(source).url();
  }

  imageBuilder(source: any) {
    return this.builder.image(source);
  }

  // Escucha en tiempo real (realtime) - útil en previews
  listen(groq: string, params?: Record<string, any>) {
    return this.client.listen(groq, params);
  }
}
