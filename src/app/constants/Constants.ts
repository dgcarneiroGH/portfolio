import {
  IDynamicScripts,
  INavMenuItems,
  ISocialMediaLinks,
  IExperience,
  ITag,
  ICert,
  ISkill,
  IProyect,
  IContactMethod
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
  { title: 'Proyectos', link: '/proyects' },
  { title: 'Certificados', link: '/certs' },
  { title: 'Contacto', link: '/contact' }
];

export const SKILLS: ISkill[] = [
  {
    name: 'Angular',
    yearsOfExperience: 4,
    logoSrc: 'assets/images/skills/icons/angular.png'
  },
  {
    name: 'React',
    yearsOfExperience: 1,
    logoSrc: 'assets/images/skills/icons/react.png'
  },
  {
    name: '.NET',
    yearsOfExperience: 2,
    logoSrc: 'assets/images/skills/icons/dotnet.png'
  },
  {
    name: 'Prestashop',
    yearsOfExperience: 1,
    logoSrc: 'assets/images/skills/icons/prestashop.png'
  },
  {
    name: 'Moodle',
    yearsOfExperience: 1,
    logoSrc: 'assets/images/skills/icons/moodle.png'
  },
  {
    name: 'Salesforce',
    yearsOfExperience: 1,
    logoSrc: 'assets/images/skills/icons/salesforce.png'
  },
  {
    name: 'Laravel',
    yearsOfExperience: 2,
    logoSrc: 'assets/images/skills/icons/laravel.png'
  }
];

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
  },
  {
    title: 'Cv',
    profileUrl:
      'https://drive.google.com/file/d/1IKa2LmTmEZeLOGRhNE3HUyVs-qacPxRU/view?usp=sharing',
    iconPath: 'assets/images/pdf.png'
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

export const CERTS: ICert[] = [
  {
    type: 'Scrum',
    name: 'Scrum Developer I',
    iconSrc: 'assets/images/certs/icons/PSDI.png',
    url: 'https://www.scrum.org/certificates/899749'
  },
  {
    type: 'Udemy',
    name: 'Principios SOLID y Clean Code',
    iconSrc: 'assets/images/certs/icons/udemy.png',
    url: 'https://www.udemy.com/certificate/UC-a6d0025a-e9fe-464b-a1ad-52f625ecdde7/'
  },
  {
    type: 'Udemy',
    name: 'REDUX en Angular con NGRX: Desde las bases hasta la práctica',
    iconSrc: 'assets/images/certs/icons/udemy.png',
    url: 'https://www.udemy.com/certificate/UC-d2ceb6dc-f5ab-49aa-b3db-f1c8d16338f8/'
  },
  {
    type: 'Udemy',
    name: 'Angular Avanzado: Lleva tus bases al siguiente nivel - MEAN',
    iconSrc: 'assets/images/certs/icons/udemy.png',
    url: 'https://www.udemy.com/certificate/UC-063523e7-fb90-4dfc-a8a8-d0e22d414384/'
  },
  {
    type: 'Udemy',
    name: 'Flutter: Tu guía completa de desarrollo para IOS y Android',
    iconSrc: 'assets/images/certs/icons/udemy.png',
    url: 'https://www.udemy.com/certificate/UC-9202264e-14c0-4636-97cc-a7424cd58433/'
  },
  {
    type: 'Udemy',
    name: 'Programar Blueprints en Unreal Engine de 0 a profesional',
    iconSrc: 'assets/images/certs/icons/udemy.png',
    url: 'https://www.udemy.com/certificate/UC-d4cfc152-cd74-413c-b30f-b842f442ab9e/'
  },
  {
    type: 'Udemy',
    name: 'React y Firebase: El Curso Completo, Práctico y Desde 0',
    iconSrc: 'assets/images/certs/icons/udemy.png',
    url: 'https://www.udemy.com/certificate/UC-deae80fd-4fdc-42b3-aa37-6c232c2245cd/'
  }
];

export const CERT_CANVAS_OPTIONS: TagCanvasOptions = {
  frontSelect: true,
  dragControl: true,
  clickToFront: 500,
  freezeActive: true,
  textColour: '#FFF',
  outlineThickness: 0.5,
  outlineColour: 'transparent',
  maxSpeed: 0.02,
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

export const PROYECTS: IProyect[] = [
  {
    year: 2021,
    coverImgSrc: 'assets/images/proyects/pbcinteract.png',
    name: 'PBC Interact',
    description:
      'Juego de preguntas médicas con varios niveles que mostraban distintas problemáticas de enfermedades renales simulando la consulta de un médico. Actualmente desactivada.',
    url: 'https://pbcinteract.com/'
  },
  {
    year: 2024,
    coverImgSrc: 'assets/images/proyects/laligabares.png',
    name: 'LALIGA Bares',
    description:
      'CRM y portal web para "La Liga" en el que se muestran (entre otros) datos sobre bares o casinos que tienen contratado un paquete de fútbol que no corresponde a su negocio. Este portal tiene un login así que la información que se puede mostrar es muy limitada.',
    url: 'https://laligabares.my.salesforce.com/'
  },
  {
    year: 2022,
    coverImgSrc: 'assets/images/proyects/discamino.png',
    name: 'Discamino',
    description:
      'Web interna que gestiona fechas y conexiones entre conductores, vehículos y acompañantes de una empresa dedicada a entrenar y acompañar a personas con diversidad funcional a hacer el camino de Santiago. Esta web necesita de logueo así que la información que se puede mostrar es limitada.',
    url: 'https://team.discamino.org/#/login'
  },
  {
    year: 2022,
    coverImgSrc: 'assets/images/proyects/pharmachallenge.png',
    name: 'Pharma Challenge',
    description:
      'Concurso farmacéutico que consta de varias fases. En la fase final, los participantes deben enviar un video explicando su proyecto. El ganador de este concurso, recibe una subvención para hacer realidad el proyecto en si. Esta web tiene un login ya que se accede a este concurso con invitación.',
    url: 'https://pharmachallenge.es/'
  },
  {
    year: 2022,
    coverImgSrc: 'assets/images/proyects/dfg.png',
    name: 'DFG',
    description:
      'Web dedicada a la empresa DFG Natural Stone a través de la que se puede acceder a la web de compras, también desarrollada por el equipo en el que trabajaba ese año.',
    url: 'https://web.dfg.es/'
  },
  {
    year: 2025,
    coverImgSrc: 'assets/images/proyects/hermes.jpg',
    name: 'Hermes',
    description:
      'Web interna que gestiona los transportes de materiales vía tren de la empresa Arcelor Mittal. Al ser una web interna, no es accesible para el público común.'
  }
];

export const EXPERIENCES: IExperience[] = [
  {
    id: 1,
    company: 'Clarcat Cantábrico',
    designation: 'Desarrollador fullstack',
    yearRange: '2023 - Actualidad',
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
    role: 'Otros puestos de trabajo no relacionados con el desarrollo web.'
  }
];

export const CONTACT_METHODS: IContactMethod[] = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/dgcarneiro/',
    iconSrc: 'assets/images/linkedin.svg'
  },
  {
    name: 'Gmail',
    url: 'mailto:dgcarneiro93@gmail.com',
    iconSrc: 'assets/images/gmail.svg'
  },
  {
    name: 'Phone',
    url: 'tel:+34661206962',
    iconSrc: 'assets/images/call.png'
  }
];

export const MEDIUM_INTEGRATION_URL: string = '';
// 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@akashkriplani';
