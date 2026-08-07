# Backlog de Accesibilidad — Portfolio

**Fecha:** 2026-08-06
**Estado actual:** Fases F0–F7 completadas. Pendiente verificación manual V3 (a11y:smoke) y V4 (inspección de cambio de idioma).
**Documentos de referencia:**
- [`docs/superpowers/specs/2026-08-04-a11y-audit-design.md`](specs/2026-08-04-a11y-audit-design.md) — audit completo (32 hallazgos, 6 críticos resueltos en F1).
- [`docs/superpowers/plans/2026-08-04-a11y-improvements.md`](plans/2026-08-04-a11y-improvements.md) — plan ejecutado F0–F6.
- [`docs/superpowers/specs/2026-08-06-f7-polish-deferred-findings-design.md`](specs/2026-08-06-f7-polish-deferred-findings-design.md) — spec F7.
- [`docs/superpowers/plans/2026-08-06-f7-polish-deferred-findings.md`](plans/2026-08-06-f7-polish-deferred-findings.md) — plan F7.

> Este documento lista el trabajo de accesibilidad **que queda por hacer** para terminar
> de cubrir WCAG 2.2 Nivel AA, reforzar AA+ donde aplique, e institucionalizar los chequeos.
> Las fases son **independientes entre sí** (pueden atacarse en cualquier orden después de F6).

---

## Resumen de lo que aún falta

| # | Fase | Severidad | Esfuerzo | Bloquea conformidad AA |
|---|---|---|---|---|
| F7 | Polish de hallazgos diferidos del audit (H18, H21, H25 + 3.1.2) | Media | S | No (implementado; pendiente V3/V4) |
| F8 | Cobertura completa de criterios WCAG 2.2 nuevos (2.4.11, 2.5.7, 2.5.8, etc.) | Media | M | Parcial (2.5.8 es AA, no AAA) |
| F9 | Auditoría visual + Lighthouse + axe-core contra el bundle desplegado | Alta | M | No |
| F10 | Testing manual con lectores de pantalla (NVDA + VoiceOver) | Alta | M | No |
| F11 | CI/CD gates de accesibilidad (GitHub Actions / Husky) | Alta | M | No |
| F12 | Backend / contenido CMS: guía de a11y para editores en Sanity | Media | S | Parcial (1.1.1) |
| F13 | Performance & a11y: presupuestos, monitoreo, dashboards | Media | M | No |
| F14 | i18n parity audit + soporte RTL si se añaden idiomas RTL | Baja | M | No |

Leyenda esfuerzo: S = < 1 día; M = 1–3 días; L = > 3 días.

---

## F7 — Polish de hallazgos diferidos del audit ✅ IMPLEMENTADO (pendiente V3/V4)

**Origen:** ítems explícitamente diferidos en el self-review del plan original por
"requerir benchmarking visual fino o cambios estructurales".

**Estado 2026-08-06:**
- Implementación completa en working tree (`develop` branch).
- 4 hallazgos cerrados: H18, H21, H25, WCAG 3.1.2.
- 17 archivos tocados: 14 modificados + 3 nuevos.
- Tests: 350/350 PASS, build de producción OK.
- Spec compliance + code quality review: ✅ en las 7 tasks.
- **Pendiente:** V3 (`npm run a11y:smoke` con dev server) y V4 (inspección manual de cambio de idioma es↔en). El usuario hará ambas.

### F7-T1 — `H18`: Target size en `project.collapsed` ✅
**Archivo:** `src/app/features/projects/components/project/project.component.scss` (líneas 66-67) + spec
**Criterio:** WCAG 2.5.5 (Target Size, AA). Mínimo 24×24 CSS px.

**Implementación:**
- Añadido `min-height: 44px; min-width: 24px;` dentro de `.cover-img`.
- Spec añadido: `should cover-img button have at least 44×24 hit area when collapsed`.

### F7-T2 — `H21`: Foco visible en submit deshabilitado (contact-form) ✅
**Archivos:** `contact-form.component.scss` + `contact-form.component.spec.ts`
**Criterio:** WCAG 2.4.7 (Focus Appearance).

