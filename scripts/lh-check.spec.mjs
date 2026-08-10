import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import {
  THRESHOLDS,
  evaluateRun,
  evaluateSummary,
  formatViolations,
} from './lh-check.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_OK = resolve(__dirname, '__fixtures__', 'lh-summary-ok.json');
const FIXTURE_FAIL = resolve(__dirname, '__fixtures__', 'lh-summary-fail.json');

function loadFixture(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

test('THRESHOLDS: exposes the expected categories', () => {
  assert.equal(typeof THRESHOLDS.accessibility, 'number');
  assert.equal(typeof THRESHOLDS['best-practices'], 'number');
  assert.equal(typeof THRESHOLDS.performance, 'object');
  assert.equal(typeof THRESHOLDS.performance.mobile, 'number');
  assert.equal(typeof THRESHOLDS.performance.desktop, 'number');
  assert.equal(typeof THRESHOLDS.seo, 'number');
});

test('evaluateRun: passing run yields no violations', () => {
  const run = {
    route: '/',
    formFactor: 'mobile',
    scores: { accessibility: 0.96, 'best-practices': 0.93, performance: 0.55, seo: 1 },
    status: 'ok',
  };
  const violations = evaluateRun(run);
  assert.deepEqual(violations, []);
});

test('evaluateRun: detects accessibility below threshold', () => {
  const run = {
    route: '/',
    formFactor: 'mobile',
    scores: { accessibility: 0.94, 'best-practices': 0.93, performance: 0.55, seo: 1 },
    status: 'ok',
  };
  const violations = evaluateRun(run);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].category, 'accessibility');
  assert.equal(violations[0].actual, 0.94);
  assert.equal(violations[0].threshold, 0.95);
  assert.equal(violations[0].route, '/');
  assert.equal(violations[0].formFactor, 'mobile');
});

test('evaluateRun: detects performance mobile below threshold', () => {
  const run = {
    route: '/blog',
    formFactor: 'mobile',
    scores: { accessibility: 0.96, 'best-practices': 0.93, performance: 0.45, seo: 1 },
    status: 'ok',
  };
  const violations = evaluateRun(run);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].category, 'performance');
  assert.equal(violations[0].actual, 0.45);
  assert.equal(violations[0].threshold, 0.50);
  assert.equal(violations[0].formFactor, 'mobile');
});

test('evaluateRun: detects performance desktop below threshold', () => {
  const run = {
    route: '/',
    formFactor: 'desktop',
    scores: { accessibility: 0.96, 'best-practices': 0.96, performance: 0.85, seo: 1 },
    status: 'ok',
  };
  const violations = evaluateRun(run);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].category, 'performance');
  assert.equal(violations[0].threshold, 0.90);
});

test('evaluateRun: detects seo below threshold', () => {
  const run = {
    route: '/blog',
    formFactor: 'desktop',
    scores: { accessibility: 0.96, 'best-practices': 0.96, performance: 1, seo: 0.85 },
    status: 'ok',
  };
  const violations = evaluateRun(run);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].category, 'seo');
});

test('evaluateRun: failed run (null scores) yields one violation per category', () => {
  const run = {
    route: '/no-existe',
    formFactor: 'mobile',
    scores: { accessibility: null, 'best-practices': null, performance: null, seo: null },
    status: 'failed',
  };
  const violations = evaluateRun(run);
  // null < any threshold, so all 4 categories fail.
  assert.equal(violations.length, 4);
});

test('evaluateSummary: OK fixture yields no violations', () => {
  const summary = loadFixture(FIXTURE_OK);
  const violations = evaluateSummary(summary);
  assert.equal(violations.length, 0);
});

test('evaluateSummary: fail fixture yields expected violations', () => {
  const summary = loadFixture(FIXTURE_FAIL);
  const violations = evaluateSummary(summary);
  // Expected violations:
  // - / mobile: a11y 0.94 < 0.95
  // - / desktop: perf 0.85 < 0.90
  // - /blog mobile: perf 0.45 < 0.50
  // - /blog desktop: seo 0.85 < 0.90
  assert.equal(violations.length, 4);
  const keys = violations.map((v) => `${v.route}|${v.formFactor}|${v.category}`).sort();
  assert.deepEqual(keys, [
    '/blog|desktop|seo',
    '/blog|mobile|performance',
    '/|desktop|performance',
    '/|mobile|accessibility',
  ]);
});

test('evaluateSummary: failed runs produce violations, not silent pass', () => {
  const summary = {
    runs: [
      { route: '/', formFactor: 'mobile', scores: { accessibility: null }, status: 'failed' },
      {
        route: '/',
        formFactor: 'mobile',
        scores: { accessibility: 0.96, 'best-practices': 0.93, performance: 0.55, seo: 1 },
        status: 'ok',
      },
    ],
  };
  const violations = evaluateSummary(summary);
  // Failed run produces one violation per null category (4 here).
  // OK run with complete scores produces none.
  assert.equal(violations.length, 4);
  for (const v of violations) {
    assert.equal(v.route, '/');
    assert.equal(v.formFactor, 'mobile');
    assert.equal(v.actual, null);
  }
});

test('formatViolations: produces readable table with route/form/category/actual/threshold', () => {
  const violations = [
    { route: '/', formFactor: 'mobile', category: 'accessibility', actual: 0.94, threshold: 0.95 },
    { route: '/blog', formFactor: 'desktop', category: 'seo', actual: 0.85, threshold: 0.90 },
  ];
  const out = formatViolations(violations);
  assert.match(out, /accessibility/);
  assert.match(out, /0\.94/);
  assert.match(out, /0\.95/);
  assert.match(out, /seo/);
  assert.match(out, /\//);
});

test('formatViolations: empty array yields header-only output', () => {
  const out = formatViolations([]);
  assert.match(out, /route/);
  assert.match(out, /category/);
});