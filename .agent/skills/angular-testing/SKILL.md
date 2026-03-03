---
name: angular-testing
description: Expert guidelines for writing unit and integration tests in Angular 20 projects using Jasmine and Karma. Covers components with signals, services, directives, pipes, accessibility, and best practices aligned with this project's conventions.
---

# Angular Testing Expert — Jasmine + Karma

## Stack & Context

| Item | Value |
|------|-------|
| Angular version | **20.3.17** |
| Test runner | **Karma** (`ng test`) |
| Test framework | **Jasmine 5.x** |
| Coverage | `karma-coverage` (Istanbul) |
| Types | `@types/jasmine ~5.1.5` |

> This project uses **standalone components**, Angular **signals** (`input()`, `output()`, `signal()`, `computed()`, `effect()`), and `inject()` for DI. All tests must reflect these patterns.

---

## 1. Core Testing Principles

- **One responsibility per test**: each `it()` block verifies one behaviour.
- **Arrange / Act / Assert (AAA)**: structure every test in three clear phases.
- **Avoid `any`**: type every variable explicitly.
- **No `console.log` in tests**: use Jasmine matchers and spies instead.
- **Reset state in `afterEach`**: restore spies, clear timers, destroy fixtures.
- **Use `fakeAsync` + `tick()`** for timers, `async/await` for Promises, `firstValueFrom` for Observables.
- **Never skip test assertions**: every `it()` must have at least one `expect()`.
- **Describe hierarchy**: `describe('ClassName') > describe('methodName/scenario') > it('should...')`.

---

## 2. Running Tests

```bash
# Run all tests (headless recommended for CI)
ng test --watch=false --browsers=ChromeHeadless

# Run with coverage
ng test --watch=false --browsers=ChromeHeadless --code-coverage

# Watch mode during development
ng test
```

Coverage output lands in `coverage/portfolio/`. Open `index.html` to browse the report.

---

## 3. TestBed Setup Patterns

### 3.1 Standalone Component (standard — use this by default)

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],          // standalone: import directly
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### 3.2 Component with required `input()` signals

Use `TestBed.runInInjectionContext` or set inputs via `fixture.componentRef.setInput()`:

```typescript
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [SkillComponent],
  }).compileComponents();

  fixture = TestBed.createComponent(SkillComponent);
  component = fixture.componentInstance;

  // Set required inputs BEFORE detectChanges()
  fixture.componentRef.setInput('progress', 75);
  fixture.componentRef.setInput('text', 'Angular');
  fixture.componentRef.setInput('years', 3);
  fixture.componentRef.setInput('logoSrc', '/assets/angular.svg');
  fixture.componentRef.setInput('altKey', 'SKILLS.ANGULAR_ALT');

  fixture.detectChanges();
});
```

### 3.3 Component with mocked providers

```typescript
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';

// Minimal TranslateModule for unit tests
const translateModuleConfig = {
  loader: { provide: TranslateLoader, useValue: { getTranslation: () => of({}) } }
};

await TestBed.configureTestingModule({
  imports: [
    MyComponent,
    TranslateModule.forRoot(translateModuleConfig),
  ],
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
  ],
}).compileComponents();
```

### 3.4 Service (singleton, `providedIn: 'root'`)

```typescript
import { TestBed } from '@angular/core/testing';
import { LangService } from './lang.service';

describe('LangService', () => {
  let service: LangService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LangService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

---

## 4. Testing Angular Signals

### 4.1 Reading signal values

Signals are plain getter functions in Jasmine — call them like regular functions:

```typescript
it('should compute strokeDasharray from progress input', () => {
  fixture.componentRef.setInput('progress', 50);
  fixture.detectChanges();

  const value = component.strokeDasharray(); // computed signal
  expect(value).toContain(' ');              // "78.53... 78.53..."
  expect(typeof value).toBe('string');
});
```

### 4.2 Triggering `effect()` with `fakeAsync`

`effect()` runs asynchronously. Use `fakeAsync` + `tick()` to advance the scheduler:

```typescript
import { fakeAsync, tick } from '@angular/core/testing';

