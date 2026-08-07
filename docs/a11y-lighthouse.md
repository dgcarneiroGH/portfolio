# Lighthouse Baseline — Guía de uso

**Fecha de creación:** 2026-08-07
**Origen:** F9-T1 del [`docs/a11y-backlog.md`](a11y-backlog.md).

Esta guía explica cómo capturar y leer el baseline de métricas Lighthouse del portfolio.

---

## Prerequisites

- Node ≥18 (viene con `npm`).
- Chrome estable instalado (Lighthouse usa Chrome del sistema).
- Al menos 1 GB de RAM libre durante el run (Chrome + Lighthouse).
- En Windows: **ver "Limitaciones conocidas" abajo** — chrome-launcher puede fallar con EPERM.

---

## Comandos

### Capturar baseline (manual, recomendado)

```bash
# Terminal A — arrancar el servidor estático
npm run build:prod
npm run serve:dist

# Terminal B — correr los 8 runs
npm run lh:baseline
```

El proceso tarda ~10–15 min en una laptop moderna. **8 runs**: 4 rutas × {mobile, desktop}.

### Capturar baseline (one-liner)

```bash
npm run build:prod && (npm run serve:dist &) && sleep 4 && npm run lh:baseline
```

(No usar en CI sin orquestador; los PIDs pueden quedar colgando en Windows.)

### Re-correr un solo run

```bash
# Solo mobile sobre /blog/otro-articulo
npx lighthouse http://localhost:4200/blog/otro-articulo \
  --form-factor=mobile \
  --output=html \
  --output-path=a11y-report/lighthouse/test \
  --only-categories=accessibility,best-practices,performance,seo \
  --chrome-flags="--headless=new --no-sandbox" \
  --quiet
```

### Tests del orquestador

```bash
npm run test:scripts
```

11 unit tests para las funciones puras principales (`slugify`, `pickScore`, `formatTable`). Los helpers (`colorize`, `getCommit`, `writeSummary`) se ejercitan indirectamente via T5 orchestration pero no tienen tests dedicados todavía.

---

## Thresholds (baseline informativo, no gate)

| Categoría | Umbral | Notas |
|---|---|---|
| Accessibility | ≥ 0.95 | WCAG AA estricto. |
| Best Practices | ≥ 0.90 | HTTPS, sin console errors, etc. |
| Performance (mobile) | ≥ 0.80 | Moto G4 throttling. |
| Performance (desktop) | ≥ 0.90 | Sin throttling. |
| SEO | = 1.0 (esperado) | Meta description, lang, etc. |

Si algún score cae **bajo el umbral**:
1. Abrir el HTML report correspondiente (`a11y-report/lighthouse/<form>-<slug>.report.html`).
2. Anotar el score en este documento como **baseline conocido**.
3. Abrir issue con tag `a11y-regression`. **No** hacer rollback sin investigar.

Si el score **mejora** sobre el baseline anterior, commitear el nuevo `latest-summary.json` directamente.

---

## Baseline inicial (F9-T1, commit `415805b`)

> ⚠️ **Baseline degradado**: 4/8 runs de mobile escribieron reports válidos en disco, pero el orquestador los marcó como `failed` por `EPERM` en `chrome-launcher` teardown (Windows-específico). Los scores de abajo vienen de los reportes en disco, **NO** del `latest-summary.json` que registra 0/8 OK. Esto se documenta en "Limitaciones conocidas".

