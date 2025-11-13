export interface Post {
  _id: string;
  _createdAt?: string;
  slug: string;
  publishedAt: Date;
  title: MultilangString;
  excerpt: MultilangString;
  body: MultilangBody;
  image?: SanityImage;
}

export type BodyContent = SanityBlock[];

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

interface MultilangString {
  es: string;
  en?: string;
}

interface MultilangBody {
  es: BodyContent;
  en?: BodyContent;
}

interface SanityBlock {
  _type: string;
  _key: string;
  style?: string;
  children?: BlockChild[];
  [key: string]: any;
}

interface BlockChild {
  text: MultilangString;
  marks: string[];
  _type: string;
  _key: string;
}
