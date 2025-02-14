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
