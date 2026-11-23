# Página /tutoring — Terminal interactivo Discord: Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir la ruta `/tutoring` (placeholder vacío) en la página de tutorías DAW/DAM: ventana IDE con estética Discord cuyo interior es un terminal interactivo real (preguntas por líneas, respuestas tecleadas, multi-selección de asignaturas por números) que entrega un lead al formulario de contacto.

**Architecture:** Lógica pura del terminal (normalizadores/validadores) + máquina de estados con signals en `TutoringTerminalService` (patrón `WebMigrationWizardService`), lead consumido por `ContactFormComponent` como tercer lead. Componente OnPush con dos hojas SCSS (budget 8 kB/fichero) y tema de shell `theme-tutoring`.

**Tech Stack:** Angular 21 standalone + signals + OnPush, ngx-translate, SCSS con tokens (`_palette.scss`), Karma/Jasmine.

**Spec:** `docs/superpowers/specs/2026-11-21-tutoring-terminal-design.md` (los valores de contenido — asignaturas, banner, boot lines — viven ahí; este plan los referencia, no los duplica).

## Global Constraints

- **NO ejecutar `git add/commit/push`** (AGENTS 2026-08-06): cada tarea termina con los cambios en disco y mostrando el comando sugerido como referencia; el usuario comitea. Los pasos "Commit" del formato se sustituyen por "Verificación + comando sugerido".
- Colores SOLO vía `palette.$discord-*` y `rgba(palette.$discord-*, α)`; prohibido hex crudo en SCSS de componentes. Negros/blancos sólidos solo en sombras/glows (excepción AGENTS).
- Tipografía: `fonts.$mono` para el terminal, `fonts.$body`/`fonts.$heading` para lo heredado. Sin fuentes nuevas ni `@font-face` nuevos.
- Prohibido `::ng-deep` y referenciar clases de otros componentes (AGENTS). Encapsulación por componente.
- La sección mantiene el fondo por defecto de la app; TODO color Discord va dentro de la ventana IDE (spec).
- i18n: claves en inglés, valores por locale; namespace nuevo top-level `TUTORING`.
- Anillos de foco solo en interactivos (input, botones, enlaces sidebar); nunca en contenedores (AGENTS 2026-11-18).
- CTA con icono de flecha predeterminado de la app (viewBox `0 0 16 16`, path `M1.5 8h11.3M8.2 3.5 12.7 8l-4.5 4.5`, stroke 1.8) inline con clase local.
- Keyframes globales (`_animations.scss`) solo se referencian por nombre; el bloque `prefers-reduced-motion` global ya neutraliza animaciones — no duplicarlo (cursor blink incluido: se apaga solo; verificar en Task 8).
- Budget SCSS: `anyComponentStyle` 6 kB warn / 8 kB error por fichero (angular.json). Máximo 2 hojas: `tutoring-service.component.scss` (layout) y `tutoring-terminal.scss` (interior terminal).
- `@use` normalizado: `@use "src/styles/_palette" as palette;` (y `shadows`/`focus`/`elements` según se usen).
- Tests: `npx ng test --include='src/app/features/tutoring-service/**/*.spec.ts' --watch=false --browsers=ChromeHeadless` (Karma/Jasmine). Suite completa al final: `npx ng test --watch=false --browsers=ChromeHeadless`.

## Review Focus

1. **Entradas raras del multi-select** (`"1,,3"`, `" 1 , 3 "`, `"01"`, `"3,3,3"`, `"4,1"`): el usuario espera dedupe + orden de lista (`"4,1"` → `[0, 3]`), tokens no numéricos o fuera de `1..13` → error, no crash. → Test en Task 4 (`parseSubjectSelection`).
2. **Enter con input vacío en cualquier paso**: el usuario espera que NO pase nada (ni línea nueva ni cambio de paso). → Test en Task 5 (`submit('')` no añade líneas).
3. **Foco tras cada respuesta y tras restart**: el usuario teclea en cadena; el foco debe permanecer en el input del CLI (NO el patrón de foco al heading de n8n). → Test en Task 7.
4. **Lead consumido una sola vez + unión de 3 leads** en el formulario de contacto: segunda lectura → null; coexistencia wizard+n8n+tutoring → join con `\n\n`. → Tests en Task 5.
5. **Contraste y reduced-motion** (Task 8): blurple sobre superficies oscuras para texto pequeño debe pasar 4.5:1 (si no, usar `$discord-link #81cfff` para texto pequeño); cursor parpadeante neutro con `prefers-reduced-motion`.