**Implementación:**
- Outline azul 2px sólido añadido **dentro** del bloque `&:disabled` (NO en un bloque separado `&:disabled:focus-visible` — ver nota técnica abajo).
- Spec añadido: `should show solid blue outline when disabled`.

**Nota técnica (2026-08-06):** El plan original proponía `&:disabled:focus-visible { outline: 2px solid …; }` como bloque separado. Esta regla resulta ser **dead code** en navegadores estándar (Chrome, Firefox, Safari): los botones `disabled` no son enfocables, así que `:focus-visible` nunca se cumple. El outline se movió al bloque `&:disabled` (sin focus) para que la regla se aplique visualmente. Esta decisión está documentada en el spec §3.2.

### F7-T3 — `H21`: Foco visible en submit deshabilitado (reviews-form) ✅
**Archivos:** `reviews-form.component.scss` + `reviews-form.component.spec.ts`
**Criterio:** WCAG 2.4.7.

**Implementación:** Idéntica a F7-T2. Spec y SCSS byte-equivalentes a F7-T2 excepto el path. Verificado que T2 y T3 son consistentes en cross-task review.

### F7-T4 — `H25`: Orden de foco del `<app-oscillator>` ✅
**Archivo:** `src/app/shared/components/oscillator/oscillator.component.ts` + nuevo spec
**Criterio:** WCAG 2.4.3 (Focus Order).

**Implementación:**
- Añadido `host: { '[attr.aria-hidden]': "'true'" }` al decorator de `OscillatorComponent`.
- Crea spec nuevo: `oscillator.component.spec.ts` con 2 tests (host aria-hidden + canvas no focuseable).
- Los call sites (`contact.component.html:32` y `home.component.html:37`) NO se tocaron — el atributo se propaga automáticamente.

### F7-T5 — Atributo `lang` dinámico (WCAG 3.1.2) ✅
**Archivos:** `src/assets/i18n/es-ES.json` (10 strings), `src/app/shared/pipes/lang-tag.pipe.ts` (nuevo), `src/app/shared/pipes/lang-tag.pipe.spec.ts` (nuevo), `src/app/features/blog/components/blog.component.ts`, `src/app/features/projects/components/project/project.component.html`, `src/app/features/experience/components/experience.component.html`
**Criterio:** WCAG 3.1.2 (Language of Parts).

**Implementación (3 componentes):**
1. **i18n estático:** 10 strings en `es-ES.json` envuelven jerga técnica con `<span lang="en">…</span>`.
2. **3 migraciones de template:** `{{ … | translate }}` → `[innerHTML]="… | translate"` para que las plantillas rendericen HTML. Sin esto, los `<span>` aparecerían literales.
3. **LangTagPipe (nuevo):** tokeniza HTML, envuelve jerga en bloques de texto (preserva contenido de `<code>`, `<pre>`, `<a>`; idempotente). Aplicado en `blog.component.ts` para el contenido Portable Text de Sanity.

**Nota técnica (2026-08-06):** La primera versión de la migración en `project.component.html:38` puso `[innerHTML]` como textContent (no como atributo) porque el simple reemplazo de `{{ … | translate }}` por `[innerHTML]="…"` dentro del `<p>` no mueve el binding. Angular renderizó literalmente `[innerHTML]="…"` en pantalla, rompiendo la descripción. El fix mueve el binding al atributo del `<p>` (con self-close `></p>`). Spec de regresión añadido en `project.component.spec.ts:387-396` para prevenir este bug. Lección documentada en el plan §Task 6 Step 14.5.

**Nota técnica (2026-08-06):** La instanciación de `LangTagPipe` en `blog.component.ts` usa `inject(LangTagPipe)` + `providers: [LangTagPipe]` (NO `new LangTagPipe()` ni `imports`). La pipe no se usa en el template, solo programáticamente, así que no debe estar en `imports`. Como bonus, se removió `SanityService` de `providers` (es `providedIn: 'root'`, redundante en component providers).

### Hallazgos / decisiones a registrar en próximas iteraciones

