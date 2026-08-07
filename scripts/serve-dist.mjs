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
const NPX_CMD = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(
  NPX_CMD,
  [
    'http-server',
    DIST,
    '-p', PORT,
    '-a', '127.0.0.1',
    '-s',
    '-c-1',
    '-P', `http://127.0.0.1:${PORT}?`,
  ],
  { stdio: 'inherit', shell: process.platform === 'win32' }
);

child.on('close', (code) => process.exit(code ?? 0));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
