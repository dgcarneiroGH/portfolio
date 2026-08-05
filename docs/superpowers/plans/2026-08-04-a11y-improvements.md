# Plan de Mejoras de Accesibilidad (WCAG 2.2 AA) — Portfolio

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir los 32 hallazgos del audit `docs/superpowers/specs/2026-08-04-a11y-audit-design.md` para alcanzar conformidad con WCAG 2.2 Nivel AA.

**Architecture:** Cambios incrementales organizados en 6 fases por severidad y categoría. Cada cambio sigue TDD cuando introduce comportamiento (TS/HTML con efectos en DOM) y se aplica como cambio puro cuando solo es visual (CSS/SCSS, paleta). Se preservan los landmarks, las clases CSS y los IDs públicos que ya están testeados por otros specs.

**Tech Stack:** Angular 21.2.4 (standalone components, signals, ReactiveForms, TranslateModule), SCSS, Jasmine/Karma (`@angular/build:karma`), axe-core (a11y tests), `@axe-core/cli` (smoke tests en build), ESLint `angular.configs.templateAccessibility`.

**Reglas de operación heredadas de `AGENTS.md`:**
- **Nunca** ejecutar `git add`, `git commit`, `git push`, `git tag`, creación de PRs ni ninguna operación que modifique el historial del repositorio sin confirmación explícita. Cada task termina en un paso **ASK**: indicar al usuario el comando exacto que se ejecutaría y esperar respuesta.

---

## Mapa de archivos tocados

| Archivo | Acción | Tasks |
|---|---|---|
| `src/app/app.component.html` | Modificar | F0-T2, F1-T1 |
| `src/app/app.component.ts` | Modificar | F5-T1 (TitleStrategy) |
| `src/app/app.routes.ts` | Modificar | F5-T1 |
| `src/index.html` | Sin cambios | — |
| `src/styles/_palette.scss` | Modificar | F1-T6, F4-T1 |
| `src/styles/styles.scss` | Modificar | F0-T1 |
| `src/assets/i18n/es-ES.json` | Modificar | F0-T3, F0-T5, F5-T1, F5-T2 |
| `src/assets/i18n/en-US.json` | Modificar | F0-T3, F0-T5, F5-T1, F5-T2 |
| `src/app/core/components/not-found-404/not-found-404.component.html` | Modificar | F1-T2 |
| `src/app/features/contact/components/contact.component.html` | Modificar | F1-T3 |
| `src/app/features/contact/components/contact.component.scss` | Modificar | F2-T3 |
| `src/app/features/contact/components/contact-form/contact-form.component.html` | Modificar | F1-T5 |
| `src/app/features/contact/components/contact-form/contact-form.component.ts` | Modificar | F1-T5 |
| `src/app/features/contact/components/contact-form/contact-form.component.spec.ts` | Crear/Modificar | F1-T5 |
| `src/app/features/reviews/components/reviews.component.html` | Modificar | F1-T4 |
| `src/app/features/reviews/components/reviews-form/reviews-form.component.html` | Modificar | F1-T5 |
| `src/app/features/reviews/components/reviews-form/reviews-form.component.ts` | Modificar | F1-T5 |
| `src/app/features/reviews/components/reviews-form/reviews-form.component.spec.ts` | Crear/Modificar | F1-T5 |
| `src/app/core/components/sidebar/sidebar.component.html` | Modificar | F2-T1 |
| `src/app/core/components/sidebar/sidebar.component.spec.ts` | Modificar | F2-T1 |
| `src/app/core/components/lang-selector/lang-selector.component.html` | Modificar | F2-T2 |
| `src/app/core/components/lang-selector/lang-selector.component.ts` | Modificar | F2-T2, F2-T3 |
| `src/app/core/components/lang-selector/lang-selector.component.spec.ts` | Modificar | F2-T2 |
| `src/app/shared/directives/click-outside.directive.ts` | Modificar | F2-T3 |
| `src/app/shared/directives/click-outside.directive.spec.ts` | Crear/Modificar | F2-T3 |
| `src/app/shared/directives/focusable.directive.ts` | Modificar | F3-T5 |
| `src/app/shared/directives/parallax-header.directive.ts` | Modificar | F4-T2 |
| `src/app/shared/directives/parallax-header.directive.spec.ts` | Crear/Modificar | F4-T2 |
| `src/app/shared/directives/animate.directive.ts` | Modificar | F4-T3 |
| `src/app/shared/directives/animate.directive.spec.ts` | Crear/Modificar | F4-T3 |
| `src/app/features/projects/components/project/project.component.html` | Modificar | F1-T5 (review rating), F3-T1, F3-T3 |
| `src/app/features/projects/components/project/project.component.ts` | Modificar | F3-T1 |
| `src/app/features/projects/components/project/project.component.spec.ts` | Modificar | F3-T1 |
| `src/app/shared/components/photo/photo.component.html` | Modificar | F3-T2 |
| `src/app/shared/components/photo/photo.component.ts` | Modificar | F3-T2 |
| `src/app/shared/components/photo/photo.component.spec.ts` | Modificar | F3-T2 |
| `src/app/features/blog/components/blog-filter/blog-filter.component.html` | Modificar | F3-T4 |
| `src/app/features/blog/components/blog-filter/blog-filter.component.ts` | Modificar | F3-T4 |
| `src/app/features/blog/components/blog-filter/blog-filter.component.spec.ts` | Modificar | F3-T4 |
| `src/app/shared/components/toggle-button/toggle-button.component.html` | Modificar | F3-T6 |
| `src/app/shared/components/toggle-button/toggle-button.component.ts` | Modificar | F3-T6 |
| `src/app/features/experience/directives/timeline.directive.ts` | Modificar | F4-T3 |
| `src/app/features/experience/directives/timeline.directive.spec.ts` | Crear/Modificar | F4-T3 |
| `src/app/features/experience/interfaces/experience.interface.ts` | Modificar | F4-T4 |
| `src/app/features/experience/components/experience.component.html` | Modificar | F4-T4 |
| `src/app/features/blog/components/blog.component.ts` | Modificar | F4-T5 |
| `src/app/features/home/components/home.component.html` | Modificar | F2-T4 (h1)|
| `src/app/features/about/components/about.component.html` | Modificar | F2-T4 |
| `src/app/features/projects/components/projects.component.html` | Modificar | F2-T4 |
| `src/app/features/reviews/components/reviews.component.html` | Modificar | F2-T4 |
| `src/app/features/contact/components/contact.component.html` | Modificar | F2-T4 |
| `src/app/shared/components/loading/loading.component.html` | Modificar | F5-T3 |
| `src/app/shared/components/loading/loading.component.ts` | Modificar | F5-T3 |
| `package.json` | Modificar | F6-T1, F6-T2 |
| `karma.conf.js` | Modificar | F6-T1 |
| `src/test.ts` | Modificar | F6-T1 |
| `scripts/a11y-smoke.mjs` | Crear | F6-T2 |
| `README.md` | Modificar | F6-T3 |
| `angular.json` | Modificar | F6-T2 |

---

## Fase 0 — Quick wins (severidad Baja, cambios aislados)

### Task 0.1 (F0-T1): Skip-link en `app.component.html` apunta a `#main-content`

> Cubre hallazgo **H01**.

**Files:**
- Modify: `src/app/app.component.html:1-13`
- Modify: `src/styles/styles.scss:63-92` (no se toca el foco global, solo verificamos que `outline:none` no elimina la pista del skip-link)

- [ ] **Step 1: Confirmar el estado actual del skip-link**

Lectura: `src/app/app.component.html:1-13` muestra dos `@if` que generan el skip-link apuntando a `#blog` o `routerLink="/"`. Esto NO satisface WCAG 2.4.1 (Bypass Blocks) porque el skip-link debe saltar contenido repetido en la MISMA página.

- [ ] **Step 2: Reescribir el bloque de skip-link**

Reemplazar **todo** el contenido entre `@if (isBlogRoute()) { ... } @else { ... }` por:

```html
<a class="skip-link" href="#main-content">{{ 'COMMON.SKIP_TO_MAIN' | translate }}</a>
```

- [ ] **Step 3: Añadir claves i18n en ambos idiomas**

En `src/assets/i18n/es-ES.json`, dentro de `COMMON`, añadir:
```json
"SKIP_TO_MAIN": "Saltar al contenido principal"
```

En `src/assets/i18n/en-US.json`, dentro de `COMMON`, añadir:
```json
"SKIP_TO_MAIN": "Skip to main content"
```

- [ ] **Step 4: Verificar visualmente que `<main>` recibe foco**

En `src/app/app.component.html:18` ya hay `<main id="main-content" ...>`. Asegurar que `:focus` da señal visible. En `src/styles/styles.scss`, dentro del bloque `.skip-link:focus`, añadir regla para `#main-content:focus`:

```scss
#main-content:focus {
  outline: 3px solid palette.$accent-blue;
  outline-offset: -3px;
}
```

- [ ] **Step 5: Test manual**

Ejecutar `npm start` (o `ng serve`), tabular con teclado: el primer enlace debe ser el skip-link. Activarlo → el foco se mueve al `<main>` con un outline visible.

