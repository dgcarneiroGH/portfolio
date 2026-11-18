export type ServiceIcon = 'angular' | 'n8n' | 'tutoring';

export type ServiceVariant = 'red' | 'raspberry' | 'amber';

export interface Service {
  icon: ServiceIcon;
  variant: ServiceVariant;
  link: string;
  titleKey: string;
  descriptionKey: string;
  bulletKeys: readonly string[];
  statValue: string;
  statLabelKey: string;
}
