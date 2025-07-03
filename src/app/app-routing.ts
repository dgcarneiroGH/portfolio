import { Injectable } from '@angular/core';
import { Routes } from '@angular/router';

@Injectable()
export class CustomTitleStrategy {
  // constructor(private readonly title: Title) {
  //   super();
  // }
  // override updateTitle(routerState: RouterStateSnapshot): void {
  // this.title.setTitle('No')
  // const title = this.buildTitle(routerState);
  // if (title !== undefined) {
  //   this.title.setTitle(`Portfolio - ${title}`);
  // } else {
  //   this.title.setTitle(`Portfolio - Home`);
  // }
  // }
}

export const APP_ROUTES: Routes = [
  {
    path: '',
    title: 'Home',
    data: { routeIndex: 1 },
    loadComponent: () =>
      import('./features/01_home/components/home.component').then(
        ({ HomeComponent }) => HomeComponent
      )
  },
  {
    path: 'about',
    title: 'About Me',
    data: { routeIndex: 2 },
    loadComponent: () =>
      import('./features/02_about/components/about.component').then(
        ({ AboutComponent }) => AboutComponent
      )
  },
  {
    path: 'skills',
    title: 'Skills',
    data: { routeIndex: 3 },
    loadComponent: () =>
      import('./features/03_skills/components/skills.component').then(
        ({ SkillsComponent }) => SkillsComponent
      )
  },
  {
    path: 'experience',
    title: 'Experience',
    data: { routeIndex: 4 },
    loadComponent: () =>
      import('./features/04_experience/components/experience.component').then(
        ({ ExperienceComponent }) => ExperienceComponent
      )
  },
  {
    path: 'projects',
    title: 'Projects',
    data: { routeIndex: 5 },
    loadComponent: () =>
      import('./features/05_projects/components/projects.component').then(
        ({ ProjectsComponent }) => ProjectsComponent
      )
  },
  {
    path: 'certs',
    title: 'Certificates',
    data: { routeIndex: 6 },
    loadComponent: () =>
      import('./features/06_certs/components/certs.component').then(
        ({ CertsComponent }) => CertsComponent
      )
  },
  {
    path: 'contact',
    title: 'Contact',
    data: { routeIndex: 7 },
    loadComponent: () =>
      import('./features/07_contact/components/contact.component').then(
        ({ ContactComponent }) => ContactComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
