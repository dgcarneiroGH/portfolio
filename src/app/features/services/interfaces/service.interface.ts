export type ServiceIcon = 'angular' | 'n8n' | 'tutoring';

export type ServiceVariant = 'red' | 'raspberry' | 'amber';

export interface Service {
  icon: ServiceIcon;
  variant: ServiceVariant;
  titleKey: string;
  descriptionKey: string;
  bulletKeys: readonly string[];
  statValue: string;
  statLabelKey: string;
}
