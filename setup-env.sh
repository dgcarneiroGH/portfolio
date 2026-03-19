#!/bin/bash
# ===========================================
# Portfolio Development Setup Script
# ===========================================

echo "🚀 Configurando Portfolio para desarrollo..."
echo

# Verificar si .env ya existe
if [ -f ".env" ]; then
    echo "⚠️  El archivo .env ya existe."
    read -p "¿Quieres sobrescribirlo? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configuración cancelada"
        exit 1
    fi
fi

# Pedir variables al usuario
echo "🔐 Ingresa las variables de entorno:"
echo

read -p "PORTFOLIO_TOKEN: " PORTFOLIO_TOKEN
read -p "N8N_WEBHOOK_URL: " N8N_WEBHOOK_URL

# Crear archivo .env
cat > .env << EOF
PORTFOLIO_TOKEN=${PORTFOLIO_TOKEN}
N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
EOF

echo
echo "✅ Archivo .env creado correctamente!"
echo "🛠️  Ejecuta 'npm run dev' para desarrollar con Netlify Functions"
echo "📦 O ejecuta 'npm start' para desarrollo solo Angular"