it('should update strokeDasharray after showProgressBar becomes true', fakeAsync(() => {
  fixture.componentRef.setInput('showProgressBar', false);
  fixture.detectChanges();

  fixture.componentRef.setInput('showProgressBar', true);
  fixture.detectChanges();
  tick(300); // advance the setTimeout inside the effect
  fixture.detectChanges();

  const value = component.currentStrokeDasharray();
  expect(value).not.toBe('0 200');
}));
```

### 4.3 Writable signals via `TestBed.runInInjectionContext`

```typescript
it('should reset state', () => {
  TestBed.runInInjectionContext(() => {
    // Access signals defined inside the injection context if needed
  });
});
```

---

## 5. Mocking Dependencies

### 5.1 Spy on injected service

```typescript
import { SanityService } from '../services/sanity.service';
import { of } from 'rxjs';

describe('ProjectsComponent', () => {
  let sanityServiceSpy: jasmine.SpyObj<SanityService>;

  beforeEach(async () => {
    sanityServiceSpy = jasmine.createSpyObj('SanityService', ['getProjects']);
    sanityServiceSpy.getProjects.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        { provide: SanityService, useValue: sanityServiceSpy },
      ],
    }).compileComponents();
  });

  it('should call getProjects on init', () => {
    expect(sanityServiceSpy.getProjects).toHaveBeenCalled();
  });
});
```

### 5.2 Spy on a method of the component itself

```typescript
it('should call toggleProgress on Enter key', () => {
  const spy = spyOn(component, 'toggleProgress');
  const event = new KeyboardEvent('keydown', { key: 'Enter' });

  component.onKeyDown(event);

  expect(spy).toHaveBeenCalled();
});
```

### 5.3 Spy on global / static methods

```typescript
it('should call setTimeout', fakeAsync(() => {
  spyOn(window, 'setTimeout').and.callThrough();
  fixture.componentRef.setInput('showProgressBar', true);
  fixture.detectChanges();

  expect(window.setTimeout).toHaveBeenCalled();
  tick(300);
}));
```

---

## 6. Testing DOM Interactions

### 6.1 Query helpers

```typescript
import { By } from '@angular/platform-browser';

// By CSS selector (returns DebugElement)
const btn = fixture.debugElement.query(By.css('[data-testid="submit-btn"]'));

// Native element
const nativeBtn = btn.nativeElement as HTMLButtonElement;
```

> **Convention**: add `data-testid` attributes to elements that need to be targeted in tests. Do NOT use class names or IDs that might change.

### 6.2 Triggering events

```typescript
it('should emit on button click', () => {
  const btn = fixture.debugElement.query(By.css('button'));
  btn.triggerEventHandler('click', null);
  fixture.detectChanges();

  // Assert side effects
});

it('should handle keyboard event', () => {
  const el = fixture.debugElement.query(By.css('[role="button"]'));
  el.triggerEventHandler('keydown', new KeyboardEvent('keydown', { key: ' ' }));
  fixture.detectChanges();
});
```

### 6.3 Checking rendered text

```typescript
it('should display skill name', () => {
  fixture.componentRef.setInput('text', 'Angular');
  fixture.detectChanges();

  const el = fixture.nativeElement.querySelector('[data-testid="skill-name"]');
  expect(el.textContent.trim()).toBe('Angular');
});
```

---

## 7. Testing `@output()` / `output()` Events

```typescript
import { outputToObservable } from '@angular/core/rxjs-interop';

