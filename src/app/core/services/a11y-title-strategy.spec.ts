import { TestBed } from '@angular/core/testing';
import { RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { A11yTitleStrategy } from './a11y-title-strategy';

const BASE_TITLE = 'Nomacoda | Freelance Frontend Developer';

const TRANSLATIONS: Record<string, string> = {
  'ROUTE.PORTFOLIO': 'Portfolio',
  'ROUTE.REVIEWS': 'Opiniones'
};

function snapshotWith(data?: Record<string, unknown>): RouterStateSnapshot {
  return {
    root: { firstChild: data === undefined ? undefined : { data } }
  } as unknown as RouterStateSnapshot;
}

describe('A11yTitleStrategy', () => {
  let strategy: A11yTitleStrategy;
  let instant: jasmine.Spy;

  beforeEach(() => {
    instant = jasmine
      .createSpy('TranslateService.instant')
      .and.callFake((key: string) => TRANSLATIONS[key] ?? '');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslateService,
          useValue: { instant } as unknown as TranslateService
        }
      ]
    });

    strategy = TestBed.inject(A11yTitleStrategy);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('compone el título traducido de la ruta sobre el título base', () => {
    strategy.updateTitle(snapshotWith({ titleKey: 'ROUTE.REVIEWS' }));

    expect(instant).toHaveBeenCalledWith('ROUTE.REVIEWS');
    expect(document.title).toBe(`Opiniones — ${BASE_TITLE}`);
  });

  it('con una titleKey sin traducción, deja el título base', () => {
    strategy.updateTitle(snapshotWith({ titleKey: 'ROUTE.INEXISTENTE' }));

    expect(instant).toHaveBeenCalledWith('ROUTE.INEXISTENTE');
    expect(document.title).toBe(BASE_TITLE);
  });

  it('sin titleKey en la ruta, deja el título base', () => {
    strategy.updateTitle(snapshotWith({}));

    expect(instant).not.toHaveBeenCalled();
    expect(document.title).toBe(BASE_TITLE);
  });

  it('sin firstChild (navegación raíz), deja el título base', () => {
    strategy.updateTitle(snapshotWith(undefined));

    expect(instant).not.toHaveBeenCalled();
    expect(document.title).toBe(BASE_TITLE);
  });
});
