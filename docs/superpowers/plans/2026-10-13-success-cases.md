# Success Cases (Casos de éxito) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nueva sección "Casos de éxito" en `/casos-exito` con tarjetas basadas en el mockup, sustituyendo el feature obsoleto `projects` (renombrado a `-old`) y navegación al home desde el logo del header.

**Architecture:** Feature nuevo `features/success-cases/` con tres componentes standalone (sección/grid, tarjeta, píldora) más un modal de detalle. Datos movidos de `projects` con nuevo campo `technologies`. El feature `projects` se renombra a `projects-old` y queda sin referencias activas. Header: el brand pasa a link al home y el nav "Casos de éxito" apunta a la ruta nueva.

**Tech Stack:** Angular 21 (standalone, signals, `input()`/`output()`), SCSS con tokens de `_palette.scss`/`_fonts.scss`, ngx-translate, Karma+Jasmine (+jasmine-axe), Node scripts para paletas.

**⚠️ REGLA DEL REPO (AGENTS.md): PROHIBIDO ejecutar `git add`/`git commit`/`git push`.** Cada tarea termina dejando los cambios en disco; se muestra el comando de commit SOLO como referencia para el usuario, nunca se ejecuta.

---

## File Structure

```
src/app/features/success-cases/                      (NUEVO)
  interfaces/success-case.interface.ts
  constants/success-cases.constants.ts
  constants/success-case-palettes.ts                 (generado/copiado)
  components/
    success-cases/success-cases.component.{ts,html,scss,spec.ts}
    success-case/success-case.component.{ts,html,scss,spec.ts}
    tech-pill/tech-pill.component.{ts,spec.ts}
    success-case-detail/success-case-detail.component.{ts,html,scss,spec.ts}

src/app/features/projects/ → src/app/features/projects-old/   (RENOMBRADO, obsoleto)
  components/projects-old.component.*
  components/project-old/*
  constants/projects-old.constants.ts
  constants/project-palettes.ts
  interfaces/project.interface.ts

src/app/app.routes.ts                                (MODIFICAR: ruta /casos-exito)
src/app/core/components/header/header.component.{html,scss,spec.ts}  (MODIFICAR)
src/app/core/components/sections-wrapper/…           (MODIFICAR: apunta a projects-old)
scripts/generate-palettes.mjs                        (MODIFICAR: rutas)
scripts/a11y-smoke.mjs                               (MODIFICAR: añadir ruta)
src/assets/i18n/es-ES.json, en-US.json               (MODIFICAR: claves nuevas)
```

---

### Task 1: Renombrar `projects` → `projects-old`

**Files:**
- Rename: `src/app/features/projects/` → `src/app/features/projects-old/`
- Rename: `projects.component.*` → `projects-old.component.*`; `project/project.component.*` → `project/project-old.component.*`; `projects.constants.ts` → `projects-old.constants.ts`
- Modify: `src/app/core/components/sections-wrapper/sections-wrapper.component.ts`, `.html`, `.spec.ts`

- [ ] **Step 1: Mover y renombrar archivos con git mv**

```bash
git mv src/app/features/projects src/app/features/projects-old
git mv src/app/features/projects-old/components/projects.component.ts src/app/features/projects-old/components/projects-old.component.ts
git mv src/app/features/projects-old/components/projects.component.html src/app/features/projects-old/components/projects-old.component.html
git mv src/app/features/projects-old/components/projects.component.scss src/app/features/projects-old/components/projects-old.component.scss
git mv src/app/features/projects-old/components/projects.component.spec.ts src/app/features/projects-old/components/projects-old.component.spec.ts
git mv src/app/features/projects-old/components/project/project.component.ts src/app/features/projects-old/components/project/project-old.component.ts
git mv src/app/features/projects-old/components/project/project.component.html src/app/features/projects-old/components/project/project-old.component.html
git mv src/app/features/projects-old/components/project/project.component.scss src/app/features/projects-old/components/project/project-old.component.scss
git mv src/app/features/projects-old/components/project/project.component.spec.ts src/app/features/projects-old/components/project/project-old.component.spec.ts
git mv src/app/features/projects-old/constants/projects.constants.ts src/app/features/projects-old/constants/projects-old.constants.ts
```

- [ ] **Step 2: Renombrar clases y selectores**

`src/app/features/projects-old/components/projects-old.component.ts`:

```ts
import { Component, signal, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PROJECTS } from '../constants/projects-old.constants';
import { Project } from '../interfaces/project.interface';
import { ProjectOldComponent } from './project/project-old.component';
import { ParallaxHeaderDirective } from '../../../shared/directives/parallax-header.directive';

@Component({
  standalone: true,
  selector: 'app-projects-old',
  imports: [ProjectOldComponent, TranslateModule, ParallaxHeaderDirective],
  templateUrl: './projects-old.component.html',
  styleUrl: './projects-old.component.scss'
})
export class ProjectsOldComponent {
  private _projects = signal<Project[]>(
    PROJECTS.sort((a, b) => b.year - a.year)
  );
  private _expandedIndex = signal<number | null>(null);

  projects = this._projects.asReadonly();
  expandedIndex = this._expandedIndex.asReadonly();

  hasExpandedProject = computed(() => this._expandedIndex() !== null);

  onExpandRequest(index: number): void {
    this._expandedIndex.set(this._expandedIndex() === index ? null : index);
  }
}
```

