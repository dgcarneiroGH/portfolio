import { routes } from './app.routes';

/**
 * Contrato de rutas:
 * - One-pager: las 4 rutas de sección apuntan al sections-page con
 *   data.section (id del ancla del DOM) y onePager (marca que usan el
 *   RouteReuseStrategy y el scroll-spy).
 * - Páginas propias: about-me, angular, n8n y tutoring cargan su componente
 *   fuera del one-pager (como blog).
 * - Blog y 404 quedan intactos.
 */
const SECTION_ROUTES: { path: string; section: string }[] = [
  { path: '', section: 'home' },
  { path: 'success-cases', section: 'success-cases' },
  { path: 'reviews', section: 'reviews' },
  { path: 'contact', section: 'contact' }
];

/** Páginas con componente propio, fuera del one-pager. */
const PAGE_ROUTES: { path: string; titleKey: string }[] = [
  { path: 'about-me', titleKey: 'ROUTE.ABOUT' },
  { path: 'angular', titleKey: 'ROUTE.ANGULAR' },
  { path: 'n8n', titleKey: 'ROUTE.N8N' },
  { path: 'tutoring', titleKey: 'ROUTE.TUTORING' }
];

describe('app.routes — one-pager', () => {
  it('mapea las 4 rutas de sección al sections-page con data.section y onePager', () => {
    for (const expected of SECTION_ROUTES) {
      const route = routes.find((r) => r.path === expected.path);
      expect(route).withContext(`ruta ${expected.path} existe`).toBeDefined();
      expect(route!.data?.['section'])
        .withContext(`data.section de ${expected.path}`)
        .toBe(expected.section);
      expect(route!.data?.['onePager'])
        .withContext(`data.onePager de ${expected.path}`)
        .toBe(true);
    }
  });

  it('conserva las claves de título (A11yTitleStrategy) en cada ruta de sección', () => {
    const titleKeys = SECTION_ROUTES.map((expected) => {
      const route = routes.find((r) => r.path === expected.path);
      return route?.data?.['titleKey'];
    });
    expect(titleKeys).toEqual([
      'ROUTE.PORTFOLIO',
      'ROUTE.SUCCESS_CASES',
      'ROUTE.REVIEWS',
      'ROUTE.CONTACT'
    ]);
  });

  it('conserva blog, blog/:slug y la ruta comodín 404', () => {
    expect(routes.some((r) => r.path === 'blog')).toBeTrue();
    expect(routes.some((r) => r.path === 'blog/:slug')).toBeTrue();
    expect(routes.some((r) => r.path === '**')).toBeTrue();
  });
});

describe('app.routes — páginas propias', () => {
  it('carga el componente propio de cada página, fuera del one-pager', () => {
    for (const expected of PAGE_ROUTES) {
      const route = routes.find((r) => r.path === expected.path);
      expect(route).withContext(`ruta ${expected.path} existe`).toBeDefined();
      expect(typeof route!.loadComponent)
        .withContext(`carga lazy de ${expected.path}`)
        .toBe('function');
      expect(route!.data?.['onePager'])
        .withContext(`${expected.path} fuera del one-pager`)
        .toBeUndefined();
      expect(route!.data?.['titleKey'])
        .withContext(`titleKey de ${expected.path}`)
        .toBe(expected.titleKey);
    }
  });
});
