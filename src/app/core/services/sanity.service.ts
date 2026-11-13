import { Injectable, signal, computed } from '@angular/core';
import { toHTML } from '@portabletext/to-html';
import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { environment } from '../../../environments/environment';
import { Post } from '../../features/blog/models/post.model';
import { PostCategory } from '../../features/blog/models/category.model';
import { PostCategoryType } from '../../features/blog/models/blog-filter.model';
import { BodyContent, SanityImage } from '../models/sanity.models';

/** Fuente de imagen que acepta el builder de Sanity (según su API). */
type ImageBuilderSource = Parameters<
  ReturnType<typeof imageUrlBuilder>['image']
>[0];

/** Fila cruda de GROQ de la proyección de categorías (loadCategories). */
interface RawCategory {
  _id: string;
  nameES?: string;
  nameEN?: string;
  value: PostCategoryType;
}

/** Fila cruda de GROQ de la proyección de posts (loadPosts). */
interface RawPost {
  _id: string;
  slug: string;
  titleES?: string;
  titleEN?: string;
  excerptES?: string;
  excerptEN?: string;
  bodyES?: BodyContent;
  bodyEN?: BodyContent;
  image?: SanityImage;
  publishedAt: string;
  category?: string;
  usefulCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SanityService {
  private client: SanityClient;
  private builder: ReturnType<typeof imageUrlBuilder>;

  private _posts = signal<Post[]>([]);
  private _categories = signal<PostCategory[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  posts = this._posts.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

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

  async fetch<T = unknown>(
    query: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await this.client.fetch<T>(query, params ?? {});
    } catch (error) {
      this._error.set(`Error fetching data: ${error}`);
      throw error;
    }
  }

  imageBuilder(source: unknown) {
    return this.builder.image(source as ImageBuilderSource);
  }

  portableTextToHtml(blocks: BodyContent): string {
    return toHTML(blocks as unknown as Parameters<typeof toHTML>[0], {
      components: {
        marks: {
          strong: ({ children }) => `<strong>${children}</strong>`,
          em: ({ children }) => `<em>${children}</em>`,
          code: ({ children }) => `<code>${children}</code>`,
          link: ({ value, children }) => {
            const href = (value?.href ?? '#').replace(/"/g, '&quot;');
            const external = /^https?:\/\//.test(href);
            const target = external ? ' target="_blank"' : '';
            const rel = external ? ' rel="noopener noreferrer"' : '';
            return `<a href="${href}"${target}${rel}>${children}</a>`;
          }
        },
        block: {
          normal: ({ children }) => `<p>${children}</p>`,
          h1: ({ children }) => `<h2>${children}</h2>`,
          h2: ({ children }) => `<h2>${children}</h2>`,
          h3: ({ children }) => `<h3>${children}</h3>`
        },
        types: {
          image: ({ value }) => {
            const url = this.imageBuilder(value)?.width(1200).url();
            const alt = (value?.alt ?? '').replace(/"/g, '&quot;');
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

  async loadCategories(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const query = `*[_type == "category" && defined(publishedAt)]{
        _id,
        nameES, 
        nameEN, 
        value
      }`;

      const rawCategories = await this.fetch<RawCategory[]>(query);

      const categories = rawCategories.map((category) => ({
        id: category._id,
        name: {
          es: category.nameES || '',
          en: category.nameEN || ''
        },
        value: category.value
      }));

      this._categories.set(categories);
    } catch (error) {
      this._error.set(`Error loading categories: ${error}`);
      console.error('Error loading categories:', error);
    } finally {
      this._loading.set(false);
    }
  }

  async loadPosts(): Promise<void> {
    await this.loadCategories();

    this._loading.set(true);
    this._error.set(null);

    try {
      const query = `*[_type == "post" && defined(publishedAt)] | order(publishedAt desc){
        _id, 
        titleES, 
        titleEN, 
        excerptES, 
        excerptEN, 
        bodyES, 
        bodyEN, 
        "slug": slug.current, 
        image, 
        publishedAt,
        "category": category._ref,
        "usefulCount": coalesce(usefulCount, 0)
      }`;

      const rawPosts = await this.fetch<RawPost[]>(query);

      const posts = rawPosts.map((post) => ({
        id: post._id,
        slug: post.slug,
        publishedAt: new Date(post.publishedAt),
        title: {
          es: post.titleES || '',
          en: post.titleEN || ''
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
        category: this._categories().find(({ id }) => id === post.category)
          ?.value,
        usefulCount: post.usefulCount ?? 0
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
