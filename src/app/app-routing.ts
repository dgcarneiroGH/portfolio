import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, Routes, TitleStrategy } from '@angular/router';

@Injectable()
export class CustomTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot): void {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      this.title.setTitle(`Portfolio - ${title}`);
    } else {
      this.title.setTitle(`Portfolio - Home`);
    }
  }
}

export const APP_ROUTES: Routes = [
  {
    path: '',
    title: 'Home',
    data: { routeIndex: 1 },
    loadComponent: () =>
      import('./components/pages/01_home/home.component').then(
        ({ HomeComponent }) => HomeComponent
      )
  },
  {
    path: 'about',
    title: 'About Me',
    data: { routeIndex: 2 },
    loadComponent: () =>
      import('./components/pages/02_about/about.component').then(
        ({ AboutComponent }) => AboutComponent
      )
  },
  {
    path: 'skills',
    title: 'Skills',
    data: { routeIndex: 3 },
    loadComponent: () =>
      import('./components/pages/03_skills/skills.component').then(
        ({ SkillsComponent }) => SkillsComponent
      )
  },
  {
    path: 'experience',
    title: 'Experience',
    data: { routeIndex: 4 },
    loadComponent: () =>
      import('./components/pages/04_experience/experience.component').then(
        ({ ExperienceComponent }) => ExperienceComponent
      )
  },
  {
    path: 'proyects',
    title: 'Proyects',
    data: { routeIndex: 5 },
    loadComponent: () =>
      import('./components/pages/05_proyects/proyects.component').then(
        ({ ProyectsComponent }) => ProyectsComponent
      )
  },
  {
    path: 'certs',
    title: 'Certificates',
    data: { routeIndex: 6 },
    loadComponent: () =>
      import('./components/pages/06_certs/certs.component').then(
        ({ CertsComponent }) => CertsComponent
      )
  },
  {
    path: 'contact',
    title: 'Contact',
    data: { routeIndex: 7 },
    loadComponent: () =>
      import('./components/pages/07_contact/contact.component').then(
        ({ ContactComponent }) => ContactComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