`src/app/features/projects-old/components/projects-old.component.html` — cambiar `<app-project` por `<app-project-old` (línea 13).

`src/app/features/projects-old/components/project/project-old.component.ts` — conservar el código actual de `project.component.ts` cambiando solo: selector `app-project` → `app-project-old`, clase `ProjectComponent` → `ProjectOldComponent`, `templateUrl`/`styleUrl` a `./project-old.component.*`, y el import de `PROJECT_PALETTES` se mantiene (`../../constants/project-palettes`, el fichero no cambia de nombre). El resto (inputs, outputs, computed, métodos, ngOnInit) queda byte a byte igual.

- [ ] **Step 3: Actualizar specs renombrados**

En `projects-old.component.spec.ts` y `project-old.component.spec.ts`: reemplazar todas las referencias `ProjectsComponent`→`ProjectsOldComponent`, `ProjectComponent`→`ProjectOldComponent`, `app-project`→`app-project-old`, `app-projects`→`app-projects-old` y las rutas de import para que apunten a los ficheros renombrados.

- [ ] **Step 4: Actualizar sections-wrapper**

`sections-wrapper.component.ts` (líneas 15, 26):

```ts
import { ProjectsOldComponent } from '../../../features/projects-old/components/projects-old.component';
// …en imports del @Component:
    ProjectsOldComponent,
```

`sections-wrapper.component.html` (línea 6): `<app-projects-old></app-projects-old>`

`sections-wrapper.component.spec.ts` (líneas 10, 46):

```ts
import { ProjectsOldComponent } from '../../../features/projects-old/components/projects-old.component';
// …en overrideComponent imports:
            ProjectsOldComponent,
```

- [ ] **Step 5: Verificar que no quedan referencias activas**

```bash
grep -rn "features/projects/" src/app --include="*.ts" --include="*.html" | grep -v projects-old
```
Expected: sin resultados.

- [ ] **Step 6: Verificar build**

```bash
npx ng build --configuration development 2>&1 | tail -5
```
Expected: `Application bundle generation complete` sin errores.

- [ ] **Punto de commit (referencia, NO ejecutar):**

```bash
git add -A && git commit -m "refactor: renombra feature projects a projects-old (obsoleto)"
```

---

### Task 2: Feature `success-cases` — datos y paletas

**Files:**
- Create: `src/app/features/success-cases/interfaces/success-case.interface.ts`
- Create: `src/app/features/success-cases/constants/success-cases.constants.ts`
- Create: `src/app/features/success-cases/constants/success-case-palettes.ts`
- Modify: `scripts/generate-palettes.mjs:15-16`

- [ ] **Step 1: Interfaz**

`src/app/features/success-cases/interfaces/success-case.interface.ts`:

```ts
export interface SuccessCase {
  coverImgSrc: string;
  name: string;
  description: string;
  url?: string;
  year: number;
  altKey: string;
  technologies: string[];
}
```

- [ ] **Step 2: Constantes (orden año descendente, como hacía el componente viejo)**

`src/app/features/success-cases/constants/success-cases.constants.ts`:

```ts
import { SuccessCase } from '../interfaces/success-case.interface';

export const SUCCESS_CASES: SuccessCase[] = [
  {
    year: 2026,
    coverImgSrc: 'assets/images/projects/portalconvocatorias',
    name: 'Portal Convocatorias',
    description: 'PROJECTS.DESCRIPTION_PORTAL_CONVOCATORIAS',
    url: 'https://portalconvocatorias.es/',
    altKey: 'PROJECTS.PROJECT_PORTAL_CONVOCATORIAS_ALT',
    technologies: ['Angular', 'Notion', 'N8N', 'OpenAI API', 'Hugo']
  },
  {
    year: 2025,
    coverImgSrc: 'assets/images/projects/arcelor',
    name: 'Hermes - Artemis',
    description: 'PROJECTS.DESCRIPTION_HERMES',
    altKey: 'PROJECTS.PROJECT_ARCELOR_ALT',
    technologies: ['Angular', 'TypeScript', 'RabbitMQ', 'SCSS']
  },
  {
    year: 2024,
    coverImgSrc: 'assets/images/projects/laligabares',
    name: 'LALIGA Bares',
    description: 'PROJECTS.DESCRIPTION_LALIGA',
    altKey: 'PROJECTS.PROJECT_LALIGA_ALT',
    technologies: ['Angular', 'TypeScript', 'CRM']
  },
  {
    year: 2023,
    coverImgSrc: 'assets/images/projects/babe',
    name: 'Babé y CIA',
    description: 'PROJECTS.DESCRIPTION_BABE',
    altKey: 'PROJECTS.PROJECT_BABE_ALT',
    technologies: ['Angular', 'Django', 'HERE API']
  },
  {
    year: 2023,
    coverImgSrc: 'assets/images/projects/datalaia',
    name: 'Datalaia',
    description: 'PROJECTS.DESCRIPTION_DATALAIA',
    altKey: 'PROJECTS.PROJECT_DATALAIA_ALT',
    technologies: ['Angular', 'Django', 'RxJS']
  },
  {
    year: 2022,
    coverImgSrc: 'assets/images/projects/discamino',
    name: 'Discamino',
    description: 'PROJECTS.DESCRIPTION_DISCAMINO',
    altKey: 'PROJECTS.PROJECT_DISCAMINO_ALT',
    technologies: ['Angular', 'TypeScript']
  }
];
```

