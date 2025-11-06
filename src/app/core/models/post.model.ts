export interface Post {
  _id: string;
  _createdAt?: string;
  title: string;
  slug: string;
  publishedAt: Date;
  body?: BodyContent;
  image?: SanityImage;
}

interface SanityBlock {
  _type: string;
  _key: string;
  style?: string;
  children?: BlockChild[];
  [key: string]: any;
}

interface BlockChild {
  text: string;
  marks: string[];
  _type: string;
  _key: string;
}
export type BodyContent = SanityBlock[];

interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}
