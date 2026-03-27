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

- **Node.js** 22.x or higher
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

**Option A: Automatic setup (Recommended)**
```bash
# Linux/Mac
./setup-env.sh

# Windows
setup-env.bat
```

**Option B: Manual setup**
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
