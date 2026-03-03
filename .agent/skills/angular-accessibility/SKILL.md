---
name: angular-accessibility
description: Inclusive design and accessibility guidelines for the Angular portfolio. Combines keyboard navigation, semantic HTML, ARIA rules, and color contrast practices.
---

# 🔧 Guía de Accesibilidad (A11Y) - Angular Portfolio

Esta skill consolida las mejores prácticas de accesibilidad, tanto de navegación y semántica como de diseño visual y color. 

## Parte 1: Accesibilidad por Teclado y Semántica

### ✅ **Checklist de Testing Manual**

### **1. Navegación básica con Tab**
```
Tab           → Avanzar al siguiente elemento focusable
Shift + Tab   → Retroceder al elemento anterior
Enter         → Activar enlaces y botones
Space         → Activar botones, checkboxes
Escape        → Cerrar menús/modales
Arrows        → Navegar dentro de menús/listas
```

### **2. Elementos a verificar**

#### **✓ Botones y Enlaces:**
- Todos los botones son focusables con Tab
- Se activan con Enter y Espacio
- Tienen indicadores de focus visibles
- Los textos alternativos describen la función

#### **✓ Selector de Idiomas:**
- Se abre con Enter/Espacio
- Se navega con flechas arriba/abajo
- Se selecciona idioma con Enter
- Se cierra con Escape
- Focus vuelve al botón principal

#### **✓ Imágenes:**
- Funcionales: tienen alt descriptivo de la función
- Informativas: describen el contenido relevante
- Decorativas: alt="" o role="presentation" (no se leen)

### **3. Orden de tabulación**
Debe seguir un orden lógico:
1. Skip links (si están disponibles)
2. Selector de idiomas
3. Contenido principal por secciones
4. Botón de blog
5. Footer

### **4. Testing con lectores de pantalla**

#### **NVDA (Windows):**
```bash
# Comandos útiles NVDA:
Insert + Space    → Modo navegación/foco
Insert + T        → Leer título
Insert + Down     → Leer todo
Tab               → Elemento siguiente
```

---

## Parte 2: Accesibilidad de Colores e Interfaz visual

### 🔍 **Análisis de la paleta actual**

### **Colores principales (WCAG AA compliant):**

| Color | Hex | Uso | Contraste |
|-------|-----|-----|-----------|
| Texto primario | `#f0f4f8` | Texto sobre fondo oscuro | ✅ 15.8:1 |
| Texto secundario | `#a0bbd8` | Texto secundario | ✅ 7.2:1 |
| Accent azul | `#29b6f6` | Enlaces, botones | ✅ 5.1:1 |
| Accent amarillo | `#ffa726` | Destacados | ✅ 4.6:1 |

### 🛠 **Implementaciones de accesibilidad**

#### **1. Sistema de colores accesibles**
```scss
// Variables en _palette.scss
$accessible-success: #28a745; // Contraste 7:1
$accessible-warning: #ffc107; // Contraste 4.5:1  
$accessible-error: #dc3545;   // Contraste 7:1
$accessible-info: #17a2b8;    // Contraste 4.5:1
```

#### **2. Patrones visuales** (Para no depender solo del color)
```css
/* Patrones SVG / CSS para usuarios daltónicos */
--pattern-success: dots pattern
--pattern-error: stripes pattern
--pattern-warning: diagonal pattern
```

#### **3. Componente de mensajes accesibles**
```html
<app-accessible-message type="error" live="true">
  Error message with icon + color + pattern
</app-accessible-message>
```

#### **4. Soporte para preferencias del usuario**
```css
/* Alto contraste automático */
@media (prefers-contrast: high) {
  :root {
    --focus-color: #000000;
  }
}

/* Movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

### 🧪 **Testing para daltonismo**

Herramientas para Chrome DevTools:
```
F12 → Rendering → Emulate vision deficiencies:
- Protanopia (rojo-verde)
- Deuteranopia (rojo-verde) 
- Tritanopia (azul-amarillo)
- Achromatopsia (sin color)
```

### Casos físicos a comprobar:
- **Navigation:** Selector de idiomas distinguible sin color. Focus indicators visibles en alto contraste.
- **Content sections:** Skills progress visible con patrones. Project cards distinguibles.
- **Interactive elements:** Hover states no dependen solo del color. Enlaces subrayados o con iconos. Elementos de formulario con labels.

## 📊 **Ratios de contraste en CI verificados**
- **WCAG AA (4.5:1+):** Textos, botones azules, elementos amarillos.
- **WCAG AAA (7:1+):** Encabezados principales, mensajes de estado (error/success).

## 🚀 **Tooling Técnico Automatizado**

### Línea de comandos:
```bash
# Pa11y - Testing automático
npm install -g pa11y
pa11y http://localhost:4200

# axe-core CLI
npm install -g @axe-core/cli
axe http://localhost:4200
```
