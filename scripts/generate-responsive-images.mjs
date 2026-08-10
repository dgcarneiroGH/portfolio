#!/usr/bin/env node
import { readdir, stat } from 'node:fs/promises';
import { join, resolve, dirname, basename, extname } from 'node:path';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const PHOTOS_DIR = resolve('src/assets/images/photos');
const WIDTHS = [480, 960];
const QUALITY = 78;

if (!existsSync(PHOTOS_DIR)) {
  process.stderr.write(`✗ ${PHOTOS_DIR} no existe.\n`);
  process.exit(1);
}

const entries = await readdir(PHOTOS_DIR);
const sources = entries.filter(
  (f) => /\.(jpe?g|png)$/i.test(f) && !/-\d+\./.test(f)
);

let generated = 0;
let skipped = 0;

for (const file of sources) {
  const src = join(PHOTOS_DIR, file);
  const base = basename(file, extname(file));
  const meta = await sharp(src).metadata();

  for (const w of WIDTHS) {
    if (meta.width && meta.width < w) {
      process.stdout.write(`  ${file.padEnd(20)} ${w}w — skip (orig ${meta.width}w < ${w})\n`);
      skipped++;
      continue;
    }
    const out = join(PHOTOS_DIR, `${base}-${w}.jpeg`);
    await sharp(src)
      .resize({ width: w, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(out);
    const outStat = await stat(out);
    process.stdout.write(
      `  ${file.padEnd(20)} ${w}w → ${basename(out).padEnd(20)} ${(outStat.size / 1024).toFixed(1)} KiB\n`
    );
    generated++;
  }
}

process.stdout.write(
  `\n✓ ${generated} variants generated, ${skipped} skipped. Run again after replacing originals.\n`
);