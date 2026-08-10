# Lighthouse Baseline — Guía de uso

**Fecha de creación:** 2026-08-07
**Origen:** F9-T1 del [`docs/a11y-backlog.md`](a11y-backlog.md).
**Spec / plan de referencia:**
[`docs/superpowers/specs/2026-08-07-f9-t1-lighthouse-baseline-design.md`](../superpowers/specs/2026-08-07-f9-t1-lighthouse-baseline-design.md),
[`docs/superpowers/plans/2026-08-07-f9-t1-lighthouse-baseline.md`](../superpowers/plans/2026-08-07-f9-t1-lighthouse-baseline.md).

Esta guía explica cómo capturar y leer el baseline de métricas Lighthouse del portfolio,
más los ajustes específicos de este proyecto (runner programático, threshold mobile,
lecciones aprendidas durante la captura del baseline inicial).

---

## Prerequisites

- Node ≥18 (incluye `npm`).
- Chrome estable instalado (Lighthouse usa Chrome del sistema).
- Al menos 1 GB de RAM libre durante el run (Chrome + Lighthouse).

---

## Comandos

### Capturar baseline (manual)

```bash
# Terminal A — arrancar el servidor estático
npm run build:prod
npm run serve:dist

# Terminal B — correr los 8 runs
npm run lh:baseline
```

El proceso tarda ~10–15 min en una laptop moderna.

### Re-correr un solo run (debug)

```bash
# Solo mobile sobre /blog/otro-articulo
node scripts/lh-runner.mjs \
  --url http://127.0.0.1:4200/blog/otro-articulo \
  --out a11y-report/lighthouse/debug \
  --form mobile
```

### Tests del orquestador

```bash
npm run test:scripts
```

11 unit tests sobre las funciones puras (`slugify`, `pickScore`, `formatTable`,
`colorize`, `writeSummary`). No requieren Chrome.

---

## Runner programático (lh-runner.mjs)

**Por qué existe.** Durante la captura del baseline inicial, los runs de **desktop**
fallaban consistentemente con `EPERM, Permission denied` al limpiar el temp dir
de `chrome-launcher` en `AppData\Local\Temp\lighthouse.*`. Causa raíz: bug en
`lighthouse@12.8.2` (`cli/run.js` líneas 217 y 235) — `launchedChrome?.kill()`
lanza EPERM que se convierte en unhandled rejection y mata el proceso Node antes
de que `saveResults()` escriba los reports.

**Solución adoptada.** Se sustituye `npx lighthouse` (CLI) por un runner
programático en `scripts/lh-runner.mjs` que:

1. Lanza Chrome directamente con `chrome-launcher`.
2. Pasa el puerto a `lighthouse(url, { port, ... })` (API programática).
3. Envuelve `chrome.kill()` en `try/catch` que traga el EPERM.
4. Escribe los reports `.report.json` y `.report.html` manualmente.

El orquestador (`lighthouse-baseline.mjs`) spawns `node scripts/lh-runner.mjs`
en lugar de `npx lighthouse`. **Mobile sigue funcionando con la CLI** porque
su ruta de error (línea 217) sí es capturada; **desktop requiere el runner**.

**Trade-off.** Tenemos una dep extra indirecta: `chrome-launcher` y `lighthouse`
expuestos a nuestro código (vs. solo CLI). Pero la alternativa era patchear
`node_modules/lighthouse/cli/run.js` localmente, lo cual es peor.

**Para CI futuro (F11-T4).** Si se quiere CI determinístico en Linux, el CLI
original funciona bien y se puede revertir el cambio. Documentado aquí para que
el lector no se sorprenda.

---

## Thresholds (baseline informativo, no gate)

| Categoría | Umbral | Notas |
|---|---|---|
| Accessibility | ≥ 0.95 | WCAG AA estricto. |
| Best Practices | ≥ 0.90 | HTTPS, sin console errors, etc. |
| Performance (mobile) | ≥ 0.80 | Moto G4 throttling. |
| Performance (desktop) | ≥ 0.90 | Sin throttling agresivo. |
| SEO | = 1.0 (esperado) | Meta description, lang, etc. |

Si algún score cae **bajo el umbral**:

1. Abrir el HTML report correspondiente (`a11y-report/lighthouse/<form>-<slug>.report.html`).
2. Anotar el score en este documento como **baseline conocido**.
3. Abrir issue con tag `a11y-regression`. **No** hacer rollback sin investigar.

Si el score **mejora** sobre el baseline anterior, commitear el nuevo `latest-summary.json`
directamente.

---

## Baseline inicial (F9-T1, commit `9043f21`)

**Fecha de captura:** 2026-08-07T11:35:59Z
**Entorno:** localhost (build de producción local servido por `http-server` con SPA fallback).
**Bundle:** `dist/portfolio/browser/` (Angular 21 production build).

