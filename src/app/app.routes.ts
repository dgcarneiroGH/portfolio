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
    path: 'blog/:slug',
    loadComponent: () =>
      import('./features/blog/components/blog.component').then(
        (m) => m.BlogComponent
      )
  },
  {
    path: '**',
    loadComponent: () =>
      import('./core/components/not-found-404/not-found-404.component').then(
        (m) => m.NotFound404Component
      )
  }
];
