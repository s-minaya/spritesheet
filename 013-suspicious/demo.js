// Demo de 013-suspicious para el playground (no se exporta): la reacción como en la web. Sofi está en reposo (sofi-blink),
// nota el matiz (suspicious, una sola pasada) y se pone a explicarlo (talking); y vuelta a empezar.
// Sirve para ver que al entrar desde el reposo no salta nada y que al acabar y pasar a talking solo cambia la boca. El
// playground le pasa velocidad, pausa y reinicio. Las esperas son animaciones vacías de la Web Animations API: siguen la
// velocidad y la pausa.
const PHASES = [
  { id: 'rest', cls: 'sofi-blink', label: 'reposo', ms: 1500 },
  { id: 'suspicious', cls: 'suspicious', label: 'suspicious' }, // dura lo que su animación
  { id: 'hold', cls: 'suspicious', label: 'lista', ms: 500 }, // la web aún no ha empezado a hablar
  { id: 'talking', cls: 'talking', label: 'talking', ms: 6410 }, // una vuelta de talking
];
const HOLDS = [0, 500, 1500];

const CSS = `
.su-scene { justify-self: stretch; display: grid; justify-items: center; gap: 10px; width: 100%; padding: 8px 0; }
.su-scene > .sprite { width: min(var(--size), 100%); }
.su-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; font-size: 13px; color: var(--muted); }
.su-controls select { font: inherit; color: var(--text); background: var(--surface); border: 1px solid var(--border);
  border-radius: 999px; padding: 4px 8px; }
.su-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.su-chips span { font-size: 12px; padding: 3px 9px; border: 1px solid var(--border); border-radius: 999px; }
.su-chips span.on { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
`;

export default function mount({ stage, body }) {
  if (!document.getElementById('su-style')) {
    document.head.append(Object.assign(document.createElement('style'), { id: 'su-style', textContent: CSS }));
  }
  stage.innerHTML = '<div class="su-scene"><div class="sprite" role="img" aria-label="Sofi"></div></div>';
  body.insertAdjacentHTML(
    'beforeend',
    `<div class="su-controls">
      <div class="su-chips">${PHASES.map((p) => `<span data-phase="${p.id}">${p.label}</span>`).join('')}</div>
      <label>Espera antes de hablar <select data-act="hold">${HOLDS.map((ms) => `<option value="${ms}"${ms === 500 ? ' selected' : ''}>${(ms / 1000).toLocaleString('es')} s</option>`).join('')}</select></label>
      <button type="button" class="btn" data-act="replay">Otra vez</button>
    </div>
    <p class="note">Suspicious empieza en el reposo de sofi-blink y acaba con la cara lista para explicar, que fuera de la
      boca es el fotograma 0 de talking: al entrar no salta nada y al cambiar a talking solo cambia la boca.</p>`,
  );

  const host = stage.querySelector('.sprite');
  const chips = [...body.querySelectorAll('[data-phase]')];
  let rate = 1;
  let paused = false;
  let timer = null; // la espera en curso
  let run = 0; // cada vuelta invalida las esperas de la anterior

  const animations = () => [...host.getAnimations({ subtree: true }), ...(timer ? [timer] : [])];
  // Las animaciones CSS nacen con cada clase: se les aplica la velocidad y la pausa del playground. play() solo en las
  // pausadas: en una ya acabada (suspicious, que se queda en su final) la volvería a empezar.
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
        const main = phase.id === 'suspicious' ? host.getAnimations().find((a) => a.animationName === 'suspicious') : null;
        let done;
        if (main) {
          try {
            await main.finished;
            done = true;
          } catch {
            done = false;
          }
        } else {
          // con «reducir movimiento» suspicious no tiene animación: se queda fija lo que duraría
          done = await wait(phase.ms ?? 3500);
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
