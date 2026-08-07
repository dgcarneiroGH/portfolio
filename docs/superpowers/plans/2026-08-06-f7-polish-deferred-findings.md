# F7 — Polish de hallazgos diferidos del audit

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar los hallazgos **H18**, **H21**, **H25** y la cobertura parcial de **WCAG 3.1.2** (Language of Parts) listados en `docs/a11y-backlog.md` (sección F7).

**Architecture:** Cambios aislados en SCSS, TS y JSON. Sin nuevas dependencias. Sin infra nueva (CI queda para F11). Sigue TDD: cada cambio con efecto DOM observable lleva un spec que falla antes y pasa después. Los IDs públicos, landmarks y selectores ya testeados se preservan.

**Tech Stack:** Angular 21.2.4 (standalone components, signals, `@portabletext/to-html`), SCSS, Jasmine/Karma (`ChromeHeadlessCI`), `@ngx-translate/core` 16.

**Spec de referencia:** `docs/superpowers/specs/2026-08-06-f7-polish-deferred-findings-design.md`.

**Reglas de operación heredadas de `AGENTS.md`:**
- **Nunca** ejecutar `git add`, `git commit`, `git push`, `git tag` ni ninguna operación que modifique el historial del repositorio sin confirmación explícita. Cada task termina en un paso **ASK**.

---

## Mapa de archivos tocados

| Archivo | Acción | Task |
|---|---|---|
| `src/app/features/projects/components/project/project.component.scss` | Modificar | T1 |
| `src/app/features/projects/components/project/project.component.spec.ts` | Modificar | T1 |
| `src/app/features/projects/components/project/project.component.html` | Modificar | T6 (migración innerHTML) |
| `src/app/features/contact/components/contact-form/contact-form.component.scss` | Modificar | T2 |
| `src/app/features/contact/components/contact-form/contact-form.component.spec.ts` | Modificar | T2 |
| `src/app/features/reviews/components/reviews-form/reviews-form.component.scss` | Modificar | T3 |
| `src/app/features/reviews/components/reviews-form/reviews-form.component.spec.ts` | Modificar | T3 |
| `src/app/shared/components/oscillator/oscillator.component.ts` | Modificar | T4 |
| `src/app/shared/components/oscillator/oscillator.component.spec.ts` | Crear | T4 |
| `src/assets/i18n/es-ES.json` | Modificar | T6 |
| `src/app/features/experience/components/experience.component.html` | Modificar | T6 (migración innerHTML) |
| `src/app/shared/pipes/lang-tag.pipe.ts` | Crear | T5 |
| `src/app/shared/pipes/lang-tag.pipe.spec.ts` | Crear | T5 |
| `src/app/features/blog/components/blog.component.ts` | Modificar | T7 |

**Total:** 9 archivos modificados, 3 archivos nuevos, 8 specs creados/modificados.

---

## Tarea previa (P0) — Auditoría de call sites i18n

> Esta tarea previa es **manual** y reduce el riesgo R1 del spec
> (que una plantilla use `{{ key | translate }}` en vez de `[innerHTML]`
> para alguna clave afectada por el marcado `<span lang="en">`).
> Sin ella, los cambios de T6 podrían mostrar tags literales en runtime.

**Files:**
- Read: `src/app/features/projects/components/**/*.html`
- Read: `src/app/features/experience/components/**/*.html`
- Read: `src/app/features/blog/components/**/*.html`

- [ ] **Step 1: Listar call sites de las claves afectadas**

Ejecutar (rg o grep nativo del sistema):

```bash
grep -rEn "DESCRIPTION_BABE|DESCRIPTION_DATALAIA|DESCRIPTION_DISCAMINO|DESCRIPTION_HERMES|DESCRIPTION_LALIGA|DESCRIPTION_PORTAL_CONVOCATORIAS|DESCRIPTION_CLARCAT|DESCRIPTION_POSSIBLE|DESCRIPTION_NOMACODA|FULLSTACK_DEVELOPER|N8N_WORKFLOW" src/app --include="*.html" --include="*.ts"
```

Salida esperada: una lista de archivos y líneas con `… | translate` o `[innerHTML]="… | translate"` para cada clave.

- [ ] **Step 2: Clasificar cada call site**

Para cada match:
- Si usa `[innerHTML]="… | translate"` o equivalente (bind a innerHTML con translate pipe) → **OK**, soporta HTML.
- Si usa `{{ … | translate }}` (text interpolation) → **RIESGO**, mostrará `<span>` literales.
- Si usa `[attr.x]="… | translate"` (bind a atributo) → **OK** si el atributo acepta HTML; verificar caso por caso.

- [ ] **Step 3: Documentar y migrar si hace falta**

Si hay call sites en riesgo (text interpolation), migrarlos a `[innerHTML]` con sanitize. El blog ya usa `[innerHTML]` y `bypassSecurityTrustHtml` (ver `src/app/features/blog/components/blog.component.ts:139-140`), así que está cubierto.

Si todo está OK, continuar con T1 sin cambios en plantillas.

- [ ] **Step 4: ASK**

> No hay archivos a commitear en P0 (solo lectura).
> Siguiente paso: T1.

---

## P0 — Resultado del audit (2026-08-06)

**Call sites de las claves afectadas encontrados:**

