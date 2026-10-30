# Blog Article Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la vista de artículo inline de `/blog/:slug` por el componente `app-blog-article` con el diseño de la tarjeta azure (título grande, fecha, figura con glow, cuerpo estilizado con numeración automática, botón "Me resultó útil" persistido en Sanity, share LinkedIn, tarjeta de autor y navegación anterior/siguiente).

**Architecture:** Componente standalone nuevo `app-blog-article` con inputs `post/previous/next/currentLocale`; `blog.component` delega y resuelve vecinos del array de posts ordenado desc por `publishedAt`. El contador útil persiste en Sanity mediante una función Netlify (`useful.ts`, patrón `reviews.ts`) que hace patch `inc` con write token; el front aplica UI optimista con guard localStorage.

**Tech Stack:** Angular 21 standalone + signals + Karma/Jasmine, `@ngx-translate`, Sanity GROQ read-only en cliente, Netlify Functions (esbuild, Node 22, sin deps nuevas — `fetch` nativo).

**Spec:** `docs/superpowers/specs/2026-10-19-blog-article-redesign-design.md`

## Global Constraints

- Colores SOLO de `_palette.scss` vía `palette.$token` y derivadas `rgba(palette.$token, α)`; única excepción permitida `rgba(0,0,0,α)` en sombras. Mapeo del spec: `#FFA726`→`$accent-yellow`, `#8ED4C2`→`$green-soft`, `#29B6F6`→`$accent-blue`, `#2ECC71`→`$accent-green`, `#F0F4F8`→`$text-primary`, `#A0BBD8`→`$text-secondary`, `#081A2C`→`$surface-pill`, `rgba(0,28,55,α)`→`rgba($surface-blog-mid,α)`, `rgba(5,43,77,α)`→`rgba($surface-action,α)`, `rgba(0,33,62,α)`→`rgba($surface-card,α)`, `rgba(17,95,81,α)`→`rgba($background-gradient-end,α)`.
- Tipografía SOLO `fonts.$heading` (Space Grotesk), `fonts.$body` (Inter), `fonts.$mono` (sistema). Sin `@font-face` nuevos. Inter solo tiene 400/700: usar 700 donde el mock pedía 600/800.
- `::ng-deep` solo para estilos del HTML de `[innerHTML]` (excepción ya documentada en el repo); prohibido para DOM de componentes propios o de otros componentes.
- NUNCA ejecutar `git add/commit/push/tag` ni crear branches/PRs (regla AGENTS.md): dejar cambios en disco y reportar el comando de commit sugerido.
- Todo texto visible por i18n (`src/assets/i18n/es-ES.json` y `en-US.json`); nada hardcodeado. Español ES default, EN traducción fiel.
- Tests: Karma/Jasmine. Correr la suite completa una vez al final de la tarea, no en cada iteración. `npm run test:ci` usa `--watch=false --browsers=ChromeHeadlessCI`.
- Netlify functions: sin dependencias nuevas; patrón `netlify/functions/reviews.ts` (CORS allowedOrigins, OPTIONS, 405, 403 por origen, 500 con config faltante).
- Encapsulación SCSS: cada componente dueño de su DOM; custom properties para tematización puntual.

## Review Focus

1. Doble clic en "útil": el guard localStorage síncrono debe impedir un segundo POST (test en 4b).
2. Fallo de red al marcar útil: contador revertido y `aria-pressed` de vuelta a false (test en 4b).
3. Post antiguo sin `usefulCount` en Sanity: `coalesce(usefulCount, 0)` en GROQ + `?? 0` en mapping (test en Task 1).
4. Extremos de la lista: primer post sin `next`, último sin `previous`, tarjetas ocultas — no enlaces muertos (test en 4c/5).
5. URL de share con hash routing: `window.location.href` incluye `#/blog/<slug>` codificado (test en 4b).

---

### Task 1: `usefulCount` en modelos + GROQ

