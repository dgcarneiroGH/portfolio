import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  // private _translate = inject(TranslateService);

  private defaultLang = 'es-ES'; // Idioma predeterminado

  constructor() {
    // this._translate.addLangs(['en-US', 'es-ES']); // Agrega los idiomas disponibles
    // this._translate.setDefaultLang(this.defaultLang);
    // const browserLang =
    //   localStorage.getItem('language') || this._translate.getBrowserLang();
    // this.setLanguage(
    //   browserLang?.match(/en-US|es-ES/) ? browserLang : this.defaultLang
    // );
  }

  setLanguage(lang: string) {
    // this._translate.use(lang);
    // localStorage.setItem('language', lang);
  }

  getLanguage(): string {
    // return this._translate.currentLang;
    return '';
  }
}
