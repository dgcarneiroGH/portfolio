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

/** Respuesta estándar de las Netlify functions del portfolio ({ success, data }). */
export interface SubmitResponse {
  success: boolean;
  data?: unknown;
}