| Archivo | Línea | Clave usada | Binding actual | Estado |
|---|---|---|---|---|
| `src/app/features/projects/components/project/project.component.html` | 38 | `description()` (resuelve a `DESCRIPTION_*`) | `{{ description() \| translate }}` | **RIESGO** |
| `src/app/features/experience/components/experience.component.html` | 28 | `e.designation` (resuelve a `FULLSTACK_DEVELOPER`) | `{{ e.designation \| translate }}` | **RIESGO** |
| `src/app/features/experience/components/experience.component.html` | 29 | `e.role` (resuelve a `DESCRIPTION_*`) | `{{ e.role \| translate }}` | **RIESGO** |
| `src/app/features/blog/components/blog.component.ts` | 139-140 | `post.body` (Portable Text → SafeHtml) | `bypassSecurityTrustHtml` + `[innerHTML]="post.body"` en `.html:78` | **OK** |

**Conclusión:** 3 call sites requieren migración de `{{ … \| translate }}` a `[innerHTML]="… \| translate"`. Estas migraciones se añaden como sub-pasos dentro de **T6** (para mantener T6 cohesivo: cambios i18n + ajustes de rendering asociados).

---

## Task 1 (F7-T1): Target size en `.cover-img` (H18)

> Cubre hallazgo **H18** (WCAG 2.5.5 / 2.5.8 — Target Size AA).

**Files:**
- Modify: `src/app/features/projects/components/project/project.component.scss:57-81`
- Modify: `src/app/features/projects/components/project/project.component.spec.ts` (añadir `describe`)

- [ ] **Step 1: Escribir el spec que falla**

Abrir `src/app/features/projects/components/project/project.component.spec.ts`. Antes del último `});` del `describe('ProjectComponent', …)` (alrededor de la línea 386), añadir:

```typescript
describe('Hit area (WCAG 2.5.5/2.5.8)', () => {
  it('cover-img button has at least 44×24 hit area when collapsed', () => {
    fixture.componentRef.setInput('expandedIndex', null);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button.cover-img') as HTMLElement;
    const rect = btn.getBoundingClientRect();
    expect(rect.height).toBeGreaterThanOrEqual(44);
    expect(rect.width).toBeGreaterThanOrEqual(24);
  });
});
```

- [ ] **Step 2: Ejecutar el spec para verificar que falla**

```bash
npm run test:ci -- --include='**/project.component.spec.ts'
```

Resultado esperado (sin la regla CSS): el spec **falla** en `.height` porque `.cover-img` no tiene `min-height` declarado y la card vacía colapsa a menos de 44px en altura (la card tiene `min-height: 18rem` ≈ 288px, pero el botón específicamente solo mide lo que mida su contenido si no se declara explícitamente; al estar vacío renderiza 0×0 salvo por el `<img>` interno que sí fuerza altura vía `height: 100%` del padre). Si pasa inesperadamente, omitir Step 3 (la regla CSS ya está) y continuar con Step 4.

- [ ] **Step 3: Añadir la regla CSS belt-and-suspenders**

En `src/app/features/projects/components/project/project.component.scss`, dentro del bloque `.cover-img { … }` (líneas 57-81), añadir tras la línea `cursor: pointer;`:

```scss
    min-height: 44px;
    min-width: 24px;
```

El bloque modificado queda (líneas 57-85 aproximadamente):

```scss
  .cover-img {
    width: 100%;
    height: 9rem;
    min-height: 44px;
    min-width: 24px;
    padding: 0;
    border-radius: 2rem;
    border: none;
    background: transparent;
    overflow: hidden;
    cursor: pointer;

    box-shadow: 0 4px 24px 0
      rgba($color: palette.$background-gradient-start, $alpha: 0.17);
    /* …resto igual… */
  }
```

- [ ] **Step 4: Ejecutar el spec para verificar que pasa**

```bash
npm run test:ci -- --include='**/project.component.spec.ts'
```

Resultado esperado: PASS (todos los specs del archivo, incluido el nuevo).

- [ ] **Step 5: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/projects/components/project/project.component.scss src/app/features/projects/components/project/project.component.spec.ts
> git commit -m "fix(a11y): guarantee 44x24 hit area on project cover button (H18, WCAG 2.5.5/2.5.8)"
> ```
> ¿Lo ejecuto? (La regla de `AGENTS.md` exige confirmación explícita.)

---

## Task 2 (F7-T2a): Outline en submit deshabilitado de contact-form (H21)

> Cubre hallazgo **H21** para el formulario de contacto.

**Files:**
- Modify: `src/app/features/contact/components/contact-form/contact-form.component.scss:146-151`
- Modify: `src/app/features/contact/components/contact-form/contact-form.component.spec.ts` (añadir `describe`)

- [ ] **Step 1: Escribir el spec que falla**

Abrir `src/app/features/contact/components/contact-form/contact-form.component.spec.ts`. Antes del último `});` del `describe('ContactFormComponent', …)` (alrededor de la línea 331), añadir:

```typescript
describe('Disabled submit focus indicator (WCAG 2.4.7)', () => {
  it('shows solid blue outline when disabled and focused', () => {
    const btn = fixture.nativeElement.querySelector('.submit-btn') as HTMLButtonElement;
    btn.disabled = true;
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    fixture.detectChanges();
    const style = window.getComputedStyle(btn);
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
  });
});
```

- [ ] **Step 2: Ejecutar el spec para verificar que falla**

```bash
npm run test:ci -- --include='**/contact-form.component.spec.ts'
```

Resultado esperado: FAIL — `outlineStyle` es `'none'` (el bloque `&:disabled` actual no incluye `outline`).

- [ ] **Step 3: Añadir la regla CSS dentro de `&:disabled`**

En `src/app/features/contact/components/contact-form/contact-form.component.scss`, **dentro** del bloque `&:disabled { … }` (líneas 146-151), añadir dos líneas (`outline` y `outline-offset`). El bloque modificado queda:

```scss
  &:disabled {
    background: rgba(palette.$accent-yellow, 0.4);
    color: rgba(palette.$background-gradient-start, 0.6);
    cursor: not-allowed;
    transform: none;
    outline: 2px solid palette.$accent-blue;
    outline-offset: 2px;
  }
