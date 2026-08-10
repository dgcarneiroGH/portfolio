import { readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SPEC_EXT = '.spec.mjs';
const ROOT_DIR = resolve(fileURLToPath(import.meta.url), '..');

function findSpecFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findSpecFiles(fullPath));
    } else if (entry.endsWith(SPEC_EXT)) {
      results.push(fullPath);
    }
  }
  return results;
}

const specFiles = findSpecFiles(ROOT_DIR).sort();

if (specFiles.length === 0) {
  console.log(`No se encontraron ficheros ${SPEC_EXT} bajo ${ROOT_DIR}`);
  process.exit(0);
}

console.log(`Ejecutando ${specFiles.length} spec(s):`);
for (const file of specFiles) {
  console.log(`  - ${file}`);
}

const result = spawnSync(process.execPath, ['--test', ...specFiles], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