---

### Task 1: Tokens Discord + tema del shell (`theme-tutoring`)

**Files:**
- Modify: `src/styles/_palette.scss` (añadir familia tras el bloque n8n, líneas ~60)
- Modify: `src/styles/styles.scss` (añadir `.theme-tutoring` tras `.theme-n8n`, línea ~630, dentro de la región "Tema de servicio")
- Modify: `src/app/app.routes.ts:69` (añadir `theme: 'tutoring'` al data de la ruta)
- Modify: `src/app/app.component.ts:92` (añadir toggle)
- Test: `src/app/app.component.spec.ts` (junto al test de `theme-n8n`, líneas ~165-171)

**Interfaces:**
- Consumes: patrón `.theme-n8n` (styles.scss 600-630) y toggle en `app.component.ts` 90-92.
- Produces: tokens `$discord-*` que consumen Tasks 6-8; clase `.theme-tutoring` en `<html>`.

- [ ] **Step 1: Write the failing test**

En `app.component.spec.ts`, junto al test existente de theme-n8n, añadir el gemelo (mismo patrón: ruta con `data: { theme: 'tutoring' }` → `document.documentElement.classList.contains('theme-tutoring')` true; al salir → false).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --include='src/app/app.component.spec.ts' --watch=false --browsers=ChromeHeadless`
Expected: FAIL (el toggle de `theme-tutoring` no existe).

- [ ] **Step 3: Implement**

1. `_palette.scss` — bloque nuevo con comentario de origen (marca Discord, mock 2026-11-21):

```scss
// Familia Discord de la página /tutoring (mock 2026-11-21), de más profunda
// a más clara. Blurple = acento principal (bordes/prompt/CTA).
$discord-bg: #1e2124;        // Fondo de la ventana IDE / deep del tema
$discord-panel: #202225;     // Sidebar, tabs, status bar / dark del tema
$discord-terminal: #181a1b;  // Fondo del cuerpo del terminal
$discord-surface: #282b30;   // Superficie 2: cajas, hovers, botón restart
$discord-border: #36393e;    // Bordes, tab activa, divisores
$discord-input: #424549;     // Fondo del input del CLI / elementos destacados
$discord-blurple: #7289da;   // Acento principal
$discord-success: #43b581;   // [OK], ✔, confirmaciones
$discord-warning: #faa61a;   // ★, comando ejecutado
$discord-info: #00d2ff;      // Marcadores ? / i
$discord-muted: #94a3b8;     // Texto secundario
$discord-cursor: #57f287;    // Cursor parpadeante
$discord-link: #81cfff;      // Valores destacados / texto pequeño sobre oscuro
$discord-red: #ed4245;       // Semáforo rojo decorativo
```

2. `styles.scss` — `.theme-tutoring` con el MISMO set de custom properties que `.theme-n8n` (header-glass/border/glow-rgb/logo-mid/index/focus/pill-hover/pill-active, dock-glass/glow-rgb/glow/inner-border/icon-linkedin/focus-outer/focus-inner, footer-glass/border/separator/soft/accent, lang-label/panel/panel-border/item-hover), mapeando: deep=`$discord-bg`, dark=`$discord-panel`, acento/glow/index/focus=`$discord-blurple`, light secondary (logo-mid, icon-linkedin, footer-soft, footer-accent, lang-label)=`$discord-link`, bordes=`$discord-border`. Interpolación `#{ }` obligatoria para `rgba()`/`color.channel()`.

3. `app.routes.ts` ruta `tutoring`: `data: { animation: 'Tutoring', titleKey: 'ROUTE.TUTORING', theme: 'tutoring' }`.