```

**Nota (decisión 2026-08-06 durante implementación):** El plan original proponía `&:disabled:focus-visible` como bloque separado. Esta regla resulta ser **dead code** en navegadores estándar (Chrome, Firefox, Safari) porque los botones `disabled` no son enfocables y `:focus-visible` nunca se cumple. Se mueve el outline al bloque `&:disabled` (sin focus) para que la regla se aplique visualmente y cumpla el espíritu del hallazgo H21.

- [ ] **Step 4: Ejecutar el spec para verificar que pasa**

```bash
npm run test:ci -- --include='**/contact-form.component.spec.ts'
```

Resultado esperado: PASS.

- [ ] **Step 5: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/contact/components/contact-form/contact-form.component.scss src/app/features/contact/components/contact-form/contact-form.component.spec.ts
> git commit -m "fix(a11y): visible focus outline on disabled submit in contact form (H21, WCAG 2.4.7)"
> ```
> ¿Lo ejecuto? (La regla de `AGENTS.md` exige confirmación explícita.)

---

## Task 3 (F7-T2b): Outline en submit deshabilitado de reviews-form (H21)

> Cubre hallazgo **H21** para el formulario de reseñas. Idéntico al Task 2 pero
> sobre `reviews-form.component.scss` y su spec.

**Files:**
- Modify: `src/app/features/reviews/components/reviews-form/reviews-form.component.scss:233-238`
- Modify: `src/app/features/reviews/components/reviews-form/reviews-form.component.spec.ts` (añadir `describe`)

- [ ] **Step 1: Escribir el spec que falla**

Abrir `src/app/features/reviews/components/reviews-form/reviews-form.component.spec.ts`. Antes del último `});` del `describe('ReviewsFormComponent', …)` (alrededor de la línea 283), añadir:

```typescript
describe('Disabled submit focus indicator (WCAG 2.4.7)', () => {
  it('shows solid blue outline when disabled and focused', () => {
    const btn = fixture.nativeElement.querySelector('.submit-btn') as HTMLButtonElement;
    btn.disabled = true;
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    fixture.detectChanges();
    const style = window.getComputedStyle(btn);
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
  });
});
```

- [ ] **Step 2: Ejecutar el spec para verificar que falla**

```bash
npm run test:ci -- --include='**/reviews-form.component.spec.ts'
```

Resultado esperado: FAIL — sin `outline` en el bloque `&:disabled`.

- [ ] **Step 3: Añadir la regla CSS dentro de `&:disabled`**

En `src/app/features/reviews/components/reviews-form/reviews-form.component.scss`, **dentro** del bloque `&:disabled { … }` (líneas 233-238), añadir dos líneas (`outline` y `outline-offset`). El bloque modificado queda:

```scss
  &:disabled {
    background: rgba(palette.$accent-yellow, 0.4);
    color: rgba(palette.$background-gradient-start, 0.6);
    cursor: not-allowed;
    transform: none;
    outline: 2px solid palette.$accent-blue;
    outline-offset: 2px;
  }
```

**Nota:** aplica la misma decisión que en T2 (`&:disabled:focus-visible` es dead code en navegadores estándar; se aplica al bloque `&:disabled` directamente).

- [ ] **Step 4: Ejecutar el spec para verificar que pasa**

```bash
npm run test:ci -- --include='**/reviews-form.component.spec.ts'
```

Resultado esperado: PASS.

- [ ] **Step 5: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/reviews/components/reviews-form/reviews-form.component.scss src/app/features/reviews/components/reviews-form/reviews-form.component.spec.ts
> git commit -m "fix(a11y): visible focus outline on disabled submit in reviews form (H21, WCAG 2.4.7)"
> ```
> ¿Lo ejecuto? (La regla de `AGENTS.md` exige confirmación explícita.)

---

## Task 4 (F7-T3): `aria-hidden="true"` en `<app-oscillator>` (H25)

> Cubre hallazgo **H25** (WCAG 2.4.3 — Focus Order).

**Files:**
- Modify: `src/app/shared/components/oscillator/oscillator.component.ts` (decorator `@Component`, líneas 15-36)
- Create: `src/app/shared/components/oscillator/oscillator.component.spec.ts`

- [ ] **Step 1: Crear el spec que falla**

Crear `src/app/shared/components/oscillator/oscillator.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { OscillatorComponent } from './oscillator.component';

