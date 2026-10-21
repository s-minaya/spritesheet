// Demo de 012-eureka para el playground (no se exporta): el paso de «pensando» a «explicando» como en la web. Sofi
// procesa (sofi-blink), le llega la idea (eureka, una sola pasada) y se pone a hablar (talking); y vuelta a empezar.
// Sirve para ver que al acabar eureka y pasar a talking solo cambia la boca. El playground le pasa velocidad, pausa y
// reinicio. Los tiempos de espera son animaciones vacías de la Web Animations API: siguen la velocidad y la pausa.
const PHASES = [
  { id: 'processing', cls: 'sofi-blink', label: 'procesando', ms: 1500 },
  { id: 'eureka', cls: 'eureka', label: 'eureka' }, // dura lo que su animación
  { id: 'hold', cls: 'eureka', label: 'lista', ms: 500 }, // la web aún no ha empezado a hablar
  { id: 'talking', cls: 'talking', label: 'talking', ms: 6410 }, // una vuelta de talking
];
const HOLDS = [0, 500, 1500];

const CSS = `
.eu-scene { justify-self: stretch; display: grid; justify-items: center; gap: 10px; width: 100%; padding: 8px 0; }
.eu-scene > .sprite { width: min(var(--size), 100%); }
.eu-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; font-size: 13px; color: var(--muted); }
.eu-controls select { font: inherit; color: var(--text); background: var(--surface); border: 1px solid var(--border);
  border-radius: 999px; padding: 4px 8px; }
.eu-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.eu-chips span { font-size: 12px; padding: 3px 9px; border: 1px solid var(--border); border-radius: 999px; }
.eu-chips span.on { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
`;

export default function mount({ stage, body }) {
  if (!document.getElementById('eu-style')) {
    document.head.append(Object.assign(document.createElement('style'), { id: 'eu-style', textContent: CSS }));
  }
  stage.innerHTML = '<div class="eu-scene"><div class="sprite" role="img" aria-label="Sofi"></div></div>';
  body.insertAdjacentHTML(
    'beforeend',
    `<div class="eu-controls">
      <div class="eu-chips">${PHASES.map((p) => `<span data-phase="${p.id}">${p.label}</span>`).join('')}</div>
      <label>Espera antes de hablar <select data-act="hold">${HOLDS.map((ms) => `<option value="${ms}"${ms === 500 ? ' selected' : ''}>${(ms / 1000).toLocaleString('es')} s</option>`).join('')}</select></label>
      <button type="button" class="btn" data-act="replay">Otra vez</button>
    </div>
    <p class="note">Eureka acaba en su fotograma 2, que fuera de la boca es el fotograma 0 de talking: al cambiar de clase solo
      cambia la boca. Al entrar en eureka desde el reposo sí cambia la pose (empieza pensando, con el dedo en la barbilla).</p>`,
  );

  const host = stage.querySelector('.sprite');
  const chips = [...body.querySelectorAll('[data-phase]')];
  let rate = 1;
  let paused = false;
  let timer = null; // la espera en curso
  let run = 0; // cada vuelta invalida las esperas de la anterior

  const animations = () => [...host.getAnimations({ subtree: true }), ...(timer ? [timer] : [])];
  // Las animaciones CSS nacen con cada clase: se les aplica la velocidad y la pausa del playground. play() solo en las
  // pausadas: en una ya acabada (eureka, que se queda en su final) la volvería a empezar.
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
        const main = phase.id === 'eureka' ? host.getAnimations().find((a) => a.animationName === 'eureka') : null;
        let done;
        if (main) {
          try {
            await main.finished;
            done = true;
          } catch {
            done = false;
          }
        } else {
          // con «reducir movimiento» eureka no tiene animación: se queda fija lo que duraría
          done = await wait(phase.ms ?? 3000);
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
