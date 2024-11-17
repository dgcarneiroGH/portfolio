import {
  IDynamicScripts,
  INavMenuItems,
  ISocialMediaLinks,
  ISkills,
  IExperience,
  ITag
} from '../interfaces';

import { TagCanvasOptions } from 'ng-tagcanvas';

export const FONT_URLS = [
  'https://fonts.googleapis.com/css?family=Lato:300,400',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap'
];

export const ScriptStore: IDynamicScripts[] = [
  { name: 'oscillator', src: './assets/js/oscillator.js' },
  { name: 'jquery', src: './assets/js/jquery.js' },
  { name: 'skills', src: './assets/js/skills.js' }
];

export const NavMenuItems: INavMenuItems[] = [
  { title: 'Home', link: '/' },
  { title: 'Sobre mí', link: '/about' },
  { title: 'Habilidades', link: '/skills' },
  { title: 'Experiencia', link: '/experience' }
];

export const SKILLS: ISkills = {
  techSkills: [
    { id: 1, name: 'HTML' },
    { id: 2, name: 'CSS / SCSS' },
    { id: 3, name: 'JavaScript' },
    { id: 4, name: 'TypeScript' },
    { id: 5, name: 'Angular' },
    { id: 6, name: 'React' },
    { id: 7, name: '.NET' },
    { id: 8, name: 'Salesforce' },
    { id: 9, name: 'Laravel' }
  ],
  mgmtSkills: [
    { id: 1, name: 'Understanding UX' },
    { id: 2, name: 'Strategic Planning' },
    { id: 3, name: 'Developing front-end architecture' },
    { id: 4, name: 'Innovative Approach' },
    { id: 5, name: 'Code Reviewing' },
    { id: 6, name: 'Critical Thinking' },
    { id: 7, name: 'Mentoring' },
    { id: 8, name: 'Teamwork and Delegation' },
    { id: 9, name: 'Coordinating' }
  ],
  softSkills: [
    { id: 1, name: 'Leadership' },
    { id: 2, name: 'Teamwork' },
    { id: 3, name: 'Work Ethic' },
    { id: 4, name: 'Problem Solving' },
    { id: 5, name: 'Public Speaking' },
    { id: 6, name: 'Professional Writing' },
    { id: 7, name: 'Punctuality' },
    { id: 8, name: 'Digital Literacy' },
    { id: 9, name: 'Intercultural Fluency' }
  ]
};

export const SocialMediaProfiles: ISocialMediaLinks[] = [
  {
    title: 'LinkedIn',
    profileUrl: 'https://www.linkedin.com/in/dgcarneiro/',
    iconPath: 'assets/images/linkedin.svg'
  },
  {
    title: 'GitHub',
    profileUrl: 'https://github.com/dgcarneiroGH',
    iconPath: 'assets/images/github.svg'
  }
];

export const TAGS: ITag[] = [
  { weight: 22, text: 'Git' },
  { weight: 24, text: 'JavaScript' },
  { weight: 24, text: 'NgRx' },
  { weight: 20, text: 'Bootstrap' },
  { weight: 32, text: 'Angular' },
  { weight: 30, text: 'TypeScript' },
  { weight: 25, text: 'TailwindCSS' },
  { weight: 20, text: 'CSS3' },
  { weight: 16, text: 'GraphQL' },
  { weight: 30, text: 'HTML5' },
  { weight: 28, text: 'Bitbucket' },
  { weight: 24, text: 'SCSS' },
  { weight: 20, text: 'React' },
  { weight: 20, text: 'Redux' },
  { weight: 16, text: 'Angular.js' },
  { weight: 20, text: 'SQL' }
];

export const TAG_CANVAS_OPTIONS: TagCanvasOptions = {
  clickToFront: 500,
  textColour: '#FFF',
  outlineThickness: 0.5,
  outlineColour: 'transparent',
  maxSpeed: 0.05,
  freezeActive: true,
  shuffleTags: true,
  shape: 'sphere',
  zoom: 1,
  wheelZoom: false,
  noSelect: false,
  freezeDecel: true,
  fadeIn: 3000,
  initial: [0.3, -0.1],
  depth: 1.1,
  weight: true,
  reverse: true,
  radiusX: 2,
  radiusY: 2,
  radiusZ: 2
};

export const EXPERIENCES: IExperience[] = [
  {
    id: 1,
    company: 'Nagarro',
    designation: 'Staff Engineer',
    yearRange: '2022 - Present',
    role: 'Working as a senior front end Angular developer'
  },
  {
    id: 2,
    company: 'Fiserv',
    designation: 'Tech Lead',
    yearRange: '2021 - 2022',
    role: 'Worked as a senior front end Angular developer'
  },
  {
    id: 3,
    company: 'Publicis Sapient',
    designation: 'Senior Associate L1',
    yearRange: '2019 - 2021',
    role: 'Worked as a senior front end Angular developer'
  },
  {
    id: 4,
    company: 'Nagarro',
    designation: 'Senior Associate',
    yearRange: '2018 - 2019',
    role: 'Worked as a front end Angular developer'
  },
  {
    id: 5,
    company: 'Cognizant',
    designation: 'Programmer Analyst',
    yearRange: '2014 - 2017',
    role: 'Worked as a front end Angular developer'
  }
];

export const MEDIUM_INTEGRATION_URL: string =
  'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@akashkriplani';
