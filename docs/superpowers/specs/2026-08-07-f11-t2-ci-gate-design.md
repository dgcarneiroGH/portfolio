# F11-T2 — CI Gate de Accesibilidad (GitHub Actions)

**Fecha:** 2026-08-07
**Estado:** Diseño.
**Origen:** F11-T2 de [`docs/a11y-backlog.md`](../../a11y-backlog.md).
**Documentos relacionados:**
- [`docs/superpowers/specs/2026-08-07-f9-t1-lighthouse-baseline-design.md`](../specs/2026-08-07-f9-t1-lighthouse-baseline-design.md) — infraestructura Lighthouse.
- [`docs/a11y-lighthouse.md`](../../a11y-lighthouse.md) — guía de uso del baseline.
- [`docs/a11y-backlog.md`](../../a11y-backlog.md) §F11-T2 — entrada original del backlog.

---

## 1. Contexto y motivación

Tenemos infraestructura local madura (`a11y:smoke`, `lh:baseline`, scripts npm,
documentación) pero ningún gate automatizado en CI. Sin CI gate, un PR puede
romper accesibilidad o introducir una regresión de performance sin que nadie lo
note hasta que el usuario lo reporta. Esta tarea pone un GitHub Actions workflow
que corre los tests + auditoría en cada PR a `develop`/`main` y bloquea el
merge si hay regresiones.

**Beneficios directos:**
1. **Prevención de regresiones**: bloquea el PR si axe-core reporta violations nuevas.
2. **Visibilidad temprana**: cada PR muestra el delta de Lighthouse vs `latest-summary.json`.
3. **Documentación ejecutable**: `.github/workflows/a11y.yml` es la fuente de verdad de "qué pasa antes de mergear".
4. **Habilita F11-T4**: cuando se quiera migrar a `@lhci/cli` con asserts duros, el workflow ya existe como punto de entrada.

---

## 2. Objetivos y no-objetivos

### Objetivos

- Workflow que corre en cada PR y push a `develop`/`main`.
- Ejecuta la suite completa de auditoría (tests + axe-core + Lighthouse).
- Bloquea el merge si:
  - Algún test de Karma falla.
  - axe-core reporta violations (`a11y:smoke` exit code 1).
  - Algún score de Lighthouse cae bajo threshold.
- Sube artefactos (`a11y-report/`, `latest-summary.json`) descargables desde la UI de GitHub.
- Documenta cómo activarlo como required check en branch protection.

### No-objetivos (explícitos)

- **No** se sustituye `a11y:smoke` o `lh:baseline` por `@lhci/cli` o `jest-axe` per-componente (→ F11-T3, F11-T4).
- **No** se despliega automáticamente (CD sin gate humano sigue siendo manual).
- **No** se hacen asserts duros en runtime de producción con `web-vitals` (→ F9-T3).
- **No** se reemplaza Husky pre-commit (`lint:a11y`, → F11-T1).
- **No** se documenta cómo crear secrets de GitHub en este SPEC; se asume repo público o secretos gestionados por la org.

---

## 3. Diseño

### 3.1 Archivo único: `.github/workflows/a11y.yml`

Un solo workflow, una sola línea de defensa. Si el usuario quiere separar tests y auditoría en dos jobs paralelos más adelante, se puede refactorizar; por ahora secuencial es más simple y menos propenso a errores de orden.

### 3.2 Triggers

```yaml
on:
  push:
    branches: [develop]
  pull_request:
    branches: [develop, main]
  workflow_dispatch:
```

- `push` a `develop`: actualiza el baseline "vivo" (sube `latest-summary.json` actualizado como artifact).
- `pull_request` a `develop`/`main`: bloquea el merge si falla.
- `workflow_dispatch`: trigger manual para debug.

### 3.3 Concurrencia

```yaml
concurrency:
  group: a11y-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true
```

Si llegan 2 commits a la misma PR consecutivamente, cancela el primero y corre solo el último. Ahorra minutos de CI.

### 3.4 Jobs

#### Job 1: `test`

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm run test:ci
```

Solo Karma tests. Sin browser complejo, rápido.

#### Job 2: `audit`

```yaml
audit:
  needs: test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm run build:prod
    - name: Start static server (background)
      run: |
        nohup npm run serve:dist > server.log 2>&1 &
        echo $! > server.pid
        for i in {1..30}; do
          if curl -sf http://127.0.0.1:4200/ > /dev/null; then
            echo "Server up"
            break
          fi
          sleep 1
        done
        if ! curl -sf http://127.0.0.1:4200/ > /dev/null; then
          echo "Server failed to start"
          cat server.log
          exit 1
        fi
    - name: Run axe-core smoke
      run: npm run a11y:smoke
    - name: Run Lighthouse baseline
      run: npm run lh:baseline
    - name: Enforce Lighthouse thresholds
      run: node scripts/lh-check.mjs
    - name: Upload a11y-report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: a11y-report
        path: a11y-report/
        retention-days: 14
    - name: Stop server
      if: always()
      run: kill $(cat server.pid) 2>/dev/null || true
