import { ProcessedPost } from './processed-post.model';

export interface BlogViewModel {
  posts: ProcessedPost[];
  hasSlug: boolean;
  selectedPost: ProcessedPost | null;
  currentLocale: string;
}