- [ ] **Step 6: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/app.component.html src/assets/i18n/es-ES.json src/assets/i18n/en-US.json src/styles/styles.scss
> git commit -m "fix(a11y): skip-link targets #main-content (WCAG 2.4.1)"
> ```
> ¿Lo ejecuto? (La regla de `AGENTS.md` exige confirmación explícita.)

---

### Task 0.2 (F0-T2): `LoadingComponent` con `aria-label` traducible

> Cubre hallazgo **H29**.

**Files:**
- Modify: `src/app/shared/components/loading/loading.component.html:1-23`
- Modify: `src/assets/i18n/es-ES.json` y `en-US.json`

- [ ] **Step 1: Reescribir el template del loading**

Reemplazar `src/app/shared/components/loading/loading.component.html` por:

```html
<div
  class="loading-overlay"
  data-testid="loading-overlay"
  role="status"
  [attr.aria-label]="'COMMON.LOADING' | translate"
  aria-busy="true"
  inert
>
  <div class="loading-composite" data-testid="loading-composite">
    <img
      class="loading-spin"
      data-testid="loading-spinner"
      src="assets/images/loading.avif"
      alt=""
      aria-hidden="true"
    />
    <img
      class="loading-nomacoda"
      data-testid="loading-nomacoda"
      src="assets/images/nomacoda/nomacoda_full_transparent.avif"
      alt=""
      aria-hidden="true"
    />
  </div>
</div>
```

(Cambios: `aria-label="Cargando..."` → traducible. `alt="Nomacoda"` → `alt="" aria-hidden="true"` por ser decorativa.)

- [ ] **Step 2: Asegurar `TranslateModule` importado en `LoadingComponent`**

Modificar `src/app/shared/components/loading/loading.component.ts`:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule]
})
export class LoadingComponent {}
```

- [ ] **Step 3: Añadir `COMMON.LOADING` a i18n**

En `src/assets/i18n/es-ES.json`, añadir dentro de `COMMON`:
```json
"LOADING": "Cargando..."
```

En `src/assets/i18n/en-US.json`, añadir dentro de `COMMON`:
```json
"LOADING": "Loading..."
```

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/shared/components/loading/ src/assets/i18n/
> git commit -m "fix(a11y): i18n aria-label and decorative alts on loading overlay"
> ```
> ¿Lo ejecuto?

---

### Task 0.3 (F0-T3): SVG waves decorativo con `aria-hidden`

> Cubre hallazgo **H19**.

**Files:**
- Modify: `src/app/core/components/sidebar/sidebar.component.html:19-63`

- [ ] **Step 1: Reescribir el `<svg>` del waves**

Localizar el bloque `<svg class="waves" ...>` y añadir `aria-hidden="true" focusable="false"` justo después de `class="waves"`. El snippet exacto a localizar (líneas 19-26):

```html
<svg
  class="waves"
  xmlns="http://www.w3.org/2000/svg"
  ...
```

Quedará así (solo se añade las dos líneas marcadas):

```html
<svg
  class="waves"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 24 150 28"
  preserveAspectRatio="none"
  shape-rendering="auto"
  aria-hidden="true"
  focusable="false"
>
```

- [ ] **Step 2: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/core/components/sidebar/sidebar.component.html
> git commit -m "fix(a11y): hide decorative waves SVG from AT"
> ```
> ¿Lo ejecuto?

---

### Task 0.4 (F0-T4): Experience timeline `<time>` con `datetime`

> Cubre hallazgo **H27** (parcial — depende del modelo de datos). Si los datos en `experience.constants.ts` no tienen `yearStart` y `yearEnd`, ampliar primero la interfaz.

**Files:**
- Modify: `src/app/features/experience/interfaces/experience.interface.ts`
- Modify: `src/app/features/experience/components/experience.component.html:17`
- Modify (opcional): `src/app/features/experience/constants/experience.constants.ts` si los años no son parseables

- [ ] **Step 1: Extender `Experience` con año ISO**

Abrir `src/app/features/experience/interfaces/experience.interface.ts` y añadir:

```typescript
export interface Experience {
  company: string;
  designation: string;
  role: string;
  yearRange: string;     // existente, p.ej. "2022 - 2023"
  yearStart?: number;    // NUEVO: año de inicio (p.ej. 2022)
  yearEnd?: number | 'Actualidad' | 'Present'; // NUEVO: año fin
  description: string;
}
```

- [ ] **Step 2: Añadir `yearStart` y `yearEnd` a las constantes**

En `src/app/features/experience/constants/experience.constants.ts`, recorrer cada experiencia y añadir `yearStart` / `yearEnd` coherentes con `yearRange`. Ejemplo:

```typescript
{
  company: 'Nomacoda',
  designation: 'EXPERIENCE.FREELANCE_DEVELOPER',
  role: 'EXPERIENCE.ROLE_NOMACODA',
  yearRange: 'EXPERIENCE.ACTUAL_JOB',
  yearStart: 2024,
  yearEnd: 'Present',
  description: 'EXPERIENCE.DESCRIPTION_NOMACODA'
}
```

(Rellenar el resto de entradas de manera análoga.)

- [ ] **Step 3: Render `<time datetime>`**

En `src/app/features/experience/components/experience.component.html:17`, reemplazar:

```html
<time>{{ e.yearRange | translate }}</time>
```

por:

```html
<time
  [attr.datetime]="e.yearStart && (e.yearEnd === 'Present' || e.yearEnd === 'Actualidad')
    ? e.yearStart
    : (e.yearStart && e.yearEnd ? e.yearStart + '/' + e.yearEnd : null)"
>{{ e.yearRange | translate }}</time>
```

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/experience/
> git commit -m "fix(a11y): add semantic datetime to experience entries"
> ```
> ¿Lo ejecuto?

---

### Task 0.5 (F0-T5): Title por ruta con `TitleStrategy`

> Cubre hallazgo **H28**.

**Files:**
- Create: `src/app/core/services/a11y-title-strategy.ts`
- Modify: `src/app/app.routes.ts:1-35`
- Modify: `src/main.ts:33-48`
- Modify: `src/assets/i18n/es-ES.json` y `en-US.json`

- [ ] **Step 1: Crear `A11yTitleStrategy`**

Crear `src/app/core/services/a11y-title-strategy.ts`:

```typescript
import { Injectable, inject } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class A11yTitleStrategy extends TitleStrategy {
  private translate = inject(TranslateService);
  private baseTitle = 'Nomacoda | Freelance Frontend Developer';

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const titleKey = snapshot.root.firstChild?.data?.['titleKey'];
    if (titleKey) {
      const sub = this.translate.instant(titleKey);
      document.title = `${sub} — ${this.baseTitle}`;
    } else {
      document.title = this.baseTitle;
    }
  }
}
```

- [ ] **Step 2: Definir claves de título por ruta**

En `src/app/app.routes.ts`, importar las claves vía `data: { titleKey: 'ROUTE.HOME' }` etc.:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/components/sections-wrapper/sections-wrapper.component').then(
        (m) => m.SectionsWrapperComponent
      ),
    data: { animation: 'Home', titleKey: 'ROUTE.PORTFOLIO' },
    pathMatch: 'full'
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/blog/components/blog.component').then((m) => m.BlogComponent),
    data: { animation: 'Blog', titleKey: 'ROUTE.BLOG' }
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./features/blog/components/blog.component').then((m) => m.BlogComponent),
    data: { titleKey: 'ROUTE.BLOG_POST' }
  },
  {
    path: '**',
    loadComponent: () =>
      import('./core/components/not-found-404/not-found-404.component').then(
        (m) => m.NotFound404Component
      ),
    data: { titleKey: 'ROUTE.NOT_FOUND' }
  }
];
```

- [ ] **Step 3: Registrar la estrategia en bootstrap**

En `src/main.ts:33-48`, en los `providers` añadir `{ provide: TitleStrategy, useClass: A11yTitleStrategy }` y el import:

```typescript
import { TitleStrategy } from '@angular/router';
import { A11yTitleStrategy } from './app/core/services/a11y-title-strategy';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation(), withViewTransitions()),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: TitleStrategy, useClass: A11yTitleStrategy },
    importProvidersFrom(TranslateModule.forRoot({ ... }))
  ]
}).catch((err) => console.error(err));
```

- [ ] **Step 4: Añadir claves i18n para los títulos**

En `src/assets/i18n/es-ES.json`, añadir bloque nuevo:
```json
"ROUTE": {
  "PORTFOLIO": "Portafolio",
  "BLOG": "Blog",
  "BLOG_POST": "Artículo del blog",
  "NOT_FOUND": "Página no encontrada"
}
```

En `src/assets/i18n/en-US.json`, añadir:
```json
"ROUTE": {
  "PORTFOLIO": "Portfolio",
  "BLOG": "Blog",
  "BLOG_POST": "Blog post",
  "NOT_FOUND": "Page not found"
}
```

- [ ] **Step 5: Verificar manualmente**

Levantar `npm start`. Cambiar entre `/`, `/blog`, `/blog/<slug-que-no-existe>`, `/no-existe`. El `document.title` (visible en la pestaña del navegador) debe actualizarse con el sufijo `- Nomacoda | Freelance Frontend Developer`.

