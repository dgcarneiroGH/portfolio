import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  private defaultLang = 'es-ES'; // Idioma predeterminado

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en-US', 'es-ES']); // Agrega los idiomas disponibles
    this.translate.setDefaultLang(this.defaultLang);

    const browserLang =
      localStorage.getItem('language') || this.translate.getBrowserLang();
    this.setLanguage(
      browserLang?.match(/en-US|es-ES/) ? browserLang : this.defaultLang
    );
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  getLanguage(): string {
    return this.translate.currentLang;
  }
}