- [ ] **Step 3: Redirigir el generador de paletas al feature nuevo**

`scripts/generate-palettes.mjs` (líneas 15-16) — sustituir:

```js
const CONSTANTS_PATH = 'src/app/features/success-cases/constants/success-cases.constants.ts';
const OUTPUT_PATH = 'src/app/features/success-cases/constants/success-case-palettes.ts';
```

Y en la plantilla de salida (líneas 90-96) cambiar el nombre del export:

```js
  const output = `// AUTO-GENERADO por scripts/generate-palettes.mjs — no editar a mano.
// Regenerar con: node scripts/generate-palettes.mjs

export const SUCCESS_CASE_PALETTES: Record<string, [string, string]> = {
${entries.join(',\n')}
};
`;
```

- [ ] **Step 4: Regenerar paletas y verificar**

```bash
node scripts/generate-palettes.mjs
node scripts/run-specs.mjs
```
Expected: imprime las 6 paletas y `Escrito: src/app/features/success-cases/constants/success-case-palettes.ts`; specs de scripts OK. (El exportSUCCESS_CASE_PALETTES debe contener las 6 claves con los mismos valores que el antiguo `PROJECT_PALETTES`.)

- [ ] **Step 5: Compilar el feature aislado aún no es posible (sin componentes) — el build se verifica en Task 4+.**

- [ ] **Punto de commit (referencia, NO ejecutar):**

```bash
git add -A && git commit -m "feat(success-cases): datos, interfaz y paletas del feature"
```

---

### Task 3: Claves i18n (es-ES y en-US)

**Files:**
- Modify: `src/assets/i18n/es-ES.json`, `src/assets/i18n/en-US.json`

- [ ] **Step 1: es-ES.json — añadir bloque tras `PROJECTS` (después de la línea 124)**

```json
  "SUCCESS_CASES": {
    "TITLE": "Casos de éxito",
    "DETAIL_YEAR": "Año",
    "DETAIL_TECH": "Tecnologías",
    "CLOSE": "Cerrar detalle",
    "OPEN_DETAIL": "Más información de {{name}}"
  },
```

Y en `ROUTE` (líneas 166-174) añadir: `"SUCCESS_CASES": "Casos de éxito",` antes de `"NOT_FOUND"`.

- [ ] **Step 2: en-US.json — mismo bloque tras `PROJECTS` (después de la línea 124)**

```json
  "SUCCESS_CASES": {
    "TITLE": "Success cases",
    "DETAIL_YEAR": "Year",
    "DETAIL_TECH": "Technologies",
    "CLOSE": "Close details",
    "OPEN_DETAIL": "More info about {{name}}"
  },
```

Y en `ROUTE`: `"SUCCESS_CASES": "Success cases",` antes de `"NOT_FOUND"`.

- [ ] **Step 3: Validar JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/assets/i18n/es-ES.json','utf8')); JSON.parse(require('fs').readFileSync('src/assets/i18n/en-US.json','utf8')); console.log('OK')"
```
Expected: `OK`.

- [ ] **Punto de commit (referencia, NO ejecutar):**

```bash
git add -A && git commit -m "feat(i18n): claves de la sección casos de éxito"
```

---

### Task 4: `TechPillComponent`

**Files:**
- Test: `src/app/features/success-cases/components/tech-pill/tech-pill.component.spec.ts`
- Create: `src/app/features/success-cases/components/tech-pill/tech-pill.component.ts`
- Create: `src/app/features/success-cases/components/tech-pill/tech-pill.component.scss`

- [ ] **Step 1: Test que falla**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TechPillComponent } from './tech-pill.component';

describe('TechPillComponent', () => {
  let fixture: ComponentFixture<TechPillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechPillComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TechPillComponent);
    fixture.componentRef.setInput('label', 'Angular');
  });

  it('should create', () => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the label inside the host li', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.tagName.toLowerCase()).toBe('li');
    expect(el.textContent?.trim()).toBe('Angular');
  });
});
```

- [ ] **Step 2: Ejecutar (falla — no existe el componente)**

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/features/success-cases/components/tech-pill/tech-pill.component.spec.ts' 2>&1 | tail -5
```
Expected: FAIL (component not found / compilation error).

- [ ] **Step 3: Implementación**

`tech-pill.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'li[app-tech-pill]',
  standalone: true,
  styleUrl: './tech-pill.component.scss',
  template: `{{ label() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechPillComponent {
  label = input.required<string>();
}
```

`tech-pill.component.scss`:

```scss
@use "src/styles/_palette" as palette;
@use "src/styles/_fonts" as fonts;

:host {
  display: inline-flex;
  padding: 0.25rem 0.625rem;
  background: palette.$azure-border;
  color: palette.$accent-azure;
  font-family: fonts.$mono;
  font-size: 0.6875rem;
  font-weight: 400;
  line-height: 1.5;
  border-radius: 9999px;
  white-space: nowrap;
}
```