**Files:**
- Modify: `src/app/features/blog/models/post.model.ts` (+ `usefulCount: number`)
- Modify: `src/app/features/blog/models/processed-post.model.ts` (+ `usefulCount: number`)
- Modify: `src/app/core/services/sanity.service.ts` (proyección GROQ de `loadPosts()` y mapping raw→`Post`)
- Modify: `src/app/features/blog/components/blog.component.ts` (UNA línea en `_processPost`: passthrough `usefulCount: article.usefulCount` — sin ella `ProcessedPost` requerido no compila)

**Interfaces:**
- Produces: `Post.usefulCount: number` y `ProcessedPost.usefulCount: number` (Task 2/4/5 los consumen).

- [ ] **Step 1: test rojo** — en `sanity.service.spec.ts`, dentro del describe `#loadPosts method`: mock con post **sin** `usefulCount` → esperar `service.posts()[0].usefulCount` sea `0`; y con `usefulCount: 148` → esperar `148`.
- [ ] **Step 2: verificar fallo** (no compila o aserción falla).
- [ ] **Step 3: implementar** — GROQ añade a la proyección `"usefulCount": coalesce(usefulCount, 0)`; mapping añade `usefulCount: raw.usefulCount ?? 0`; en `blog.component.ts` `_processPost` añadir `usefulCount: article.usefulCount` al literal de retorno.
- [ ] **Step 4: test verde** — suite completa `npm run test:ci` → PASS (el resto de specs no debe romperse).
- [ ] **Step 5:** NO commitear. Sugerir: `git add -A && git commit -m "feat(blog): expose usefulCount in post models and GROQ projection"`

### Task 2: `useful.service.ts` + endpoint

**Files:**
- Create: `src/app/features/blog/services/useful.service.ts`, `src/app/features/blog/services/useful.service.spec.ts`
- Modify: `src/environments/environment.ts` (+ `usefulEndpoint: 'http://localhost:8888/.netlify/functions/useful'`), `src/environments/environment.prod.ts` (+ `usefulEndpoint: 'https://nomacoda.com/.netlify/functions/useful'`)

**Interfaces:**
- Consumes: nada de Task 1.
- Produces: `UsefulService.markUseful(postId: string): Observable<number>` — POST JSON `{ postId }` a `environment.usefulEndpoint`; response `{ success: boolean; count: number }` → emite `count`.

- [ ] **Step 1: test rojo** (patrón de `features/contact/services/contact.service.spec.ts` con `provideHttpClientTesting`): emite `count` de `{success:true,count:7}`; POST al endpoint con body `{postId:'post.abc'}` y header `Content-Type: application/json`.
- [ ] **Step 2: verificar fallo.**
- [ ] **Step 3: implementar** espejo de `ReviewsService` (HttpClient inyectado, HttpHeaders JSON, `@Injectable()`).
- [ ] **Step 4: suite verde** (`npm run test:ci`).
- [ ] **Step 5:** NO commitear. Sugerir: `git add -A && git commit -m "feat(blog): add useful service and endpoint config"`

### Task 3: función Netlify `useful.ts`

**Files:**
- Create: `netlify/functions/useful.ts`

**Interfaces:**
- Consumes: variables de entorno `SANITY_WRITE_TOKEN`, `SANITY_DATASET` (obligatorias, 500 si faltan); projectId fijo `'a5eryyb2'` (ya público en el bundle).
- Produces: endpoint `POST /.netlify/functions/useful` — body `{ postId }`; valida `/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/` y que no empiece por `drafts.` (400 si falla); mutación:

```
POST https://a5eryyb2.api.sanity.io/v2025-05-11/data/mutate/${dataset}?returnDocuments=true
Headers: Content-Type: application/json, Authorization: Bearer ${SANITY_WRITE_TOKEN}
Body: { "mutations": [{ "patch": { "id": postId, "inc": { "usefulCount": 1 } } }] }
Respuesta Sanity → { success: true, count: results[0].document.usefulCount }
```

