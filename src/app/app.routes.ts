import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './core/components/sections-wrapper/sections-wrapper.component'
      ).then((m) => m.SectionsWrapperComponent),
    data: { animation: 'Home', titleKey: 'ROUTE.PORTFOLIO' },
    pathMatch: 'full'
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/blog/components/blog.component').then(
        (m) => m.BlogComponent
      ),
    data: { animation: 'Blog', titleKey: 'ROUTE.BLOG' }
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./features/blog/components/blog.component').then(
        (m) => m.BlogComponent
      ),
    data: { titleKey: 'ROUTE.BLOG_POST' }
  },
  {
    path: '**',
    loadComponent: () =>
      import('./core/components/not-found-404/not-found-404.component').then(
        (m) => m.NotFound404Component
      ),
    data: { titleKey: 'ROUTE.NOT_FOUND' }
  }
];