4. `app.component.ts`: `document.documentElement.classList.toggle('theme-tutoring', theme === 'tutoring');`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test --include='src/app/app.component.spec.ts' --watch=false --browsers=ChromeHeadless`
Expected: PASS (test nuevo + existentes).

- [ ] **Step 5: Verificación + comando sugerido (NO ejecutar el commit)**

Run: `npx ng build` → PASS sin errores de compilación SCSS.
Sugerido al usuario: `git add src/styles/_palette.scss src/styles/styles.scss src/app/app.routes.ts src/app/app.component.ts src/app/app.component.spec.ts && git commit -m "feat(tutoring): tokens Discord y tema theme-tutoring para el shell"`

---

### Task 2: Constants de asignaturas

**Files:**
- Create: `src/app/features/tutoring-service/constants/tutoring.constants.ts`
- Test: `src/app/features/tutoring-service/constants/tutoring.constants.spec.ts`

**Interfaces:**
- Produces (consumen Tasks 4, 5, 7):

```ts
export type TutoringSubjectId =
  | 'FINAL_PROJECT' | 'PROGRAMMING' | 'DATABASES' | 'DEV_ENVIRONMENTS'
  | 'WEB_CLIENT' | 'WEB_SERVER' | 'DEPLOYMENT' | 'INTERFACES'
  | 'PROCESSES' | 'DATA_ACCESS' | 'MOBILE' | 'ERP_SGE' | 'NETWORKS';

export interface TutoringSubject {
  readonly id: TutoringSubjectId;
  readonly highlighted: boolean;
}

