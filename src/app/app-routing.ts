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
    loadComponent: () =>
      import('./components/pages/home/home.component').then(
        ({ HomeComponent }) => HomeComponent
      )
  },
  {
    path: 'about',
    title: 'About Me',
    loadComponent: () =>
      import('./components/pages/about/about.component').then(
        ({ AboutComponent }) => AboutComponent
      )
  },
  {
    path: 'skills',
    title: 'Skills',
    loadComponent: () =>
      import('./components/pages/skills/skills.component').then(
        ({ SkillsComponent }) => SkillsComponent
      )
  },
  {
    path: 'experience',
    title: 'Experience',
    loadComponent: () =>
      import('./components/pages/experience/experience.component').then(
        ({ ExperienceComponent }) => ExperienceComponent
      )
  },
  {
    path: 'proyects',
    title: 'Proyects',
    loadComponent: () =>
      import('./components/pages/proyects/proyects.component').then(
        ({ ProyectsComponent }) => ProyectsComponent
      )
  },
  {
    path: 'certs',
    title: 'Certificates',
    loadComponent: () =>
      import('./components/pages/certs/certs.component').then(
        ({ CertsComponent }) => CertsComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
