import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  private _translate = inject(TranslateService);

  private defaultLang = 'es-ES';

  constructor() {
    this._translate.addLangs(['en-US', 'es-ES']);
    this._translate.setDefaultLang(this.defaultLang);

    const savedLang = localStorage.getItem('language');
    const browserLang = this._translate.getBrowserLang();

    console.log('Idioma guardado:', savedLang);
    console.log('Idioma del navegador:', browserLang);

    let langToUse = this.defaultLang;

    if (savedLang) {
      langToUse = savedLang;
    } else if (browserLang) {
      const normalizedBrowserLang = browserLang.toLowerCase();
      langToUse = normalizedBrowserLang.startsWith('es') ? 'es-ES' : 'en-US';
    }

    this._translate
      .use(langToUse)
      .subscribe(() => localStorage.setItem('language', langToUse));
  }

  setLanguage(lang: string) {
    this._translate
      .use(lang)
      .subscribe(() => localStorage.setItem('language', lang));
  }

  getLanguage(): string {
    return this._translate.currentLang;
  }
}
