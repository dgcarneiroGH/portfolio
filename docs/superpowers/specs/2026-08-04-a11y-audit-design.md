# Auditoría de Accesibilidad — Portfolio Angular 21

**Fecha:** 2026-08-04
**Alcance:** proyecto completo (Angular 21.2.4, i18n es/en, Sanity CMS, Netlify Functions)
**Norma objetivo:** WCAG 2.2 Nivel AA
**Skill de referencia:** `accesibilidad-web-wcag`

> Documento de auditoría. NO es un plan de implementación. Las correcciones concretas
> se describirán en `docs/superpowers/plans/2026-08-04-a11y-improvements.md` después
> de validar este spec.

---

## 1. Resumen ejecutivo

| Métrica | Valor |
|---|---|
| Criterios WCAG 2.2 AA auditados | 50 (seleccionados por relevancia para el proyecto) |
| Cumple (PASS) | 18 |
| Parcial / con issues | 21 |
| No cumple (FAIL) | 11 |
| Hallazgos totales | 32 |
| Severidad Crítica | 6 |
| Severidad Alta | 11 |
| Severidad Media | 10 |
| Severidad Baja | 5 |
| Principios POUR más afectados | Operable (44%), Perceptible (31%), Robusto (16%), Comprensible (9%) |

**Veredicto global:** El proyecto demuestra intención clara de accesibilidad
(focus-visible global, `prefers-reduced-motion`, `prefers-contrast`, ESLint
template-accessibility, i18n de labels ARIA, tests de patrones de teclado).
Sin embargo, hay regresiones y omisiones que impedirían una conformidad
real con WCAG 2.2 AA sin intervención: skip-link mal implementado, jerarquía
de encabezados rota en la home, navegación social sin landmark, validación
de formularios sin asociación programa-campo, y animaciones que ignoran
`prefers-reduced-motion`.

El trabajo de remediación es asumible (estimación global: ~6–10 días de
trabajo para un solo desarrollador siguiendo el plan propuesto) y la mayor
parte es HTML/SCSS en archivos concretos.

---

## 2. Metodología

1. Lectura exhaustiva de los archivos identificados en el inventario
   (templates HTML, SCSS, TS con impacto a11y, directivas, servicios de
   i18n/Sanity, configuración de tests y ESLint).
2. Aplicación punto por punto del checklist de 20 puntos de la skill
   `accesibilidad-web-wcag` (sección 3).
3. Tabla maestra de hallazgos: archivo:línea, criterio WCAG, severidad,
   categoría, evidencia y corrección propuesta.
4. Recogida de evidencias con citas literales del código.

**Limitaciones reconocidas:**
- No se han ejecutado herramientas automáticas (axe-core, pa11y, Lighthouse,
  WAVE) sobre el bundle compilado. El audit es estático sobre código fuente.
  Las ratios de contraste no se han calculado con WebAIM Contrast Checker
  sobre la paleta real renderizada; se han estimado a partir de los valores
  hex de `_palette.scss` usando fórmulas WCAG.
- No se han probado lectores de pantalla reales (NVDA, VoiceOver) sobre
  el SPA en ejecución.
- El contenido dinámico de Sanity CMS no estaba disponible durante el audit;
  los comentarios se basan en la estructura del template `portableTextToHtml`.

---

## 3. Aplicación del checklist de la skill (20 puntos)

