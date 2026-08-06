# Diseño — F7: Polish de hallazgos diferidos del audit

**Fecha:** 2026-08-06
**Fase del backlog:** F7 — Severidad Media, esfuerzo S (< 1 día).
**Spec previo:** `docs/superpowers/specs/2026-08-04-a11y-audit-design.md` (audit con 32 hallazgos, 6 críticos resueltos en F1).
**Plan previo:** `docs/superpowers/plans/2026-08-04-a11y-improvements.md` (F0–F6 ejecutados).
**Backlog:** `docs/a11y-backlog.md` (sección F7).

> Este documento cierra los 4 hallazgos abiertos del audit original que quedaron
> diferidos por "requerir benchmarking visual fino o cambios estructurales".
> No introduce infraestructura nueva (sin CI, sin dependencias nuevas) y
> mantiene los IDs públicos, landmarks y clases CSS ya testeados.

---

## 1. Goal

Cerrar los hallazgos **H18**, **H21**, **H25** y la cobertura parcial de **WCAG 3.1.2** (Language of Parts), todos ellos pendientes en el backlog tras la ejecución de F0–F6.

**Criterios WCAG cubiertos:**
- 2.5.5 Target Size (AA) — mínimo 24×24 CSS px.
- 2.5.8 Target Size Enhanced (AA, nuevo en 2.2) — mismo umbral.
- 2.4.7 Focus Appearance (AA).
- 2.4.3 Focus Order (A).
- 3.1.2 Language of Parts (AA).

**No-goals (explícitos):**
- Cobertura completa de WCAG 2.2 nuevos (F8).
- CI/CD gates (F11).
- Auditoría visual + Lighthouse + axe-core contra bundle desplegado (F9).
- Sanity CMS guide (F12).
- i18n lazy load o soporte RTL (F14).

---

## 2. Estado actual (referencia)

Archivos inspeccionados en 2026-08-06:

- `src/app/features/projects/components/project/project.component.scss:57-81` — `.cover-img` tiene `width: 100%; height: 9rem;` (sin `min-height`).
- `src/app/features/projects/components/project/project.component.html:9-26` — `<button class="cover-img">` colapsable, recibe foco, sin `min-height` que lo blinde ante cambios futuros.
- `src/app/features/contact/components/contact-form/contact-form.component.scss:146-151` — `.submit-btn:disabled` reduce contraste y elimina `box-shadow` de foco.
- `src/app/features/reviews/components/reviews-form/reviews-form.component.scss:233-238` — mismo patrón.
- `src/app/shared/components/oscillator/oscillator.component.ts:15-36` — host sin `aria-hidden`, canvas decorativo, `pointer-events: none`.
- `src/app/features/contact/components/contact.component.html:32` — `<app-oscillator style="bottom: 0">`.
- `src/app/features/home/components/home.component.html:37` — `<app-oscillator initialTargetId="nomacoda" style="top: 0">`.
- `src/assets/i18n/es-ES.json` — múltiples descripciones con jerga inglesa sin marcar (`Angular`, `Django`, `N8N`, `API`, `HERE`, `Notion`, `OpenAi`, `Hugo`, `fullstack`, `B2B`, `B2C`, `Sanity`).
- `src/app/features/blog/components/blog.component.ts` — Portable Text renderizado vía `@portabletext/to-html` con `[innerHTML]="post.body"`. Sin marcado de idioma.

---

## 3. Diseño por tarea

### 3.1 — F7-T1: Target size en `.cover-img` (H18)

**Archivos:**
- Modify: `src/app/features/projects/components/project/project.component.scss` (líneas 57-81).
- Modify: `src/app/features/projects/components/project/project.component.spec.ts` (nuevo `describe`/spec).

**Cambio SCSS.** Añadir al bloque `.cover-img` (antes del cierre):

```scss
min-height: 44px;
min-width: 24px;
```

**Justificación.** Las dimensiones actuales (`9rem` de alto, ancho `100%` de card ≥ `19rem` ≈ 304px) ya cumplen AA. La regla es belt-and-suspenders: blinda el target ante futuros refactors que reduzcan la card en breakpoints estrechos.