- **Dictionary divergence (informational):** El diccionario de `LangTagPipe` (20+ términos: Angular, Sanity, CMS, API, N8N, OpenAI, TypeScript, GraphQL, SaaS, etc.) es más amplio que el diccionario estático de i18n (14 términos: `OpenAi`, `RabbitMq`, etc.). Es deliberado: el pipe cubre contenido mixto de Sanity (potencialmente en inglés), el estático solo lo que aparece en `es-ES.json`. Si en el futuro se añaden cadenas i18n con `TypeScript`, `GraphQL`, etc., ampliar el diccionario del JSON siguiendo el mismo patrón.
- **Verificación manual V3/V4 (pendiente):** los tests automatizados no cubren axe-core contra bundle desplegado ni cambio de idioma en runtime. El usuario debe correr `npm run a11y:smoke` y abrir la app para verificar que no hay `<span>` literales en pantalla.

---

## F8 — WCAG 2.2 nuevos criterios completos

Los nuevos criterios introducidos en WCAG 2.2 que pueden no estar cubiertos con el trabajo actual:

### F8-T1 — 2.4.11 Focus Not Obscured (AA) — **NUEVO 2.2**
**Criterio:** Cuando un elemento recibe foco, no debe quedar completamente oculto
detrás de otro elemento (sticky headers, banners de cookies, modales).

- Auditoría específica: el `<header class="header">` es fixed con `z-index: 3`,
  y el sidebar usa `z-index: 3`. ¿Hay intersecciones visuales con elementos focuseables?
- Si en algún viewport el skip-link queda detrás del header al activarlo, ajustar z-index.

**Acceptance:**
- Manual: tabular; cuando un elemento recibe foco, verificar visualmente que no
  está cubierto por otro elemento.

### F8-T2 — 2.4.13 Focus Appearance (AAA) — opcional
Nivel AAA, no obligatorio para AA. Documentar y dejar consciente.

### F8-T3 — 2.5.7 Dragging Movements (AA) — **NUEVO 2.2**
**Criterio:** Toda acción que requiera drag debe tener alternativa accesible por teclado o un botón equivalente.

- Revisar `<app-oscillator>`, parallax, slide transitions. Si alguno requiere drag para
  funcionar, asegurar alternativa de tap o keyboard.
- Casi seguro no aplica (son decorativos), pero auditar.

**Acceptance:**
- Listado explícito de qué componentes exponen `pointer events: all` y verificación de
  cada uno.

### F8-T4 — 2.5.8 Target Size (Enhanced) (AA)
Nivel AA en 2.2, umbral **24×24** mínimo. Similar a F7-T1 pero auditoría global.

- Mapear todos los elementos interactivos:
  - Botones del sidebar (~3rem = 48px ✓)
  - Logos de certificados en home (`.cert-img`)
  - Iconos sociales (sidebar)
  - Star rating (button.star-btn)
  - Card completa de proyecto (puede colapsar a <24px)
  - Skip-link (posicion fixed, depende del texto, suele ser > 32px ✓)
- Para los que fallen, aplicar `min-width/min-height: 24px` o bien usar spacing adicional.
- WCAG 2.5.8 AAA sería 44×44; documentar el camino.

**Acceptance:**
- Spec helper: `getInteractiveElsBelowMinSize()` que itera el DOM y reporta.

### F8-T5 — 2.4.7 Focus Appearance mejorada (AA)
Ya implementado el anillo global. Verificar:

- Contraste del outline contra el fondo: `--focus-color: #005fcc` sobre `#0f3254` ≈ 4.5:1 ✓
- Grosor mínimo del indicador: 2px (sólo CSS box-shadow). 2.2 pide "al menos un cambio de
  área equivalente a un outline de 2px sólido". Confirmar.

**Acceptance:**
- Spec visual + manual con NVDA.

### F8-T6 — Verificación `prefers-contrast: more` real
Ya hay CSS para `@media (prefers-contrast: more)` pero no se ha probado en Windows
High Contrast Mode (forced colors). En modo forzado, los gradientes y backgrounds
semicumplen pueden quedar ilegibles.

- Auditar con `forced-colors: active` media query.
- Verificar que bordes, texto e iconos siguen siendo distinguibles.
- Posiblemente añadir fallback `border: 1px solid currentColor;` en elementos clave.

**Acceptance:**
- Manual: en Chrome DevTools → Rendering → "Emulate CSS forced-colors".
- Spec visual.

