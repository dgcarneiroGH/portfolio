#!/usr/bin/env node
/**
 * lh-runner.mjs — Programmatic Lighthouse runner (Windows-safe).
 *
 * Wraps chrome-launcher + lighthouse with proper error handling around the
 * `chrome.kill()` call, which throws EPERM on Windows when trying to remove
 * its temp dir. The lighthouse CLI (run.js) does not catch this, causing
 * unhandled rejections that crash Node before the report is written.
 *
 * Usage:
 *   node scripts/lh-runner.mjs --url <URL> --out <PATH> [--form mobile|desktop]
 *
 * Exit codes:
 *   0  — success (report written)
 *   1  — lighthouse runtime error (report still written, see JSON)
 *   2  — chrome failed to launch or other fatal error (no report)
 */
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

function parseArgs(argv) {
  const opts = { url: null, out: null, form: 'mobile', categories: ['accessibility', 'best-practices', 'performance', 'seo'] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') opts.url = argv[++i];
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--form') opts.form = argv[++i];
  }
  if (!opts.url || !opts.out) {
    process.stderr.write('Usage: node lh-runner.mjs --url <URL> --out <PATH> [--form mobile|desktop]\n');
    process.exit(2);
  }
  return opts;
}

async function safeKill(chrome) {
  try {
    await chrome.kill();
  } catch (err) {
    // EPERM on Windows when cleaning chrome user-data-dir; non-fatal.
    process.stderr.write(`[lh-runner] swallowed chrome.kill() error: ${err.code ?? err.message}\n`);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const outPath = resolve(opts.out);
  const outDir = dirname(outPath);
  await mkdir(outDir, { recursive: true });

  const chromeFlags = ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'];

  let chrome;
  try {
    chrome = await launch({
      chromeFlags,
      chromePath: undefined,
      logLevel: 'error'
    });
  } catch (err) {
    process.stderr.write(`[lh-runner] chrome launch failed: ${err.message}\n`);
    process.exit(2);
  }

  let runnerResult;
  let exitCode = 0;
  try {
    runnerResult = await lighthouse(
      opts.url,
      {
        port: chrome.port,
        output: ['json', 'html'],
        logLevel: 'error',
        onlyCategories: opts.categories,
        formFactor: opts.form,
        screenEmulation: opts.form === 'desktop'
          ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }
          : { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
        throttlingMethod: opts.form === 'desktop' ? 'provided' : 'simulate',
        throttling: opts.form === 'desktop'
          ? { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 }
          : undefined
      }
    );
  } catch (err) {
    process.stderr.write(`[lh-runner] lighthouse run failed: ${err.message}\n`);
    await safeKill(chrome);
    process.exit(2);
  }

  await safeKill(chrome);

  if (runnerResult?.lhr?.runtimeError) {
    process.stderr.write(`[lh-runner] runtime error in report: ${runnerResult.lhr.runtimeError.message}\n`);
    exitCode = 1;
  }

  // runnerResult.report is JSON string when output includes 'json'.
  // runnerResult.report[0] = JSON, runnerResult.report[1] = HTML (in modern LH versions).
  const reports = runnerResult.report;
  if (Array.isArray(reports)) {
    await writeFile(`${outPath}.report.json`, reports[0], 'utf8');
    await writeFile(`${outPath}.report.html`, reports[1], 'utf8');
  } else {
    // Single string (legacy LH)
    await writeFile(`${outPath}.report.json`, reports, 'utf8');
  }

  process.exit(exitCode);
}

main().catch((err) => {
  process.stderr.write(`[lh-runner] fatal: ${err.stack ?? err.message}\n`);
  process.exit(2);
});