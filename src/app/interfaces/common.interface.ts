export interface INavMenuItems {
  title: string;
  link: string;
}

export interface ISkill {
  name: string;
  yearsOfExperience: number;
  logoSrc: string;
}

export interface ISocialMediaLinks {
  title: string;
  profileUrl: string;
  iconPath: string;
}

export interface IMediumBlogPostsResponse {
  items: IPostItems[];
}

export interface IPostItems {
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

export interface IDynamicScripts {
  name: string;
  src: string;
}

export interface IExperience {
  id: number;
  company: string;
  designation: string;
  yearRange: string;
  role: string;
}

export interface IProyect {
  coverImgSrc: string;
  name: string;
  description: string;
  url?: string;
  year: number;
}

export interface ITag {
  weight: number;
  text: string;
}

export interface IContactMethod {
  name: string;
  url: string;
  iconSrc: string;
}
//TODO: Revisar estos naming
type CertPlatformType = 'udemy' | 'scrum' | 'linkedIn' | 'openWebinars';
type CertTechType =
  | 'angular'
  | 'react'
  | 'scrum'
  | 'solid'
  | 'flutter'
  | 'unreal';

export interface ICert {
  platform: CertPlatformType;
  technology: CertTechType;
  name: string;
  iconSrc: string;
  url: string;
}

export interface ICertFilter {
  id: string;
  items: ICertFilterItem[];
}

export interface ICertFilterItem {
  id: CertPlatformType | CertTechType;
  label: string;
  selected: boolean;
}