---

## F9 — Auditoría visual + Lighthouse contra el bundle desplegado

### F9-T1 — Lighthouse runs manuales sobre `/`, `/blog`, `/blog/:slug`, `/no-existe`
**Output esperado:** `lighthouse --output=json --output-path=...` por ruta.

- Capturar baseline.
- Auditar manual con la app desplegada en Netlify o local.
- Categorías críticas: Accessibility (target ≥95), Best Practices (≥90), Performance (≥80 mobile).

### F9-T2 — axe-core smoke sobre las 4 rutas
**Script:** `npm run a11y:smoke` (ya creado en F6-T2).

- Ejecutar contra `npm run build:prod && npm start` (en CI local).
- Crear archivo `a11y-report/<route>.json` por ruta.
- Comprobar que `summary.violations.length === 0` (o documentar excepciones legítimas).
- Si hay violations, añadirlas a este backlog como F-XX.

### F9-T3 — Core Web Vitals (LCP, INP, CLS, FCP, TTFB)
Configurar Web Vitals o `web-vitals` package en la app para reportar a consola
o enviar a analytics. Permite detectar regresiones reales en producción, no solo en CI.

**Implementación opcional:**
- En `app.component.ts` o un servicio dedicado, suscribirse a los eventos de Web Vitals.
- Loggear o enviar a endpoint de telemetría.

---

## F10 — Testing manual con lectores de pantalla

### F10-T1 — Pasar todas las rutas con NVDA + Firefox en Windows
- Test runner manual con checklist por ruta.
- Capturar problemas (etiquetas no anunciadas, orden inesperado, controles sin nombre).
- Documentar issues nuevos como hallazgo en este backlog.

### F10-T2 — Pasar todas las rutas con VoiceOver + Safari en macOS
Mismo checklist. VoiceOver tiene поведение diferente para landmarks y aria-live.

### F10-T3 — Accessibility Insights for Web (extensión de Chrome)
Ejecutar la extensión sobre cada ruta. Reporte automatic con 0 issues críticos = pass.

### F10-T4 — Keyboard-only pass completo (sin ratón)
- Tab por todos los elementos de cada ruta con foco visible.
- Verificar que el orden visual = orden DOM.
- Verificar activaciones con Enter/Space en todos los botones nativos.
- Escape en menús modales (lang-selector).

**Output esperado:** checklist firmado y issues nuevos añadidos al backlog.

---

## F11 — CI/CD gates de accesibilidad

### F11-T1 — Husky pre-commit + lint:a11y
Añadir script que corra sobre los archivos modificados:
```bash
"lint:a11y": "ng lint --type=html"
```
Y enlazarlo en `.husky/pre-commit`.

### F11-T2 — GitHub Actions: build + tests + a11y:smoke
Workflow `.github/workflows/a11y.yml`:
- `npm ci`
- `npm run test:ci`
- `npm run build:prod`
- Arrancar `npm start` en background, esperar, `npm run a11y:smoke`.
- Subir reporte como artifact.
- Bloquear merge si hay violations críticas.

### F11-T3 — axe-core en CI por componente (no solo smoke)
Configurar `jest-axe` style matcher también para los tests existentes,
actualmente es solo un test específico. Ideal: cada `*.spec.ts` con un componente
interactivo debería tener `expect(await axe(fixture.nativeElement)).toHaveNoViolations()`.

### F11-T4 — Lighthouse CI en GitHub Actions
- `@lhci/cli` con `lighthouserc.json`.
- Solo falla el pipeline si `accessibility` < 0.95.
- Opcional: budgets para performance (best-practices ≥ 0.9).

---

## F12 — CMS y contenido: guía de a11y para editores Sanity

### F12-T1 — Documento editorial para autores en Sanity Studio
- Cómo escribir alt text descriptivo para imágenes en `bodyES/bodyEN`.
- Cómo elegir jerarquía de headings (los bloques `h1` se degradan automáticamente a `<h2>`).
- Política de no usar texto solo en color (Sanity permite rich text).
- Política de descriptividad de links (no "click aquí").
- Cómo decidir si una imagen es decorativa (alt vacío).

