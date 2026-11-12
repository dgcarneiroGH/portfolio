# Correcciones WCAG 2.1/2.2 AA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar las 14 brechas detectadas en la auditoría WCAG (2026-11-12, skill `accesibilidad-web-wcag`) sobre el one-pager + blog + 404, sin cambios visuales salvo los imprescindibles para contraste.

**Architecture:** Correcciones quirúrgicas por componente: (1) saltos/estructura de documento (skip link, h1 duplicado, landmark anidado, título de sección), (2) patrones ARIA/APG (modal con trampa de foco, radiogroup de estrellas, listbox de idiomas, nombres accesibles), (3) robustez en componentes compartidos y formularios. Cada task es independiente y termina con su ciclo de test Karma/Jasmine en verde.

**Tech Stack:** Angular 21 (standalone, signals, control-flow `@if/@for`), SCSS con tokens de `src/styles/_palette.scss`, ngx-translate 16, Karma + Jasmine (`provideZonelessChangeDetection`, jasmine-axe), scripts npm (`a11y:smoke`, `lh:check`).

**Spec:** Auditoría del 2026-11-12 (incluida en §Hallazgos de este documento) + [`docs/a11y-backlog.md`](../../a11y-backlog.md). El plan es autocontenido: el executor no necesita la conversación original.

## Hallazgos de la auditoría (especificación)

| # | Severidad | Hallazgo | Criterio WCAG | Task |
|---|---|---|---|---|
| 1 | Crítico | Skip link declarado (CSS `.skip-link`, claves i18n `SKIP_TO_MAIN`) pero **no renderizado**; el spec lo "testea" con `overrideTemplate` que lo inyecta, por lo que el test pasa sin existir en producción | 2.4.1 (A) | T1 |
| 2 | Crítico | Modal `success-case-detail`: sin trampa de foco (Tab escapa) y sin retorno de foco al trigger al cerrar | 2.4.3 + APG dialog | T2 |
| 3 | Crítico | Dos `<h1>` en el one-pager (`home-title` y `intro-title` de contact) | 1.3.1 | T3 |
| 4 | Crítico | `success-cases` section `aria-labelledby="success-cases-title"` apunta a un id inexistente; además `h3` sr-only salta desde h1 sin `h2` padre | 1.3.1 / 4.1.2 | T4 |
| 5 | Crítico | `not-found-404` renderiza `<main role="main">` anidado dentro del `<main id="main-content">` del shell | 1.3.1 | T5 |
| 6 | Alto | Radiogroup de estrellas sin flechas ni roving tabindex (5 `role="radio"` navegables solo con Tab) | 4.1.2 + APG radio | T6 |
| 7 | Alto | Listbox del lang-selector: todas las opciones con `tabindex=0` al abrir; `.hidden` usa solo `opacity` | 4.1.2 | T7 |
| 8 | Medio | CTA de `post-card`: `aria-label="Leer el artículo completo"` idéntico en todas las tarjetas (sin título) | 4.1.2 / 2.4.4 | T8 |
| 9 | Medio | 2.5.3 Label in Name: brand visible "NOMACODA" vs `aria-label="Ir al inicio"` | 2.5.3 (A) | T9 |
| 10 | Medio | 2.5.3: botón visible "+ info" vs `aria-label="Más información de X"` | 2.5.3 (A) | T10 |
| 11 | Medio | `toggle-button`: `id`/`aria-labelledby` derivados del texto del label (ids inválidos/duplicados posibles) | 4.1.2 | T11 |
| 12 | Medio | `app-button`: keydown manual de Enter/Space sobre `<button>` nativo (riesgo de doble activación) | robustez | T12 |
| 13 | Bajo | `photo` acepta `caption` pero nunca renderiza `<figcaption>` | contenido | T13 |
| 14 | Medio | Submit deshabilitado con form inválido sin feedback; sin resumen de errores al inicio del formulario | 3.3.1/3.3.2 | T14 |
| 15 | Medio | 3 pares de color por verificar en runtime (ver Task 15) | 1.4.3 | T15 |

Verificado ✓ en la auditoría (no tocar): `lang` dinámico (3.1.1), foco tras navegación SPA (2.4.3), `:focus-visible` global, `prefers-reduced-motion`/`prefers-contrast`, formularios con label/for + autocomplete + aria-invalid + aria-describedby, SVG decorativos `aria-hidden`, sidebar cerrado con `visibility:hidden`, `role="img"` de code-window/rating, cero hex hardcodeados en componentes.

## Global Constraints

- **PROHIBIDO ejecutar `git add` / `git commit` / `git push` / `git tag` / creación de PRs** (AGENTS.md 2026-08-06). Cada task deja los cambios en disco y termina mostrando el comando de commit sugerido **como referencia**, sin ejecutarlo. El usuario comitea manualmente.
- **Tokens de diseño** (AGENTS.md 2026-10-08): cualquier color nuevo va a `src/styles/_palette.scss` con nombre semántico; en componentes solo `palette.$token` / `rgba(palette.$token, α)` y `fonts.$body|$heading|$mono`. Prohibido hex/rgba hardcodeados en SCSS de componentes.
- **Encapsulación** (AGENTS.md 2026-10-08): prohibido `::ng-deep`; los estilos de un componente viven en su propio SCSS. `.sr-only` es utilidad global (`styles.scss:33`) y puede usarse desde templates.
- **Tests:** Karma/Jasmine zoneless. Suite completa: `npm run test:ci`. Spec aislado (para ciclos rápidos): `npx ng test --watch=false --browsers=ChromeHeadlessCI --include=src/<ruta>/<archivo>.spec.ts`. Si `--include` no es soportado por el builder, usar `npm run test:ci` completo.
- **Linter:** `npm run lint` debe quedar limpio.
- Los eventos sintéticos `KeyboardEvent` en tests **no** disparan el comportamiento nativo (p. ej. tabulación): los tests de teclado llaman al handler del componente directamente y verifican `focus()`/`preventDefault`, no el foco resultante del navegador.
- Convención del repo (ruling de blog-article): el nombre accesible **deriva del texto visible**; un `aria-label` que lo sustituye solo se acepta cuando el texto visible es insuficiente por diseño (icon-only) y **debe contener** el label visible (2.5.3).

