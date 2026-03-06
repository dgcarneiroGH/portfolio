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
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation, withViewTransitions } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

registerLocaleData(localeEs, 'es-ES');
registerLocaleData(localeEn, 'en-US');

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation(), withViewTransitions()),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'es-ES',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
}).catch((err) => console.error(err));
