import { PostCategory, BlogFilter } from '../models/blog-filter.model';

export const BLOG_FILTERS: BlogFilter[] = [
  { label: 'BLOG.FILTER.ALL', category: null },
  { label: 'BLOG.FILTER.CODER4CHANGE', category: PostCategory.CODER4CHANGE },
  { label: 'BLOG.FILTER.MINDFUL_CODE', category: PostCategory.MINDFUL_CODE },
  { label: 'BLOG.FILTER.N8N_WORKFLOW', category: PostCategory.N8N_WORKFLOW },
  { label: 'BLOG.FILTER.NEW', category: PostCategory.NEW }
];