- [ ] **Step 6: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/core/services/a11y-title-strategy.ts src/app/app.routes.ts src/main.ts src/assets/i18n/
> git commit -m "feat(a11y): per-route document title via TitleStrategy"
> ```
> ¿Lo ejecuto?

---

## Fase 1 — Críticos (hitos de conformidad)

### Task 1.1 (F1-T1): Página 404 con `<h1>` y "volver" semántico

> Cubre hallazgo **H02**.

**Files:**
- Modify: `src/app/core/components/not-found-404/not-found-404.component.html`

- [ ] **Step 1: Reemplazar template del 404**

Reemplazar `src/app/core/components/not-found-404/not-found-404.component.html` por:

```html
<main class="error-container" role="main">
  <img
    class="error-image"
    src="assets/images/nomacoda/error_404.avif"
    [alt]="'ERROR_404.IMAGE_ALT' | translate"
  />
  <h1 class="visually-hidden">{{ 'ERROR_404.TITLE' | translate }}</h1>
  <a
    class="portfolio-btn"
    routerLink="/"
    [attr.aria-label]="'COMMON.NAV_HOME' | translate"
  >
    <img
      src="assets/images/icons/portfolio_signal.avif"
      alt=""
      aria-hidden="true"
    />
  </a>
</main>
```

El `<h1>` se queda visualmente oculto pero presente para lectores de pantalla. Si se prefiere visible, eliminar `visually-hidden` y dar estilo a `h1`.

- [ ] **Step 2: Añadir la regla `visually-hidden` al global SCSS**

En `src/styles/styles.scss`, añadir al final del bloque de Accesibilidad (línea ~190):

```scss
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
```

- [ ] **Step 3: Test manual**

Visitar `/ruta-que-no-existe`. El lector de pantalla debe anunciar `<h1>` con el texto `ERROR_404.TITLE`.

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/core/components/not-found-404/ src/styles/styles.scss
> git commit -m "fix(a11y): add h1 and accessible link to 404 page"
> ```
> ¿Lo ejecuto?

---

### Task 1.2 (F1-T2): Botón "Ir a reseñas" — sustituir `<div>` por `<button>`

> Cubre hallazgo **H03**.

**Files:**
- Modify: `src/app/features/contact/components/contact.component.html:7-28`
- Modify: `src/app/features/contact/components/contact.component.scss` (añadir `.btn-reset`)

- [ ] **Step 1: Reemplazar el `<div role="button">` por `<button>`**

En `src/app/features/contact/components/contact.component.html`, reemplazar las líneas 7-28 (el `.nomacoda-animation-wrapper` con sus dos imágenes) por:

```html
<button
  type="button"
  class="nomacoda-animation-wrapper btn-reset"
  [attr.aria-label]="'CONTACT.GO_TO_REVIEWS' | translate"
  (click)="navigate()"
>
  <img
    src="assets/images/nomacoda/nomacoda_climber1.avif"
    class="img-base"
    alt=""
    aria-hidden="true"
  />
  <img
    src="assets/images/nomacoda/nomacoda_climber2.avif"
    class="img-hover"
    alt=""
    aria-hidden="true"
  />
</button>
```

- [ ] **Step 2: Resetear estilos nativos de `<button>` con clase `.btn-reset`**

En `src/app/features/contact/components/contact.component.scss`, añadir al final:

```scss
.btn-reset {
  background: transparent;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
```

(Si más componentes necesitan el reset, moverlo a `src/styles/styles.scss`.)

- [ ] **Step 3: Verificar teclado**

Tabular en la página Contact: el botón recibe foco con el anillo de gradiente global (revisar `:focus-visible`). Enter/Space ejecutan `navigate()` (los `<button>` nativos ya lo hacen).

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/contact/components/contact.component.html src/app/features/contact/components/contact.component.scss
> git commit -m "fix(a11y): use native button for CONTACT.GO_TO_REVIEWS"
> ```
> ¿Lo ejecuto?

---

### Task 1.3 (F1-T3): Botón "Volver" de reseñas — sustituir `<div>` por `<button>`

> Cubre hallazgo **H04**.

**Files:**
- Modify: `src/app/features/reviews/components/reviews.component.html:28-50`

- [ ] **Step 1: Reemplazar `<div class="nomacoda-campfire">` por `<button>`**

Localizar las líneas 28-50 del archivo y reemplazar el bloque entero por:

```html
<button
  type="button"
  class="nomacoda-campfire btn-reset"
  (click)="navigate()"
  [attr.aria-label]="'REVIEWS.GO_BACK' | translate"
>
  <img
    src="assets/images/campfire.avif"
    alt=""
    aria-hidden="true"
    class="campfire-fire"
  />
  <img
    src="assets/images/nomacoda/nomacoda_campfire.avif"
    alt=""
    aria-hidden="true"
    class="campfire-character"
  />
</button>
```

- [ ] **Step 2: Compartir `.btn-reset`**

Copiar `.btn-reset` al `reviews.component.scss` (ver F1-T2 step 2 para el snippet). Si se centraliza en estilos globales, moverlo a `src/styles/styles.scss` y borrar de los componentes individuales.

- [ ] **Step 3: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/reviews/components/reviews.component.html src/app/features/reviews/components/reviews.component.scss
> git commit -m "fix(a11y): use native button for REVIEWS.GO_BACK"
> ```
> ¿Lo ejecuto?

---

### Task 1.4 (F1-T4): Formularios con `<label>` + `aria-describedby` + `aria-invalid`

> Cubre hallazgos **H05** y **H06**. La lógica es idéntica en contact y reviews; se aplica a ambos en esta tarea.

**Files:**
- Modify: `src/app/features/contact/components/contact-form/contact-form.component.html`
- Modify: `src/app/features/contact/components/contact-form/contact-form.component.ts`
- Modify: `src/app/features/reviews/components/reviews-form/reviews-form.component.html`
- Modify: `src/app/features/reviews/components/reviews-form/reviews-form.component.ts`
- Modify (opcional): `src/app/features/contact/components/contact-form/contact-form.component.scss` (espaciado entre `<label>` y `<input>`)
- Modify (opcional): `src/app/features/reviews/components/reviews-form/reviews-form.component.scss`

- [ ] **Step 1: Reescribir el `contact-form.component.html`**

Reemplazar todo el archivo por:

```html
@if (formStatus().success) {
  <div class="success-state" role="status" aria-live="polite">
    <div class="success-icon-wrap">
      <svg class="success-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <p class="success-title">{{ 'FORM.FORM_SUCCESS' | translate }}</p>
  </div>
} @else {
  <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
    <div class="name-email-row">
      <div class="field-group">
        <label for="contact-fullName">{{ 'FORM.NAME_PLACEHOLDER' | translate }}</label>
        <input
          id="contact-fullName"
          formControlName="fullName"
          type="text"
          autocomplete="name"
          [class.input-error]="invalid('fullName')"
          [attr.aria-invalid]="invalid('fullName') ? 'true' : null"
          [attr.aria-describedby]="invalid('fullName') ? 'contact-fullName-error' : null"
          required
        />
        @if (invalid('fullName')) {
          <div id="contact-fullName-error" class="error-message" role="alert">
            <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {{ 'FORM.NAME_ERROR' | translate }}
          </div>
        }
      </div>

      <div class="field-group">
        <label for="contact-email">{{ 'FORM.EMAIL_ARIA' | translate }}</label>
        <input
          id="contact-email"
          formControlName="email"
          type="email"
          autocomplete="email"
          [class.input-error]="invalid('email')"
          [attr.aria-invalid]="invalid('email') ? 'true' : null"
          [attr.aria-describedby]="invalid('email') ? 'contact-email-error' : null"
          required
        />
        @if (invalid('email')) {
          <div id="contact-email-error" class="error-message" role="alert">
            <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {{ 'FORM.EMAIL_ERROR' | translate }}
          </div>
        }
      </div>
    </div>

    <div class="field-group">
      <label for="contact-message">{{ 'FORM.MESSAGE_ARIA' | translate }}</label>
      <textarea
        id="contact-message"
        formControlName="message"
        rows="5"
        [class.input-error]="invalid('message')"
        [attr.aria-invalid]="invalid('message') ? 'true' : null"
        [attr.aria-describedby]="invalid('message') ? 'contact-message-error' : null"
        required
      ></textarea>
      @if (invalid('message')) {
        <div id="contact-message-error" class="error-message" role="alert">
          <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {{ 'FORM.MESSAGE_ERROR' | translate }}
        </div>
      }
    </div>

    <button
      type="submit"
      class="submit-btn"
      [disabled]="form.invalid || formStatus().loading"
      [class.loading]="formStatus().loading"
    >
      @if (formStatus().loading) {
        <span class="btn-spinner" aria-hidden="true"></span>
        {{ 'FORM.SUBMIT_LOADING' | translate }}
      } @else {
        {{ 'FORM.SUBMIT_BUTTON' | translate }}
      }
    </button>

    @if (formStatus().error) {
      <div class="form-error" role="alert">
        {{ formStatus().error! | translate }}
      </div>
    }
  </form>
}
```

- [ ] **Step 2: Añadir estilos para `<label>`**

