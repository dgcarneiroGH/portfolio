import { SafeHtml } from '@angular/platform-browser';
import { SanityImage } from './post.model';

export interface ProcessedPost {
  _id: string;
  _createdAt?: string;
  slug: string;
  publishedAt: Date;
  title: string;
  excerpt: string;
  body: SafeHtml;
  imageUrl: string;
  image?: SanityImage;
}
