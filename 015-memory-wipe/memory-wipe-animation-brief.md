# Memory wipe animation brief — Ask Sofi

## Purpose
This animation is for Sofi’s **memory wipe / deletion panic** sequence.
The goal is to make it feel dramatic, funny, and very in-character: Sofi realizes something terrible is about to happen, panics, tries to resist it, breaks apart into pixels, and then reappears as if nothing happened.

This should read as a **personality-driven UI moment**, not just a generic error animation.

## Core intent
The sequence should communicate this emotional arc:
1. **Realization / shock** — “what are you doing?” - `memory-wipe-02`
2. **Absolute panic** — “NOT MY LORE!!!” - `memory-wipe-03`
3. **Desperate resistance** — she tries to hold on / save herself. `memory-wipe-04`
4. **Memory wipe / pixel disintegration** — she gets deleted. `memory-wipe-05`
5. **Reset / soft reboot** — she comes back neutral-ish, slightly cute, slightly blank, as if nothing happened. `memory-wipe-06`Please note this image already exist in the repository.

The result should feel:
- expressive,
- comedic,
- readable,
- polished,
- and unmistakably **Sofi**.

## Important implementation idea
This animation should **not rely only on a single baked spritesheet image**.
Some parts are better treated as **separate layers / effects** and animated independently.

The general split is:
- **Character body / face frames** → main sprite sequence.
- **Text / banner effects** → separate asset/layer.
- **Stress / panic FX** → separate assets/layers.
- **Pixel dissolve** → generated/animated effect rather than a giant baked sprite sheet of tiny pieces.

## Existing material you can reuse
You can reuse anything useful from the already generated Sofi material, especially:
- the existing **Sofi blink spritesheet**,
- Sofi’s neutral pose,
- her proportions,
- palette,
- face structure,
- pink sweater,
- bicolor hair,
- choker,
- spacing/alignment conventions,
- and any frame structure that helps keep consistency.

You do **not** need to rebuild things from scratch if reuse gives a better result.

## Memory wipe specific assets / concepts
The memory wipe sequence has already been conceptually split into reusable parts:

### 1) Main character frames
The character should carry the emotional progression of the sequence.
Examples of useful states in the arc:
- sudden shock,
- full panic,
- clinging / resisting,
- disappearing,
- post-wipe reappearance.

### 2) “NOT MY LORE!!!” banner
This should be treated as its **own element**, separate from the character frame.
It can appear as an overlay/layer timed with the panic peak.

### 3) Panic / stress FX
These can also live as separate assets or effect layers, for example:
- sweat drops,
- impact/exclamation bursts,
- zig-zag stress lines.

These should not be permanently baked into every frame if separating them improves reuse and animation flexibility.

### 4) Pixel dissolve
The **pixel dissolve** should be treated as a dedicated effect (`pixel-dissolve`).
Instead of exporting one PNG per square, generate and animate the dissolve using CSS/React (or the equivalent implementation in this repo), keeping the palette restricted so it matches the established pixel-art look.

Use the limited dissolve palette already discussed:
- pinks,
- purples,
- black/dark outline tones,
- white/light accents.

## Recommended animation philosophy
Prioritize:
1. **Consistency with Sofi’s established pixel-art identity**.
2. **Clear storytelling across the full wipe sequence**.
3. **Separation of reusable FX from character frames where useful**.
4. **Smooth staging / timing**.
5. **Easy integration in the separate repository**.

## Creative freedom
You have **full freedom** to produce the best possible result.
There are **no formal acceptance criteria** for this repo task.

You may decide:
- final timing,
- exact number of frames used in the runtime sequence,
- how to loop or trigger the animation,
- whether some frames should hold slightly longer,
- how to combine body frames with separate FX layers,
- whether the wipe plays once or has partial reusable sub-loops,
- and any implementation details needed for a clean final result.

## What matters most
The final effect should feel like:
- **Sofi fighting for her life because her lore is being erased**,
- then getting wiped in a cute but tragic pixel-art way,
- and finally coming back with a lightly reset vibe.

If there is any trade-off, prefer:
- character readability,
- strong comedic timing,
- and a clean layered implementation.
