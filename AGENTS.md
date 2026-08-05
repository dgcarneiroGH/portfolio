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

Cuando un paso del flujo requiera commit, parar y preguntar primero:

> "Siguiente paso del flujo sería `git commit -m "..."`. ¿Lo ejecuto?"

Esta regla queda registrada a partir del 2026-08-04.