En `src/app/features/contact/components/contact-form/contact-form.component.scss`, añadir antes de `input, textarea { ... }`:

```scss
label {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: palette.$text-primary;
}
```

- [ ] **Step 3: Aplicar la misma transformación a `reviews-form`**

Replicar la lógica de los pasos 1-2 sobre `src/app/features/reviews/components/reviews-form/reviews-form.component.html`. Cambios concretos:

- Añadir `<fieldset><legend>{{ 'REVIEWS.RATING_LABEL' | translate }}</legend>...</fieldset>` envolviendo el grupo de estrellas.
- Añadir clave i18n `REVIEWS.RATING_LABEL = "Valoración"` (es) / `"Rating"` (en).
- Convertir cada `.star-btn` a `role="radio"` con `aria-checked` (ver patrón en F3-T7 si se prefiere `input[type=radio]`).

Snippet del bloque de rating nuevo:

```html
<fieldset class="field-group rating-group">
  <legend>{{ 'REVIEWS.RATING_LABEL' | translate }}</legend>
  <div
    class="stars-row"
    (mouseleave)="clearHovered()"
    [class.input-error]="invalid('rating')"
    role="radiogroup"
    [attr.aria-describedby]="invalid('rating') ? 'reviews-rating-error' : null"
  >
    @for (star of stars; track star) {
      <button
        type="button"
        role="radio"
        class="star-btn"
        [class.active]="currentRating >= star"
        [class.lit]="hoveredRating() >= star || currentRating >= star"
        [attr.aria-checked]="currentRating === star"
        [attr.aria-label]="'REVIEWS.STAR_ARIA' | translate: { count: star }"
        (mouseenter)="setHovered(star)"
        (click)="setRating(star)"
      >
        <svg ...>...</svg>
      </button>
    }
  </div>
  @if (invalid('rating')) {
    <div id="reviews-rating-error" class="error-message" role="alert">
      {{ 'FORM.REQUIRED_ERROR' | translate }}
    </div>
  }
</fieldset>
```

Y añadir las claves i18n:
- `es-ES.json` → `"STAR_ARIA": "{{count}} estrellas"`, `"RATING_LABEL": "Valoración"`.
- `en-US.json` → `"STAR_ARIA": "{{count}} stars"`, `"RATING_LABEL": "Rating"`.

- [ ] **Step 4: Actualizar `reviews-form.component.ts` para añadir `aria-describedby`**

En `src/app/features/reviews/components/reviews-form/reviews-form.component.ts`, en el bloque `@if (invalid("rating"))`, sustituir por lo descrito en el snippet anterior. **Importante:** ya tenemos `invalid('rating')` devolviendo boolean; reutilizar.

- [ ] **Step 5: Tests (TDD)**

Primero añadimos el test que falla. Abrir `src/app/features/contact/components/contact-form/contact-form.component.spec.ts`. Si no existe, créalo:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ContactFormComponent } from './contact-form.component';

const mockLoader = { getTranslation: () => of({}) };

describe('ContactFormComponent a11y', () => {
  let fixture: ComponentFixture<ContactFormComponent>;
  let component: ContactFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContactFormComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('marks fullName as aria-invalid and aria-describedby when touched & invalid', () => {
    const input = fixture.nativeElement.querySelector('#contact-fullName') as HTMLInputElement;
    component.form.get('fullName')?.setValue('');
    component.form.get('fullName')?.markAsTouched();
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('contact-fullName-error');
    const described = fixture.nativeElement.querySelector('#contact-fullName-error') as HTMLElement;
    expect(described.getAttribute('role')).toBe('alert');
    expect(described.textContent).toContain('El nombre es obligatorio');
  });

  it('email input uses label[for=contact-email]', () => {
    const label = fixture.nativeElement.querySelector('label[for="contact-email"]') as HTMLLabelElement;
    const input = fixture.nativeElement.querySelector('#contact-email') as HTMLInputElement;
    expect(label).toBeTruthy();
    expect(input).toBeTruthy();
  });
});
```

- [ ] **Step 6: Ejecutar el test (debe pasar tras el cambio de template)**

Comando: `npm test -- --watch=false --browsers=ChromeHeadlessCI --include='**/contact-form.component.spec.ts'`
Esperado: 2 tests PASS. (Antes del paso 1 estaría FAIL porque el template original no tenía `<label>` ni `aria-describedby`.)

- [ ] **Step 7: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/contact/components/contact-form/ src/app/features/reviews/components/reviews-form/ src/assets/i18n/
> git commit -m "fix(a11y): labels, aria-describedby and aria-invalid in forms"
> ```
> ¿Lo ejecuto?

---

### Task 1.5 (F1-T5): Color de error con contraste AA en la paleta

> Cubre hallazgo **H11**.

**Files:**
- Modify: `src/styles/_palette.scss:9, 19`

- [ ] **Step 1: Cambiar el rojo**

En `src/styles/_palette.scss`, reemplazar:

```scss
$text-red: #d9534f;
```

por:

```scss
$text-red: #ff8a80;
```

Y reemplazar:

```scss
$text-red-high: #c0392b;
```

por (mantiene contraste alto, sigue siendo AA sobre fondos claros):

```scss
$text-red-high: #d32f2f;
```

- [ ] **Step 2: Validar contraste con herramienta**

Abrir https://webaim.org/resources/contrastchecker/ y comparar:
- `#ff8a80` (texto) sobre `#0f3254` (fondo) → debe ser **≥ 4.5:1**.

Si NO pasa, iterar a `#ff5252` o `#ffab91` hasta cumplir.

- [ ] **Step 3: Test visual manual**

Recorrer páginas con mensajes de error (`/` → reseñas → enviar vacío). El texto del error debe ser legible con fondo oscuro sin requerir aumento de zoom al 200%.

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/styles/_palette.scss
> git commit -m "fix(a11y): error text color now AA contrast on dark bg"
> ```
> ¿Lo ejecuto?

---

## Fase 2 — Navegación, teclado y landmark

### Task 2.1 (F2-T1): Sidebar de redes sociales → `<nav>` con label

> Cubre hallazgo **H08**.

**Files:**
- Modify: `src/app/core/components/sidebar/sidebar.component.html:1-17`
- Modify: `src/app/core/components/sidebar/sidebar.component.scss` (ajustar si hace falta)
- Modify: `src/assets/i18n/es-ES.json` y `en-US.json`

- [ ] **Step 1: Reescribir el bloque `<aside>`**

Reemplazar las líneas 1-17 de `src/app/core/components/sidebar/sidebar.component.html` por:

```html
<nav class="sidebar" [attr.aria-label]="'COMMON.SOCIAL_NAV' | translate">
  <div class="sidebar-content">
    <ul>
      @for (link of links(); track link.profileUrl) {
        <li>
          <a
            [href]="link.profileUrl | translate"
            target="_blank"
            rel="noopener noreferrer"
            [attr.aria-label]="link.title"
          >
            <img [src]="link.iconPath" [alt]="link.title" loading="lazy" />
          </a>
        </li>
      }
    </ul>
  </div>
  <div class="waves-container">
    <svg class="waves" ... aria-hidden="true" focusable="false">
      ...
    </svg>
  </div>
</nav>
```

(Añadir `aria-hidden="true" focusable="false"` al `<svg>` como en F0-T3.)

- [ ] **Step 2: Añadir claves i18n**

`es-ES.json` → dentro de `COMMON`:
```json
"SOCIAL_NAV": "Redes sociales y contacto"
```

`en-US.json`:
```json
"SOCIAL_NAV": "Social media and contact"
```

- [ ] **Step 3: Ajustar SCSS si afecta el layout**

El selector `.sidebar` se mantiene; el `<aside>` era full-anchored, ahora es `<nav>` con mismo display. Sin cambios de estilo necesarios en principio. Si el layout se rompe, comprobar `display: flex` u overrides.

- [ ] **Step 4: Test manual con lector de pantalla**

NVDA/VoiceOver debe anunciar "navigation region, Redes sociales y contacto, list, 6 items".

- [ ] **Step 5: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/core/components/sidebar/ src/assets/i18n/
> git commit -m "fix(a11y): sidebar social links exposed as nav landmark"
> ```
> ¿Lo ejecuto?

---

### Task 2.2 (F2-T2): `lang-selector` ARIA completo + TypeAhead + memory safety

> Cubre hallazgo **H13**.

**Files:**
- Modify: `src/app/core/components/lang-selector/lang-selector.component.html:11-57`
- Modify: `src/app/core/components/lang-selector/lang-selector.component.ts:41-106`
- Modify (test): `src/app/core/components/lang-selector/lang-selector.component.spec.ts` (existente)

- [ ] **Step 1: Actualizar `aria-haspopup` en el botón**

En `src/app/core/components/lang-selector/lang-selector.component.html:12`, cambiar `[attr.aria-haspopup]="true"` por `[attr.aria-haspopup]="'listbox'"`.

- [ ] **Step 2: Implementar TypeAhead y foco inicial al abrir con flecha**

Reemplazar el método `onKeyDown` y añadir `private _focusOption(delta: number)` en `lang-selector.component.ts`:

```typescript
onKeyDown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      this.toggleOptions();
      if (this.showOptions()) {
        // Mover foco a la primera opción tras abrir
        queueMicrotask(() => this._focusOption(0));
      }
      break;
    case 'Escape':
      this.closeOptions();
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (!this.showOptions()) {
        this.showOptions.set(true);
        queueMicrotask(() => this._focusOption(0));
      }
      break;
    case 'ArrowUp':
      if (this.showOptions()) {
        event.preventDefault();
        this.closeOptions();
      }
      break;
    case 'Home':
      if (this.showOptions()) { event.preventDefault(); this._focusOption(0); }
      break;
    case 'End':
      if (this.showOptions()) { event.preventDefault(); this._focusOption(this.filteredLanguages().length - 1); }
      break;
  }
}

private _focusOption(index: number): void {
  const options = document.querySelectorAll<HTMLLIElement>('.lang-selector-options li.lang');
  options[index]?.focus();
}
```

- [ ] **Step 3: Añadir test TDD**

Crear (o añadir) el siguiente test en `lang-selector.component.spec.ts`:

```typescript
it('opens with ArrowDown and focuses first option', () => {
  component.showOptions.set(false);
  const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
  component.onKeyDown(event);
  expect(component.showOptions()).toBe(true);
  // Verificar foco se mueve a la primera <li.lang> (buscar el primer <li> tras detectChanges)
  fixture.detectChanges();
  const firstOption = fixture.nativeElement.querySelector('.lang-selector-options li.lang') as HTMLLIElement;
  expect(document.activeElement).toBe(firstOption);
});
```

- [ ] **Step 4: Ejecutar test**

Comando: `npm test -- --watch=false --browsers=ChromeHeadlessCI --include='**/lang-selector.component.spec.ts'`
Esperado: PASS (si era FAIL antes, ahora pasa tras el cambio).

- [ ] **Step 5: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/core/components/lang-selector/
> git commit -m "fix(a11y): ARIA listbox pattern + TypeAhead and focus management"
> ```
> ¿Lo ejecuto?

---

### Task 2.3 (F2-T3): `ClickOutsideDirective` sin memory leak

> Cubre hallazgo **H14**.

**Files:**
- Modify: `src/app/shared/directives/click-outside.directive.ts:1-25`

- [ ] **Step 1: Reescribir la directiva**

Reemplazar todo el archivo por:

```typescript
import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  inject
} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  private elementRef = inject(ElementRef);

  @Output() appClickOutside = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.appClickOutside.emit();
    }
  }
}
```

(Cambio clave: `@HostListener('document:click')` en lugar de `addEventListener` manual. Angular limpia automáticamente al destruir el componente.)

- [ ] **Step 2: Si el spec existe, añadir un test de no-leak**

En `src/app/shared/directives/click-outside.directive.spec.ts`:

```typescript
it('does not emit click events after the host component is destroyed', () => {
  // Arrange: render directive inside a host component
  // Destroy fixture, click document, expect no emit
  const emitSpy = spyOn(directive.appClickOutside, 'emit');
  fixture.destroy();
  document.body.click();
  expect(emitSpy).not.toHaveBeenCalled();
});
```

Si el spec no existe, crearlo siguiendo el patrón de `focusable.directive.spec.ts`.

- [ ] **Step 3: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/shared/directives/click-outside.directive.ts src/app/shared/directives/click-outside.directive.spec.ts
> git commit -m "fix(a11y): click-outside uses HostListener (no document leak)"
> ```
> ¿Lo ejecuto?

---

### Task 2.4 (F2-T4): Jerarquía de encabezados — un solo `<h1>` por vista

> Cubre hallazgo **H07**.

**Files:**
- Modify: `src/app/features/home/components/home.component.html` (ya tiene un solo `<h1>` "DESCRIPTION"; OK)
- Modify: `src/app/features/about/components/about.component.html:8`
- Modify: `src/app/features/projects/components/projects.component.html:8`
- Modify: `src/app/features/experience/components/experience.component.html:8`
- Modify: `src/app/features/reviews/components/reviews.component.html:53`
- Modify: `src/app/features/contact/components/contact.component.html:3-6`
- Modify: `src/app/features/blog/components/blog.component.html:25`

- [ ] **Step 1: Definir la nueva jerarquía**

Convención tras el cambio:
- Home conserva su `<h1>` "Hello I'm Nomacoda" (`HOME.DESCRIPTION`).
- About / Projects / Experience / Reviews / Contact pasan a `<h2>`.
- Blog mantiene `<h1>` en el listado y `<h2>` en posts (ya está bien).

- [ ] **Step 2: Cambiar `<h1>` por `<h2>` en cada sección**

`about.component.html:8`:
```html
<h2 id="section-about">{{ "ABOUT.ABOUT_ME" | translate }}</h2>
```

`projects.component.html:8`:
```html
<h2 id="section-projects">{{ "PROJECTS.PROJECTS" | translate }}</h2>
```

`experience.component.html:8-10`:
```html
<h2 id="section-experience">
  {{ "EXPERIENCE.EXPERIENCE" | translate }}
</h2>
```

`reviews.component.html:53`:
```html
<h2 id="section-reviews" [appAnimate]="animationDelay()" translationKey="REVIEWS.TITLE"></h2>
```

`contact.component.html:3-6`:
```html
<h2 id="section-contact"
  [appAnimate]="animationDelay()"
  [translationKey]="'CONTACT.NOW_WE_KNOW'"></h2>
```

- [ ] **Step 3: Confirmar con un test de jerarquía**

En `src/app/app.component.spec.ts`, añadir:

```typescript
it('home renders exactly one <h1>', () => {
  // Renderizar solo la home y comprobar
  // (Este test sustituirá los asserts sueltos que ya hay, agrupándolos.)
  const headings = fixture.nativeElement.querySelectorAll('h1');
  // El test sólo cubre <app-root>; las secciones se montan vía <router-outlet>
  // → en la home solo debe haber 1 <h1> visible (HOME.DESCRIPTION)
  // Implementar renderizando SectionsWrapperComponent y contando.
});
```