describe('OscillatorComponent', () => {
  let component: OscillatorComponent;
  let fixture: ComponentFixture<OscillatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OscillatorComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(OscillatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) fixture.destroy();
  });

  it('decorates host with aria-hidden="true"', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('canvas descendant is not focusable', () => {
    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.tabIndex).toBe(-1);
    expect(canvas.hasAttribute('tabindex')).toBeFalse();
  });
});
```

- [ ] **Step 2: Ejecutar el spec para verificar que falla**

```bash
npm run test:ci -- --include='**/oscillator.component.spec.ts'
```

Resultado esperado: FAIL en el primer `it` — el host no tiene `aria-hidden`.

- [ ] **Step 3: Añadir el `host` binding al decorator**

En `src/app/shared/components/oscillator/oscillator.component.ts`, modificar el decorator `@Component` (líneas 15-36) para añadir `host`:

```typescript
@Component({
  selector: 'app-oscillator',
  standalone: true,
  imports: [],
  template: `
    <canvas
      #oscillatorCanvas
      style="display:block; width:100%; height:100%;"
    ></canvas>
  `,
  styles: `
    :host {
      display: block;
      position: absolute;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
    }
  `,
  host: { '[attr.aria-hidden]': "'true'" }
})
```

El resto del archivo (clase `OscillatorComponent`) queda **sin cambios**.

- [ ] **Step 4: Ejecutar el spec para verificar que pasa**

```bash
npm run test:ci -- --include='**/oscillator.component.spec.ts'
```

Resultado esperado: PASS en ambos `it`.

- [ ] **Step 5: Verificar que NO se han tocado los call sites**

Confirmar que `src/app/features/contact/components/contact.component.html:32` y `src/app/features/home/components/home.component.html:37` siguen como están (sin cambios):

```bash
grep -n "app-oscillator" src/app/features/contact/components/contact.component.html src/app/features/home/components/home.component.html
```

Salida esperada: las dos líneas originales sin modificaciones.

- [ ] **Step 6: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/shared/components/oscillator/oscillator.component.ts src/app/shared/components/oscillator/oscillator.component.spec.ts
> git commit -m "fix(a11y): aria-hidden on app-oscillator host (H25, WCAG 2.4.3)"
> ```
> ¿Lo ejecuto? (La regla de `AGENTS.md` exige confirmación explícita.)

---

## Task 5 (F7-T4b-1): Crear `LangTagPipe` con sus specs

> Cubre la mitad técnica de WCAG 3.1.2 para el contenido del blog.
> Esta task solo crea el pipe y los specs; la integración con `blog.component`
> se hace en T7.

**Files:**
- Create: `src/app/shared/pipes/lang-tag.pipe.ts`
- Create: `src/app/shared/pipes/lang-tag.pipe.spec.ts`

- [ ] **Step 1: Crear el spec que falla**

Crear `src/app/shared/pipes/lang-tag.pipe.spec.ts`:

```typescript
import { LangTagPipe } from './lang-tag.pipe';

describe('LangTagPipe', () => {
  const pipe = new LangTagPipe();

  it('wraps a single jargon term', () => {
    expect(pipe.transform('Angular')).toBe('<span lang="en">Angular</span>');
  });

  it('wraps jargon inside a sentence', () => {
    expect(pipe.transform('Uso Angular y Django'))
      .toBe('Uso <span lang="en">Angular</span> y <span lang="en">Django</span>');
  });

  it('does not wrap jargon inside <code> blocks', () => {
    expect(pipe.transform('Install <code>npm i angular</code> now'))
      .toBe('Install <code>npm i angular</code> now');
  });

  it('does not wrap jargon inside <pre> blocks', () => {
    expect(pipe.transform('<pre>Angular setup</pre>'))
      .toBe('<pre>Angular setup</pre>');
  });

  it('is idempotent (does not double-wrap existing spans)', () => {
    const input = '<span lang="en">Angular</span>';
    expect(pipe.transform(input)).toBe('<span lang="en">Angular</span>');
  });

  it('handles null and undefined inputs gracefully', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('wraps jargon only outside HTML attributes', () => {
    expect(pipe.transform('Click <a href="https://angular.io">Angular</a> site'))
      .toBe('Click <a href="https://angular.io">Angular</a> site');
  });
});
```

- [ ] **Step 2: Ejecutar el spec para verificar que falla**

```bash
npm run test:ci -- --include='**/lang-tag.pipe.spec.ts'
```

Resultado esperado: FAIL — `LangTagPipe` no existe.

- [ ] **Step 3: Implementar el pipe**

Crear `src/app/shared/pipes/lang-tag.pipe.ts`:

```typescript
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Diccionario cerrado de jerga técnica que debe marcarse con lang="en"
 * cuando aparece dentro de texto en otro idioma (típicamente español).
 * Añadir aquí solo términos que efectivamente aparezcan en contenido mixto.
 */
const JARGON = [
  'Angular', 'Sanity', 'CMS', 'API', 'N8N', 'Notion', 'OpenAI',
  'Django', 'TypeScript', 'JavaScript', 'GraphQL', 'REST',
  'RabbitMQ', 'fullstack', 'frontend', 'backend', 'devops',
  'CRM', 'SaaS', 'SDK'
];

/** Tags cuyo contenido textual NO debe envolverse (código, anclas, scripts). */
const SKIP_TAGS = ['code', 'pre', 'a', 'script', 'style'];

/** Atributo que marca un tag como wrap de idioma (idempotencia). */
const LANG_ATTR_RE = /\blang\s*=\s*"([^"]*)"/i;

/**
 * Construye un regex de palabra completa (\b…\b) que matchea cualquier
 * término de `terms` (escapado). Flags: `g` global, `i` insensible a
 * mayúsculas — preservamos el casing original del match vía grupo de captura.
 */
function buildJargonRegex(terms: string[]): RegExp {
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
}

const JARGON_RE = buildJargonRegex(JARGON);

/**
 * Tokeniza HTML en segmentos [tag-open | text | tag-close | comment | doctype]
 * sin usar DOMParser (más rápido y predecible para HTML parcial de Sanity).
 *
 * Reconoce:
 * - Tags abietos / cierre: `<code>`, `</pre>`, `<br/>`, etc.
 * - Comentarios: `<!-- … -->`
 * - Doctype: `<!DOCTYPE …>`
 */
function tokenizeHtml(html: string): Array<
  | { kind: 'tag'; content: string; tagName: string; isClose: boolean; isSelfClosing: boolean }
  | { kind: 'text'; content: string }
> {
  const tokens: Array<
    | { kind: 'tag'; content: string; tagName: string; isClose: boolean; isSelfClosing: boolean }
    | { kind: 'text'; content: string }
  > = [];
  const tagRe = /<!--[\s\S]*?-->|<!DOCTYPE[^>]+>|<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(html)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ kind: 'text', content: html.slice(lastIndex, match.index) });
    }
    const fullMatch = match[0];
    if (fullMatch.startsWith('<!--') || fullMatch.startsWith('<!DOCTYPE')) {
      // Comentario o doctype: tratar como tag con nombre vacío para no procesar texto dentro.
      tokens.push({ kind: 'tag', content: fullMatch, tagName: '', isClose: false, isSelfClosing: true });
    } else {
      const isClose = fullMatch.startsWith('</');
      const tagName = (match[1] ?? '').toLowerCase();
      const isSelfClosing = /\/\s*>$/.test(fullMatch);
      tokens.push({ kind: 'tag', content: fullMatch, tagName, isClose, isSelfClosing });
    }
    lastIndex = tagRe.lastIndex;
  }
  if (lastIndex < html.length) {
    tokens.push({ kind: 'text', content: html.slice(lastIndex) });
  }
  return tokens;
}

/**
 * Determina si un tag de apertura `tagName` abre una zona SKIP (código,
 * pre, anclas, scripts). Devuelve el nombre en lowercase o null.
 */
function shouldSkipOpenTag(tagName: string): string | null {
  return SKIP_TAGS.includes(tagName) ? tagName : null;
}

/**
 * Extrae el valor del atributo `lang="…"` de la lista de atributos de un
 * tag. Usado para detectar zonas ya envueltas y mantener idempotencia.
 */
function extractLangAttr(attrs: string): string | null {
  const m = attrs.match(LANG_ATTR_RE);
  return m ? m[1] : null;
}

@Pipe({ name: 'langTag', standalone: true, pure: true })
export class LangTagPipe implements PipeTransform {
  transform(html: string | null | undefined): string {
    if (!html) return '';
    const tokens = tokenizeHtml(html);
    let skipStack: string[] = [];
    let langWrapStack: string[] = [];
    let out = '';
    for (const tok of tokens) {
      if (tok.kind === 'tag') {
        out += tok.content;
        if (tok.tagName && !tok.isClose && !tok.isSelfClosing) {
          const skip = shouldSkipOpenTag(tok.tagName);
          if (skip) skipStack.push(skip);
          // Wrap tag con atributo lang (p.ej. <span lang="en">…</span>):
          // su contenido ya está marcado, lo saltamos para idempotencia.
          const langVal = extractLangAttr(tok.content);
          if (langVal) langWrapStack.push(langVal);
        } else if (tok.tagName && tok.isClose) {
          for (let i = skipStack.length - 1; i >= 0; i--) {
            if (skipStack[i] === tok.tagName) {
              skipStack.splice(i, 1);
              break;
            }
          }
          // Pop one entry from langWrapStack (LIFO).
          if (langWrapStack.length > 0) {
            langWrapStack.pop();
          }
        }
      } else {
        // text
        if (skipStack.length === 0 && langWrapStack.length === 0) {
          out += tok.content.replace(JARGON_RE, '<span lang="en">$1</span>');
        } else {
          out += tok.content;
        }
      }
    }
    return out;
  }
}
```

- [ ] **Step 4: Ejecutar el spec para verificar que pasa**

```bash
npm run test:ci -- --include='**/lang-tag.pipe.spec.ts'
```

Resultado esperado: PASS en los 7 `it`.