| Ruta | Form | a11y | bp | perf | seo | Status |
|---|---|---|---|---|---|---|
| `/` | mobile | 0.96 | 0.93 | 0.52 | 1.00 | ok |
| `/` | desktop | 0.96 | 0.96 | 1.00 | 1.00 | ok |
| `/blog` | mobile | 0.96 | 0.93 | 0.53 | 1.00 | ok |
| `/blog` | desktop | 0.96 | 0.96 | 1.00 | 1.00 | ok |
| `/blog/otro-articulo` | mobile | 0.96 | 0.93 | 0.54 | 1.00 | ok |
| `/blog/otro-articulo` | desktop | 0.96 | 0.96 | 1.00 | 1.00 | ok |
| `/no-existe` | mobile | 0.96 | 0.93 | 0.54 | 1.00 | ok |
| `/no-existe` | desktop | 0.96 | 0.96 | 1.00 | 1.00 | ok |

### Análisis del baseline

**Cumplen thresholds:**

- ✅ **a11y**: 0.96 en todas las rutas ≥ 0.95 (F7 está dando sus frutos).
- ✅ **best-practices**: 0.93 mobile / 0.96 desktop ≥ 0.90.
- ✅ **perf desktop**: 1.00 en todas las rutas (sin throttling agresivo).
- ✅ **seo**: 1.00 en todas las rutas.

**Por debajo del threshold (baseline conocido):**

- ⚠️ **perf mobile**: 0.52–0.54 en las 4 rutas. Umbral era 0.80.

**Diagnóstico de perf mobile.** El bundle pesa ~130 kB (lazy chunks del blog
componente pesan 28–29 kB transfer). Con throttling Moto G4 simulado, el LCP/FCP
se resiente. Hipótesis a investigar en una fase futura:

1. Imágenes pesadas (Sanity image URLs sin `width/height` explícitos → CLS).
2. Carga innecesaria de chunks en rutas que no los necesitan.
3. Falta de preload/prefetch para chunks críticos.
4. Animaciones costosas del `<app-oscillator>` (requestAnimationFrame continuo).

**Decisión:** No se actúa en F9-T1 (es baseline informativo). Se registra como
baseline conocido y se considera para F13 (Performance & a11y budgets) o una fase
de optimización ad-hoc.

---

## Interpretación de `latest-summary.json`

```json
{
  "timestamp": "2026-08-07T11:35:59.202Z",
  "commit": "9043f21",
  "baseUrl": "http://localhost:4200",
  "runs": [
    {
      "route": "/",
      "formFactor": "mobile",
      "scores": { "accessibility": 0.96, "best-practices": 0.93, "performance": 0.52, "seo": 1.0 },
      "status": "ok"
    }
  ]
}
```

- `commit` puede ser `null` si no estamos en un repo git (no es nuestro caso).
- `status: 'failed'` indica que el runner no pudo completar el run. Los scores
  vienen como `null`. Revisar `a11y-report/lighthouse/logs/<form>-<slug>.log`.

---

## Limitaciones conocidas

- **Bundle local.** El bundle desplegado en Netlify puede diferir (CDN,
  compresión Brotli, etc.). Para auditar producción real → F11-T4 con
  `LIGHTHOUSE_BASE_URL=https://<netlify-url>`.
- **Solo desktop + mobile (Chrome).** Firefox/Safari Lighthouse están en beta.
- **No es CI gate.** Asserts duros viven en F11-T4. Este baseline es informativo.
- **Diferencia CLI vs programático.** El baseline se capturó con
  `scripts/lh-runner.mjs` (programático) por el bug de Windows descrito arriba.
  En Linux el CLI nativo funciona. Documentado en §"Runner programático".

---

## Troubleshooting

- **`✗ No hay servidor en http://localhost:4200`** → arrancar `npm run serve:dist`
  en otra terminal.
- **`✗ dist/portfolio/browser no existe`** → correr `npm run build:prod` primero.
- **`Lighthouse couldn't find a stable Chrome`** → cerrar instancias de Chrome
  abiertas. Lighthouse necesita arrancar la suya.
- **`EPERM ... lighthouse.XXXXX`** (CLI original, desktop en Windows) → bug conocido.
  Solución: usar el runner programático que ya viene configurado por defecto.
- **Un run marca `failed` con `timeout`** → red lenta o página muy pesada.
  Probar con `--only-form desktop` para reducir el set.

---

## Próximos pasos (out of scope de F9-T1)

- **F9-T2**: `npm run a11y:smoke` con axe-core contra las mismas 4 rutas (script
  ya existe).
- **F9-T3**: `web-vitals` en runtime para reportar CWV reales a producción.
- **F11-T2 / F11-T4**: Workflow CI que corra `lh:baseline` en cada PR y bloquee
  si a11y < 0.95 o si perf mobile baja >X puntos.
- **F13**: Performance budgets en `angular.json` + dashboard de métricas.