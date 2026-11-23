# Diseño — Página /tutoring: terminal interactivo Discord (tutorías DAW/DAM)

Fecha: 2026-11-21. Estado: aprobado por el usuario en conversación.

## Intención y por qué

La ruta `/tutoring` existe con un placeholder vacío (`TutoringServiceComponent`).
Este diseño la convierte en la página de captación de tutorías para ciclos DAW/DAM:
un **terminal interactivo** con estética IDE/Discord donde el alumno responde a un
cuestionario tecleando en la línea de comandos, y al final envía una solicitud de
tutoría al formulario de contacto con el mensaje ya compuesto (patrón de lead
preconstruido que ya usan los asistentes de `/angular` y `/n8n`).

El objetivo de negocio es el mismo que el del wizard `/angular`: convertir al
visitante en un lead con contexto, pero con una mecánica de terminal real (no un
formulario por pasos) como gancho de diferenciación para un público de estudiantes
de programación.

## Decisiones del usuario (vinculantes)

1. **Layout: IDE completo.** Breadcrumb superior, ventana IDE con sidebar
   explorador, tabs del editor, top bar del terminal, status bar y cuerpo del
   terminal. El sidebar se oculta en móvil.
2. **Asignaturas: multi-selección por teclado.** El log lista las opciones
   numeradas y el usuario teclea los números separados por comas (ej: `1,3,4`)
   en la línea de comandos. No hay click en opciones ni flechas TUI.
3. **Envío final: payload visible + botón.** El terminal compone el mensaje y lo
   muestra en el log (bloque visible) junto a un CTA de tipo terminal
   ("EJECUTAR DISPATCH") que entrega el lead y navega a `/contact`.
4. **Fuente: mono del sistema actual.** `fonts.$mono` (Cascadia/Consolas/…).
   NO se añade Fira Code ni ninguna fuente nueva.
5. **Paleta: set Discord completo** como familia `$discord-*` en `_palette.scss`
   (ver Tokens).

## Funcionalidad del terminal

### Modelo de interacción

- Un **único input de línea de comandos** siempre al final del cuerpo del
  terminal, con prompt `nomacoda@student:~$` y cursor parpadeante. El log crece
  encima con cada intercambio (pregunta, respuesta, errores, confirmaciones).
- El usuario **escribe la respuesta y pulsa Enter**. Enter con input vacío se
  ignora (no avanza ni imprime nada).
- **Reinicio por comando nativo** (2026-11-21): teclear `clear` (en cualquier
  paso, case-insensitive) reinicia la sesión — log inicial, paso CYCLE y lead
  a null. El aviso es chrome fijo bajo el CLI (fuera del log, `clear` en
  blurple); no hay botón de restart en la top bar.
- **Efecto typewriter** (2026-11-21): el log se revela progresivamente con
  un motor de tecleo en `TutoringTerminalService` (ticker a ~16ms,
  ~10ms/carácter con clamp 60–420ms por línea; las opciones van en ráfaga a
  ritmo fijo; `input`/`echo`/`banner` son instantáneos — el eco del usuario
  no se teclea). El texto de cada línea se resuelve con `translate.instant`
  en su creación (log congelado en el idioma del momento). API:
  `displayLines()` (lo que pinta el componente), `isTyping()`,
  `flushTyping()` y `onTypingDone()` (navegación diferida). Reglas:
  - Enter del usuario mientras teclea → flush al instante + respuesta
    procesada (el input nunca se bloquea).
  - `restart()` re-teclea la secuencia de arranque.
  - `prefers-reduced-motion` → motor desactivado (todo visible de inmediato,
    matchMedia con seguimiento de cambios en caliente).
  - El log anuncia `aria-busy` mientras teclea; la línea en curso lleva el
    caret bloque (`is-typing::after`), neutralizado por el bloque global de
    reduced-motion.
  - El salto a `/contact` tras `y` es diferido: ocurre cuando el `[200 OK]`
    termina de escribirse (notificación síncrona del ticker).
