// Genera un zip por animación en dist/ (NNN-nombre.zip), listo para pegar en el proyecto de destino.
// Lleva una carpeta sprites/ con el mixin común, el parcial, las imágenes que declara su SCSS y, si la animación
// tiene comportamiento, su JS y sus tipos; nada de otras animaciones: la usuaria las incorpora de una en una y
// pegar una no debe tocar las demás.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHARED = path.join(ROOT, 'scss');
const OUT = path.join(ROOT, 'dist');
const ANIMATION_DIR = /^\d+-/;

// Archivos del paquete (ruta dentro de sprites/ → contenido): el mixin, los parciales y lo que declaran con url().
function collect(dir) {
  const files = new Map([['_sprite.scss', fs.readFileSync(path.join(SHARED, '_sprite.scss'))]]);
  const names = [];
  for (const partial of fs.readdirSync(dir).filter((f) => /^_.+\.scss$/.test(f)).sort()) {
    const name = partial.slice(1, -'.scss'.length);
    names.push(name);
    files.set(partial, fs.readFileSync(path.join(dir, partial)));
    const css = sass.compile(path.join(dir, partial), { loadPaths: [SHARED] }).css;
    for (const [, , url] of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
      if (/^(data:|https?:)/.test(url)) continue;
      // En el destino todas las animaciones comparten la carpeta sprites/: con otro nombre podría pisar archivos ajenos.
      if (!url.startsWith(`${name}.`) && !url.startsWith(`${name}-`)) {
        throw new Error(`${partial}: «${url}» debe empezar por «${name}» para no pisar archivos de otra animación.`);
      }
      files.set(url, fs.readFileSync(path.join(dir, url)));
    }
  }
  // JS de las animaciones complejas y sus tipos, con el mismo prefijo que el parcial (demo.js es solo del playground).
  for (const file of fs.readdirSync(dir).filter((f) => /\.(m?js|d\.ts)$/.test(f)).sort()) {
    if (names.some((n) => file.startsWith(`${n}.`) || file.startsWith(`${n}-`))) files.set(file, fs.readFileSync(path.join(dir, file)));
  }
  return { names, files };
}

// Comprueba que el paquete compila solo, tal como quedará en el destino.
function check(names, files) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sprites-'));
  try {
    for (const [file, data] of files) {
      const target = path.join(tmp, 'sprites', file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, data);
    }
    for (const name of names) sass.compileString(`@use 'sprites/${name}';`, { loadPaths: [tmp] });
    // El JS, como módulo: que al menos se analice sin errores.
    for (const file of [...files.keys()].filter((f) => /\.m?js$/.test(f))) {
      const copy = path.join(tmp, `${file}.check.mjs`);
      fs.writeFileSync(copy, files.get(file));
      execFileSync(process.execPath, ['--check', copy], { stdio: 'pipe' });
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// Zip mínimo, sin dependencias. Deflate solo si reduce algo: las WebP ya van comprimidas y se guardan tal cual.
function zip(entries) {
  const now = new Date();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const local = [];
  const central = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const stored = deflated.length >= data.length;
    const body = stored ? data : deflated;
    const fileName = Buffer.from(name);
    // Campos que comparten la cabecera local y la del directorio central.
    const fields = Buffer.alloc(26);
    fields.writeUInt16LE(20, 0); // versión necesaria: 2.0
    fields.writeUInt16LE(stored ? 0 : 8, 4);
    fields.writeUInt16LE(time, 6);
    fields.writeUInt16LE(date, 8);
    fields.writeUInt32LE(zlib.crc32(data), 10);
    fields.writeUInt32LE(body.length, 14);
    fields.writeUInt32LE(data.length, 18);
    fields.writeUInt16LE(fileName.length, 22);
    const signature = Buffer.alloc(4);
    signature.writeUInt32LE(0x04034b50);
    local.push(signature, fields, fileName, body);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4); // creado con la versión 2.0
    fields.copy(entry, 6);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, fileName);
    offset += signature.length + fields.length + fileName.length + body.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(central.reduce((sum, b) => sum + b.length, 0), 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...central, end]);
}

fs.mkdirSync(OUT, { recursive: true });
const dirs = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && ANIMATION_DIR.test(d.name))
  .map((d) => d.name)
  .sort();
for (const dir of dirs) {
  const { names, files } = collect(path.join(ROOT, dir));
  if (!names.length) continue;
  check(names, files);
  const out = path.join(OUT, `${dir}.zip`);
  fs.writeFileSync(out, zip([...files].map(([file, data]) => [`sprites/${file}`, data])));
  console.log(`dist/${dir}.zip  ${(fs.statSync(out).size / 1024).toFixed(1)} KB  ${[...files.keys()].join(' · ')}`);
}
console.log('Cada zip trae una carpeta sprites/: se pega sobre la del proyecto de destino.');
