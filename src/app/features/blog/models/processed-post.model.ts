import { SafeHtml } from '@angular/platform-browser';
import { SanityImage } from '../../../core/models/sanity.models';

export interface ProcessedPost {
  id: string;
  slug: string;
  publishedAt: Date;
  title: string;
  excerpt: string;
  body: SafeHtml;
  imageUrl: string;
  image?: SanityImage;
  category?: string;
}
