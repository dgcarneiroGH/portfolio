# Diseño — Rediseño de la vista de artículo del blog (2026-10-19)

## Intento y por qué

La vista de artículo abierto (`/blog/:slug`) está hoy inline en `blog.component.html`
(marcada con el comentario "Vista de artículo pendiente de rediseño"). Se rediseña
siguiendo el mock de Figma (tarjeta azure con blur, tipografía mono para etiquetas,
numeración de secciones, barra de acciones, tarjeta de autor y navegación entre
artículos), aplicando los cambios que el autor pidió explícitamente sobre el mock.

## Cambios pedidos sobre el mock (autoridad: la conversación)

1. El título va **más grande** que en el mock.
2. Tag y fecha: se muestran **como actualmente** — únicamente la fecha arriba a la
   derecha del post (sin pill de categoría/tag; se conserva el botón de volver).
3. Debajo de la imagen **no** hay subtexto (fuera el "Fig 1.").
4. Tras la imagen se muestra la noticia como tal; **no** hay apartado de reflexión
   ("REFLEXIÓN NOMACODA" no existe como bloque).
5. Botón "Me resultó útil" al pie, con contador persistido **en Sanity**.
6. Compartir en **LinkedIn**.
7. Pie: tarjeta de autor (foto que el usuario añadirá, descripción, enlace a
   contacto) y botones de **artículo anterior / siguiente**.

## Decisiones cerradas con el autor

- **Sin panel de stats** (98.4% / +340% / <60 min del mock: fuera).
- **Sin hashtags** (`#InteligenciaArtificial`…: fuera, no pedidos).
- **Fuentes**: se reutilizan las del proyecto (Space Grotesk headings, Inter body,
  mono de sistema). El mock nombraba Manrope/Hanken/JetBrains Mono: no se añaden.
- **Botón útil**: función Netlify que hace patch `inc` en Sanity con write token;
  un clic por navegador vía localStorage; sin des-marcar.
- **Tarjeta de autor**: estática, textos i18n, foto como asset local.

## Decisiones del implementador (rulings)

- Al llegar al extremo de la lista, el botón anterior/siguiente **se oculta**.
- Contador **optimista** con reversión si la llamada falla.
- Foto esperada en `src/assets/images/nomacoda/author.avif` (el usuario la suelta).
- Los `h2` del contenido llevan numeración automática `01 //` vía **CSS counters**
  (no hay que mantener números a mano en Sanity).
- El título del artículo pasa a `<h1>` (en vista artículo la lista no se renderiza).
- La reflexión no es un bloque: si un post la quiere, se escribe en su propio
  contenido de Sanity.

## Mapeo de colores design → tokens existentes (`_palette.scss`)

| Mock | Token |
|---|---|
| `#FFA726` (orange-57) | `$accent-yellow` |
| `#8ED4C2` (spring-green-69) | `$green-soft` |
| `#29B6F6` (azure-56) | `$accent-blue` |
| `#2ECC71` (spring-green-49) | `$accent-green` |
| `#F0F4F8` (grey-96-2) | `$text-primary` |
| `#A0BBD8` (azure-74) | `$text-secondary` |
| `#081A2C` (azure-10) | `$surface-pill` |
| `rgba(0,28,55,α)` (azure-11) | `rgba($surface-blog-mid, α)` |
| `rgba(5,43,77,α)` (azure-16) | `rgba($surface-action, α)` |
| `rgba(0,33,62,α)` (azure-12) | `rgba($surface-card, α)` |
| `rgba(17,95,81,α)` (cyan-22) | `rgba($background-gradient-end, α)` |

Cero tokens de color nuevos. Sombras: `rgba(0,0,0,α)` (excepción documentada).

## Estructura de la página (arriba a abajo)

1. Header: botón volver (flecha AVIF actual, animada) + fecha larga localizada a la derecha.
2. `<h1>` título, centrado, `$accent-yellow`, `clamp(2rem, 1.2rem + 2.5vw, 2.75rem)`.
3. Figura: tarjeta anidada `rgba($surface-blog-mid,.9)` + glow verde blur; imagen
   `aspect-ratio: 672/366`, `object-fit: cover`, radius 1rem (src 1200×655).
4. Cuerpo `[innerHTML]` (portable text de Sanity) con estilos vía la excepción
   documentada de `::ng-deep`: `h2` label mono uppercase verde con `::before`
   `01 //` naranja (CSS counter); `h3` Space Grotesk 700 blanco; `p` Inter
   `$text-secondary`; `strong` blanco; `a` `$accent-blue`; imágenes radius 1rem.
5. Barra de acciones (pill): botón útil (pill verde translúcido, icono SVG, badge
   contador mono azul sobre `$surface-pill`) + "Compartir:" + ancla LinkedIn.
6. Tarjeta de autor: avatar 4rem con dot verde, "Nomacoda // Diego", badge
   "DEV.LEAD & ARCHITECT", bio, "Conectar & Colaborar" → `/contact`.
7. Nav: dos tarjetas (`rgba($surface-blog-mid,.7)`) — "Artículo Anterior" (verde,
   izq) y "Siguiente Artículo" (naranja, der, alineado a la derecha) con título y
   fecha.

## Arquitectura

- Componente nuevo standalone `app-blog-article` en
  `features/blog/components/blog-article/`, inputs: `post` (ProcessedPost),
  `previous`, `next`, `currentLocale`. `blog.component` resuelve vecinos del array
  desc por `publishedAt` (`next = arr[i-1]`, `previous = arr[i+1]`, null fuera de
  rango) y delega. El bloque not-found no cambia.
- Contador: `usefulCount` (number, initial 0) en el esquema `post` de Sanity (Studio
  aparte, lo añade el autor); GROQ con `coalesce(usefulCount, 0)`; función Netlify
  `useful.ts` (patrón `reviews.ts`: CORS + validación + error states) que llama a
  `POST /v2025-05-11/data/mutate/{dataset}?returnDocuments=true` con
  `{patch:{id, inc:{usefulCount:1}}}` y token `SANITY_WRITE_TOKEN`; devuelve
  `{success, count}`; el front muestra el `count` devuelto (no re-lee por CDN).
- i18n: nuevas claves `BLOG.ARTICLE.*` en `es-ES.json`/`en-US.json`.

## No-goals

- Sin fetch por slug (se mantiene la carga de la lista completa).
- Sin likes con des-marcar, sin rate-limiting servidor más allá del guard local.
- Sin refactor del resto del blog (lista, cards, filtros).

## Acciones del autor (fuera del repo)

1. Studio de Sanity: campo `usefulCount` en `post` (number, `initialValue: 0`,
   `readOnly: true`).
2. Netlify env vars: `SANITY_WRITE_TOKEN` + `SANITY_DATASET` (prod `production`;
   local `.env` con `development`).
3. Foto: `src/assets/images/nomacoda/author.avif`.
4. Commits: siempre manuales (regla AGENTS.md).
