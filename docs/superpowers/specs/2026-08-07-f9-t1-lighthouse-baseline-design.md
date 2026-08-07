# F9-T1 — Lighthouse Baselines

**Fecha:** 2026-08-07
**Estado:** Diseño aprobado (pendiente de revisión por el usuario antes de planificar).
**Documentos relacionados:**
- [`docs/a11y-backlog.md`](../../a11y-backlog.md) — backlog que origina esta tarea (F9-T1).
- [`docs/superpowers/specs/2026-08-06-f7-polish-deferred-findings-design.md`](../2026-08-06-f7-polish-deferred-findings-design.md) — fase previa, ya completada en código.

---

## 1. Contexto y motivación

El portfolio ya pasó las fases F0–F7 del plan de accesibilidad (auditoría, implementación
de hallazgos críticos y polish de hallazgos diferidos). Falta información cuantitativa
para decidir qué fases posteriores son realmente necesarias y para detectar regresiones
futuras. Esta tarea captura un **baseline reproducible** de métricas Lighthouse sobre el
bundle de producción local.

El baseline sirve para:

1. **Priorizar fases siguientes** (F8 nuevos criterios WCAG 2.2, F10 screen readers): si a11y
   ya está en ≥0.97 en todas las rutas, F8 puede enfocarse solo en los criterios nuevos que
   sabemos que faltan; si perf mobile está en 0.65, hay perf work antes que a11y polish.
2. **Detectar regresiones** en PRs futuros cuando se integre F11-T4 (Lighthouse en GitHub
   Actions). El JSON de baseline se compara con cada nuevo run.
3. **Documentar el estado de salida** de F0–F7 ante el usuario y ante futuros mantenedores.

---

## 2. Objetivos y no-objetivos

### Objetivos

- Capturar métricas Lighthouse reproducibles (a11y, best-practices, performance, SEO) sobre
  el bundle de producción local.
- Generar artefactos (JSON + HTML por run, summary JSON agregable a git) aptos para
  comparación histórica.
- Proveer un comando único que un humano o un script pueda correr sin decisiones intermedias.
- Documentar umbrales y procedimiento de interpretación.

### No-objetivos (explícitos)

- **No** son asserts duros: el script siempre exit 0 si completa. Fallar el pipeline por
  métricas vive en F11-T4.
- **No** es integración con GitHub Actions (→ F11-T4).
- **No** captura Core Web Vitals en producción real con `web-vitals` (→ F9-T3).
- **No** es axe-core smoke paralelo (→ F9-T2, ya tiene script `npm run a11y:smoke`).
- **No** es Lighthouse sobre la URL de Netlify desplegada. Esto se puede añadir en F11-T4
  reusando el mismo script con otra `BASE_URL`.

---

## 3. Arquitectura y archivos

### Archivos nuevos

| Path | Propósito |
|---|---|
| `scripts/lighthouse-baseline.mjs` | Orquestador Node ESM. Itera la matriz rutas × form factors y dispara Lighthouse CLI. Imprime tabla resumen y escribe `latest-summary.json`. |
| `scripts/lighthouse-baseline.spec.mjs` | Tests unitarios del orquestador (slugify, pickScore, formatTable). |
| `scripts/__fixtures__/lighthouse-sample.json` | Fixture de un run real de Lighthouse (categorías + audits). Usado por los unit tests. |
| `scripts/serve-dist.mjs` | Wrapper mínimo sobre `http-server` con SPA fallback (`-P "http://localhost:4200?"`) para que rutas como `/blog/otro-articulo` y `/no-existe` resuelvan a `index.html`. |
| `a11y-report/lighthouse/.gitignore` | `*` (artefactos generados). Excepción documentada inline para `!latest-summary.json`. |
| `docs/a11y-lighthouse.md` | Guía para el usuario: prerequisites, comandos, thresholds, interpretación. |
| `docs/superpowers/specs/2026-08-07-f9-t1-lighthouse-baseline-design.md` | Este documento. |

### Archivos modificados

- **`package.json`**:
  - DevDep: `"lighthouse": "^12.0.0"`.
  - DevDep opcional: `"http-server": "^14.1.1"` (usado por `serve-dist.mjs`).
  - Scripts:
    - `"serve:dist": "node scripts/serve-dist.mjs"`
    - `"lh:baseline": "node scripts/lighthouse-baseline.mjs"`
    - `"test:scripts": "node --test scripts/**/*.spec.mjs"`