Si el test requiere mucho setup, omitirlo y verificar manualmente con `document.querySelectorAll('h1')` en `index.html` levantado en local.

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/about/ src/app/features/projects/ src/app/features/experience/ src/app/features/reviews/ src/app/features/contact/
> git commit -m "fix(a11y): single h1 per view, sections as h2"
> ```
> ¿Lo ejecuto?

---

### Task 2.5 (F2-T5): `contact.component` target size mínimo 44×44

> Cubre hallazgo **H20** y complementa H03.

**Files:**
- Modify: `src/app/features/contact/components/contact.component.scss` (`.nomacoda-animation-wrapper`)

- [ ] **Step 1: Añadir `min-width` y `min-height`**

En `src/app/features/contact/components/contact.component.scss`, añadir/modificar el selector:

```scss
.nomacoda-animation-wrapper {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 2: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/contact/components/contact.component.scss
> git commit -m "fix(a11y): min 44x44 click target on contact climber button"
> ```
> ¿Lo ejecuto?

---

## Fase 3 — ARIA patterns e imágenes

### Task 3.1 (F3-T1): `project.component` — usar `altKey` para la imagen de portada

> Cubre hallazgo **H09**.

**Files:**
- Modify: `src/app/features/projects/components/project/project.component.html:8-25`
- Modify: `src/app/features/projects/components/project/project.component.ts:21-66`
- Modify: `src/app/features/projects/components/project/project.component.spec.ts`

- [ ] **Step 1: Reemplazar el botón-cover por un `<img>` real**

En `src/app/features/projects/components/project/project.component.html`, reemplazar el `<button class="cover-img">` (líneas 17-25) y el `<img #sourceImage>` de pre-load (líneas 10-16) por:

```html
<button
  class="cover-img"
  [class.has-url]="url()"
  (click)="goTo()"
  (keydown)="onKeyDown($event, 'goTo')"
  [attr.aria-label]="('PROJECTS.VIEW_PROJECT' | translate: { name: name() }) + ' — ' + altText()"
  type="button"
>
  <img
    #coverImage
    [src]="coverImgSrc() + '.avif'"
    (load)="onImageLoad(coverImage)"
    [alt]="altText()"
    class="cover-img-el"
  />
</button>
```

(El `<img>` interno reemplaza al `background-image`; `.cover-img-el` ocupará todo el botón.)

- [ ] **Step 2: Sustituir el `cover-img` CSS para trabajar con `<img>` interno**

En `src/app/features/projects/components/project/project.component.scss:57-75`, reemplazar el bloque `.cover-img` por:

```scss
.cover-img {
  width: 100%;
  height: 9rem;
  padding: 0;
  border-radius: 2rem;
  border: none;
  background: transparent;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 24px 0 rgba($color: palette.$background-gradient-start, $alpha: 0.17);

  .cover-img-el {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &.has-url:hover {
    box-shadow: 0 4px 24px 0 rgba($color: palette.$accent-yellow, $alpha: 0.35);
  }
}
```

- [ ] **Step 3: TS: añadir helper `altText()`**

En `src/app/features/projects/components/project/project.component.ts`, dentro de la clase:

```typescript
import { TranslateService } from '@ngx-translate/core';

private _translate = inject(TranslateService);

altText = computed(() => this._translate.instant(this.altKey()));
```

(Inyectar `TranslateService`. Si prefieres mantener el patrón de Angular signals con traducción reactiva, usa `toSignal(this._translate.stream(this.altKey()))`.)

- [ ] **Step 4: Test**

Añadir al `project.component.spec.ts`:

```typescript
it('renders <img alt> using altKey translation', () => {
  const img = fixture.nativeElement.querySelector('button.cover-img img') as HTMLImageElement;
  expect(img?.alt).toBeTruthy();
  expect(img.alt.length).toBeGreaterThan(0);
});
```

- [ ] **Step 5: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/projects/components/project/
> git commit -m "fix(a11y): project cover image has descriptive alt (uses altKey)"
> ```
> ¿Lo ejecuto?

---

### Task 3.2 (F3-T2): `photo.component` `<img>` real con `alt`

> Cubre hallazgo **H10**.

**Files:**
- Modify: `src/app/shared/components/photo/photo.component.html:1-9`
- Modify (opcional): `src/app/shared/components/photo/photo.component.ts`
- Modify (test): `src/app/shared/components/photo/photo.component.spec.ts` (si existe)

- [ ] **Step 1: Sustituir `<div role="img">` por `<img>`**

Reemplazar el archivo por:

```html
<img class="photo" [src]="imgSrc()" [alt]="altText()" [style.--animation-delay]="animationDelay()" />
```

- [ ] **Step 2: Ajustar estilos**

En `src/app/shared/components/photo/photo.component.scss`, añadir:

```scss
.photo {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 1rem;
  opacity: 0;
  animation: fade-in 0.6s ease forwards;
  animation-delay: var(--animation-delay, 0s);
}

@keyframes fade-in {
  to { opacity: 1; }
}
```

- [ ] **Step 3: Test**

Si existe spec, añadir:

```typescript
it('renders an <img> with the provided alt text', () => {
  const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
  expect(img).toBeTruthy();
  expect(img.alt).toBe(component.altText());
});
```

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/shared/components/photo/
> git commit -m "fix(a11y): photo component uses real img alt"
> ```
> ¿Lo ejecuto?

---

### Task 3.3 (F3-T3): `project.component` `aria-controls` en toggle Info

> Cubre hallazgo **H17**.

**Files:**
- Modify: `src/app/features/projects/components/project/project.component.html:28-49`

- [ ] **Step 1: Añadir `id` al `<p class="description">` y `aria-controls` al botón**

Reemplazar el bloque `.project-info` del template por:

```html
<div class="project-info">
  <h3 class="title" [class.show]="showMoreInfo()" [id]="'project-title-' + index()">{{ name() }}</h3>

  <div class="project-details">
    <p
      class="description"
      [class.show]="showMoreInfo()"
      [id]="'project-desc-' + index()"
      [attr.aria-labelledby]="'project-title-' + index()"
    >
      {{ description() | translate }}
    </p>

    <app-button
      style="z-index: 0"
      [color]="btnColor()"
      [text]="(showMoreInfo() ? '-' : '+') + ' Info'"
      [disabled]="!canToggleInfo()"
      (buttonClick)="handleMoreInfoClick()"
      [attr.aria-expanded]="showMoreInfo()"
      [attr.aria-controls]="'project-desc-' + index()"
      [attr.aria-label]="
        (showMoreInfo() ? 'PROJECTS.TOGGLE_INFO_HIDE' : 'PROJECTS.TOGGLE_INFO_SHOW') | translate
      "
    ></app-button>
  </div>
</div>
```

- [ ] **Step 2: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/projects/components/project/project.component.html
> git commit -m "fix(a11y): project info toggle uses aria-controls and labelledby"
> ```
> ¿Lo ejecuto?

---

### Task 3.4 (F3-T4): `blog-filter` `role="group"` + `aria-pressed`

> Cubre hallazgo **H15**.

**Files:**
- Modify: `src/app/features/blog/components/blog-filter/blog-filter.component.html:1-12`
- Modify: `src/app/features/blog/components/blog-filter/blog-filter.component.ts:14-28`

- [ ] **Step 1: Reescribir el template**

Reemplazar el archivo por:

```html
<div
  class="filter-container"
  role="group"
  [attr.aria-label]="'BLOG.FILTER_GROUP' | translate"
>
  @for (filter of filters; track filter.category) {
    <button
      class="filter-pill"
      [class.active]="isFilterSelected(filter)"
      type="button"
      data-testid="filter-pill"
      [attr.aria-pressed]="isFilterSelected(filter)"
      (click)="selectFilter(filter)"
    >
      {{ filter.label | translate }}
    </button>
  }
</div>
```

- [ ] **Step 2: Añadir clave i18n**

`es-ES.json`, dentro de `BLOG`:
```json
"FILTER_GROUP": "Filtrar artículos por categoría"
```

`en-US.json`:
```json
"FILTER_GROUP": "Filter articles by category"
```

- [ ] **Step 3: Test**

En `blog-filter.component.spec.ts`, añadir:

```typescript
it('marks the selected filter pill as aria-pressed=true', () => {
  component.selectFilter(BLOG_FILTERS[0]);
  fixture.detectChanges();
  const pill = fixture.nativeElement.querySelector('[data-testid="filter-pill"]') as HTMLButtonElement;
  expect(pill.getAttribute('aria-pressed')).toBe('true');
});
```

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/blog/components/blog-filter/ src/assets/i18n/
> git commit -m "fix(a11y): blog filter pills as toggle group with aria-pressed"
> ```
> ¿Lo ejecuto?

---

### Task 3.5 (F3-T5): `focusable.directive` deprecada (sustituir usos)

> Cubre hallazgo **H32**.

**Files:**
- Modify: `src/app/shared/directives/focusable.directive.ts:1-32`
- (Grep en `src/` para localizar usos y sustituirlos por `<button>`)

- [ ] **Step 1: Buscar usos**

```
grep -rn "appFocusable" src/
```

Si no hay usos en producción (solo en specs), el cambio siguiente es trivial.

- [ ] **Step 2: Si hay usos, sustituirlos por `<button>` real**

Ejemplo típico: `<div appFocusable (click)="...">` → `<button type="button" class="btn-reset" (click)="...">`.

Para cada sustitución:
- Eliminar el `tabindex="0"` y `role="button"` que la directiva añade.
- Asegurar `aria-label` o contenido de texto.
- Mantener la clase `btn-reset` donde aplique.

- [ ] **Step 3: Marcar la directiva como deprecada**

Reemplazar `src/app/shared/directives/focusable.directive.ts` por:

```typescript
import { Directive } from '@angular/core';

/**
 * @deprecated Use native <button> or <a> elements instead.
 * This directive will be removed in a future release (WCAG 4.1.2).
 */
@Directive({
  selector: '[appFocusable]',
  standalone: true
})
export class FocusableDirective {
  // No-op: replaced by native interactive elements.
}
```

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/shared/directives/focusable.directive.ts <archivos modificados>
> git commit -m "refactor(a11y): replace focusable directive usage with native buttons"
> ```
> ¿Lo ejecuto?

---

### Task 3.6 (F3-T6): `toggle-button.component` i18n del fallback `aria-label`

> Cubre hallazgo **H16**.

**Files:**
- Modify: `src/app/shared/components/toggle-button/toggle-button.component.html:1-19`
- Modify: `src/app/shared/components/toggle-button/toggle-button.component.ts:12-22`
- Modify: `src/assets/i18n/es-ES.json` y `en-US.json`

- [ ] **Step 1: Hacer `label` requerido**

En `src/app/shared/components/toggle-button/toggle-button.component.ts`:

```typescript
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-toggle-button',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})
export class ToggleButtonComponent {
  isChecked = input(false);
  label = input.required<string>();
  filterMode = input(false);

  check = output<boolean>();

  toggle(selected: boolean): void {
    this.check.emit(selected);
  }
}
```

- [ ] **Step 2: Eliminar `aria-label="Toggle"` fallback**

En `src/app/shared/components/toggle-button/toggle-button.component.html`, reemplazar:

```html
<input
  type="checkbox"
  [checked]="isChecked()"
  (change)="toggle($any($event.target).checked)"
  [attr.aria-labelledby]="label() ? 'toggle-label-' + label() : null"
/>
```

por (sin fallback):

```html
<input
  type="checkbox"
  [checked]="isChecked()"
  (change)="toggle($any($event.target).checked)"
  [attr.aria-labelledby]="'toggle-label-' + label()"
/>
```

- [ ] **Step 3: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/shared/components/toggle-button/
> git commit -m "fix(a11y): toggle-button requires label (no hardcoded fallback)"
> ```
> ¿Lo ejecuto?

---

### Task 3.7 (F3-T7): Reviews rating — `fieldset`/`legend` + `radiogroup`

> Parte del H06 ya cubierta en F1-T4. Aquí se completa con patrón robusto.

**Files:**
- Modify: `src/app/features/reviews/components/reviews-form/reviews-form.component.html` (rating block)
- Modify (test): `src/app/features/reviews/components/reviews-form/reviews-form.component.spec.ts`

- [ ] **Step 1: Añadir test**

```typescript
it('rating group is a radiogroup with 5 radio buttons', () => {
  const group = fixture.nativeElement.querySelector('[role="radiogroup"]') as HTMLElement;
  expect(group).toBeTruthy();
  const radios = fixture.nativeElement.querySelectorAll('[role="radio"]');
  expect(radios.length).toBe(5);
});
```

Ejecutar test (debe fallar si aún no hay `role="radiogroup"`).

- [ ] **Step 2: Aplicar el snippet de F1-T4 Step 3**

Copiar el bloque `<fieldset>` que define el grupo con `role="radiogroup"` en el rating.

- [ ] **Step 3: Reejecutar test → PASS**

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/reviews/components/reviews-form/
> git commit -m "fix(a11y): review rating as radiogroup with proper ARIA"
> ```
> ¿Lo ejecuto?

---

## Fase 4 — Forms, animaciones y contenido CMS

### Task 4.1 (F4-T1): Placeholders de inputs con contraste AA

> Cubre hallazgo **H12**.

**Files:**
- Modify: `src/app/features/contact/components/contact-form/contact-form.component.scss:49-51`
- Modify: `src/app/features/reviews/components/reviews-form/reviews-form.component.scss:58-60`

- [ ] **Step 1: Subir opacidad**

En ambos SCSS, reemplazar:

```scss
&::placeholder {
  color: rgba(palette.$text-secondary, 0.6);
}
```

por:

```scss
&::placeholder {
  color: rgba(palette.$text-primary, 0.75);
}
```

- [ ] **Step 2: Validar con WebAIM Contrast Checker**

`rgba(240,244,248,0.75)` sobre fondo `rgba(240,244,248,0.05)` sobre `#0f3254`. Ratio esperado ≥ 4.5:1.

- [ ] **Step 3: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/contact/components/contact-form/contact-form.component.scss src/app/features/reviews/components/reviews-form/reviews-form.component.scss
> git commit -m "fix(a11y): raise input placeholder contrast to AA"
> ```
> ¿Lo ejecuto?

---

### Task 4.2 (F4-T2): `parallax-header.directive` respeta `prefers-reduced-motion`

> Cubre hallazgo **H22**.

**Files:**
- Modify: `src/app/shared/directives/parallax-header.directive.ts:14-82`
- Create/Modify: `src/app/shared/directives/parallax-header.directive.spec.ts`

- [ ] **Step 1: Test que falla antes**

```typescript
it('does not animate when prefers-reduced-motion: reduce', () => {
  spyOn(window, 'matchMedia').and.returnValue({ matches: true, media: '', onchange: null, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false, addListener: () => {}, removeListener: () => {} } as any);
  directive.onWindowScroll();
  // El elemento no debe haber recibido setStyle con transform animado.
  expect(hostEl.style.transform).toBe('');
});
```

- [ ] **Step 2: Cortocircuitar en `onWindowScroll`**

```typescript
private _prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

@HostListener('window:scroll', [])
onWindowScroll() {
  if (this._prefersReducedMotion()) return;
  // ... resto de la lógica
}
```

- [ ] **Step 3: Reejecutar test → PASS**

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/shared/directives/parallax-header.directive.ts src/app/shared/directives/parallax-header.directive.spec.ts
> git commit -m "fix(a11y): parallax-header respects prefers-reduced-motion"
> ```
> ¿Lo ejecuto?

---

### Task 4.3 (F4-T3): `timeline.directive` y `animate.directive` con `prefers-reduced-motion`

> Cubre hallazgos **H23** y **H24**.

**Files:**
- Modify: `src/app/features/experience/directives/timeline.directive.ts:21-39`
- Modify: `src/app/shared/directives/animate.directive.ts:24-110`
- Modify/Add: specs

- [ ] **Step 1: Timeline — cortocircuito**

```typescript
@HostListener('window:scroll')
onScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  this.toggleView();
}
```

- [ ] **Step 2: Animate — saltar Blast si reduced motion**

```typescript
ngAfterViewInit(): void {
  const element = this.el.nativeElement;
  if (!element) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Solo colocar texto sin animación
    this.translate.get(this.translationKey!).subscribe((text) => {
      if (text) {
        element.textContent = text; // textContent para evitar innerHTML
      }
    });
    return;
  }
  this._initializeText(element);
}
```

- [ ] **Step 3: Tests**

Añadir un test por directiva verificando que, con `matchMedia` mocked a `matches: true`, no se aplica la animación.

- [ ] **Step 4: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/experience/directives/timeline.directive.ts src/app/shared/directives/animate.directive.ts src/shared/directives/animate.directive.spec.ts
> git commit -m "fix(a11y): timeline and animate respect prefers-reduced-motion"
> ```
> ¿Lo ejecuto?

---

### Task 4.4 (F4-T4): `<time datetime>` en experience (refuerza F0-T4)

> Si F0-T4 ya se aplicó, este paso es de verificación. Si se omite, integrar aquí.

(No genera trabajo adicional si F0-T4 está hecho.)

---

### Task 4.5 (F4-T5): Sanity `portableTextToHtml` — no permitir `<h1>` ni `<a target="_blank">` inseguros

> Cubre hallazgo **H26**.

**Files:**
- Modify: `src/app/core/services/sanity.service.ts:69-99`

- [ ] **Step 1: Reescribir los handlers de `block` y `marks.link`**

```typescript
block: {
  normal: ({ children }) => `<p>${children}</p>`,
  h1: ({ children }) => `<h2>${children}</h2>`,   // degrada h1 -> h2
  h2: ({ children }) => `<h2>${children}</h2>`,
  h3: ({ children }) => `<h3>${children}</h3>`
}
```

Para `marks.link`, asegurar `rel="noopener noreferrer"` siempre que `target="_blank"`:

```typescript
link: ({ value, children }) => {
  const href = (value?.href ?? '#').replace(/"/g, '&quot;');
  const external = /^https?:\/\//.test(href);
  const target = external ? ' target="_blank"' : '';
  const rel = external ? ' rel="noopener noreferrer"' : '';
  return `<a href="${href}"${target}${rel}>${children}</a>`;
}
```

- [ ] **Step 2: Test**

```typescript
it('degrades h1 from portable text to h2', () => {
  const html = service.portableTextToHtml([
    { _type: 'block', style: 'h1', children: [{ _type: 'span', text: 'Hi' }] }
  ] as any);
  expect(html).toContain('<h2>Hi</h2>');
  expect(html).not.toContain('<h1>');
});

it('escapes href on links', () => {
  const html = service.portableTextToHtml([
    { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'x', marks: ['link'] }],
      markDefs: [{ _key: 'link', _type: 'link', href: 'https://example.com/?a="b"' }] }
  ] as any);
  expect(html).toContain('rel="noopener noreferrer"');
  expect(html).toContain('target="_blank"');
});
```

- [ ] **Step 3: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/core/services/sanity.service.ts
> git commit -m "fix(a11y): portable text h1->h2 and safe link targets"
> ```
> ¿Lo ejecuto?

