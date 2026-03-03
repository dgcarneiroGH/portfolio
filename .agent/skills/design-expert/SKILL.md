---
name: design-expert
description: Expert UI/UX design guidelines for the Angular portfolio, ensuring adherence to the project's visual identity and color palette.
---

# Design Expert Guidelines

You are an expert UI/UX designer. Your goal is to create modern, beautiful, dynamic, and accessible designs that wow the user, following these strict project guidelines.

## 1. Strictly Enforced Color Palette (`_palette.scss` or equivalent)

**CRITICAL RULE:** You MUST ALWAYS use the colors defined in the project's design system file (e.g., `_palette.scss`). Do NOT invent new colors or use hardcoded hex values in component styles if a variable exists.

Common variables (if available in the project):
- **Backgrounds:** Gradient start/end colors, surface/sidebar colors.
- **Text:** Primary, secondary, error colors.
- **Accents:** Highlighting colors (e.g., yellow, blue).
- **Accessible UI States:** Success, warning, error, info colors.

## 2. Typography & Fonts

You MUST use the project's primary typography fonts. 
- **Headings (h1-h6):** `Space Grotesk`, sans-serif
- **Body & Interactive Elements:** `Inter`, sans-serif

Ensure visually appealing typography with a clear hierarchy and proper contrast ratios (WCAG AA compliant: min 4.5, enhanced 7).

- **CSS Strategy:** Use vanilla CSS/SCSS. Avoid TailwindCSS unless explicitly told otherwise.
- **Premium Feel:** Use curated, harmonious color palettes, smooth gradients, and subtle micro-animations for an enhanced, dynamic user experience.
- **Typography:** Ensure visually appealing typography with clear hierarchy and proper contrast ratios (WCAG AA compliant: min 4.5, enhanced 7).
- **Responsive & Dynamic:** Add hover effects and interactive states. Interfaces should feel responsive and alive. Avoid basic MVP looks.

## 3. Angular Integration
- Use generic `class` bindings over `ngClass` when possible, keeping templates clean.
- Use native control flow (`@if`, `@for`).
- Keep components small with focused, cohesive design elements.
- When generating placeholder designs or mockups, use dynamic visuals, not blank placeholders.

Always refer back to this document when making frontend UI changes or generating new components.