it('should emit langChanged on selection', () => {
  let emittedValue: string | undefined;
  outputToObservable(component.langChanged).subscribe(v => emittedValue = v);

  component.selectLang('en');
  fixture.detectChanges();

  expect(emittedValue).toBe('en');
});
```

---

## 8. HTTP Testing (`HttpClient`)

```typescript
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('SanityService', () => {
  let service: SanityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SanityService,
      ],
    });
    service = TestBed.inject(SanityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensure no unexpected requests
  });

  it('should fetch projects', () => {
    const mockData = [{ id: '1', title: 'Portfolio' }];

    service.getProjects().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/projects');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
```

---

## 9. Async Testing Patterns

| Scenario | Pattern |
|----------|---------|
| `setTimeout` / `setInterval` | `fakeAsync` + `tick(ms)` |
| `Promise` | `async/await` or `fakeAsync` + `flushMicrotasks()` |
| `Observable` (single) | `firstValueFrom(obs$)` + `await` |
| `Observable` (stream) | `fakeAsync` + marble testing |
| `delay()` in RxJS | `fakeAsync` + `tick(ms)` |

```typescript
import { fakeAsync, tick, flush } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

// Observable to Promise
it('should resolve with data', async () => {
  const result = await firstValueFrom(service.getData());
  expect(result).toBeDefined();
});

// Timer-based
it('should complete animation after 300ms', fakeAsync(() => {
  component.startAnimation();
  tick(300);
  fixture.detectChanges();
  expect(component.isAnimating()).toBeFalse();
}));
```

---

## 10. Testing ngx-translate

Components using `TranslateService` or `TranslatePipe` need the module configured:

```typescript
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

const mockTranslations = {
  'COMMON.YEAR': 'year',
  'COMMON.YEARS': 'years',
};

const mockLoader = {
  getTranslation: () => of(mockTranslations),
};

await TestBed.configureTestingModule({
  imports: [
    MyComponent,
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useValue: mockLoader },
    }),
  ],
}).compileComponents();

// Then manually set the language before detectChanges
const translate = TestBed.inject(TranslateService);
translate.use('es-ES');
fixture.detectChanges();
```

---

## 11. Accessibility Testing in Specs

Accessibility checks belong in spec files, not just in manual guides. Use `aria-*` attributes and semantic roles as test anchors.

### 11.1 Check ARIA attributes

```typescript
it('should have aria-label on icon button', () => {
  const btn = fixture.nativeElement.querySelector('button[aria-label]') as HTMLButtonElement;
  expect(btn).toBeTruthy();
  expect(btn.getAttribute('aria-label')).toBeTruthy();
});

it('should set aria-expanded when menu is open', () => {
  component.openMenu();
  fixture.detectChanges();

  const trigger = fixture.nativeElement.querySelector('[aria-expanded]') as HTMLElement;
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
});
```

### 11.2 Check keyboard interaction

```typescript
it('should toggle on Space key', () => {
  const el = fixture.debugElement.query(By.css('[role="button"]'));
  el.triggerEventHandler('keydown', new KeyboardEvent('keydown', { key: ' ' }));
  fixture.detectChanges();
  expect(component.isOpen()).toBeTrue();
});

it('should close on Escape key', () => {
  component.open();
  const el = fixture.debugElement.query(By.css('[role="dialog"]'));
  el.triggerEventHandler('keydown', new KeyboardEvent('keydown', { key: 'Escape' }));
  fixture.detectChanges();
  expect(component.isOpen()).toBeFalse();
});
```

### 11.3 Check focus management

```typescript
it('should move focus to first menu item when opened', fakeAsync(() => {
  const trigger = fixture.nativeElement.querySelector('button');
  trigger.click();
  fixture.detectChanges();
  tick();

  const firstItem = fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLElement;
  expect(document.activeElement).toBe(firstItem);
}));
```

### 11.4 Check alt text on images

```typescript
it('should have non-empty alt on informative images', () => {
  const imgs = fixture.nativeElement.querySelectorAll('img:not([role="presentation"])') as NodeListOf<HTMLImageElement>;
  imgs.forEach(img => {
    expect(img.alt).toBeTruthy(`Image src="${img.src}" is missing alt text`);
  });
});

it('should have empty alt on decorative images', () => {
  const decorativeImgs = fixture.nativeElement.querySelectorAll('img[role="presentation"]') as NodeListOf<HTMLImageElement>;
  decorativeImgs.forEach(img => {
    expect(img.alt).toBe('');
  });
});
```

---

## 12. Testing Directives

```typescript
import { Component } from '@angular/core';
import { TimelineDirective } from './timeline.directive';
import { By } from '@angular/platform-browser';

@Component({
  template: `<div appTimeline></div>`,
  imports: [TimelineDirective],
})
class TestHostComponent {}

