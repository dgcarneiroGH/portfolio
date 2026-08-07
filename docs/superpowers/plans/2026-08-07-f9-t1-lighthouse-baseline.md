# F9-T1 — Lighthouse Baselines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capturar métricas Lighthouse reproducibles (a11y, best-practices, performance, SEO) sobre el bundle de producción local del portfolio, generando artefactos JSON/HTML por run y un `latest-summary.json` agregable a git como baseline histórico.

**Architecture:** Scripts Node ESM en `scripts/` orquestando la CLI de Lighthouse. Funciones puras (`slugify`, `pickScore`, `formatTable`, `writeSummary`) testeadas con `node --test`. Orquestación principal (probe, spawn, ANSI) en el mismo archivo. Servidor estático separado (`serve-dist.mjs`) con SPA fallback vía `http-server -P`.

**Tech Stack:** Node ≥18 (ESM, `node:test`), Lighthouse 12 (CLI), http-server 14 (SPA fallback), Karma + Jasmine (ya existente para Angular; este plan no los toca).

**Spec de referencia:** `docs/superpowers/specs/2026-08-07-f9-t1-lighthouse-baseline-design.md`.

**Reglas de operación heredadas de `AGENTS.md`:**
- **Nunca** ejecutar `git add`, `git commit`, `git push`, `git tag` ni ninguna operación que modifique el historial del repositorio. Cada task termina con un paso **COMMIT (manual)** que muestra el comando exacto como referencia; el usuario lo ejecuta.
- `npm install` SÍ puede ser ejecutado por el agente (no es una git operation).
- Las dependencias nuevas se confirman con `npm install --save-dev <pkg>`; el usuario decide si acepta cambios en `package.json`/`package-lock.json`.

---

## Mapa de archivos tocados

| Archivo | Acción | Task |
|---|---|---|
| `package.json` | Modificar (devDeps + 3 scripts) | T1, T2 |
| `scripts/__fixtures__/lighthouse-sample.json` | Crear | T3 |
| `scripts/lighthouse-baseline.spec.mjs` | Crear | T4 |
| `scripts/lighthouse-baseline.mjs` | Crear (iterativo: pure → orchestration) | T4, T5 |
| `scripts/serve-dist.mjs` | Crear | T6 |
| `a11y-report/lighthouse/.gitignore` | Crear | T7 |
| `a11y-report/lighthouse/latest-summary.json` | Crear (artefacto de T8) | T8 |
| `docs/a11y-lighthouse.md` | Crear | T9 |

**Total:** 1 archivo modificado, 7 archivos nuevos.

---

## Task 1 (F9-T1-T1): Instalar devDeps

**Files:**
- Modify: `package.json` (devDependencies)
- Create: `package-lock.json` modification (via `npm install`)

- [ ] **Step 1: Instalar `lighthouse` y `http-server` como devDependencies**

```bash
npm install --save-dev lighthouse@^12 http-server@^14
```

Resultado esperado: `package.json` actualizado con:

```json
"devDependencies": {
  // ...existing devDependencies...
  "http-server": "^14.1.1",
  "lighthouse": "^12.0.0"
}
```

Y `package-lock.json` modificado (verificar con `git diff package-lock.json` que el cambio está acotado a las dos deps nuevas y sus transitivas).

- [ ] **Step 2: Verificar instalación**

```bash
npx lighthouse --version
npx http-server --version
```

Resultado esperado: versiones numéricas impresas (sin error).

- [ ] **Step 3: COMMIT (manual)**

