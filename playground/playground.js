// Playground: carga cada animación (NNN-*/_*.scss, compilada por scripts/dev.mjs)
// y controla su animación CSS real con la Web Animations API.
const $ = (selector, root = document) => root.querySelector(selector);
const grid = $('#grid');

const store = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(`sprites:${key}`);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`sprites:${key}`, JSON.stringify(value));
    } catch {}
  },
};

const state = {
  size: store.get('size', 192),
  speed: store.get('speed', 1),
  bg: store.get('bg', 'light'),
  pixel: store.get('pixel', false),
  paused: store.get('paused', false),
};
const cards = [];
const demos = [];

const number = (n, digits) => n.toLocaleString('es', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const kb = (bytes) => `${number(bytes / 1024, 1)} KB`;
const mb = (bytes) => `${number(bytes / 1024 ** 2, 1)} MB`;
const seconds = (ms) => `${number(ms / 1000, 2)} s`;

function setState(patch) {
  Object.assign(state, patch);
  for (const [key, value] of Object.entries(patch)) store.set(key, value);
  render();
}

function render() {
  grid.style.setProperty('--size', `${state.size}px`);
  grid.dataset.bg = state.bg;
  grid.classList.toggle('pixel', state.pixel);
  $('#size').value = state.size;
  $('#size-out').value = `${state.size} px`;
  $('#pixel').checked = state.pixel;
  $('#play').textContent = state.paused ? 'Reproducir' : 'Pausa';
  for (const b of document.querySelectorAll('[data-speed]')) b.setAttribute('aria-pressed', Number(b.dataset.speed) === state.speed);
  for (const b of document.querySelectorAll('[data-bg-option]')) b.setAttribute('aria-pressed', b.dataset.bgOption === state.bg);
  for (const { all } of cards) {
    for (const anim of all) {
      anim.playbackRate = state.speed;
      if (state.paused) anim.pause();
      else anim.play();
    }
  }
  for (const demo of demos) {
    demo.setRate?.(state.speed);
    if (state.paused) demo.pause?.();
    else demo.resume?.();
  }
}

async function imageSize(cssUrl) {
  const src = /url\(["']?(.*?)["']?\)/.exec(cssUrl)?.[1];
  return src ? decodedSize(src) : null;
}

async function decodedSize(src) {
  const img = new Image();
  img.src = src;
  try {
    await img.decode();
    return { src, width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return null;
  }
}

async function addCard(entry, cls) {
  const card = $('#card').content.firstElementChild.cloneNode(true);
  const sprite = $('.sprite', card);
  sprite.classList.add(cls);
  $('.name', card).textContent = cls;
  $('.folder', card).textContent = entry.id;
  grid.append(card);

  const style = getComputedStyle(sprite);
  const frames = parseInt(style.getPropertyValue('--sprite-frames'), 10) || 1;
  const image = await imageSize(style.backgroundImage);
  const bytes = entry.assets.reduce((sum, a) => sum + (a.bytes ?? 0), 0);
  const anim = sprite.getAnimations()[0];
  // Las demás animaciones de la pieza (giros, efectos en ::before/::after…) se controlan junto a la principal.
  const all = sprite.getAnimations({ subtree: true });
  const duration = anim ? anim.effect.getComputedTiming().duration : 0;

  $('.facts', card).textContent = [
    `${frames} fotograma${frames === 1 ? '' : 's'}`,
    anim && seconds(duration),
    kb(bytes),
    image && `${image.width}×${image.height}`,
  ].filter(Boolean).join(' · ');

  if (!anim) {
    $('.note', card).textContent = 'Sin animación: el sistema tiene activado «reducir movimiento».';
    $('.timeline', card).remove();
    $('.time', card).remove();
    return;
  }

  // Tramos de la línea de tiempo a partir de los @keyframes reales.
  const frameOf = (value) => (frames > 1 ? Math.round((parseFloat(value) || 0) / 100 * (frames - 1)) : 0);
  const keyframes = anim.effect.getKeyframes();
  const steps = keyframes
    .map((k, i) => ({ start: k.computedOffset, end: keyframes[i + 1]?.computedOffset ?? 1, frame: frameOf(k.backgroundPositionX) }))
    .filter((s) => s.end > s.start);

  const bar = $('.timeline', card);
  for (const s of steps) {
    const el = document.createElement('span');
    el.className = 'step';
    el.style.flexGrow = s.end - s.start;
    el.style.setProperty('--f', frames > 1 ? s.frame / (frames - 1) : 0);
    el.title = `Fotograma ${s.frame} · ${Math.round((s.end - s.start) * duration)} ms`;
    bar.insertBefore(el, $('.head', bar));
  }

  const seek = (progress) => {
    if (!state.paused) setState({ paused: true });
    const time = Math.min(Math.max(progress, 0), 0.9999) * duration;
    for (const a of all) a.currentTime = time;
  };
  const scrub = (e) => {
    const r = bar.getBoundingClientRect();
    seek((e.clientX - r.left) / r.width);
  };
  bar.addEventListener('pointerdown', (e) => {
    bar.setPointerCapture(e.pointerId);
    scrub(e);
  });
  bar.addEventListener('pointermove', (e) => {
    if (bar.hasPointerCapture(e.pointerId)) scrub(e);
  });
  bar.addEventListener('keydown', (e) => {
    const delta = { ArrowLeft: -100, ArrowRight: 100 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const progress = anim.effect.getComputedTiming().progress ?? 0;
    seek((progress * duration + delta + duration) % duration / duration);
  });

  const thumbs = Array.from({ length: frames }, (_, i) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'thumb';
    thumb.style.aspectRatio = style.aspectRatio;
    const img = document.createElement('div');
    img.className = 'thumb-img';
    img.style.backgroundImage = style.backgroundImage;
    img.style.backgroundSize = `${frames * 100}% 100%`;
    img.style.backgroundPositionX = frames > 1 ? `${(i / (frames - 1)) * 100}%` : '0%';
    const shown = steps.filter((s) => s.frame === i).reduce((sum, s) => sum + (s.end - s.start) * duration, 0);
    const label = document.createElement('span');
    label.className = 'thumb-label';
    label.innerHTML = `<b>${i}</b><span>${Math.round(shown)} ms</span>`;
    thumb.title = `Ir al fotograma ${i}`;
    thumb.append(img, label);
    const first = steps.find((s) => s.frame === i);
    // Al centro del tramo: en el borde exacto el navegador puede redondear al fotograma anterior.
    if (first) thumb.addEventListener('click', () => seek((first.start + first.end) / 2));
    $('.frames', card).append(thumb);
    return thumb;
  });

  cards.push({ anim, all, duration, steps, thumbs, bar, head: $('.head', bar), time: $('.time', card), current: -1 });
}

// Demo propia de una animación que necesita elementos de la página (NNN-*/demo.js). El módulo exporta por defecto
// mount({ stage, body, entry }) y puede devolver { setRate, pause, resume, restart } para seguir los controles de arriba.
async function addDemo(entry) {
  const card = document.createElement('article');
  card.className = 'card demo';
  card.innerHTML = '<div class="stage"></div><div class="body"><header class="meta"><h2 class="name"></h2><span class="folder"></span></header><p class="facts"></p></div>';
  $('.name', card).textContent = entry.name;
  $('.folder', card).textContent = `${entry.id} · demo`;
  grid.append(card);
  const sizes = await Promise.all(entry.assets.map((a) => decodedSize(a.url)));
  $('.facts', card).textContent = [
    `${entry.assets.length} ${entry.assets.length === 1 ? 'imagen' : 'imágenes'}`,
    kb(entry.assets.reduce((sum, a) => sum + (a.bytes ?? 0), 0)),
    `${mb(sizes.reduce((sum, i) => sum + (i ? i.width * i.height * 4 : 0), 0))} en memoria`,
  ].join(' · ');
  try {
    const { default: mount } = await import(entry.demo);
    const demo = await mount({ stage: $('.stage', card), body: $('.body', card), entry });
    if (demo) demos.push(demo);
  } catch (err) {
    card.classList.add('error');
    const pre = document.createElement('pre');
    pre.textContent = `${entry.demo}\n${err.stack ?? err}`;
    card.append(pre);
  }
}

function addError(entry) {
  const card = document.createElement('article');
  card.className = 'card error';
  card.innerHTML = '<header class="meta"><h2 class="name"></h2><span class="folder"></span></header><pre></pre>';
  $('.name', card).textContent = `_${entry.name}.scss`;
  $('.folder', card).textContent = entry.id;
  $('pre', card).textContent = entry.error;
  grid.append(card);
}

function tick() {
  for (const c of cards) {
    const progress = c.anim.effect.getComputedTiming().progress ?? 0;
    c.head.style.left = `${progress * 100}%`;
    c.bar.setAttribute('aria-valuenow', Math.round(progress * 100));
    const step = c.steps.find((s) => progress >= s.start && progress < s.end) ?? c.steps.at(-1);
    if (step.frame !== c.current) {
      c.thumbs[c.current]?.classList.remove('on');
      c.thumbs[step.frame]?.classList.add('on');
      c.current = step.frame;
    }
    c.time.textContent = `${seconds(progress * c.duration)} / ${seconds(c.duration)}`;
  }
  requestAnimationFrame(tick);
}

async function load() {
  let list;
  try {
    list = await (await fetch('animations.json', { cache: 'no-store' })).json();
  } catch {
    grid.innerHTML = '<p class="empty">No se pudo leer la lista de animaciones. Arranca el playground con <code>npm run dev</code>.</p>';
    return;
  }
  if (!list.length) grid.innerHTML = '<p class="empty">Todavía no hay animaciones: crea una carpeta <code>NNN-nombre/</code> con su <code>_nombre.scss</code>.</p>';

  await Promise.all(list.filter((e) => !e.error).map((e) => new Promise((resolve) => {
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: e.css });
    link.onload = link.onerror = resolve;
    document.head.append(link);
  })));

  let shown = 0;
  for (const entry of list) {
    if (entry.error) {
      addError(entry);
      continue;
    }
    for (const cls of entry.classes) {
      await addCard(entry, cls);
      shown++;
    }
    if (entry.demo) {
      await addDemo(entry);
      if (!entry.classes.length) shown++;
    }
  }
  const download = new Map(list.flatMap((e) => e.assets.map((a) => [a.url, a.bytes ?? 0])));
  // Todas las imágenes (tiras y efectos), decodificadas: ancho × alto × 4 bytes.
  const sizes = await Promise.all([...download.keys()].map(decodedSize));
  const memory = sizes.reduce((sum, i) => sum + (i ? i.width * i.height * 4 : 0), 0);
  $('#summary').textContent = `${shown} animaci${shown === 1 ? 'ón' : 'ones'} · ${kb([...download.values()].reduce((a, b) => a + b, 0))} de descarga · ${mb(memory)} en memoria`;

  render();
  requestAnimationFrame(tick);
}

$('#play').addEventListener('click', () => setState({ paused: !state.paused }));
$('#restart').addEventListener('click', () => {
  cards.forEach((c) => c.all.forEach((a) => (a.currentTime = 0)));
  demos.forEach((d) => d.restart?.());
});
$('#size').addEventListener('input', (e) => setState({ size: Number(e.target.value) }));
$('#pixel').addEventListener('change', (e) => setState({ pixel: e.target.checked }));
for (const b of document.querySelectorAll('[data-speed]')) b.addEventListener('click', () => setState({ speed: Number(b.dataset.speed) }));
for (const b of document.querySelectorAll('[data-bg-option]')) b.addEventListener('click', () => setState({ bg: b.dataset.bgOption }));

const live = $('#live');
const events = new EventSource('/__events');
events.addEventListener('open', () => {
  live.classList.add('on');
  live.textContent = 'en vivo';
});
events.addEventListener('error', () => {
  live.classList.remove('on');
  live.textContent = 'desconectado';
});
events.addEventListener('message', () => location.reload());

render();
load();
