// Demo de 008-are-u-still-here para el playground (no se exporta): Sofi se duerme si no hay actividad y se despierta
// con la primera. Por defecto solo cuenta la actividad sobre el escenario, para poder usar el resto de la página.
// El playground la monta en su tarjeta y le pasa velocidad, pausa y reinicio.
import { attachStillHere, STATES, TIMING } from './are-u-still-here.js';

const NAMES = {
  idle: 'reposo',
  drowsy: 'somnolienta',
  nodding: 'cabezada',
  asleep: 'dormida',
  startled: 'susto',
  guilty: 'pillada',
};
const sec = (ms) => `${(ms / 1000).toLocaleString('es')} s`;
const WAITS = [3000, 6000, 15000, TIMING.idleAfter];

const CSS = `
.ush-scene { justify-self: stretch; display: grid; justify-items: center; gap: 10px; width: 100%; padding: 8px 0; }
.ush-scene > .are-u-still-here { width: min(var(--size), 100%); }
.ush-hint { margin: 0; font-size: 13px; color: var(--muted); text-align: center; }
.ush-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; font-size: 13px; color: var(--muted); }
.ush-controls select { font: inherit; color: var(--text); background: var(--surface); border: 1px solid var(--border);
  border-radius: 999px; padding: 4px 8px; }
.ush-state { color: var(--text); font-variant-numeric: tabular-nums; }
.ush-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ush-chips button { font: inherit; font-size: 12px; padding: 3px 9px; border: 1px solid var(--border); border-radius: 999px;
  background: var(--surface); color: var(--muted); cursor: pointer; }
.ush-chips button[aria-pressed='true'] { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
`;

export default function mount({ stage, body }) {
  if (!document.getElementById('ush-style')) {
    document.head.append(Object.assign(document.createElement('style'), { id: 'ush-style', textContent: CSS }));
  }
  stage.innerHTML = `
    <div class="ush-scene">
      <div class="sprite sofi-blink are-u-still-here" role="img" aria-label="Sofi"></div>
      <p class="ush-hint"></p>
    </div>`;
  body.insertAdjacentHTML(
    'beforeend',
    `<div class="ush-controls">
      <button type="button" class="btn primary" data-act="sleep">Dormir ya</button>
      <button type="button" class="btn" data-act="wake">Despertar</button>
      <button type="button" class="btn" data-act="reset">Cancelar</button>
      <span>Estado: <b class="ush-state"></b></span>
      <label>Se duerme tras <select data-act="wait">${WAITS.map((ms, i) => `<option value="${ms}"${i === 1 ? ' selected' : ''}>${sec(ms)}${ms === TIMING.idleAfter ? ' (web)' : ''}</option>`).join('')}</select></label>
      <label>Actividad <select data-act="target"><option value="stage">sobre el escenario</option><option value="page">en toda la página</option></select></label>
    </div>
    <div class="ush-controls"><span>Ver estado:</span><div class="ush-chips">${STATES.map((s) => `<button type="button" data-state="${s}">${NAMES[s]}</button>`).join('')}</div></div>
    <p class="note">Sin actividad: somnolienta ${sec(TIMING.drowsy)} · cabezada ${sec(TIMING.nod)} · se espabila ${sec(TIMING.drowsyAgain)} ·
      cabezada ${sec(TIMING.nodAgain)} · dormida hasta que vuelvas. Al volver: susto ${sec(TIMING.startled)} · pillada ${sec(TIMING.guilty)} · reposo.
      Si vuelves antes de que se duerma, pasa directamente al reposo. «Ver estado» pone el estado a mano, sin temporizadores.</p>`,
  );

  const host = stage.querySelector('.are-u-still-here');
  const hint = stage.querySelector('.ush-hint');
  const status = body.querySelector('.ush-state');
  const chips = [...body.querySelectorAll('[data-state]')];
  let rate = 1;
  let paused = false;
  let forced = false; // «Ver estado»: la máquina, parada en reposo; el estado, puesto a mano
  let wait = WAITS[1];
  let target = stage;
  let nap;

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
  const attach = () => {
    nap?.destroy();
    forced = false;
    nap = attachStillHere(host, { target, timing: { idleAfter: wait }, onChange: show });
    nap.setRate(rate);
    if (paused) nap.pause();
    hint.textContent =
      target === stage
        ? `Deja el ratón quieto fuera de este recuadro ${sec(wait)} (o pulsa «Dormir ya») y vuelve a moverlo aquí para despertarla.`
        : `Cualquier actividad en la página la despierta: deja el ratón y el teclado quietos ${sec(wait)}.`;
    show(nap.state);
  };
  attach();

  // Al salir de «Ver estado», vuelve a mandar la máquina, desde el reposo.
  const release = () => {
    if (!forced) return;
    forced = false;
    nap.resume('demo');
    nap.reset();
  };

  body.addEventListener('click', (e) => {
    const act = e.target.closest('button[data-act]')?.dataset.act;
    if (act) release();
    if (act === 'sleep') nap.sleep();
    if (act === 'wake') nap.wake();
    if (act === 'reset') nap.reset();
    const chip = e.target.closest('[data-state]');
    if (chip) {
      nap.reset();
      if (!forced) nap.pause('demo');
      forced = true;
      host.dataset.stillHere = chip.dataset.state;
      show(chip.dataset.state);
    }
  });
  body.addEventListener('change', (e) => {
    if (e.target.dataset.act === 'wait') wait = Number(e.target.value);
    if (e.target.dataset.act === 'target') target = e.target.value === 'stage' ? stage : document;
    attach();
  });

  return {
    setRate(next) {
      rate = next;
      nap.setRate(next);
      sync();
    },
    pause() {
      paused = true;
      nap.pause();
      sync();
    },
    resume() {
      paused = false;
      nap.resume();
      sync();
    },
    restart() {
      release();
      nap.reset();
    },
  };
}