/** 13 opciones, orden de lista; FINAL_PROJECT primero y resaltada. */
export const TUTORING_SUBJECTS: readonly TutoringSubject[];
```

- [ ] **Step 1: Write the failing test** (`tutoring.constants.spec.ts`)

```ts
describe('TUTORING_SUBJECTS', () => {
  it('lista 13 asignaturas en el orden del spec', () => {
    expect(TUTORING_SUBJECTS.length).toBe(13);
    expect(TUTORING_SUBJECTS[0].id).toBe('FINAL_PROJECT');
    expect(TUTORING_SUBJECTS[1].id).toBe('PROGRAMMING');
    expect(TUTORING_SUBJECTS[12].id).toBe('NETWORKS');
  });
  it('solo FINAL_PROJECT está resaltada y los ids son únicos', () => {
    expect(TUTORING_SUBJECTS.filter((s) => s.highlighted)).toEqual([
      { id: 'FINAL_PROJECT', highlighted: true }
    ]);
    expect(new Set(TUTORING_SUBJECTS.map((s) => s.id)).size).toBe(13);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — comando del Global Constraints sobre `constants/**`. Expected: FAIL (fichero no existe).

- [ ] **Step 3: Implement** — array literal con los 13 ids en el orden del spec (sección "Listado exacto de asignaturas"). Etiquetas NO van aquí: se resuelven vía i18n `TUTORING.TERMINAL.SUBJECTS.<id>`.

- [ ] **Step 4: Run test to verify it passes** — Expected: PASS.

- [ ] **Step 5: Verificación + comando sugerido** — `git add src/app/features/tutoring-service/constants/ && git commit -m "feat(tutoring): constants de asignaturas DAW/DAM"`

---

### Task 3: i18n — namespace `TUTORING` (es-ES + en-US)

**Files:**
- Modify: `src/assets/i18n/es-ES.json` (bloque top-level `TUTORING` antes de `ROUTE`)
- Modify: `src/assets/i18n/en-US.json` (idéntico árbol)

**Interfaces:**
- Produces: TODAS las claves `TUTORING.TERMINAL.*` que consumen Tasks 5-7. Árbol exacto (claves en inglés; valores es/en):

```
TUTORING.TERMINAL
├─ BREADCRUMB: WS ("workspace"/"workspace"), DIR ("mentorship"/"mentorship"),
│    FILE ("tutorias-daw-dam.sh"/"tutorias-daw-dam.sh"),
│    SESSION_ACTIVE ("bash: session active"/"bash: session active"),
│    TTY ("tty1 (utf-8)"/"tty1 (utf-8)")
├─ SIDEBAR: EXPLORER ("Explorador"/"Explorer"), GROUP ("NOMACODA-HUB"/"NOMACODA-HUB"),
│    FILE_TUTORING ("tutorías.md"/"tutoring.md"), FILE_ANGULAR ("angular.md"),
│    FILE_ABOUT ("sobre-mi.md"/"about-me.md"), FILE_CONTACT ("contacto.md"/"contact.md"),
│    BADGE_ACTIVE ("active"), STATS_TITLE ("TUTORÍA STATS"/"TUTORING STATS"),
│    STATS_FCT_LABEL ("Aprobados FCT:"/"FCT pass rate:"), STATS_FCT_VALUE ("100%"),
│    STATS_FORMAT_LABEL ("Formato:"/"Format:"), STATS_FORMAT_VALUE ("1 to 1 Discord"),
│    STATS_LIVE_LABEL ("Live Coding:"), STATS_LIVE_VALUE ("VS Code Share"),
│    CHANNEL_TITLE ("Canal Discord Privado"/"Private Discord Channel"),
│    CHANNEL_SUBTITLE ("● Resolución diaria de dudas"/"● Daily Q&A resolution")
├─ TABS: TERMINAL ("terminal: solicitar_tutoria.sh"), BADGE_RUNNING ("running"),
│    README ("README.md"), CONF ("discord-channel.conf")
├─ TOPBAR: ENGINE ("zsh - nomacoda@cli-engine v2.6.4 (interactive-pty)"),
│    RESTART ("clear & restart"), PORT ("PORT: 8080")
├─ STATUSBAR: BRANCH ("master*"), ERRORS ("0 errors, 0 warnings"),
│    LANG ("TypeScript / Shell"), MODE ("Modo CLI interactivo (teclado habilitado)"/
│    "Interactive CLI Mode (Keyboard Enabled)"), ENCODING ("UTF-8"), BADGE ("Discord Live")
├─ BANNER: TITLE / DESCRIPTION / HINT (valores del spec, sección "Banner y arranque")
├─ BOOT: CHECK_MODULES / CHECK_CHANNEL / START (valores del spec; el literal
│    "./solicitar_tutoria.sh --interactive" va en constants/component, no en i18n;
│    "[OK]" se imprime por tono, sin clave)
├─ QUESTIONS: CYCLE ("¿Qué ciclo estás estudiando?"/"Which cycle are you studying?"),
│    CYCLE_HINT ("(DAW / DAM)"), YEAR ("¿En qué año estás?"/"Which year are you in?"),
│    YEAR_HINT ("(1º / 2º)"),
│    SUBJECTS ("¿Con qué asignaturas necesitas ayuda?"/"Which subjects do you need help with?"),
│    SUBJECTS_HINT ("(números del 1 al 13, separados por comas)"/
│    "(numbers from 1 to 13, comma-separated)"),
│    HOURS ("¿Cuántas horas a la semana quieres dedicarle?"/
│    "How many hours per week can you commit?"),
│    HOURS_HINT ("(ej: 4h o Intensivo)"/"(e.g.: 4h or Intensive)")
├─ ERRORS: CYCLE ("Valor no reconocido. Escribe daw o dam."/
│    "Unrecognized value. Type daw or dam."),
│    YEAR ("Valor no reconocido. Escribe 1 o 2."/"Unrecognized value. Type 1 or 2."),
│    SUBJECTS ("Selección no válida: escribe números del 1 al 13 separados por comas."/
│    "Invalid selection: type numbers from 1 to 13 separated by commas.")
├─ ECHO: CYCLE ("Ciclo:"/"Cycle:"), YEAR ("Curso:"/"Year:"),
│    SUBJECTS ("Asignaturas:"/"Subjects:"), HOURS ("Horas semanales:"/"Weekly hours:")
├─ SUMMARY: BUILDING ("Generando payload para el formulario de contacto..."/
│    "Generating payload for the contact form..."),
│    BUILD_OK ("[build] Serializando parámetros del alumno... OK"/
│    "[build] Serializing student parameters... OK"),
│    SOCKET_OK ("[socket] Comprobando disponibilidad en servidor Discord... CANAL LISTO"/
│    "[socket] Checking availability on Discord server... CHANNEL READY"),
│    READY ("✔ Payload listo:"/"✔ Payload ready:")
├─ MESSAGE: WITH_PROJECT y WITH_MODULES (placeholders {{cycle}}, {{year}}, {{subjects}},
│    {{hours}}; redacción del mock: proyecto → "Busco asegurar una calificación alta y
│    resolver dudas de arquitectura frontend/backend para el tribunal." / módulos →
│    "Me gustaría afianzar conceptos prácticos, resolver ejercicios y preparar los
│    exámenes del módulo con garantías."; adaptar el arranque "Hola Nomacoda, soy un
│    alumno de..." en ambos locales),
│    DISCLAIMER ("Mensaje generado desde la terminal de tutorías (/tutoring); sujeto a
│    disponibilidad horaria."/"Message generated from the tutoring terminal (/tutoring);
│    subject to schedule availability.")
└─ SUBJECTS: 13 claves con los ids de Task 2 y los valores de la tabla del spec
     (es-ES y en-US).
```

- [ ] **Step 1: Añadir el bloque completo a ambos JSON** (mismo árbol, valores por locale).

- [ ] **Step 2: Verificar sintaxis JSON**

Run: `node -e "['es-ES','en-US'].forEach(l=>JSON.parse(require('fs').readFileSync('src/assets/i18n/'+l+'.json','utf8')));console.log('OK')"`
Expected: `OK`

- [ ] **Step 3: Verificación + comando sugerido** — `git add src/assets/i18n && git commit -m "feat(tutoring): namespace i18n TUTORING (es/en)"`

---

### Task 4: Lógica pura del terminal (normalizadores/validadores)

**Files:**
- Create: `src/app/features/tutoring-service/tutoring-terminal.service.ts` (SÓLO tipos + funciones puras exportadas, sin clase inyectable aún)
- Test: `src/app/features/tutoring-service/tutoring-terminal.service.spec.ts`

**Interfaces:**
- Consumes: `TUTORING_SUBJECTS` (Task 2).
- Produces (consumen Tasks 5-7):

```ts
export type TerminalTone = 'accent' | 'success' | 'muted' | 'info' | 'warning' | 'link' | 'plain' | 'error';
export type TerminalLineKind = 'banner' | 'boot' | 'question' | 'options' | 'input' | 'echo' | 'error' | 'payload' | 'system';
export interface TerminalPart {
  readonly tone: TerminalTone;
  readonly key?: string;      // clave i18n a traducir
  readonly text?: string;     // texto literal (valores normalizados, banner, [OK])
  readonly params?: Record<string, string | number>;
}
export interface TerminalLine {
  readonly id: number;
  readonly kind: TerminalLineKind;
  readonly parts: readonly TerminalPart[];
  readonly pre?: boolean;     // banner ASCII: <pre>
}
export type TerminalStep = 'CYCLE' | 'YEAR' | 'SUBJECTS' | 'HOURS' | 'DONE';
export interface TutoringAnswers {
  cycle: string; year: string; subjects: readonly TutoringSubjectId[]; hours: string;
}
export interface TutoringLead { readonly message: string; }

/** 'daw'/'DAW '/'dam' → 'DAW'|'DAM'; resto → null. */
export function normalizeCycle(value: string): 'DAW' | 'DAM' | null;
/** '1'/'1º' → '1º', '2'/'2º' → '2º'; resto → null. */
export function normalizeYear(value: string): '1º' | '2º' | null;
/**
 * '1' → [0]; '1,3,4' → [0,2,3]; ' 3 , 01 ' → [2,0]; '4,1' → [0,3];
 * dedupe + orden de lista; cualquier token no numérico o fuera de 1..13 → null.
 */
export function parseSubjectSelection(value: string): number[] | null;
/** Recorta espacios; '' → null; '4' → '4h'; '4h'/'Intensivo' → tal cual. */
export function normalizeHours(value: string): string | null;
```

- [ ] **Step 1: Write the failing test** — casos por función, incluidos TODOS los del Review Focus #1 (`'1,,3'`→`[0,2]`, `' 1 , 3 '`→`[0,2]`, `'01'`→`[0]`, `'3,3,3'`→`[2]`, `'4,1'`→`[0,3]`, `'0'`→null, `'14'`→null, `'1,x'`→null, `''`→null) y los de ciclo/año/horas del spec.

- [ ] **Step 2: Run test to verify it fails** — Expected: FAIL (no existe el fichero).

- [ ] **Step 3: Implement** — funciones puras sin dependencias de Angular; `parseSubjectSelection` valida con `TUTORING_SUBJECTS.length`.

- [ ] **Step 4: Run test to verify it passes** — Expected: PASS.

- [ ] **Step 5: Verificación + comando sugerido** — `git add src/app/features/tutoring-service/tutoring-terminal.service.* && git commit -m "feat(tutoring): lógica pura del terminal (normalizadores y parseo multi-select)"`

---

### Task 5: Servicio de estado + lead + tercer lead en contacto

**Files:**
- Modify: `src/app/features/tutoring-service/tutoring-terminal.service.ts` (añade la clase)
- Test: `src/app/features/tutoring-service/tutoring-terminal.service.spec.ts` (añade suite de la clase)
- Modify: `src/app/features/contact/components/contact-form/contact-form.component.ts:47-57` (tercer lead)
- Test: `src/app/features/contact/components/contact-form/contact-form.component.spec.ts`
- Reference (patrón de stub de TranslateService): `src/app/features/angular-service/web-migration-wizard.service.spec.ts`

**Interfaces:**
- Consumes: tipos/funciones de Task 4, `TUTORING_SUBJECTS` (Task 2), claves i18n (Task 3).
- Produces (consume Task 7, y contact-form):

```ts
@Injectable({ providedIn: 'root' })
export class TutoringTerminalService {
  /** Log inicial: banner (pre) + subtítulo + descripción + hint + boot [OK]x2 + start. */
  readonly lines: Signal<readonly TerminalLine[]>;
  readonly step: Signal<TerminalStep>;            // 'CYCLE' inicial
  readonly answers: Signal<TutoringAnswers>;
  submit(raw: string): void;                      // '' → no-op total
  restart(): void;                                // reset a líneas iniciales + CYCLE
  prepareLead(): TutoringLead | null;             // solo con step === 'DONE'
  consumePendingLead(): TutoringLead | null;      // un solo consumo
}
```

- [ ] **Step 1: Write the failing tests** (suite de la clase; stub de TranslateService siguiendo el patrón wizard):
  - `submit('')` en cualquier paso → mismas `lines` (misma referencia length) y `step` sin cambio.
  - Flujo feliz: `submit('daw')` → step `YEAR` + línea echo `ECHO.CYCLE` + línea pregunta YEAR; `submit('2')` → `SUBJECTS` + líneas de opciones (13); `submit('1,3')` → `HOURS`, answers.subjects = `['FINAL_PROJECT','DEV_ENVIRONMENTS']`; `submit('4')` → `DONE` + líneas SUMMARY + payload visible.
  - Camino con error: `submit('dfk')` en CYCLE → línea kind `error` con `ERRORS.CYCLE` + step sigue `CYCLE` + pregunta reimpresa.
  - `prepareLead()` antes de DONE → null; tras flujo → mensaje con plantilla `MESSAGE.*` (params subjects = etiquetas join) + `\n\n` + DISCLAIMER; `consumePendingLead()` 2ª vez → null (Review Focus #4).
  - `restart()` → líneas = iniciales, step `CYCLE`, answers reset, lead pendiente null.

- [ ] **Step 2: Run test to verify it fails** — Expected: FAIL (clase no existe).

- [ ] **Step 3: Implement** — signals privados + `asReadonly`; ids de línea con contador; `TranslateService.instant` para claves (etiquetas de asignatura: `TUTORING.TERMINAL.SUBJECTS.<id>`, join ", " + conector final por locale); `prepareLead` compone con `MESSAGE.WITH_PROJECT` si `subjects` incluye `FINAL_PROJECT`, si no `MESSAGE.WITH_MODULES`.

- [ ] **Step 4: Run test to verify it passes** — Expected: PASS (clase + puras).

- [ ] **Step 5: Write failing test del tercer lead en contact-form** — en `contact-form.component.spec.ts`: providers con stub de `TutoringTerminalService` cuyo `consumePendingLead()` devuelve `{ message: 'LEAD_TUTORING' }` → el campo `message` del form contiene `LEAD_TUTORING` (y combinado con los otros si existen).

- [ ] **Step 6: Run test to verify it fails** — Expected: FAIL.

- [ ] **Step 7: Implement en contact-form.component.ts** — `inject(TutoringTerminalService).consumePendingLead()` y añadir a la cadena de join (líneas 47-57).

- [ ] **Step 8: Run tests to verify it passes** — suites de tutoring + contact-form. Expected: PASS.

- [ ] **Step 9: Verificación + comando sugerido** — `git add src/app/features/tutoring-service src/app/features/contact && git commit -m "feat(tutoring): máquina de estados del terminal y tercer lead en contacto"`

---

### Task 6: Layout de página — breadcrumb, ventana, sidebar, tabs, topbar, statusbar

**Files:**
- Modify: `src/app/features/tutoring-service/components/tutoring-service.component.ts`
- Modify: `src/app/features/tutoring-service/components/tutoring-service.component.html`
- Modify: `src/app/features/tutoring-service/components/tutoring-service.component.scss`
- Test: `src/app/features/tutoring-service/components/tutoring-service.component.spec.ts`

**Interfaces:**
- Consumes: `TutoringTerminalService` (Task 5), tokens `$discord-*` (Task 1), claves i18n (Task 3).
- Produces: el componente expone `protected readonly terminal = inject(TutoringTerminalService);` (nombre que consume Task 7) y estructura DOM que Task 7 rellena: `<section class="tutoring">` → breadcrumb → `.tutoring-window` (border $discord-border, sombra) con `<aside class="tutoring-sidebar">` + `.tutoring-main` → tabs/topbar/`<div class="tutoring-terminal">` (Task 7)/statusbar.

- [ ] **Step 1: Write the failing test** — render: breadcrumb (3 partes + TTY), sidebar con 4 `routerLink` (`/tutoring`, `/angular`, `/about-me`, `/contact`) y el archivo activo `tutorías.md`, caja STATS, badge canal, tabs (3), topbar con botón restart (aún sin handler activo no pasa nada si no existe el binding: enlazar ya a `restart()` del servicio — existe), statusbar (branch, errors, badge). Comprobar que la sección NO define fondo propio (regla AGENTS).

- [ ] **Step 2: Run test to verify it fails** — Expected: FAIL (HTML es placeholder vacío).

- [ ] **Step 3: Implement**
  - TS: imports (`RouterLink`, `TranslateModule`), `inject(TutoringTerminalService)`, OnPush.
  - HTML: estructura del spec (sección "Contenido de página") con `translate` pipe; sidebar oculto en móvil vía CSS (clase, no inline); tabs NO interactivas (`<div>` decorativas); enlaces del sidebar con `routerLink` y `routerLinkActive` para el archivo activo; botón restart con `(click)="restart()"` delegando en el servicio; SVG de flecha NO aplica aquí (es CTA de Task 7).
  - SCSS (`component.scss`): grid/columnas ventana, sidebar 260px, hover de enlaces (bg `$discord-surface`), borde-left activo con `$discord-blurple`, badge `active`, caja stats, tabs (activa con border-top blurple), semáforos con `$discord-red`/`$discord-warning`/`$discord-success`, statusbar. `shadow-lg` de `_shadows` para la ventana; `focus-ring(palette.$discord-blurple)` en enlaces y botón restart.

- [ ] **Step 4: Run test to verify it passes** + `npx ng build` (budget de component.scss). Expected: PASS.

- [ ] **Step 5: Verificación + comando sugerido** — `git add src/app/features/tutoring-service/components && git commit -m "feat(tutoring): layout IDE de la página (breadcrumb, sidebar, tabs, statusbar)"`

---

### Task 7: Terminal interactivo — feed, input, opciones, payload, CTA

**Files:**
- Modify: `src/app/features/tutoring-service/components/tutoring-service.component.ts` (wiring)
- Modify: `src/app/features/tutoring-service/components/tutoring-service.component.html` (interior de `.tutoring-terminal`)
- Create: `src/app/features/tutoring-service/components/tutoring-terminal.scss` (añadir a `styleUrls` del componente)
- Test: `src/app/features/tutoring-service/components/tutoring-service.component.spec.ts`

**Interfaces:**
- Consumes: componente con `protected readonly terminal = inject(TutoringTerminalService);` (Task 6); `TutoringTerminalService` completo (Task 5), `TUTORING_SUBJECTS` (Task 2), tokens (Task 1).
- Produces: página completa y funcional; dispatch navega a `/contact` con lead consumible.

- [ ] **Step 1: Write the failing tests** (component spec con `provideRouter`, patrón de specs existentes de wizard/n8n):
  - Render inicial: banner `<pre>`, líneas de boot, prompt con input (aria-label con la pregunta activa), región log con `aria-live="polite"`, cursor visible.
  - Flujo E2E tecleado: set input `daw` → Enter → placeholder de input cambia al paso YEAR; … completar `2` → `1,3` → `4` → aparece bloque payload (kind `payload`) + CTA `EJECUTAR DISPATCH`.
  - Inválido: input `dfk` en CYCLE → se añade línea de error, paso no cambia.
  - Enter vacío: no añade líneas (Review Focus #2/#3 en DOM).
  - Foco: tras cada submit, `document.activeElement` es el input del CLI; tras restart, también (Review Focus #3).
  - Dispatch: click CTA → `router.navigate` a `/contact` y el lead quedó preparado (stub del servicio: espiar `prepareLead`).
  - Restart: botón topbar → log vuelve al banner + CYCLE.
  - Opciones del paso SUBJECTS: se renderizan 13 líneas desde `TUTORING_SUBJECTS` con claves i18n; `FINAL_PROJECT` con clase resaltada.

- [ ] **Step 2: Run test to verify it fails** — Expected: FAIL.

- [ ] **Step 3: Implement**
  - HTML: `@for (line of terminal.lines(); track line.id)` con clase por `kind`/tone; para kind `options` render de la lista numerada (decorativa — la selección es por teclado); línea de comandos: prompt (partes verde/azul/blanco según mock) + `<input>` + cursor parpadeante cuando el input está vacío sin foco estático… (cursor: bloque `$discord-cursor` tras el texto; con input real, el caret nativo actúa — cursor-block SOLO decorativo junto al prompt, `aria-hidden`).
  - `(keydown.enter)` → `terminal.submit(input.value)` + `input.value = ''`.
  - Payload y CTA cuando `terminal.step() === 'DONE'`: bloque de mensaje (border-left blurple) con el texto del payload (exponer `payloadText()` en el servicio o renderizarlo desde líneas kind `payload`), CTA "EJECUTAR DISPATCH" (estilo blurple del mock, uppercase, con SVG de flecha predeterminado y clase local `tutoring-cta-arrow`) + botón secundario restart.
  - Autoscroll: `effect()` + `viewChild` del contenedor → `scrollTop = scrollHeight` cuando `lines()` cambia (con `AfterViewChecked` como n8n si hace falta).
  - Foco: tras cada render de paso nuevo, `input.nativeElement.focus()` si no lo está (sin robar el foco inicial en primer render).
  - SCSS (`tutoring-terminal.scss`): fondo `$discord-terminal`, tipografía `fonts.$mono` tamaño fluido (0.75rem → 0.875rem en ≥768px), colores por tono (accent/success/muted/info/warning/link/error), scroll slim (thumb `$discord-border`, hover blurple), cursor keyframe propio `tutoring-cursor-blink` (o el bloque estático + animation; reduced-motion lo neutraliza el bloque global — verificar), payload con border-left 4px blurple, CTA blurple con hover `rgba(palette.$discord-blurple, 0.85)` y `active: scale(0.98)`.

- [ ] **Step 4: Run tests to verify it passes** + `npx ng build` (budget de las 2 hojas). Expected: PASS.

- [ ] **Step 5: Verificación + comando sugerido** — `git add src/app/features/tutoring-service && git commit -m "feat(tutoring): terminal interactivo completo (feed, input, multi-select, payload y dispatch)"`

---

### Task 8: A11y (WCAG), responsive y verificación final

**Files:**
- Modify (si procede): los ficheros de Tasks 6-7 (ajustes de contraste/foco/estilos)
- Create: `a11y-report_tutoring.json` (ya existe vacío en la raíz: rellenarlo) — opcional según resultado

**Interfaces:**
- Consumes: página completa de Task 7.

- [ ] **Step 1: Skill de accesibilidad** — cargar `accesibilidad-web-wcag` y auditar el componente: contraste (blurple #7289da sobre $discord-panel/$discord-terminal para texto pequeño ≥ 4.5:1; si falla → `$discord-link #81cfff` para texto pequeño, blurple solo en bordes/fondos de botón con texto blanco — verificar blanco sobre blurple ≥ 4.5:1), labels del input, `aria-live` correcto, foco sin anillos en contenedores, orden de tabulación (input → restart → CTA → enlaces sidebar).

- [ ] **Step 2: Barrido responsive con capturas** (Chrome DevTools MCP): 1440px, 1024px, 834px (tablet, sidebar visible u oculto según corte elegido), 768px y 390px (móvil: sidebar oculto, breadcrumb reducido, sin fuga de sobreanchura — el `<pre>` del banner con overflow-x auto). Verificar costuras con el footer fijo y el header.

- [ ] **Step 3: Suite completa**

Run: `npx ng test --watch=false --browsers=ChromeHeadless` (toda la suite, incl. contact-form y app.component).
Expected: PASS sin regresiones.

Run: `npx ng build` → PASS (budgets OK, 2 hojas < 8 kB).
Run: `npx ng lint` (si el repo lo usa) → PASS.

- [ ] **Step 4: Verificación + comando sugerido** — `git add -A && git commit -m "feat(tutoring): página /tutoring — terminal interactivo Discord (a11y + responsive)"`
