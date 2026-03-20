export interface BlogFilter {
  label: string;
  category: PostCategory | null;
}

export enum PostCategory {
  ALL = 'ALL',
  NEW = 'NEW',
  CODER4CHANGE = 'CODER4CHANGE',
  N8N_WORKFLOW = 'N8N_WORKFLOW',
  MINDFUL_CODE = 'MINDFUL_CODE'
}
