# Stop Poking Me — Interactive Animation Brief

## Purpose
Build **Stop Poking Me!**, a playful **interaction-driven** reaction for Sofi in Ask Sofi. The user deliberately clicks/taps Sofi repeatedly; **each new interaction escalates her annoyance** until she hides below her real UI container and cautiously peeks back out.

**Important:** The spritesheet contains the artwork, **not the behavior**. This is **not** a six-frame autoplay loop: a controller in React (or a reusable equivalent) chooses which sprite/state to render based on the user's interactions.

## Definitive reaction sequence
Start from the existing neutral Sofi pose (reuse from `sofi blink` where useful).

Visual state | Character beat |
--- | --- |
| 1st poke | `poking-01` — curious | Side glance, small “o” mouth. Optional independent `?` overlay. “Hm?” |
| 2nd poke | `poking-02` — skeptical | More pronounced side-eye. “Can I help you?” |
| 3rd poke | `poking-03` — stop | Annoyed, raised palm. Independent anger-vein overlay. “PERSONAL SPACE!” |
| 4th poke | `poking-04` — offended | Arms crossed, thoroughly unimpressed. “I'm literally pixels.” |
| 5th poke | `poking-05` — hide | Ducks beneath the **actual** component edge; hands remain gripping its top. |
| After a short pause | `poking-06` — peek | Cautiously rises and looks around suspiciously. |
| Poke while peeking | Return to hide | Immediate “NOPE!” reaction; hides again before later resetting. |

The agent can refine transitions and timings for better comedy.

## Interaction/controller behavior
- Detect deliberate **clicks/taps on Sofi** (not clicks anywhere on the page). Each should advance **one reaction stage**, not start an automatic loop through every stage.
- Keep a small interaction count/state machine separate from the sprite rendering. A suggested **~10-second inactivity window** resets the escalation to neutral; tune it if another timing feels better.
- The hide → peek transition is timed **after** the fifth poke, without requiring another click. Additional pokes while peeking should trigger the immediate hide response.
- Prevent overlapping animations, timers, or rapid repeated input from corrupting the sequence; transitions should be cancelable/resettable.
- After the gag finishes, restore the neutral/idle character so normal Sofi interactions can resume.
- Support mouse aund touch activation; avoid counting a touch and its synthesized click twice.
- Respect reduced-motion preferences while preserving the same interaction outcomes and meaningful feedback.

If the repository only contains a sprite generator/viewer, implement an **interactive preview/demo or a reusable state-machine API** there. Keep the actual app event binding simple to wire up later; don't pretend the real Ask Sofi DOM already exists.

## Sprite and real-component layering
**The UI edge is real; it must not be drawn into the sprites.** In the last two poses:
- Sofi's body/head should be concealed *behind or below* the actual container edge.
- **Her hands must render in front of and on top of that real edge**, as if physically gripping it.
- Use transparent sprites, consistent registration/alignment, clipping/masking and stacking order, or separate transparent hand overlays/crops if necessary. Choose the cleanest implementation for the actual DOM layout.
- The animation must remain convincing as the container changes size responsively; avoid hard-coded positions that only work in a single screenshot.

## Independent reusable effects
- `?` and its small marks.
- Anger vein symbol.
- Speech bubbles, motion/pop, and the duck/peek movement can be orchestrated with CSS/React. Don't embed UI containers or captions in the character images.

## Art direction and reuse
Preserve Sofi's established crisp pixel art, bicolor brown/blonde hair, purple eyes, pink sweater, and black-and-white checker choker. Do not blur or smooth sprite edges. Reuse useful material from existing Sofi sheets.

## Creative freedom
The agent has broad freedom over transitions, pacing, sprite packing, metadata, component structure, and effects. Prioritize **reaction to real user input**, character consistency, clear visual staging, and a reusable implementation. No formal acceptance criteria are needed for this standalone repo brief.