- [ ] **Step 5: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/shared/pipes/lang-tag.pipe.ts src/app/shared/pipes/lang-tag.pipe.spec.ts
> git commit -m "feat(a11y): LangTagPipe to wrap jargon in lang='en' spans (WCAG 3.1.2)"
> ```
> ¿Lo ejecuto? (La regla de `AGENTS.md` exige confirmación explícita.)

---

## Task 6 (F7-T4a): Marcar jerga en `es-ES.json` con `<span lang="en">`

> Cubre la mitad "estática" de WCAG 3.1.2: descripciones que viven en el i18n.
> Sin spec nuevo (es edición de strings; la verificación es manual con T7).

**Files:**
- Modify: `src/assets/i18n/es-ES.json`

- [ ] **Step 1: Editar `DESCRIPTION_CLARCAT`**

En `src/assets/i18n/es-ES.json` línea 55, reemplazar:

```json
"DESCRIPTION_CLARCAT": "Proyectos para empresas externas como Arcelor Mittal y La Liga como programador fullstack.",
```

por:

```json
"DESCRIPTION_CLARCAT": "Proyectos para empresas externas como Arcelor Mittal y La Liga como programador <span lang=\"en\">fullstack</span>.",
```

- [ ] **Step 2: Editar `DESCRIPTION_POSSIBLE`**

Línea 59, reemplazar:

```json
"DESCRIPTION_POSSIBLE": "Programador fullstack en multitud de proyectos internos y externos para empresas como LetsHealth, Esmerarte y NTTData.",
```

por:

```json
"DESCRIPTION_POSSIBLE": "Programador <span lang=\"en\">fullstack</span> en multitud de proyectos internos y externos para empresas como LetsHealth, Esmerarte y NTTData.",
```

- [ ] **Step 3: Editar `DESCRIPTION_BABE`**

Línea 69, reemplazar:

```json
"DESCRIPTION_BABE": "Sistema de gestión de rutas por carretera integrado con la API de HERE. Permite calcular trayectos optimizados teniendo en cuenta parámetros como peso y dimensiones del vehículo. Desarrollado con Angular y Django.",
```

por:

```json
"DESCRIPTION_BABE": "Sistema de gestión de rutas por carretera integrado con la <span lang=\"en\">API</span> de <span lang=\"en\">HERE</span>. Permite calcular trayectos optimizados teniendo en cuenta parámetros como peso y dimensiones del vehículo. Desarrollado con <span lang=\"en\">Angular</span> y <span lang=\"en\">Django</span>.",
```

- [ ] **Step 4: Editar `DESCRIPTION_DATALAIA`**

Línea 70, reemplazar:

```json
"DESCRIPTION_DATALAIA": "Plataforma de análisis de datos desarrollada para NTT Data. Combinando Angular y Django, permite visualizar grandes volúmenes de información mediante gráficas interactivas y dashboards personalizables.",
```

por:

```json
"DESCRIPTION_DATALAIA": "Plataforma de análisis de datos desarrollada para NTT Data. Combinando <span lang=\"en\">Angular</span> y <span lang=\"en\">Django</span>, permite visualizar grandes volúmenes de información mediante gráficas interactivas y <span lang=\"en\">dashboards</span> personalizables.",
```

- [ ] **Step 5: Editar `DESCRIPTION_HERMES`**

Línea 72, reemplazar:

```json
"DESCRIPTION_HERMES": "Aplicaciones internas de gestión logística ferroviaria desarrolladas para ArcelorMittal. Permite supervisar y planificar el transporte de materiales con funcionalidades avanzadas de control de flotas y comunicación entre ellas y otra web creada por una empresa externa a través de colas de RabbitMq.",
```

por:

```json
"DESCRIPTION_HERMES": "Aplicaciones internas de gestión logística ferroviaria desarrolladas para ArcelorMittal. Permite supervisar y planificar el transporte de materiales con funcionalidades avanzadas de control de flotas y comunicación entre ellas y otra web creada por una empresa externa a través de colas de <span lang=\"en\">RabbitMq</span>.",
```

- [ ] **Step 6: Editar `DESCRIPTION_LALIGA`**

Línea 73, reemplazar:

```json
"DESCRIPTION_LALIGA": "CRM y portal web para la gestión de datos comerciales y análisis del estado actual del paquete de fútbol contratado de negocios subscritos. Incluye visualización dinámica de métricas clave y segmentación de clientes.",
```

por:

```json
"DESCRIPTION_LALIGA": "<span lang=\"en\">CRM</span> y portal web para la gestión de datos comerciales y análisis del estado actual del paquete de fútbol contratado de negocios subscritos. Incluye visualización dinámica de métricas clave y segmentación de clientes.",
```

- [ ] **Step 7: Editar `DESCRIPTION_NOMACODA`**

Línea 58, reemplazar:

```json
"DESCRIPTION_NOMACODA": "Mantenimientos, gestión de proyectos con Notion y N8N y creación de proyectos tanto propios como colaboraciones B2B y B2C.",
```

por:

```json
"DESCRIPTION_NOMACODA": "Mantenimientos, gestión de proyectos con <span lang=\"en\">Notion</span> y <span lang=\"en\">N8N</span> y creación de proyectos tanto propios como colaboraciones <span lang=\"en\">B2B</span> y <span lang=\"en\">B2C</span>.",
```

- [ ] **Step 8: Editar `DESCRIPTION_PORTAL_CONVOCATORIAS`**

Línea 74, reemplazar:

```json
"DESCRIPTION_PORTAL_CONVOCATORIAS": "Aplicación web que funciona como biblioteca de ayudas y convocatorias españolas generada de forma automática utilizando Notion, N8N, agentes de OpenAi y Hugo.",
```

por:

```json
"DESCRIPTION_PORTAL_CONVOCATORIAS": "Aplicación web que funciona como biblioteca de ayudas y convocatorias españolas generada de forma automática utilizando <span lang=\"en\">Notion</span>, <span lang=\"en\">N8N</span>, agentes de <span lang=\"en\">OpenAi</span> y <span lang=\"en\">Hugo</span>.",
```

- [ ] **Step 9: Editar `FULLSTACK_DEVELOPER`**

Línea 64, reemplazar:

```json
"FULLSTACK_DEVELOPER": "Desarrollador fullstack",
```

por:

```json
"FULLSTACK_DEVELOPER": "Desarrollador <span lang=\"en\">fullstack</span>",
```

- [ ] **Step 10: Editar `N8N_WORKFLOW`**

Línea 110 (dentro del bloque EXPERIENCE), reemplazar:

```json
"N8N_WORKFLOW": "Flujos de N8N",
```

por:

```json
"N8N_WORKFLOW": "Flujos de <span lang=\"en\">N8N</span>",
```

- [ ] **Step 11: Validar JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/assets/i18n/es-ES.json', 'utf8')); console.log('OK')"
```

