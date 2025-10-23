import { TagCanvasOptions } from 'ng-tagcanvas';
import { Cert, CertFilter } from '../interfaces/certs.interface';

export const CERTS: Cert[] = [
  {
    platform: 'scrum',
    technology: 'scrum',
    name: 'Scrum Developer I',
    iconSrc: 'assets/images/certs/PSDI.avif',
    url: 'https://www.scrum.org/certificates/899749'
  }
  // {
  //   platform: 'udemy',
  //   technology: 'solid',
  //   name: 'Principios SOLID y Clean Code',
  //   iconSrc: 'assets/images/certs/udemy.avif',
  //   url: 'https://www.udemy.com/certificate/UC-a6d0025a-e9fe-464b-a1ad-52f625ecdde7/'
  // },
  // {
  //   platform: 'udemy',
  //   technology: 'angular',
  //   name: 'REDUX en Angular con NGRX: Desde las bases hasta la práctica',
  //   iconSrc: 'assets/images/certs/udemy_angular.avif',
  //   url: 'https://www.udemy.com/certificate/UC-d2ceb6dc-f5ab-49aa-b3db-f1c8d16338f8/'
  // },
  // {
  //   platform: 'udemy',
  //   technology: 'angular',
  //   name: 'Angular Avanzado: Lleva tus bases al siguiente nivel - MEAN',
  //   iconSrc: 'assets/images/certs/udemy_angular.avif',
  //   url: 'https://www.udemy.com/certificate/UC-063523e7-fb90-4dfc-a8a8-d0e22d414384/'
  // },
  // {
  //   platform: 'udemy',
  //   technology: 'flutter',
  //   name: 'Flutter: Tu guía completa de desarrollo para IOS y Android',
  //   iconSrc: 'assets/images/certs/udemy_flutter.avif',
  //   url: 'https://www.udemy.com/certificate/UC-9202264e-14c0-4636-97cc-a7424cd58433/'
  // },
  // {
  //   platform: 'udemy',
  //   technology: 'unreal',
  //   name: 'Programar Blueprints en Unreal Engine de 0 a profesional',
  //   iconSrc: 'assets/images/certs/udemy_unreal.avif',
  //   url: 'https://www.udemy.com/certificate/UC-d4cfc152-cd74-413c-b30f-b842f442ab9e/'
  // },
  // {
  //   platform: 'udemy',
  //   technology: 'react',
  //   name: 'React y Firebase: El Curso Completo, Práctico y Desde 0',
  //   iconSrc: 'assets/images/certs/udemy_react.avif',
  //   url: 'https://www.udemy.com/certificate/UC-deae80fd-4fdc-42b3-aa37-6c232c2245cd/'
  // }
];

export const CERTS_FILTER: CertFilter[] = [
  {
    id: 'platform',
    items: [
      { id: 'udemy', label: 'Udemy', selected: true },
      { id: 'scrum', label: 'Scrum.org', selected: true }
    ]
  },
  {
    id: 'technology',
    items: [
      { id: 'angular', label: 'Angular', selected: true },
      { id: 'react', label: 'React', selected: true },
      { id: 'unreal', label: 'Unreal Engine', selected: true },
      { id: 'flutter', label: 'Flutter', selected: true },
      { id: 'solid', label: 'SOLID', selected: true },
      { id: 'scrum', label: 'Scrum', selected: true }
    ]
  }
];

export const CERT_CANVAS_OPTIONS: TagCanvasOptions = {
  frontSelect: true,
  dragControl: true,
  clickToFront: 500,
  freezeActive: true,
  textColour: '#f6f8fa',
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
  radiusX: 3,
  radiusY: 3,
  radiusZ: 3
};
