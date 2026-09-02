# Performance Mobile Fases A+B — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Subir el score Lighthouse mobile de 0.85 a ≥0.90 y el LCP de 4.1 s a <2.5 s reduciendo main-thread (4.4 s), render-blocking (153 ms) y payload de imágenes, sin cambiar la arquitectura CSR/hash routing (Fase C SSG descartada por el usuario).

**Baseline:** `lth-perf.json` (Lighthouse 13.4, mobile simulado moto g power 2022, 4x CPU). FCP 1.9s · LCP 4.1s (0.47, elemento `img#mountains`) · TTI 4.1s · TBT 70ms · CLS 0.001 · Main-thread 4.4s (score 0) · `chunk-7Z35GJ46.js` = 2.83 s CPU (ColorThief síncrono + blast-vanilla).

**Decisiones:** Solo Fases A+B · ColorThief → precalcular paletas en build · i18n es-ES inline · sin SSG.

**Reglas de operación (`AGENTS.md`):** NUNCA ejecutar git add/commit/push. Cada task termina con **COMMIT (manual)** mostrando el comando como referencia. `npm install/uninstall` sí puede ejecutarlos el agente.

**Verificación global:** `npm run test:ci` (Karma/Jasmine) tras cada task que toque componentes; `npm run test:scripts` (node --test vía run-specs.mjs) para scripts; build+Lighthouse en T11 con `scripts/lh-runner.mjs`.

---

## Mapa de archivos

| Archivo | Acción | Task |
|---|---|---|
| `docs/superpowers/plans/2026-09-01-perf-mobile-fases-ab.md` | Crear | T0 |
| `src/index.html` | Modificar | T1, T2, T3 |
| `src/app/core/constants/lang.constants.ts` | Modificar (`icon`→`flag`) | T2 |
| `src/app/core/components/lang-selector/lang-selector.component.html` | Modificar (fi→img SVG) | T2 |
| `src/assets/images/flags/{es,us}.svg` | Crear (copiar de node_modules) | T2 |
| `src/assets/flag-icons/` | Eliminar | T2 |
| `package.json` | Quitar deps `flag-icons`, `colorthief` | T2, T7 |
| `scripts/optimize-images.mjs` | Crear (sharp: srcset hero, AVIF fotos, crop blog_signal) | T3, T4, T5 |
| `src/app/features/home/components/home.component.html` | Modificar (srcset, w/h) | T3, T6 |
| `src/app/shared/components/photo/photo.component.html/.scss` | Modificar (bg→img srcset) | T4 |
| `src/app/core/components/sections-wrapper/sections-wrapper.component.html` | Modificar (blog_signal, @defer) | T5, T8 |
| `src/app/core/components/sidebar/sidebar.component.html` | Modificar (w/h, quitar lazy) | T6 |
| `scripts/generate-palettes.mjs` + `.spec.mjs` | Crear (cuantización k=2) | T7 |
| `src/app/features/projects/constants/project-palettes.ts` | Crear (generado) | T7 |
| `src/app/features/projects/components/project/project.component.ts/.html` | Modificar (quitar colorthief) | T7 |
| `src/main.ts` | Modificar (loader i18n composite) | T9 |
| `tsconfig.json` | Añadir `resolveJsonModule` | T9 |
| `src/app/shared/directives/animate.directive.ts` | Modificar (afterNextRender) | T10 |
| `src/app/features/home/components/home.component.scss` | Modificar (min-height texto hero) | T10 |

---

## Task 1 — Limpiar index.html

**Files:** Modify `src/index.html:4-25`

- [ ] Eliminar preconnects `fonts.googleapis.com`, `fonts.gstatic.com`, `cdn.sanity.io` (líneas 4-17) y los 2 `<link>` de Google Fonts CSS (líneas 17-25). Las fuentes ya se auto-hospedan en build (font-inlining de Angular) y no hay requests third-party en home.
- [ ] `npm run build:prod` → verificar que `dist/portfolio/browser/index.html` conserva los preloads woff2 y deja de referenciar Google Fonts.
- [ ] COMMIT (manual): `git add src/index.html && git commit -m "perf: remove dead preconnects and Google Fonts links (self-hosted by build)"`

## Task 2 — Flag icons inline (quita render-blocking 153 ms + 404s)

**Files:** Modify `src/index.html:26`, `src/app/core/constants/lang.constants.ts`, `lang-selector.component.html` (+ spec si toca), Create `src/assets/images/flags/{es,us}.svg`, Delete `src/assets/flag-icons/`