- [ ] **Step 4: Ejecutar (pasa)**

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/features/success-cases/components/tech-pill/tech-pill.component.spec.ts' 2>&1 | tail -5
```
Expected: 2 specs PASS.

- [ ] **Punto de commit (referencia, NO ejecutar):**

```bash
git add -A && git commit -m "feat(success-cases): componente tech-pill"
```

---

### Task 5: `SuccessCaseComponent` (tarjeta)

**Files:**
- Test: `src/app/features/success-cases/components/success-case/success-case.component.spec.ts`
- Create: `src/app/features/success-cases/components/success-case/success-case.component.{ts,html,scss}`

- [ ] **Step 1: Test que falla**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { SuccessCaseComponent } from './success-case.component';
import { SuccessCase } from '../../interfaces/success-case.interface';

const mockLoader = {
  getTranslation: () =>
    of({
      PROJECTS: {
        DESCRIPTION_BABE: 'Descripción de prueba con <span lang="en">Angular</span>.',
        PROJECT_BABE_ALT: 'Alt de prueba',
        VIEW_PROJECT: 'Ver proyecto {{name}}'
      },
      SUCCESS_CASES: {
        DETAIL_TECH: 'Tecnologías',
        OPEN_DETAIL: 'Más información de {{name}}'
      }
    })
};

const TEST_CASE: SuccessCase = {
  year: 2023,
  coverImgSrc: 'assets/images/projects/babe',
  name: 'Babé y CIA',
  description: 'PROJECTS.DESCRIPTION_BABE',
  altKey: 'PROJECTS.PROJECT_BABE_ALT',
  technologies: ['Angular', 'Django']
};

describe('SuccessCaseComponent', () => {
  let fixture: ComponentFixture<SuccessCaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessCaseComponent, TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es-ES');
    await firstValueFrom(translate.use('es-ES'));

    fixture = TestBed.createComponent(SuccessCaseComponent);
    fixture.componentRef.setInput('successCase', TEST_CASE);
    fixture.componentRef.setInput('index', 0);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render name, translated description and pills', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.case-title')?.textContent?.trim()).toBe('Babé y CIA');
    expect(el.querySelector('.case-description')?.textContent).toContain('Descripción de prueba');
    const pills = el.querySelectorAll('li[app-tech-pill]');
    expect(pills.length).toBe(2);
  });

  it('should render the cover image with translated alt', () => {
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.case-cover img');
    expect(img?.getAttribute('src')).toBe('assets/images/projects/babe.avif');
    expect(img?.getAttribute('alt')).toBe('Alt de prueba');
  });

  it('should emit openRequest with the index when the info button is clicked', () => {
    fixture.detectChanges();
    const emitted: number[] = [];
    fixture.componentInstance.openRequest.subscribe((i) => emitted.push(i));
    const btn = fixture.debugElement.query(By.css('.info-btn'));
    btn.nativeElement.click();
    expect(emitted).toEqual([0]);
  });
});
```

- [ ] **Step 2: Ejecutar (falla)**

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/features/success-cases/components/success-case/success-case.component.spec.ts' 2>&1 | tail -5
```
Expected: FAIL (component not found).

- [ ] **Step 3: Implementación**

`success-case.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TechPillComponent } from '../tech-pill/tech-pill.component';
import { SUCCESS_CASE_PALETTES } from '../../constants/success-case-palettes';
import { SuccessCase } from '../../interfaces/success-case.interface';

@Component({
  selector: 'app-success-case',
  standalone: true,
  imports: [TechPillComponent, TranslateModule],
  templateUrl: './success-case.component.html',
  styleUrl: './success-case.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessCaseComponent {
  successCase = input.required<SuccessCase>();
  index = input.required<number>();

  openRequest = output<number>();

  gradient = computed(() => {
    const palette = SUCCESS_CASE_PALETTES[this.successCase().coverImgSrc];
    if (!palette || palette.length <= 1) {
      return 'linear-gradient(135deg, #0f3254, #115f51)';
    }
    return `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`;
  });
}
```

Nota: el fallback del gradiente usa los mismos hex que `palette.$background-gradient-start/end` porque los valores de paleta son dinámicos (string), no tokens SCSS. Es el mismo patrón del componente antiguo (`--dynamic-gradient`).

`success-case.component.html`:

```html
<article class="success-case" [style.--dynamic-gradient]="gradient()">
  <div class="case-cover">
    <img
      [src]="successCase().coverImgSrc + '.avif'"
      [alt]="successCase().altKey | translate"
      loading="lazy"
    />
  </div>

  <div class="case-body">
    <h3 class="case-title">{{ successCase().name }}</h3>

    <p class="case-description" [innerHTML]="successCase().description | translate"></p>

    <ul class="case-techs" [attr.aria-label]="'SUCCESS_CASES.DETAIL_TECH' | translate">
      @for (tech of successCase().technologies; track tech) {
        <li app-tech-pill [label]="tech"></li>
      }
    </ul>
  </div>

  <div class="case-footer">
    <button
      class="info-btn"
      type="button"
      (click)="openRequest.emit(index())"
      [attr.aria-haspopup]="'dialog'"
      [attr.aria-label]="'SUCCESS_CASES.OPEN_DETAIL' | translate: { name: successCase().name }"
    >
      + info
    </button>
  </div>
</article>
```

`success-case.component.scss`:

```scss
@use "src/styles/_palette" as palette;
@use "src/styles/_fonts" as fonts;

.success-case {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  width: 100%;
  max-width: 26rem;
  margin: auto;
  padding: 1.5rem;
  background: rgba(palette.$azure-deep, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 1rem;
  // Neutro translúcido sobre foto/gradiente — excepción documentada en AGENTS.md
  outline: 1px solid rgba(255, 255, 255, 0.05);
  outline-offset: -1px;
  box-shadow: 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.case-cover {
  height: 9rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  overflow: hidden;
  // Neutro translúcido — excepción documentada en AGENTS.md
  outline: 1px solid rgba(255, 255, 255, 0.1);
  outline-offset: -1px;
  box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  background: var(
    --dynamic-gradient,
    linear-gradient(
      135deg,
      palette.$background-gradient-start 0%,
      palette.$background-gradient-end 100%
    )
  );

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) inset;
  }
}

.case-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.875rem;
}