Resultado esperado: `OK`. Si falla, revisar el último string editado.

- [ ] **Step 12: Migrar `{{ description() | translate }}` en `project.component.html`**

Hallazgo de P0: `project.component.html:38` usa text interpolation, que escapa HTML y mostraría `<span lang="en">` como literal.

Abrir `src/app/features/projects/components/project/project.component.html`, línea 38, reemplazar:

```html
          {{ description() | translate }}
        </p>
```

por (moviendo `[innerHTML]` al atributo del `<p>` y self-closing):

```html
        <p
          class="description"
          [class.show]="showMoreInfo()"
          [id]="'project-desc-' + index()"
          [attr.aria-labelledby]="'project-title-' + index()"
          [innerHTML]="description() | translate"
        ></p>
```

(`[innerHTML]` no necesita escape manual; Translate pipe produce string sanitizable por Angular. **Importante:** si la migración se hiciera como simple reemplazo de `{{ … | translate }}` por `[innerHTML]="…"` **dentro** del `<p>`, el binding quedaría como textContent y Angular lo renderizaría literalmente como `[innerHTML]="…"` en pantalla, rompiendo la descripción. Hay que mover el binding al atributo del elemento.)

- [ ] **Step 13: Migrar `{{ e.designation | translate }}` y `{{ e.role | translate }}` en `experience.component.html`**

Hallazgo de P0: dos interpolaciones que escapan HTML.

Abrir `src/app/features/experience/components/experience.component.html`, líneas 28-29, reemplazar:

```html
              <p class="designation">{{ e.designation | translate }}</p>
              <span>{{ e.role | translate }}</span>
```

por:

```html
              <p class="designation" [innerHTML]="e.designation | translate"></p>
              <span [innerHTML]="e.role | translate"></span>
```

- [ ] **Step 14: Ejecutar specs afectados**

```bash
npm run test:ci -- --include='**/project.component.spec.ts' --include='**/experience.component.spec.ts'
```

Resultado esperado: PASS. Los specs existentes verifican contenido textual vía `textContent` o `querySelector('p').innerText`; si algún spec asume el formato escapado, ajustar el assertion a `.innerHTML` con la cadena con `<span>` esperada.

Si hay fallos, **NO** modificar el comportamiento — adaptar el spec al nuevo contrato (HTML sanitizado por Angular). Verificar caso por caso.

- [ ] **Step 14.5: Añadir spec de regresión para `project.component.html`**

> **Lección aprendida durante implementación 2026-08-06:** la primera versión de la migración de `project.component.html:38` puso `[innerHTML]` como textContent (no como atributo) porque la sustitución naive de `{{ … | translate }}` por `[innerHTML]="…"` dentro del `<p>` no mueve el binding. Angular renderizó literalmente `[innerHTML]="…"` en pantalla, rompiendo la descripción.
>
> Spec añadido al `describe('Accessibility', …)` de `project.component.spec.ts` (después del último `it` existente, antes del cierre del bloque) para prevenir regresiones de este tipo:

```typescript
    it('should render description as innerHTML (not literal text)', async () => {
      const translateService = TestBed.inject(TranslateService);
      await firstValueFrom(translateService.use('en'));
      fixture.componentRef.setInput('expandedIndex', 0);
      fixture.detectChanges();
      const desc = fixture.nativeElement.querySelector('p.description') as HTMLElement;
      expect(desc.innerHTML).toBe('My portfolio project');
      expect(desc.textContent).not.toContain('[innerHTML]');
    });
```

(`'My portfolio project'` es el valor literal del input `description` en el `beforeEach`; el `TranslatePipe` lo devuelve tal cual porque `mockTranslations` no define una key para él.)

- [ ] **Step 15: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/assets/i18n/es-ES.json src/app/features/projects/components/project/project.component.html src/app/features/experience/components/experience.component.html
> git commit -m "fix(a11y): mark technical jargon with lang='en' in es-ES + migrate render to innerHTML (WCAG 3.1.2)"
> ```
> ¿Lo ejecuto? (La regla de `AGENTS.md` exige confirmación explícita.)

---

## Task 7 (F7-T4b-2): Integrar `LangTagPipe` en `blog.component`

> Aplica el pipe al HTML del Portable Text antes de `bypassSecurityTrustHtml`.

**Files:**
- Modify: `src/app/features/blog/components/blog.component.ts` (líneas 136-141 y `imports`)

- [ ] **Step 1: Importar `LangTagPipe` y `inject`**

En `src/app/features/blog/components/blog.component.ts`, modificar el bloque de imports (líneas 1-23) para añadir:

```typescript
import { LangTagPipe } from '../../../shared/pipes/lang-tag.pipe';
```

- [ ] **Step 2: Registrar el pipe en `imports`**

Modificar el decorator `@Component` (líneas 25-39), en el array `imports`:

```typescript
imports: [
  CommonModule,
  TranslateModule,
  RouterModule,
  PostCardComponent,
  LoadingComponent,
  BlogFilterComponent,
  LangTagPipe
],
```

- [ ] **Step 3: Aplicar el pipe al HTML del Portable Text**

En el método `_processPost` (líneas 125-161), reemplazar las líneas 139-140:

```typescript
    const html = this._sanityService.portableTextToHtml(bodyContent);
    const safeHtml = this._sanitizer.bypassSecurityTrustHtml(html);
