import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  private _translate = inject(TranslateService);

  // private defaultLang = 'es-ES';
  private defaultLang = 'en-US';

  constructor() {
    this._translate.addLangs(['en-US', 'es-ES']);
    this._translate.setDefaultLang(this.defaultLang);

    const savedLang = localStorage.getItem('language');
    const browserLang = this._translate.getBrowserLang();

    console.log('Idioma guardado:', savedLang);
    console.log('Idioma del navegador:', browserLang);

    let langToUse = this.defaultLang;

    if (savedLang) {
      console.log('Usando idioma guardado:', savedLang);
      langToUse = savedLang;
    } else if (browserLang) {
      const normalizedBrowserLang = browserLang.toLowerCase();
      langToUse = normalizedBrowserLang.startsWith('es') ? 'es-ES' : 'en-US';
      console.log('Idioma del navegador normalizado:', normalizedBrowserLang);
      console.log('Idioma soportado seleccionado:', langToUse);
    }

    console.log('Idioma final a usar:', langToUse);

    // Forzar el idioma inicial
    this._translate.use(langToUse).subscribe(() => {
      console.log('Idioma establecido:', this._translate.currentLang);
      localStorage.setItem('language', langToUse);
    });
  }

  setLanguage(lang: string) {
    console.log('Estableciendo idioma:', lang);
    this._translate.use(lang).subscribe(() => {
      console.log('Idioma establecido:', this._translate.currentLang);
      localStorage.setItem('language', lang);
    });
  }

  getLanguage(): string {
    return this._translate.currentLang;
  }
}