## Review Focus

1. **Trigger desconectado al restaurar foco** (navegación durante modal abierto): sin guard `isConnected`, `focus()` sobre un nodo huérfano es no-op silencioso y el foco se pierde en `<body>`. → cubierto en T2 (test con botón huérfano).
2. **Orden ngOnInit vs effect en `success-case-detail`**: `ngOnInit` debe capturar `document.activeElement` **antes** de que el `effect()` (que usa `viewChild.required`) mueva el foco al panel. → cubierto en T2 (test de retorno de foco).
3. **Duplicidad de ids en `toggle-button`** al instanciar 2+ veces con el mismo label → cubierto en T11 (test de ids únicos).
4. **`.hidden` del lang-selector**: `visibility:hidden` debe aplicar **tras** el fade (delay ≥ duración de la transición de opacity) para no cortar la animación → T7 fija `visibility 0s linear 0.3s`.
5. **Radio por flechas con selección al mover**: el foco y la selección deben avanzar juntos (patrón APG radio), sin wrap roto en los extremos → cubierto en T6 (tests Home/End/wrap).

---

## File Structure

```
src/app/
  app.component.{html,spec.ts}                                   (T1)
  core/components/
    header/header.component.{html,spec.ts}                       (T9)
    lang-selector/lang-selector.component.{ts,html,scss,spec.ts} (T7)
    not-found-404/not-found-404.component.{html,spec.ts}         (T5)
  shared/components/
    button/button.component.{ts,html,spec.ts}                    (T12)
    toggle-button/toggle-button.component.{ts,html}              (T11)
    toggle-button/toggle-button.component.spec.ts                (T11, NUEVO)
    photo/photo.component.{html,scss,spec.ts}                    (T13)
  features/
    contact/components/contact/contact.component.{html,spec.ts}  (T3)
    contact/components/contact-form/contact-form.component.{ts,html,spec.ts} (T14)
    reviews/components/reviews-form/reviews-form.component.{ts,html,spec.ts} (T6, T14)
    success-cases/components/
      success-cases/success-cases.component.{html,spec.ts}       (T4)
      success-case/success-case.component.{html,spec.ts}         (T10)
      success-case-detail/success-case-detail.component.{ts,spec.ts} (T2)
    blog/components/post-card/post-card.component.{html,spec.ts} (T8)
src/assets/i18n/es-ES.json, en-US.json                           (T10, T14)
src/styles/_palette.scss                                         (T15, condicional)
docs/a11y-backlog.md                                             (T16)
```

---

### Task 1: Skip link a `#main-content` (2.4.1)

**Files:**
- Modify: `src/app/app.component.html`
- Modify: `src/app/app.component.spec.ts` (overrideTemplate líneas 53–63 y test líneas 166–175)

**Interfaces:**
- Consumes: clave i18n existente `COMMON.SKIP_TO_MAIN` (`es-ES.json:16` = "Saltar al contenido principal", `en-US.json:16` = "Skip to main content" — NO crear claves nuevas).
- Produces: primer enfocable del documento = `a.skip-link[href="#main-content"]`; `<main id="main-content" tabindex="-1">` enfocable programáticamente (lo consume `app.component.ts:99-103`, que ya hace `main.focus()`).

- [ ] **Step 1: Actualizar `app.component.html`**

Añadir como **primer elemento** (antes de `<app-header/>`), sin `aria-label` (el texto visible es el nombre accesible):

```html
<a class="skip-link" href="#main-content">{{
  "COMMON.SKIP_TO_MAIN" | translate
}}</a>
```

Y añadir `tabindex="-1"` estático al main (lo necesita el skip link en primera carga; el código dinámico de `app.component.ts` ya lo re-setea al navegar):

```html
<main id="main-content" class="inner-body" tabindex="-1">
```

- [ ] **Step 2: Sincronizar el `overrideTemplate` del spec (líneas 55–62)**

El override debe ser espejo exacto del template de producción (mismo markup, más un comentario indicando que debe mantenerse sincronizado). Sustituir en el override la línea del skip-link (`href="#blog"` / `SKIP_TO_BLOG`) por la nueva y añadir `tabindex="-1"` al `<main>`. Las claves `SKIP_TO_BLOG` / `SKIP_TO_PORTFOLIO` / `SKIP_TO_NAV` quedan en i18n sin usarse (no eliminarlas; anotar en el commit de referencia).

- [ ] **Step 3: Reforzar el test existente "should include a skip-link as the first focusable element" (línea 166)**

Aserciones: el primer enfocable del DOM es `a.skip-link`; su `href` termina en `#main-content`; existe `main#main-content` con `tabindex="-1"`.