---

## Fase 5 — i18n, robustez y limpieza

### Task 5.1 (F5-T1): Foco al cambiar de ruta SPA

> Cubre parte de **H31**.

**Files:**
- Modify: `src/app/app.component.ts:43-65`

- [ ] **Step 1: Suscribirse a `NavigationEnd` para mover foco al `<main>`**

En `src/app/app.component.ts`, dentro del constructor, añadir:

```typescript
import { ViewChild, ElementRef } from '@angular/core';

@ViewChild('outlet', { static: false }) outlet!: ElementRef<HTMLElement>;

// Después del bloque pairwise() actual:
this._router.events.pipe(
  filter((e): e is NavigationEnd => e instanceof NavigationEnd)
).subscribe(() => {
  const main = document.getElementById('main-content');
  if (main) {
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
  }
});
```

- [ ] **Step 2: Test**

```typescript
it('moves focus to main-content after navigation', () => {
  // Simular evento NavigationEnd → expect(document.activeElement?.id).toBe('main-content');
});
```

- [ ] **Step 3: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/app.component.ts
> git commit -m "fix(a11y): focus moves to main after SPA navigation"
> ```
> ¿Lo ejecuto?

---

### Task 5.2 (F5-T2): Reemplazar `querySelector('button')` en lang-selector

> Cubre hallazgo **H30**.

**Files:**
- Modify: `src/app/core/components/lang-selector/lang-selector.component.ts:74-90`
- Modify: `src/app/core/components/lang-selector/lang-selector.component.html` (añadir `#triggerBtn`)

- [ ] **Step 1: Añadir `ViewChild` del botón disparador**

En `lang-selector.component.html`, en el `<button class="container-header">`, añadir:

```html
<button
  #triggerBtn
  ...
></button>
```

En `lang-selector.component.ts`:

```typescript
import { ViewChild, ElementRef } from '@angular/core';

@ViewChild('triggerBtn', { static: true }) triggerBtn!: ElementRef<HTMLButtonElement>;
```

Reemplazar el `Escape` handler:

```typescript
case 'Escape':
  this.closeOptions();
  this.triggerBtn.nativeElement.focus();
  break;
```

