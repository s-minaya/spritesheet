# AGENTS.md

Guía para cualquier agente (o persona) que trabaje en este repositorio. Léela entera antes de crear o modificar una animación.

## Qué es este repo

Spritesheets animados de **Sofi**, el personaje de *Ask Sofi*. Se usan en una página web que mostrará **muchas animaciones a la vez**, así que cada una tiene que ser lo más ligera posible sin perder calidad visual.

Cada animación se compone de:

- una **tira horizontal WebP** que solo contiene fotogramas únicos, y
- un **parcial SCSS** con la temporización.

La usuaria incorpora las animaciones a su web **de una en una**. Cada animación nueva se le entrega como **un zip propio, listo para pegar** (`dist/NNN-nombre.zip`), nunca como una carpeta con todas juntas. Ver [Entrega](#entrega).

Un **playground** local muestra todas las animaciones para revisarlas.

Hay animaciones sencillas, como el parpadeo de `001-sofi-blink`, y las habrá complejas que interactúan con elementos de la página para que parezca que Sofi rompe la cuarta pared. Para las complejas, el usuario especificará en detalle cómo deben hacerse (ver [Animaciones complejas](#animaciones-complejas-cuarta-pared)).

## Prioridades, en este orden

1. **Rendimiento.** Importan el peso de descarga y, sobre todo, la memoria que ocupa la imagen decodificada (`ancho × alto × 4` bytes), porque se acumula con cada animación de la página.
2. **Calidad visual.** Ninguna optimización puede notarse. Si algo se nota, se vuelve atrás.
3. **Las indicaciones del usuario.** Si el usuario especifica algo para una animación, eso manda sobre esta guía.

## Estructura

```
NNN-nombre/              una carpeta por animación, numeradas en orden (001, 002…)
  img/                   fotogramas originales del usuario. No se modifican nunca.
  nombre.webp            tira con los fotogramas únicos
  _nombre.scss           la animación; define la clase .nombre
  nombre.js, nombre.d.ts solo en las complejas: el comportamiento, sin dependencias, y sus tipos
  demo.js                opcional: demo propia para el playground (no se exporta)
scss/_sprite.scss        mixin común sprite.animation(...)
playground/              página de revisión (index.html, playground.js, playground.scss)
scripts/dev.mjs          servidor del playground (compila el SCSS al vuelo)
scripts/export.mjs       genera un zip por animación en dist/, listo para pegar en el proyecto de destino
dist/                    generada por npm run export; está en .gitignore
```

No se guardan en el repo archivos derivados redundantes: ni CSS compilado, ni JSON con tiempos, ni GIF de vista previa. La fuente de verdad es el SCSS, y el playground sustituye a las vistas previas.

## Comandos

```sh
npm install      # solo instala sass
npm run dev      # playground en http://127.0.0.1:5757/
npm run export   # genera dist/NNN-nombre.zip: un zip por animación, listo para pegar en la web
```

El puerto 5173 lo usa otro proyecto del usuario. Si el 5757 está ocupado, el servidor prueba los siguientes y muestra en consola la URL que ha usado.

## Flujo para una animación nueva

1. Crea `NNN-nombre/` con el siguiente número libre. Los originales van en `img/`.
2. **Analiza antes de procesar**: tamaño y modo de color, histograma de alfa, motas sueltas, alineación entre fotogramas y un mapa de diferencias que muestre qué cambia de verdad de un fotograma a otro. Mira las imágenes, no te fíes solo de los números.
3. Procesa los fotogramas siguiendo el [pipeline](#pipeline-de-imagen).
4. Escribe `nombre.webp` y `_nombre.scss`.
5. Revísala en el playground (ver [Playground](#playground)).
6. **Ejecuta `npm run export`**. Genera `dist/NNN-nombre.zip`, el paquete de la animación (ver [Entrega](#entrega)).
7. Informa al usuario con cifras (fotogramas, duración, KB de descarga y MB de memoria). Indícale la ruta del zip y cómo incorporarlo.

## Pipeline de imagen

### Cómo son los originales

Son pixel art creados por la usuaria, pero modificados con IA, de 1254×1254 RGBA. Tienen varias particularidades:

- **La rejilla de píxeles es irregular**: cada "píxel" mide entre ~7 y ~15 px. Por eso no se pueden reducir a una resolución nativa exacta.
- **El alfa está sucio**: el cuerpo tiene alfa 250–254 en vez de 255, y hay motas casi invisibles (alfa ≤ 10) alrededor de la figura.
- **Los fotogramas no son idénticos fuera de la parte que se mueve**: pelo, ropa y bordes cambian un poco de uno a otro. Si se animan tal cual, la silueta tiembla.

Comprueba si cada animación nueva cumple estas características, porque puede cambiar.

### Consistencia artística y fidelidad al pixel art

Cada animación debe mantener un estilo visual coherente entre
todos sus fotogramas.

- **Referencia maestra:** identifica el fotograma de referencia
  artística de cada animación (por defecto, el de reposo).
  Úsalo para comparar proporciones, rasgos, contornos,
  colores y nivel de detalle.

- **Pixel art, no pixelado:** conserva el tamaño visual de los
  píxeles, los contornos escalonados y las agrupaciones de
  color de la referencia. No impongas una rejilla uniforme
  si los originales tienen píxeles irregulares.

- **Rostro:** presta especial atención a ojos, pupilas,
  pestañas, cejas y boca. Sus proporciones y estilo deben
  ser coherentes, respetando las expresiones intencionadas.

- **Pelo:** mantiene la estructura de mechones, los
  contornos y el sombreado de la referencia. Permite
  movimientos intencionados sin introducir cambios
  accidentales en el diseño.

- **Resto del personaje:** comprueba ropa, accesorios,
  manos y objetos compartidos entre fotogramas.

- **Correcciones automáticas:** limita las correcciones
  automáticas a cambios verificables que no alteren
  el diseño. Sigue el pipeline existente.

- **Prohibido:** aplicar filtros globales de pixelado,
  posterización agresiva, suavizado o reconstrucción
  artística sin comprobar el resultado visualmente.

- **Correcciones artísticas:** si los ojos, el pelo, la boca
  o las proporciones requieren redibujarse, informa al
  usuario. No improvises cambios anatómicos ni sustituyas
  los originales.

- **Validación:** compara los fotogramas con la referencia
  maestra, a tamaño de visualización y con zoom usando
  nearest-neighbor. Revisa especialmente rostro, pelo,
  contornos y transiciones.

- **Resultado:** ninguna corrección debe introducir
  saltos visuales, pérdida de expresividad ni desviaciones
  perceptibles del estilo original.

### Pasos

Herramienta de referencia: Node + [sharp](https://sharp.pixelplumbing.com/). Los scripts de procesado **no** están en el repo. No añadas dependencias pesadas al `package.json` sin preguntar.

1. **Estabilizar.** Usa el fotograma de reposo como base. De los demás, toma solo la región que debe cambiar:
   - píxeles con diferencia > 40 (máximo por canal) respecto a la base, dentro de un área de interés alrededor de la parte móvil;
   - cierre morfológico de ~14 px, dilatación de ~10 px y difuminado del borde de ~6 px;
   - mezcla con alfa premultiplicado.

   Fuera de esa región, todos los fotogramas deben quedar **idénticos byte a byte**. Comprueba con zoom que no hay costuras.
2. **Limpiar el alfa.** Alfa ≥ 232 pasa a 255. Alfa ≤ 24 pasa a 0, con el RGB también a 0. Elimina las islas que no estén conectadas al cuerpo.
3. **Reducir sin recortar.** Haz una media por área con alfa premultiplicado sobre el **lienzo completo**. No se recorta nunca: si hiciera falta igualar tamaños, se añade relleno transparente. Así todas las animaciones de Sofi comparten encuadre y escala, y se puede pasar de una a otra sin saltos.
   - Tamaño de fotograma de Sofi: **384×384**. No lo cambies para una sola animación sin que lo pida el usuario.
   - Después de reducir: alfa ≥ 245 pasa a 255, y alfa ≤ 8 pasa a 0.
4. **Usar solo fotogramas únicos.** La tira contiene cada fotograma distinto una sola vez, en orden de primera aparición. El fotograma 0 es la pose de reposo. **Nunca repitas fotogramas para marcar tiempos**: los tiempos van en el SCSS. Como referencia, la primera versión del parpadeo repetía fotogramas hasta 42 y ocupaba ~24 MB en memoria; con solo los 3 únicos ocupa 1,7 MB.
5. **Reducir la paleta.** Usa una paleta compartida por todos los fotogramas de la tira, de **64 colores**, calculada con k-means ponderado por el uso de cada color. Así un mismo color se convierte igual en todos los fotogramas.
   - Ojo: la opción `colours` de sharp se ignora si la imagen ya tiene 256 colores o menos. Haz la reducción tú.
   - Compara con zoom (cara, ojos, brillos pequeños y los fotogramas con los ojos cerrados). Si se nota la diferencia, sube a 96 o 128 colores.
6. **Codificar** en WebP **sin pérdida** (`lossless`, effort 6). No uses compresión con pérdida: deja artefactos visibles en el pixel art.
7. **Verificar.**
   - Las zonas que no se mueven son idénticas en todos los fotogramas.
   - El ancho de la tira no supera 16384 px (límite habitual de textura en GPU y móviles).
   - Calcula el peso y la memoria.

Referencia de `001-sofi-blink`: 3 fotogramas de 384² → 1152×384, **16,3 KB** de descarga y **1,7 MB** en memoria. Si una animación nueva cuesta bastante más por fotograma, explica el motivo.

## SCSS

Cada parcial sigue este patrón:

```scss
@use 'sprite';

// Qué hace la animación. Fotogramas: 0 reposo · 1 … · 2 …
.nombre {
  @include sprite.animation(
    $name: nombre,
    $image: url('nombre.webp'),   // relativa al parcial
    $frames: 3,
    $size: 384 384,
    $timeline: (0 1800, 1 100, 2 100, 1 100),   // pares (fotograma ms); fotogramas desde 0
  );
}
```

- La clase se llama igual que el parcial (`_nombre.scss` → `.nombre`).
- Comenta qué representa cada fotograma.
- El mixin genera:
  - `aspect-ratio`;
  - el fondo con la tira;
  - la animación `step-end` sobre `background-position-x`;
  - `animation: none` cuando el usuario tiene activado `prefers-reduced-motion`;
  - la propiedad `--sprite-frames`, que usa el playground.
- Si cambias `scss/_sprite.scss`, comprueba que las animaciones existentes siguen compilando **exactamente al mismo CSS**, salvo que el cambio sea intencionado. Cada zip lleva la versión actual y, al pegarlo, sustituye la que ya hay en la web, así que tiene que seguir sirviendo a todas las animaciones anteriores.
- Para sincronizar otras animaciones con la del sprite (giros, efectos en `::before`/`::after`), usa `sprite.duration($timeline)`. Si después del mixin declaras otro `animation:` con más animaciones, ponlo dentro de `@media (prefers-reduced-motion: no-preference)`: Sass lo emite detrás del `animation: none` del mixin y lo anularía. Ejemplo: `003-rolling`.

### Temporización

- El fotograma 0 (reposo) es el que se ve al cargar y cuando está activado `prefers-reduced-motion`. Elígelo bien.
- Evita los bucles mecánicos y varía el ritmo. El parpadeo, por ejemplo, alterna un parpadeo simple y uno doble:
  - entrecerrar 100 ms, cerrar 100 ms, entrecerrar 100 ms;
  - pausas de 1,4 a 1,8 s entre parpadeos.
- Como no hay que repetir fotogramas, se puede usar cualquier duración en milisegundos. No hace falta ceñirse a una cadencia fija de fps.

## Rendimiento: reglas

- Usa solo fotogramas únicos, una paleta compartida y WebP sin pérdida.
- Los bucles sencillos se hacen **solo con CSS** (`background-position` con `step-end`), sin temporizadores en JS.
- Si algo se desplaza por la página, anima `transform` y `opacity`, que van por el compositor. No animes `top`, `left`, `width`, `height` ni nada que provoque recálculo de layout.
- Si hace falta JS:
  - usa `requestAnimationFrame`;
  - mide posiciones solo cuando cambien (`ResizeObserver`, `resize`, `scroll` con throttling), no en cada fotograma;
  - pausa cuando la animación no se vea (`IntersectionObserver`) y cuando la pestaña esté oculta (`visibilitychange`).
- Respeta siempre `prefers-reduced-motion` y ofrece una alternativa estática.
- No hagas las imágenes más grandes de lo que se van a mostrar.

## Playground

- `npm run dev` y abre la URL que muestra la consola.
- Detecta solo cada `NNN-*/_*.scss`. Cada clase de primer nivel que declare `animation` aparece como una tarjeta. Si hay un error de compilación, sale como tarjeta de error.
- El servidor compila `x.css` a partir de `_x.scss` cuando se pide, así que no hay CSS compilado en disco. La página se recarga al guardar cualquier archivo.
- El playground controla la animación CSS real con la Web Animations API (`getAnimations()`). Desde ahí puedes pausar, cambiar la velocidad, arrastrar la línea de tiempo y ver las miniaturas con lo que dura cada fotograma. Controla a la vez todas las animaciones de la pieza, también las de `::before`/`::after` (`getAnimations({ subtree: true })`), y el resumen de memoria suma todas las imágenes que declara el SCSS.
- **Toda animación debe verse y funcionar en el playground antes de darla por terminada.** Comprueba:
  - fondos claro, oscuro y a cuadros;
  - varios tamaños;
  - que no hay errores en la consola;
  - el resumen de KB y MB.
- Si una animación necesita elementos de la página (por ejemplo, una interacción con la cuarta pared), amplía el playground para reproducirlos. Hazlo de forma **genérica**, por ejemplo con una demo propia dentro de la carpeta de la animación que el playground cargue. No metas casos especiales en `playground.js`.
  - Ya existe: si la carpeta tiene `demo.js`, el playground lo monta en una tarjeta propia a todo el ancho. Exporta por defecto `mount({ stage, body, entry })`; `stage` recibe el fondo y `--size` del playground (con la clase `sprite`, también el pixelado) y `body` es para sus controles. Puede devolver `{ setRate, pause, resume, restart }` para seguir los controles de arriba. Ejemplo: `006-poking/demo.js`.
- Para capturas automáticas: `--screenshot` de Chrome o Edge en modo headless se queda colgado por la conexión SSE de la recarga en vivo. Usa `puppeteer-core` con el navegador instalado. No cierres procesos del navegador de forma masiva, porque puedes cerrar el navegador del usuario.
- Antes de aprobar una animación nueva, compara sus
  fotogramas con la referencia artística en una vista
  conjunta. Señala posibles desviaciones de estilo y
  distingue las que puedan corregirse automáticamente
  de las que requieran intervención artística.

- No des por validada una corrección solo porque mejoren
  sus métricas: comprueba siempre el resultado visual.

## Entrega

La usuaria incorpora cada animación por separado. `npm run export` genera en `dist/` un zip por animación, `NNN-nombre.zip`, y ese zip es lo que se le entrega:

- Contiene una carpeta `sprites/` con `_sprite.scss` (el mixin común), el parcial y las imágenes que declara su SCSS. No lleva nada de otras animaciones ni un `_index.scss` que las importe todas.
- Se pega tal cual sobre la carpeta `sprites/` del proyecto de destino (en la web de Ask Sofi, `src/styles/sprites/`). Solo reemplaza `_sprite.scss` y no toca las animaciones ya incorporadas.
- No prepares carpetas ni paquetes con varias animaciones salvo que la usuaria lo pida.
- Todas las animaciones comparten esa carpeta, así que los archivos de cada una empiezan por su nombre (`rolling.webp`, `rolling-fx.webp`). El script lo exige y comprueba que cada paquete compila solo.
- En el destino, cada componente importa su parcial con ruta relativa: `@use '../../styles/sprites/rolling';`. Vite solo reescribe la ruta del `url()` si el parcial se importa así; si lo encuentra por `loadPaths`, deja la URL tal cual y la imagen no carga (comprobado con Vite 8). Con CSS Modules, la clase se usa como `styles.rolling`. Con otro bundler puede que haya que ajustar la ruta.
- Si una animación necesita más archivos (por ejemplo JS en las animaciones complejas), amplía `scripts/export.mjs` para que entren en su zip.
  - El JS con el prefijo del parcial (`nombre.js`, `nombre-*.js`) y sus tipos (`nombre.d.ts`) ya entran solos, y se comprueba que el JS se analiza; `demo.js` no entra. La web es TypeScript estricto sin `allowJs`: todo JS que se entregue necesita su `.d.ts`.
  - Con CSS Modules solo se renombran las clases: los elementos que cree el JS se marcan con atributos (`data-*`), no con clases.

## Animaciones complejas (cuarta pared)

Habrá animaciones en las que Sofi interactúa con elementos de la página. Para estas:

- **El usuario dará una especificación detallada. Síguela al pie de la letra.** Si algo es ambiguo o choca con esta guía, pregunta antes de implementarlo. No inventes comportamientos.
- El rendimiento sigue siendo la prioridad: aplica las [reglas de rendimiento](#rendimiento-reglas).
- **No rompas la página que la contiene:**
  - no cambies su layout (usa capas superpuestas o `transform`);
  - no bloquees clics (`pointer-events: none` en las capas decorativas);
  - no robes el foco;
  - no tapes contenido de forma permanente.
- Mantén el encuadre y la escala del resto de animaciones de Sofi para que las transiciones entre animaciones no den saltos.
- Mientras el usuario no indique su framework, entrega código sin dependencias (SCSS más JS estándar si hace falta).

## Comunicación

- El usuario escribe en español. Responde en español y escribe los comentarios del código en español, como el código existente.
- Cuando entregues una animación, resume qué has hecho y cualquier decisión que el usuario deba conocer, con cifras: KB, MB, fotogramas y duración, y la ruta de su zip.