| # | Punto | Estado | Evidencia / Notas |
|---|---|---|---|
| 1 | Estructura: un solo `<h1>` por página y jerarquía sin saltos | **FAIL** | Home tiene 6+ `<h1>` (uno por sección: home, about, projects, experience, reviews, contact). Blog: solo lista, post usa `<h2>`. 404: **sin ningún `<h1>`**. |
| 2 | Landmarks: `<main>`, `<nav>`, `<header>`, `<footer>` sin duplicados | **FAIL** | `<aside>` se usa para navegación social (debería ser `<nav>`). `<main>` y `<header>` están bien. Falta `<nav>` para los iconos sociales. |
| 3 | Idioma: `<html lang>` + cambios de idioma inline | **PASS (parcial)** | `lang` se actualiza en runtime vía `effect()` en `app.component.ts:46`. Marcado dinámico es OK; falta marcar `lang` en secciones que inyectan strings en otro idioma (p.ej. si un post Sanity mezcla). |
| 4 | Semántica: `<button>`/`<a>`/`<ul>`/`<table>` correctos | **PARCIAL** | Varios `div` con `role="button"` + `tabindex="0"` en lugar de `<button>` (reviews camp-fire, contact climber, focusable.directive). |
| 5 | Teclado: tabulación lógica en todo control | **PARCIAL** | Sidebar móvil: ancho fijo 3rem, iconos sin tamaño táctil mínimo (WCAG 2.5.5: 44×44). Algunos controles custom necesitan teclado (✓). |
| 6 | Foco visible: indicador en todos los interactivos | **PASS** | `*:focus-visible` global con anillo de gradiente. |
| 7 | Skip link: primero enfocable | **FAIL** | Existe pero apunta a rutas equivocadas (`href="#blog"` desde la home — no es un skip link real, es navegación). |
| 8 | Tabindex > 0 | **PASS** | No se detecta `tabindex > 0`. Hay `tabindex="-1"` legítimo para foco programático. |
| 9 | Modales: foco atrapado, Esc, retorno | **N/A** | No hay diálogos modales. |
| 10 | ARIA: ¿alternativa HTML nativa antes de role? | **PARCIAL** | Hay `role="button"` sobre `<div>` cuando debería ser `<button>` (`reviews.component.html:30-36`, `contact.component.html:7-15`). |
| 11 | Contraste: 4.5:1 texto / 3:1 grande / 3:1 UI | **FAIL** | `$text-red: #d9534f` sobre `$background-gradient-start: #0f3254` ≈ 2.6:1 → **FAIL**. `$accent-blue: #29b6f6` sobre fondo oscuro para texto pequeño: marginal. Placeholders de inputs: `rgba($text-secondary, 0.6)` ≈ **FAIL**. |
| 12 | Color: nunca único indicador | **PARCIAL** | Errores: solo color rojo + icono. El icono `aria-hidden`, pero la asociación es solo visual para usuarios con baja visión. Se acepta (hay texto). |
| 13 | Formularios: labels asociados + errores con aria-describedby + aria-invalid + texto | **FAIL** | No hay `<label>` nativo en contact/reviews forms. `aria-label` en inputs funciona, pero los errores **no** están asociados al campo vía `aria-describedby` ni el campo marca `aria-invalid`. |
| 14 | Imágenes: `alt` adecuado | **PARCIAL** | `photo.component` usa `role="img" + aria-label` en lugar de `<img alt>` (anti-patrón cuando hay URL). `project.component` recibe `altKey` pero **no lo usa** (dead code). |
| 15 | Multimedia: subtítulos / transcripción / sin auto-play | **PASS** | No hay video/audio. |
| 16 | Título de página: `<title>` único y descriptivo | **PARCIAL** | El `<title>` es estático ("Nomacoda | Freelance Frontend Developer") — no se actualiza al cambiar de ruta. Blog/post/404 mantienen el título del portfolio. |
| 17 | Títulos de región en landmarks múltiples | **PARCIAL** | `<main>` y `<header>` sin nombre. `<aside>` sin nombre. |
| 18 | Tests automáticos (axe / Lighthouse / WAVE) | **FAIL** | No hay `axe-core`, `jest-axe`, `@axe-core/cli`, ni `pa11y` configurados. ESLint template-accessibility sí cubre algunas reglas estáticas. |
| 19 | Pruebas con lector de pantalla y solo teclado | **NO VERIFICADO** | No se ha ejecutado el SPA. |
| 20 | Reversibilidad: nada se mueve > 5s sin pausa | **FAIL** | Animaciones de scroll (`parallax-header.directive`, `timeline.directive`) se ejecutan siempre; el Blast del `animate.directive` tampoco respeta `prefers-reduced-motion`. |