### F12-T2 — Sanity Studio schema tweak
- Añadir `validation` al campo `image.alt`: mínimo 5 caracteres para imágenes informativas,
  permitir `alt=""` explícito para decorativas.
- Añadir warning si alt contiene solo el nombre del archivo ("image.png").

### F12-T3 — Quote de accesibilidad en el CMS README o CONTRIBUTING
Para cualquier collaborator que publique contenido.

---

## F13 — Performance & a11y: presupuestos y monitoreo

### F13-T1 — Definir performance budgets en `angular.json`
```jsonc
"budgets": [
  { "type": "initial", "maximumWarning": "350kb", "maximumError": "500kb" },
  { "type": "anyComponentStyle", "maximumWarning": "5kb", "maximumError": "6kb" }
]
```
(Ya existe algo similar. Verificar y ajustar si queremos más estricto.)

### F13-T2 — Dashboard de métricas
- Opción barata: exportar `lighthouse-report` desde CI y dejarlo como artifact descargable.
- Opción media: usar Lighthouse CI server con `lhci collect --url=...` y `lhci upload`.
- Opción cara: integrar con un APM como Datadog/Elastic para Core Web Vitals reales.

### F13-T3 — Tracking de regresiones
- Configurar alerts: si `accessibility` o `best-practices` bajan de X puntos en CI, bloquear.
- Tracking histórico en `lighthouse-stats.json`.

---

## F14 — i18n y soporte multilingüe

### F14-T1 — Auditoría de paridad i18n
- Iterar todas las claves en `es-ES.json` y `en-US.json`. Detectar claves que solo existen en uno.
- Herramienta simple: cargar ambos y restar sets de keys.

### F14-T2 — Carga lazy de archivos i18n por idioma
Actualmente se carga `es-ES.json` en bootstrap. Migrar a lazy per-route:
```typescript
loader: {
  provide: TranslateLoader,
  useFactory: (lang) => new TranslateHttpLoader(http, `./assets/i18n/${lang}/`, '.json'),
  deps: [HttpClient, LANG_TOKEN]
}
```

### F14-T3 — Soporte RTL si se añade árabe o hebreo
- Documentar cómo activar `dir="rtl"` en `<html>`.
- Auditar componentes que usan `flex-direction`, `margin-left` hardcoded, `transform: translateX(...)` que pueden romperse en RTL.
- Posiblemente usar Logical Properties (margin-inline-start, padding-inline-end).

### F14-T4 — Pseudo-localización en tests
Añadir `xx-XA` (pseudo-localización con acentos al final) en i18n para detectar
strings hardcoded en componentes.

---

## Cuando ejecutes una de estas fases

1. Crea un SPEC en `docs/superpowers/specs/YYYY-MM-DD-<fase>-design.md`.
2. Genera PLAN en `docs/superpowers/plans/YYYY-MM-DD-<fase>-implementation.md`
   siguiendo la skill `writing-plans` (TDD bite-sized, exact paths, complete code).
3. Tras aprobación, ejecuta con `executing-plans` o `subagent-driven-development`.
4. Si surgen nuevos hallazgos del audit, añádelos al SPEC de la fase (no a este backlog).

---

## Notas finales

- **Regla AGENTS.md (2026-08-06):** el usuario comitea manualmente. El agente no debe ejecutar `git add`/`commit`/`push` ni siquiera si el usuario responde "sí" a un ASK. Documentado en `AGENTS.md`.
- **F11-T3** (axe por componente en unit) compite con el coste de mantener esos tests;权衡 frente a un smoke más exhaustivo en CI.

Cuando vuelvas a atacar este backlog, decide por dónde empezar.
Recomendación por impacto/esfuerzo (post-F7):
1. **F9-T1** (Lighthouse baselines) — datos para decidir qué fases son realmente necesarias.
2. **F10-T1/F10-T2** (NVDA + VoiceOver) — descubre issues que axe no coge.
3. **F11-T2** (CI gate) — automatiza para no retroceder.
4. **F8** — polish + criterios 2.2 nuevos (2.4.11, 2.5.7, 2.5.8).
5. **F11-T1** (Husky pre-commit lint:a11y) — quick win, alta cobertura.

Fecha de última actualización: 2026-08-06.