.case-title {
  margin: 0;
  color: palette.$text-primary;
  font-family: fonts.$heading;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.75rem;
}

.case-description {
  margin: 0;
  color: palette.$text-secondary;
  font-family: fonts.$body;
  font-size: 0.875rem;
  line-height: 1.6;
}

.case-techs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.case-footer {
  margin-top: auto;
  padding-top: 1rem;
  display: flex;
  justify-content: center;
  // Neutro translúcido — excepción documentada en AGENTS.md
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.info-btn {
  padding: 0.5rem 1.5rem;
  background: linear-gradient(
    160deg,
    palette.$brown-btn-start 0%,
    palette.$brown-btn-mid 50%,
    palette.$brown-btn-end 100%
  );
  box-shadow:
    0 1px 1px 1px rgba(255, 255, 255, 0.08) inset,
    0 4px 14px rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 9999px;
  outline: 1px solid palette.$amber-outline;
  outline-offset: -1px;
  color: palette.$amber-glow;
  font-family: fonts.$mono;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  cursor: pointer;
  transition: filter 0.2s ease;

  &:hover,
  &:focus-visible {
    filter: brightness(1.12);
  }

  &:focus-visible {
    outline: 2px solid palette.$focus-blue;
    outline-offset: 2px;
  }
}
```

- [ ] **Step 4: Ejecutar (pasa)**

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/features/success-cases/components/success-case/success-case.component.spec.ts' 2>&1 | tail -5
```
Expected: 4 specs PASS.

- [ ] **Punto de commit (referencia, NO ejecutar):**

```bash
git add -A && git commit -m "feat(success-cases): tarjeta success-case"
```

---

### Task 6: `SuccessCaseDetailComponent` (modal accesible)

**Files:**
- Test: `src/app/features/success-cases/components/success-case-detail/success-case-detail.component.spec.ts`
- Create: `src/app/features/success-cases/components/success-case-detail/success-case-detail.component.{ts,html,scss}`

- [ ] **Step 1: Test que falla**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { SuccessCaseDetailComponent } from './success-case-detail.component';
import { SuccessCase } from '../../interfaces/success-case.interface';

const mockLoader = {
  getTranslation: () =>
    of({
      PROJECTS: {
        DESCRIPTION_BABE: 'Descripción de prueba.',
        PROJECT_BABE_ALT: 'Alt de prueba'
      },
      SUCCESS_CASES: {
        DETAIL_YEAR: 'Año',
        DETAIL_TECH: 'Tecnologías',
        CLOSE: 'Cerrar detalle'
      }
    })
};

const TEST_CASE: SuccessCase = {
  year: 2023,
  coverImgSrc: 'assets/images/projects/babe',
  name: 'Babé y CIA',
  description: 'PROJECTS.DESCRIPTION_BABE',
  altKey: 'PROJECTS.PROJECT_BABE_ALT',
  technologies: ['Angular', 'Django']
};

describe('SuccessCaseDetailComponent', () => {
  let fixture: ComponentFixture<SuccessCaseDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessCaseDetailComponent, TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es-ES');
    await firstValueFrom(translate.use('es-ES'));

    fixture = TestBed.createComponent(SuccessCaseDetailComponent);
    fixture.componentRef.setInput('successCase', TEST_CASE);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create and render a dialog', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('should render year, technologies and translated description', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.detail-year')?.textContent).toContain('2023');
    expect(el.querySelectorAll('li[app-tech-pill]').length).toBe(2);
    expect(el.querySelector('.detail-description')?.textContent).toContain('Descripción de prueba');
  });

  it('should emit closed on Escape keydown', () => {
    fixture.detectChanges();
    const closed: boolean[] = [];
    fixture.componentInstance.closed.subscribe(() => closed.push(true));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(closed).toEqual([true]);
  });

  it('should lock and restore body scroll', () => {
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');
    fixture.destroy();
    expect(document.body.style.overflow).toBe('');
  });
});
```

- [ ] **Step 2: Ejecutar (falla)**

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/features/success-cases/components/success-case-detail/success-case-detail.component.spec.ts' 2>&1 | tail -5
```
Expected: FAIL.

- [ ] **Step 3: Implementación**

