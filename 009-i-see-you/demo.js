// Demo de 009-i-see-you para el playground (no se exporta): Sofi sigue el cursor con la mirada y, si juegas con ella o
// lo dejas encima, se ve pillada. Por defecto sigue el cursor por toda la página.
// El playground la monta en su tarjeta y le pasa velocidad, pausa y reinicio.
import { attachISeeYou, GAZES, TIMING } from './i-see-you.js';

const NAMES = {
  idle: 'reposo',
  watching: 'mirando',
  caught: '¡pillada!',
  smirk: 'sonrisa pícara',
  tease: 'troll',
  giggle: 'risita',
};
const GAZE_NAMES = { center: 'al frente', left: 'izquierda', right: 'derecha', up: 'arriba', down: 'abajo' };
const sec = (ms) => `${(ms / 1000).toLocaleString('es')} s`;
// «Ver estado»: cada mirada y cada reacción, puestas a mano.
const VIEWS = [['idle'], ...GAZES.map((g) => ['watching', g]), ['caught'], ['smirk'], ['tease'], ['giggle']];

const CSS = `
.isy-scene { justify-self: stretch; display: grid; justify-items: center; gap: 10px; width: 100%; padding: 8px 0; }
.isy-scene > .i-see-you { width: min(var(--size), 100%); }
.isy-hint { margin: 0; font-size: 13px; color: var(--muted); text-align: center; }
.isy-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; font-size: 13px; color: var(--muted); }
.isy-controls select { font: inherit; color: var(--text); background: var(--surface); border: 1px solid var(--border);
  border-radius: 999px; padding: 4px 8px; }
.isy-state { color: var(--text); font-variant-numeric: tabular-nums; }
.isy-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.isy-chips button { font: inherit; font-size: 12px; padding: 3px 9px; border: 1px solid var(--border); border-radius: 999px;
  background: var(--surface); color: var(--muted); cursor: pointer; }
.isy-chips button[aria-pressed='true'] { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
`;

export default function mount({ stage, body }) {
  if (!document.getElementById('isy-style')) {
    document.head.append(Object.assign(document.createElement('style'), { id: 'isy-style', textContent: CSS }));
  }
  stage.innerHTML = `
    <div class="isy-scene">
      <div class="sprite sofi-blink i-see-you" role="img" aria-label="Sofi"></div>
      <p class="isy-hint"></p>
    </div>`;
  body.insertAdjacentHTML(
    'beforeend',
    `<div class="isy-controls">
      <button type="button" class="btn primary" data-act="notice">Pillarla</button>
      <button type="button" class="btn" data-act="reset">Reposo</button>
      <span>Estado: <b class="isy-state"></b></span>
      <label>Sigue el cursor <select data-act="target"><option value="page">en toda la página</option><option value="stage">solo en el escenario</option></select></label>
    </div>
    <div class="isy-controls"><span>Ver estado:</span><div class="isy-chips">${VIEWS.map(([s, g]) => `<button type="button" data-view="${s}${g ? ':' + g : ''}">${g ? `mira ${GAZE_NAMES[g]}` : NAMES[s]}</button>`).join('')}</div></div>
    <p class="note">Mira hacia el cursor con ${TIMING.react} ms de retraso y vuelve al reposo si lo dejas quieto ${sec(TIMING.rest)}.
      La pillan si su mirada cambia ${TIMING.plays} veces en ${sec(TIMING.play)} (juegas con ella) o si dejas el cursor encima
      ${sec(TIMING.dwell)}: ¡pillada! ${sec(TIMING.caught)} · sonrisa pícara ${sec(TIMING.smirk)} · troll ${sec(TIMING.tease)} ·
      risita ${sec(TIMING.giggle)} · sonrisa ${sec(TIMING.after)} · reposo, y ${sec(TIMING.cooldown)} sin dejarse pillar
      («Pillarla» no espera). «Ver estado» lo pone a mano, sin temporizadores.</p>`,
  );

  const host = stage.querySelector('.i-see-you');
  const hint = stage.querySelector('.isy-hint');
  const status = body.querySelector('.isy-state');
  const chips = [...body.querySelectorAll('[data-view]')];
  let rate = 1;
  let paused = false;
  let forced = false; // «Ver estado»: la máquina, parada en reposo; el estado, puesto a mano
  let target = document;
  let eyes;

  // Las animaciones CSS nacen con cada estado: se les aplica la velocidad y la pausa del playground.
  const sync = () => {
    for (const a of host.getAnimations({ subtree: true })) {
      a.playbackRate = rate;
      if (paused) a.pause();
      else if (a.playState === 'paused') a.play();
    }
  };
  const show = (state, gaze) => {
    status.textContent = state === 'watching' ? `${NAMES[state]} ${GAZE_NAMES[gaze]} (${gaze})` : `${NAMES[state]} (${state})`;
    const view = state === 'watching' ? `${state}:${gaze}` : state;
    for (const c of chips) c.setAttribute('aria-pressed', c.dataset.view === view);
    sync();
  };
  const attach = () => {
    eyes?.destroy();
    forced = false;
    eyes = attachISeeYou(host, { target, onChange: show });
    eyes.setRate(rate);
    if (paused) eyes.pause();
    const where = target === document ? 'la página' : 'este recuadro';
    hint.textContent = matchMedia('(hover: none)').matches
      ? `Toca ${where}: Sofi mira hacia donde tocas. Mantén el dedo sobre ella para pillarla.`
      : `Mueve el cursor por ${where}: Sofi lo sigue con la mirada. Juega con ella o déjalo encima.`;
    show(eyes.state, eyes.gaze);
  };
  attach();

  // Al salir de «Ver estado», vuelve a mandar la máquina, desde el reposo.
  const release = () => {
    if (!forced) return;
    forced = false;
    eyes.resume('demo');
    eyes.reset();
  };

  body.addEventListener('click', (e) => {
    const act = e.target.closest('button[data-act]')?.dataset.act;
    if (act) release();
    if (act === 'notice') eyes.notice();
    if (act === 'reset') eyes.reset();
    const chip = e.target.closest('[data-view]');
    if (chip) {
      eyes.reset();
      if (!forced) eyes.pause('demo');
      forced = true;
      const [state, gaze = 'center'] = chip.dataset.view.split(':');
      host.dataset.iSeeYou = state;
      host.dataset.iSeeYouGaze = gaze;
      show(state, gaze);
    }
  });
  body.addEventListener('change', (e) => {
    if (e.target.dataset.act !== 'target') return;
    target = e.target.value === 'stage' ? stage : document;
    attach();
  });

  return {
    setRate(next) {
      rate = next;
      eyes.setRate(next);
      sync();
    },
    pause() {
      paused = true;
      eyes.pause();
      sync();
    },
    resume() {
      paused = false;
      eyes.resume();
      sync();
    },
    restart() {
      release();
      eyes.reset();
    },
  };
}
