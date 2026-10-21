// Demo de 015-memory-wipe para el playground (no se exporta): el borrado como en la web. Sofi está en reposo
// (sofi-blink), alguien borra su memoria (memory-wipe, una sola pasada), se queda sonriendo un momento y la web vuelve a
// sofi-blink; y vuelta a empezar.
// Sirve para ver que al entrar desde el reposo no salta nada y que al volver a sofi-blink solo cambia la boca. El
// playground le pasa velocidad, pausa y reinicio. Las esperas son animaciones vacías de la Web Animations API: siguen la
// velocidad y la pausa.
const PHASES = [
  { id: 'rest', cls: 'sofi-blink', label: 'reposo', ms: 1500 },
  { id: 'wipe', cls: 'memory-wipe', label: 'memory-wipe' }, // dura lo que su animación
  { id: 'hold', cls: 'memory-wipe', label: 'sonriendo', ms: 500 }, // la web aún no ha vuelto al reposo
  { id: 'back', cls: 'sofi-blink', label: 'sofi-blink', ms: 3600 }, // sigue la conversación
];
const HOLDS = [0, 500, 1500];

const CSS = `
.mw-scene { justify-self: stretch; display: grid; justify-items: center; gap: 10px; width: 100%; padding: 8px 0; }
.mw-scene > .sprite { width: min(var(--size), 100%); }
.mw-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; font-size: 13px; color: var(--muted); }
.mw-controls select { font: inherit; color: var(--text); background: var(--surface); border: 1px solid var(--border);
  border-radius: 999px; padding: 4px 8px; }
.mw-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.mw-chips span { font-size: 12px; padding: 3px 9px; border: 1px solid var(--border); border-radius: 999px; }
.mw-chips span.on { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
`;

export default function mount({ stage, body }) {
  if (!document.getElementById('mw-style')) {
    document.head.append(Object.assign(document.createElement('style'), { id: 'mw-style', textContent: CSS }));
  }
  stage.innerHTML = '<div class="mw-scene"><div class="sprite" role="img" aria-label="Sofi"></div></div>';
  body.insertAdjacentHTML(
    'beforeend',
    `<div class="mw-controls">
      <div class="mw-chips">${PHASES.map((p) => `<span data-phase="${p.id}">${p.label}</span>`).join('')}</div>
      <label>Espera antes de volver al reposo <select data-act="hold">${HOLDS.map((ms) => `<option value="${ms}"${ms === 500 ? ' selected' : ''}>${(ms / 1000).toLocaleString('es')} s</option>`).join('')}</select></label>
      <button type="button" class="btn" data-act="replay">Otra vez</button>
    </div>
    <p class="note">Memory-wipe empieza en el reposo de sofi-blink y acaba en ese mismo reposo con una sonrisa: al entrar
      no salta nada y al volver a sofi-blink solo cambia la boca.</p>`,
  );

  const host = stage.querySelector('.sprite');
  const chips = [...body.querySelectorAll('[data-phase]')];
  let rate = 1;
  let paused = false;
  let timer = null; // la espera en curso
  let run = 0; // cada vuelta invalida las esperas de la anterior

  const animations = () => [...host.getAnimations({ subtree: true }), ...(timer ? [timer] : [])];
  // Las animaciones CSS nacen con cada clase: se les aplica la velocidad y la pausa del playground. play() solo en las
  // pausadas: en una ya acabada (memory-wipe, que se queda en su final) la volvería a empezar.
  const sync = () => {
    for (const a of animations()) {
      a.playbackRate = rate;
      if (paused) a.pause();
      else if (a.playState === 'paused') a.play();
    }
  };
  const wait = async (ms) => {
    timer = stage.animate([], { duration: ms });
    sync();
    try {
      await timer.finished;
      return true;
    } catch {
      return false; // cancelada al reiniciar
    }
  };

  const loop = async () => {
    const mine = ++run;
    timer?.cancel();
    for (;;) {
      for (const phase of PHASES) {
        if (mine !== run) return;
        for (const c of chips) c.classList.toggle('on', c.dataset.phase === phase.id);
        if (phase.cls && !host.classList.contains(phase.cls)) host.className = `sprite ${phase.cls}`;
        sync();
        const main = phase.id === 'wipe' ? host.getAnimations().find((a) => a.animationName === 'memory-wipe') : null;
        let done;
        if (main) {
          try {
            await main.finished;
            done = true;
          } catch {
            done = false;
          }
        } else {
          // con «reducir movimiento» memory-wipe no tiene animación: se queda fija lo que duraría
          done = await wait(phase.ms ?? 6500);
        }
        if (!done || mine !== run) return;
      }
    }
  };

  body.addEventListener('change', (e) => {
    if (e.target.dataset.act === 'hold') PHASES.find((p) => p.id === 'hold').ms = Number(e.target.value);
  });
  body.addEventListener('click', (e) => {
    if (e.target.closest('[data-act="replay"]')) restart();
  });

  const restart = () => {
    host.className = 'sprite';
    loop();
  };
  restart();

  return {
    setRate(next) {
      rate = next;
      sync();
    },
    pause() {
      paused = true;
      sync();
    },
    resume() {
      paused = false;
      sync();
    },
    restart,
  };
}