- [ ] **Step 4: Ejecutar**

Run: `npx ng test --watch=false --browsers=ChromeHeadlessCI --include=src/app/app.component.spec.ts`
Expected: PASS (incluye el test preexistente, que antes solo pasaba por el override).

- [ ] **Step 5: Commit (referencia — NO ejecutar)**

```bash
git add src/app/app.component.html src/app/app.component.spec.ts
git commit -m "a11y: renderiza skip-link a #main-content en el shell (WCAG 2.4.1)"
```

---

### Task 2: Modal con trampa de foco y retorno al trigger (success-case-detail)

**Files:**
- Modify: `src/app/features/success-cases/components/success-case-detail/success-case-detail.component.ts`
- Test: `src/app/features/success-cases/components/success-case-detail/success-case-detail.component.spec.ts`

**Interfaces:**
- Consumes: `viewChild.required<ElementRef<HTMLElement>>('panel')` ya existente (línea 34); host listener `'(document:keydown.escape)'` ya existente (línea 26).
- Produces: `onTrapTab(event: KeyboardEvent): void` (handler Tab en host); privado `_triggerToRestore: HTMLElement | null`. Nada externo consume estos miembros; el spec usa la instancia directamente.

- [ ] **Step 1: Escribir tests fallidos** (en el spec existente, mismo mock loader)

1. `"should restore focus to the trigger element when closed"`: crear botón anclado al `document.body`, darle foco, crear un **fixture propio** con `TestBed.createComponent` (no reutilizar el `fixture` del `beforeEach`, que el `afterEach` destruye), `detectChanges()`, `fixture.destroy()` → `document.activeElement` debe ser ese botón.
2. `"should trap Tab focus within the dialog"`: con `detectChanges()` previo, `document.activeElement` queda en el panel (`tabindex="-1"`); despachar en `document` `new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })` (el listener `(document:keydown.tab)` del host lo recibe, igual que el test de Escape existente) → el foco debe quedar en el primer enfocable (`.detail-close`) y `event.defaultPrevented === true`; repetir con `{ shiftKey: true, cancelable: true }` desde `.detail-close` → foco en el último enfocable.
3. `"should not throw when restoring focus to a disconnected trigger"`: trigger desconectado del DOM → `ngOnDestroy` no lanza y el foco no se restaura (queda en `<body>`).

- [ ] **Step 2: Ejecutar y verificar que fallan**

Run: `npx ng test --watch=false --browsers=ChromeHeadlessCI --include=src/app/features/success-cases/components/success-case-detail/success-case-detail.component.spec.ts`
Expected: FAIL (3 tests nuevos).

- [ ] **Step 3: Implementar en el componente**

Host (línea 25–28, añadir junto a escape): `'(document:keydown.tab)': 'onTrapTab($event)'`.

Miembros y cuerpo (algoritmo de trampa, no derivable de firmas):

```ts
private _triggerToRestore: HTMLElement | null = null;

ngOnInit(): void {
  // Capturar el disparador ANTES de que el effect() mueva el foco al panel
  this._triggerToRestore =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  document.body.style.overflow = 'hidden';
}

onTrapTab(event: KeyboardEvent): void {
  const panel = this._panel()?.nativeElement;
  if (!panel) return;
  const active = document.activeElement as HTMLElement | null;
  if (!active || !panel.contains(active)) {
    // El foco se escapó (p. ej. focus programático externo): devolverlo al panel
    event.preventDefault();
    panel.focus();
    return;
  }
  const focusables = Array.from(
    panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex="0"]'
    )
  ).filter((el) => el.offsetParent !== null);
  if (focusables.length === 0) {
    event.preventDefault();
    panel.focus();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && (active === first || active === panel)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

ngOnDestroy(): void {
  document.body.style.overflow = '';
  const trigger = this._triggerToRestore;
  if (trigger?.isConnected) trigger.focus({ preventScroll: true });
}
```

Mantener el `effect()` existente (foco inicial al panel) y `onEscape`/`onBackdropClick` sin cambios.

- [ ] **Step 4: Ejecutar y verificar que pasan**

Run: mismo comando del Step 2.
Expected: PASS (los 3 nuevos + los 4 preexistentes).

- [ ] **Step 5: Commit (referencia — NO ejecutar)**

```bash
git add src/app/features/success-cases/components/success-case-detail/
git commit -m "a11y: trampa de foco y retorno al trigger en modal success-case-detail"
```

---

### Task 3: Un solo `<h1>` por página — contact `h1 → h2` (1.3.1)

**Files:**
- Modify: `src/app/features/contact/components/contact/contact.component.html:9`
- Test: `src/app/features/contact/components/contact/contact.component.spec.ts`

**Interfaces:** Ninguna entre tasks. Referencia de patrón: `about.component.spec.ts:78-80` ("should not skip heading levels") ya verifica ausencia de h1 en secciones del one-pager.

- [ ] **Step 1: Escribir test fallido** en `contact.component.spec.ts`: `"should not render h1 (the one-pager has a single h1 from home)"` → `expect(el.querySelector('h1')).toBe(null)` y `expect(el.querySelector('h2.intro-title')).toBeTruthy()`.

- [ ] **Step 2: Ejecutar y verificar fallo** (`--include` sobre ese spec).