`success-case-detail.component.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  input,
  output,
  viewChild
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TechPillComponent } from '../tech-pill/tech-pill.component';
import { SUCCESS_CASE_PALETTES } from '../../constants/success-case-palettes';
import { SuccessCase } from '../../interfaces/success-case.interface';

@Component({
  selector: 'app-success-case-detail',
  standalone: true,
  imports: [TechPillComponent, TranslateModule],
  templateUrl: './success-case-detail.component.html',
  styleUrl: './success-case-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()'
  }
})
export class SuccessCaseDetailComponent implements OnInit, OnDestroy {
  successCase = input.required<SuccessCase>();

  closed = output<void>();

  private _panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  gradient = computed(() => {
    const palette = SUCCESS_CASE_PALETTES[this.successCase().coverImgSrc];
    if (!palette || palette.length <= 1) {
      return 'linear-gradient(135deg, #0f3254, #115f51)';
    }
    return `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`;
  });

  constructor() {
    effect(() => {
      this._panel()?.nativeElement.focus();
    });
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  onEscape(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closed.emit();
  }
}
```

`success-case-detail.component.html`:

```html
<div class="detail-overlay" (click)="onBackdropClick($event)">
  <div
    #panel
    class="detail-panel"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    [attr.aria-labelledby]="'case-detail-title'"
    [style.--dynamic-gradient]="gradient()"
  >
    <button
      class="detail-close"
      type="button"
      (click)="closed.emit()"
      [attr.aria-label]="'SUCCESS_CASES.CLOSE' | translate"
    >
      ✕
    </button>

    <div class="detail-cover">
      <img
        [src]="successCase().coverImgSrc + '.avif'"
        [alt]="successCase().altKey | translate"
      />
    </div>

    <h3 class="detail-title" id="case-detail-title">{{ successCase().name }}</h3>

    <p class="detail-year">
      <span class="detail-label">{{ 'SUCCESS_CASES.DETAIL_YEAR' | translate }}:</span>
      {{ successCase().year }}
    </p>

    <p class="detail-description" [innerHTML]="successCase().description | translate"></p>

    <ul class="detail-techs" [attr.aria-label]="'SUCCESS_CASES.DETAIL_TECH' | translate">
      @for (tech of successCase().technologies; track tech) {
        <li app-tech-pill [label]="tech"></li>
      }
    </ul>

    @if (successCase().url) {
      <a
        class="detail-link"
        [href]="successCase().url"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ 'PROJECTS.VIEW_PROJECT' | translate: { name: successCase().name } }}
      </a>
    }
  </div>
</div>
```

`success-case-detail.component.scss`:

```scss
@use "src/styles/_palette" as palette;
@use "src/styles/_fonts" as fonts;

.detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(palette.$azure-deep, 0.85);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.detail-panel {
  position: relative;
  width: min(32rem, 100%);
  max-height: 85vh;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(palette.$surface-brand, 0.95);
  border-radius: 1rem;
  // Neutro translúcido — excepción documentada en AGENTS.md
  outline: 1px solid rgba(255, 255, 255, 0.05);
  outline-offset: -1px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  &:focus-visible {
    outline: 2px solid palette.$focus-blue;
    outline-offset: 2px;
  }
}

.detail-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(palette.$azure-border, 0.45);
  color: palette.$text-primary;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover,
  &:focus-visible {
    background: rgba(palette.$azure-border, 0.7);
  }

  &:focus-visible {
    outline: 2px solid palette.$focus-blue;
    outline-offset: 2px;
  }
}

.detail-cover {
  width: 100%;
  height: 12rem;
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(
    --dynamic-gradient,
    linear-gradient(
      135deg,
      palette.$background-gradient-start 0%,
      palette.$background-gradient-end 100%
    )
  );

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.detail-title {
  margin: 0;
  color: palette.$text-primary;
  font-family: fonts.$heading;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 2rem;
}

.detail-year {
  margin: 0;
  color: palette.$text-secondary;
  font-family: fonts.$mono;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.detail-label {
  color: palette.$accent-azure;
}

.detail-description {
  margin: 0;
  color: palette.$text-secondary;
  font-family: fonts.$body;
  font-size: 0.9375rem;
  line-height: 1.7;
}

.detail-techs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.detail-link {
  color: palette.$accent-blue;
  font-family: fonts.$mono;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: underline;

  &:focus-visible {
    outline: 2px solid palette.$focus-blue;
    outline-offset: 2px;
  }
}
```

