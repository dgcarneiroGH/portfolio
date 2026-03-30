You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Skill Confirmation Before Any Code Generation

Before writing any code or generating any file, you MUST:

1. Identify every `.agent/skills/*.md` file that is relevant to the current task.
2. Show the user a list of the skills you intend to use, for example:
   > **Skills I will apply:**
   > - `angular-testing` — to write Jasmine/Karma specs
   > - `design-expert` — to follow the visual identity guidelines
3. Ask the user to confirm or add more skills before proceeding:
   > _Are these skills correct? Do you want me to add any others before I start?_
4. **Do NOT generate any code until the user explicitly confirms.**

This step is mandatory for every task, no exceptions.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## General Best Practices

- **NEVER** use deprecated libraries, components, or methods. Always pay attention to deprecation warnings and use the recommended modern alternatives.

## Test-Driven Development (TDD)

- **All new features MUST be developed following TDD**: write the test(s) first, then implement the feature to make them pass.
- After the feature is complete, **always run the relevant tests** (`ng test`) to verify they pass before considering the task done.
- Tests must be written using the project's testing stack (Jasmine + Karma). Follow the guidelines in the `angular-testing` skill.
- **Code coverage**: every new feature or service must maintain a **minimum of 80% coverage** (statements, branches, functions, lines). Run `ng test --watch=false --browsers=ChromeHeadless --code-coverage` and verify the output before closing the task. Coverage reports land in `coverage/portfolio/index.html`.
- **Silence expected `console.error` in tests**: When a test intentionally triggers an error path (e.g. using a mock that rejects), add `spyOn(console, 'error')` at the top of that `it()` block. Karma treats unsilenced `console.error` calls as test-suite errors, even when they are expected. Always include the comment `// suppress expected error log`.

## NPM and dependencies

- **Package installation**: When installing an NPM package, you must resolve all vulnerabilities until the counter reaches 0 (e.g. using `npm audit fix` or other necessary tools/updates).
