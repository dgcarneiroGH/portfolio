# Diseño — Rediseño sección Reviews (2026-10-14)

## Objetivo

Reemplazar la sección Reviews (campfire + formulario antiguo) por el nuevo
diseño 2026-10: header con pill "Dejar reseña" + masonry de review-cards glass,
con estado vacío que muestra CTA grande y formulario de reseña reestilizado.

## Decisiones (validadas con el usuario)

- **Datos:** se cargan de `constants/reviews.const.ts` (gestión manual).
  No hay GET al backend (la Netlify function solo acepta POST).
- **Cards:** sin avatar (descartado). Muestran nombre, rol opcional, rating
  1–5★, mensaje y footer con chip de tag + categoría opcional.
- **Formulario:** nombre (opcional), email (requerido, privado, lo necesita la
  Netlify function), rating (requerido) y mensaje (requerido). Los campos
  rol/tag/categoría NO van en el form (el usuario los añadirá a mano al
  constants tras recibir la reseña).
- **Layout:** masonry CSS (`columns: 3` → 2 col ≤1300px → 1 col ≤930px),
  mismo patrón responsive que success-cases.
- **Sección:** solo diseño nuevo; sin campfire, sin título/subtítulo con
  `appAnimate`, sin input `navigate`.

## Estructura

```
features/reviews/
├── components/
│   ├── reviews-old.component.*        ← antiguo (ReviewsOldComponent,
│   │                                     app-reviews-old) para borrar en el futuro
│   ├── reviews.component.*            ← NUEVO (ReviewsComponent, app-reviews)
│   ├── review-card/                   ← NUEVO (ReviewCardComponent)
│   ├── reviews-form/                  ← NUEVO (ReviewsFormComponent)
│   └── reviews-form-old/              ← antiguo (ReviewsFormOldComponent,
│                                         app-reviews-form-old)
├── constants/reviews.const.ts         ← REVIEWS: Review[] (semilla del diseño)
└── interfaces/
    ├── review.interface.ts            ← Review + ReviewVariant
    └── review-inquiry.interface.ts    ← sin cambios (payload POST)
```

Rutas y sections-wrapper no cambian: siguen apuntando a `reviews.component.ts`
(el nuevo).

## Tokens nuevos (`_palette.scss`)

- `$surface-card: #00213e` — fondo glass de cards (usado como `rgba(..., .8)`).
- `$surface-action: #052b4d` — fondo del pill/CTA (usado como `rgba(..., .8)`).
- `$green-mint: #aaf0de` — texto del chip variante "accesibilidad".

Resto: tokens existentes (`$azure-deep`, `$background-gradient-end/start`,
`$surface-brand`, `$text-primary/secondary`, `$accent-yellow/azure/green`,
`$green-soft`, `$focus-blue`) + derivadas `rgba()`. Gradiente de sección
idéntico al de success-cases.

## Variantes de chip (ReviewVariant)

| variante  | bg chip                                  | texto chip       |
|-----------|------------------------------------------|------------------|
| `teal`    | `rgba($background-gradient-end, .30)`    | `$green-soft`    |
| `mint`    | `rgba($background-gradient-end, .30)`    | `$green-mint`    |
| `amber`   | `$background-gradient-start`             | `$accent-yellow` |
| `sky`     | `$background-gradient-start`             | `$accent-azure`  |
| `emerald` | `$background-gradient-start`             | `$accent-green`  |

## Componente Reviews (nuevo)

- `view = signal<'list' | 'form'>('list')`.
- Header: pill "Dejar reseña" (estrella + texto) alineado a la derecha sobre
  hairline `rgba($text-primary, .12)`.
- `list` + reviews → masonry de `app-review-card`.
- `list` + vacío → "Aún no existen reseñas, sé tú el primero" + CTA grande
  "Añadir reseña" (solo existe en esta casuística).
- `form` → `app-reviews-form` (pill oculto). Al emitir `finished` vuelve a
  `list`.

## Componente ReviewCard

Card glass (padding 1.5rem, radius 2rem, outline hairline −1px, blur) con
`break-inside: avoid`. Rating como `role="img"` con
`aria-label="Valoración: N de 5 estrellas"` (`REVIEWS.RATING_ARIA`), estrellas
SVG con clases lit/unlit (información también en el aria-label, no solo color).

## Componente ReviewsForm

Mismo estilo glass. Radiogroup de estrellas accesible (patrón del form antiguo:
`role="radio"`, `aria-checked`, hover con mouseenter/leave). Errores con
`aria-invalid`, `aria-describedby`, `role="alert"` y asterisco visual +
`aria-required`. Success: icono + mensaje + botón "Volver a las reseñas" que
emite `finished`. Payload POST sin cambios (`ReviewInquiry` + creationDate +
origin).

## i18n añadido (es-ES / en-US)

`REVIEWS.RATING_ARIA`, `REVIEWS.LEAVE_REVIEW`, `REVIEWS.ADD_REVIEW`,
`REVIEWS.EMPTY_TITLE`, `REVIEWS.BACK_TO_REVIEWS`. Se reutilizan
`FORM.*`, `REVIEWS.RATING_LABEL`, `REVIEWS.STAR_ARIA`, `REVIEWS.FORM_SUCCESS`.

## Ajustes colaterales (deuda preexistente del commit 2854061)

- `experience.component.{ts,html}`: quitado el import/uso de
  `ParallaxHeaderDirective` (fichero eliminado en 2854061; el componente es
  dead-code sin ruta, pero rompía el build de tests).
- `sections-wrapper.component.spec.ts`: eliminado import de
  `ProjectsOldComponent` (carpeta `projects-old` no existe en el repo).

## Verificación

- `npm run build` ✓ (warning de `@sanity/eventsource` preexistente).
- `npm run test:ci` ✓ 421/421 (2 fallos corregidos: reviews como `input()`).
- `ng lint` ✗ preexistente (override `ajv@8` rompe `@eslint/eslintrc`; no
  relacionado con este cambio).
- Revisión visual: desktop 1920, móvil 390 (listado, estado vacío, form,
  error de envío sin `netlify dev`), consola limpia, a11y tree correcto.
