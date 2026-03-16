# Pre-commit Hooks Configuration

## ✅ Lo que se ha configurado

### 1. Husky
- ✅ Instalado: `husky` como dev dependency
- ✅ Inicializado: Carpeta `.husky` creada
- ✅ Script `prepare`: Se ejecuta automáticamente en `npm install`

### 2. Pre-commit Hook
- ✅ Archivo: `.husky/pre-commit`
- ✅ Lógica: Solo se ejecuta en la rama `main`
- ✅ Tests: Ejecuta `npm run test:ci` y bloquea commit si fallan
- ❌ ESLint: Temporalmente deshabilitado por conflictos de dependencias

### 3. Scripts de package.json
```json
{
  "scripts": {
    "test:ci": "ng test --watch=false --browsers=ChromeHeadlessCI --code-coverage",
    "lint": "eslint .", 
    "lint:fix": "eslint . --fix",
    "prepare": "husky"
  }
}
```

## 🔧 Funcionamiento Actual

### En rama `main`:
1. 🧪 **Tests**: Se ejecutan automáticamente antes de cada commit
   - Comando: `npm run test:ci`
   - ✅ Si pasan → permite commit
   - ❌ Si fallan → bloquea commit

2. 🔧 **ESLint**: Temporalmente deshabilitado
   - Motivo: Conflictos de dependencias con ESLint 10.x
   - Angular ESLint instalado pero no funciona correctamente

### En otras ramas:
- ℹ️ Pre-commit hooks se omiten completamente
- Commits se permiten sin restricciones

## 🚨 Problema Actual con ESLint

El problema es un conflicto de dependencias:
```
Error: Cannot find module 'ajv/lib/refs/json-schema-draft-04.json'
```

### Opciones para solucionarlo:

#### Opción 1: Downgrade de ESLint
```bash
npm install --save-dev eslint@8.57.1
```

#### Opción 2: Actualizar angular-eslint
```bash
npm update @angular-eslint/builder @angular-eslint/eslint-plugin @angular-eslint/template-parser
```

#### Opción 3: Limpiar e reinstalar
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Opción 4: Usar formato de configuración legacy
Crear `.eslintrc.json` en lugar de `eslint.config.js`

## 🧪 Cómo probar los hooks

### Probar en rama main:
```bash
# Hacer un cambio pequeño
echo "// test" >> src/test.ts

# Intentar commit
git add .
git commit -m "test: probar pre-commit hook"
```

### Probar en otra rama:
```bash
git checkout develop
# Hacer commit (debería pasar sin checks)
```

## 📝 Próximos pasos

1. ✅ **Tests funcionando**: Los tests se ejecutan correctamente antes de commit en main
2. 🔧 **Solucionar ESLint**: Resolver conflictos de dependencias
3. 🎯 **Habilitar ESLint en pre-commit**: Descomentar sección en `.husky/pre-commit`
4. 🧹 **Limpiar**: Eliminar `test-precommit.sh` cuando ya no se necesite

## 🎉 ¡Misión cumplida!

Los pre-commit hooks están configurados y funcionando:
- ✅ Solo se ejecutan en rama `main`
- ✅ Tests obligatorios antes de commit
- ⚠️ ESLint pendiente de reparación