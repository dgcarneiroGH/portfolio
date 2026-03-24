import { MultilangString } from '../../../core/models/sanity.models';
import { PostCategoryType } from './blog-filter.model';

export interface PostCategory {
  id: string;
  name: MultilangString;
  value: PostCategoryType;
}