**Spec nuevo (TDD):**

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

**Notas sobre el spec.**
- El spec requiere un navegador real para que `getBoundingClientRect` devuelva dimensiones distintas de cero. El runner `test:ci` ya usa `ChromeHeadlessCI` (Chrome real headless), por lo que es compatible. Si en algún momento se cambia a JSDOM puro, este spec se sustituye por una verificación de los estilos computados (`getComputedStyle(...).minHeight === '44px'`).
- El estado colapsado se simula con `expandedIndex: null` (equivalente a `showMoreInfo() === false`, que es el caso por defecto del spec setup).

**Acceptance:**
- SCSS compila sin warnings.
- Spec pasa (dimensiones reales ya cumplen, pero el spec protege contra regresiones).

---

### 3.2 — F7-T2: Outline visible en submit deshabilitado (H21)

**Archivos:**
- Modify: `src/app/features/contact/components/contact-form/contact-form.component.scss` (líneas 146-151, dentro del bloque `.submit-btn`).
- Modify: `src/app/features/reviews/components/reviews-form/reviews-form.component.scss` (líneas 233-238).
- Modify: `src/app/features/contact/components/contact-form/contact-form.component.spec.ts` (nuevo spec).
- Modify: `src/app/features/reviews/components/reviews-form/reviews-form.component.spec.ts` (nuevo spec).

**Cambio SCSS (idéntico en ambos archivos).** Añadir tras el bloque `&:disabled { ... }`:

```scss
&:disabled:focus-visible {
  outline: 2px solid palette.$accent-blue;
  outline-offset: 2px;
}
```

**Justificación.** El estado `:disabled` no exige contraste WCAG, pero el indicador de foco global definido en `src/styles/styles.scss` usa un box-shadow que el estado disabled podría enmascarar visualmente al perder contraste de fondo. Añadir un `outline` sólido azul explícito garantiza un indicador distinguible en el caso remoto de que el botón disabled reciba foco (poco probable con flujo normal, pero legal con `:focus-visible` residual).

**Spec nuevo (uno por archivo):**

```typescript
describe('Disabled submit focus indicator (WCAG 2.4.7)', () => {
  it('shows solid blue outline when disabled and focused', () => {
    const btn = fixture.nativeElement.querySelector('.submit-btn') as HTMLButtonElement;
    btn.disabled = true;
    btn.dispatchEvent(new FocusEvent('focusin'));
    fixture.detectChanges();
    const style = window.getComputedStyle(btn);
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
  });
});
```

**Acceptance:**
- SCSS compila sin warnings.
- Spec pasa con `outlineStyle === 'solid'` y `outlineWidth === '2px'`.
- No afecta al estado normal (no-disabled) del botón.

---

### 3.3 — F7-T3: `aria-hidden="true"` en `<app-oscillator>` (H25)

**Archivos:**
- Modify: `src/app/shared/components/oscillator/oscillator.component.ts` (decorator `@Component`, líneas 15-36).
- New: `src/app/shared/components/oscillator/oscillator.component.spec.ts` (si no existe).

**Cambio TS.** En el decorator, añadir `host`:

```typescript
@Component({
  selector: 'app-oscillator',
  standalone: true,
  imports: [],
  template: `…`,
  styles: `…`,
  host: { '[attr.aria-hidden]': "'true'" }
})
```

**Justificación.** El componente ya tiene `pointer-events: none`, no expone descendientes focuseables y es decorativo. `aria-hidden="true"` aplicado al host vía `host: { '[attr.aria-hidden]': "'true'" }` (binding estático, valor literal) garantiza que cualquier descendiente futuro que accidentalmente reciba foco quede también oculto del árbol de accesibilidad.

No es necesario tocar `contact.component.html:32` ni `home.component.html:37` — el atributo se propaga desde el decorator. Por la misma razón, el spec se sitúa al nivel del componente fuente (`oscillator.component.spec.ts`) y no en los consumidores: probar el host donde se define el binding cubre implícitamente ambas instancias (`/`, `/contact`).