- [ ] **Step 4: Ejecutar (pasa)**

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/features/success-cases/components/success-case-detail/success-case-detail.component.spec.ts' 2>&1 | tail -5
```
Expected: 4 specs PASS.

- [ ] **Punto de commit (referencia, NO ejecutar):**

```bash
git add -A && git commit -m "feat(success-cases): modal de detalle accesible"
```

---

### Task 7: `SuccessCasesComponent` (sección) + ruta

**Files:**
- Test: `src/app/features/success-cases/components/success-cases/success-cases.component.spec.ts`
- Create: `src/app/features/success-cases/components/success-cases/success-cases.component.{ts,html,scss}`
- Modify: `src/app/app.routes.ts`

- [ ] **Step 1: Test que falla**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { SuccessCasesComponent } from './success-cases.component';

const mockLoader = {
  getTranslation: () =>
    of({
      SUCCESS_CASES: { TITLE: 'Casos de éxito', DETAIL_TECH: 'Tecnologías', OPEN_DETAIL: 'Más información de {{name}}', CLOSE: 'Cerrar detalle', DETAIL_YEAR: 'Año' },
      PROJECTS: {
        DESCRIPTION_BABE: 'd1', DESCRIPTION_DATALAIA: 'd2', DESCRIPTION_DISCAMINO: 'd3',
        DESCRIPTION_HERMES: 'd4', DESCRIPTION_LALIGA: 'd5', DESCRIPTION_PORTAL_CONVOCATORIAS: 'd6',
        PROJECT_BABE_ALT: 'a1', PROJECT_DATALAIA_ALT: 'a2', PROJECT_DISCAMINO_ALT: 'a3',
        PROJECT_ARCELOR_ALT: 'a4', PROJECT_LALIGA_ALT: 'a5', PROJECT_PORTAL_CONVOCATORIAS_ALT: 'a6',
        VIEW_PROJECT: 'Ver proyecto {{name}}'
      }
    })
};

describe('SuccessCasesComponent', () => {
  let fixture: ComponentFixture<SuccessCasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessCasesComponent, TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: mockLoader } })],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es-ES');
    await firstValueFrom(translate.use('es-ES'));

    fixture = TestBed.createComponent(SuccessCasesComponent);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render 6 cards', () => {
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('app-success-case');
    expect(cards.length).toBe(6);
  });

  it('should open the detail modal when a card requests it', () => {
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('app-success-case .info-btn'));
    btn.nativeElement.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-success-case-detail')).toBeTruthy();
  });

  it('should close the modal when the detail emits closed', () => {
    fixture.detectChanges();
    fixture.debugElement.query(By.css('app-success-case .info-btn')).nativeElement.click();
    fixture.detectChanges();
    const detail = fixture.debugElement.query(By.css('app-success-case-detail'));
    detail.componentInstance.closed.emit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-success-case-detail')).toBeFalsy();
  });
});
```

- [ ] **Step 2: Ejecutar (falla)**

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/features/success-cases/components/success-cases/success-cases.component.spec.ts' 2>&1 | tail -5
```
Expected: FAIL.

- [ ] **Step 3: Implementación**

`success-cases.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SuccessCaseComponent } from '../success-case/success-case.component';
import { SuccessCaseDetailComponent } from '../success-case-detail/success-case-detail.component';
import { ParallaxHeaderDirective } from '../../../shared/directives/parallax-header.directive';
import { SUCCESS_CASES } from '../../constants/success-cases.constants';
import { SuccessCase } from '../../interfaces/success-case.interface';

@Component({
  selector: 'app-success-cases',
  standalone: true,
  imports: [SuccessCaseComponent, SuccessCaseDetailComponent, TranslateModule, ParallaxHeaderDirective],
  templateUrl: './success-cases.component.html',
  styleUrl: './success-cases.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessCasesComponent {
  private _cases = signal<SuccessCase[]>(SUCCESS_CASES);
  private _openIndex = signal<number | null>(null);

  cases = this._cases.asReadonly();
  openCase = computed(() => {
    const index = this._openIndex();
    return index === null ? null : this._cases()[index];
  });

  onOpenRequest(index: number): void {
    this._openIndex.set(index);
  }

  onClose(): void {
    this._openIndex.set(null);
  }
}
```

`success-cases.component.html`:

```html
<section class="success-cases" aria-labelledby="success-cases-title">
  <header
    class="section-header"
    appParallaxHeader
    [parallaxContent]="contentRef"
    #headerRef
  >
    <h2 id="success-cases-title">{{ "SUCCESS_CASES.TITLE" | translate }}</h2>
  </header>

  <div class="section-container" #contentRef>
    @for (successCase of cases(); track successCase.name; let i = $index) {
      <app-success-case
        class="case-card"
        [successCase]="successCase"
        [index]="i"
        (openRequest)="onOpenRequest(i)"
      ></app-success-case>
    }
  </div>

  @if (openCase(); as openCaseData) {
    <app-success-case-detail
      [successCase]="openCaseData"
      (closed)="onClose()"
    ></app-success-case-detail>
  }
</section>
```

`success-cases.component.scss`:

```scss
@use "src/styles/_palette" as palette;

.success-cases {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(
    ellipse 99% 113% at 70% 20%,
    palette.$background-gradient-end 0%,
    palette.$surface-brand 40%,
    palette.$azure-deep 90%
  );
  overflow: hidden;
}

.section-container {
  width: min(85rem, 100%);
  padding: 3rem 2rem 6rem;
  z-index: 1;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  justify-items: center;
  align-items: start;
}

.case-card {
  display: flex;
  justify-content: center;
  width: 100%;
}

//#region Responsive
@media screen and (max-width: 1300px) {
  .section-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 930px) {
  .section-container {
    grid-template-columns: repeat(1, 1fr);
  }
}
//#endregion
```

- [ ] **Step 4: Añadir la ruta en `src/app/app.routes.ts`** (entre `contacto` y `blog`):

```ts
  {
    path: 'casos-exito',
    loadComponent: () =>
      import(
        './features/success-cases/components/success-cases/success-cases.component'
      ).then((m) => m.SuccessCasesComponent),
    data: { animation: 'SuccessCases', titleKey: 'ROUTE.SUCCESS_CASES' }
  },
```

- [ ] **Step 5: Ejecutar (pasa) y verificar build**

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/features/success-cases/components/success-cases/success-cases.component.spec.ts' 2>&1 | tail -5
npx ng build --configuration development 2>&1 | tail -3
```
Expected: 4 specs PASS; build OK.

- [ ] **Punto de commit (referencia, NO ejecutar):**

```bash
git add -A && git commit -m "feat(success-cases): sección /casos-exito con grid y modal"
```

---

### Task 8: Header — brand como link al home + nav a `/casos-exito`

**Files:**
- Modify: `src/app/core/components/header/header.component.html`
- Modify: `src/app/core/components/header/header.component.scss`
- Modify: `src/app/core/components/header/header.component.spec.ts`

- [ ] **Step 1: Test que falla** — añadir dentro de `describe('semantic structure')` del spec existente:

```ts
    it('should render the brand as a link to home with an accessible name', () => {
      const brand = fixture.debugElement.query(By.css('a.brand'));
      expect(brand).toBeTruthy();
      expect(brand.nativeElement.getAttribute('href')).toBe('/');
      expect(brand.nativeElement.getAttribute('aria-label')).toBe('Ir al inicio');
    });
```

Y ampliar `mockLoader` (líneas 15-22) con:

```ts
      COMMON: { NAV_HOME: 'Ir al inicio' }
```

- [ ] **Step 2: Ejecutar (falla)**

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/core/components/header/header.component.spec.ts' 2>&1 | tail -8
```
Expected: FAIL en el test nuevo (`.brand` no es `<a>`).

- [ ] **Step 3: Implementación HTML**

`header.component.html` líneas 2-10 → sustituir el `<div class="brand">` por:

```html
  <a class="brand" routerLink="/" [attr.aria-label]="'COMMON.NAV_HOME' | translate">
    <div class="brand-logo" aria-hidden="true">
      <span class="brand-logo-inner">NC</span>
    </div>
    <div class="brand-text">
      <span class="brand-name">NOMACODA</span>
      <span class="brand-subtitle">{{ 'HEADER.BRAND_SUBTITLE' | translate }}</span>
    </div>
  </a>
```

Y el link 02 (líneas 24-29) → sustituir:

```html
        <a routerLink="/casos-exito" routerLinkActive="is-active">
```

(eliminar `[fragment]` y `[routerLinkActiveOptions]`).

- [ ] **Step 4: Implementación SCSS** — en `header.component.scss`, bloque `.brand` (líneas 21-27) → sustituir por:

```scss
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px;
  border-radius: 12px;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:hover .brand-logo {
    box-shadow:
      0 4px 6px -4px rgba(palette.$accent-cyan, 0.2),
      0 10px 15px -3px rgba(palette.$accent-cyan, 0.2),
      0 0 12px rgba(palette.$accent-yellow, 0.45);
  }

  &:focus-visible {
    outline: 2px solid palette.$focus-blue;
    outline-offset: 2px;
  }
}
```

- [ ] **Step 5: Ejecutar specs del header (pasan)**

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/core/components/header/header.component.spec.ts' 2>&1 | tail -5
```
Expected: todos PASS (los tests existentes no se ven afectados: `.brand-logo` sigue con `aria-hidden`, 4 links de nav siguen ahí).