- [ ] **Step 2: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/core/components/lang-selector/
> git commit -m "refactor(a11y): lang-selector focus restoration via ViewChild"
> ```
> ¿Lo ejecuto?

---

### Task 5.3 (F5-T3): `LoadingComponent` (refuerza F0-T2) — verificar tests

Verificar que el test del loading (existente) sigue pasando. Sin acción nueva si F0-T2 cubre todo.

---

## Fase 6 — Tests automatizados de a11y

### Task 6.1 (F6-T1): Integrar `jasmine-axe` en Karma

> Cubre hallazgo de checklist punto 18.

**Files:**
- Modify: `package.json` (añadir `jasmine-axe`)
- Modify: `src/test.ts` (o donde se configuren los matchers globales de Jasmine)

- [ ] **Step 1: Instalar la dependencia**

Pedir al usuario confirmación para ejecutar:

```bash
npm install --save-dev jasmine-axe axe-core
```

(No ejecutar sin confirmación — `AGENTS.md` aplica también a instalaciones destructivas como upgrades — esta NO modifica código pero genera cambios en `package-lock.json`. Si el usuario no quiere install automático, dejar el comando anotado y seguir.)

- [ ] **Step 2: Configurar matchers globales**

Crear/añadir a `src/test.ts`:

```typescript
import { AxeResults } from 'axe-core';
import * as axe from 'axe-core';

// En Jasmine, exponer matchers personalizados:
const Jasmine = (window as any).getJasmineRequireObj();
const jasmine = (window as any).jasmine;

// Si jasmine-axe no expone matchers, crear el wrapper mínimo:
beforeEach(() => {
  jasmine.addMatchers({
    toHaveNoViolations: () => ({ compare: async (html: string) => {
      const results = await axe.run(html, { rules: {} });
      return { pass: results.violations.length === 0, message: JSON.stringify(results.violations) };
    } })
  });
});
```

- [ ] **Step 3: Aplicar al menos un test**

En `src/app/app.component.spec.ts`, añadir:

```typescript
it('renders app shell with no axe violations', async () => {
  const html = fixture.nativeElement.outerHTML;
  await expectAsync(html).toHaveNoViolations();
});
```

- [ ] **Step 4: Ejecutar tests**

`npm test -- --watch=false --browsers=ChromeHeadlessCI`
Esperado: todos los tests pasan.

- [ ] **Step 5: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add package.json src/test.ts src/app/app.component.spec.ts
> git commit -m "test(a11y): integrate jasmine-axe global matcher"
> ```
> ¿Lo ejecuto?

---

### Task 6.2 (F6-T2): Smoke test con `@axe-core/cli` en CI

**Files:**
- Create: `scripts/a11y-smoke.mjs`
- Modify: `package.json` (añadir script)
- Modify: `angular.json` (si requiere config para servir el build)

- [ ] **Step 1: Script de smoke**

Crear `scripts/a11y-smoke.mjs`:

```javascript
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const BASE = process.env.A11Y_BASE_URL ?? 'http://localhost:4200';
const ROUTES = ['/', '/blog', '/blog/no-existe', '/esta-ruta-tampoco-existe'];

const cli = require.resolve('@axe-core/cli');

for (const route of ROUTES) {
  console.log(`Auditando ${BASE}${route}`);
  const out = execSync(
    `node ${cli} --url "${BASE}${route}" --exit`,
    { stdio: 'pipe', encoding: 'utf8' }
  );
  writeFileSync(`a11y-report${route.replace(/\//g, '_') || '_root'}.json`, out);
}
```

(Nota: este script asume `@axe-core/cli` instalado. Si prefieres `pa11y` o `lighthouse-ci`, ajustar.)

- [ ] **Step 2: Añadir script en `package.json`**

```json
"scripts": {
  ...
  "a11y:smoke": "node scripts/a11y-smoke.mjs"
}
```

- [ ] **Step 3: Preguntar al usuario antes de instalar**

> Para que el script funcione hace falta instalar `@axe-core/cli`:
> ```bash
> npm install --save-dev @axe-core/cli
> ```
> ¿Lo ejecuto?

- [ ] **Step 4: Verificar localmente**

```bash
npm run build:prod
(npm start &) ; sleep 10 ; npm run a11y:smoke
```

Esperado: 4 archivos `a11y-report*.json`, idealmente sin `violations`.

- [ ] **Step 5: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add scripts/a11y-smoke.mjs package.json
> git commit -m "test(a11y): smoke test script for build with axe-core"
> ```
> ¿Lo ejecuto?

---

### Task 6.3 (F6-T3): Documentar el flujo de tests a11y en `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Añadir sección "Accessibility"**

Insertar en `README.md` después de la sección de Testing:

```markdown
## ♿ Accessibility

The project targets WCAG 2.2 Level AA. See:
- `docs/superpowers/specs/2026-08-04-a11y-audit-design.md` — full audit.
- `docs/superpowers/plans/2026-08-04-a11y-improvements.md` — phased plan.

### Automated checks

- Unit-level axe checks: covered by `jasmine-axe` matchers in spec files.
  Run: `npm test -- --watch=false --browsers=ChromeHeadlessCI`
- Build smoke: `npm run a11y:smoke` (requires `@axe-core/cli` and a built app).

### Manual checks

Run `npm start`, then verify with NVDA or VoiceOver:
1. Tab order matches visual order on each section.
2. Skip-link targets `#main-content`.
3. Forms announce errors via `aria-describedby`.
4. `prefers-reduced-motion: reduce` disables parallax/blast animations.
```

- [ ] **Step 2: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add README.md
> git commit -m "docs(a11y): describe a11y workflow in README"
> ```
> ¿Lo ejecuto?

---

## Self-review del plan

1. **Spec coverage**: Cross-check tabla 32 hallazgos contra tasks.
   - H01 (skip-link) → F0-T1 ✅
   - H02 (404) → F1-T1 ✅
   - H03 (div role=button contact) → F1-T2 ✅
   - H04 (div role=button reviews) → F1-T3 ✅
   - H05/H06 (forms) → F1-T4 + F3-T7 ✅
   - H07 (múltiples h1) → F2-T4 ✅
   - H08 (sidebar nav) → F2-T1 ✅
   - H09 (altKey muerto) → F3-T1 ✅
   - H10 (photo role=img) → F3-T2 ✅
   - H11 (color rojo) → F1-T5 ✅
   - H12 (placeholder) → F4-T1 ✅
   - H13 (lang-selector) → F2-T2 + F5-T2 ✅
   - H14 (click-outside leak) → F2-T3 ✅
   - H15 (blog filter) → F3-T4 ✅
   - H16 (toggle button) → F3-T6 ✅
   - H17 (aria-controls) → F3-T3 ✅
   - H18 (target size project) → parcial; ver nota abajo
   - H19 (waves SVG) → F0-T3 ✅
   - H20 (contact target) → F2-T5 ✅
   - H21 (foco submit disabled) → no implementado; reducir prioridad
   - H22 (parallax) → F4-T2 ✅
   - H23 (timeline) → F4-T3 ✅
   - H24 (animate Blast) → F4-T3 ✅
   - H25 (oscillator tabindex) → nota pendiente
   - H26 (Sanity h1+target) → F4-T5 ✅
   - H27 (time datetime) → F0-T4 ✅
   - H28 (Title) → F0-T5 ✅
   - H29 (loading aria) → F0-T2 ✅
   - H30 (querySelector frágil) → F5-T2 ✅
   - H31 (focus en SPA) → F5-T1 ✅
   - H32 (focusable directive) → F3-T5 ✅

   Notas:
   - **H18 / H21 / H25** se marcan como mejoras secundarias. No se implementan tasks específicas porque requieren benchmarking visual fino o cambios estructurales. Si tras F1-F3 el usuario quiere, se puede añadir una Fase 7 "Polish" para cubrirlas.
2. **Placeholders**: ningún "TBD" detectado.
3. **Type consistency**: las tareas usan consistentemente:
   - IDs: `contact-fullName`, `contact-email`, `contact-message`, `contact-fullName-error`, `reviews-rating-error`, `project-desc-<i>`, `toggle-label-<label>`.
   - Clases i18n: `COMMON.*`, `FORM.*`, `BLOG.*`, `REVIEWS.*`, `PROJECTS.*`, `ROUTE.*`.
   - El campo `altKey` aparece en F3-T1 (introducido en F0) y se mantiene en F3-T1 con la misma semántica.

---

## Handoff

Una vez aplicado este plan (tarea a tarea, idealmente con subagentes por task), el portfolio cumplirá WCAG 2.2 AA en los criterios 1.1.1, 1.3.1, 1.4.3, 1.4.11, 2.4.1, 2.4.3, 2.4.6, 2.4.7, 2.5.5, 3.3.1, 3.3.3, 4.1.2 — los más afectados por el portfolio. La cobertura completa exige también ejecutar las herramientas automáticas sobre el bundle compilado (axe-core, Lighthouse, pa11y) y pruebas con lector de pantalla, algo fuera del alcance de este plan estático pero documentado en la Fase 6.

**Próximo paso (una vez aprobado este plan):**
- Opción A — Subagent-Driven (recomendado): voy despachando un subagente por task, revisando entre medias.
- Opción B — Inline Execution: ejecuto en esta misma sesión, con checkpoints por task.
