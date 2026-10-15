# Listening / Acknowledging animation brief — Ask Sofi

## Purpose
This animation is for Sofi’s **listening / acknowledging** state in **Ask Sofi**.

Its role is to make Sofi feel present while she is **receiving, processing, or softly acknowledging** what the user has just said. It should bridge the gap between a completely static neutral pose and the more explicit **talking** animation.


The result should feel warm, readable, and expressive, while remaining very light.

---

## Why this exists in Ask Sofi
In Ask Sofi, Sofi is not just a decorative avatar.
She is part of the conversation flow and should visibly react to what is happening in the chat.

This listening / acknowledging animation helps cover moments such as:
- when the user has just sent a message,
- when Sofi is in a soft “receiving / understanding” state,
- when the UI wants to show that Sofi is attentive before she starts speaking,
- when a response or transition needs a **gentle acknowledgment** rather than a bigger emotional gag,
- or when Sofi should react to the user without switching immediately into the full talking loop.

In practice, this is a **supporting conversational state**.
It should feel like a natural in-between animation in the Ask Sofi interaction system.

---

## Relationship with other Sofi animation states
This animation should sit between other already established Sofi states:
- **Neutral / idle** — Sofi at rest.
- **Listening / acknowledging** — Sofi receives and processes what the user is saying.
- **Talking** — Sofi actively “speaks” while the response is being shown.
- Other personality animations (poking, favoriting, memory wipe, etc.) remain separate special cases.

Important: this state should **not compete** with the talking animation.
It should feel quieter, softer, and more restrained.

---

## Definitive frames / emotional beats
Use the already approved/corrected frames as the source of truth.
The exact runtime sequence can be refined, but the emotional beats are:

### F1 — Neutral base
Sofi in her established neutral pose.
This can be reused from the existing neutral / blink material where useful.

### F2 — “I’m listening...”
Sofi tilts her head slightly, softens her gaze, and raises a brow a little.
No strong smile.
The feeling is:
**“Ajá, te escucho...”**

### F3 — Soft acknowledgment / nod transition
A small transition state that helps the animation read as an actual listening / nodding motion.
This should support the movement between attentive listening and clearer acknowledgment.
Keep it subtle.

### F4 — “Got it!”
Sofi raises her head again, looks directly at the user, and gives a sweet, satisfied smile.
Nothing exaggerated.
The feeling is:
**“Vale, entendido.”**

### F5 — “Hmm, fair enough...”
Variant for slightly uncertain or nuanced acknowledgment.
Sofi shifts her mouth a little, lifts one brow, and looks thoughtful but **without judging** the user.
The feeling is:
**“Hmm... eso también vale.”**

These frames do not need to behave as a rigid linear cinematic.
The agent can use them as a small reusable state set.

---

## Implementation goal
Build a lightweight animation/state set that can be used in Ask Sofi when Sofi is:
- listening,
- acknowledging,
- or gently reacting to the user’s input before/around response generation.

The implementation should feel:
- subtle,
- polished,
- readable,
- conversational,
- and unmistakably Sofi.

---

## Expected behavior in the UI
This should **not** necessarily be treated as one fixed autoplay sequence that always runs start-to-finish in the exact same way.

A good implementation may allow the UI to:
- enter a **listening** state,
- hold a subtle attentive pose,
- optionally play a small nod / acknowledgment,
- optionally resolve into either:
  - a gentle “Got it” style reaction,
  - or a more nuanced “fair enough” reaction,
- and then transition cleanly back to neutral or onward into **talking**.

In other words, think of this as a **small conversational animation set**, not only as a single hardcoded loop.

---

## Suggested usage patterns
The agent can choose the final wiring, but these are good default use cases:

### 1) User just sent a message
- Sofi shifts from neutral into **listening**.
- Small attentive hold.
- Short acknowledgment.
- Then either back to neutral or forward into another state.

### 2) The system wants to show “I understand”
- Use the **Got it** variant as a brief, friendly payoff.

### 3) The system wants a softer, more nuanced reaction
- Use the **fair enough** variant instead of a fully cheerful acknowledgment.

### 4) Transition into talking
- Listening state can precede the **talking** animation if the UI wants Sofi to feel more responsive and alive.

---

## Existing material you can reuse
You can reuse anything useful from Sofi’s existing sprite infrastructure, especially:
- the existing **Sofi blink** spritesheet,
- Sofi’s neutral pose,
- the existing **talking** animation conventions,
- palette,
- proportions,
- line style,
- transparent export approach,
- alignment/registration,
- timing helpers,
- and any animation utilities already present in the repository.

Do **not** rebuild from scratch if reuse leads to a cleaner result.

---

This animation should stay visually consistent with the rest of the Ask Sofi sprite work.

---

## Important implementation notes
- Prioritize **subtlety** over exaggerated motion.
- Avoid making the listening state look like a speech loop.
- Avoid turning the “fair enough” frame into judgment or sarcasm.
- Keep transitions smooth and believable.
- The runtime sequence should be easy to integrate with Ask Sofi’s broader avatar state logic.
- If useful, expose the animation as a small set of named states/variants rather than as one single opaque loop.
- Respect reduced-motion preferences if the repository already handles that pattern elsewhere.

---

## Creative freedom
The agent has broad freedom to decide:
- final timing,
- whether the state is a loop, a short sequence, or both,
- how to transition between attentive and acknowledgment frames,
- how to integrate it with the existing avatar controller,
- and any implementation details needed for a clean result.

There is **no need for strict acceptance criteria** here.
The goal is simply to achieve the best implementation for Ask Sofi with the right context and tone.

---

## What matters most
Prioritize:
1. **Correct conversational role inside Ask Sofi**.
2. **Consistency with Sofi’s established sprite identity**.
3. **Readable listening / acknowledgment behavior**.
4. **Smooth integration with neutral and talking states**.
5. **A subtle, polished final result**.

