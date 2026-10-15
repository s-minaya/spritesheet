// Demo de 006-poking para el playground (no se exporta): Sofi sobre un contenedor de verdad, para pincharla.
// El playground la monta en su tarjeta y le pasa velocidad, pausa y reinicio.
import { attachPoking, STATES, TIMING } from './poking.js';

const NAMES = {
  idle: 'reposo',
  curious: '¿mm?',
  skeptical: 'escéptica',
  stop: '¡quieto!',
  offended: 'ofendida',
  hide: 'escondida',
  peek: 'asomada',
  nope: '¡nope!',
  return: 'vuelve',
};
const sec = (ms) => `${(ms / 1000).toLocaleString('es')} s`;
const EDGES = [
  [0, 'justo debajo (100 %)'],
  [0.08, 'un poco más arriba (92 %)'],
  [0.16, 'más arriba (84 %)'],
];

const CSS = `
.pk-scene { justify-self: stretch; width: 100%; padding-top: 72px; }
.pk-sofi { position: relative; width: min(var(--size), 100%); margin: 0 auto calc(-1 * var(--edge-frac) * min(var(--size), 100%)); }
.pk-sofi > .poking { display: block; width: 100%; max-width: none; padding: 0; border: 0; background-color: transparent;
  font: inherit; cursor: pointer; --poking-edge: calc((1 - var(--edge-frac)) * 100%); }
.pk-sofi > .poking:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
.pk-panel { position: relative; max-width: 560px; margin: 0 auto; padding: 22px 18px 16px; border: 3px solid #2b1d2e;
  border-radius: 4px; background: #fffaf2; color: #2b1d2e; box-shadow: 4px 4px 0 rgb(43 29 46 / 0.25); }
.pk-panel b { position: absolute; top: -15px; left: 14px; padding: 2px 10px 4px; background: #2b1d2e; color: #fffaf2;
  font-size: 15px; line-height: 1.2; }
.pk-panel p { margin: 0; font-size: 15px; }
.pk-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; font-size: 13px; color: var(--muted); }
.pk-controls select { font: inherit; color: var(--text); background: var(--surface); border: 1px solid var(--border);
  border-radius: 999px; padding: 4px 8px; }
.pk-state { color: var(--text); font-variant-numeric: tabular-nums; }
.pk-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.pk-chips button { font: inherit; font-size: 12px; padding: 3px 9px; border: 1px solid var(--border); border-radius: 999px;
  background: var(--surface); color: var(--muted); cursor: pointer; }
.pk-chips button[aria-pressed='true'] { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
`;

export default function mount({ stage, body }) {
  if (!document.getElementById('pk-style')) {
    document.head.append(Object.assign(document.createElement('style'), { id: 'pk-style', textContent: CSS }));
  }
  stage.innerHTML = `
    <div class="pk-scene" style="--edge-frac: 0">
      <div class="pk-sofi"><button type="button" class="sprite sofi-blink poking" aria-label="Sofi"></button></div>
      <div class="pk-panel"><b>Sofi</b><p>Pincha a Sofi (clic o toque) varias veces seguidas. El borde de este cuadro es el
        borde real tras el que se esconde.</p></div>
    </div>`;
  body.insertAdjacentHTML(
    'beforeend',
    `<div class="pk-controls">
      <button type="button" class="btn primary" data-act="poke">Pinchar</button>
      <button type="button" class="btn" data-act="reset">Reposo</button>
      <span>Estado: <b class="pk-state"></b></span>
      <label>Borde <select data-act="edge">${EDGES.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
    </div>
    <div class="pk-controls"><span>Ver estado:</span><div class="pk-chips">${STATES.map((s) => `<button type="button" data-state="${s}">${NAMES[s]}</button>`).join('')}</div></div>
    <p class="note">Un escalón por pinchazo (mín. ${TIMING.cooldown} ms entre pinchazos) · reposo tras ${sec(TIMING.reset)} sin pinchazos ·
      se asoma a los ${sec(TIMING.peekAfter)} · asomada ${sec(TIMING.peekFor)} · «¡nope!» ${sec(TIMING.nopeFor)} · vuelve en ${sec(TIMING.returnFor)}.
      «Ver estado» pone el estado a mano, sin temporizadores.</p>`,
  );

  const host = stage.querySelector('.poking');
  const scene = stage.querySelector('.pk-scene');
  const status = body.querySelector('.pk-state');
  const chips = [...body.querySelectorAll('[data-state]')];
  let rate = 1;
  let paused = false;

  // Las animaciones CSS nacen con cada estado: se les aplica la velocidad y la pausa del playground.
  const sync = () => {
    for (const a of host.getAnimations({ subtree: true })) {
      a.playbackRate = rate;
      if (paused) a.pause();
      else if (a.playState === 'paused') a.play();
    }
  };
  const show = (state) => {
    status.textContent = `${NAMES[state]} (${state})`;
    for (const c of chips) c.setAttribute('aria-pressed', c.dataset.state === state);
    sync();
  };
  const poking = attachPoking(host, { onChange: show });
  show('idle');

  body.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'poke') poking.poke();
    if (act === 'reset') poking.reset();
    const chip = e.target.closest('[data-state]');
    if (chip) {
      poking.reset();
      host.dataset.poking = chip.dataset.state;
      show(chip.dataset.state);
    }
  });
  body.addEventListener('change', (e) => {
    if (e.target.dataset.act === 'edge') scene.style.setProperty('--edge-frac', e.target.value);
  });

  return {
    setRate(next) {
      rate = next;
      poking.setRate(next);
      sync();
    },
    pause() {
      paused = true;
      poking.pause();
      sync();
    },
    resume() {
      paused = false;
      poking.resume();
      sync();
    },
    restart() {
      poking.reset();
    },
  };
}