- [ ] **Step 1: implementar** copiando el esqueleto de `reviews.ts` (mismos allowedOrigins, OPTIONS, 405, 403, estructura try/catch y logs) y sustituyendo el reenvío N8N por el `fetch` a Sanity descrito arriba. Sin deps nuevas.
- [ ] **Step 2: verificación manual** — `npm run functions` con `.env` local ampliada (`SANITY_DATASET=development`, `SANITY_WRITE_TOKEN=<token de write>`): curl válido → 200 `{success:true,count:N}`; id inválido → 400; sin origin permitido → 403. Reportar evidencia.
- [ ] **Step 3:** NO commitear. Sugerir: `git add -A && git commit -m "feat(netlify): add useful-count mutation function"`

### Task 4a: `app-blog-article` — cabecera, título, figura y cuerpo

**Files:**
- Create: `src/app/features/blog/components/blog-article/blog-article.component.ts|html|scss`, `blog-article.component.spec.ts`

**Interfaces:**
- Consumes: `ProcessedPost` (con `usefulCount` de Task 1).
- Produces: componente standalone `app-blog-article` con `post = input.required<ProcessedPost>()` y `currentLocale = input.required<string>()` (los inputs `previous`/`next` los añade 4c). Imports: `CommonModule, RouterModule, TranslateModule`.

- [ ] **Step 1: test rojo** — fixture con inputs seteados vía `fixture.componentRef.setInput`: renderiza `<h1 class="article__title">` con `post.title`; fecha `post.publishedAt | date:'longDate':"":currentLocale` en `.article__header__date`; `<img class="article__image">` `[src]="post.imageUrl"` `[alt]="post.title"`; `[innerHTML]="post.body"` en `.article__body`. El back-link conserva `BLOG.BACK_TO_BLOG_ARIA`.
- [ ] **Step 2: verificar fallo.**
- [ ] **Step 3: template** — tarjeta exterior (bg `rgba(palette.$surface-card,0.75)`, `backdrop-filter: blur(12px)`, radius `2rem`, padding `2.5rem 2.5rem 4rem`, sombra `0 25px 50px -12px rgba(0,0,0,0.25)`): header (back-link patrón actual con `assets/images/icons/back_arrow.avif` + fecha derecha en `fonts.$mono` itálica `$text-secondary`); h1 centrado `fonts.$heading` 700 `clamp(2rem, 1.2rem + 2.5vw, 2.75rem)` `$accent-yellow`; figura en tarjeta `rgba(palette.$surface-blog-mid,0.9)` radius 2rem overflow hidden con glow decorativo `aria-hidden` (`rgba(palette.$green-soft,0.10)`, blur 32px) e imagen interior `aspect-ratio: 672/366; object-fit: cover; border-radius: 1rem` sobre fondo `palette.$surface-pill`; `[innerHTML]` del cuerpo.
- [ ] **Step 4: SCSS del cuerpo** — excepción documentada `::ng-deep` SOLO bajo `.article__body` (innerHTML): `counter-reset: article-section`; `h2` mono uppercase `$green-soft` con `::before` `{ counter-increment: article-section; content: "0" counter(article-section) " //"; color: $accent-yellow; }`; `h3` `fonts.$heading` 700 `$text-primary` 1.25rem; `p` `fonts.$body` `$text-secondary` line-height 1.625 margen inferior; `strong` 700 `$text-primary`; `figure`/`img` radius 1rem max-width 100%; `a` `$accent-blue` subrayado. Responsive 980px (padding 1.5rem) y 520px (padding 1.25rem, glow oculto).
- [ ] **Step 5: suite verde** (`npm run test:ci`).
- [ ] **Step 6:** NO commitear. Sugerir: `git add -A && git commit -m "feat(blog): article view base (header, title, figure, styled body)"`

### Task 4b: barra de acciones — útil + LinkedIn

**Files:**
- Modify: `blog-article.component.ts|html|scss`, `blog-article.component.spec.ts`
- Consumes: `UsefulService` (Task 2), claves i18n nuevas.

**Interfaces:**
- Produces: estado del componente `usefulCount = signal<number>` (init `post().usefulCount`), `marked = signal<boolean>` (init `!!localStorage.getItem('blog.useful.' + post().id)`), `linkedinShareUrl = computed(() => 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href))`.

