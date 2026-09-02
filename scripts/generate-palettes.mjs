#!/usr/bin/env node
/**
 * generate-palettes.mjs — Precalcula las paletas de los project cards en build.
 *
 * Sustituye a colorthief en runtime (getColorSync/getPaletteSync bloqueaban el
 * hilo principal por cada card). Lee los `coverImgSrc` de projects.constants.ts,
 * extrae los 2 colores dominantes con cuantización de 4 bits/canal y emite
 * `src/app/features/projects/constants/project-palettes.ts`.
 *
 * Uso: node scripts/generate-palettes.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const CONSTANTS_PATH = 'src/app/features/projects/constants/projects.constants.ts';
const OUTPUT_PATH = 'src/app/features/projects/constants/project-palettes.ts';

/** Convierte un array de píxeles [r,g,b] en un buffer RGB plano (helper de tests). */
export function buildRgbBuffer(pixels) {
  return Buffer.from(pixels.flat());
}

/** '#rrggbb' → [r, g, b] */
export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Cuantiza el buffer RGB a buckets de 4 bits/canal y devuelve los 2 colores
 * dominantes (media de cada bucket) como hex. Si solo hay un bucket, devuelve
 * un array de 1 elemento.
 */
export function quantizeTopTwo(raw, width, height) {
  const bins = new Map();
  const px = width * height;
  for (let i = 0; i < px; i++) {
    const r = raw[i * 3];
    const g = raw[i * 3 + 1];
    const b = raw[i * 3 + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    let bin = bins.get(key);
    if (!bin) bins.set(key, (bin = { r: 0, g: 0, b: 0, n: 0 }));
    bin.r += r;
    bin.g += g;
    bin.b += b;
    bin.n++;
  }
  const top = [...bins.values()].sort((a, b) => b.n - a.n).slice(0, 2);
  return top.map((b) => toHex(b.r / b.n, b.g / b.n, b.b / b.n));
}

/** Extrae los coverImgSrc del fichero de constantes (regex sobre el TS). */
export function extractCoverImgSrcs(tsSource) {
  return [...tsSource.matchAll(/coverImgSrc:\s*'([^']+)'/g)].map((m) => m[1]);
}

async function extractPalette(coverImgSrc) {
  const { data, info } = await sharp(`src/${coverImgSrc}.avif`)
    .resize(32, 32)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return quantizeTopTwo(data, info.width, info.height);
}

async function main() {
  const covers = extractCoverImgSrcs(readFileSync(CONSTANTS_PATH, 'utf8'));
  if (covers.length === 0) {
    process.stderr.write(`[generate-palettes] no se encontraron coverImgSrc en ${CONSTANTS_PATH}\n`);
    process.exit(1);
  }

  const entries = [];
  for (const cover of covers) {
    const palette = await extractPalette(cover);
    entries.push(`  '${cover}': [${palette.map((c) => `'${c}'`).join(', ')}]`);
    console.log(`${cover}: ${palette.join(', ')}`);
  }

  const output = `// AUTO-GENERADO por scripts/generate-palettes.mjs — no editar a mano.
// Regenerar con: node scripts/generate-palettes.mjs

export const PROJECT_PALETTES: Record<string, [string, string]> = {
${entries.join(',\n')}
};
`;
  writeFileSync(OUTPUT_PATH, output, 'utf8');
  console.log(`\nEscrito: ${OUTPUT_PATH}`);
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  main().catch((err) => {
    process.stderr.write(`[generate-palettes] fatal: ${err.stack ?? err.message}\n`);
    process.exit(1);
  });
}
