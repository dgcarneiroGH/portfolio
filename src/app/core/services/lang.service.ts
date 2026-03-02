import { inject, Injectable, signal, effect } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  private _translate = inject(TranslateService);

  private _currentLanguage = signal<string>('es-ES');

  currentLanguage = this._currentLanguage.asReadonly();

  private defaultLang = 'es-ES';
  private availableLanguages = ['en-US', 'es-ES'];

  constructor() {
    this._translate.addLangs(this.availableLanguages);
    this._translate.setDefaultLang(this.defaultLang);

    const savedLang = localStorage.getItem('language');
    const browserLang = this._translate.getBrowserLang();

    let langToUse = this.defaultLang;

    if (savedLang && this.availableLanguages.includes(savedLang)) {
      langToUse = savedLang;
    } else if (browserLang) {
      const normalizedBrowserLang = browserLang.toLowerCase();
      langToUse = normalizedBrowserLang.startsWith('es') ? 'es-ES' : 'en-US';
    }

    this.setLanguage(langToUse);

    // Effect to save in localStorage whenever the language changes
    effect(() => {
      const currentLang = this._currentLanguage();
      localStorage.setItem('language', currentLang);
    });
  }

  setLanguage(lang: string) {
    if (this.availableLanguages.includes(lang)) {
      this._translate.use(lang).subscribe(() => {
        this._currentLanguage.set(lang);
      });
    }
  }

  getLanguage(): string {
    return this._currentLanguage();
  }

  isSpanish(): boolean {
    return this._currentLanguage() === 'es-ES';
  }

  isEnglish(): boolean {
    return this._currentLanguage() === 'en-US';
  }
}
