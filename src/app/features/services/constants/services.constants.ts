import { Service } from '../interfaces/service.interface';

export const SERVICES: Service[] = [
  {
    icon: 'angular',
    variant: 'angular',
    link: '/angular',
    titleKey: 'SERVICES.CARDS.ANGULAR_SANITY.TITLE',
    descriptionKey: 'SERVICES.CARDS.ANGULAR_SANITY.DESCRIPTION',
    bulletKeys: [
      'SERVICES.CARDS.ANGULAR_SANITY.BULLET_1',
      'SERVICES.CARDS.ANGULAR_SANITY.BULLET_2',
      'SERVICES.CARDS.ANGULAR_SANITY.BULLET_3'
    ],
    statValue: '+20',
    statLabelKey: 'SERVICES.CARDS.ANGULAR_SANITY.STAT_LABEL'
  },
  {
    icon: 'n8n',
    variant: 'n8n',
    link: '/n8n',
    titleKey: 'SERVICES.CARDS.N8N_FLOWS.TITLE',
    descriptionKey: 'SERVICES.CARDS.N8N_FLOWS.DESCRIPTION',
    bulletKeys: [
      'SERVICES.CARDS.N8N_FLOWS.BULLET_1',
      'SERVICES.CARDS.N8N_FLOWS.BULLET_2',
      'SERVICES.CARDS.N8N_FLOWS.BULLET_3'
    ],
    statValue: '+40',
    statLabelKey: 'SERVICES.CARDS.N8N_FLOWS.STAT_LABEL'
  },
  {
    icon: 'tutoring',
    variant: 'tutoring',
    link: '/tutoring',
    titleKey: 'SERVICES.CARDS.TUTORING.TITLE',
    descriptionKey: 'SERVICES.CARDS.TUTORING.DESCRIPTION',
    bulletKeys: [
      'SERVICES.CARDS.TUTORING.BULLET_1',
      'SERVICES.CARDS.TUTORING.BULLET_2',
      'SERVICES.CARDS.TUTORING.BULLET_3'
    ],
    statValue: '100%',
    statLabelKey: 'SERVICES.CARDS.TUTORING.STAT_LABEL'
  }
];
