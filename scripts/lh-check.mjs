#!/usr/bin/env node
/**
 * lh-check.mjs — Enforce Lighthouse score thresholds against latest-summary.json.
 *
 * Reads `a11y-report/lighthouse/latest-summary.json` (produced by `lh:baseline`)
 * and exits non-zero if any run falls below the configured thresholds. Used by
 * GitHub Actions workflow (F11-T2) as the gate between baseline generation and
 * PR approval.
 *
 * Thresholds are tuned against the current baseline (commit `9043f21`):
 *   - a11y baseline 0.96 → threshold 0.95
 *   - best-practices baseline 0.93 (mobile) / 0.96 (desktop) → threshold 0.90
 *   - perf mobile baseline 0.52 → threshold 0.50 (tight margin for regression detection)
 *   - perf desktop baseline 1.00 → threshold 0.90
 *   - seo baseline 1.00 → threshold 0.90
 *
 * When the perf mobile baseline improves (e.g. via F13), bump the threshold
 * by editing the THRESHOLDS constant below.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SUMMARY = 'a11y-report/lighthouse/latest-summary.json';

export const THRESHOLDS = {
  accessibility: 0.95,
  'best-practices': 0.90,
  performance: { mobile: 0.50, desktop: 0.90 },
  seo: 0.90,
};

function thresholdFor(category, formFactor) {
  const t = THRESHOLDS[category];
  if (t && typeof t === 'object') return t[formFactor];
  return t;
}

/**
 * Evaluate a single run against thresholds.
 * Returns an array of violations: `{ route, formFactor, category, actual, threshold }`.
 * A run with status !== 'ok' is reported as a single violation per null category
 * (so failed Lighthouse runs don't silently pass).
 */
export function evaluateRun(run) {
  const violations = [];
  if (run.status !== 'ok') {
    for (const cat of ['accessibility', 'best-practices', 'performance', 'seo']) {
      violations.push({
        route: run.route,
        formFactor: run.formFactor,
        category: cat,
        actual: run.scores?.[cat] ?? null,
        threshold: thresholdFor(cat, run.formFactor),
      });
    }
    return violations;
  }
  for (const cat of ['accessibility', 'best-practices', 'performance', 'seo']) {
    const actual = run.scores?.[cat];
    const threshold = thresholdFor(cat, run.formFactor);
    if (actual == null || actual < threshold) {
      violations.push({
        route: run.route,
        formFactor: run.formFactor,
        category: cat,
        actual,
        threshold,
      });
    }
  }
  return violations;
}

export function evaluateSummary(summary) {
  const violations = [];
  for (const run of summary.runs ?? []) {
    violations.push(...evaluateRun(run));
  }
  return violations;
}

export function formatViolations(violations) {
  const headers = ['route', 'form', 'category', 'actual', 'threshold'];
  if (violations.length === 0) {
    return headers.join(' | ');
  }
  const rows = violations.map((v) => [
    v.route,
    v.formFactor,
    v.category,
    v.actual == null ? '-' : v.actual.toFixed(2),
    v.threshold.toFixed(2),
  ]);
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => r[i].length))
  );
  const fmt = (cells) =>
    cells.map((c, i) => c.padEnd(widths[i])).join(' | ');
  const sep = widths.map((w) => '-'.repeat(w)).join('-+-');
  return [fmt(headers), sep, ...rows.map(fmt)].join('\n');
}

function loadSummary(path) {
  if (!existsSync(path)) {
    throw new Error(
      `Missing summary file: ${path}\n` +
      `Run 'npm run lh:baseline' first to generate it.`
    );
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

async function main() {
  const summaryPath = process.env.LH_CHECK_SUMMARY
    ? resolve(process.env.LH_CHECK_SUMMARY)
    : resolve(DEFAULT_SUMMARY);

  let summary;
  try {
    summary = loadSummary(summaryPath);
  } catch (err) {
    process.stderr.write(`✗ ${err.message}\n`);
    process.exit(2);
  }

  const violations = evaluateSummary(summary);
  process.stdout.write('\nLighthouse threshold check\n');
  process.stdout.write(formatViolations(violations) + '\n\n');

  if (violations.length === 0) {
    process.stdout.write('✓ All runs above thresholds.\n');
    process.exit(0);
  }

  process.stderr.write(
    `✗ ${violations.length} threshold violation(s) detected.\n` +
    `See table above. Open the corresponding .report.html for details.\n`
  );
  process.exit(1);
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  main().catch((err) => {
    process.stderr.write(`Fatal: ${err.stack ?? err.message}\n`);
    process.exit(2);
  });
}