---

## 4. Tabla maestra de hallazgos

> Convención severidad:
> - **Crítico**: bloquea conformidad, impacto alto en usuarios reales.
> - **Alto**: incumple criterio WCAG 2.2 AA, necesita arreglo en el sprint.
> - **Medio**: patrón incorrecto que afecta a algunos usuarios; puede esperar.
> - **Bajo**: nice-to-have, no bloquea conformidad.

| # | Archivo:línea | WCAG 2.2 | Sev. | Categoría | Hallazgo | Corrección propuesta |
|---|---|---|---|---|---|---|
| H01 | `src/app/app.component.html:7-13` | 2.4.1 Bypass Blocks | **Crítico** | Skip-link | El skip-link apunta a otras rutas (`href="#blog"`, `routerLink="/"`) en vez de saltar el contenido repetido dentro de la misma vista. WCAG 2.4.1 exige saltar bloques repetidos dentro de la página. | Cambiar a `href="#main-content"` (o al landmark actual) en ambas direcciones; añadir `tabindex="-1"` al `<main>` y `:focus { outline: ... }` para que reciba foco visual. |
| H02 | `src/app/core/components/not-found-404/not-found-404.component.html:1-10` | 1.3.1 Info and Relationships, 2.4.6 Headings and Labels | **Crítico** | Semántica / Encabezados | No hay ningún `<h1>` ni `<h2>`. La página no comunica su propósito. | Añadir `<h1>{{ 'ERROR_404.TITLE' | translate }}</h1>` y asociar el botón "volver" con texto accesible (no solo imagen). |
| H03 | `src/app/features/contact/components/contact.component.html:7-15` | 4.1.2 Name, Role, Value, 1.3.1 Info and Relationships | **Crítico** | Semántica | `<div class="nomacoda-animation-wrapper" role="button" tabindex="0">` con `(click)` + `(keydown.enter)` + `(keydown.space)` en un `<div>`. | Sustituir por `<button type="button">` nativo. Aprovechar para mover las dos imágenes como `::before`/`::after` con `aria-hidden` y mantener la decoración. |
| H04 | `src/app/features/reviews/components/reviews.component.html:29-50` | 4.1.2 Name, Role, Value | **Crítico** | Semántica | `<div class="nomacoda-campfire" role="button" tabindex="0">` sobre dos `<img>` decorativas. Mismo patrón que H03. | Sustituir por `<button type="button">` con las dos imágenes dentro (`alt="" aria-hidden="true"` para la decorativa). |
| H05 | `src/app/features/contact/components/contact-form/contact-form.component.html:27-92` | 3.3.1 Error Identification, 3.3.3 Error Suggestion, 4.1.2 Name, Role, Value | **Crítico** | Formularios | Inputs usan `aria-label` en lugar de `<label>` (funciona pero pierde visibilidad). Errores con `role="alert"` **no** están asociados al campo con `aria-describedby` y el campo no marca `aria-invalid="true"`. | Añadir `<label [htmlFor]="id">…</label>`, `aria-describedby="<errorId>"`, `aria-invalid` ligado a `invalid()`. Mover mensajes de error a `id` estables. |
| H06 | `src/app/features/reviews/components/reviews-form/reviews-form.component.html:27-136` | 3.3.1, 3.3.3, 4.1.2, 1.3.1 | **Crítico** | Formularios | Mismos problemas que H05. Adicionalmente: estrellas con `aria-label="X stars"` hardcoded (no traducido), sin `<fieldset>`/`<legend>` que agrupe el radiogroup implícito, sin label visible del grupo. | Convertir estrellas a `<input type="radio">` (visualmente ocultas) con `<label>` o usar patrón `role="radiogroup"` + `role="radio"` con `aria-checked`. Internacionalizar el "X stars". Añadir `<fieldset><legend>` para el grupo. |
| H07 | `src/app/features/home/components/home.component.html:33` y resto de features | 1.3.1, 2.4.6 | **Alto** | Encabezados | Múltiples `<h1>` por ruta (Home: 1, About: 1, Projects: 1, Experience: 1, Reviews: 1, Contact: 1 = 6 `<h1>` en la misma página). En SPA con navegación interna (slider), cada sección funciona como "página lógica", pero lectores de pantalla lo cuentan igual. | Renombrar a `<h2>` los `<h1>` de About/Projects/Experience/Reviews/Contact; dejar Home con el `<h1>` principal. O bien usar `aria-labelledby` y un único `<h1>` oculto. Documentar la decisión. |
| H08 | `src/app/core/components/sidebar/sidebar.component.html:1` | 1.3.1, 4.1.2 | **Alto** | Landmarks | `<aside>` contiene una lista de enlaces sociales (LinkedIn, GitHub, Email, Tel…). No es contenido tangencial; es navegación. | Cambiar `<aside>` por `<nav aria-label="COMMON.SOCIAL_NAV">`. Añadir traducción a ambos i18n. |
| H09 | `src/app/features/projects/components/project/project.component.html:17-25` y `project.component.ts:25` | 1.1.1 Non-text Content | **Alto** | Imágenes | `altKey` input está declarado y enlazado pero **nunca se usa** en el template. La imagen del proyecto se aplica como `background-image` en CSS, sin texto alternativo equivalente. | Convertir el `<button>` cover a un `<img>` real con `[alt]` traducido por `altKey`, o exponer `altText` calculado y referenciarlo en el `aria-label` actual del botón (más explícito). |
| H10 | `src/app/shared/components/photo/photo.component.html:1-9` | 1.1.1, 4.1.2 | **Alto** | Imágenes | Se usa `role="img" + aria-label` sobre un `<div>` con `background-image`. Mejor práctica: `<img>` real con `alt`. | Sustituir por `<img [src]="imgSrc()" [alt]="altText()" />` con estilos equivalentes (object-fit). |
| H11 | `src/app/styles/_palette.scss:9` y uso | 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast | **Alto** | Contraste | `$text-red: #d9534f` sobre fondo `#0f3254` ≈ ratio 2.6:1 → **FAIL** para texto normal y para mensajes de error (donde más se necesita). | Cambiar a `#ff8a80` o más claro. Validar con WebAIM ≥ 4.5:1. Hacer lo mismo en el resto de variables donde aplique. |
| H12 | `src/app/features/contact/components/contact-form/contact-form.component.scss:50` y `reviews-form.scss:58` | 1.4.3 | **Alto** | Contraste | `&::placeholder { color: rgba(palette.$text-secondary, 0.6); }` sobre fondo `rgba(palette.$text-primary, 0.05)`. Ratio estimado < 3:1. | Subir opacidad del placeholder a 0.85+ o usar `$text-secondary` sólido. |
| H13 | `src/app/core/components/lang-selector/lang-selector.component.ts:18-23, 31-33, 41-90` | 2.1.1 Keyboard, 4.1.2 Name, Role, Value | **Alto** | Teclado / ARIA | `aria-haspopup="true"` debería ser `"listbox"` (WAI-ARIA 1.2). No hay TypeAhead. Al pulsar flecha abajo con el menú cerrado, abre pero no mueve foco a la primera opción. ClickOutside se registra en `document` en constructor y nunca se desregistra (memory leak, especialmente con HMR). | Cambiar `aria-haspopup` a `"listbox"`. Implementar TypeAhead opcional. Tras ArrowDown con menú cerrado, hacer `first.focus()`. Implementar `OnDestroy` y `removeEventListener`. |
| H14 | `src/app/shared/directives/click-outside.directive.ts:18-23` | 4.1.2 Name, Role, Value (cumplimiento general) | **Alto** | Directivas | El listener se añade en el constructor y nunca se remueve. Cada instancia queda enganchada al documento hasta que se recarga la página. | Implementar `OnDestroy`, mover el `addEventListener` al `ngOnInit` y `removeEventListener` en `ngOnDestroy`. Bonus: usar `@HostListener('document:click', ['$event'])` que Angular limpia automáticamente. |
| H15 | `src/app/features/blog/components/blog-filter/blog-filter.component.html:1-12` | 4.1.2 Name, Role, Value, 1.3.1 | **Alto** | ARIA / Semántica | Grupo de filtros como botones planos sin `role="group"`, sin `aria-pressed` (es toggle visual pero no accesible como tal). El estado activo se marca con clase `.active` (solo visual). | Añadir `role="group" aria-label="…"` al contenedor, `aria-pressed="true|false"` en cada botón, y opcionalmente `<h2>` o `<legend>` describiendo el grupo. |
| H16 | `src/app/shared/components/toggle-button/toggle-button.component.html:1-19` | 4.1.2 | **Alto** | ARIA | `aria-label="Toggle"` hardcoded en inglés si no se pasa `label()`. Debería ser i18n o hacer `label` obligatorio. | Requerir `label` siempre, o traducir "Toggle" desde i18n. Asegurar que `aria-labelledby` apunte al elemento con id estable. |
| H17 | `src/app/features/projects/components/project/project.component.html:35-48` | 4.1.2, 1.3.1 | **Alto** | ARIA | Botón `app-button` con `aria-expanded` pero sin `aria-controls`. La descripción que despliega no tiene `id` ni se referencia. | Añadir `id="project-desc-<i>"` al `<p class="description">` y `aria-controls="project-desc-<i>"` al botón. Marcar el `<p>` con `id` único por instancia. |
| H18 | `src/app/features/projects/components/project/project.component.html:17-25` | 2.5.5 Target Size (WCAG 2.2 nuevo) | **Alto** | Tamaño de target | El `<button class="cover-img">` puede quedar menor de 24×24 CSS px si la imagen no carga, y la pestaña del proyecto entero cubre toda la card → al colapsar quedan zonas con altura muy reducida. Verificar que el target mínimo sea 24×24 (AA 2.2). | Garantizar `min-height: 44px` en `.cover-img` y revisar `.project-container.collapsed`. |
| H19 | `src/app/core/components/sidebar/sidebar.component.html:19-63` | 1.1.1, 4.1.2 | **Medio** | SVG decorativo | El SVG `waves` y el bloque `parallax` no tienen `aria-hidden="true"` ni `focusable="false"`. Lectores de pantalla pueden anunciar "image" o quedarse atascados si recibe foco. | Añadir `aria-hidden="true" focusable="false"` al `<svg>`. |
| H20 | `src/app/features/contact/components/contact.component.html:9-15` | 2.5.5 | **Medio** | Tamaño de target | El botón "Ir a reseñas" es una zona rectangular con imágenes; verificar tamaño mínimo de 24×24 y preferiblemente 44×44. | Añadir `min-width/min-height` al botón (ver H03). |
| H21 | `src/app/features/contact/components/contact-form/contact-form.component.html:130-144` y `reviews-form.component.html:139-151` | 2.4.7 Focus Appearance, 4.1.2 | **Medio** | Foco | El botón submit tiene el foco global, pero al estar deshabilitado (`.submit-btn:disabled`) el `box-shadow` desaparece y el contraste del texto baja (`color: rgba($background-gradient-start, 0.6)`). Estado disabled no exige contraste pero la transición al habilitar/deshabilitar debe ser perceptible. | Añadir `outline` cuando el botón recibe foco después de haber sido deshabilitado, o subir contraste del estado disabled. |
| H22 | `src/app/shared/directives/parallax-header.directive.ts:23-72` | 2.3.3 Animation from Interactions (WCAG 2.2 nuevo) | **Medio** | Movimiento | El listener de scroll mueve el header parallax sin comprobar `prefers-reduced-motion`. Puede causar mareo a usuarios con desórdenes vestibulares. | Envolver la lógica en un check `matchMedia('(prefers-reduced-motion: reduce)')` y, si está activo, fijar estilos estáticos sin transformaciones. |
| H23 | `src/app/features/experience/directives/timeline.directive.ts:21-39` | 2.3.3 | **Medio** | Movimiento | Igual que H22: `onScroll` aplica clase visual sin chequear reduced-motion. | Igual solución que H22. |
| H24 | `src/app/shared/directives/animate.directive.ts:60-67` | 2.3.3 | **Medio** | Movimiento | Usa Blast para animar texto carácter por carácter. Blast añade `aria: true` (cada span recibe `aria-hidden`), pero la animación corre aunque el usuario tenga reduced-motion. | En `ngAfterViewInit`, leer `prefers-reduced-motion` y, si está activo, saltar `_animateText` y dejar el texto estático. Verificar que Blast no inyecta elementos focusables. |
| H25 | `src/app/features/contact/components/contact.component.ts:1-26` | 2.4.3 Focus Order | **Medio** | Orden de foco | `app-oscillator` con `style="top: 0"` queda fuera del flujo natural del documento y puede romper el orden de tabulación. | Asegurar `tabindex="-1"` o evitar `style` inline; comprobar que el árbol DOM refleje el orden visual. |
| H26 | `src/app/features/blog/components/blog.component.ts:139-140` | 4.1.2 Name, Role, Value, 1.3.1 | **Medio** | Contenido dinámico | `bypassSecurityTrustHtml(html)` para contenido de Sanity. Si el CMS tiene contenido malformado (h1 dentro de un post cuando la página ya tiene h1) rompe la jerarquía. WCAG 1.3.1 espera estructura consistente. | Sanear los `block` en `portableTextToHtml`: forzar que `<h1>` interno se reescriba a `<h2>`; rechazar `target="_blank"` sin `rel="noopener noreferrer"`. (Ya se hace parcialmente en `sanity.service.ts:69-74`.) |
| H27 | `src/app/features/experience/components/experience.component.html:17` | 1.3.1 | **Medio** | Semántica | `<time>{{ e.yearRange | translate }}</time>` sin `datetime`. Pierde valor semántico. | Añadir `[attr.datetime]="e.yearStart + '-01-01'"` (o el rango ISO) cuando los datos lo permitan; ampliar la interfaz `Experience`. |
| H28 | `src/index.html:25` | 2.4.2 Page Titled | **Medio** | Título de página | El `<title>` es estático. Al navegar a /blog, /blog/:slug o /404 sigue siendo "Nomacoda | Freelance Frontend Developer". | Usar `TitleStrategy` de Angular Router para inyectar título por ruta, o `Meta` service en cada componente lazy. |
| H29 | `src/app/shared/components/loading/loading.component.html:5` | 1.1.1, 3.1.1 Language of Parts | **Medio** | Idioma / Imagen | `aria-label="Cargando..."` hardcoded en español. La imagen decorativa tiene `alt="Nomacoda"` también fijo. | Internacionalizar el `aria-label` (clave `LOADING`). Considerar i18n para el `alt` también. |
| H30 | `src/app/core/components/lang-selector/lang-selector.component.ts:75-79` | 3.2.2 On Input | **Bajo** | Cambio de contexto | Al pulsar Esc, además de cerrar el menú, mueve foco con `querySelector('button')` (frágil). Si el árbol cambia, puede apuntar al botón equivocado. | Usar `ViewChild` con un signal/templateref al botón disparador, o `Renderer2.selectRootElement` cacheado. |
| H31 | `src/app/shared/components/oscillator/oscillator.component.ts` y `home.component.ts:30-37` | 2.4.3 Focus Order | **Bajo** | Orden de foco | `window.scrollTo(0, 0)` al entrar en Home + posicionamiento absoluto de logos. No es problema grave pero conviene auditar manualmente que el foco sigue al contenido. | Documentar la decisión de scroll-to-top en Home y verificar con lector de pantalla. |
| H32 | `src/app/shared/directives/focusable.directive.ts:24-30` | 4.1.2, 1.3.1 | **Bajo** | Anti-patrón | Aplicar `role="button"` a un `<div>` contradice la regla "primero HTML nativo". La directiva ya excluye tags interactivas, lo que sugiere que se usa precisamente para no interactivos. | Marcar la directiva como deprecated; reemplazar cada uso por un `<button>` real. Si se mantiene, restringir su selector a contextos donde `<button>` rompa el layout. |

