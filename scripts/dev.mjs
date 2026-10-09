// Servidor del playground: compila los SCSS al vuelo, lista las animaciones
// de las carpetas NNN-* y recarga la página cuando cambia cualquier archivo.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHARED = path.join(ROOT, 'scss');
const ANIMATION_DIR = /^\d+-/;
const PORT = Number(process.env.PORT) || 5757;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

// Compila <dir>/_<name>.scss (o <name>.scss) con scss/ como ruta de carga.
function compile(dir, name) {
  return sass.compileString(`@use '${name}';`, { loadPaths: [dir, SHARED] }).css;
}

function animations() {
  const list = [];
  const dirs = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && ANIMATION_DIR.test(d.name))
    .map((d) => d.name)
    .sort();
  for (const dir of dirs) {
    const abs = path.join(ROOT, dir);
    for (const file of fs.readdirSync(abs).filter((f) => /^_.+\.scss$/.test(f)).sort()) {
      const name = file.slice(1, -'.scss'.length);
      const entry = { id: dir, name, css: `/${dir}/${name}.css`, classes: [], assets: [], error: null };
      try {
        const css = compile(abs, name);
        // Clases de primer nivel que declaran una animación.
        entry.classes = [...new Set([...css.matchAll(/(?:^|\})\s*\.([\w-]+)\s*\{[^}]*\banimation\s*:/g)].map((m) => m[1]))];
        const urls = new Set([...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map((m) => m[2]));
        for (const url of urls) {
          if (/^(data:|https?:)/.test(url)) continue;
          const asset = path.resolve(abs, url);
          entry.assets.push({ url: path.posix.join('/', dir, url), bytes: fs.existsSync(asset) ? fs.statSync(asset).size : null });
        }
      } catch (err) {
        entry.error = err.message;
      }
      list.push(entry);
    }
  }
  return list;
}

function send(res, status, ext, body) {
  res.writeHead(status, { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(body);
}

const clients = new Set();

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  const route = decodeURIComponent(pathname);

  if (route === '/') {
    res.writeHead(302, { Location: '/playground/' });
    return res.end();
  }
  if (route === '/__events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.write('retry: 1000\n\n');
    clients.add(res);
    return req.on('close', () => clients.delete(res));
  }
  if (route === '/playground/animations.json') return send(res, 200, '.json', JSON.stringify(animations()));

  let file = path.join(ROOT, route);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return send(res, 403, '.txt', 'Prohibido');
  if (route.endsWith('/')) file = path.join(file, 'index.html');
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return send(res, 200, path.extname(file), fs.readFileSync(file));

  if (file.endsWith('.css')) {
    const dir = path.dirname(file);
    const name = path.basename(file, '.css');
    if ([`_${name}.scss`, `${name}.scss`].some((f) => fs.existsSync(path.join(dir, f)))) {
      try {
        return send(res, 200, '.css', compile(dir, name));
      } catch (err) {
        console.error(err.message);
        return send(res, 500, '.txt', err.message);
      }
    }
  }
  send(res, 404, '.txt', 'No encontrado');
});

let pending;
fs.watch(ROOT, { recursive: true }, (_, file) => {
  if (!file || /(^|[\\/])(node_modules|\.git)([\\/]|$)/.test(file)) return;
  clearTimeout(pending);
  pending = setTimeout(() => {
    for (const client of clients) client.write('data: reload\n\n');
  }, 150);
});

function listen(port) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < PORT + 10) listen(port + 1);
    else throw err;
  });
  server.listen(port, '127.0.0.1', () => console.log(`Playground: http://127.0.0.1:${port}/`));
}
listen(PORT);
