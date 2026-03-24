import { PostCategoryType, BlogFilter } from '../models/blog-filter.model';

export const BLOG_FILTERS: BlogFilter[] = [
  { label: 'BLOG.FILTER.ALL', category: null },
  {
    label: 'BLOG.FILTER.CODER4CHANGE',
    category: PostCategoryType.CODERS4CHANGE
  },
  {
    label: 'BLOG.FILTER.MINDFUL_CODE',
    category: PostCategoryType.MINDFUL_CODE
  },
  {
    label: 'BLOG.FILTER.N8N_WORKFLOW',
    category: PostCategoryType.N8N_WORKFLOWS
  },
  { label: 'BLOG.FILTER.NEW', category: PostCategoryType.NEWS }
];