- **Sin comandos extra** (no `help`, no `clear` tecleado): la única entrada
  válida es la respuesta a la pregunta activa. Sin ayuda adicional en UI: cada
  pregunta declara su formato esperado en su propia línea (como el mock).

### Cuestionario (4 preguntas, en orden)

1. **Ciclo** — pregunta: "¿Qué ciclo estás estudiando? (DAW / DAM)".
   Acepta texto libre con normalización: `daw`/`dam` (mayúsculas/minúsculas,
   con o sin acentos de escritura) → `DAW`/`DAM`. Cualquier otro valor es
   inválido.
2. **Año** — pregunta: "¿En qué año estás? (1º / 2º)".
   Acepta `1`, `2`, `1º`, `2º` → normaliza a `1º`/`2º`. Otro valor, inválido.
3. **Asignaturas (multi)** — pregunta: "¿Con qué asignaturas necesitas ayuda?
   (números separados por comas)". El log lista las opciones numeradas de la
   LISTA ACTIVA según ciclo y año respondidos (sección "Listado de
   asignaturas por ciclo y año"); el usuario teclea p. ej. `1,3`. Reglas:
   - La lista activa y su longitud definen la numeración `[1]`…`[N]` y el
     rango válido de la validación.
   - Se normaliza: espacios, números con o sin ceros; duplicados se deduplican
     conservando el orden de la lista; orden de impresión = orden de la lista.
   - Cualquier número fuera de rango o token no numérico → error (con el
     máximo de la lista activa) y re-pregunta (se repite la lista de opciones).
4. **Horas semanales** — pregunta: "¿Cuántas horas a la semana quieres
   dedicarle? (ej: 4h o Intensivo)". Acepta texto libre (p. ej. `4`, `4h`,
   `6 horas`, `Intensivo`); se normaliza recortando espacios. Se acepta
   cualquier texto no vacío (es un dato descriptivo, no validable).

### Validación estilo terminal

- Entrada inválida → línea de error `✗ <motivo breve>` en el log y la pregunta
  se repite (con su lista de opciones si es la de asignaturas). Sin pistas
  nuevas respecto al mock.
- Cada respuesta válida imprime una línea de confirmación `✔ <etiqueta>: <valor>`
  (estilo del mock: valor en chip).

### Final y envío (pregunta de confirmación, 2026-11-21)

- El mensaje compuesto NO se muestra: se guarda oculto en el lead (patrón
  n8n). En el log solo quedan las líneas de build (`Generando payload...`,
  `Serializando... OK`, `CANAL LISTO`).
- El final es **una pregunta más del terminal**, mismo formato: `? ¡Mensaje
  guardado! ¿Deseas contactar conmigo para agendar una primera clase gratuita
  de ~30 minutos? (Y/N)` con la línea de comandos activa y el foco en ella.
- `Y` (`y/yes/sí/si`) → línea de sistema `[200 OK] Solicitud preparada.
  Abriendo /contacto con el mensaje precargado...` + lead oculto + paso
  `SENT`; el componente navega a `/contact` (el mensaje lo consume el
  formulario oculto al usuario, patrón wizard/n8n).
- `N` (`n/no`) → **reinicio directo del terminal** (banner + pregunta 1,
  sin líneas intermedias).
- Cualquier otro valor → línea de error `✗ Valor no reconocido. Escribe Y o
  N.` y re-pregunta. Enter vacío → ignorado.
- Sin botones en el paso final; el reinicio manual es el comando `clear`
  tecleado en el propio terminal.

### Mensaje compuesto (oculto al usuario, patrón n8n)

Plantilla traducida (con placeholders), equivalente funcional a la del mock:
saludo + ciclo/año + asignaturas seleccionadas + horas + objetivo (variante si
incluye PROYECTO: foco PFC/defensa; si no: refuerzo de módulo). Descargo de no
vinculación no aplicado aquí (solo lo usa el wizard); se decide en plan.

### Listado de asignaturas por ciclo y año (elección del usuario 2026-11-21)

