/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-env node */
const fs = require("fs");
const path = require("path");

// Función para generar el contenido del archivo environment
function generateEnvironmentContent(isProd) {
  const envPrefix = isProd ? "production" : "development";

  // Leer variables de entorno con valores por defecto para desarrollo local
  const projectId = process.env.SANITY_PROJECT_ID || (isProd ? "" : "a5eryyb2");
  const dataset = process.env.SANITY_DATASET || envPrefix;
  const apiVersion = process.env.SANITY_API_VERSION || "2025-05-11";
  const useCdn = process.env.SANITY_USE_CDN !== "false"; // true por defecto
  const token = process.env.SANITY_TOKEN || "undefined";

  const content = `export const environment = {
  production: ${isProd},
  sanity: {
    projectId: '${projectId}',
    dataset: '${dataset}',
    apiVersion: '${apiVersion}',
    useCdn: ${useCdn},
    token: ${token === "undefined" ? "undefined" : `'${token}'`}
  }
};
`;

  return content;
}

// Generar environment.ts (desarrollo)
const devPath = path.join(__dirname, "../src/environments/environment.ts");
fs.writeFileSync(devPath, generateEnvironmentContent(false), "utf8");
console.log("✓ environment.ts generado");

// Generar environment.prod.ts (producción)
const prodPath = path.join(
  __dirname,
  "../src/environments/environment.prod.ts"
);
fs.writeFileSync(prodPath, generateEnvironmentContent(true), "utf8");
console.log("✓ environment.prod.ts generado");

// Verificar que las variables de entorno requeridas estén presentes en producción
if (process.env.NODE_ENV === "production" || process.argv.includes("--prod")) {
  if (!process.env.SANITY_PROJECT_ID) {
    console.warn(
      "⚠️  ADVERTENCIA: SANITY_PROJECT_ID no está definida. La aplicación podría no funcionar correctamente en producción."
    );
  }
}