El siguiente comando queda como **referencia para el usuario** (NO ejecutar):

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add lighthouse + http-server as devDependencies"
```

---

## Task 2 (F9-T1-T2): Añadir scripts npm

**Files:**
- Modify: `package.json` (scripts section)

- [ ] **Step 1: Leer la sección actual de scripts**

```bash
node -e "console.log(JSON.stringify(require('./package.json').scripts, null, 2))"
```

Resultado esperado: objeto JSON con `start`, `build`, `build:prod`, `test`, `test:ci`, `test:coverage`, `coverage:open`, `a11y:smoke`. Necesitamos añadir 3 scripts sin colisionar con nombres existentes.

- [ ] **Step 2: Editar `package.json` con `edit` tool**

Añadir al objeto `scripts` los siguientes 3 scripts (ubicación: justo después de la línea de `"a11y:smoke"` o al final del bloque `scripts`, según convenga):

```json
"serve:dist": "node scripts/serve-dist.mjs",
"lh:baseline": "node scripts/lighthouse-baseline.mjs",
"test:scripts": "node --test scripts/lighthouse-baseline.spec.mjs"
```

> **Nota sobre Windows + bash:** `node --test scripts/lighthouse-baseline.spec.mjs` con path explícito es portable. Si en el futuro hay múltiples specs, ampliar a `node --test "scripts/**/*.spec.mjs"` (compatible con bash y PowerShell 7+).

- [ ] **Step 3: Verificar que los scripts están registrados**

```bash
npm run | grep -E 'serve:dist|lh:baseline|test:scripts'
```

Resultado esperado: 3 líneas, una por script nuevo.

- [ ] **Step 4: Verificar que `serve:dist` falla correctamente (sin `dist/portfolio/browser/` aún no debería existir)**

```bash
npm run serve:dist
```

Resultado esperado: exit 1 con mensaje `Run 'npm run build:prod' primero.` (o equivalente). Si sale `http-server started` sin error, hay un bug en `serve-dist.mjs` que detectaremos cuando lo escribamos en T6 — por ahora simplemente `Ctrl+C` para salir.

- [ ] **Step 5: COMMIT (manual)**

```bash
git add package.json
git commit -m "chore(scripts): add serve:dist, lh:baseline, test:scripts"
```

---

## Task 3 (F9-T1-T3): Crear fixture JSON de muestra

**Files:**
- Create: `scripts/__fixtures__/lighthouse-sample.json`

- [ ] **Step 1: Crear el directorio de fixtures**

```bash
mkdir -p scripts/__fixtures__
```

- [ ] **Step 2: Crear `scripts/__fixtures__/lighthouse-sample.json`**

```json
{
  "lighthouseVersion": "12.0.0",
  "fetchTime": "2026-08-07T12:00:00.000Z",
  "finalDisplayedUrl": "http://localhost:4200/",
  "categories": {
    "accessibility": {
      "id": "accessibility",
      "title": "Accessibility",
      "score": 0.97
    },
    "best-practices": {
      "id": "best-practices",
      "title": "Best Practices",
      "score": 0.92
    },
    "performance": {
      "id": "performance",
      "title": "Performance",
      "score": 0.83
    },
    "seo": {
      "id": "seo",
      "title": "SEO",
      "score": 1.0
    }
  },
  "audits": {
    "color-contrast": {
      "id": "color-contrast",
      "title": "Background and foreground colors have a sufficient contrast ratio",
      "score": 1
    },
    "document-title": {
      "id": "document-title",
      "title": "Document has a `<title>` element",
      "score": 1
    }
  }
}
```

> El fixture tiene solo los campos mínimos necesarios para `pickScore` y `formatTable`. No pretende ser un JSON de Lighthouse exhaustivo.

- [ ] **Step 3: COMMIT (manual)**

```bash
git add scripts/__fixtures__/lighthouse-sample.json
git commit -m "test(a11y): add lighthouse JSON fixture for script tests"
```

---

## Task 4 (F9-T1-T4): Tests + funciones puras (TDD)

**Files:**
- Create: `scripts/lighthouse-baseline.spec.mjs`
- Create: `scripts/lighthouse-baseline.mjs` (solo funciones puras, sin main)

- [ ] **Step 1: Escribir el spec que falla**

Crear `scripts/lighthouse-baseline.spec.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { slugify, pickScore, formatTable, writeSummary } from './lighthouse-baseline.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(__dirname, '__fixtures__', 'lighthouse-sample.json');

test('slugify: /  → home', () => {
  assert.equal(slugify('/'), 'home');
});

test('slugify: /blog  → blog', () => {
  assert.equal(slugify('/blog'), 'blog');
});

test('slugify: /blog/otro-articulo  → blog-otro-articulo', () => {
  assert.equal(slugify('/blog/otro-articulo'), 'blog-otro-articulo');
});

test('slugify: /no-existe  → no-existe', () => {
  assert.equal(slugify('/no-existe'), 'no-existe');
});

test('slugify: nested path keeps dashes', () => {
  assert.equal(slugify('/blog/category/some-post'), 'blog-category-some-post');
});

test('pickScore: returns score when present', () => {
  const json = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'));
  assert.equal(pickScore(json, 'accessibility'), 0.97);
});

test('pickScore: returns null when category missing', () => {
  assert.equal(pickScore({ categories: {} }, 'accessibility'), null);
});

