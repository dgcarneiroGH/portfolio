import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
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
    ],
    providers: [provideZonelessChangeDetection()]
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
    it('should update currentLanguage signal to a valid language', () => {
      const service = setup('es-ES');
      service.setLanguage('en-US');
      expect(service.currentLanguage()).toBe('en-US');
    });

    it('should NOT update currentLanguage for an unsupported language', () => {
      const service = setup('es-ES');
      service.setLanguage('fr-FR' as string);
      expect(service.currentLanguage()).toBe('es-ES');
    });

    it('should persist language to localStorage when changed', async () => {
      const service = setup('es-ES');
      service.setLanguage('en-US');

      // Wait a short time for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(localStorage.getItem('language')).toBe('en-US');
    });
  });

  describe('#getLanguage', () => {
    it('should return the current language string', () => {
      const service = setup('en-US');
      expect(service.getLanguage()).toBe('en-US');
    });
  });

  describe('#isSpanish / #isEnglish', () => {
    it('should return true for isSpanish when lang is es-ES', () => {
      const service = setup('es-ES');
      expect(service.isSpanish()).toBeTrue();
      expect(service.isEnglish()).toBeFalse();
    });

    it('should return true for isEnglish when lang is en-US', () => {
      const service = setup('en-US');
      expect(service.isEnglish()).toBeTrue();
      expect(service.isSpanish()).toBeFalse();
    });
  });

  describe('language resolution priority', () => {
    it('should prioritise savedLang from localStorage', () => {
      const service = setup('en-US');
      expect(service.currentLanguage()).toBe('en-US');
    });

    it('should fall back to es-ES when saved lang is invalid', () => {
      localStorage.setItem('language', 'fr-FR');
      TestBed.configureTestingModule({
        imports: [
          TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useValue: mockLoader }
          })
        ],
        providers: [provideZonelessChangeDetection()]
      });

      const translate = TestBed.inject(TranslateService);
      spyOn(translate, 'getBrowserLang').and.returnValue('fr');

      const service = TestBed.inject(LangService);
      // 'fr' does not start with 'es', so should resolve to 'en-US'
      expect(service.currentLanguage()).toBe('en-US');
    });

    it('should map a Spanish browser lang to es-ES when no saved lang', () => {
      const service = setup(undefined, 'es');
      expect(service.currentLanguage()).toBe('es-ES');
    });
  });
});
