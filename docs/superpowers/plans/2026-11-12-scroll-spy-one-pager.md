# Scroll-spy one-pager (home → about → success-cases → reviews → contact) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir las 5 páginas de ruta (`/`, `/about-me`, `/success-cases`, `/reviews`, `/contact`) en una única página scrolleable con las secciones apiladas verticalmente, manteniendo las URLs actuales (deep links), el navbar como routerLinks y la animación slide solo para blog ↔ main.

**Architecture:** Feature nuevo `features/sections/` con un `sections-page.component` que renderiza los 5 componentes de sección apilados, cada uno envuelto en `<section id="...">` con `scroll-margin-top`. Las 5 rutas de sección apuntan al mismo componente con `data.section`. Un `RouteReuseStrategy` custom reutiliza la instancia del `sections-page` entre secciones (sin recargar la página). Un scroll-spy con `IntersectionObserver` actualiza la URL con `router.navigate(..., { replaceUrl: true })` al scrollear → `routerLinkActive` del navbar se activa automáticamente. El scroll a sección: suave en navegación del usuario, instantáneo en deep links y back/forward. `VIEW_TRANSITION_OPTIONS.skipNextTransition` evita el fade view-transition en navegaciones sección↔sección (DOM idéntico → chasquido). `scrollPositionRestoration: 'disabled'` + scroll manual.

**Tech Stack:** Angular 21 (standalone, signals, zoneless), SCSS con tokens de `_palette.scss`/`_fonts.scss`, ngx-translate, Karma+Jasmine (+jasmine-axe).

**⚠️ REGLA DEL REPO (AGENTS.md): PROHIBIDO ejecutar `git add`/`git commit`/`git push`.** Cada tarea termina dejando los cambios en disco; se muestra el comando de commit SOLO como referencia para el usuario, nunca se ejecuta.

---

## Decisions locked (del chat con el usuario)

1. **URLs por sección se mantienen** (`/#/about-me`, etc.) — navbar sigue siendo routerLinks; el spy actualiza la URL al scrollear.
2. **Scroll libre** — sin scroll-snap.
3. **Animación slide solo para blog ↔ main** — el spy no la dispara.

## File Structure

```
src/app/features/sections/                        (NUEVO)
  constants/sections.constants.ts                 (orden e ids de las secciones)
  components/sections-page/sections-page.component.{ts,html,scss,spec.ts}

src/app/app.routes.ts                             (MODIFICAR: 5 rutas → sections-page con data)
src/app/core/services/sections-nav.service.ts     (NUEVO: spy + marker de intención del usuario)
src/app/core/services/one-pager-reuse.strategy.ts (NUEVO: RouteReuseStrategy)
src/app/core/components/header/header.component.html (SIN CAMBIOS: routerLink + routerLinkActive siguen)
src/app/main.ts                                   (MODIFICAR: scrollPositionRestoration 'disabled')
src/app/app.component.ts                          (MODIFICAR: scrollTo top en destinos no one-pager)
src/styles/styles.scss                            (MODIFICAR: regla data-no-transition para el fade default)
src/assets/i18n/es-ES.json, en-US.json            (MODIFICAR: claves nuevas si hacen falta)
```

---

### Task 1: `sections-page.component` + constantes (esqueleto apilado)

**Files:**
- Create: `src/app/features/sections/constants/sections.constants.ts`
- Create: `src/app/features/sections/components/sections-page/sections-page.component.{ts,html,scss,spec.ts}`

- [ ] **Step 1 (RED):** Spec del sections-page — renderiza las 5 secciones en orden con `id` correctos (`home`, `about-me`, `success-cases`, `reviews`, `contact`).

```ts
// spec: queryAll('.sections-page__section') → 5 elementos
// ids en orden: ['home', 'about-me', 'success-cases', 'reviews', 'contact']
```

Run: `ng test --watch=false --include=sections-page.component.spec` → FAIL (componente no existe).

- [ ] **Step 2 (GREEN):** Implementar componente + constantes.

```ts
// sections.constants.ts
export const SECTIONS = [
  { id: 'home',           path: '' },
  { id: 'about-me',       path: 'about-me' },
  { id: 'success-cases',  path: 'success-cases' },
  { id: 'reviews',        path: 'reviews' },
  { id: 'contact',        path: 'contact' },
] as const;
export type SectionId = (typeof SECTIONS)[number]['id'];
```

Template apila `<section class="sections-page__section" [id]="...">` con el componente de cada sección dentro. SCSS: `display: block`, cada `.sections-page__section` con `scroll-margin-top` para el header fijo; `padding-bottom` solo en la última (footer fijo).

- [ ] **Step 3:** Run spec → PASS.

---

### Task 2: Rutas → sections-page con `data.section` + `data.onePager`

**Files:**
- Modify: `src/app/app.routes.ts`

- [ ] **Step 1 (RED):** Spec que navega a `/about-me` y comprueba que se renderiza `app-sections-page` (no `app-about` directo) y que el router-outlet tiene el componente sections-page.

- [ ] **Step 2 (GREEN):** Reescribir `app.routes.ts`: las 5 rutas de sección → `loadComponent` de sections-page, con `data: { section: '<id>', onePager: true, animation: 'Home', titleKey: <el que ya tenían> }`. Blog y 404 intactos.

