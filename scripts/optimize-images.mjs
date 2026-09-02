#!/usr/bin/env node
/**
 * optimize-images.mjs — Genera variantes AVIF responsivas para el portfolio.
 *
 * Tareas cubiertas:
 *  - T3: mountains (hero LCP) + nomacoda (logo y fondo) con srcset 512/768/1440w
 *  - T4: fotos me_* JPEG → AVIF (480/960w) para el image-set del photo component
 *  - T5: blog_signal recortado al aspect-ratio mostrado (56x99 → 224x393)
 *
 * Idempotente: regenera siempre los ficheros de salida.
 * Uso: node scripts/optimize-images.mjs
 */
import sharp from 'sharp';

const JOBS = [
  // T3 — hero mountains: natural 1536x1024, display 100vw
  {
    in: 'src/assets/images/mountains.avif',
    outs: [
      { w: 768, out: 'src/assets/images/mountains-768.avif' },
      { w: 1440, out: 'src/assets/images/mountains-1440.avif' }
    ]
  },
  // T3 — nomacoda logo: natural 800x800, display ~371 CSS px
  {
    in: 'src/assets/images/nomacoda/nomacoda_full_transparent.avif',
    outs: [
      { w: 512, out: 'src/assets/images/nomacoda/nomacoda_full_transparent-512.avif' },
      { w: 768, out: 'src/assets/images/nomacoda/nomacoda_full_transparent-768.avif' }
    ]
  },
  // T3 — nomacoda fondo decorativo: natural 1024x1024
  {
    in: 'src/assets/images/nomacoda/nomacoda_background.avif',
    outs: [
      { w: 512, out: 'src/assets/images/nomacoda/nomacoda_background-512.avif' },
      { w: 768, out: 'src/assets/images/nomacoda/nomacoda_background-768.avif' }
    ]
  },
  // T4 — fotos About: base me_N-480/-960 jpeg → AVIF (misma resolución)
  ...[1, 2, 3, 4].flatMap((n) => [
    {
      in: `src/assets/images/photos/me_${n}-480.jpeg`,
      outs: [{ w: 480, out: `src/assets/images/photos/me_${n}-480.avif` }]
    },
    {
      in: `src/assets/images/photos/me_${n}-960.jpeg`,
      outs: [{ w: 960, out: `src/assets/images/photos/me_${n}-960.avif` }]
    }
  ])
];

// Banderas del lang-selector: los SVG de flag-icons pesan ~79 KB pero se
// muestran a 24x18 px. Se rasterizan a 96x72 AVIF (nítido hasta dpr 4, ~1 KB).
// Fuente: el paquete npm flag-icons (no copiar los SVG a assets: pesan mucho).
const FLAG_JOBS = [
  {
    in: 'node_modules/flag-icons/flags/4x3/es.svg',
    out: 'src/assets/images/flags/es.avif'
  },
  {
    in: 'node_modules/flag-icons/flags/4x3/us.svg',
    out: 'src/assets/images/flags/us.avif'
  }
];

async function run() {
  for (const job of JOBS) {
    for (const { w, h, fit, out } of job.outs) {
      let pipeline = sharp(job.in);
      pipeline =
        fit === 'cover'
          ? pipeline.resize(w, h, { fit: 'cover' })
          : pipeline.resize({ width: w, withoutEnlargement: true });
      const info = await pipeline.avif({ quality: 60 }).toFile(out);
      console.log(`${out}: ${info.width}x${info.height} ${Math.round(info.size / 1024)} KiB`);
    }
  }
  for (const flag of FLAG_JOBS) {
    const info = await sharp(flag.in)
      .resize(96, 72, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .avif({ quality: 80 })
      .toFile(flag.out);
    console.log(`${flag.out}: ${info.width}x${info.height} ${Math.round(info.size * 100 / 1024) / 100} KiB`);
  }
}

run().catch((err) => {
  process.stderr.write(`[optimize-images] fatal: ${err.message}\n`);
  process.exit(1);
});
