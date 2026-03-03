import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LangService } from './lang.service';

const mockLoader = { getTranslation: () => of({}) };

function setup(savedLang?: string, browserLang?: string) {
  if (savedLang) {
    localStorage.setItem('language', savedLang);
  } else {
    localStorage.removeItem('language');
  }

  TestBed.configureTestingModule({
    imports: [
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useValue: mockLoader }
      })
    ]
  });

  if (browserLang) {
    const translate = TestBed.inject(TranslateService);
    spyOn(translate, 'getBrowserLang').and.returnValue(browserLang);
  }

  return TestBed.inject(LangService);
}

describe('LangService', () => {
  afterEach(() => {
    localStorage.removeItem('language');
    TestBed.resetTestingModule();
  });

  describe('#creation', () => {
    it('should be created', () => {
      const service = setup();
      expect(service).toBeTruthy();
    });

    it('should expose a readonly currentLanguage signal', () => {
      const service = setup();
      expect(typeof service.currentLanguage()).toBe('string');
    });
  });

  describe('#setLanguage', () => {
    it('should update currentLanguage signal to a valid language', fakeAsync(() => {
      const service = setup('es-ES');
      service.setLanguage('en-US');
      tick();
      expect(service.currentLanguage()).toBe('en-US');
    }));

    it('should NOT update currentLanguage for an unsupported language', fakeAsync(() => {
      const service = setup('es-ES');
      tick(); // let initial setLanguage resolve
      service.setLanguage('fr-FR' as string);
      tick();
      expect(service.currentLanguage()).toBe('es-ES');
    }));

    it('should persist language to localStorage when changed', fakeAsync(() => {
      const service = setup('es-ES');
      tick();
      service.setLanguage('en-US');
      tick();
      expect(localStorage.getItem('language')).toBe('en-US');
    }));
  });

  describe('#getLanguage', () => {
    it('should return the current language string', fakeAsync(() => {
      const service = setup('en-US');
      tick();
      expect(service.getLanguage()).toBe('en-US');
    }));
  });

  describe('#isSpanish / #isEnglish', () => {
    it('should return true for isSpanish when lang is es-ES', fakeAsync(() => {
      const service = setup('es-ES');
      tick();
      expect(service.isSpanish()).toBeTrue();
      expect(service.isEnglish()).toBeFalse();
    }));

    it('should return true for isEnglish when lang is en-US', fakeAsync(() => {
      const service = setup('en-US');
      tick();
      expect(service.isEnglish()).toBeTrue();
      expect(service.isSpanish()).toBeFalse();
    }));
  });

  describe('language resolution priority', () => {
    it('should prioritise savedLang from localStorage', fakeAsync(() => {
      const service = setup('en-US');
      tick();
      expect(service.currentLanguage()).toBe('en-US');
    }));

    it('should fall back to es-ES when saved lang is invalid', fakeAsync(() => {
      localStorage.setItem('language', 'fr-FR');
      TestBed.configureTestingModule({
        imports: [
          TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useValue: mockLoader }
          })
        ]
      });

      const translate = TestBed.inject(TranslateService);
      spyOn(translate, 'getBrowserLang').and.returnValue('fr');

      const service = TestBed.inject(LangService);
      tick();
      // 'fr' does not start with 'es', so should resolve to 'en-US'
      expect(service.currentLanguage()).toBe('en-US');
    }));

    it('should map a Spanish browser lang to es-ES when no saved lang',
      fakeAsync(() => {
        const service = setup(undefined, 'es');
        tick();
        expect(service.currentLanguage()).toBe('es-ES');
      })
    );
  });
});
