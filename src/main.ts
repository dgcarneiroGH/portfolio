import { registerLocaleData } from '@angular/common';
import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import {
  enableProdMode,
  importProvidersFrom,
  provideZonelessChangeDetection
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation, withViewTransitions, TitleStrategy } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';
import { A11yTitleStrategy } from './app/core/services/a11y-title-strategy';
import esEs from './assets/i18n/es-ES.json';

if (environment.production) {
  enableProdMode();
}

/**
 * Loader compuesto: el idioma por defecto (es-ES) se empaqueta inline para
 * evitar la petición XHR durante el arranque (mejora FCP/LCP). Los demás
 * idiomas se cargan por HTTP como hasta ahora.
 */
export class I18nCompositeLoader implements TranslateLoader {
  private readonly httpLoader: TranslateHttpLoader;

  constructor(http: HttpClient) {
    this.httpLoader = new TranslateHttpLoader(http, './assets/i18n/', '.json');
  }

  getTranslation(lang: string): Observable<Record<string, unknown>> {
    return lang === 'es-ES'
      ? of(esEs)
      : this.httpLoader.getTranslation(lang);
  }
}

export function I18nLoaderFactory(http: HttpClient) {
  return new I18nCompositeLoader(http);
}

registerLocaleData(localeEs, 'es-ES');
registerLocaleData(localeEn, 'en-US');

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation(), withViewTransitions()),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: TitleStrategy, useClass: A11yTitleStrategy },
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'es-ES',
        loader: {
          provide: TranslateLoader,
          useFactory: I18nLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
}).catch((err) => console.error(err));