- [ ] **Step 1: test rojo** — con `UsefulService` espiado: click en `.article__useful` → POST recibido, `aria-pressed="true"`, contador pasa de `post().usefulCount` a `+1` y al `count` devuelto; segundo click NO vuelve a llamar al service (guard localStorage); service error (rxjs `throwError`) → contador revertido y `aria-pressed="false"`; `.article__share-linkedin` `<a>` con `[href]` conteniendo `encodeURIComponent(window.location.href)`, `target="_blank"`, `rel="noopener noreferrer"`, `aria-label` traducida.
- [ ] **Step 2: verificar fallo.**
- [ ] **Step 3: template/SCSS** — barra full-width (bg `rgba(palette.$surface-blog-mid,0.8)`, blur 6px, radius 999px, padding 1rem, flex wrap, gap). Botón `<button type="button" [attr.aria-pressed]="marked()" [attr.aria-label]>`: pill `rgba(palette.$background-gradient-end,0.4)` radius 999px, icono SVG inline `aria-hidden` (check/pulgar), texto `BLOG.ARTICLE.USEFUL` en `$green-soft` (`fonts.$body`), badge contador (bg `palette.$surface-pill`, texto `$accent-blue` `fonts.$mono` 700). Al marcar: pill con estado marcado (borde `$accent-green`). Share: `BLOG.ARTICLE.SHARE` en `rgba(palette.$text-secondary,0.8)` mono + ancla LinkedIn con SVG inline.
- [ ] **Step 4: i18n** — `BLOG.ARTICLE.USEFUL` = "ME RESULTÓ ÚTIL" / "I FOUND THIS USEFUL"; `USEFUL_ARIA` = "Marcar este artículo como útil" / "Mark this article as useful"; `SHARE` = "Compartir:" / "Share:"; `SHARE_LINKEDIN_ARIA` = "Compartir en LinkedIn" / "Share on LinkedIn".
- [ ] **Step 5: suite verde** (`npm run test:ci`).
- [ ] **Step 6:** NO commitear. Sugerir: `git add -A && git commit -m "feat(blog): useful button with Sanity counter + LinkedIn share"`

### Task 4c: tarjeta de autor + navegación anterior/siguiente

**Files:**
- Modify: `blog-article.component.ts|html|scss`, `blog-article.component.spec.ts`
- Consumes: inputs propios nuevos.

**Interfaces:**
- Produces: `previous = input<ProcessedPost | null>(null)`, `next = input<ProcessedPost | null>(null)`.

- [ ] **Step 1: test rojo** — sin `previous`/`next`: no hay `<nav>` con enlaces; con valores: dos enlaces `routerLink="/blog/{slug}"` con título, label (`BLOG.ARTICLE.PREV` verde / `BLOG.ARTICLE.NEXT` naranja) y fecha `date:'d MMM y'` (siguiente alineado a la derecha); tarjeta autor: `.article__author` con avatar (`src="assets/images/nomacoda/author.avif"`), dot de estado, nombre, badge rol, bio y CTA `routerLink="/contact"`.
- [ ] **Step 2: verificar fallo.**
- [ ] **Step 3: template/SCSS** — `<nav [attr.aria-label]="'BLOG.ARTICLE.NAV_ARIA' | translate">` con dos `<a>` (bg `rgba(palette.$surface-blog-mid,0.7)`, radius 2rem, padding 1.5rem; anterior: flecha SVG + label `$green-soft`; siguiente: label `$accent-yellow` + flecha, contenido alineado derecha; fechas mono en `rgba(palette.$text-secondary,0.7)`; hover: borde `$azure-border`). Autor: card `rgba(palette.$surface-action,0.4)` radius 2rem padding 1.5rem; avatar 4rem en `$surface-pill` con dot `$accent-green` 1rem en esquina (borde `$surface-blog-mid`); badge rol `rgba(palette.$background-gradient-end,0.3)` texto `$green-soft` mono; bio `fonts.$body` `$text-secondary`; CTA `$accent-blue` con flecha SVG.
- [ ] **Step 4: i18n** — `PREV` = "Artículo Anterior" / "Previous Article"; `NEXT` = "Siguiente Artículo" / "Next Article"; `PUBLISHED_ON` = "Publicado: {{date}}" / "Published: {{date}}"; `AUTHOR_NAME` = "Nomacoda // Diego"; `AUTHOR_ROLE` = "DEV.LEAD & ARCHITECT"; `AUTHOR_BIO` = "Desarrollador Frontend & Automatizaciones con propósito social. Explorando intersecciones entre código de alta montaña, diseño sereno e impacto biosanitario." / "Frontend Developer & Automations with social purpose. Exploring intersections between high-altitude code, serene design and healthcare impact."; `AUTHOR_CTA` = "Conectar & Colaborar" / "Connect & Collaborate"; `AUTHOR_CTA_ARIA` = "Ir a la página de contacto" / "Go to the contact page"; `AUTHOR_PHOTO_ALT` = "Foto de Diego (Nomacoda)" / "Photo of Diego (Nomacoda)"; `NAV_ARIA` = "Navegación entre artículos" / "Article navigation".
- [ ] **Step 5: suite verde** (`npm run test:ci`).
- [ ] **Step 6:** NO commitear. Sugerir: `git add -A && git commit -m "feat(blog): author card and prev/next navigation"`