### Lo que no se toca

- `angular.json`, componentes, servicios, i18n, tests unitarios existentes.
- Scripts previos (`scripts/a11y-smoke.mjs`, etc.).
- Configuración de CI (no hay CI todavía; → F11-T2 / F11-T4).
- `dist/portfolio/` (generado).

---

## 4. Comportamiento del script

### 4.1 Configuración (constantes top-of-file en `lighthouse-baseline.mjs`)

```js
const BASE_URL = process.env.LIGHTHOUSE_BASE_URL ?? 'http://localhost:4200';
const ROUTES = ['/', '/blog', '/blog/otro-articulo', '/no-existe'];
const FORM_FACTORS = ['mobile', 'desktop'];
const OUTPUT_DIR = 'a11y-report/lighthouse';
const LOGS_DIR = `${OUTPUT_DIR}/logs`;
const RUN_TIMEOUT_MS = 120_000;
const PROBE_TIMEOUT_MS = 3_000;
```

`LIGHTHOUSE_BASE_URL` se respeta para permitir futuro uso contra Netlify sin tocar el script.

### 4.2 Flujo

1. **Probe del servidor**: `fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) })`.
   Si falla → exit 1 con mensaje accionable.
2. **Crear directorios** `OUTPUT_DIR` y `LOGS_DIR` si no existen.
3. **Para cada combinación** `(route, formFactor)`:
   1. Calcular `slug = slugify(route)`.
   2. `spawn('npx', ['lighthouse', url, flags...], { timeout: RUN_TIMEOUT_MS })` con flags:
      - `--output=json`
      - `--output=html`
      - `--output-path=${OUTPUT_DIR}/${formFactor}-${slug}` (sin extensión; Lighthouse añade `.report.json` y `.report.html`)
      - `--form-factor=${formFactor}`
      - `--only-categories=accessibility,best-practices,performance,seo`
      - `--chrome-flags="--headless=new --no-sandbox --disable-gpu"`
      - `--quiet`
      - `--max-wait-for-load=45000`
   3. Capturar stdout/stderr a `${LOGS_DIR}/${formFactor}-${slug}.log`.
   4. Parsear el JSON generado para extraer `categories.<name>.score`.
   5. Si `exit code !== 0` → marcar `failed: true`, score `null`. Continuar con el siguiente.
4. **Resumen**: imprimir tabla ASCII con columnas `route | form | a11y | bp | perf | seo | status`.
5. **Persistir**: escribir `${OUTPUT_DIR}/latest-summary.json` con:
   ```jsonc
   {
     "timestamp": "2026-08-07T12:34:56Z",
     "commit": "<short hash de git rev-parse --short HEAD>",
     "baseUrl": "http://localhost:4200",
     "runs": [
       { "route": "/", "formFactor": "mobile", "scores": { "accessibility": 0.97, ... }, "status": "ok" },
       ...
     ]
   }
   ```
6. **Exit code**: siempre 0 si al menos un run individual completó. Si **todos** fallan → exit 1.

### 4.3 Funciones puras (testeables)

```js
// Reglas:
//   '/' → 'home'
//   Cualquier otra ruta: reemplazar '/' por '-' y recortar '-' inicial/final.
//   No colapsa guiones repetidos (no es necesario para nuestras rutas).
slugify(route)

// Lee json.categories.<cat>.score. Devuelve null si la categoría no existe
// (defensivo ante runs fallidos o categorías deshabilitadas).
pickScore(json, cat)

// Renderiza tabla ASCII con header + filas. Solo formato, sin colores.
formatTable(runs)

// Escribe latest-summary.json con timestamp + commit + runs.
writeSummary(filePath, runs, meta)
```

Ejemplos de `slugify`:
- `slugify('/')` → `'home'`
- `slugify('/blog')` → `'blog'`
- `slugify('/blog/otro-articulo')` → `'blog-otro-articulo'`
- `slugify('/no-existe')` → `'no-existe'`
- `slugify('/blog/category/some-post')` → `'blog-category-some-post'`

### 4.4 CLI args opcionales

| Flag | Efecto |
|---|---|
| `--only <route-substring>` | Filtra runs a rutas que contengan el substring. |
| `--only-form <mobile\|desktop>` | Filtra a un único form factor. |
| `--verbose` | Imprime logs de Lighthouse en stdout además del archivo. |
| `--no-color` | Fuerza salida sin ANSI. |

