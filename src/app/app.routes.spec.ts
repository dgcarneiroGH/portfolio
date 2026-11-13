import { routes } from './app.routes';

/**
 * Contrato de rutas del one-pager: las 5 rutas de sección apuntan al
 * sections-page con data.section (id del ancla del DOM) y onePager (marca
 * que usan el RouteReuseStrategy y el scroll-spy). Blog y 404 quedan intactos.
 */
const SECTION_ROUTES: { path: string; section: string }[] = [
  { path: '', section: 'home' },
  { path: 'about-me', section: 'about-me' },
  { path: 'success-cases', section: 'success-cases' },
  { path: 'reviews', section: 'reviews' },
  { path: 'contact', section: 'contact' }
];

describe('app.routes — one-pager', () => {
  it('mapea las 5 rutas de sección al sections-page con data.section y onePager', () => {
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
      'ROUTE.ABOUT',
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
