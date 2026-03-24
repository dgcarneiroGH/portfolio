export interface BlogFilter {
  label: string;
  category: PostCategoryType | null;
}

export enum PostCategoryType {
  ALL = 'ALL',
  NEWS = 'NEWS',
  CODERS4CHANGE = 'CODERS4CHANGE',
  N8N_WORKFLOWS = 'N8N_WORKFLOWS',
  MINDFUL_CODE = 'MINDFUL_CODE'
}
