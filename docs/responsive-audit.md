# Auditoría responsive — Portfolio Nomacoda

**Fecha:** 12/11/2026
**Entorno probado:** `ng serve` (dev, puerto 4200) · Chrome DevTools con emulación de viewport
**Cobertura:** 7 rutas (`/`, `/about-me`, `/success-cases`, `/reviews`, `/contact`, `/blog`, `/blog/:slug`, 404) × 8 viewports (320×700, 360×800, 390×844, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080) + landscape 844×390 + zoom 200% (640×450)
**Método:** barrido automático de overflow (rects de elementos vs viewport, excluida decoración `pointer-events:none`) + diagnóstico de computed styles + capturas + verificación de targets táctiles y consola.

---

## Resumen ejecutivo

| Veredicto | Detalle |
|---|---|
| Overflow horizontal | Solo en **blog <361px** y **404 en todas las anchuras móviles** |
| WCAG 1.4.10 (reflow 320px) | Cumple en 5 de 7 rutas; falla en blog y 404 |
| WCAG 1.4.4 (zoom 200%) | Cumple — sin scroll bidireccional |
| WCAG 1.3.4 (orientación) | Cumple — contact oculta intro en landscape por diseño (información accesible en portrait) |
| WCAG 2.5.8 (targets 24px) | Cumple en todas las rutas |
| Consola | Sin errores |

La web es sólida en general: el one-pager reflowe correctamente de 320px a 1920px en las secciones home, about, success-cases, reviews y contact. Los dos problemas reales están acotados y tienen fix sencillo.

---

## Hallazgos

### 🔴 Crítico

**C1 — Página 404 rota en móvil: clase de ocultación inexistente**
- **Dónde:** `not-found-404.component.html:7` usa `class="visually-hidden"`, pero el global solo define `.sr-only` (`src/styles/styles.scss:33`).
- **Efecto:** el `<h1>` ("¡Vaya! Parece que esa ruta no existe") se renderiza **visible a 64px** en flujo del contenedor flex. Al ocupar 211px extra, el centrado del flex desplaza la ilustración **−105px fuera del viewport** (figura recortada tras el dock) y el texto gigante sale cortado por el borde derecho. Ocurre en todas las anchuras móviles.
- **Evidencia:** `docs/responsive-audit-screenshots/404-390.png` (h1 medido: fs 64px, w 211, r 496; imagen l=−105).
- **Fix:** sustituir `visually-hidden` por `sr-only` en el h1 del 404 (con `.sr-only` el h1 queda 1×1px y el flex centra solo la imagen).

### 🟠 Alto

**A1 — Sin navegación de salto en móvil (diseño)**
- **Dónde:** `header.component.scss:257` oculta `.header-nav` a ≤1024px; no existe menú hamburguesa ni equivalente.
- **Efecto:** en móvil/tablet solo quedan brand (→ `/`), idioma, dock social y CTAs inline. El contenido completo es alcanzable porque todas las rutas renderizan el one-pager (home+about+success-cases+reviews+contact, verificado) y la ruta hace scroll a su sección, pero **no hay forma de saltar entre secciones** ni de volver a una sección concreta sin scrollear desde `/`.
- **Fix sugerido:** menú hamburguesa con los 4 enlaces de sección (ancla al one-pager) visible ≤1024px, o persistir una barra de anclas compacta.

**A2 — Blog: tarjetas recortadas en viewports <361px**
- **Dónde:** `blog.component.scss:242` — `.blog-cards-container { grid-template-columns: 1fr }` a ≤980px; las `.post-card` imponen `min-content` de 216.875px (meta con fechas/categoría).
- **Efecto medido @320px:** contenedor 152px, track del grid 216.875px → tarjetas desbordan 25px+ por la derecha y quedan **recortadas en silencio** por `overflow:hidden` (`.blog`, `blog.component.scss:21`). A 360px ya cabe (verificado). Violación puntual de WCAG 1.4.10 en el ancho de referencia de 320px.
- **Fix:** `grid-template-columns: minmax(0, 1fr)` y/o `min-width: 0` en `.post-card` para permitir el encogimiento por debajo del min-content (o reducir el padding/margins del contenedor a ≤520px para dar espacio).

### 🟡 Medio