```

**Decisión: usar `lh-check.mjs` (script nuevo, no inline `node -e`).**

Por qué:
- Inline `node -e "..."` en YAML es difícil de leer y mantener.
- Si el threshold cambia, hay que editar YAML (toca PR).
- Un script dedicado en `scripts/` es versionable y testeable.

**Script nuevo `scripts/lh-check.mjs`** (≤ 60 líneas):
- Lee `a11y-report/lighthouse/latest-summary.json`.
- Compara cada score contra umbrales en constantes top-of-file.
- Exit 0 si todo OK, exit 1 si algún score cae bajo umbral + imprime tabla con deltas vs `main`.
- Tiene tests unitarios (`scripts/lh-check.spec.mjs`) con fixture JSON.

### 3.5 Thresholds

Definidos como constantes en `scripts/lh-check.mjs` (no en YAML para evitar duplicación):

```js
const THRESHOLDS = {
  accessibility: 0.95,
  'best-practices': 0.90,
  performance: { mobile: 0.50, desktop: 0.90 },  // baseline mobile = 0.52, deja margen de 0.02
  seo: 0.90,
};
```

**Justificación del threshold mobile perf (0.50):**
- Baseline actual: 0.52–0.54 en 4 rutas.
- Margen de 0.02–0.04 para detectar regresiones sin flakiness.
- Si el usuario quiere subir el threshold más adelante (objetivo 0.80), edita una constante, no el YAML.

### 3.6 Artefactos

- `a11y-report/`: incluye tanto axe-core (`a11y-report_*.json`) como Lighthouse (`a11y-report/lighthouse/`).
- `retention-days: 14`: suficiente para comparar PRs consecutivos.
- Subido con `if: always()` para que se vea incluso en runs fallidos.

### 3.7 Branch protection (documentación, no en este SPEC)

El workflow aparece como check `audit` en PRs a `develop`/`main`. El usuario debe ir a GitHub Settings → Branches → Branch protection rules y marcarlo como required. Documentado en `docs/a11y-ci.md`.

---

## 4. Archivos

### Nuevos

| Path | Propósito |
|---|---|
| `.github/workflows/a11y.yml` | Workflow GitHub Actions. |
| `scripts/lh-check.mjs` | Valida umbrales de Lighthouse contra `latest-summary.json`. |
| `scripts/lh-check.spec.mjs` | Tests unitarios de `lh-check.mjs` (umbral pass/fail, formato de output). |
| `scripts/__fixtures__/lh-summary-ok.json` | Fixture con todos los scores por encima del umbral. |
| `scripts/__fixtures__/lh-summary-fail.json` | Fixture con un score bajo umbral. |
| `docs/a11y-ci.md` | Guía para el usuario: cómo activar branch protection, interpretar artefactos, ajustar thresholds. |
| `docs/superpowers/specs/2026-08-07-f11-t2-ci-gate-design.md` | Este documento. |

### Modificados

- `package.json` — añadir `"test:scripts"` (ya existe) + `"lh:check": "node scripts/lh-check.mjs"` (nuevo).

### No se tocan

- `scripts/lighthouse-baseline.mjs` (corre igual en CI).
- `scripts/lh-runner.mjs` (corre igual en CI; el bug EPERM es solo en Windows, los runners son Linux).
- Specs/tests existentes.

---

## 5. Testing

### Unit (Node `--test`)

`scripts/lh-check.spec.mjs` con 6 tests:

1. `T1`: summary con todos los scores OK → exit 0 (vía función pura).
2. `T2`: summary con accessibility 0.94 → marca violation.
3. `T3`: summary con perf mobile 0.45 → marca violation.
4. `T4`: summary con perf desktop 0.85 → marca violation.
5. `T5`: tabla de output formatea correctamente los deltas vs `main`.
6. `T6`: missing `latest-summary.json` → error claro (no silent pass).

### Integración (manual, documentada)

`docs/a11y-ci.md` incluye checklist:

1. Push branch a GitHub.
2. Verificar que el workflow aparece en la pestaña Actions.
3. Esperar a que termine (~15 min).
4. Si falla, descargar artefacto `a11y-report`, abrir el `.report.html` correspondiente.
5. Si pasa, verificar que el check aparece como verde en la PR.

### Lo que NO se testea localmente

- El workflow YAML no se puede validar completamente sin GitHub Actions.
- `actionlint` (linter de workflows) se puede instalar localmente pero añade una dep que no compensa.
- Documentamos los pasos de validación manual en `docs/a11y-ci.md`.

---

## 6. Criterios de aceptación

- **AC-1**: el workflow se dispara en push a `develop` y en PR a `develop`/`main`.
- **AC-2**: el workflow pasa verde en este PR (sin cambios que rompan thresholds).
- **AC-3**: si se baja `accessibility` a 0.94 en `latest-summary.json` manualmente, el workflow falla con mensaje claro indicando qué score falló.
- **AC-4**: si `a11y:smoke` falla, el workflow falla (axe-core propagado).
- **AC-5**: los artefactos `a11y-report/` están disponibles en la UI de GitHub con `retention-days: 14`.
- **AC-6**: `docs/a11y-ci.md` documenta cómo activar branch protection.
- **AC-7**: 6 tests unitarios de `lh-check` pasan.

---

## 7. Out of scope (diferido)

- **`@lhci/cli` con asserts duros** (F11-T4).
- **`jest-axe` per-componente** (F11-T3, mencionado en backlog como权衡 frente a este gate).
- **Web Vitals en runtime** (F9-T3).
- **Husky pre-commit `lint:a11y`** (F11-T1).
- **CD / auto-deploy tras merge** (no en backlog).
- **Matrix strategy con varios Node versions** (overkill para este repo personal).

---

## 8. Decisiones registradas

- **2026-08-07**: Se elige **un solo workflow + un script de threshold check** (`lh-check.mjs`) sobre la alternativa de "inline `node -e` en YAML" porque el script es testeable y versionable. Si los thresholds cambian, se edita una constante.
- **2026-08-07**: Se elige **`ubuntu-latest`** sobre `windows-latest` para CI. Razón: el bug EPERM del CLI de Lighthouse solo afecta a Windows desktop. En Linux el CLI funciona (es solo el `lrunner.mjs` el que es para Windows). CIs son ~5x más rápidas en Linux. Documentado en `docs/a11y-lighthouse.md`.
- **2026-08-07**: Threshold **perf mobile = 0.50** (baseline 0.52). Margen 0.02 es tight pero realista: cualquier regresión >2pp en mobile perf se considera blocker. Cuando se arregle perf mobile en F13, se sube este threshold.
- **2026-08-07**: **Secuencial** (test → audit) en lugar de paralelo. Razón: el coste extra de mantener orden es ~30s vs. el riesgo de debuggear fallos donde audit corrió sin build. Si en el futuro el audit pasa a ser el cuello de botella, se paraleliza.
- **2026-08-07**: **`if: always()` en upload-artifact** para que los runs fallidos también dejen artefacto descargable. Esto es estándar para artefactos de diagnóstico.

---

## 9. Riesgos y mitigaciones

| # | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| R1 | Lighthouse CI es flaky (network, throttling) | Media | `continue-on-error: true` no aplicado — preferimos falsos positivos a falsos negativos. Si el flakiness es alto, se re-ejecuta el job desde la UI. |
| R2 | `lh-check.mjs` pasa silenciosamente si falta `latest-summary.json` | Baja | T6 explícito: missing file → error claro. |
| R3 | El workflow asume Chrome en ubuntu-latest | Baja | `ubuntu-latest` viene con Chrome pre-instalado. Si falla, se añade `browser-actions/setup-chrome`. |
| R4 | Branch protection no se activa automáticamente | Baja | Documentado en `docs/a11y-ci.md` (acción manual del usuario). |
| R5 | El umbral `perf mobile = 0.50` es demasiado tight | Media | Constante en `lh-check.mjs`, fácil de subir si el baseline mejora. Documentado en este SPEC §3.5. |

---

## 10. Acceptance global

F11-T2 se considera completa cuando:

1. El workflow existe en `.github/workflows/a11y.yml` y se dispara correctamente.
2. `scripts/lh-check.mjs` y sus 6 tests pasan.
3. El workflow pasa verde en este PR (verificación manual vía push a branch de prueba).
4. `docs/a11y-ci.md` está escrito y cubre activación de branch protection.
5. `docs/a11y-backlog.md` §F11-T2 actualizado a ✅.

---

**Próximo paso tras aprobación:** crear `docs/superpowers/plans/2026-08-07-f11-t2-ci-gate.md` con el plan TDD bite-sized, ejecutar.