test('pickScore: returns null when json is null/undefined', () => {
  assert.equal(pickScore(null, 'accessibility'), null);
});

test('formatTable: empty runs returns header only', () => {
  const out = formatTable([]);
  const lines = out.split('\n');
  assert.equal(lines.length, 2);
  assert.match(lines[0], /route/);
  assert.match(lines[0], /a11y/);
});

test('formatTable: one run includes header + separator + row', () => {
  const runs = [
    {
      route: '/',
      formFactor: 'mobile',
      scores: { accessibility: 0.97, 'best-practices': 0.92, performance: 0.83, seo: 1.0 },
      status: 'ok',
    },
  ];
  const out = formatTable(runs);
  const lines = out.split('\n');
  assert.equal(lines.length, 3);
  assert.match(lines[0], /route/);
  assert.match(lines[1], /^-+/);
  assert.match(lines[2], /\//);
  assert.match(lines[2], /mobile/);
  assert.match(lines[2], /0\.97/);
  assert.match(lines[2], /ok/);
});

test('formatTable: failed run shows null scores as "-"', () => {
  const runs = [
    {
      route: '/no-existe',
      formFactor: 'desktop',
      scores: { accessibility: null, 'best-practices': null, performance: null, seo: null },
      status: 'failed',
    },
  ];
  const out = formatTable(runs);
  assert.match(out, /failed/);
  // null scores should render as '-'
  assert.match(out, /\| - \|/);
});
```

- [ ] **Step 2: Ejecutar el spec para verificar que falla**

```bash
npm run test:scripts
```

Resultado esperado: FAIL con `Cannot find module './lighthouse-baseline.mjs'` o `slugify is not a function`.

- [ ] **Step 3: Crear `scripts/lighthouse-baseline.mjs` con solo las funciones puras**

Crear `scripts/lighthouse-baseline.mjs`:

```js
import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

export function slugify(route) {
  if (route === '/') return 'home';
  return route.replace(/\//g, '-').replace(/^-+|-+$/g, '');
}

export function pickScore(json, cat) {
  return json?.categories?.[cat]?.score ?? null;
}

export function colorize(value, { color = false } = {}) {
  if (value === null || value === undefined) return '-';
  const n = Number(value);
  if (Number.isNaN(n)) return '-';
  const text = n.toFixed(2);
  if (!color) return text;
  const code = n >= 0.95 ? 32 : n >= 0.80 ? 33 : 31;
  return `\x1b[${code}m${text}\x1b[0m`;
}

export function formatTable(runs, { color = false } = {}) {
  const headers = ['route', 'form', 'a11y', 'bp', 'perf', 'seo', 'status'];
  const rows = runs.map((r) => [
    r.route,
    r.formFactor,
    colorize(r.scores?.accessibility, { color }),
    colorize(r.scores?.['best-practices'], { color }),
    colorize(r.scores?.performance, { color }),
    colorize(r.scores?.seo, { color }),
    r.status,
  ]);
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? '').toString().length))
  );
  const fmt = (cells) =>
    cells.map((c, i) => (c ?? '').toString().padEnd(widths[i])).join(' | ');
  const sep = widths.map((w) => '-'.repeat(w)).join('-+-');
  return [fmt(headers), sep, ...rows.map(fmt)].join('\n');
}

