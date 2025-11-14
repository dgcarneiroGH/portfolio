import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './core/components/sections-wrapper/sections-wrapper.component'
      ).then((m) => m.SectionsWrapperComponent),
    data: { animation: 'Home' },
    pathMatch: 'full'
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/blog/components/blog.component').then(
        (m) => m.BlogComponent
      ),
    data: { animation: 'Blog' }
  },
  {
    path: 'blog/',
    redirectTo: 'blog',
    pathMatch: 'full'
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./features/blog/components/blog.component').then(
        (m) => m.BlogComponent
      ),
    data: { animation: 'Blog' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
