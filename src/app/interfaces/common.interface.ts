export interface INavMenuItems {
  title: string;
  link: string;
}

export interface ISkills {
  techSkills: ISkill[];
  mgmtSkills: ISkill[];
  softSkills: ISkill[];
}

export interface ISkill {
  id: number;
  name: string;
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

export interface ITag {
  weight: number;
  text: string;
}