export function getCommit() {
  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['pipe', 'pipe', 'pipe'],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

export async function writeSummary(filePath, runs, meta = {}) {
  const data = {
    timestamp: new Date().toISOString(),
    commit: getCommit(),
    ...meta,
    runs,
  };
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
```

> Nota: este archivo exporta solo las funciones puras; la orquestación (probe, spawn, main) se añade en T5. Aquí no hay `if (import.meta.url === ...)` que ejecute `main()`, así que es seguro importar.

- [ ] **Step 4: Ejecutar el spec para verificar que pasa**

```bash
npm run test:scripts
```

Resultado esperado: `# tests 11` (o similar), `# pass 11`, `# fail 0`. Sin errores.

- [ ] **Step 5: COMMIT (manual)**

```bash
git add scripts/lighthouse-baseline.mjs scripts/lighthouse-baseline.spec.mjs
git commit -m "feat(a11y): lighthouse baseline pure functions (slugify, pickScore, formatTable, writeSummary)"
```

---

## Task 5 (F9-T1-T5): Orquestación completa (probe, spawn, main)

**Files:**
- Modify: `scripts/lighthouse-baseline.mjs` (añadir `probe`, `runLighthouse`, `main`, CLI args)
- Create: `scripts/__fixtures__/lighthouse-run-output/` (NO; Lighthouse genera estos)

- [ ] **Step 1: Leer el archivo actual**

Confirmar que tiene las 4 funciones puras exportadas del Task 4. Si falta alguna, volver a T4.

- [ ] **Step 2: Añadir las funciones de orquestación al final de `scripts/lighthouse-baseline.mjs`**

Reemplazar el archivo entero (T4 dejó solo funciones puras; T5 añade el resto) con:

```js
#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE_URL = process.env.LIGHTHOUSE_BASE_URL ?? 'http://localhost:4200';
const ROUTES = ['/', '/blog', '/blog/otro-articulo', '/no-existe'];
const FORM_FACTORS = ['mobile', 'desktop'];
const OUTPUT_DIR = 'a11y-report/lighthouse';
const LOGS_DIR = `${OUTPUT_DIR}/logs`;
const RUN_TIMEOUT_MS = 120_000;
const PROBE_TIMEOUT_MS = 3_000;

export function slugify(route) {
  if (route === '/') return 'home';
  return route.replace(/\//g, '-').replace(/^-+|-+$/g, '');
}

export function pickScore(json, cat) {
  return json?.categories?.[cat]?.score ?? null;
}

export function colorize(value, { color = false } = {}) {
  if (value === null || value === undefined) return '-';
  const n = Number(value);
  if (Number.isNaN(n)) return '-';
  const text = n.toFixed(2);
  if (!color) return text;
  const code = n >= 0.95 ? 32 : n >= 0.80 ? 33 : 31;
  return `\x1b[${code}m${text}\x1b[0m`;
}

export function formatTable(runs, { color = false } = {}) {
  const headers = ['route', 'form', 'a11y', 'bp', 'perf', 'seo', 'status'];
  const rows = runs.map((r) => [
    r.route,
    r.formFactor,
    colorize(r.scores?.accessibility, { color }),
    colorize(r.scores?.['best-practices'], { color }),
    colorize(r.scores?.performance, { color }),
    colorize(r.scores?.seo, { color }),
    r.status,
  ]);
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? '').toString().length))
  );
  const fmt = (cells) =>
    cells.map((c, i) => (c ?? '').toString().padEnd(widths[i])).join(' | ');
  const sep = widths.map((w) => '-'.repeat(w)).join('-+-');
  return [fmt(headers), sep, ...rows.map(fmt)].join('\n');
}

export function getCommit() {
  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['pipe', 'pipe', 'pipe'],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

export async function writeSummary(filePath, runs, meta = {}) {
  const data = {
    timestamp: new Date().toISOString(),
    commit: getCommit(),
    ...meta,
    runs,
  };
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export async function probe(baseUrl) {
  try {
    const r = await fetch(`${baseUrl}/`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return r.ok || r.status === 304;
  } catch {
    return false;
  }
}

function buildLighthouseArgs(url, formFactor, outPath) {
  return [
    'lighthouse',
    url,
    '--output=json',
    '--output=html',
    `--output-path=${outPath}`,
    `--form-factor=${formFactor}`,
    '--only-categories=accessibility,best-practices,performance,seo',
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
    '--quiet',
    '--max-wait-for-load=45000',
  ];
}

export function runLighthouse({ url, formFactor, outPath, logPath, verbose }) {
  return new Promise((resolveRun) => {
    const args = buildLighthouseArgs(url, formFactor, outPath);
    const logStream = createWriteStream(logPath, { flags: 'w' });
    const child = spawn('npx', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdoutBuf = '';
    let stderrBuf = '';
    child.stdout.on('data', (b) => {
      stdoutBuf += b.toString();
      logStream.write(b);
    });
    child.stderr.on('data', (b) => {
      stderrBuf += b.toString();
      logStream.write(b);
      if (verbose) process.stderr.write(b);
    });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      logStream.end();
      resolveRun({ ok: false, error: 'timeout' });
    }, RUN_TIMEOUT_MS);
    child.on('close', (code) => {
      clearTimeout(timer);
      logStream.end();
      resolveRun({ ok: code === 0, code, stdout: stdoutBuf, stderr: stderrBuf });
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      logStream.end();
      resolveRun({ ok: false, error: err.code ?? err.message });
    });
  });
}

function parseArgs(argv) {
  const opts = { only: null, onlyForm: null, verbose: false, noColor: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only') opts.only = argv[++i];
    else if (a === '--only-form') opts.onlyForm = argv[++i];
    else if (a === '--verbose') opts.verbose = true;
    else if (a === '--no-color') opts.noColor = true;
  }
  return opts;
}

export async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const color = !opts.noColor && process.stdout.isTTY;

  process.stdout.write(`Probing ${BASE_URL} ...\n`);
  if (!(await probe(BASE_URL))) {
    process.stderr.write(
      `\n✗ No hay servidor en ${BASE_URL}.\n  Ejecuta 'npm run serve:dist' en otra terminal o 'npm run build:prod && npm run serve:dist'.\n`
    );
    process.exit(1);
  }

  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });
  if (!existsSync(LOGS_DIR)) await mkdir(LOGS_DIR, { recursive: true });

  let routes = ROUTES;
  if (opts.only) routes = routes.filter((r) => r.includes(opts.only));
  let forms = FORM_FACTORS;
  if (opts.onlyForm) forms = forms.filter((f) => f === opts.onlyForm);

  const total = routes.length * forms.length;
  const runs = [];
  let i = 0;
  let okCount = 0;

  for (const route of routes) {
    for (const formFactor of forms) {
      i++;
      const slug = slugify(route);
      const url = `${BASE_URL}${route}`;
      const outPath = resolve(`${OUTPUT_DIR}/${formFactor}-${slug}`);
      const logPath = resolve(`${LOGS_DIR}/${formFactor}-${slug}.log`);
      process.stdout.write(`[${i}/${total}] ${formFactor.padEnd(7)} ${route} ... `);

      const result = await runLighthouse({
        url,
        formFactor,
        outPath,
        logPath,
        verbose: opts.verbose,
      });

      if (!result.ok) {
        process.stdout.write(`✗ (${result.error ?? `exit ${result.code}`})\n`);
        runs.push({
          route,
          formFactor,
          scores: { accessibility: null, 'best-practices': null, performance: null, seo: null },
          status: 'failed',
        });
        continue;
      }

      const jsonPath = `${outPath}.report.json`;
      if (!existsSync(jsonPath)) {
        process.stdout.write(`✗ (missing ${jsonPath})\n`);
        runs.push({
          route,
          formFactor,
          scores: { accessibility: null, 'best-practices': null, performance: null, seo: null },
          status: 'failed',
        });
        continue;
      }

      const json = JSON.parse(await readFile(jsonPath, 'utf8'));
      const scoresObj = {
        accessibility: pickScore(json, 'accessibility'),
        'best-practices': pickScore(json, 'best-practices'),
        performance: pickScore(json, 'performance'),
        seo: pickScore(json, 'seo'),
      };
      process.stdout.write(`✓ a11y=${scoresObj.accessibility.toFixed(2)}\n`);
      okCount++;
      runs.push({ route, formFactor, scores: scoresObj, status: 'ok' });
    }
  }

  process.stdout.write('\n' + formatTable(runs, { color }) + '\n\n');
  const summaryPath = resolve(`${OUTPUT_DIR}/latest-summary.json`);
  await writeSummary(summaryPath, runs, { baseUrl: BASE_URL });
  process.stdout.write(`Summary: ${summaryPath}\n`);
  process.stdout.write(`Re-run:  npx lighthouse ${BASE_URL}${ROUTES[0]} --form-factor=mobile\n`);
  process.exit(okCount === 0 ? 1 : 0);
}

// Entry point guard (cross-platform: Windows paths use backslashes, file:// URLs use slashes)
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  main().catch((err) => {
    process.stderr.write(`Fatal: ${err.stack ?? err.message}\n`);
    process.exit(1);
  });
}
```

- [ ] **Step 3: Verificar que los tests siguen pasando tras añadir orquestación**

```bash
npm run test:scripts
```

Resultado esperado: 11 tests pass, 0 fail. (Las funciones puras no se han tocado.)

- [ ] **Step 4: Sanity check de `--help` implícito**

```bash
node scripts/lighthouse-baseline.mjs 2>&1 | head -5
```

Resultado esperado: empieza con `Probing http://localhost:4200 ...` y luego muestra el mensaje de error `✗ No hay servidor en...`. Exit code 1. (Esto valida el flujo de probe + exit code.)

- [ ] **Step 5: COMMIT (manual)**

```bash
git add scripts/lighthouse-baseline.mjs
git commit -m "feat(a11y): wire up lighthouse orchestration (probe, spawn, table, summary)"
```

---

## Task 6 (F9-T1-T6): Servidor estático con SPA fallback

**Files:**
- Create: `scripts/serve-dist.mjs`

- [ ] **Step 1: Crear `scripts/serve-dist.mjs`**

```js
#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const DIST = resolve('dist/portfolio/browser');

if (!existsSync(DIST)) {
  process.stderr.write(
    `✗ ${DIST} no existe.\n  Run 'npm run build:prod' primero.\n`
  );
  process.exit(1);
}

const PORT = process.env.PORT ?? '4200';
const child = spawn(
  'npx',
  [
    'http-server',
    DIST,
    '-p', PORT,
    '-a', '127.0.0.1',
    '-s',                          // silent
    '-c-1',                        // no cache
    '-P', `http://127.0.0.1:${PORT}?`, // SPA fallback → index.html
  ],
  { stdio: 'inherit' }
);

child.on('close', (code) => process.exit(code ?? 0));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
```

- [ ] **Step 2: Build de producción**

```bash
npm run build:prod
```

Resultado esperado: build completa, existe `dist/portfolio/browser/index.html`.

- [ ] **Step 3: Arrancar el servidor en background**

```bash
npm run serve:dist &
SERVER_PID=$!
sleep 3
```

Resultado esperado: log `Starting up http-server, serving dist/portfolio/browser` o similar (sin error).

- [ ] **Step 4: Verificar que `/`, `/blog`, `/blog/otro-articulo`, `/no-existe` sirven `index.html`**

```bash
for route in / /blog /blog/otro-articulo /no-existe; do
  echo -n "${route}: "
  curl -s -o /dev/null -w "%{http_code} %{size_download}b\n" "http://127.0.0.1:4200${route}"
done
```

Resultado esperado: 4 líneas con `200 <bytes>` (status 200, content size > 0). Las 4 rutas devuelven HTML del SPA (SPA fallback OK).

- [ ] **Step 5: Detener el servidor**

```bash
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null
```

- [ ] **Step 6: COMMIT (manual)**

```bash
git add scripts/serve-dist.mjs
git commit -m "feat(a11y): static server with SPA fallback for lighthouse baseline"
```

---

## Task 7 (F9-T1-T7): Gitignore del directorio de artefactos

**Files:**
- Create: `a11y-report/lighthouse/.gitignore`

- [ ] **Step 1: Crear el directorio `a11y-report/lighthouse/`**

```bash
mkdir -p a11y-report/lighthouse
```

- [ ] **Step 2: Crear `a11y-report/lighthouse/.gitignore`**

```gitignore
# Generated artifacts
*
# Except the historical summary (committed for trend tracking)
!latest-summary.json
!.gitignore
!logs/
!logs/.gitignore
```

- [ ] **Step 3: Crear `a11y-report/lighthouse/logs/.gitignore` vacío**

```bash
touch a11y-report/lighthouse/logs/.gitignore
```

> Mantiene `logs/` como directorio trackeable pero ignora sus contenidos.

- [ ] **Step 4: COMMIT (manual)**

```bash
git add a11y-report/lighthouse/.gitignore a11y-report/lighthouse/logs/.gitignore
git commit -m "chore(a11y): gitignore lighthouse run artifacts, keep latest-summary.json"
```

---

## Task 8 (F9-T1-T8): Run completo + commit del baseline

**Files:**
- Create: `a11y-report/lighthouse/latest-summary.json` (generado)
- Create: `a11y-report/lighthouse/*.report.json` y `.report.html` (generados, ignorados)
- Create: `a11y-report/lighthouse/logs/*.log` (generados, ignorados)

- [ ] **Step 1: Build de producción fresco**

```bash
npm run build:prod
```

Resultado esperado: build completa sin error.

- [ ] **Step 2: Arrancar el servidor**

Terminal A:
```bash
npm run serve:dist
```

Dejar corriendo. Verificar que el log muestra `http://127.0.0.1:4200`.

- [ ] **Step 3: Correr el baseline**

Terminal B:
```bash
npm run lh:baseline
```

Resultado esperado:
- 8 runs completados (mobile + desktop × 4 rutas).
- Progreso impreso: `[1/8] mobile / ... ✓ a11y=0.97` etc.
- Tabla resumen al final con 8 filas + header + separador.
- Mensaje final: `Summary: a11y-report/lighthouse/latest-summary.json`.
- Exit code 0.

- [ ] **Step 4: Validar artefactos generados**

```bash
ls -la a11y-report/lighthouse/
```

Resultado esperado: 8 archivos `*-report.json`, 8 archivos `*-report.html`, 1 `latest-summary.json`, 1 subdirectorio `logs/`.

```bash
cat a11y-report/lighthouse/latest-summary.json | head -30
```

Resultado esperado: objeto JSON con `timestamp`, `commit` (short hash, NO `null` porque estamos en un repo git), `baseUrl`, `runs` (8 entradas).

- [ ] **Step 5: Detener el servidor**

En Terminal A: `Ctrl+C`.

- [ ] **Step 6: COMMIT (manual)**

> **Solo `latest-summary.json` se commitea.** Los `*.report.json`, `*.report.html` y `logs/*.log` están gitignored y NO deben incluirse.

```bash
git status
```

Verificar que solo aparece `a11y-report/lighthouse/latest-summary.json` como archivo nuevo trackeable.

```bash
git add a11y-report/lighthouse/latest-summary.json
git commit -m "chore(a11y): capture initial Lighthouse baseline (F9-T1)"
```

- [ ] **Step 7: Registrar scores reales en `docs/a11y-lighthouse.md` (placeholder para T9)**

Abrir `docs/a11y-lighthouse.md` (todavía no existe; se crea en T9). Por ahora, **anotar en un comentario temporal** los scores observados:

```
# Baseline inicial 2026-08-07 (commit <HASH>):
# /             mobile  a11y=??  bp=??  perf=??  seo=??
# /             desktop a11y=??  bp=??  perf=??  seo=??
# /blog         mobile  a11y=??  bp=??  perf=??  seo=??
# ...
```

Se formaliza en T9.

---

## Task 9 (F9-T1-T9): Documentación para el usuario

**Files:**
- Create: `docs/a11y-lighthouse.md`

- [ ] **Step 1: Crear `docs/a11y-lighthouse.md`**

```markdown
# Lighthouse Baseline — Guía de uso

**Fecha de creación:** 2026-08-07
**Origen:** F9-T1 del [`docs/a11y-backlog.md`](a11y-backlog.md).

Esta guía explica cómo capturar y leer el baseline de métricas Lighthouse del portfolio.

---

## Prerequisites

- Node ≥18 (viene con `npm`).
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

### Capturar baseline (one-liner con `&`)

```bash
npm run build:prod && (npm run serve:dist &) && sleep 4 && npm run lh:baseline
```

(No usar en CI sin orquestador; los PIDs pueden quedar colgando.)

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

## Baseline inicial (F9-T1, commit `<HASH>`)

> Completar tras T8 con los scores reales.

| Ruta | Form | a11y | bp | perf | seo |
|---|---|---|---|---|---|
| / | mobile | TODO | TODO | TODO | TODO |
| / | desktop | TODO | TODO | TODO | TODO |
| /blog | mobile | TODO | TODO | TODO | TODO |
| /blog | desktop | TODO | TODO | TODO | TODO |
| /blog/otro-articulo | mobile | TODO | TODO | TODO | TODO |
| /blog/otro-articulo | desktop | TODO | TODO | TODO | TODO |
| /no-existe | mobile | TODO | TODO | TODO | TODO |
| /no-existe | desktop | TODO | TODO | TODO | TODO |

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

- `commit` puede ser `null` si no estamos en un repo git (no es nuestro caso, pero el script es defensivo).
- `status: 'failed'` indica que Lighthouse no pudo completar el run (timeout, error de Chrome, etc.). Los scores vienen como `null`. Revisar `a11y-report/lighthouse/logs/<form>-<slug>.log`.

---

## Limitaciones conocidas

- **Solo desktop + mobile (Chrome).** Firefox/Safari Lighthouse están en beta.
- **No es CI gate.** Asserts duros viven en F11-T4.
- **Bundle local.** El bundle desplegado en Netlify puede diferir (CDN, compresión Brotli, etc.). Para auditar producción real → F11-T4 con `LIGHTHOUSE_BASE_URL=https://<netlify-url>`.

---

## Troubleshooting

- **`✗ No hay servidor en http://localhost:4200`** → arrancar `npm run serve:dist` en otra terminal.
- **`✗ dist/portfolio/browser no existe`** → correr `npm run build:prod` primero.
- **`Lighthouse couldn't find a stable Chrome`** → cerrar instancias de Chrome abiertas. Lighthouse necesita arrancar la suya.
- **Un run marca `failed` con `timeout`** → red lenta o página muy pesada. Probar con `--only-form desktop` para reducir el set.
```

> **Antes de continuar:** reemplazar los `TODO` de la tabla de baseline con los scores reales capturados en T8. Si el run no se hizo aún, dejar `TODO` y volver a este paso tras T8.

- [ ] **Step 2: COMMIT (manual)**

```bash
git add docs/a11y-lighthouse.md
git commit -m "docs(a11y): lighthouse baseline usage guide and thresholds"
```

---

## Task 10 (F9-T1-T10): Verificación final

**Files:** (ninguno; solo verificación)

- [ ] **Step 1: Verificar Angular tests siguen verdes**

```bash
npm run test:ci 2>&1 | tail -15
```

Resultado esperado: PASS 350 / FAIL 0. (Este plan no toca código Angular; solo añade scripts. Los 350 tests existentes deben seguir pasando.)

- [ ] **Step 2: Verificar tests del orquestador**

```bash
npm run test:scripts
```

Resultado esperado: 11 pass, 0 fail.

- [ ] **Step 3: Verificar que `latest-summary.json` está commiteado**

```bash
git log --oneline -5
git ls-files a11y-report/lighthouse/
```

Resultado esperado:
- En `git log`: aparece el commit `chore(a11y): capture initial Lighthouse baseline`.
- En `git ls-files`: solo aparece `a11y-report/lighthouse/latest-summary.json` (no los `*.report.json/html`).

- [ ] **Step 4: Verificar que `git status` está limpio**

```bash
git status
```

Resultado esperado: `nothing to commit, working tree clean`.

- [ ] **Step 5: Verificar que los artefactos generados existen pero están gitignored**

```bash
ls a11y-report/lighthouse/
git check-ignore a11y-report/lighthouse/mobile-home.report.json
```

Resultado esperado:
- `ls` muestra 8 `*.report.json`, 8 `*.report.html`, `latest-summary.json`, `logs/`.
- `git check-ignore` imprime el path (confirmando que está gitignored).

- [ ] **Step 6: COMMIT final de cierre (solo si se ajustó la tabla de baseline)**

```bash
git add docs/a11y-lighthouse.md
git commit -m "docs(a11y): fill baseline scores table"
```

> Solo si se reemplazaron los `TODO` en T9. Si ya se hizo en T9 Step 1, omitir.

---

## Resumen final

Al completar las 10 tasks:

- ✅ DevDeps `lighthouse` + `http-server` instaladas (T1).
- ✅ Scripts npm `serve:dist`, `lh:baseline`, `test:scripts` (T2).
- ✅ Fixture JSON para tests (T3).
- ✅ Funciones puras + 11 unit tests (T4).
- ✅ Orquestación completa (probe, spawn, table, summary) (T5).
- ✅ Servidor estático con SPA fallback (T6).
- ✅ `.gitignore` del directorio de artefactos (T7).
- ✅ Baseline inicial capturado y commiteado (T8).
- ✅ Documentación para el usuario (T9).
- ✅ Verificación final (T10).

Commits sugeridos (10 commits, mensajes ya en cada task):

```
chore(deps): add lighthouse + http-server as devDependencies
chore(scripts): add serve:dist, lh:baseline, test:scripts
test(a11y): add lighthouse JSON fixture for script tests
feat(a11y): lighthouse baseline pure functions (slugify, pickScore, formatTable, writeSummary)
feat(a11y): wire up lighthouse orchestration (probe, spawn, table, summary)
feat(a11y): static server with SPA fallback for lighthouse baseline
chore(a11y): gitignore lighthouse run artifacts, keep latest-summary.json
chore(a11y): capture initial Lighthouse baseline (F9-T1)
docs(a11y): lighthouse baseline usage guide and thresholds
docs(a11y): fill baseline scores table (opcional)
```

---

## Próximos pasos (out of scope)

Estos quedan registrados en `docs/a11y-backlog.md` para fases futuras:

- **F9-T2**: `npm run a11y:smoke` con axe-core contra las mismas 4 rutas (script ya existe).
- **F9-T3**: `web-vitals` en runtime para reportar CWV reales a producción.
- **F11-T4**: Migrar este baseline a `@lhci/cli` con asserts duros en GitHub Actions.
- **F11-T2**: Workflow CI que corra `lh:baseline` en cada PR y bloquee si a11y < 0.95.