**M1 — Spinner de carga fijo 400×400 se recorta en pantallas pequeñas**
- **Dónde:** `loading.component.scss:16-20` (`width:400px; height:400px`) — sin media query que lo reduzca.
- **Efecto:** en <400px de ancho el compuesto se corta visualmente (el scroll está mitigado por `overflow-x:hidden` global, `styles.scss:270`, y `overflow:hidden` de `.blog`). Usado por `blog.component.html:4-7`.
- **Fix:** `width: min(400px, 100%)` + `aspect-ratio: 1` o clamp.

**M2 — `pre`/`code` del artículo sin gestión de desbordamiento (latente)**
- **Dónde:** `blog-article.component.scss:131-174` (bloque `::ng-deep` de contenido Sanity) no define nada para `pre`/`code`. Si el CMS emite bloques de código con líneas largas, desbordan la tarjeta (recorte silencioso).
- **Fix:** `pre { overflow-x: auto; }` en el bloque `::ng-deep`.
- **Nota:** el `::ng-deep` está justificado como excepción documentada (DOM de terceros del CMS) conforme a AGENTS.md.

**M3 — Targets táctiles entre 24–44px (mejora AAA 2.5.5)**
- AA 2.5.8 (24px) **cumple** en todas las rutas (verificado dinámicamente). Elementos por debajo de 44px:
  - Trigger del selector de idioma: 63×26px (`lang-selector.component.scss:10-18`)
  - Items del dock social: 40×40px (`sidebar.component.scss:181-187`)
  - `.blog-btn` del footer: 36px de alto (`footer.component.scss:55`)
  - `.star-btn` de valoración: ~28px (`reviews-form.component.scss:115-134`)
  - `+ info`: 38px (`success-case.component.scss:72-91`)
- **Fix sugerido:** padding mínimo hasta 44px de alto en móvil en los cinco casos.

**M4 — UX del one-pager: el modal de success-case persiste entre rutas**
- Al abrir un caso con "+ info" y navegar (brand → otra sección), el overlay fijo sigue abierto sobre la nueva vista (mismo documento, una sola instancia). Coherente como SPA one-pager, pero confuso desde el punto de vista de "navegación".
- **Fix sugerido:** cerrar el detalle al cambiar de ruta (suscripción a router events) o anclar modal a la ruta de success-cases.

### ⚪ Bajos / notas

- **Footer sin wrap (R7, descartado dinámicamente):** medido @320 — `footer-meta [64..152]`, `blog-btn [152..296]`, sin overflow real. Aun así, añadir `flex-wrap: wrap` al `.footer-bar` eliminaría el margen de riesgo casi exacto (250px de contenido vs 232px útiles).
- **Chips de review-card sin wrap (R8):** riesgo estático con `white-space:nowrap` (`review-card.component.scss:96,104`) que no se manifestó en las pruebas. Vigilar con categorías largas.
- **`width:100vw` en fixed (R1/R3):** `app.component.scss:3` es regla muerta (no matchea ningún elemento) y `not-found-404.component.scss:7` está mitigado por `overflow-x:hidden`. Recomendación preventiva: usar `left:0; right:0` o `inset:0` en su lugar (100vw incluye la scrollbar).
- **Código muerto con responsive:** `ExperienceComponent` no se usa en ninguna plantilla (sus media queries 118-172 son inalcanzables) y `ToggleButtonComponent` tampoco. Decidir: eliminar o integrar.
- **Hover sin réplica en foco (menor):** efectos decorativos de `:hover` sin pareja `:focus-visible` en blog back-btn (`blog.component.scss:175-189`), 404 portfolio-btn, flecha de volver del artículo y CTA primaria de home. No bloquean el flujo (son motion-only).

---

## WCAG 2.1/2.2 — criterios responsive

| Criterio | Resultado | Detalle |
|---|---|---|
| 1.4.10 Reflow (320px) | ⚠️ Parcial | Falla blog (A2) y 404 (C1); resto cumple |
| 1.4.4 Reescalado (200%) | ✅ | Sin scroll bidireccional @640×450 |
| 1.3.4 Orientación | ✅ | Queries por `max-height` de contact ocultan solo el intro; formulario siempre accesible; nada requiere landscape |
| 2.5.8 Target size (AA) | ✅ | Ningún target <24px |
| 2.5.5 Target size (AAA) | ⚠️ | M3: 5 tipos de control entre 24-43px |
| 2.5.3 Etiqueta en el nombre | ✅ | Iconos con `aria-label` (dock, cerrar modal) |
| `prefers-reduced-motion` | ✅ | 5 bloques correctos |
| `prefers-contrast` | ✅ | 2 bloques correctos |

