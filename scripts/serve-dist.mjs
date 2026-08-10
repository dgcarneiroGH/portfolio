#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const DIST = resolve('dist/portfolio/browser');

if (!existsSync(DIST)) {
  process.stderr.write(
    `✗ ${DIST} no existe.\n  Run 'npm run build:prod' primero.\n`
  );
  process.exit(1);
}

const PORT = process.env.PORT ?? '4200';
const NPX_CMD = process.platform === 'win32' ? 'npx.cmd' : 'npx';

process.stdout.write('Pre-compressing dist assets (brotli + gzip)...\n');
const compressResult = spawnSync(
  process.execPath,
  ['scripts/compress-dist.mjs'],
  { stdio: 'inherit' }
);
if (compressResult.status !== 0) {
  process.stderr.write('✗ Pre-compression failed.\n');
  process.exit(compressResult.status ?? 1);
}

const child = spawn(
  NPX_CMD,
  [
    'http-server',
    DIST,
    '-p', PORT,
    '-a', '127.0.0.1',
    '-s',
    '-c-1',
    '--gzip',
    '--brotli',
    '-P', `http://127.0.0.1:${PORT}?`,
  ],
  { stdio: 'inherit', shell: process.platform === 'win32' }
);

child.on('close', (code) => process.exit(code ?? 0));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
