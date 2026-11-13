import { ActivatedRouteSnapshot } from '@angular/router';
import { shouldSkipViewTransition } from './view-transition-skip';

function snapWithChild(data: Record<string, unknown> | undefined): ActivatedRouteSnapshot {
  return {
    firstChild: { routeConfig: { data } }
  } as unknown as ActivatedRouteSnapshot;
}

const onePagerData = { onePager: true };
const plainData = {};

describe('shouldSkipViewTransition', () => {
  it('salta la transición entre dos rutas one-pager (el DOM no cambia)', () => {
    expect(shouldSkipViewTransition(snapWithChild(onePagerData), snapWithChild(onePagerData))).toBeTrue();
  });

  it('NO salta la transición del one-pager al blog', () => {
    expect(shouldSkipViewTransition(snapWithChild(onePagerData), snapWithChild(plainData))).toBeFalse();
  });

  it('NO salta la transición del blog al one-pager', () => {
    expect(shouldSkipViewTransition(snapWithChild(plainData), snapWithChild(onePagerData))).toBeFalse();
  });

  it('NO salta la transición entre rutas fuera del one-pager', () => {
    expect(shouldSkipViewTransition(snapWithChild(plainData), snapWithChild(plainData))).toBeFalse();
  });

  it('defensivo: sin ruta hija activa no salta', () => {
    const empty = {} as ActivatedRouteSnapshot;
    expect(shouldSkipViewTransition(empty, empty)).toBeFalse();
  });
});