---

## Inventario de breakpoints (análisis estático)

52 bloques `@media` en 33 archivos SCSS: **30 max-width** (18 valores distintos), **6 max-height** (2 valores), **9 compuestos ancho+alto**, 7 de preferencias.

### max-width
| px | Usos | Archivos |
|---|---|---|
| 1300 | 2 | reviews:103, success-cases:44 |
| 1280 | 2 | header:247, footer:108 |
| 1250 | 1 | experience:118 *(código muerto)* |
| 1150 | 1 | home:165 |
| 1030 | 1 | styles.scss:536 |
| 1024 | 1 | header:257 |
| 980 | 3 | about:142, blog:237, blog-article:458 |
| 930 | 2 | reviews:109, success-cases:50 |
| 800 | 1 | experience:136 *(código muerto)* |
| 790 | 1 | styles.scss:546 |
| 780 | 1 | home:191 |
| 720 | 2 | contact:168, contact-form:28 |
| 640 | 4 | header:263, footer:114, contact-form:192, reviews-form:44 |
| 620 | 1 | experience:148 *(código muerto)* |
| 580 | 1 | home:201 |
| 530 | 1 | styles.scss:556 |
| 520 | 4 | about:166, blog:247, blog-article:464, experience:172 |
| 480 | 1 | lang-selector:95 |

### max-height
950 ×5 (contact:123, contact-form:19/38/134/188) · 880 ×1 (home:159)

### Compuestos
- `(min-width:721px) and (max-height:730px)` / gemela `(max-width:720px) and (max-height:840px)` — 6 bloques (contact:131, contact-form:23/42/69/104/139)
- `(min-width:721px) and (max-height:560px)` / gemela `(max-width:720px) and (max-height:648px)` — 2 (contact:154, contact-form:144)
- `(max-width:580px) and (max-height:700px)` — 1 (home:226)

## Propuesta: tokens centralizados (`src/styles/_breakpoints.scss`)

Sistema de 6 escalones que absorbe los 18 valores actuales (los pares casi redundantes 1300/1280, 1030/1024, 980/930, 790/780/720, 640/620, 530/520/480 se unifican):

```scss
// Mobile-first: base = móvil (<600px)
$sm: 600px;   // << absorbe 580, 620, 640, 720 (móvil → tablet)
$md: 768px;   // tablet (absorbe 780, 790, 800)
$lg: 1024px;  // tablet landscape / laptop (absorbe 930, 980, 1024, 1030)
$xl: 1280px;  // desktop (absorbe 1150, 1250, 1280, 1300)
// alturas (solo contact-form/contact/home):
$short: 950px;  // viewport verticalmente corto
$tiny: 700px;   // viewport muy corto (rotación)
```

**Ventajas:** nomenclatura reutilizable vía `@use`, un único lugar para afinar, eliminación de la deriva de ±10px entre componentes hermanos (p.ej. blog a 980 vs reviews a 930 hoy).
**Coste:** migración de 30 bloques y revisión visual de los ±10px de diferencia en los puntos de unificación.
**Recomendación:** adoptarlo solo en componentes nuevos/toques futuros, o planificar migración por fases empezando por header/footer/blog (los de hallazgos A1/A2/M1), que se tocarán para aplicar los fixes de esta auditoría.

---

## Evidencia

Capturas en `docs/responsive-audit-screenshots/`:
- `blog-320.png` — A2: tarjetas recortadas por la derecha tras el dock
- `404-390.png` — C1: h1 gigante visible + ilustración desplazada
- `reviews-form-390.png` — formulario de reseñas correcto en móvil
- `article-390.jpeg` — artículo correcto en móvil
- `contact-landscape-844.jpeg` — contact en landscape (intro oculto por diseño, formulario usable)

Verificaciones dinámicas automatizadas (sw = scrollWidth del documento):

| Viewport | Rutas con overflow detectado |
|---|---|
| 320×700 | `/blog` (7 elementos, A2) · `/no-existe` (C1) |
| 360×800 | `/no-existe` (C1) |
| 390×844 | `/no-existe` (C1) |
| 768×1024 · 1024×768 · 1280×800 · 1440×900 · 1920×1080 | ninguna |
| 640×450 (zoom 200%) | ninguna (home: sw=640, contact: sw=625) |

---

