# Agent Rules — Portfolio

## Commits

**Regla:** Nunca hacer commit automáticamente. Esperar siempre la confirmación
explícita del usuario antes de ejecutar `git add`, `git commit`, `git push`,
`git tag`, creación de PRs o cualquier operación que modifique el historial del
repositorio.

Esto aplica incluso cuando:
- El usuario pida "guardar" o "persistir" cambios (interpretar como "deja el
  archivo escrito en disco", no como commit).
- Haya un flujo de skill que sugiera commit tras cada tarea (omitir el paso de
  commit salvo confirmación).
- El cambio parezca trivial o reversible.

**Regla adicional (2026-08-06):** El usuario comiteará **siempre** los cambios
manualmente. Queda **prohibido** que el agente ejecute cualquier operación de
git que modifique el historial, incluso si el usuario responde "sí" a un ASK
de commit. Si el usuario quiere commitear, lo hace él directamente. El
agente debe limitarse a:
- Dejar los cambios escritos en disco (working tree).
- Mostrar el comando exacto que el usuario podría ejecutar (referencia, no acción).
- Continuar con la siguiente tarea sin esperar confirmación de commit.

Cuando un paso del flujo requiera commit, no preguntar ni ejecutar. Solo
informar al usuario con el comando sugerido en formato de bloque de código,
y avanzar a la siguiente tarea.

Esta regla queda registrada a partir del 2026-08-04 (versión original) y
ampliada el 2026-08-06 (prohibición explícita).

## Design tokens — colores y tipografía

**Regla (2026-10-08):** Al añadir colores o tipos de letra, prioriza SIEMPRE
los tokens ya existentes en `src/styles/_palette.scss` (colores) y
`src/styles/_fonts.scss` (tipografías). Solo crea un token nuevo si no existe
equivalente y añádelo al archivo pertinente:

- Colores nuevos → `_palette.scss`, con nombre semántico y comentario de
  origen si no es obvio. Derivadas con transparencia: `rgba(palette.$token, α)`.
- Fuentes nuevas → `_fonts.scss`: variable de familia y bloque `@font-face`
  dentro del mixin `font-faces` (solo lo incluye `styles.scss`, para no
  duplicar reglas en el CSS de los componentes) + woff2 en
  `src/assets/fonts`.

Prohibido hardcodear hex, rgba o `font-family` en los SCSS de componentes:

- Colores: `palette.$token` (y `rgba(palette.$token, α)` para derivadas).
- Tipografía: `fonts.$body`, `fonts.$heading`, `fonts.$mono`.

Excepciones documentadas: `rgba(0, 0, 0, α)` / `rgba(255, 255, 255, α)` y
negros/blancos sólidos en sombras, glows y neutros de alto contraste; colores
embebidos en data-URIs de patrones (`styles.scss`).

## Encapsulación de estilos — sin `::ng-deep`

**Regla (2026-10-08):** Prohibido usar `::ng-deep` (tampoco `/deep/` ni `>>>`)
en SCSS de componentes propios para pisar estilos de otros componentes propios
de la app. Cada componente es dueño de los estilos de su DOM.

**Regla (2026-10-08, ampliada):** Todo estilo perteneciente a un componente
custom debe ir dentro del SCSS del propio componente, aunque este solo se use
dentro de otro componente. Prohibido que el SCSS de un componente referencie
clases de otros componentes, incluido `:host-context(.clase-del-padre)`:
si el componente solo existe en un contexto, sus estilos son los únicos que
necesita; si realmente necesita variantes → `@Input` de variante + clase de
host (`:host(.mi-variante)`), nunca clases del padre.

- Tematización puntual → custom properties CSS con valor por defecto en el
  hijo, sobrescritas desde el padre.
- `::ng-deep` solo como última opción para DOM de terceros no controlable
  (librerías sin hooks de estilos), documentando el motivo en un comentario
  junto a la regla.

Referencia: unificación de estilos del lang-selector en su propio SCSS,
eliminando la variante `:host-context(.header-lang)` (2026-10-08).