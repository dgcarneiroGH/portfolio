import { ActivatedRouteSnapshot } from '@angular/router';

/**
 * La transición de vista del router se aplica al contenido del
 * router-outlet. Dentro del one-pager (5 rutas → mismo sections-page con
 * RouteReuseStrategy) el DOM no cambia entre navegaciones: la transición
 * con instantáneas idénticas produce un destello (el fade "sequential" del
 * repo cruza por transparencia) → se salta con `transition.skipTransition()`.
 *
 * Las transiciones one-pager ↔ blog (o 404) sí cambian de componente y
 * conservan la animación slide/fade.
 */
export function shouldSkipViewTransition(
  from: ActivatedRouteSnapshot,
  to: ActivatedRouteSnapshot
): boolean {
  const isOnePager = (snapshot: ActivatedRouteSnapshot): boolean =>
    snapshot.firstChild?.routeConfig?.data?.['onePager'] === true;

  return isOnePager(from) && isOnePager(to);
}
