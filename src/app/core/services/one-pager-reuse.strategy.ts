import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';

/**
 * Estrategia de reutilización de rutas del one-pager: al navegar entre las
 * 5 rutas de sección (todas apuntan al mismo sections-page) la instancia del
 * componente se conserva, sin destruir/recrear el DOM ni reiniciar el
 * scroll-spy. Al salir del one-pager (blog, 404) se aplica el comportamiento
 * base de Angular.
 *
 * El router marca cada ruta de sección con `data.onePager = true`
 * (app.routes.ts).
 */
export class OnePagerReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return (
      super.shouldReuseRoute(future, curr) ||
      (future.routeConfig?.data?.['onePager'] === true &&
        curr.routeConfig?.data?.['onePager'] === true)
    );
  }
}