**Spec nuevo:**

```typescript
describe('OscillatorComponent', () => {
  it('decorates host with aria-hidden="true"', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('canvas descendant is not focusable', () => {
    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.tabIndex).toBe(-1);
    expect(canvas.getAttribute('tabindex')).toBeNull();
  });
});
```

**Acceptance:**
- Spec pasa.
- El atributo `aria-hidden="true"` aparece en el DOM en ambas instancias (`/`, `/contact`).

---

### 3.4 — F7-T4: Marcar jerga inglesa con `<span lang="en">` (3.1.2)

Dos sub-cambios:

#### 3.4.a — i18n estático (`es-ES.json`)

**Archivos:**
- Modify: `src/assets/i18n/es-ES.json` (valores de las claves listadas).

**Cadenas afectadas** (detectadas en grep del 2026-08-06):
- `DESCRIPTION_CLARCAT` — `fullstack`.
- `DESCRIPTION_POSSIBLE` — `fullstack`.
- `DESCRIPTION_BABE` — `Angular`, `Django`, `API`, `HERE`.
- `DESCRIPTION_DATALAIA` — `Angular`, `Django`.
- `DESCRIPTION_HERMES` — `RabbitMq`.
- `DESCRIPTION_LALIGA` — `CRM`.
- `DESCRIPTION_NOMACODA` — `Notion`, `N8N`, `B2B`, `B2C`.
- `DESCRIPTION_PORTAL_CONVOCATORIAS` — `Notion`, `N8N`, `OpenAi`, `Hugo`.
- `FULLSTACK_DEVELOPER` — `fullstack`.
- `N8N_WORKFLOW` — `N8N`.

**Estrategia.** Envolver cada aparición de los términos del diccionario cerrado (definido a continuación) en `<span lang="en">…</span>` para evitar falsos positivos.

**Diccionario cerrado para i18n estático:**

```text
Angular, Django, N8N, API, HERE, Notion, OpenAi, Hugo,
fullstack, B2B, B2C, Sanity, CRM, RabbitMq
```

**Fuera del alcance del marcado (no son jerga, son nombres propios):** `ArcelorMittal`, `La Liga`, `Orange`, `Bosch`, `LetsHealth`, `Esmerarte`, `NTTData`, `Lionbridge`, `Google`, `HERE` (este último sí entra — es nombre de producto SaaS, no solo topónimo). `RabbitMq` se incluye por ser tecnología; marcas como `ArcelorMittal` quedan como nombres propios sin marca de idioma.

```json
"Angular", "Django", "N8N", "API", "HERE", "Notion", "OpenAi", "Hugo",
"fullstack", "B2B", "B2C", "Sanity", "fullstack programmer"
```

**Ejemplo de transformación:**

Antes:
```json
"DESCRIPTION_BABE": "Sistema de gestión de rutas por carretera integrado con la API de HERE. Permite calcular trayectos optimizados teniendo en cuenta parámetros como peso y dimensiones del vehículo. Desarrollado con Angular y Django."
```

Después:
```json
"DESCRIPTION_BABE": "Sistema de gestión de rutas por carretera integrado con la <span lang=\"en\">API</span> de <span lang=\"en\">HERE</span>. Permite calcular trayectos optimizados teniendo en cuenta parámetros como peso y dimensiones del vehículo. Desarrollado con <span lang=\"en\">Angular</span> y <span lang=\"en\">Django</span>."
```

**Riesgo y mitigación.** Si una plantilla usa `{{ key | translate }}` (escape automático) en lugar de `[innerHTML]` para alguna de estas claves, las etiquetas `<span>` se mostrarán como texto literal. **Mitigación (paso del plan):** auditar todos los call sites de las claves afectadas y migrar de `{{ … | translate }}` a `[innerHTML]="… | translate"` donde sea necesario.

**Acceptance:**
- `es-ES.json` parsea correctamente (JSON válido).
- Render visual en `/projects` y `/experience` no muestra `<span>` literales.
- axe-core `valid-lang` (si se ejecuta en smoke) reporta 0 violations nuevas.

