# Diseño — Tarjeta compacta + animación de apertura del modal (success-cases)

Fecha: 2026-10-13
Estado: aprobado por el usuario en conversación.

## Objetivo

La tarjeta cerrada de "Casos de éxito" muestra únicamente imagen, stack tecnológico y botón "+ info". El modal de detalle se abre con efecto (fade del overlay + escala del panel).

## Decisiones (con el usuario)

1. Título de la tarjeta: `sr-only` (global `styles.scss`), invisible visualmente, accesible.
2. Descripción: eliminada de la tarjeta (solo en modal).
3. Efecto apertura: fade overlay (250ms ease-out) + panel `scale(0.92) translateY(12px)` → identidad con fade (250ms ease-out). Cierre instantáneo. `prefers-reduced-motion: reduce` → sin animación.

## Cambios

- `success-case.component.html`: quitar `<p class="case-description">`; `case-title` con clase `sr-only`.
- `success-case.component.scss`: eliminar estilos `.case-description`.
- `success-case-detail.component.scss`: keyframes `fadeIn` (overlay) y `panelIn` (panel); media query reduced-motion.
- `success-case.component.spec.ts`: título con `sr-only`, sin descripción en tarjeta.

## Verificación

- Specs de success-case/detail/success-cases + suite completa Karma.
- `ng build` dev OK.
- Comprobación visual: tarjeta compacta y animación de apertura del modal.
