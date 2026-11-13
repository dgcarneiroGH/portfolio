import { ProcessedPost } from './processed-post.model';

export interface BlogViewModel {
  posts: ProcessedPost[];
  hasSlug: boolean;
  selectedPost: ProcessedPost | null;
  // Artículos adyacentes en el listado (desc por publishedAt); null en los
  // bordes del listado.
  previousPost: ProcessedPost | null;
  nextPost: ProcessedPost | null;
  currentLocale: string;
}