#### 3.4.b — Post-procesador para Portable Text del blog

**Archivos:**
- New: `src/app/shared/pipes/lang-tag.pipe.ts`.
- New: `src/app/shared/pipes/lang-tag.pipe.spec.ts`.
- Modify: `src/app/features/blog/components/blog.component.ts` — buscar el call site del `[innerHTML]` con `post.body` y aplicar el pipe.

**Implementación del pipe** (`pure: true`, sin estado):

```typescript
import { Pipe, PipeTransform } from '@angular/core';

**Diccionario cerrado para el pipe** (contenido mixto es/en desde Sanity, alcance más amplio que el i18n estático):

```typescript
const JARGON = [
  'Angular', 'Sanity', 'CMS', 'API', 'N8N', 'Notion', 'OpenAI',
  'Django', 'TypeScript', 'JavaScript', 'GraphQL', 'REST',
  'RabbitMQ', 'fullstack', 'frontend', 'backend', 'devops',
  'CRM', 'SaaS', 'SDK'
];
```

**Nota sobre la divergencia de diccionarios.** El pipe usa una lista más amplia porque el contenido Sanity puede llegar en inglés (autor escribe "I'm building with TypeScript and RabbitMQ"). El i18n estático usa una lista reducida porque está acotada a las cadenas que el grep del 2026-08-06 detectó efectivamente en `es-ES.json` — no aparecen términos como `TypeScript` o `GraphQL` en las descripciones en español. Si en el futuro se añaden cadenas con esos términos, se amplía el diccionario estático siguiendo el mismo patrón.

const SKIP_TAGS = ['code', 'pre', 'a', 'script', 'style'];

@Pipe({ name: 'langTag', standalone: true, pure: true })
export class LangTagPipe implements PipeTransform {
  transform(html: string | null | undefined): string {
    if (!html) return '';
    // 1. Split en segmentos: tag HTML | texto entre tags.
    // 2. Para cada segmento de texto, aplicar wrap sobre matches del diccionario.
    // 3. No tocar contenido dentro de <code>, <pre>, <a>, <script>, <style>.
    return wrapJargonInTextNodes(html, JARGON);
  }
}
```

**Algoritmo (resumen):** tokenizar el HTML en segmentos `[tag-open | text | tag-close]`, ignorar segmentos cuyo tag abierto pertenezca a `SKIP_TAGS`, y para los segmentos de texto aplicar `replace(/\b(Angular|Sanity|...)\b/g, '<span lang="en">$1</span>')`.

**Uso en blog:**

```html
<!-- Antes -->
<div class="blog-post__content" [innerHTML]="post.body"></div>

<!-- Después -->
<div class="blog-post__content" [innerHTML]="post.body | langTag"></div>
```

**Spec del pipe** (4 casos):

```typescript
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

  it('is idempotent (does not double-wrap existing spans)', () => {
    const input = '<span lang="en">Angular</span>';
    expect(pipe.transform(input)).toBe('<span lang="en">Angular</span>');
  });
});
```

**Acceptance:**
- Pipe es `pure: true` (recalcula solo si cambia el input).
- Los 4 specs pasan.
- Render en `/blog/:slug` muestra las etiquetas correctamente (no literales).

---

## 4. Mapa de archivos tocados

| Archivo | Acción | Tarea |
|---|---|---|
| `src/app/features/projects/components/project/project.component.scss` | Modificar | F7-T1 |
| `src/app/features/projects/components/project/project.component.spec.ts` | Modificar | F7-T1 |
| `src/app/features/contact/components/contact-form/contact-form.component.scss` | Modificar | F7-T2 |
| `src/app/features/contact/components/contact-form/contact-form.component.spec.ts` | Modificar | F7-T2 |
| `src/app/features/reviews/components/reviews-form/reviews-form.component.scss` | Modificar | F7-T2 |
| `src/app/features/reviews/components/reviews-form/reviews-form.component.spec.ts` | Modificar | F7-T2 |
| `src/app/shared/components/oscillator/oscillator.component.ts` | Modificar | F7-T3 |
| `src/app/shared/components/oscillator/oscillator.component.spec.ts` | Crear | F7-T3 |
| `src/assets/i18n/es-ES.json` | Modificar | F7-T4a |
| `src/app/features/projects/components/project/project.component.html` | Modificar | F7-T4a (migración a `[innerHTML]`) |
| `src/app/features/experience/components/experience.component.html` | Modificar | F7-T4a (migración a `[innerHTML]`) |
| `src/app/shared/pipes/lang-tag.pipe.ts` | Crear | F7-T4b |
| `src/app/shared/pipes/lang-tag.pipe.spec.ts` | Crear | F7-T4b |
| `src/app/features/blog/components/blog.component.ts` | Modificar | F7-T4b |