Las asignaturas dependen de las respuestas de ciclo y año; nombres planos y
números `[1]..[N]` sobre la lista activa. `FCT` va PRIMERA en las listas de 2º
y destacada (color/estilo de línea diferente, sin estrella); participa de la
multi-selección como cualquier otra y activa la plantilla de proyecto del
mensaje. Ids en inglés (regla AGENTS); etiquetas traducidas por locale.

| Lista | Ciclo/Año | Asignaturas (ids en inglés, orden exacto) |
|---|---|---|
| 1º (común DAW/DAM) | 1º | `PROGRAMMING` Programación · `DATABASES` Bases de datos · `SYSTEMS` Sistemas informáticos · `MARKUP_LANGUAGES` Lenguajes de marcas · `DEV_ENVIRONMENTS` Entornos de desarrollo |
| 2º DAM | 2º DAM | `FCT` **FCT — Proyecto final (destacada)** · `DATA_ACCESS` Acceso a datos · `INTERFACES` Desarrollo de interfaces · `MOBILE` Programación móvil · `PROCESSES` Programación de servicios y procesos · `ERP_SGE` Sistemas de gestión empresarial |
| 2º DAW | 2º DAW | `FCT` **FCT — Proyecto final (destacada)** · `WEB_CLIENT` Desarrollo web en entorno cliente · `WEB_SERVER` Desarrollo web en entorno servidor · `DEPLOYMENT` Despliegue de aplicaciones web |

El hint de la pregunta es genérico ("números separados por comas, ej: 1,3,4")
y el error de validación se parametriza con el máximo de la lista activa
(`{{max}}`).

### Banner y arranque del terminal (literal del mock)

Banner ASCII (en `<pre>`, blurple, decorativo, texto plano — no traducir):

