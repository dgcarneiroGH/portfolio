#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { writeSummary } from './lighthouse-summary.mjs';

// 127.0.0.1 en vez de localhost: serve-dist bindea solo IPv4 y la resolución
// de localhost a ::1 penaliza ~300ms por conexión en el Lighthouse.
const BASE_URL = process.env.LIGHTHOUSE_BASE_URL ?? 'http://127.0.0.1:4200';
const ROUTES = ['/', '/blog', '/blog/otro-articulo', '/no-existe'];
const FORM_FACTORS = ['mobile', 'desktop'];
const OUTPUT_DIR = 'a11y-report/lighthouse';
const LOGS_DIR = `${OUTPUT_DIR}/logs`;
const RUN_TIMEOUT_MS = 120_000;
const PROBE_TIMEOUT_MS = 3_000;
const NPX_CMD = process.platform === 'win32' ? 'npx.cmd' : 'npx';

export function slugify(route) {
  if (route === '/') return 'home';
  return route.replace(/\//g, '-').replace(/^-+|-+$/g, '');
}

export function pickScore(json, cat) {
  return json?.categories?.[cat]?.score ?? null;
}

export function colorize(value, { color = false } = {}) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  const text = n.toFixed(2);
  if (!color) return text;
  const code = n >= 0.95 ? 32 : n >= 0.80 ? 33 : 31;
  return `\x1b[${code}m${text}\x1b[0m`;
}

export function formatTable(runs, { color = false } = {}) {
  const headers = ['route', 'form', 'a11y', 'bp', 'perf', 'seo', 'status'];
  const scoreKeys = ['accessibility', 'best-practices', 'performance', 'seo'];
  const rows = runs.map((r) => [
    r.route,
    r.formFactor,
    ...scoreKeys.map((k) => {
      const c = colorize(r.scores?.[k], { color });
      return c ?? '-'.padEnd(headers[scoreKeys.indexOf(k) + 2].length);
    }),
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

export async function probe(baseUrl) {
  try {
    const r = await fetch(`${baseUrl}/`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!(r.ok || r.status === 304)) return false;
    const indexHtml = await r.text();
    const dev = detectDevServer(indexHtml);
    if (dev.isDevServer) {
      process.stderr.write(
        `\n✗ El servidor en ${baseUrl} parece ser un dev server de Vite/Angular (${dev.reason}).\n` +
        `  Lighthouse se debe ejecutar contra la build de producción.\n` +
        `  Ejecuta: npm run build:prod && npm run serve:dist\n`
      );
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

const DEV_PATTERNS = [
  { name: '@vite/client', re: /@vite\/client/ },
  { name: '@fs (Vite filesystem)', re: /\/@fs\// },
  { name: 'main.js sin hash', re: /<script[^>]+src=["']main\.js["']/ },
  { name: '/@vite/', re: /\/@vite\// },
];

export function detectDevServer(indexHtml) {
  if (typeof indexHtml !== 'string' || indexHtml.length === 0) {
    return { isDevServer: false, reason: null };
  }
  for (const { name, re } of DEV_PATTERNS) {
    if (re.test(indexHtml)) {
      return { isDevServer: true, reason: name };
    }
  }
  return { isDevServer: false, reason: null };
}

function buildLighthouseArgs(url, formFactor, outPath) {
  // Kept for backward compatibility / debug (run individual lighthouse CLI command).
  // The orchestrator actually uses lh-runner.mjs to avoid a Windows-only EPERM bug
  // in the lighthouse CLI's chrome cleanup. See scripts/lh-runner.mjs header.
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
    const args = [
      'scripts/lh-runner.mjs',
      '--url', url,
      '--out', outPath,
      '--form', formFactor,
    ];
    const logStream = createWriteStream(logPath, { flags: 'w' });
    const child = spawn('node', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });
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
      const url = route === '/' ? `${BASE_URL}/` : `${BASE_URL}/#${route}`;
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

      const jsonPath = `${outPath}.report.json`;

      if (result.ok && existsSync(jsonPath)) {
        let json;
        try {
          json = JSON.parse(await readFile(jsonPath, 'utf8'));
        } catch {
          process.stdout.write(`✗ (invalid JSON: ${logPath})\n`);
          runs.push({
            route,
            formFactor,
            scores: { accessibility: null, 'best-practices': null, performance: null, seo: null },
            status: 'failed',
          });
          continue;
        }
        const scoresObj = {
          accessibility: pickScore(json, 'accessibility'),
          'best-practices': pickScore(json, 'best-practices'),
          performance: pickScore(json, 'performance'),
          seo: pickScore(json, 'seo'),
        };
        process.stdout.write(`✓ a11y=${scoresObj.accessibility.toFixed(2)}\n`);
        okCount++;
        runs.push({ route, formFactor, scores: scoresObj, status: 'ok' });
        continue;
      }

      if (existsSync(jsonPath)) {
        let json;
        try {
          json = JSON.parse(await readFile(jsonPath, 'utf8'));
        } catch {
          process.stdout.write(`✗ (invalid JSON: ${logPath})\n`);
          runs.push({
            route,
            formFactor,
            scores: { accessibility: null, 'best-practices': null, performance: null, seo: null },
            status: 'failed',
          });
          continue;
        }
        const scoresObj = {
          accessibility: pickScore(json, 'accessibility'),
          'best-practices': pickScore(json, 'best-practices'),
          performance: pickScore(json, 'performance'),
          seo: pickScore(json, 'seo'),
        };
        const cleanupHint = /EPERM/.test(result.stderr ?? '') ? 'cleanup' : `exit ${result.code}`;
        process.stdout.write(`✓ a11y=${scoresObj.accessibility.toFixed(2)} (recovered from ${cleanupHint})\n`);
        okCount++;
        runs.push({ route, formFactor, scores: scoresObj, status: 'ok' });
        continue;
      }

      process.stdout.write(`✗ (${result.error ?? `exit ${result.code}`})\n`);
      runs.push({
        route,
        formFactor,
        scores: { accessibility: null, 'best-practices': null, performance: null, seo: null },
        status: 'failed',
      });
    }
  }

  process.stdout.write('\n' + formatTable(runs, { color }) + '\n\n');
  const summaryPath = resolve(`${OUTPUT_DIR}/latest-summary.json`);
  await writeSummary(summaryPath, runs, { baseUrl: BASE_URL });
  process.stdout.write(`Summary: ${summaryPath}\n`);
  process.stdout.write(`Re-run:  npx lighthouse ${BASE_URL}${ROUTES[0]} --form-factor=mobile\n`);
  process.exit(okCount === 0 ? 1 : 0);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  main().catch((err) => {
    process.stderr.write(`Fatal: ${err.stack ?? err.message}\n`);
    process.exit(1);
  });
}