- [ ] **Step 3: Cambiar `<h1 class="intro-title">` por `<h2 class="intro-title">`** (línea 9) y su cierre en línea 12. Los estilos son por clase (`.intro-title` en SCSS), no requieren cambios; el h2 hereda el estilo global de headings (`styles.scss:239`).

- [ ] **Step 4: Ejecutar y verificar PASS.**

- [ ] **Step 5: Commit (referencia — NO ejecutar)**

```bash
git add src/app/features/contact/components/contact/
git commit -m "a11y: contact usa h2, el one-pager conserva un único h1 (1.3.1)"
```

---

### Task 4: Título accesible de la sección success-cases (aria-labelledby colgante)

**Files:**
- Modify: `src/app/features/success-cases/components/success-cases/success-cases.component.html`
- Test: `src/app/features/success-cases/components/success-cases/success-cases.component.spec.ts`

**Interfaces:**
- Consumes: clave i18n existente `SUCCESS_CASES.TITLE` (`es-ES.json:132` = "Casos de éxito"; verificar paridad en `en-US.json`).
- Produces: `<h2 id="success-cases-title">` — resuelve el `aria-labelledby` que ya apunta a ese id (línea 1 del template) y da padre de nivel h2 a los `h3` sr-only de las tarjetas.

- [ ] **Step 1: Escribir test fallido**: `"should resolve the section aria-labelledby to an existing element"` → obtener `el.querySelector('.success-cases')` (o `section[aria-labelledby]`), leer `aria-labelledby`, y `document.getElementById(valor)` no nulo y con `textContent` no vacío.

- [ ] **Step 2: Ejecutar y verificar fallo.**

- [ ] **Step 3: Añadir como primer hijo del `<section>`:**

```html
<h2 id="success-cases-title" class="sr-only">
  {{ "SUCCESS_CASES.TITLE" | translate }}
</h2>
```

- [ ] **Step 4: Ejecutar y verificar PASS** (jerarquía final: h1 home → h2 sección → h3 tarjetas).

- [ ] **Step 5: Commit (referencia — NO ejecutar)**

```bash
git add src/app/features/success-cases/components/success-cases/
git commit -m "a11y: título accesible para la sección success-cases (aria-labelledby resuelto)"
```

---

### Task 5: Eliminar `<main>` anidado en 404 (1.3.1)

**Files:**
- Modify: `src/app/core/components/not-found-404/not-found-404.component.html:1` y cierre en línea 19
- Test: `src/app/core/components/not-found-404/not-found-404.component.spec.ts`

- [ ] **Step 1: Escribir test fallido**: `"should not render a nested main landmark"` → `expect(fixture.nativeElement.querySelector('main')).toBeNull()`.

- [ ] **Step 2: Ejecutar y verificar fallo.**

- [ ] **Step 3: Sustituir** `<main class="error-container" role="main">` → `<div class="error-container">` (y `</main>` → `</div>`). La clase `.error-container` conserva el estilizado del SCSS del componente; el `<main>` real es el del shell.

- [ ] **Step 4: Ejecutar y verificar PASS** (el test preexistente del `h1.sr-only` debe seguir pasando).

- [ ] **Step 5: Commit (referencia — NO ejecutar)**

```bash
git add src/app/core/components/not-found-404/
git commit -m "a11y: 404 sin <main> anidado dentro del shell (1.3.1)"
```

---

### Task 6: Radiogroup de estrellas con flechas y roving tabindex (APG)

**Files:**
- Modify: `src/app/features/reviews/components/reviews-form/reviews-form.component.ts`
- Modify: `src/app/features/reviews/components/reviews-form/reviews-form.component.html` (bloque `.stars-row`, líneas 113–153)
- Test: `src/app/features/reviews/components/reviews-form/reviews-form.component.spec.ts`

**Interfaces:**
- Consumes: `stars`, `setRating(rating)`, `currentRating` ya existentes en el TS (líneas 30–49).
- Produces: `starTabIndex(star: number): number` y `onStarKeydown(event: KeyboardEvent, star: number): void` — usados por el template; testados por el spec.

- [ ] **Step 1: Escribir tests fallidos:**

1. `"roving tabindex: with rating 0 only the first star is tabbable"` → `[attr.tabindex]`: estrella 1 = `"0"`, resto = `"-1"`.
2. `"roving tabindex: after selecting star 3 only star 3 is tabbable"` → `component.setRating(3)` + `detectChanges()`.
3. `"ArrowRight moves focus and selects the next star"` → `btn2.focus()`, luego `btn2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))` (el binding `(keydown)` del template es quien invoca el handler, así `event.target` es el botón) → `document.activeElement` = botón estrella 3 y `currentRating === 3`.
4. `"ArrowLeft/Home/End move accordingly and wrap at the edges"` → mismo patrón de dispatch: Home desde la 3 → estrella 1; End → estrella 5; ArrowRight desde la 5 → envuelve a la 1; ArrowLeft desde la 1 → envuelve a la 5.

- [ ] **Step 2: Ejecutar y verificar fallos.**

- [ ] **Step 3: Implementar en el TS:**

```ts
starTabIndex(star: number): number {
  return star === (this.currentRating || 1) ? 0 : -1;
}

onStarKeydown(event: KeyboardEvent, star: number): void {
  const go = (next: number) => {
    event.preventDefault();
    this.setRating(next); // APG radio: mover el foco selecciona
    const btn = (event.target as HTMLElement)
      .closest('.stars-row')
      ?.querySelectorAll<HTMLButtonElement>('.star-btn')[next - 1];
    btn?.focus();
  };
  switch (event.key) {
    case 'ArrowRight': case 'ArrowDown': go(star === 5 ? 1 : star + 1); break;
    case 'ArrowLeft': case 'ArrowUp': go(star === 1 ? 5 : star - 1); break;
    case 'Home': go(1); break;
    case 'End': go(5); break;
  }
}
```

