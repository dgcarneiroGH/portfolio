import { Injectable, signal, computed } from '@angular/core';
import { toHTML } from '@portabletext/to-html';
import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { environment } from '../../../environments/environment';
import { BodyContent, Post } from '../../features/blog/models/post.model';

@Injectable({
  providedIn: 'root'
})
export class SanityService {
  private client: SanityClient;
  private builder: ReturnType<typeof imageUrlBuilder>;

  // Post state management with signals
  private _posts = signal<Post[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Readonly signals for public exposure
  posts = this._posts.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // Computed properties
  postsCount = computed(() => this._posts().length);
  hasError = computed(() => this._error() !== null);
  isReady = computed(() => !this._loading() && this._posts().length > 0);

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

  async fetch<T = any>(
    query: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await this.client.fetch<T>(query, params as any);
    } catch (error) {
      this._error.set(`Error fetching data: ${error}`);
      throw error;
    }
  }

  imageBuilder(source: any) {
    return this.builder.image(source);
  }

  // Translate text to HTML
  portableTextToHtml(blocks: BodyContent): string {
    return toHTML(blocks as any, {
      components: {
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
        block: {
          normal: ({ children }) => `<p>${children}</p>`,
          h1: ({ children }) => `<h1>${children}</h1>`,
          h2: ({ children }) => `<h2>${children}</h2>`,
          h3: ({ children }) => `<h3>${children}</h3>`
        },
        types: {
          image: ({ value }) => {
            const url = this.imageBuilder(value)?.width(1200).url();
            const alt = value?.alt ?? '';
            return url
              ? `<figure><img src="${url}" alt="${alt}" /></figure>`
              : '';
          }
        },
        list: {
          bullet: ({ children }) => `<ul>${children}</ul>`,
          number: ({ children }) => `<ol>${children}</ol>`
        },
        listItem: ({ children }) => `<li>${children}</li>`
      }
    });
  }

  //#region GET

  async loadPosts(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const query = `*[_type == "post" && defined(publishedAt)] | order(publishedAt desc){
        _id, 
        _createdAt, 
        titleES, 
        titleEN, 
        excerptES, 
        excerptEN, 
        bodyES, 
        bodyEN, 
        "slug": slug.current, 
        image, 
        publishedAt,
        category
      }`;

      const rawPosts = await this.fetch<any[]>(query);
      const posts = rawPosts.map((post) => ({
        _id: post._id,
        _createdAt: post._createdAt,
        slug: post.slug,
        publishedAt: new Date(post.publishedAt),
        title: {
          es: post.titleES || '',
          ...(post.titleEN && { en: post.titleEN })
        },
        excerpt: {
          es: post.excerptES || '',
          ...(post.excerptEN && { en: post.excerptEN })
        },
        body: {
          es: post.bodyES || [],
          ...(post.bodyEN && { en: post.bodyEN })
        },
        image: post.image || undefined,
        category: post.category
      }));

      this._posts.set(posts);
    } catch (error) {
      this._error.set(`Error loading posts: ${error}`);
      console.error('Error loading posts:', error);
    } finally {
      this._loading.set(false);
    }
  }

  clearError(): void {
    this._error.set(null);
  }

  refreshPosts(): Promise<void> {
    return this.loadPosts();
  }
  //#endregion
}
