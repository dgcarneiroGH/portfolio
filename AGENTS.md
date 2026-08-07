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