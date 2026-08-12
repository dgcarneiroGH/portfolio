import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectDevServer } from './lighthouse-baseline.mjs';

const PROD_INDEX = `
<!doctype html>
<html><head>
  <script src="main-ABC123.js" defer></script>
  <link rel="preload" as="font" href="fonts/inter-7K4P.woff2" crossorigin>
</head><body><app-root></app-root></body></html>
`;

const DEV_INDEX = `
<!doctype html>
<html><head>
  <script type="module" src="http://localhost:4200/@vite/client"></script>
  <script type="module" src="http://localhost:4200/main.js"></script>
</head><body>
  <app-root></app-root>
  <script type="module" src="/@fs/C:/repo/sections-wrapper.component-JJYGFAFL.js"></script>
</body></html>
`;

const LEGACY_PROD_INDEX = `
<!doctype html>
<html><head>
  <script src="main.js" defer></script>
  <link rel="stylesheet" href="styles.css">
</head><body><app-root></app-root></body></html>
`;

const EMPTY_INDEX = '<!doctype html><html><body></body></html>';

test('detectDevServer: production index with hashed assets is allowed', () => {
  const result = detectDevServer(PROD_INDEX);
  assert.equal(result.isDevServer, false);
  assert.equal(result.reason, null);
});

test('detectDevServer: detects Vite client injection', () => {
  const result = detectDevServer(DEV_INDEX);
  assert.equal(result.isDevServer, true);
  assert.match(result.reason ?? '', /@vite\/client/);
});

test('detectDevServer: detects /@fs/ Vite filesystem paths', () => {
  const index = '<html><body><script src="/@fs/C:/repo/foo.js"></script></body></html>';
  const result = detectDevServer(index);
  assert.equal(result.isDevServer, true);
  assert.match(result.reason ?? '', /@fs/);
});

test('detectDevServer: detects unhashed main.js (dev convention)', () => {
  const result = detectDevServer(LEGACY_PROD_INDEX);
  assert.equal(result.isDevServer, true);
  assert.match(result.reason ?? '', /main\.js/);
});

test('detectDevServer: empty index returns neutral (allows probe to continue)', () => {
  const result = detectDevServer(EMPTY_INDEX);
  assert.equal(result.isDevServer, false);
});

test('detectDevServer: null/undefined input is neutral', () => {
  assert.equal(detectDevServer(null).isDevServer, false);
  assert.equal(detectDevServer(undefined).isDevServer, false);
  assert.equal(detectDevServer('').isDevServer, false);
});