- [ ] **Punto de commit (referencia, NO ejecutar):**

```bash
git add -A && git commit -m "feat(header): brand enlaza al home y nav apunta a /casos-exito"
```

---

### Task 9: Smoke script, lint, build completo y verificación final

**Files:**
- Modify: `scripts/a11y-smoke.mjs:8-15`

- [ ] **Step 1: Añadir la ruta al smoke de accesibilidad**

```js
const ROUTES = [
  '/',
  '/sobre-mi',
  '/casos-exito',
  '/opiniones',
  '/contacto',
  '/blog',
  '/esta-ruta-no-existe'
];
```

- [ ] **Step 2: Specs de scripts**

```bash
npm run test:scripts
```
Expected: todos los specs node OK (incluido generate-palettes.spec.mjs).

- [ ] **Step 3: Lint**

```bash
npm run lint 2>&1 | tail -10
```
Expected: sin errores. (Si aparece algún error de estilo en ficheros nuevos, corregirlo antes de continuar.)

- [ ] **Step 4: Suite de tests completa**

```bash
npx ng test --watch=false --browsers=ChromeHeadless 2>&1 | tail -10
```
Expected: todos PASS, incluidos los specs renombrados de `projects-old` y los nuevos del feature.

- [ ] **Step 5: Build de producción**

```bash
npm run build:prod 2>&1 | tail -5
```
Expected: build OK, `postbuild:prod` ejecuta compresión sin errores.

- [ ] **Step 6: Verificación manual con dev server**

```bash
npm run start
```
Comprobar en el navegador:
1. `http://localhost:4200/#/casos-exito` muestra título parallax + 6 tarjetas (logo avif, título, descripción, píldoras, botón "+ info").
2. "+ info" abre el modal (año, descripción, tecnologías, link en Portal Convocatorias); Escape y clic fuera lo cierran; el scroll del body se bloquea/restaura.
3. El logo "NC" del header navega al home con hover glow ámbar y lift 2px; foco por teclado visible.
4. "02. Casos de éxito" del nav activa `is-active` en `/casos-exito`.
5. Responsive: 3→2→1 columnas en 1300/930px.

- [ ] **Step 7 (opcional): smoke de accesibilidad sobre el dev server**

```bash
npm run a11y:smoke
```
Expected: `All routes clean. ✓` (7 rutas incluida la nueva).

- [ ] **Punto de commit final (referencia, NO ejecutar):**

```bash
git add -A && git commit -m "feat: sección casos de éxito con tarjetas, modal y navegación al home"
```
