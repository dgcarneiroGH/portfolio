import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { slugify, pickScore, formatTable } from './lighthouse-baseline.mjs';
import { writeSummary } from './lighthouse-summary.mjs';

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
  assert.match(out, /\|\s*-\s*\|/);
});