- [ ] **Step 3:** Run specs → PASS (rutas + specs existentes del header siguen pasando con routerLinkActive).

---

### Task 3: `OnePagerReuseStrategy` (reutilizar instancia entre secciones)

**Files:**
- Create: `src/app/core/services/one-pager-reuse.strategy.ts`
- Modify: `src/main.ts` (provider de `RouteReuseStrategy`)

- [ ] **Step 1 (RED):** Spec de la estrategia: `shouldReuseRoute` → true cuando `future.data['onePager'] && curr.data['onePager']`; false cuando uno de los dos es blog/404; comportamiento base intacto en el resto.

- [ ] **Step 2 (GREEN):** Implementar `extends BaseRouteReuseStrategy`, override de `shouldReuseRoute`. Provider en `main.ts` vía `{ provide: RouteReuseStrategy, useClass: OnePagerReuseStrategy }`.

- [ ] **Step 3:** Run spec → PASS.

---

### Task 4: `SectionsNavService` — scroll-spy + navegación sin transición

**Files:**
- Create: `src/app/core/services/sections-nav.service.ts` + spec
- Modify: `src/app/features/sections/components/sections-page/sections-page.component.ts` (wire del spy)

- [ ] **Step 1 (RED):** Spec del servicio:
  - `activeSection` signal inicial = sección de la URL actual.
  - `updateActive(id)` → si cambia, `router.navigate([path], { replaceUrl: true })` con `VIEW_TRANSITION_OPTIONS.skipNextTransition = true` antes de navegar.
  - `scrollTo(id, behavior)` → `scrollIntoView` + foco accesible en la sección (`tabindex="-1"`, `focus({ preventScroll: true })`).
  - `wasSpyNavigation()` → true tras `updateActive`, false tras consumo (el sections-page lo consume en NavigationEnd para NO hacer scroll).

- [ ] **Step 2 (GREEN):** Implementar el servicio (signals + Router + VIEW_TRANSITION_OPTIONS injectados).

- [ ] **Step 3:** Run spec → PASS.

---

### Task 5: Scroll-spy en el sections-page (IntersectionObserver)

**Files:**
- Modify: `sections-page.component.ts` + spec

- [ ] **Step 1 (RED):** Spec: al activarse la intersección de la sección contact, el servicio recibe `updateActive('contact')`; al destruirse el componente, el observer se desconecta.

- [ ] **Step 2 (GREEN):** En el componente: `IntersectionObserver` (umbral ~40% de la sección visible) sobre las 5 `<section>`s → `service.updateActive(id)`. `afterNextRender` para el arranque (SSR-safe). Cleanup en `ngOnDestroy`.

- [ ] **Step 3:** Run spec → PASS.

---

### Task 6: Scroll a sección + scrollPositionRestoration 'disabled' + scroll top en no-one-pager

**Files:**
- Modify: `sections-page.component.ts` + spec (reacción a NavigationEnd)
- Modify: `src/main.ts` (`withInMemoryScrolling({ scrollPositionRestoration: 'disabled' })`)
- Modify: `src/app/app.component.ts` (NavigationEnd → si el destino no es one-pager → `window.scrollTo({ top: 0, behavior: 'instant' })`)

- [ ] **Step 1 (RED):** Spec del sections-page:
  - NavigationEnd de navegación del usuario (no spy) → `scrollTo(section, 'smooth')` invocado.
  - NavigationEnd tras spy → NO scroll.
  - Primera activación (deep link `/#/about-me`) → scroll instantáneo ('auto').

- [ ] **Step 2 (GREEN):** Implementar. En `main.ts` cambiar `'top'` → `'disabled'`. En AppComponent, en NavigationEnd, si `router.url` no es una ruta one-pager → scroll a top (para blog/404, compensar el 'disabled').

- [ ] **Step 3:** Run specs → PASS.

---

### Task 7: View transitions solo blog ↔ main + estilos

**Files:**
- Modify: `src/styles/styles.scss` (regla `:root[data-no-transition]` → `animation: none` en old/new)
- Verify: `routeIndex()` de AppComponent ya trata las rutas de sección como índice 0 → slide solo blog ↔ main (no tocar si ya es así).

- [ ] **Step 1:** Verificar `routeIndex`: `/{'/': 0, '/blog': 1}` → `/about-me` etc. devuelven 0 → dir null → sin slide. OK, no tocar.
- [ ] **Step 2:** Añadir en `styles.scss` la regla de anulación del fade default cuando `data-no-transition` está en `<html>` (el servicio lo gestiona en navegaciones spy, evitando el chasquido del fade con DOM idéntico).
- [ ] **Step 3:** Run specs + `ng build` → PASS.

---

### Task 8: Suite completa + build + lint

- [ ] **Step 1:** `ng test --watch=false` (suite completa) → PASS.
- [ ] **Step 2:** `ng lint` → PASS (o advertencias preexistentes documentadas en el ledger).
- [ ] **Step 3:** `ng build` → PASS.

**Comando de commit SOLO como referencia (el usuario ejecuta):**

```bash
git add -A && git commit -m "feat: one-pager scroll con scroll-spy (home/about/cases/reviews/contact)"
```
