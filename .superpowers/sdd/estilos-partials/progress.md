# SDD ledger — plan: conversación 2026-11-19 (partials de estilos comunes)

Plan: extraer patrones SCSS duplicados a 7 partials temáticos en src/styles/
(_glass, _shadows, _focus, _forms, _elements, _animations, _view-transitions),
reorganizar styles.scss como índice + base global, migrar ~20 componentes con
mixins, limpiezas colaterales (tokenizar skip-link, normalizar @use en
experience, quitar prefers-reduced-motion locales redundantes) y actualizar
AGENTS.md con la nueva organización.

Constraints (AGENTS.md):
- PROHIBIDO commit (usuario comitea manualmente).
- Colores/fuentes solo desde _palette.scss / _fonts.scss.
- Sin ::ng-deep ni clases globales para estilos de componente (mixins @include OK).
- Anillos de foco solo en interactivos.
- Verificación: ng build sin errores + barrido responsive con capturas.

Rulings:
- Ruling: sin commits por tarea (AGENTS.md prevalece sobre la skill) — coste: revisión sobre working tree en vez de rango git.
- Ruling: verificación = build + review visual (no hay tests de CSS) — coste: regresiones visuales detectadas por barrido de capturas.

## Tasks
- [ ] Task 1: leer ficheros restantes y diseño final de partials
- [ ] Task 2: crear 7 partials (_glass, _shadows, _focus, _forms, _elements, _animations, _view-transitions)
- [ ] Task 3: reorganizar styles.scss como índice + base global
- [ ] Task 4: migrar formularios (contact-form, reviews-form, success-case, success-cases, wizard-results)
- [ ] Task 5: migrar glass/sombras (review-card, post-card, blog-article, blog, code-window, about, photo, wizard, header, sidebar, footer)
- [ ] Task 6: migrar foco + píldoras/eyebrows/botones (tech-pill, blog-filter, skills, services, header, sidebar)
- [ ] Task 7: keyframes compartidos (spin/slideDown/fadeIn de formularios, loading-rotate)
- [ ] Task 8: limpiezas colaterales (skip-link tokens, experience @use, media queries redundantes)
- [ ] Task 9: actualizar AGENTS.md con la organización de partials
- [ ] Task 10: verificación (ng build + barrido responsive con capturas)
