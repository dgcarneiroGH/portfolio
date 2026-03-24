import {
  MultilangBody,
  MultilangString,
  SanityImage
} from '../../../core/models/sanity.models';
import { PostCategoryType } from './blog-filter.model';

export interface Post {
  id: string;
  slug: string;
  publishedAt: Date;
  title: MultilangString;
  excerpt: MultilangString;
  body: MultilangBody;
  image?: SanityImage;
  category?: PostCategoryType;
}