- [ ] **Step 4: En el template, cada `button.star-btn` del `@for`** (líneas 122–153) añade: `[attr.tabindex]="starTabIndex(star)"` y `(keydown)="onStarKeydown($event, star)"`. Mantener `role="radio"`, `aria-checked` y `(click)` intactos.

- [ ] **Step 5: Ejecutar y verificar PASS** (los tests preexistentes de `aria-checked`/`aria-label` de líneas 285–290 deben seguir verdes).

- [ ] **Step 6: Commit (referencia — NO ejecutar)**

```bash
git add src/app/features/reviews/components/reviews-form/
git commit -m "a11y: radiogroup de estrellas navegable con flechas (APG radio)"
```

---

### Task 7: Listbox del lang-selector con roving tabindex + `visibility`

**Files:**
- Modify: `src/app/core/components/lang-selector/lang-selector.component.ts`
- Modify: `src/app/core/components/lang-selector/lang-selector.component.html:61`
- Modify: `src/app/core/components/lang-selector/lang-selector.component.scss` (`.hidden`, líneas 88–92)
- Test: `src/app/core/components/lang-selector/lang-selector.component.spec.ts`

**Interfaces:**
- Consumes: señales `showOptions`, helpers `_focusOption(index)` y `navigateOptions(direction, element)` ya existentes (TS líneas 89–130).
- Produces: `activeIndex = signal(0)` — índice de la opción con `tabindex="0"`; `_focusOption` pasa a ser el único punto que setea `activeIndex` y mueve el foco.

- [ ] **Step 1: Escribir tests fallidos:**

1. `"roving tabindex: when open exactly one option is tabbable"` → abrir (set `showOptions(true)`, `detectChanges()`) → `li[tabindex="0"]` solo el primero.
2. `"ArrowDown moves roving tabindex to the next option"` → foco en la opción 1, `option1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))` (binding `(keydown)` del template) → opción 2 con `tabindex="0"`, opción 1 con `"-1"` y `document.activeElement` = opción 2.
3. `"when closed no option is tabbable"` → todos los `li` con `tabindex="-1"` (ya funcionaba; guard de regresión).
4. `"hidden options are not exposed via visibility"` → con `showOptions(false)`, `ul.style.transition = 'none'` (evita el delay de la transición de visibility en el assert) → `getComputedStyle(ul).visibility === 'hidden'`.

- [ ] **Step 2: Ejecutar y verificar fallos.**

- [ ] **Step 3: Implementar:**

TS — añadir `readonly activeIndex = signal(0);` y centralizar:

```ts
private _focusOption(index: number): void {
  this.activeIndex.set(index);
  const options = this._optionsList()?.nativeElement.querySelectorAll<HTMLLIElement>('li.lang');
  options?.[index]?.focus();
}
```

En `navigateOptions`, sustituir el `focus()` directo por `this.activeIndex.set(nextIndex); (options[nextIndex] as HTMLElement).focus();`.

HTML línea 61: `[attr.tabindex]="showOptions() && activeIndex() === $index ? 0 : -1"`.

SCSS — en `.lang-selector-options` (línea 41) añadir a la transición `visibility 0s linear 0.4s;` y en `.hidden` añadir `visibility: hidden;` (se oculta al terminar el fade; espejo del patrón del dock en `sidebar.component.scss:162-169`).

- [ ] **Step 4: Ejecutar y verificar PASS** (los tests preexistentes de teclado/arrows/typeahead deben seguir verdes; el Enter/Space/Escape ya restauran foco al trigger).

- [ ] **Step 5: Commit (referencia — NO ejecutar)**

```bash
git add src/app/core/components/lang-selector/
git commit -m "a11y: roving tabindex en listbox de idiomas + visibility en .hidden"
```

---

### Task 8: aria-label del CTA de post-card incluye el título (4.1.2)

**Files:**
- Modify: `src/app/features/blog/components/post-card/post-card.component.html:47`
- Test: `src/app/features/blog/components/post-card/post-card.component.spec.ts`

- [ ] **Step 1: Escribir test fallido**: `"CTA aria-label includes the post title"` → el `aria-label` de `.post-card__cta` contiene el valor del input `title` y empieza por el texto traducido de `BLOG.FULL_POST_ARIA`.

- [ ] **Step 2: Ejecutar y verificar fallo.**

- [ ] **Step 3: Cambiar la línea 47:**

```html
[attr.aria-label]="('BLOG.FULL_POST_ARIA' | translate) + ': ' + title"
```

(`title` es el input del componente; resultado: "Leer el artículo completo: \<título\>". 2.5.3 se mantiene: el texto visible "Artículo completo" está contenido en el nombre.)

- [ ] **Step 4: Ejecutar y verificar PASS.**

- [ ] **Step 5: Commit (referencia — NO ejecutar)**

```bash
git add src/app/features/blog/components/post-card/
git commit -m "a11y: aria-label del CTA de post-card incluye el título del post"
```

---

### Task 9: Label in Name — brand del header (2.5.3)

