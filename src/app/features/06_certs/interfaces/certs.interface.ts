//TODO: Revisar estos naming
type CertPlatformType = 'udemy' | 'scrum' | 'linkedIn' | 'openWebinars';
type CertTechType =
  | 'angular'
  | 'react'
  | 'scrum'
  | 'solid'
  | 'flutter'
  | 'unreal';

export interface Cert {
  platform: CertPlatformType;
  technology: CertTechType;
  name: string;
  iconSrc: string;
  url: string;
}

export interface CertFilter {
  id: string;
  items: CertFilterItem[];
}

export interface CertFilterItem {
  id: CertPlatformType | CertTechType;
  label: string;
  selected: boolean;
}
