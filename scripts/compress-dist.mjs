#!/usr/bin/env node
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname, relative, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

const DIST = resolve('dist/portfolio/browser');
const COMPRESSIBLE = new Set(['.js', '.css', '.html', '.svg', '.json']);
const MIN_BYTES = 1024;
const BROTLI_QUALITY = 5;

if (!existsSync(DIST)) {
  process.stderr.write(`✗ ${DIST} no existe. Run 'npm run build:prod' primero.\n`);
  process.exit(1);
}

async function collect(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collect(full)));
    else out.push(full);
  }
  return out;
}

const files = (await collect(DIST)).filter((f) => {
  if (f.endsWith('.br') || f.endsWith('.gz')) return false;
  return COMPRESSIBLE.has(extname(f).toLowerCase());
});

let compressed = 0;
let brBytes = 0;
let gzBytes = 0;
let skipped = 0;

for (const file of files) {
  const st = await stat(file);
  if (st.size < MIN_BYTES) {
    skipped++;
    continue;
  }
  const content = await readFile(file);
  const br = brotliCompressSync(content, {
    params: { [constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY },
  });
  const gz = gzipSync(content, { level: 6 });
  await writeFile(`${file}.br`, br);
  await writeFile(`${file}.gz`, gz);
  compressed++;
  brBytes += br.length;
  gzBytes += gz.length;
  process.stdout.write(
    `  ${relative(DIST, file).padEnd(50)} ${st.size.toString().padStart(7)} → br ${br.length} | gz ${gz.length}\n`
  );
}

process.stdout.write(
  `\n✓ ${compressed} files compressed (brotli ${(brBytes / 1024).toFixed(1)} KiB, gzip ${(gzBytes / 1024).toFixed(1)} KiB). ${skipped} skipped (< ${MIN_BYTES} B).\n`
);