```
  _  _  ___  __  __   _   ___ ___  ___   _     ___ _    ___
 | \| |/ _ \|  \/  | /_\ / __/ _ \|   \ /_\   / __| |  |_ _|
 | .` | (_) | |\/| |/ _ \ (_| (_) | |) / _ \ | (__| |__ | |
 |_|\_|\___/|_|  |_/_/ \_\___\___/|___/_/ \_\ \___|____|___|
```

Líneas de arranque (traducidas por locale; la tercera se adapta a la mecánica
multi-selección aprobada):

- Subtítulo (verde): "Nomacoda DAW / DAM Interactive Mentorship Engine
  [v2.6.4]" / en-US: "Nomacoda DAW / DAM Interactive Mentorship Engine
  [v2.6.4]".
- Descripción (muted): "Sistema interactivo de diagnóstico, refuerzo
  curricular y soporte a Proyectos de Ciclo." / "Interactive system for
  diagnostics, curriculum reinforcement and Final Project support."
- Instrucción (muted, pequeña): "Escribe tus respuestas en la terminal y pulsa
  Enter. Las asignaturas se eligen por número (ej: 1,3,4)." / "Type your
  answers in the terminal and press Enter. Subjects are picked by number
  (e.g.: 1,3,4)."
- Comando inicial: prompt + `./solicitar_tutoria.sh --interactive` (ámbar).
- Boot: `i Verificando módulos de FP informática... [OK]` /
  `i Checking vocational IT modules... [OK]`.
- Boot: `i Canal de comunicación: Discord Live + VS Code CodeShare... [OK]` /
  `i Communication channel: Discord Live + VS Code CodeShare... [OK]`.
- Cierre (blanco, medium): "Iniciando asistente de configuración
  personalizado:" / "Starting personalized setup wizard:".

## Contenido de página (layout)

De arriba a abajo, dentro de la sección (la sección mantiene el fondo por
defecto de la app; **todo el color Discord vive dentro de la ventana IDE**):

1. **Subheader breadcrumb**: `workspace / mentorship / tutorias-daw-dam.sh` +
   estado de sesión (`● tty1 (utf-8)`, "bash: session active" oculto en móvil).
2. **Ventana IDE** centrada, ancho máx. 1440px, borde $discord-border, dos
   columnas:
   - **Sidebar** (~260px, oculto en móvil):
     - Cabecera "Explorador".
     - Grupo `NOMACODA-HUB` con 4 enlaces `.md` (# coloreado por enlace):
       `tutorías.md` → `/tutoring` (activo, borde-left blurple + badge
       `active`), `angular.md` → `/angular`, `sobre-mi.md` → `/about-me`,
       `contacto.md` → `/contact`. Los href son rutas reales del router.
     - Caja `TUTORÍA STATS` (contenido del mock, traducido): "Aprobados FCT:
       100%", "Formato: 1 to 1 Discord", "Live Coding: VS Code Share".
     - Footer del sidebar: badge "Canal Discord Privado" + "● Resolución
       diaria de dudas".
   - **Área terminal**:
     - **Tabs**: `>_ terminal: solicitar_tutoria.sh` (activa, borde-top
       blurple, badge `running`), `README.md` y `discord-channel.conf`
       (inactivas, no navegables — decorativas, sin interacción).
     - **Top bar**: semáforos (decorativos), `zsh - nomacoda@cli-engine
       v2.6.4 (interactive-pty)`, botón `↻ clear & restart`, `PORT: 8080`.
     - **Cuerpo del terminal** (scrollable): banner ASCII "NOMACODA" en
       blurple + líneas de arranque (`[OK]` en verde) + log del cuestionario +
       línea de comandos activa al final (autoscroll al fondo).
     - **Status bar**: `master*`, `0 errors, 0 warnings`, `TypeScript / Shell`
       (oculto en móvil), `Interactive CLI Mode (Keyboard Enabled)`, `UTF-8`,
       badge `Discord Live`.

### Comportamiento de foco y accesibilidad

- El input de la línea de comandos es un `<input>` real (type text) con
  `aria-label` descriptivo de la pregunta activa.
- El log es una región `aria-live="polite"` (el lector anuncia cada línea
  nueva). El banner y los semáforos son decorativos (`aria-hidden`).
- Tras cada respuesta el foco permanece en el input. El botón restart y el CTA
  final son los únicos controles interactivos fuera del input.
- Sin anillos de foco en contenedores (regla AGENTS 2026-11-18): solo input,
  botones y enlaces del sidebar.
- `prefers-reduced-motion`: cursor sin parpadeo (estático), sin animaciones de
  entrada de líneas. Las animaciones globales (`fade-in-up`, etc.) se
  referencian por nombre desde `_animations.scss`, nunca redeclaradas.

### Responsive (regla AGENTS: revisión obligatoria)

- Móvil: sin sidebar (oculto), breadcrumb simplificado (oculta "bash: session
  active" y acorta la ruta), tabs y status bar reducidos, tipografía del
  terminal escala hacia abajo (el mock usa text-xs md:text-sm), la caja de
  stats y el badge de Discord del sidebar desaparecen con él.
- Sin fugas de sobreanchura: pre del banner ASCII con overflow-x auto y tamaño
  fluido.
- Barrido multi-viewport con capturas al final (escritorio/tablet/móvil).

## Tokens y temas

### `_palette.scss` — familia nueva `$discord-*`

| Token | Valor | Uso |
|---|---|---|
| `$discord-blurple` | `#7289da` | Acento principal: bordes activos, prompt, enlaces, CTA, foco |
| `$discord-input` | `#424549` | Fondo de inputs/elementos destacados |
| `$discord-border` | `#36393e` | Bordes, tab activo, divisores |
| `$discord-surface` | `#282b30` | Superficie 2 (cajas, hovers, botón restart) |
| `$discord-bg` | `#1e2124` | Fondo ventana IDE y footer sidebar |
| `$discord-panel` | `#202225` | Sidebar, tabs bar, status bar |
| `$discord-terminal` | `#181a1b` | Fondo del cuerpo del terminal |
| `$discord-success` | `#43b581` | `[OK]`, `✔`, confirmaciones, estado online |
| `$discord-warning` | `#faa61a` | Estrella ★, prompt de comando ejecutado |
| `$discord-info` | `#00d2ff` | Marcadores `?` y `i` |
| `$discord-muted` | `#94a3b8` | Texto secundario/muted |
| `$discord-cursor` | `#57f287` | Cursor parpadeante |
| `$discord-link` | `#81cfff` | Valores destacados/echo de selección |
| `$discord-red` | `#ed4245` | Semáforo rojo (decorativo) y errores críticos |

Derivadas con `rgba(palette.$discord-*, α)`. Prohibido hardcodear hex en el
SCSS del componente. Negros/blancos sólidos solo en sombras/glows (excepción
documentada en AGENTS).

### Tema del shell

- `theme-tutoring` en `styles.scss` (patrón `theme-n8n`): tiñe
  header/dock/footer/lang con familia Discord (`$discord-bg` como deep,
  `$discord-blurple` como acento/glow, `$discord-panel`/`$discord-border` como
  superficies/bordes). Ruta con `data: { theme: 'tutoring' }` y toggle en
  `app.component.ts` junto a los existentes.

## Arquitectura

```
src/app/features/tutoring-service/
  components/
    tutoring-service.component.ts      (existe; se implementa)
    tutoring-service.component.html    (existe; se implementa)
    tutoring-service.component.scss    (layout de página: breadcrumb, ventana, sidebar)
    tutoring-terminal.scss             (cuerpo del terminal, log, input, status bar)
  tutoring-terminal.service.ts         (NUEVO: lógica pura del terminal)
  tutoring-terminal.service.spec.ts
  constants/tutoring.constants.ts      (NUEVO: asignaturas, ids en inglés)
```

- **Servicio** (`providedIn: 'root'`, signals, estilo `WebMigrationWizardService`
  / `N8nWorkflowService`): estado de sesión (respuestas), cola de líneas del
  log, pregunta activa, validación/normalización pura (funciones exportadas
  para specs), `prepareLead()` / `consumePendingLead()` (plantillas traducidas
  con `TranslateService`).
- **Componente**: OnPush, `TranslateModule`; SCSS partido en 2 hojas
  (budget 8 kB/fichero como n8n); autoscroll con `viewChild` + `effect`;
  icono de flecha predeterminado de la app en CTAs (regla AGENTS).
- **i18n**: claves nuevas bajo `TUTORING.*` en `es-ES.json`/`en-US.json`
  (claves en inglés, valores traducidos). `ROUTE.TUTORING` ya existe.
- **Tests**: specs del servicio (normalización, validación, composición del
  mensaje, lead), spec del componente (render de preguntas, flujo Enter,
  restart), spec de rutas ya cubre `/tutoring`.

## Goals / Non-goals / Anti-goals

**Goals**: lead con contexto (ciclo, año, asignaturas, horas); mecánica 100%
teclado; estética Discord coherente con el shell temático; accesible y
responsive; reutiliza el patrón de leads y los mixins/tokens existentes.

**Non-goals**: backend propio (el envío es el formulario de contacto existente);
multi-idioma del payload distinto del idioma activo; persistencia de sesión;
comandos de shell reales; animaciones de typing por carácter.

**Anti-goals**: formulario por pasos como el mock HTML (se sustituye por
interacción de terminal); ayudas/contexto extra en pantalla; fuentes nuevas;
hardcodear colores fuera de `_palette.scss`; fondos de página distintos al
gradiente por defecto de la app.

## Lo que queda al builder

- Estructura interna del servicio (señales, tipos, orden de plantillas i18n).
- Detalles de micro-layout (espaciados, tamaños concretos) siguiendo el mock.
- Animaciones puntuales (entrada de líneas) dentro de las restricciones de
  reduced-motion y keyframes globales.
- Texto exacto de los errores de validación (en clave i18n, valores en ambos
  idiomas, tono del mock) y redacción final de las plantillas del mensaje.
- Semántica de sesión al re-entrar tras dispatch (el lead se consume y el
  estado persiste salvo `clear & restart`): decidible con los patrones
  wizard/n8n.
- Split de hojas SCSS, altura/scroll del cuerpo del terminal, breakpoints y
  gestión de foco tras restart.

**Mi llamada (registrada):** el mensaje enviado a contacto incluye un descargo
breve adaptado a tutorías (clave nueva `TUTORING.TERMINAL.DISCLAIMER`, no el
`WIZARD.DISCLAIMER` de migración).