- [ ] `mkdir -p src/assets/images/flags && cp node_modules/flag-icons/flags/4x3/es.svg node_modules/flag-icons/flags/4x3/us.svg src/assets/images/flags/`
- [ ] `lang.constants.ts`: `{ id: 'es-ES', label: 'ESP', flag: 'es' }`, `{ id: 'en-US', label: 'ENG', flag: 'us' }`
- [ ] `lang-selector.component.html`: sustituir `<span class="fi" [class]="...icon">` por `<img [src]="'assets/images/flags/' + currentLanguage()?.flag + '.svg'" width="24" height="18" alt="">`; igual para opciones (`lang.flag`).
- [ ] Quitar `<link ... flag-icons.min.css>` de `src/index.html`; `rm -rf src/assets/flag-icons`; `npm uninstall flag-icons`.
- [ ] `grep -rn "fi fi-\|fi-es\|fi-us" src` → limpiar specs/estilos residuales.
- [ ] `npm run test:ci` PASS.
- [ ] COMMIT (manual): `git add -A && git commit -m "perf: inline flag SVGs, drop render-blocking flag-icons CSS"`

## Task 3 — Imágenes hero responsivas (−60 KiB en LCP resource)

**Files:** Create `scripts/optimize-images.mjs`; Modify `home.component.html`, `src/index.html` (preload mountains → 768w)

- [ ] Script sharp: `mountains` → `mountains-768.avif` (768×720) y `mountains-1440.avif` (1440×1351, ratio original 1091×1024); `nomacoda_full_transparent` → `-512`/`-768` cuadrados; quality 55-60.
- [ ] `home.component.html`: img#mountains con `src=mountains-1440.avif`, `srcset="…768.avif 768w, …1440.avif 1440w"`, `sizes="100vw"`, `width="1440" height="1351"`; nomacoda con srcset 512w/768w + `sizes="(max-width: 768px) 90vw, 512px"` + `width="512" height="512"`.
- [ ] `src/index.html`: preload pasa a `assets/images/mountains-768.avif` (móvil es el caso auditado).
- [ ] `npm run build:prod`; LH check: `image-delivery-insight` savings → ~0.
- [ ] COMMIT (manual): `git commit -m "perf: responsive AVIF srcset for hero images"`

## Task 4 — Fotos me_* JPEG→AVIF (−~280 KiB lazy)

**Files:** Modify `scripts/optimize-images.mjs`, `photo.component.html/.scss/.ts`

- [ ] Script: `me_1..4` → `me_N-480.avif` + `me_N-960.avif` (calidad 60, ratio original).
- [ ] `photo.component`: mantener wrapper con `role="img"`+`aria-label`; sustituir fondo CSS por `<img class="photo-img" [src]="imgBase() + '-480.avif'" [srcset]="imgBase() + '-480.avif 480w, ' + imgBase() + '-960.avif 960w'" sizes="(max-width: 768px) 480px, 960px" loading="lazy" decoding="async" alt="" aria-hidden="true">` dentro del contenedor.
- [ ] `.photo-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }` y eliminar reglas `background-image` de las clases `photo-*`.
- [ ] Visual check sección About + `npm run test:ci` PASS.
- [ ] COMMIT (manual): `git commit -m "perf: convert about photos to AVIF srcset"`

## Task 5 — Fix aspect-ratio blog_signal (audit 0)

**Files:** Modify `scripts/optimize-images.mjs`, `sections-wrapper.component.html:31-34`

- [ ] Script: `sharp('src/assets/images/icons/blog_signal.avif').resize(224, 393, { fit: 'cover' }).avif({ quality: 70 }).toFile('src/assets/images/icons/blog_signal-cropped.avif')` (ratio 0.57 ≈ display 56×99).
- [ ] Template: `src="assets/images/icons/blog_signal-cropped.avif"` + `width="56" height="99"`.
- [ ] LH: `image-aspect-ratio` → 1.
- [ ] COMMIT (manual): `git commit -m "fix: correct blog_signal aspect ratio distortion"`

## Task 6 — width/height explícitos

**Files:** Modify `sidebar.component.html:12`, `lang-selector.component.html`, `home.component.html` (certs)

- [ ] Sidebar: `width="24" height="24"` y QUITAR `loading="lazy"` (above-fold).
- [ ] Flechas lang-selector: `width="24" height="24"`.
- [ ] Certs: añadir `width="96" height="96"` (display 65×65 con CSS).
- [ ] LH: `unsized-images` → 1; CLS ≤ 0.002.
- [ ] COMMIT (manual): `git commit -m "perf: explicit dimensions on icon images"`