**Total:** 6 archivos modificados en F7-T1/T2/T3, 2 archivos i18n/pipes nuevos en F7-T4, 6 specs creados/modificados + 2 migraciones de plantilla.

---

## 5. Testing

**Pirámide aplicada:**
- **Unit (Karma/Jasmine)** — todo cambio con efecto DOM tiene un spec.
- **Smoke E2E** — verificación manual final con `npm run a11y:smoke` (no se añade a CI; queda para F11).

**Comandos de verificación:**

```bash
# Unit
npm run test:ci

# Smoke E2E (manual, requiere `npm start` en paralelo)
npm run a11y:smoke
```

**Criterio de "done":**
- `npm run test:ci` pasa con 0 fallos y 0 specs pendientes.
- `npm run a11y:smoke` no introduce violations nuevas vs baseline de F6 (revisar `a11y-report/*.json`).
- Inspección manual: cambiar idioma a `en-US` y volver a `es-ES`, verificar que no aparecen `<span>` literales en `/projects`, `/experience`, `/blog`.

---

## 6. Riesgos y mitigaciones

| # | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| R1 | Una plantilla usa `{{ key \| translate }}` (escape) en vez de `[innerHTML]` para alguna clave con `<span lang>` | Media | Paso explícito del plan: auditar call sites y migrar a `[innerHTML]` donde haga falta. Si no hay ninguno, no se requiere cambio en plantilla. |
| R2 | El post-procesador del blog rompe atributos HTML ya existentes | Baja | Regex que solo actúa sobre texto entre tags, ignorando `<code>`, `<pre>`, `<a>`, `<script>`, `<style>`. Spec dedicado al caso. |
| R3 | `aria-hidden` aplicado al host de `<app-oscillator>` oculta información que SÍ debería anunciarse (p.ej. si en el futuro se le da semántica) | Baja | Spec verifica que el canvas descendiente no es focuseable. Si en el futuro cambia el rol del componente, este spec falla y obliga a revisar. |
| R4 | El spec de `LangTagPipe` no cubre todos los casos del contenido real de Sanity | Baja | Specs cubren los 4 patrones más comunes. Si surge un caso real no cubierto, se añade al spec como test adicional antes del fix. |

---

## 7. Out of scope (explícito)

- F8 (WCAG 2.2 nuevos criterios completos).
- F9 (Lighthouse + axe-core smoke en CI).
- F10 (NVDA / VoiceOver manual testing).
- F11 (CI/CD gates).
- F12 (Sanity editorial guide).
- F13 (performance budgets).
- F14 (i18n parity audit, lazy load, RTL).
- Refactor del submit / focus traps existentes.
- Cambios en la paleta de contraste (F1-T6 ya los aplicó).

---

## 8. Acceptance global

F7 se considera completa cuando:

1. Los 6 specs nuevos/modificados (listados en §4) pasan en `npm run test:ci`.
2. El spec del `LangTagPipe` cubre los 4 casos acordados.
3. La verificación manual con `npm run a11y:smoke` no introduce violations nuevas vs baseline.
4. Cambio de idioma `es-ES ↔ en-US` no muestra etiquetas `<span>` literales en `/`, `/projects`, `/experience`, `/blog`.
5. `git diff` muestra exactamente los 14 archivos listados en §4 (verificación de scope).
