# 🔧 Guía de Testing de Accesibilidad por Teclado

## ✅ **Checklist de Testing Manual**

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
- [x] Todos los botones son focusables con Tab
- [x] Se activan con Enter y Espacio
- [x] Tienen indicadores de focus visibles
- [x] Los textos alternativos describen la función

#### **✓ Selector de Idiomas:**
- [x] Se abre con Enter/Espacio
- [x] Se navega con flechas arriba/abajo
- [x] Se selecciona idioma con Enter
- [x] Se cierra con Escape
- [x] Focus vuelve al botón principal

#### **✓ Imágenes:**
- [ ] Funcionales: tienen alt descriptivo de la función
- [ ] Informativas: describen el contenido relevante
- [ ] Decorativas: alt="" (no se leen)

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
# Instalar NVDA gratuito
# Navegar solo con teclado + audio
# Verificar que se lean correctamente:
- Alt texts de imágenes
- ARIA labels de botones
- Estados de menús (expandido/contraído)
```

#### **Comandos útiles NVDA:**
```
Insert + Space    → Modo navegación/foco
Insert + T        → Leer título
Insert + Down     → Leer todo
Tab               → Elemento siguiente
```

## 🧪 **Script de Testing Automatizado**

### **Bookmarklet para verificar tabulación:**
```javascript
javascript:(function(){
  var tabbables = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  tabbables.forEach((el, i) => {
    el.style.outline = '3px solid red';
    el.setAttribute('data-tab-order', i + 1);
    el.title = 'Tab order: ' + (i + 1);
  });
})();
```

### **Verificar textos alternativos:**
```javascript
javascript:(function(){
  var imgs = document.images;
  for(var i = 0; i < imgs.length; i++){
    var alt = imgs[i].alt;
    var isDecorative = alt === '';
    imgs[i].style.border = isDecorative ? '3px solid green' : '3px solid ' + (alt ? 'blue' : 'red');
    imgs[i].title = isDecorative ? 'Decorative (correct)' : (alt || 'NO ALT TEXT');
  }
})();
```

## 🎯 **Casos de uso específicos para tu portfolio**

### **Scenario 1: Navegación completa**
1. Cargar la página principal
2. Usar solo Tab + Enter para navegar
3. ¿Puedes llegar a cada sección?
4. ¿Los botones responden correctamente?

### **Scenario 2: Cambio de idioma**
1. Tab hasta el selector de idiomas
2. Enter para abrir menú
3. Flechas para navegar opciones
4. Enter para seleccionar
5. ¿Cambia el contenido correctamente?

### **Scenario 3: Navegación a proyectos**
1. Tab hasta la sección de proyectos
2. Navegar entre proyectos
3. ¿Los botones de "más información" funcionan?
4. ¿Las imágenes tienen descripciones útiles?

### **Scenario 4: Blog y regreso**
1. Tab hasta botón de blog
2. Navegar en el blog
3. Usar botón de regreso
4. ¿El foco regresa apropiadamente?

## 📊 **Herramientas de validación**

### **Extensiones de navegador:**
- **axe DevTools** - Análisis automático completo
- **WAVE** - Indicadores visuales de problemas
- **Lighthouse** - Auditoría de accesibilidad integrada

### **Línea de comandos:**
```bash
# Pa11y - Testing automático
npm install -g pa11y
pa11y http://localhost:4200

# axe-core CLI
npm install -g @axe-core/cli
axe http://localhost:4200
```

## 🚀 **Implementaciones completadas**

### ✅ **Ya implementado:**
- [x] Skip links para navegación rápida
- [x] Focus indicators visibles globalmente  
- [x] Botones con soporte de teclado (Enter + Space)
- [x] Selector de idiomas completamente accesible
- [x] ARIA labels y roles apropiados
- [x] Textos alternativos traducidos
- [x] Orden lógico de tabulación

### 🔄 **Próximos pasos:**
- [ ] Testing con usuarios con discapacidades
- [ ] Optimización de performance de accessibility
- [ ] Documentación para desarrolladores