describe('TimelineDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should attach directive to element', () => {
    const el = fixture.debugElement.query(By.directive(TimelineDirective));
    expect(el).toBeTruthy();
  });
});
```

---

## 13. Testing Router Integration

```typescript
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

describe('AppComponent routing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: HomeComponent },
          { path: 'about', loadComponent: () => import('./about.component').then(m => m.AboutComponent) },
        ]),
      ],
    }).compileComponents();
  });

  it('should navigate to about page', async () => {
    const harness = await RouterTestingHarness.create('/about');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(AboutComponent);
  });
});
```

---

## 14. Coverage Targets

| Layer | Minimum target |
|-------|---------------|
| Services | 90% |
| Components (logic) | 80% |
| Directives | 80% |
| Pipes | 100% |
| Guards / Resolvers | 85% |

To check current coverage:

```bash
ng test --watch=false --browsers=ChromeHeadless --code-coverage
# Then open: coverage/portfolio/index.html
```

---

## 15. Jasmine Matchers Quick Reference

```typescript
// Equality
expect(value).toBe(expected);           // strict ===
expect(value).toEqual(expected);        // deep equality
expect(value).toBeUndefined();
expect(value).toBeNull();
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Numbers
expect(n).toBeGreaterThan(5);
expect(n).toBeLessThanOrEqual(10);
expect(n).toBeCloseTo(3.14, 2);

// Strings
expect(str).toContain('substring');
expect(str).toMatch(/regex/);

// Arrays / Objects
expect(arr).toContain(item);
expect(arr).toHaveSize(3);
expect(obj).toEqual(jasmine.objectContaining({ key: 'value' }));

// Spies
expect(spy).toHaveBeenCalled();
expect(spy).toHaveBeenCalledWith(arg1, arg2);
expect(spy).toHaveBeenCalledTimes(2);
expect(spy).not.toHaveBeenCalled();

// Errors
expect(() => riskyFn()).toThrowError('message');
expect(() => riskyFn()).toThrow();
```

---

## 16. Common Pitfalls & Solutions

| Problem | Solution |
|---------|----------|
| `No provider for X` | Add the provider or a spy to `TestBed.configureTestingModule` |
| Required `input()` not set | Use `fixture.componentRef.setInput()` before `detectChanges()` |
| Signal value stale after change | Call `fixture.detectChanges()` after mutating inputs/signals |
| `effect()` not running | Use `fakeAsync` + `tick()` or `flushMicrotasks()` |
| `RouterTestingModule` deprecated | Use `provideRouter([...])` + `RouterTestingHarness` instead |
| `RouterTestingModule` import | Avoid — use the new `provideRouter` API from `@angular/router` |
| `declarations: [X]` for standalone | Use `imports: [X]` — standalone components are never declared |
| `async` not resolving | Prefer `fakeAsync` + `tick`; use `async` only for real Promises |
| Translation keys not resolved | Set up `TranslateModule.forRoot(...)` with a mock loader |
| `detectChanges` throws error | Move `setInput` calls before first `detectChanges()` |

---

## 17. File Naming Conventions

- Spec files must be co-located with source files: `my.component.spec.ts`
- One spec file per source file
- Use the same `describe` name as the class: `describe('MyComponent', ...)`
- Nested describes use the method or scenario: `describe('#methodName', ...)`

---

## 18. Anti-Patterns to Avoid

- ❌ `standalone: true` inside `@Component` decorator (it's the default in Angular 17+, per GEMINI.md)
- ❌ `declarations` array for standalone components (use `imports`)
- ❌ `RouterTestingModule` (deprecated — use `provideRouter`)
- ❌ `ngClass` / `ngStyle` in templates (use `class` / `style` bindings)
- ❌ `@HostBinding` / `@HostListener` (use `host` object in decorator)
- ❌ Constructor injection (use `inject()`)
- ❌ Testing implementation details (test behaviour, not internal state)
- ❌ `any` type in test code
- ❌ `fdescribe` / `fit` committed to source control (blocks other tests)
- ❌ Shared mutable state across `it()` blocks without `beforeEach` reset
