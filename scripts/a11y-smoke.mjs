// Accessibility smoke test using @axe-core/cli against a built Angular app.
// Usage:  npm run a11y:smoke   (requires the dev server running on $A11Y_BASE_URL)
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const BASE = process.env.A11Y_BASE_URL ?? 'http://localhost:4200';
const ROUTES = ['/', '/blog', '/blog/no-existe', '/esta-ruta-no-existe'];

const require = createRequire(import.meta.url);
const cliPath = require.resolve('@axe-core/cli');

mkdirSync('a11y-report', { recursive: true });

let totalViolations = 0;

for (const route of ROUTES) {
  const url = route === '/' ? `${BASE}/` : `${BASE}/#${route}`;
  console.log(`\nAuditing ${url}`);
  try {
    const out = execSync(`node "${cliPath}" --url "${url}" --exit`, {
      stdio: 'pipe',
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024
    });
    writeFileSync(
      `a11y-report${route.replace(/[^a-z0-9]/gi, '_') || '_root'}.json`,
      out
    );
    console.log(`  ✓ OK — report saved`);
  } catch (err) {
    const stdout = err.stdout?.toString() ?? '';
    const stderr = err.stderr?.toString() ?? '';
    writeFileSync(
      `a11y-report${route.replace(/[^a-z0-9]/gi, '_') || '_root'}.json`,
      stdout || stderr
    );
    totalViolations++;
    console.error(`  ✗ Failed — see a11y-report/${route.replace(/[^a-z0-9]/gi, '_')}.json`);
  }
}

if (totalViolations > 0) {
  console.error(
    `\n${totalViolations} route(s) reported violations. Inspect a11y-report/*.json.`
  );
  process.exit(1);
} else {
  console.log('\nAll routes clean. ✓');
}
