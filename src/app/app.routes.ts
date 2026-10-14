import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './features/home/components/home.component'
      ).then((m) => m.HomeComponent),
    data: { animation: 'Home', titleKey: 'ROUTE.PORTFOLIO' },
    pathMatch: 'full'
  },
  {
    path: 'about-me',
    loadComponent: () =>
      import('./features/about/components/about.component').then(
        (m) => m.AboutComponent
      ),
    data: { animation: 'About', titleKey: 'ROUTE.ABOUT' }
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import('./features/reviews/components/reviews.component').then(
        (m) => m.ReviewsComponent
      ),
    data: { animation: 'Reviews', titleKey: 'ROUTE.REVIEWS' }
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/components/contact.component').then(
        (m) => m.ContactComponent
      ),
    data: { animation: 'Contact', titleKey: 'ROUTE.CONTACT' }
  },
  {
    path: 'success-cases',
    loadComponent: () =>
      import(
        './features/success-cases/components/success-cases/success-cases.component'
      ).then((m) => m.SuccessCasesComponent),
    data: { animation: 'SuccessCases', titleKey: 'ROUTE.SUCCESS_CASES' }
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
