import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding
} from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TagCanvasModule } from 'ng-tagcanvas';
import { APP_ROUTES, CustomTitleStrategy } from './app/app-routing';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(APP_ROUTES, withComponentInputBinding()),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      BrowserAnimationsModule,
      TagCanvasModule.forRoot(),
      TranslateModule.forRoot({
        defaultLanguage: 'es-ES',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    { provide: TitleStrategy, useClass: CustomTitleStrategy }
  ]
}).catch((err) => console.error(err));

// bootstrapApplication(AppComponent, {
//   providers: [
//     importProvidersFrom(
//       RouterModule.forRoot(APP_ROUTES, { useHash: true }),
//       TagCanvasModule.forRoot(),
//       BrowserAnimationsModule
//     ),
//     provideHttpClient(),
//     { provide: TitleStrategy, useClass: CustomTitleStrategy }
//   ]
// }).catch((err) => console.error(err));