| Ruta | Form | a11y | bp | perf | seo | Notas |
|---|---|---|---|---|---|---|
| / | mobile | 0.96 | 0.96 | 0.56 | 0.92 | Report JSON válido escrito en disco; orquestador marcó EPERM en teardown |
| /blog | mobile | 0.96 | 0.96 | 0.48 | 0.92 | Report JSON válido escrito en disco; orquestador marcó EPERM en teardown |
| /blog/otro-articulo | mobile | 0.96 | 0.96 | 0.44 | 0.92 | Report JSON válido escrito en disco; orquestador marcó EPERM en teardown |
| /no-existe | mobile | 0.96 | 0.96 | 0.47 | 0.92 | Report JSON válido escrito en disco; orquestador marcó EPERM en teardown |
| / | desktop | — | — | — | — | EPERM antes de escribir report |
| /blog | desktop | — | — | — | — | EPERM antes de escribir report |
| /blog/otro-articulo | desktop | — | — | — | — | EPERM antes de escribir report |
| /no-existe | desktop | — | — | — | — | EPERM antes de escribir report |

**Recomendación:** Re-correr el baseline en Linux/macOS para obtener 8/8 OK antes de usar este baseline como comparador en F11-T4.

---

## Interpretación de `latest-summary.json`

```json
{
  "timestamp": "2026-08-07T12:34:56.000Z",
  "commit": "abc1234",
  "baseUrl": "http://localhost:4200",
  "runs": [
    {
      "route": "/",
      "formFactor": "mobile",
      "scores": { "accessibility": 0.97, "best-practices": 0.92, "performance": 0.83, "seo": 1.0 },
      "status": "ok"
    }
  ]
}
```

- `commit` puede ser `null` si no estamos en un repo git.
- `status: 'failed'` indica que Lighthouse no pudo completar el run (timeout, error de Chrome, EPERM, etc.). Los scores vienen como `null`. Revisar `a11y-report/lighthouse/logs/<form>-<slug>.log`.
- En Windows + dev env actual: incluso runs con `status: 'failed'` pueden haber escrito el report JSON en disco antes del EPERM (mobile sí, desktop no). Esto es un **bug del orquestador** que lee `exit 1` como fallo total sin verificar la existencia del report. Mejora potencial: leer el report si existe aunque el exit code sea ≠ 0. Trade-off documented in plan F9-T1 §10.

---

## Limitaciones conocidas

### Windows + chrome-launcher EPERM (2026-08-07)

**Síntoma:** El run de Lighthouse escribe correctamente el HTML/JSON report en disco pero el orquestador recibe `exit 1` con stderr `EPERM, Permission denied` en `C:\Users\...\Temp\lighthouse.*` durante chrome-launcher teardown.

**Causa probable:** Race condition entre chrome-launcher cleanup y el antivirus/Windows Defender escaneando los archivos temp de Chrome. También documentado en issues de lighthouse.

**Workarounds:**
1. **Recomendado**: Correr el baseline en WSL2 o máquina Linux. Los scores serán válidos y reproducibles.
2. Alternativa: Añadir un delay entre runs en `runLighthouse` (e.g., `await sleep(2000)` antes de resolver).
3. Alternativa: Cambiar `chrome-flags` para usar `--user-data-dir=<path-no-antivirus>` (e.g., `D:\lighthouse-tmp\`).
4. Workaround temporal: aceptar el `latest-summary.json` degradado y re-correr cuando se disponga de entorno Linux.

### Solo desktop + mobile (Chrome)

Firefox/Safari Lighthouse están en beta; este baseline no los cubre.

### Bundle local

El bundle desplegado en Netlify puede diferir (CDN, compresión Brotli, etc.). Para auditar producción real → F11-T4 con `LIGHTHOUSE_BASE_URL=https://<netlify-url>`.

---

## Troubleshooting

- **`✗ No hay servidor en http://localhost:4200`** → arrancar `npm run serve:dist` en otra terminal (o usar la forma one-liner).
- **`✗ dist/portfolio/browser no existe`** → correr `npm run build:prod` primero.
- **`Lighthouse couldn't find a stable Chrome`** → cerrar instancias de Chrome abiertas. Lighthouse necesita arrancar la suya.
- **Un run marca `failed` con `timeout`** → red lenta o página muy pesada. Probar con `--only-form desktop` para reducir el set.
- **Un run marca `failed` con `EPERM` en teardown** → ver "Limitaciones conocidas" arriba.