**Files:**
- Modify: `src/app/core/components/header/header.component.html:2`
- Test: `src/app/core/components/header/header.component.spec.ts:100`

- [ ] **Step 1: Actualizar la aserción del spec (línea 100)** a `'NOMACODA — Ir al inicio'` y ejecutar → FAIL con el template actual.

- [ ] **Step 2: Cambiar el aria-label del brand (línea 2):**

```html
[attr.aria-label]="'NOMACODA — ' + ('COMMON.NAV_HOME' | translate)"
```

- [ ] **Step 3: Ejecutar el spec del header y verificar PASS.**

- [ ] **Step 4: Commit (referencia — NO ejecutar)**

```bash
git add src/app/core/components/header/
git commit -m "a11y: brand accesible con el label visible NOMACODA (2.5.3)"
```

---

### Task 10: Label in Name — botón "+ info" (2.5.3)

**Files:**
- Modify: `src/assets/i18n/es-ES.json` (bloque `SUCCESS_CASES`, junto a `OPEN_DETAIL` línea 117)
- Modify: `src/assets/i18n/en-US.json` (misma posición)
- Modify: `src/app/features/success-cases/components/success-case/success-case.component.html:26`
- Test: `src/app/features/success-cases/components/success-case/success-case.component.spec.ts`

**Interfaces:** Nueva clave `SUCCESS_CASES.INFO_ARIA` (parámetro `{{name}}`). El mock del spec de success-case (línea 19) debe añadir esta clave con valor `'+" + " info…'` equivalente en español de prueba: `'+ info — más información de {{name}}'`.

- [ ] **Step 1: Añadir al mock del spec la clave `INFO_ARIA` y escribir el test fallido**: `"info-btn aria-label contains the visible label '+ info'"` → `aria-label` empieza por `'+ info'` y contiene el nombre del caso.

- [ ] **Step 2: Ejecutar y verificar fallo.**

- [ ] **Step 3: Añadir las claves i18n:**

es-ES: `"INFO_ARIA": "+ info — más información de {{name}}"`
en-US: `"INFO_ARIA": "+ info — more about {{name}}"`

- [ ] **Step 4: Cambiar la línea 26 del template** a `[attr.aria-label]="'SUCCESS_CASES.INFO_ARIA' | translate: { name: successCase().name }"`.

- [ ] **Step 5: Ejecutar specs de success-case y success-case-detail** (`--include` x2 o suite completa) → PASS.

- [ ] **Step 6: Commit (referencia — NO ejecutar)**

```bash
git add src/assets/i18n/ src/app/features/success-cases/components/success-case/
git commit -m "a11y: aria-label de '+ info' contiene el label visible (2.5.3)"
```

---

### Task 11: Ids únicos en toggle-button (4.1.2)

**Files:**
- Modify: `src/app/shared/components/toggle-button/toggle-button.component.ts`
- Modify: `src/app/shared/components/toggle-button/toggle-button.component.html:8` y `:14`
- Create: `src/app/shared/components/toggle-button/toggle-button.component.spec.ts` (no existe)

**Interfaces:** Produce `readonly uid: string` (estable por instancia). El componente está hoy **sin usar** en la app; el fix lo deja listo y el test previene regresión.

- [ ] **Step 1: Escribir el spec fallido:**

```ts
it('generates a unique id per instance and binds aria-labelledby to it', () => {
  const f1 = TestBed.createComponent(ToggleButtonComponent);
  f1.componentRef.setInput('label', 'BLOG.SAME_LABEL');
  const f2 = TestBed.createComponent(ToggleButtonComponent);
  f2.componentRef.setInput('label', 'BLOG.SAME_LABEL');
  f1.detectChanges(); f2.detectChanges();
  const c1 = f1.nativeElement.querySelector('.label') as HTMLElement;
  const c2 = f2.nativeElement.querySelector('.label') as HTMLElement;
  expect(c1.id).not.toBe(c2.id);
  const input1 = f1.nativeElement.querySelector('input');
  expect(input1.getAttribute('aria-labelledby')).toBe(c1.id);
});
```

(provider `provideZonelessChangeDetection()`; replicar el setup de `button.component.spec.ts`.)

- [ ] **Step 2: Ejecutar y verificar fallo** (hoy ambas instancias comparten `toggle-label-BLOG.SAME_LABEL`).

- [ ] **Step 3: Implementar:**

TS: `private static _seq = 0;` y `readonly uid = 'toggle-label-' + ++ToggleButtonComponent._seq;`
HTML línea 8: `[attr.aria-labelledby]="uid"`; línea 14: `[id]="uid"`.

- [ ] **Step 4: Ejecutar y verificar PASS.**

- [ ] **Step 5: Commit (referencia — NO ejecutar)**

```bash
git add src/app/shared/components/toggle-button/
git commit -m "a11y: ids únicos por instancia en toggle-button (4.1.2)"
```

---

### Task 12: Eliminar keydown redundante en app-button

**Files:**
- Modify: `src/app/shared/components/button/button.component.ts:29-35` (eliminar `onKeyDown`)
- Modify: `src/app/shared/components/button/button.component.html:7` (eliminar `(keydown)="onKeyDown($event)"`)
- Test: `src/app/shared/components/button/button.component.spec.ts`

- [ ] **Step 1: Grep en el spec** (`onKeyDown|keydown|Enter|Space`): si hay tests del handler, eliminarlos/adaptarlos.