Defaults razonables para que `node scripts/lighthouse-baseline.mjs` sin args funcione.

---

## 5. Manejo de errores

| Caso | Detección | Comportamiento |
|---|---|---|
| Servidor no levantado | Probe falla | Exit 1 + mensaje: `"No hay servidor en {BASE_URL}. Ejecuta 'npm run serve:dist' en otra terminal."` |
| `dist/portfolio/browser/` no existe | `serve-dist.mjs` lo detecta al arrancar | Exit 1 + mensaje: `"Run 'npm run build:prod' primero."` |
| Lighthouse CLI no instalado | `spawn('npx', ...)` con `ENOENT` | Exit 1 + mensaje apuntando a `npm i`. |
| Fallo de Chrome (puerto ocupado, flags inválidos) | exit code !== 0 de un run individual | Marcar run como `failed`, continuar. |
| Timeout de un run (>120 s) | `child_process.spawn` timeout | `kill('SIGTERM')`, marcar `failed`. |
| Todos los runs fallan | Contador al final | Exit 1. |
| `/no-existe` devuelve 404 real del servidor | Lighthouse reporta `runtimeError` con `code: NO_DOCUMENT_RESPONSE` | Marcado `failed`. Si se repite, ajustar SPA fallback en `serve-dist.mjs`. |

---

## 6. UX del CLI

- **Colores ANSI** en la tabla: verde ≥0.95, amarillo 0.80–0.94, rojo <0.80. Auto-desactivados si `!process.stdout.isTTY`.
- **Progreso por run**: `[3/8] mobile /blog/otro-articulo ... ✓ a11y=0.97`. Escrito con `process.stdout.write` + `\r` para actualización en sitio.
- **Logs de Lighthouse** redirigidos a `${LOGS_DIR}/<form>-<slug>.log`. Solo se imprimen con `--verbose`.
- **Hint final**: imprime el comando exacto para re-correr un run individual, útil para iterar:
  ```
  ℹ Re-run: npx lighthouse http://localhost:4200/blog/otro-articulo --form-factor=mobile ...
  ```
- **Tabla resumen**: ancho fijo, alineado a la derecha, separadores con `-` y `|`. Renderizada con `formatTable()` puro (testeable).

---

## 7. Testing

### 7.1 Unit (Node test runner, sin Chrome)

Archivo `scripts/lighthouse-baseline.spec.mjs`. Se ejecuta con `node --test scripts/lighthouse-baseline.spec.mjs`
(separado de Karma/Jasmine; el proyecto no tiene Karma configurado para `.mjs` y modificar
`karma.conf.js` para soportar ESM en `scripts/` es complejidad no justificada para 8 tests
de funciones puras).

Casos:

- `T1`: `slugify('/')` → `'home'`.
- `T2`: `slugify('/blog/otro-articulo')` → `'blog-otro-articulo'`.
- `T3`: `slugify('/no-existe')` → `'no-existe'`.
- `T4`: `slugify('/blog/category/some-post')` → `'blog-category-some-post'` (defensivo).
- `T5`: `pickScore({categories:{accessibility:{score:0.97}}}, 'accessibility')` → `0.97`.
- `T6`: `pickScore({categories:{}}, 'accessibility')` → `null` (defensivo ante runs parciales).
- `T7`: `formatTable([])` devuelve header sin filas.
- `T8`: `formatTable([{...}])` devuelve tabla con header + 1 fila, columnas alineadas.

Fixture `scripts/__fixtures__/lighthouse-sample.json` se copia de un run real capturado
durante el desarrollo del plan (no se fetcha en tiempo de test). El plan incluye los valores
mínimos necesarios (categorías con scores plausibles) para que los tests no dependan de
generar runs reales.

Script en `package.json`:
- `"test:scripts": "node --test scripts/**/*.spec.mjs"`

### 7.2 Integration (manual, documentado)

Procedimiento en `docs/a11y-lighthouse.md`:

1. `npm run build:prod`.
2. Terminal A: `npm run serve:dist`.
3. Terminal B: `npm run lh:baseline`.
4. Verificar:
   - 8 archivos `*.report.json` y 8 `*.report.html` en `a11y-report/lighthouse/` raíz (sin
     contar `latest-summary.json` ni el subdirectorio `logs/`).
   - `latest-summary.json` con 8 entradas + `timestamp` + `commit`.
   - Tabla impresa con scores plausibles (no `0` ni `1` exactos salvo a11y/SEO).
   - Si algún score cae bajo threshold, anotarlo en `docs/a11y-lighthouse.md` como baseline
     conocido (no es blocker; el script exit 0 de todas formas).

