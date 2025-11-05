export interface Post {
  _id: string;
  _createdAt?: string;
  title: string;
  slug?: { current: string };
  body?: any;
  mainImage?: any; // document reference image
}