## Orden de fixes recomendado

1. **C1** — una línea: `visually-hidden` → `sr-only` en el 404.
2. **A2** — `minmax(0, 1fr)` en blog-cards-container (+ revisar padding a ≤520).
3. **M1** — `min(400px, 100%)` en el loading.
4. **M2** — `pre { overflow-x: auto }` en el `::ng-deep` del artículo.
5. **A1** — decisión de diseño: hamburguesa/anclas para móvil.
6. **M3/M4** — mejoras de targets y de persistencia del modal.
7. **Tokens de breakpoints** — adoptar en próximos cambios de esos componentes.

---

## Fixes aplicados (12/11/2026)

| Hallazgo | Estado | Cambio | Verificación |
|---|---|---|---|
| C1 (404) | ✅ **Corregido** | `not-found-404.component.html:7` — clase del h1 `visually-hidden` → `sr-only` (la global correcta). La imagen vuelve a centrarse (`left=0..390` medido) y el título queda oculto (`clip-path: inset(50%)`, 1×1px) | TDD RED→GREEN: test nuevo en `not-found-404.component.spec.ts` + medición en 390px |
| A2 (blog <361px) | ✅ **Corregido** | `blog.component.scss:242` — `grid-template-columns: minmax(0, 1fr)`; `post-card.component.scss` — `flex-wrap: wrap` en `.post-card__meta` para que fecha/categoría envuelvan en tracks estrechos | Medición @320px: tarjetas ahora 152px de ancho, `right=280 ≤ 320` (antes 217px recortadas en `right=345`) |
| M1 (loading 400px) | ✅ **Corregido** | `loading.component.scss` — `width: min(400px, 100%)` + `aspect-ratio: 1` (sin alto fijo) | Medición @320px con red limitada: compuesto 320×320 (antes 400×400 recortado) |
| M2 (pre/code latente) | ✅ **Corregido** | `blog-article.component.scss` — dentro del bloque `::ng-deep` documentado del contenido Sanity: `pre { max-width: 100%; overflow-x: auto }` + `pre code { display: block; white-space: pre }` | Regla compilada en el CSS servido; sin `pre` en el contenido actual para medir en caliente |
| A1 (nav móvil) | ✅ **Cerrado por decisión de diseño** | Sin cambio de código: se mantiene la nav oculta ≤1024px y el contenido íntegro por scroll en el one-pager (decisión del 12/11/2026) | — |
| M3 (targets 24-43px) | ✅ **Corregido** | En móvil (≤640px, ≤480px el selector): lang trigger y `blog-btn` `min-height: 44px`; dock items/toggle 44×44; `info-btn` `min-height: 44px` + padding-block 0.75rem; estrellas con truco padding 0.625rem + margen -0.625rem (área de toque 44×44 sin mover el layout) | Medido @390px: trigger 63×44, dock 44×44, blog-btn 86×44, star-btn 44 (pad 10px), info-btn 94×44 |
| M4 (modal persistente) | ✅ **Corregido** | `success-cases.component.ts` — suscripción a `Router.events` (`NavigationEnd`, `takeUntilDestroyed`) que cierra el detalle al cambiar de ruta | TDD RED→GREEN: test nuevo "should close the modal when the route changes" en `success-cases.component.spec.ts` |
| Tokens breakpoints | ⏸ **Diferido** | No se migran en esta pasada: cambiar valores (980→1024, etc.) implica revisión visual aparte; se mantiene la recomendación para migración por fases | — |

**Suite de tests:** 481 tests — 471 SUCCESS (incluidos 2 nuevos de esta pasada) / 10 FAILED. La línea base SIN los cambios de esta pasada da el mismo resultado: 469 SUCCESS + 10 FAILED (verificado con `git stash`) — los fallos son **preexistentes** en `feature/restyling` (artefactos i18n de axe en shell y specs de submit de reviews-form, ajenos a esta auditoría). Cero regresiones introducidas.

**Nota:** durante la verificación, el dev server de usuario en 4200 no refrescó el SCSS de reviews-form hasta un rebuild tardío (se verificó con un `ng serve` efímero en 4299 y luego con el rebuild del 4200). Si algo no se ve actualizado, reiniciar `ng serve`.

**Evidencia post-fix:** `docs/responsive-audit-screenshots/404-390-after.jpeg` y `blog-320-after.jpeg` (+ mediciones automatizadas en el texto de arriba).