### 7.3 Lo que NO se testea

- El `spawn` real contra Lighthouse (depende de Chrome del sistema). Cobertura manual.
- El form factor mobile vs desktop rendering (lo testea Lighthouse internamente).
- La generación real de HTML report (lo testea Lighthouse internamente).

---

## 8. Criterios de aceptación

- **AC-1**: `npm run lh:baseline` con servidor levantado completa los 8 runs en ≤15 min en una
  máquina típica (laptop moderna con Chrome estable; mobile con throttling es ~75–90 s por
  run, desktop ~40–60 s; chrome-launcher añade ~5 s de overhead por run).
- **AC-2**: El script parsea cada JSON generado por Lighthouse sin lanzar excepciones.
  Cuando el parseo tiene éxito, extrae los 4 scores (`accessibility`, `best-practices`,
  `performance`, `seo`). Cuando el run falla (exit code ≠ 0), marca `status: 'failed'` y
  deja los scores como `null`.
- **AC-3**: `latest-summary.json` tiene exactamente 8 entradas + `timestamp` ISO + `commit`
  (short hash, puede ser `null` si no es un repo git).
- **AC-4**: `npm run test:ci` (Karma) pasa verde con los 350 tests existentes. `npm run test:scripts`
  (Node `--test`) pasa verde con los 8 tests nuevos. Ambos se invocan durante la fase de
  verificación del plan de implementación.
- **AC-5**: `a11y-report/lighthouse/*.json` y `*.html` están gitignored. `latest-summary.json`
  está commiteado como baseline histórico inicial.
- **AC-6**: `docs/a11y-lighthouse.md` documenta:
  - Prerequisites (Chrome estable, Node ≥18).
  - Comandos exactos (build + serve + lh).
  - Thresholds: a11y ≥0.95, best-practices ≥0.90, performance ≥0.80 mobile / ≥0.90 desktop, seo = 1.0 esperado.
  - Cómo interpretar el summary.
  - Política ante regresión: abrir issue con tag `a11y-regression`, no rollback.
- **AC-7**: Si el usuario corre `npm run lh:baseline` sin servidor, recibe mensaje accionable
  y exit 1.
- **AC-8**: El primer commit de F9-T1 incluye `latest-summary.json` con los scores reales del
  baseline. Este JSON es la "foto" inicial contra la que se comparan runs futuros.

---

## 9. Out of scope (diferido a fases posteriores)

- Asserts duros / presupuesto fallido en CI (→ F11-T4).
- Histórico de baselines con comparación `Δ vs main` (→ F11-T4).
- Tests de regresión visual con Playwright (→ F9-T3 o más adelante).
- Lighthouse en GitHub Actions (→ F11-T4).
- `web-vitals` en runtime para reportar CWV reales a producción (→ F9-T3).
- Lighthouse contra la URL de Netlify (→ F11-T4, usando misma base con `LIGHTHOUSE_BASE_URL`).
- Soporte para múltiples navegadores (Firefox/Safari Lighthouse aún en beta).

---

## 10. Decisiones registradas

- **2026-08-07**: Se elige **Lighthouse CLI + script de orquestación** (A) sobre `@lhci/cli`
  (B) porque el objetivo es baseline informativo, no CI gate. Migración a `lhci` queda
  abierta para F11-T4, reutilizando `latest-summary.json` como histórico.
- **2026-08-07**: Se elige **CLI via `npx` + `spawn`** sobre **API programática + `chrome-launcher`**
  para evitar 2 deps extra y mantener el script legible. El trade-off (dependencia implícita
  en `npx` y `lighthouse` global resolvable) es aceptable porque `npx` viene con Node ≥18.
- **2026-08-07**: Slug fijo para `/blog/:slug` es **`otro-articulo`** (proporcionado por el
  usuario). El script no implementa auto-descubrimiento; si en el futuro los slugs cambian,
  el usuario edita la constante `ROUTES` o exporta `LIGHTHOUSE_BLOG_SLUG`.
- **2026-08-07**: SPA fallback en `serve-dist.mjs` se implementa con `http-server -P` (proxy
  fallback a `index.html`). No usamos `npx serve --single` porque `http-server` ya es una
  dep común y `-P` es la forma estándar de SPA fallback.