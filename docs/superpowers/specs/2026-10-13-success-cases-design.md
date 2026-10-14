# Diseño — Sección "Casos de éxito" (success-cases)

Fecha: 2026-10-13
Estado: aprobado por el usuario en conversación.

## Objetivo

Sustituir la sección obsoleta de "Proyectos" por una nueva sección "Casos de éxito" accesible en la ruta `/casos-exito`, con tarjetas basadas en el mockup proporcionado, reutilizando los datos existentes de `features/projects`.

## Decisiones tomadas (con el usuario)

1. **Ubicación**: ruta nueva `/casos-exito` (no fragment en home, no sections-wrapper). El navbar pasa de `/` + fragment a `routerLink="/casos-exito"`.
2. **Zona logo**: se muestran las imágenes `.avif` existentes de los proyectos sobre el gradiente de `PROJECT_PALETTES`, dentro del marco claro del mockup. No se recrean logos en CSS.
3. **Píldoras de tecnologías**: se añade el campo `technologies: string[]` a la interfaz `Project` y a las 6 entradas de los datos (nombres propios, sin i18n).
4. **Comportamiento**: tarjeta estática con título, descripción y píldoras siempre visibles. El botón "± info" abre un modal/detalle. Se elimina el mecanismo expand/collapse con `expandedIndex`.
5. **Tipografía**: tokens existentes (`fonts.$heading` para títulos, `fonts.$body` para descripciones, `fonts.$mono` para píldoras/botón). No se añaden fuentes nuevas.
6. **Hover logo home**: el `.brand` del header pasa a `<a routerLink="/">` con glow `palette.$accent-yellow` + lift 2px (mismo lenguaje que el hover de cover-img) y focus-visible estándar. `aria-label` = `COMMON.NAV_HOME` (ya existe en i18n).
7. **Layout**: grid responsive 3/2/1 columnas (patrón actual), no columna única del mockup.

## Arquitectura

### Feature nuevo: `src/app/features/success-cases/`

```
features/success-cases/
  success-cases.routes.ts        (o ruta en app.routes.ts con loadComponent)
  components/
    success-cases/  (sección: header parallax + grid + modal)
    success-case/   (tarjeta individual, sustituye a app-project)
    tech-pill/      (píldora de tecnología)
  constants/
    success-cases.constants.ts     (datos SUCCESS_CASES, movidos de projects)
    project-palettes.ts            (movido tal cual)
  interfaces/
    success-case.interface.ts      (Project + technologies)
```

### Modelo de datos

```ts
export interface SuccessCase {
  coverImgSrc: string;   // sin extensión; se añade .avif en plantilla
  name: string;
  description: string;   // clave i18n (reutiliza PROJECTS.DESCRIPTION_*)
  url?: string;
  year: number;
  altKey: string;        // reutiliza PROJECTS.PROJECT_*_ALT
  technologies: string[];
}
```

Datos `SUCCESS_CASES`: los 6 proyectos actuales ordenados por año descendente, con `technologies`:

- Hermes - Artemis (2025): Angular, TypeScript, SCSS, RabbitMQ
- Portal Convocatorias (2026): Angular, N8N, OpenAI API, Hugo
- Babé y CIA (2023): Angular, Django, HERE API
- Datalaia (2023): Angular, RxJS, Charts
- LALIGA Bares (2024): Angular, CRM, .NET
- Discamino (2022): Angular, Firebase, PWA

Estas listas son la fuente de verdad; la implementación solo las ajustará si alguna descripción i18n contradice una tecnología incluida (p. ej. Datalaia usa Java o RabbitMQ según su descripción).

### Componentes

