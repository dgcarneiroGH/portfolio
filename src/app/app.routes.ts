import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './features/sections/components/sections-page/sections-page.component'
      ).then((m) => m.SectionsPageComponent),
    data: { section: 'home', onePager: true, animation: 'Home', titleKey: 'ROUTE.PORTFOLIO' },
    pathMatch: 'full'
  },
  {
    path: 'about-me',
    loadComponent: () =>
      import(
        './features/sections/components/sections-page/sections-page.component'
      ).then((m) => m.SectionsPageComponent),
    data: { section: 'about-me', onePager: true, animation: 'About', titleKey: 'ROUTE.ABOUT' }
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import(
        './features/sections/components/sections-page/sections-page.component'
      ).then((m) => m.SectionsPageComponent),
    data: { section: 'reviews', onePager: true, animation: 'Reviews', titleKey: 'ROUTE.REVIEWS' }
  },
  {
    path: 'contact',
    loadComponent: () =>
      import(
        './features/sections/components/sections-page/sections-page.component'
      ).then((m) => m.SectionsPageComponent),
    data: { section: 'contact', onePager: true, animation: 'Contact', titleKey: 'ROUTE.CONTACT' }
  },
  {
    path: 'success-cases',
    loadComponent: () =>
      import(
        './features/sections/components/sections-page/sections-page.component'
      ).then((m) => m.SectionsPageComponent),
    data: {
      section: 'success-cases',
      onePager: true,
      animation: 'SuccessCases',
      titleKey: 'ROUTE.SUCCESS_CASES'
    }
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/blog/components/blog.component').then((m) => m.BlogComponent),
    data: { animation: 'Blog', titleKey: 'ROUTE.BLOG' }
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./features/blog/components/blog.component').then((m) => m.BlogComponent),
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
