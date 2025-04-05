export interface MediumBlogPostsResponse {
  items: PostItems[];
}

export interface PostItems {
  author: string;
  categories: string[];
  content: string;
  description: string;
  guid: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  title: string;
}

export interface DynamicScripts {
  name: string;
  src: string;
}