**SuccessCasesComponent** (`app-success-cases`)
- Inputs: ninguno. Estado: `openIndex: WritableSignal<number | null>`.
- Plantilla: `<section>` con `appParallaxHeader` + `<h2>` (`SUCCESS_CASES.TITLE`), grid de `app-success-case`, y modal de detalle cuando `openIndex() !== null`.
- Fondo sección: radial-gradient con `palette.$background-gradient-end` → `palette.$azure-deep` (los hex del mockup ya son tokens: #115F51, #001C37≈#000F21, #000F21).
- Grid: `repeat(3, 1fr)` desktop, 2 cols ≤1300px, 1 col ≤930px (mismos breakpoints que projects actual).

**SuccessCaseComponent** (`app-success-case`)
- Inputs: `successCase: SuccessCase` (objeto completo), `index: number`.
- Output: `openRequest = output<number>()`.
- Estructura vertical: marco cover (`.avif`, fondo con gradiente de `PROJECT_PALETTES`, border-radius 12px, borde blanco 10%), título (20px, `$text-primary`, `$heading`), descripción (14px, `$text-secondary`, `$body`), `<ul>` de píldoras, footer con borde superior blanco 5% y botón "± info".
- Contenedor: `rgba(palette.$azure-deep, 0.7)` + `backdrop-filter: blur(12px)` + borde 1px blanco 5% (excepción neutra documentada en AGENTS.md).
- Botón "± info": estilo ámbar ya tokenizado (`$brown-btn-start/mid/end`, `$amber-outline`, `$amber-glow`), mono 12px uppercase. Si el proyecto tiene `url`, el modal incluye enlace externo.

**TechPillComponent** (`app-tech-pill`)
- Input: `label: string`. Renderiza `<li>` con clase pill.
- Fondo `palette.$azure-border`, texto `palette.$accent-azure`, `fonts.$mono` 11px, border-radius 9999px.

**Modal de detalle**
- Componente `success-case-detail` dentro del feature (no shared): overlay fijo + tarjeta centrada con cover, título, año, descripción completa, tecnologías y (si existe) `url` como enlace externo (`target="_blank"` + `rel="noopener"`).
- Accesibilidad: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` al título, foco inicial dentro, cierre con Escape y botón de cerrar, bloqueo de scroll de fondo.
- Cierre: `openIndex.set(null)`.

### Rutas

`app.routes.ts`: nueva ruta lazy:

```ts
{ path: 'casos-exito', loadComponent: () => import(...).then(m => m.SuccessCasesComponent), data: { animation: 'SuccessCases', titleKey: 'ROUTE.SUCCESS_CASES' } }
```

### Header (navbar)

- `.brand` → `<a class="brand" routerLink="/" aria-label="COMMON.NAV_HOME | translate">` (estructura interna intacta). Hover/focus: `box-shadow` glow `rgba(palette.$accent-yellow, 0.35)` + `translateY(-2px)` + transición; focus-visible con anillo estándar de la web.
- Nav "Casos de éxito": `routerLink="/casos-exito"` `routerLinkActive="is-active"` (sin `routerLinkActiveOptions` exact, sin fragment).

### Renombrado a `-old` (obsoleto, borrado manual futuro)

- Carpeta `features/projects/` → `features/projects-old/`.
- Clases: `ProjectsOldComponent`, `ProjectOldComponent`. Selectores: `app-projects-old`, `app-project-old`.
- Archivos renombrados con sufijo: `projects-old.component.ts`, `project-old.component.ts`, etc. (incluye html/scss/spec).
- `sections-wrapper.component.ts` (huérfano pero debe compilar): actualiza import/uso a `app-projects-old` / `ProjectsOldComponent`.
- Los archivos `-old` no se importan desde ningún código activo.

### i18n (es-ES y en-US, mismos keys)

- Reutilizar tal cual: `PROJECTS.DESCRIPTION_*`, `PROJECTS.PROJECT_*_ALT`, `PROJECTS.VIEW_PROJECT`, `PROJECTS.TOGGLE_INFO_*`.
- Nuevas claves:
  - `ROUTE.SUCCESS_CASES` ("Casos de éxito" / "Success cases")
  - `SUCCESS_CASES.TITLE` ("Casos de éxito" / "Success cases")
  - `SUCCESS_CASES.DETAIL_YEAR` ("Año" / "Year")
  - `SUCCESS_CASES.DETAIL_TECH` ("Tecnologías" / "Technologies")
  - `SUCCESS_CASES.CLOSE` ("Cerrar detalle" / "Close details")
  - `SUCCESS_CASES.OPEN_DETAIL` ("Más información de {{name}}" / "More info about {{name}}")

### Estilo / tokens (reglas AGENTS.md)

- Solo tokens de `_palette.scss` y `_fonts.scss`; derivadas con `rgba(palette.$token, α)`. Excepciones permitidas: blancos/negros con alpha en bordes/sombras (documentado).
- Sin `::ng-deep`. Estilos del lang-selector ya resueltos; no tocar.
- `prefers-reduced-motion`: sin animaciones nuevas; solo transiciones hover cortas.

### Accesibilidad

- Imágenes con `alt` = `altKey` traducido; cover con `aria-label` de `VIEW_PROJECT` cuando tiene url.
- Píldoras en `<ul>` con `aria-label` = `SUCCESS_CASES.DETAIL_TECH`.
- Botón "± info": `<button>` con `aria-haspopup="dialog"` y `aria-label` = `SUCCESS_CASES.OPEN_DETAIL`.
- Modal conforme a lo descrito arriba. Contraste AA verificado (accent-azure sobre azure-border AA; text-secondary sobre fondo tarjeta AA).

### Testing

- Specs mínimos para `tech-pill` y `success-case` (render de inputs, output openRequest). Si el proyecto no tiene Karma/jest activo para specs nuevos, dejar specs coherentes con los existentes de projects.
- Verificación manual: `npm run lint`, `npx tsc --noEmit` o build (`ng build`) sin errores; navegación `/casos-exito` renderiza 6 tarjetas; modal abre/cierra con Escape; hover del brand funciona.

## Fuera de alcance

- Borrar físicamente los `-old` (lo hará el usuario manualmente en el futuro).
- Añadir los proyectos extra con assets huérfanos (pharmachallenge, pbcinteract, mariskito, dfg).
- Activar `anchorScrolling` (ya no necesario al ser ruta propia).
- Reparar `scrollToContact()` de app.component (preexistente, no relacionado).
