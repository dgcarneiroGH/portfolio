# CI Gate de Accesibilidad — Guía de uso

**Fecha de creación:** 2026-08-07
**Origen:** F11-T2 del [`docs/a11y-backlog.md`](a11y-backlog.md).
**Spec de referencia:**
[`docs/superpowers/specs/2026-08-07-f11-t2-ci-gate-design.md`](../superpowers/specs/2026-08-07-f11-t2-ci-gate-design.md).

Este workflow automatiza la auditoría de accesibilidad en cada PR a `develop` /
`main` y bloquea el merge si hay regresiones de axe-core o de Lighthouse.

---

## Qué hace el workflow

**Triggers:**
- Push a `develop`.
- Pull request a `develop` o `main`.
- Trigger manual desde la pestaña Actions (`workflow_dispatch`).

**Jobs:**

| Job | Qué corre | Tiempo típico |
|---|---|---|
| `test` | `npm run test:ci` (Karma, 351 tests) + `npm run test:scripts` (Node, 23 tests) | ~3 min |
| `audit` | `npm run build:prod` + `serve:dist` + `a11y:smoke` (axe-core) + `lh:baseline` (Lighthouse 8 runs) + `lh:check` (thresholds) | ~12 min |

**Concurrencia:** si hay 2 commits consecutivos en la misma PR, el primero se cancela.

**Artefactos:** `a11y-report/` (incluye reports de axe-core + Lighthouse) disponible durante 14 días desde la UI de GitHub Actions, incluso en runs fallidos.

---

## Activación como required check (branch protection)

El workflow se ejecuta automáticamente en cada PR, pero **no bloquea el merge**
hasta que lo marques como required check. Esto es acción manual del usuario:

1. Ir a **GitHub → Settings → Branches → Branch protection rules**.
2. Seleccionar **Add rule** (o editar la existente) para `develop` (repetir para `main` si quieres).
3. Marcar **"Require status checks to pass before merging"**.
4. Buscar y añadir el check `audit` (aparece en PRs una vez que el workflow ha corrido al menos una vez).
5. Guardar.

> Si el check `audit` no aparece en el buscador, necesitas abrir una PR primero
> para que GitHub lo descubra. Después, vuelve a Branch protection.

---

## Thresholds configurados

Definidos en `scripts/lh-check.mjs` (constante `THRESHOLDS`):

| Categoría | Threshold | Justificación |
|---|---|---|
| `accessibility` | ≥ 0.95 | Baseline actual 0.96; deja 0.01 de margen. |
| `best-practices` | ≥ 0.90 | Baseline 0.93 mobile / 0.96 desktop. |
| `performance` (mobile) | ≥ 0.50 | Baseline 0.52–0.54. Margen tight (0.02–0.04) para detectar regresiones reales. Subir cuando F13 arregle perf mobile. |
| `performance` (desktop) | ≥ 0.90 | Baseline 1.00. |
| `seo` | ≥ 0.90 | Baseline 1.00. |

Para ajustar un threshold: editar la constante en `scripts/lh-check.mjs` y abrir
un PR. Los tests unitarios `scripts/lh-check.spec.mjs` se actualizan si cambias
los valores numéricos que aparecen en fixtures.

---

## Cómo interpretar un fallo

### Paso 1: leer el log del step que falló

En la pestaña del run fallido, expandir el step:

| Step fallido | Qué mirar |
|---|---|
| `Run Karma tests` | Output de Jasmine/Karma. Localizar el `FAILED` test. |
| `Run script tests` | Output de `node --test`. Localizar el `✖`. |
| `Build production bundle` | Output de Angular CLI. Buscar `ERROR` o `TS`. |
| `Start static server` | Verificar que `dist/portfolio/browser/` existe (si no, falta `build:prod`). |
| `Run axe-core smoke` | Output de axe-core. Cada violation tiene `id` (regla WCAG) y `description`. |
| `Run Lighthouse baseline` | Logs en `a11y-report/lighthouse/logs/<form>-<slug>.log`. |
| `Enforce Lighthouse thresholds` | Tabla con la violation (`route`, `form`, `category`, `actual`, `threshold`). |

### Paso 2: descargar el artefacto

`a11y-report-<número-o-sha>` contiene:

- `a11y-report/lighthouse/<form>-<slug>.report.html` — Lighthouse visual.
- `a11y-report/lighthouse/<form>-<slug>.report.json` — datos raw.
- `a11y-report/lighthouse/latest-summary.json` — resumen comparativo.
- `a11y-report_<route>.json` — axe-core por ruta.

### Paso 3: si es axe-core violation

`a11y-report_blog.json` (por ejemplo) tiene un array `violations` con:

```json
{
  "id": "color-contrast",
  "impact": "serious",
  "description": "...",
  "helpUrl": "https://dequeuniversity.com/rules/axe/4.7/color-contrast",
  "nodes": [{ "target": ["..."], "failureSummary": "..." }]
}
```

Localizar el componente responsable (probablemente un SCSS con color nuevo sin
verificar contraste). Aplicar fix + añadir regression test.

### Paso 4: si es Lighthouse threshold

La tabla indica qué score cayó bajo el umbral:

```
/     | mobile | accessibility | 0.94   | 0.95
```

Abrir el report HTML correspondiente para ver qué audits pesan en esa
categoría. Por ejemplo, `accessibility` puede bajar por `color-contrast`,
`image-alt`, `label`, etc.

---

## Diferencias con F9-T1 local

El workflow **no** usa `scripts/lh-runner.mjs`. En CI (Linux) el CLI nativo de
Lighthouse funciona bien. El runner programático es solo necesario en Windows
desktop por el bug EPERM de chrome-launcher cleanup.

Si necesitas ejecutarlo en CI con Windows, añade un `if: runner.os == 'windows'`
` antes del step de Lighthouse y cambia `npx lighthouse` por
`node scripts/lh-runner.mjs --url ... --out ... --form ...` por run.

---

## Limitaciones conocidas

- **No hay matrix multi-Node.** Solo Node 20. Si el repo crece a múltiples
  versiones soportadas, añadir `matrix: { node: [18, 20, 22] }`.
- **No hay `actionlint`** instalado localmente. La sintaxis del YAML se valida
  cuando GitHub Actions lo carga; un error de sintaxis aparecerá como "Invalid
  workflow file" en la pestaña Actions.
- **El threshold perf mobile (0.50) es tight.** Cualquier fluctuación >2pp
  bloquea. Si es muy flaky, subirlo temporalmente en `scripts/lh-check.mjs`.
- **El artefacto pesa ~10–20 MB** (8 reports HTML + JSON). Aceptable para
  GitHub free; en planes con límite de storage, reducir `retention-days`.

---

## Próximos pasos (out of scope de F11-T2)

- **F11-T3**: `jest-axe` per-componente (mayor cobertura, más tests).
- **F11-T4**: migrar a `@lhci/cli` con asserts duros declarativos en `lighthouserc.json` y comparar contra `main` automáticamente.
- **F11-T1**: Husky pre-commit con `lint:a11y` (corre en segundos antes de push).
- **F13**: performance budgets en `angular.json` para detectar regresiones de bundle size antes de Lighthouse.