import { ActivatedRouteSnapshot } from '@angular/router';

/**
 * La transición de vista del router se aplica al contenido del
 * router-outlet. Dentro del one-pager (5 rutas → mismo sections-page con
 * RouteReuseStrategy) el DOM no cambia entre navegaciones: la transición
 * con instantáneas idénticas produce un destello (el fade "sequential" del
 * repo cruza por transparencia) → se neutraliza con la clase `vt-instant`
 * en `<html>` (ver `styles.scss`), que anula las animaciones de la
 * pseudo-árbol.
 *
 * Se hace por CSS y no con `transition.skipTransition()` porque este
 * rechaza `transition.ready` con un DOMException que Angular registra con
 * `console.error` en modo dev.
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