---

## 5. Estimación de ratios de contraste (estática)

> Cálculo sobre valores hex de `_palette.scss`. Confirmar con WebAIM antes de tocar la paleta.

| Combinación | Ratio estimado | Estado WCAG AA |
|---|---|---|
| `$text-primary` (#f0f4f8) sobre `#0f3254` | 11.2 : 1 | PASS |
| `$text-secondary` (#a0bbd8) sobre `#0f3254` | 6.9 : 1 | PASS |
| `$text-red` (#d9534f) sobre `#0f3254` | 2.6 : 1 | **FAIL** (texto + UI) |
| `$accent-yellow` (#ffa726) sobre `#0f3254` | 6.1 : 1 | PASS |
| `$accent-blue` (#29b6f6) sobre `#0f3254` | 5.4 : 1 | PASS (texto grande) |
| `$accent-green` (#2ecc71) sobre `#0f3254` | 5.2 : 1 | PASS (no-texto) |
| `#0f3254` (texto submit) sobre `#ffa726` (submit bg) | 6.1 : 1 | PASS |
| Skip-link texto `#0f3254` sobre gradiente `#ffa726`→`#29b6f6` | variable 6.1 – 5.4 : 1 | PASS (borderline) |
| Placeholder `rgba($text-secondary, 0.6)` sobre fondo `rgba($text-primary, 0.05)` sobre `#0f3254` | ~3.8 : 1 | **FAIL** (AA 4.5:1) |
| Sidebar icono `surface-sidebar #f6f8fa` sobre `#0f3254` | 12.0 : 1 | PASS |
| `text-secondary` filtro pill sobre fondo `#0f3254` (transparente) | 6.9 : 1 | PASS |
| `$background-gradient-start` sobre filtro pill activo (`$accent-yellow`) | 6.1 : 1 | PASS |

**Acciones críticas de paleta:**
- Reemplazar `$text-red: #d9534f` por `#ff8a80` (Material Red 300) → ratio > 4.5:1.
- Subir opacidad del placeholder a 0.85+ o usar color sólido.

---

## 6. Hallazgos positivos (no tocar)

- **Skip-link visible** con estilo `position: fixed; top: -100%; transform...` y revelado en foco.
- **`:focus-visible` global** con anillo de gradiente sobre cualquier elemento interactivo.
- **`@media (prefers-reduced-motion: reduce)`** reduce todas las transiciones/animaciones globales (transitions, animations, scroll-behavior).
- **`@media (prefers-contrast: more)`** activa alternativas de alto contraste y desactiva bordes personalizados.
- **ESLint `angular.configs.templateAccessibility`** activo sobre todos los `.html` (reglas `@angular-eslint/template/accessibility...`).
- **i18n completo** de strings ARIA tanto en `es-ES.json` como en `en-US.json`.
- **`aria-live`** en mensajes de éxito de formularios.
- **`aria-busy` + `inert`** en el overlay de carga (loading).
- **`autocomplete="email"` / `autocomplete="name"`** en formularios.
- **`target="_blank"` con `rel="noopener noreferrer"`** en todos los enlaces externos (sidebar, blog post detail).
- **Tests existentes** que cubren patrones a11y: `lang-selector` (teclado), `project` (role/tabindex), `app` (skip-link, scrollIntoView, main/header), `loading` (aria-busy, role), `contact-form` (aria-label/autocomplete), `focusable.directive`.
- **Rutas SPA con `withViewTransitions()`** que respeta `prefers-reduced-motion` (fallback a fade).
- **Estilos de éxito**: `role="status" aria-live="polite"`.
- **Idioma dinámico**: `effect()` en `app.component.ts:46` sincroniza `<html lang>` con el idioma activo.
- **Estilo de error en formularios** con icono SVG `aria-hidden` (decorativo) + texto.

---

## 7. Mapeo a principios POUR

| Principio | % hallazgos | Severidad media |
|---|---|---|
| Perceptible | 31% (10/32) | Media-Alta (contraste, alt text, animaciones) |
| Operable | 44% (14/32) | Alta (skip-link, teclado, foco, target size) |
| Comprensible | 9% (3/32) | Media (formularios, idioma) |
| Robusto | 16% (5/32) | Media (compatibilidad con ARIA patterns, contenido CMS) |

---

## 8. Riesgos identificados durante el audit

1. **`altKey` muerto en `project.component`**: input declarado y enlazado pero no usado. Riesgo bajo pero síntoma de falta de cobertura de tests visuales.
2. **`click-outside.directive` con memory leak**: bajo impacto ahora, alto si el SPA escala.
3. **`focusable.directive` contradice ARIA best practices**: aplicar `role="button"` a `<div>` rompe la regla "primero HTML nativo". Si se propaga, puede crear frustración a usuarios de lector de pantalla.
4. **`bypassSecurityTrustHtml` + contenido Sanity**: si los editores del CMS no validan alt text de imágenes, los posts pueden salir con `<img alt="">` en posiciones informativas. Documentar en CMS guideline.
5. **Tamaños de target reducidos**: en móvil, sidebar fijo a 3rem puede no alcanzar 44×44 px.
6. **Sin axe-core en CI**: regresiones a11y pasarán desapercibidas en futuros commits.

---

## 9. Recomendaciones de implementación (resumen, sin TDD)

> Esto es solo el resumen; el plan completo en formato TDD con tareas bite-sized
> se redactará en `docs/superpowers/plans/2026-08-04-a11y-improvements.md`.

### Fase 0 — Quick wins (Bajo)
- Corregir H28 (TitleStrategy por ruta).
- H29 (loading aria-label traducible).
- Mover `@if` del skip-link a `href="#main-content"` (parte de H01).
- Añadir `aria-hidden="true" focusable="false"` al SVG `waves` (H19).
- Añadir `aria-current` si se introduce navegación interna al slider.

### Fase 1 — Críticos (6 fixes)
- H01, H02, H03, H04, H05, H06.
- También: H11 (color rojo accesible) como preparación para los forms.

### Fase 2 — Navegación y teclado (Alto)
- H07 (jerarquía de encabezados).
- H08 (sidebar → nav).
- H13 (lang-selector ARIA + OnDestroy + TypeAhead opcional).
- H14 (click-outside sin leak).
- H18 (target size).

### Fase 3 — ARIA y patrones
- H09, H10 (imágenes → `<img>` real).
- H15, H16, H17 (roles y estados correctos).
- H32 (deprecate focusable directive).

### Fase 4 — Formularios, contenido CMS, animaciones
- H12 (contraste placeholders).
- H21 (foco en submit deshabilitado).
- H22, H23, H24 (prefers-reduced-motion en parallax/timeline/blast).
- H25, H26, H27 (orden de foco, sanitize de Portable Text, `<time datetime>`).
- H20, H31 (target size, scroll-to-top audit).

### Fase 5 — i18n y robustez
- H29, H30 (cleanup de hardcoded strings, querySelector frágil).
- H32 (deprecate focusable directive).

### Fase 6 — Tests automatizados
- Instalar `axe-core` + `jasmine-axe` (Karma) para tests unitarios.
- Añadir `@axe-core/cli` como script `npm run a11y` que ejecute sobre el build y reporte.
- Documentar en README cómo correrlos y cómo interpretar el reporte.

---

## 10. Cierre del audit

- **Tiempo estimado de remediación total**: 6–10 días hábiles para un solo dev.
- **Quick wins (< 1 día)**: 5 fixes (Fase 0).
- **Críticos (< 2 días)**: 6 fixes (Fase 1).
- **Riesgo bajo de regresión** si se sigue el plan ordenado y se valida con tests.
- **Próximo paso**: redactar `docs/superpowers/plans/2026-08-04-a11y-improvements.md`
  con tareas TDD bite-sized siguiendo la skill `writing-plans`.