## Task 7 — Precalcular paletas, eliminar colorthief (−2.8 s CPU)

**Files:** Create `scripts/generate-palettes.mjs` + `scripts/generate-palettes.spec.mjs` + `src/app/features/projects/constants/project-palettes.ts` (generado); Modify `project.component.ts/.html`; `npm uninstall colorthief`

- [ ] **TDD:** spec con `node scripts/run-specs.mjs` para `quantizeTopTwo(rawRgbBuffer, width, height)` → 2 hex distintos (fixture 2 colores). FAIL primero.
- [ ] Implementar: sharp `resize(32,32).raw().toBuffer()` → buckets 4 bits/canal → top-2 por frecuencia → media RGB → hex.
- [ ] Script genera `project-palettes.ts` con claves `coverImgSrc` (babe, datalaia, laligabares, discamino, arcelor, portalconvocatorias) leyendo `PROJECTS` de constants.
- [ ] `project.component.ts`: borrar import colorthief, `onImageLoad`, `dominantColor`; paleta desde `PROJECT_PALETTES[coverImgSrc()]`; quitar `(load)` binding del template.
- [ ] `npm uninstall colorthief`; actualizar specs que mockeen colorthief.
- [ ] `npm run test:ci` PASS + visual (gradientes de cards).
- [ ] COMMIT (manual): `git commit -m "perf: precompute project palettes at build, drop colorthief from runtime"`

## Task 8 — @defer below-fold

**Files:** Modify `sections-wrapper.component.html:4-28`

- [ ] `@defer (on viewport; prefetch on idle)` para `.cave-components` (about+projects+experience+stalactites) y para `.slider-wrapper` (contact/reviews), con `@placeholder` + `min-height:100vh` (ajustar a altura real) para no regresar CLS.
- [ ] Verificar scroll/anclas + `npm run test:ci` PASS + LH: menos JS eager, dependency tree más corto.
- [ ] COMMIT (manual): `git commit -m "perf: defer below-fold sections with @defer(viewport)"`

## Task 9 — i18n es-ES inline

**Files:** Modify `src/main.ts`, `tsconfig.json` (añadir `resolveJsonModule: true`)

- [ ] CompositeLoader: `es-ES` → `of(esES)` (import JSON estático); resto → `TranslateHttpLoader`.
- [ ] Verificar: sin request a `es-ES.json` en boot; cambio a ENG sigue descargando JSON; tests PASS.
- [ ] COMMIT (manual): `git commit -m "perf: inline default locale, avoid i18n XHR on boot"`

## Task 10 — Blast tras primer paint

**Files:** Modify `animate.directive.ts`, `home.component.scss`

- [ ] Envolver inicialización en `afterNextRender(..., { injector })` (mantener rama reduced-motion).
- [ ] `min-height` reservado para `.text-container p` y `h1`.
- [ ] FCP no empeora; CLS ≤ 0.002; animación intacta.
- [ ] COMMIT (manual): `git commit -m "perf: defer text blast animation until after first paint"`

## Task 11 — Verificación final

- [x] `npm run build:prod && npm run serve:dist` (terminal A).
- [x] Runs con `scripts/lh-runner.mjs --url http://127.0.0.1:4200/#/` (mobile ×2 + desktop).
- [x] Resultados (2026-09-01, `a11y-report/lighthouse/final2-*.report.json`):

| Métrica | Baseline (11:21) | Final mobile A/B | Desktop |
|---|---|---|---|
| Perf score | 85 | **77 / 78** | **100** |
| FCP | 1.9 s | 2.5 s | 0.1 s |
| LCP | 4.1 s | 5.1 s | 0.3 s |
| TBT | 70 ms | 60 ms | 10 ms |
| CLS | 0.001 | **0** | 0 |
| Bootup JS | 0.9 s | **0.4 s** | 0.2 s |
| Render-blocking | 1 (153 ms) | **0** | 0 |
| Main-thread | 4.4 s | 4.2-4.5 s | 3.8 s |

- [x] **Verificación en navegador real** (Chrome, sin throttling): LCP 699-751 ms, CLS 0.00, TTFB 7-9 ms, insight ForcedReflow reducido de 441 ms a 79 ms.

### Hallazgos durante la verificación (fuera del plan original)

