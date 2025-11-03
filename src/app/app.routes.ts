import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './core/components/sections-wrapper/sections-wrapper.component'
      ).then((m) => m.SectionsWrapperComponent)
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/blog/components/blog.component').then(
        (m) => m.BlogComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
