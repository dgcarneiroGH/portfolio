export type BodyContent = SanityBlock[];

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

export interface MultilangString {
  es: string;
  en?: string;
}

export interface MultilangBody {
  es: BodyContent;
  en?: BodyContent;
}

export interface SanityBlock {
  _type: string;
  _key: string;
  style?: string;
  children?: BlockChild[];
  [key: string]: any;
}

export interface BlockChild {
  text: MultilangString;
  marks: string[];
  _type: string;
  _key: string;
}