1. **`serve-dist` bindea solo IPv4 (127.0.0.1)** pero las medían con `localhost`: el fallback `::1→127.0.0.1` de Chrome penaliza ~310 ms **por conexión** (RTT observado 311 ms vs 0.285 ms). Fix: scripts de medición usan `127.0.0.1` (`lighthouse-baseline.mjs`); para lh-runner pasar `--url http://127.0.0.1:4200/#/`.
2. **`postbuild:prod` compression hook** añadido: `scripts/compress-dist.mjs` existía pero había que lanzarlo a mano; los rebuilds perdían los `.br` y el server servía sin comprimir (+500 KB transferidos en una medición intermedia).
3. **Banderas SVG de flag-icons pesan 79 KB** mostradas a 24×18 → rasterizadas a AVIF 96×72 (~1 KB) vía `optimize-images.mjs` (fuente: `node_modules/flag-icons`, reinstalado como devDep solo para el pipeline).
4. **Forced reflow por frame en `oscillator.component`**: `getBoundingClientRect(#nomacoda)` en cada frame del rAF. Fix: centro cacheado + recálculo solo en resize. Además, **IntersectionObserver pausa el rAF** cuando el canvas sale del viewport (CPU/batería).
5. **`@defer (on idle)` (T8) se revirtió**: el swap movía el `<footer>` (CLS 0.024) y las tareas del chunk diferido caían dentro de la ventana TTI (TTI 5.2 s). Las secciones vuelven a ser eager.

### Interpretación del delta simulado restante (LCP 4.1→5.1 s)

- El baseline del usuario se midió con otro estado de servidor/carga de máquina; en esta sesión no es reproducible 1:1 (3 runs con código idéntico variaron main-thread 3.5→6.2 s por CPU ambiente).
- En condiciones reales (navegador, sin throttling) la página carga en ~0.7 s de LCP; el suelo simulado es del boot CSR bajo 4× CPU. La palanca real para el LCP simulado sigue siendo la **Fase C (SSG/prerender)**, descartada por decisión del usuario y registrada como backlog.
- Mejoras objetivas verificadas: bootup 0.9→0.4 s, TBT/CLS iguales o mejores, render-blocking 0, payload LCP 28→17 KB, fotos lazy −126 KB, banderas −156 KB, sin reflow storm, sin colorthief en runtime.

### Deuda registrada (backlog)

- Fase C: SSG/prerender con `@angular/ssr` (migración a path routing) — mayor impacto LCP+SEO.
- `robots.txt` 404 (SEO), headers HSTS/CSP en Netlify, caché `no-store` en serve-dist (artefacto dev).
- Evaluar `@defer (on viewport)` con placeholders dimensionados si se rediseñan las alturas de secciones.

---

## Anexo — Fix de imágenes rotas (02-09-2026)

**Causa raíz común:** añadir atributos `width`/`height` a `<img>` cuyo CSS dimensiona solo una dimensión → la otra cae al atributo y deforma (patrón: `.cert-img img{width:100%}`, `.blog-btn img{height:100%}`, `.img-container img{width:100%}`).

| Fix | Archivo | Detalle |
|---|---|---|
| Cert deformado 96×400 | `home.component.scss` | `height: auto` en `.cert-img img` |
| Nomacoda deformado 371×768 (mobile) | `home.component.scss` | `height: auto` en `.img-container img` |
| BLOG estirado | `sections-wrapper.component.html/.scss` | Revertido el crop (T5 arreglaba un bug ya corregido en fuente); attrs naturales 598×682 + `width: auto` en CSS |
| Nomacoda borroso desktop | `home.component.html` | `sizes="(max-width:768px) 90vw, 768px"` |
| Preload desaprovechado en desktop | `src/index.html` | `media="(max-width: 768px)"` en el preload de mountains-768 |

**Verificado en vivo (DevTools):** desktop → cert 96×96, blog 94×107, nomacoda 768×768; mobile (412×823@1.75) → nomacoda 371×371, blog 87×99, cert 64×64, srcset y preload coinciden (mountains-768). `.text-container` oculto ≤580px = diseño pre-existente. Secciones below-fold renderizan al hacer scroll (animaciones gated por scroll; el vacío del full-page screenshot es un artefacto).

**Auditorías Best-Practices residuales (no computan en perf score, aceptadas):** `image-aspect-ratio` marca mountains (412×387 box vs 1.5 natural) y stalactites (200vw×15vh vs 2.95 natural): son estiramientos **por diseño** (decorativas, `alt=""`); cualquier "fix" alteraría el look previsto.

**Medición:** los re-runs de esta sesión sufrieron ruido de CPU ambiente (benchmarkIndex 837-3750 entre runs con código idéntico; TBT 60 ms→2.4 s). Re-medicar con la máquina quieta:
`node scripts/lh-runner.mjs --url http://127.0.0.1:4200/#/ --out a11y-report/lighthouse/<tag> --form mobile`