- [ ] **Step 2: Añadir test de regresión**: `"Enter key does not double-emit buttonClick"` → foco en el botón, `dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))` + `dispatchEvent(new Event('click', { bubbles: true }))` → `buttonClick` emitido **exactamente 1 vez**. (El `<button>` nativo ya maneja Enter/Space; el handler manual puede duplicar la emisión según navegador.)

- [ ] **Step 3: Eliminar el handler y el binding.**

- [ ] **Step 4: Ejecutar el spec y verificar PASS.**

- [ ] **Step 5: Commit (referencia — NO ejecutar)**

```bash
git add src/app/shared/components/button/
git commit -m "a11y: elimina keydown redundante en app-button (Enter/Space nativos)"
```

---

### Task 13: `photo` renderiza `<figcaption>` cuando hay caption

**Files:**
- Modify: `src/app/shared/components/photo/photo.component.html` (tras el `<img>`, líneas 6–15)
- Modify: `src/app/shared/components/photo/photo.component.scss` (nueva clase `.photo__caption`)
- Test: `src/app/shared/components/photo/photo.component.spec.ts`

**Interfaces:** Consumes el input existente `caption` (ya traducido por los padres, p. ej. `about.component.html:17` — NO aplicar `| translate` dentro).

- [ ] **Step 1: Escribir tests fallidos**: `"renders figcaption when caption is provided"` (`setInput('caption', 'Leyenda')` → `figcaption.photo__caption` con ese texto) y `"renders no figcaption when caption is empty"`.

- [ ] **Step 2: Ejecutar y verificar fallos.**

- [ ] **Step 3: Implementar:**

HTML (dentro del `<figure>`, tras el `<img>`):

```html
@if (caption()) {
  <figcaption class="photo__caption">{{ caption() }}</figcaption>
}
```

SCSS (tokens obligatorios):

```scss
.photo__caption {
  margin-top: 0.75rem;
  font-family: fonts.$body;
  font-size: 0.9rem;
  color: palette.$text-secondary;
}
```

(añadir `@use "/src/styles/fonts" as fonts;` si el SCSS aún no lo importa; comprobar cómo lo hace `lang-selector.component.scss:2`.)

- [ ] **Step 4: Ejecutar specs de photo y about** → PASS.

- [ ] **Step 5: Commit (referencia — NO ejecutar)**

```bash
git add src/app/shared/components/photo/
git commit -m "a11y: photo renderiza figcaption con el caption proporcionado"
```

---

### Task 14: Resumen de errores y submit habilitado en formularios (3.3.1/3.3.2)

**Files:**
- Modify: `src/app/features/contact/components/contact-form/contact-form.component.ts` (método `submit()`), `.html` (línea 173 y bloque nuevo tras `<form>`)
- Modify: `src/app/features/reviews/components/reviews-form/reviews-form.component.ts` (`submit()` líneas 64–68), `.html` (línea 189 y bloque nuevo tras `<form>`)
- Modify: `src/assets/i18n/es-ES.json` y `en-US.json` (bloque `FORM`, nueva clave `SUMMARY_ERROR`)
- Test: `contact-form.component.spec.ts` (tests de líneas 308–332) y `reviews-form.component.spec.ts`

**Interfaces:**
- Produces en ambos componentes: `submitted = signal(false)` (público, para el template y los specs) y privado `_focusFirstInvalid(): void`.
- Nueva clave i18n: `FORM.SUMMARY_ERROR` — es: `"Revisa los campos marcados antes de enviar."` / en: `"Please review the highlighted fields before submitting."`

- [ ] **Step 1: Escribir/actualizar tests fallidos (contact-form):**

1. Reemplazar el test de línea 308 `"should disable submit button when form is invalid"` por `"should ENABLE submit button when form is invalid so users can trigger validation"` → `disabled === false` con form inválido; tras hacer clic → aparece `[role="alert"]` con el texto de `FORM.SUMMARY_ERROR`, `submitted()` es `true` y `document.activeElement` es el primer campo inválido (`#contact-fullName`).
2. El test de línea 320 (disabled cuando loading) se mantiene sin cambios.
3. Éxito → `submitted()` vuelve a `false` y el resumen desaparece.
4. Replicar 1 y 3 en `reviews-form.component.spec.ts` (primer inválido: `#reviews-email`).

- [ ] **Step 2: Ejecutar y verificar fallos.**

- [ ] **Step 3: Implementar (patrón común, ambos formularios):**

TS — en la rama de `form.invalid` dentro de `submit()`:

```ts
if (this.form.invalid) {
  this.submitted.set(true);
  this.form.markAllAsTouched();
  this._focusFirstInvalid();
  return;
}
```

y en la rama de éxito `this.submitted.set(false);` (antes/tras el `formStatus.set` de success).

Privado (algoritmo de foco al primer inválido; el `queueMicrotask` espera el render del `aria-invalid`):

```ts
private _focusFirstInvalid(): void {
  queueMicrotask(() => {
    const root = this._root?.nativeElement ?? document;
    root.querySelector<HTMLElement>('[aria-invalid="true"], .stars-row.input-error')
      ?.focus();
  });
}
```

(En contact-form: si no existe, añadir `viewChild<ElementRef<HTMLElement>>` al `<form>`; en reviews-form el foco sobre `.stars-row.input-error` requiere `tabindex="-1"` en ese div — añadirlo en el HTML.)

HTML — ambos: submit pasa a `[disabled]="formStatus().loading"` (solo durante el envío). Tras la apertura del `<form>`, resumen:

```html
@if (submitted() && form.invalid) {
  <div id="contact-form-summary" class="form-summary" role="alert">
    {{ "FORM.SUMMARY_ERROR" | translate }}
  </div>
}
```

(en reviews-form, `id="reviews-form-summary"`). SCSS de cada form: `.form-summary` con tokens de paleta (`rgba(palette.$text-red, 0.15)` de fondo, `palette.$text-red` de texto, radio y padding acordes a `.error-message` existente).

- [ ] **Step 4: Ejecutar specs de ambos formularios y verificar PASS** (los tests preexistentes de `aria-invalid`/`aria-describedby`/`role="alert"` por campo se mantienen).

- [ ] **Step 5: Commit (referencia — NO ejecutar)**

```bash
git add src/app/features/contact/components/contact-form/ src/app/features/reviews/components/reviews-form/ src/assets/i18n/
git commit -m "a11y: resumen de errores y submit habilitado en formularios (3.3.1)"
```

---

### Task 15: Verificación de contraste (1.4.3) — 3 pares en runtime

**Files:**
- Verify (sin cambios salvo condición): `src/styles/_palette.scss`
- Posible Modify: SCSS de los componentes afectados (solo si el paso 3 lo determina)

**Interfaces:** Si procede el fix, nuevo token `$text-secondary-strong: #c6d9ee;` en `_palette.scss` (comentario: "deriva de $text-secondary; ≥4.5:1 sobre $background-gradient-end #115f51 y sobre #0f3254").

- [ ] **Step 1: Estimaciones estáticas (partida):** `$text-primary #f0f4f8` sobre `#0f3254` ≈ 14:1 ✓; `$text-secondary #a0bbd8` sobre `#0f3254` ≈ 6.6:1 ✓ y sobre `#115f51` ≈ **3.8:1 ✗** (texto normal); `$code-comment #6f9484` sobre el fondo del code-window ≈ 5:1 ✓ (confirmar fondo real en `code-window.component.scss`); `$amber-text #fcd34d` sobre `$brown-btn-*` ✓; `$amber-outline` usado solo como borde (1.4.11 no aplica a bordes decorativos).

- [ ] **Step 2: Verificar en runtime:** arrancar `npm start` (background) y con Chrome DevTools inspeccionar los elementos donde `$text-secondary` se pinta sobre zonas del gradiente cercanas a `#115f51` (fin del scroll del one-pager: descripciones de contact/reviews y footer) y el `.code-comment` del code-window. Registrar ratios reales (DevTools → color picker muestra el ratio).

- [ ] **Step 3: Decisión con regla fija:** si algún texto normal queda < 4.5:1 sobre su fondo real → añadir el token `$text-secondary-strong` a `_palette.scss` y aplicarlo **solo** a los selectores afectados (uno por uno, verificando tras cada cambio). Si todos ≥ 4.5:1 → sin cambios; registrar ratios medidos en el paso siguiente.

- [ ] **Step 4: Documentar el resultado** (ratios medidos, pares ok/kfix) en la entrada de backlog del Task 16.

- [ ] **Step 5: Commit condicional (referencia — NO ejecutar)**

```bash
git add src/styles/_palette.scss src/app/...
git commit -m "a11y: token $text-secondary-strong para texto normal sobre el extremo verde del gradiente (1.4.3)"
```

---

### Task 16: Validación final + registro en backlog

**Files:**
- Modify: `docs/a11y-backlog.md` (nueva entrada al final)

- [ ] **Step 1: Suite completa:** `npm run lint` (limpio) y `npm run test:ci` (todas verdes, incluida la de skip-link).

- [ ] **Step 2: Build:** `npm run build:prod` (sin errores).

- [ ] **Step 3: Smoke a11y:** con `npm start` corriendo en background, `npm run a11y:smoke` (debe pasar sin violaciones nuevas; registra las rutas verificadas).

- [ ] **Step 4: Re-auditar la checklist de la skill** (20 puntos) sobre los archivos tocados y anotar cualquier pendiente residual en el backlog (la F8 del backlog — WCAG 2.2 nuevos: 2.4.11, 2.5.7, 2.5.8 — queda fuera de este plan).

- [ ] **Step 5: Añadir a `docs/a11y-backlog.md`** una entrada `## 2026-11-12 — Auditoría WCAG v2 (skill accesibilidad-web-wcag)` con: tabla de 15 hallazgos → estado, referencia a este plan, ratios de contraste medidos (Task 15), y pendientes residuales si los hay.

- [ ] **Step 6: Commit (referencia — NO ejecutar)**

```bash
git add docs/a11y-backlog.md
git commit -m "docs: registra auditoría WCAG v2 y su plan de corrección"
```

---

## Notas para el executor

- Ejecutar las tasks en orden: T1–T5 (estructura) son independientes entre sí; T6–T7 (APG) también; T8–T14 dependen solo de claves i18n que crean sus propias tasks. Ninguna task consume interfaces de otra salvo T16 (valida todo).
- Tras cada task: mostrar al usuario el comando de commit sugerido y **continuar con la siguiente sin ejecutarlo** (AGENTS.md).
- Los specs usan `mockLoader` por componente: al añadir claves i18n nuevas (T10, T14), añadirlas también al mock correspondiente o el texto traducido será vacío en el test.
- Cambios mínimos de SCSS: no reordenar reglas existentes; añadir solo lo especificado.