### Task 5: conexión en `blog.component`

**Files:**
- Modify: `src/app/features/blog/models/blog-view-model.model.ts` (+ `previousPost: ProcessedPost | null`, `nextPost: ProcessedPost | null`)
- Modify: `src/app/features/blog/components/blog.component.ts` (computed `adjacentPosts`; vm; `_processPost` hero → `.width(1200).height(655)`; import del componente nuevo)
- Modify: `src/app/features/blog/components/blog.component.html` (bloque líneas 68–103 → `<app-blog-article ... />`; borrar comentario "pendiente de rediseño"; not-found intacto)
- Modify: `src/app/features/blog/components/blog.component.scss` (eliminar estilos que solo servían a la vista inline; conservar los de not-found)
- Modify: `src/app/features/blog/components/blog.component.spec.ts`

**Interfaces:**
- Consumes: `app-blog-article` (Task 4a–c), `ProcessedPost.usefulCount` (Task 1).
- Produces: `BlogViewModel.previousPost/nextPost`.

- [ ] **Step 1: test rojo** — en `blog.component.spec.ts`: mock `paramMap` con slug `'post-1'` (mockPosts: post-2 más nuevo que post-1, post-3 más viejo) → se renderiza `app-blog-article` con `post` slug post-1, `next` slug post-2, `previous` slug post-3; con slug del más nuevo → `next` null; con el más viejo → `previous` null.
- [ ] **Step 2: verificar fallo.**
- [ ] **Step 3: implementar** — `adjacentPosts = computed(() => { const arr = this.processedArticles(); const i = arr.findIndex(a => a.slug === this._currentSlug()); return { previous: i >= 0 && i < arr.length - 1 ? arr[i + 1] : null, next: i > 0 ? arr[i - 1] : null }; })`; extender `vm()`; swap de template; import; hero 1200×655; limpieza SCSS (conservar `.blog-post--not-found`).
- [ ] **Step 4: suite verde** (`npm run test:ci`).
- [ ] **Step 5:** NO commitear. Sugerir: `git add -A && git commit -m "refactor(blog): delegate article view to blog-article component"`

### Task 6: verificación final

- [ ] **Step 1:** `npm run lint` → 0 errores.
- [ ] **Step 2:** `npm run test:ci` → suite verde completa.
- [ ] **Step 3:** `npm run build` → compila.
- [ ] **Step 4:** `npm run dev` + Chrome DevTools MCP sobre `/#/blog/<slug>` real: visual desktop y 375px; click útil contra dataset development (verifica 200 y contador); share abre LinkedIn con URL correcta; prev/next navegan y cargan su artículo.
- [ ] **Step 5:** `npm run a11y:smoke` (si cubre rutas de blog) o axe manual en la página del artículo; contraste y focus visible en botón útil, share, nav.
- [ ] **Step 6:** NO commitear. Sugerir: `git add -A && git commit -m "feat(blog): article page redesign (useful, share, author, prev/next)"`