```

por:

```typescript
    const rawHtml = this._sanityService.portableTextToHtml(bodyContent);
    const tagged = new LangTagPipe().transform(rawHtml);
    const safeHtml = this._sanitizer.bypassSecurityTrustHtml(tagged);
```

(Usamos `new LangTagPipe()` directamente porque `_processPost` no es un
template binding — el pipe es `pure: true` y stateless, instanciarlo aquí
no introduce overhead.)

- [ ] **Step 4: Ejecutar todos los specs para verificar que no se rompe nada**

```bash
npm run test:ci -- --include='**/blog.component.spec.ts'
```

(Si `blog.component.spec.ts` no existe, omitir este paso y continuar.)

Resultado esperado: PASS — el cambio es interno a `_processPost`, no afecta a signals ni a la API pública del componente.

- [ ] **Step 5: Ejecutar todos los specs del proyecto**

```bash
npm run test:ci
```

Resultado esperado: 0 fallos, 0 specs pendientes. Los specs del `LangTagPipe` (T5) cubren el comportamiento unitario; este paso verifica que la integración no rompe nada.

- [ ] **Step 6: Verificación manual con la app corriendo**

```bash
npm start
```

En otra terminal:

```bash
npm run a11y:smoke
```

Resultado esperado: `a11y-report/*.json` sin violations nuevas. (El baseline de F6 debería estar en git history; comparar con `git show HEAD:a11y-report/` si existen reports previos.)

Si `a11y:smoke` no se ha ejecutado nunca (no hay baseline), verificar manualmente:
- Abrir `http://localhost:4200/blog/<cualquier-slug>` en Chrome DevTools.
- Inspeccionar el HTML del post: el contenido del post debe contener `<span lang="en">…</span>` alrededor de jerga técnica (si el post Sanity tiene términos como "Angular" o "Sanity").
- No deben aparecer `<span lang="en">` literales en pantalla.

- [ ] **Step 7: ASK**

> Siguiente paso del flujo sería:
> ```bash
> git add src/app/features/blog/components/blog.component.ts
> git commit -m "fix(a11y): apply LangTagPipe to blog Portable Text HTML (WCAG 3.1.2)"
> ```
> ¿Lo ejecuto? (La regla de `AGENTS.md` exige confirmación explícita.)

---

## Verificación global (post-tasks)

Después de completar T1–T7, ejecutar:

- [ ] **V1: Suite completa**

```bash
npm run test:ci
```

Resultado esperado: PASS en todos los specs.

- [ ] **V2: Build de producción**

```bash
npm run build:prod
```

Resultado esperado: build sin errores ni warnings nuevos.

- [ ] **V3: Smoke E2E (manual)**

```bash
npm start
```

En otra terminal:

```bash
npm run a11y:smoke
```

Resultado esperado: `a11y-report/*.json` sin violations críticas nuevas vs baseline. Si las hay, anotarlas como nuevo hallazgo en `docs/a11y-backlog.md` (sección F-XX).

- [ ] **V4: Inspección manual del cambio de idioma**

1. Abrir `http://localhost:4200/` con idioma `es-ES`.
2. Navegar a `/projects` y `/experience` — verificar que NO se ven `<span>` literales en pantalla.
3. Inspeccionar el DOM con DevTools — verificar que `<span lang="en">` aparece alrededor de la jerga técnica en los `<p>` de descripciones.
4. Cambiar idioma a `en-US` y repetir — no debe haber regresión visual.

- [ ] **V5: Diff de scope**

```bash
git diff --stat
```

Resultado esperado: exactamente 14 archivos listados en el mapa inicial (9 modificados + 3 nuevos + 2 specs creados = total 14 entradas; T7 toca `blog.component.ts` que ya está contado). Si hay archivos extra, revisarlos y justificar o revertir.

- [ ] **V6: ASK final**

> Siguiente paso del flujo sería crear un commit汇总 con todos los cambios:
> ```bash
> git add -A
> git commit -m "fix(a11y): F7 polish — target size, disabled focus outline, oscillator aria-hidden, lang spans (H18, H21, H25, 3.1.2)"
> git tag -a v1.5.0-a11y-f7 -m "F7 polish of deferred a11y findings"
> ```
> ¿Lo ejecuto? (La regla de `AGENTS.md` exige confirmación explícita.)

---

## Notas finales

- **Si T1 Step 2 da PASS sin tocar CSS:** las dimensiones reales ya cumplen 44×24. No es un problema — significa que la regla es estrictamente belt-and-suspenders. Continuar con Step 3 igual para dejar la garantía explícita en el código.
- **Si T2/T3 Step 2 da PASS:** revisar si existe una regla previa que ya establece el outline. Si la hay, omitir Step 3 y dejar solo el spec como red de seguridad. Si no, continuar.
- **Si T7 Step 6 revela literales `<span>` en pantalla:** volver a P0 (call sites) y migrar las plantillas afectadas a `[innerHTML]` con bypass manual.
- **Si `npm run a11y:smoke` introduce violations nuevas en V3:** documentar cada violation como hallazgo nuevo en `docs/a11y-backlog.md` antes de cerrar F7.
- **El plan produce 7 commits atómicos (uno por task) más un commit汇总 opcional en V6.** Cada commit se ejecuta solo tras confirmación explícita del usuario.
