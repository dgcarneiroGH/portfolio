import { Injectable } from '@angular/core';
import { toHTML } from '@portabletext/to-html';
import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { from, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Post } from '../models/post.model';
import { PortableTextBlock } from './../../../../node_modules/@portabletext/types/src/portableText';

@Injectable()
export class SanityService {
  private client: SanityClient;
  private builder: ReturnType<typeof imageUrlBuilder>;

  constructor() {
    this.client = createClient({
      projectId: environment.sanity.projectId,
      dataset: environment.sanity.dataset,
      apiVersion: environment.sanity.apiVersion,
      useCdn: environment.sanity.useCdn,
      token: environment.sanity.token
    });

    this.builder = imageUrlBuilder(this.client);
  }

  fetch<T = any>(query: string, params?: Record<string, unknown>): Promise<T> {
    return this.client.fetch<T>(query, params as any);
  }

  fetch$<T = any>(
    query: string,
    params?: Record<string, unknown>
  ): Observable<T> {
    return from(this.fetch<T>(query, params));
  }

  imageBuilder(source: any) {
    return this.builder.image(source);
  }

  // Listen in real time
  listen(groq: string, params?: Record<string, any>) {
    return this.client.listen(groq, params);
  }

  // Translate text to HTML
  portableTextToHtml(blocks: PortableTextBlock[] = []): string {
    return toHTML(blocks as any, {
      components: {
        // marcas (negrita, cursiva, código, links, etc.)
        marks: {
          strong: ({ children }) => `<strong>${children}</strong>`,
          em: ({ children }) => `<em>${children}</em>`,
          code: ({ children }) => `<code>${children}</code>`,
          link: ({ value, children }) => {
            const href = value?.href ?? '#';
            const rel = href.startsWith('/')
              ? ''
              : ' rel="noopener noreferrer" target="_blank"';
            return `<a href="${href}"${rel}>${children}</a>`;
          }
        },
        // tipos de bloque (párrafos, encabezados…)
        block: {
          normal: ({ children }) => `<p>${children}</p>`,
          h1: ({ children }) => `<h1>${children}</h1>`,
          h2: ({ children }) => `<h2>${children}</h2>`,
          h3: ({ children }) => `<h3>${children}</h3>`
        },
        // tipos embebidos (imágenes en el body)
        types: {
          image: ({ value }) => {
            const url = this.imageBuilder(value)?.width(1200).url();
            const alt = value?.alt ?? '';
            return url
              ? `<figure><img src="${url}" alt="${alt}" /></figure>`
              : '';
          }
        },
        // listas
        list: {
          bullet: ({ children }) => `<ul>${children}</ul>`,
          number: ({ children }) => `<ol>${children}</ol>`
        },
        listItem: ({ children }) => `<li>${children}</li>`
      }
    });
  }

  //#region GET
  getPosts(): Observable<Post[]> {
    const query = `*[_type == "post" && defined(publishedAt)] | order(publishedAt desc){
      _id, title, "slug": slug.current, body, image, publishedAt
    }`;
    return this.fetch$(query);
  }
  //#endregion
}
