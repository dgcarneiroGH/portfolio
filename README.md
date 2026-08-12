# 🌟 Personal Portfolio

Professional web portfolio developed with Angular 21.2.4 and Netlify Functions, designed to showcase development projects, experience, and skills.

## 🚀 Features

- ✨ **Angular 21.2.4** with modern architecture
- 🌐 **Internationalization** (i18n) - Spanish/English
- 🔐 **Security**: Environment variables and CORS validation
- 📱 **Responsive Design** and accessibility
- 🎨 **Optimized CSS animations**
- 📧 **Contact form** with Netlify Functions + N8N
- 🚀 **Auto-deploy** on Netlify

## 📋 Requirements

- **Node.js** 20.x or higher (CI runs on Node 20; use `nvm use` with the included `.nvmrc`)
- **npm** 10.x or higher
- **Netlify CLI** (optional, for serverless functions)

## 🔧 Initial Setup

### 1. Clone and setup dependencies
```bash
git clone <your-repository>
cd portfolio
npm install
```

### 2. Environment variables

**Manual setup**
```bash
cp .env.example .env
# Edit .env with your real values
```

**Required variables:**
- `PORTFOLIO_TOKEN`: Security token for N8N webhook
- `N8N_CONTACT_WEBHOOK_URL`: Contact endpoint URL
- `N8N_REVIEWS_WEBHOOK_URL`: Reviews endpoint URL

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Angular development server (port 4200) |
| `npm run dev` | Server with Netlify Functions (port 8888) |
| `npm run build` | Development build |
| `npm run build:prod` | Optimized production build |
| `npm test` | Run unit tests |
| `npm run test:ci` | Tests for CI/CD |
| `npm run lint` | ESLint linter |

## 🏃‍♂️ Development

### Basic server (frontend only)
```bash
npm start
```
- **URL**: http://localhost:4200
- **Auto-reload**: ✅
- **Functions**: ❌

### Full server (with Netlify Functions)  
```bash
npm run dev
```
- **URL**: http://localhost:8888
- **Auto-reload**: ✅
- **Functions**: ✅ (contact form)
- **Requires**: Variables in `.env`

## 🏗️ Build and Deploy

### Local build
```bash
# Development
npm run build

# Production  
npm run build:prod
```
Files are generated in `dist/portfolio/`

### Deploy on Netlify
1. **Environment variables** in Netlify Dashboard:
   - Site Settings → Environment Variables
   - Add `PORTFOLIO_TOKEN` and `N8N_CONTACT_WEBHOOK_URL`

2. **Auto-deploy**:
   - Push to `main` → Automatic deploy
   - Branch previews → Preview deploys

## 🧪 Testing

```bash
# Interactive tests
npm test

# CI/CD tests
npm run test:ci

# Coverage report
# Generated in /coverage/
```

## 🔦 Lighthouse

> ⚠️ **Importante:** Lighthouse se ejecuta contra la **build de producción**,
> NO contra el dev server. Medir contra `npm start` (Vite dev server) infla el
> bundle 20-25× y los scores de performance no son representativos.
>
> El probe de `lh:baseline` detecta y rechaza automáticamente el dev server.

Para ejecutar una auditoría local:

1. En una terminal, compila y sirve la build de producción:
   ```bash
   npm run build:prod
   npm run serve:dist
   ```
2. En otra terminal, ejecuta:
   ```bash
   npm run lh:baseline
   npm run lh:check
   ```

## ♿ Accessibility

Target: **WCAG 2.2 Level AA**.

Reference docs:
- `docs/superpowers/specs/2026-08-04-a11y-audit-design.md` — full audit (32 hallazgos).
- `docs/superpowers/plans/2026-08-04-a11y-improvements.md` — phased implementation plan.

### Automated checks

- **Unit-level axe matchers** (via `jasmine-axe`) are wired in `src/test.ts`. Any spec
  can call `expect(await axe(fixture.nativeElement)).toHaveNoViolations();`.
- **Smoke test against the build** with `@axe-core/cli`:
  ```bash
  npm run a11y:smoke   # requires npm start in another terminal
  ```
  Generates JSON reports in `a11y-report/`.

> axe-core v4 in Angular zone-less tests has known environment incompatibilities
> (`Right-hand side of 'instanceof' is not callable`). The unit axe test falls back
> to `pending()` rather than failing the suite; the smoke script covers those gaps
> in real browser context.

### Manual checks

Run `npm start`, then verify with NVDA or VoiceOver:
1. Tab order matches visual order on each section.
2. Skip-link targets `#main-content`.
3. Forms announce errors via `aria-describedby`.
4. `prefers-reduced-motion: reduce` disables parallax/blast animations.
5. Page `<title>` updates per route (Portafolio / Blog / Artículo / Página no encontrada).

## 📁 Project Architecture

```
src/
├── app/
│   ├── core/           # Global services and components
│   │   ├── components/ # Header, sidebar, lang-selector
│   │   ├── services/   # Lang, Sanity
│   │   └── constants/  # Configurations
│   ├── features/       # Feature modules
│   │   ├── about/      # "About me" section
│   │   ├── contact/    # Contact form
│   │   ├── experience/ # Professional experience
│   │   ├── projects/   # Project portfolio
│   │   └── skills/     # Technical skills
│   └── shared/         # Reusable components
├── assets/             # Images, i18n, styles
└── environments/       # Environment configuration

netlify/
└── functions/          # Serverless functions
    └── contact.ts      # Secure contact API
```

## 🔐 Security

- ✅ **Environment variables** not versioned
- ✅ **CORS validation** in Functions
- ✅ **Token authentication** for APIs
- ✅ **Input validation** in forms
- ✅ **Rate limiting** configured on Cloudflare

## 🌐 Internationalization

- **Supported languages**: Spanish (es-ES), English (en-US)
- **Files**: `src/assets/i18n/*.json`
- **Dynamic switching**: Selector in header

## 📱 Technologies Used

**Frontend:**
- Angular 21.2.4, TypeScript, SCSS
- NgRx (signals), Rxjs
- Angular Material, Flag Icons

**Backend:**
- Netlify Functions (TypeScript)
- N8N (automation)
- Sanity CMS (content)

**DevOps:**
- Netlify (hosting + functions)
- GitHub Actions
- Husky (git hooks)

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Personal project - All rights reserved © 2026
