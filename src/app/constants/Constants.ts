import {
  IDynamicScripts,
  INavMenuItems,
  ISocialMediaLinks,
  ISkills,
  IExperience,
  ITag,
  ICert
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
  { title: 'Experiencia', link: '/experience' },
  { title: 'Certificados', link: '/certs' }
];

export const SKILLS: ISkills = {
  techSkills: [
    { id: 1, name: 'C.S. DAM' },
    { id: 2, name: 'C.S. Electrónica' },
  ],
  mgmtSkills: [
    { id: 1, name: 'Understanding UX' },
  ],
  softSkills: [
    { id: 1, name: 'Professional Scrum Developer' },
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

export const CERTS:ICert[] = [
  { name:'Scrum Developer I', iconSrc: 'assets/images/certs/icons/PSDI.png', pdf: 'PSDI.pdf' },
];

export const CERT_CANVAS_OPTIONS: TagCanvasOptions = {
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
  fadeIn: 800,
  initial: [0.3, -0.1],
  depth: 0.2,
  weight: false,
  reverse: true,
  radiusX: 2,
  radiusY: 2,
  radiusZ: 2
};

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
    company: 'Clarcat Cantábrico',
    designation: 'Desarrollador fullstack',
    yearRange: '2023 - Present',
    role: 'Proyectos para empresas externas como Arcelor Mittal y La Liga.'
  },
  {
    id: 2,
    company: 'Possible INC.',
    designation: 'Desarrollador fullstack',
    yearRange: '2021 - 2023',
    role: 'Multitud de proyectos internos y externos para empresas externas como LetsHealth, Esmerarte y NTTData.'
  },
  {
    id: 3,
    company: '',
    designation: '',
    yearRange: '2013 - 2021',
    role: 'Experiencia en otros puestos de trabajo no relacionados con el desarrollo web.'
  },
];

export const MEDIUM_INTEGRATION_URL: string =
  'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@akashkriplani';
