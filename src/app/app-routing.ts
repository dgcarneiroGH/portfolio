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
      import('./components/home/home.component').then(
        ({ HomeComponent }) => HomeComponent
      )
  },
  {
    path: 'about',
    title: 'About Me',
    loadComponent: () =>
      import('./components/about/about.component').then(
        ({ AboutComponent }) => AboutComponent
      )
  },
  {
    path: 'skills',
    title: 'Skills',
    loadComponent: () =>
      import('./components/skills/skills.component').then(
        ({ SkillsComponent }) => SkillsComponent
      )
  },
  {
    path: 'experience',
    title: 'Experience',
    loadComponent: () =>
      import('./components/experience/experience.component').then(
        ({ ExperienceComponent }) => ExperienceComponent
      )
  },
  {
    path: 'blog-posts',
    title: 'Medium Posts',
    loadComponent: () =>
      import('./components/medium-blog/medium-blog.component').then(
        ({ MediumBlogComponent }) => MediumBlogComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
