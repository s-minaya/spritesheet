// Genera dist/sprites/: todo lo necesario para copiar las animaciones a otro proyecto.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'sprites');
const ANIMATION_DIR = /^\d+-/;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(path.join(ROOT, 'scss', '_sprite.scss'), path.join(OUT, '_sprite.scss'));

const names = [];
const dirs = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && ANIMATION_DIR.test(d.name))
  .map((d) => d.name)
  .sort();
for (const dir of dirs) {
  const abs = path.join(ROOT, dir);
  for (const file of fs.readdirSync(abs)) {
    if (/^_.+\.scss$/.test(file)) names.push(file.slice(1, -'.scss'.length));
    // Copia también los overlays PNG que una animación declare en su SCSS.
    if (/^_.+\.scss$|\.webp$/.test(file)) {
      fs.copyFileSync(path.join(abs, file), path.join(OUT, file));
    }
  }
}

const index = `// Generado por npm run export. Importa todas las animaciones: @use 'sprites';\n${names.map((n) => `@use '${n}';`).join('\n')}\n`;
fs.writeFileSync(path.join(OUT, '_index.scss'), index);

// Comprueba que la carpeta exportada compila sola.
sass.compileString("@use 'sprites';", { loadPaths: [path.dirname(OUT)] });

let bytes = 0;
for (const f of fs.readdirSync(OUT)) bytes += fs.statSync(path.join(OUT, f)).size;
console.log(`dist/sprites/: ${names.length} animaciones, ${fs.readdirSync(OUT).length} archivos, ${(bytes / 1024).toFixed(1)} KB`);
