# Sofi Error — Animation Brief

## Context

`sofi-error` is Sofi's reaction to a **recoverable technical failure** in Ask Sofi, such as a temporary connection or processing problem for which the UI offers a retry.

**Not for security alerts or situations where risk could not be evaluated.** Those require a sober presentation. The main app handles error messages, retries, and state changes; this spritesheet only supplies Sofi's visual reaction.

The animation should make the failure feel like a small, unexpected hiccup rather than a serious problem.

## Intended feeling

A **brief, subtle microglitch** catches Sofi off guard. She looks surprised for an instant, then recovers with a slightly embarrassed, cute expression and settles back into her usual calm self.

The microglitch is **part of the animation's identity**, not an optional extra. It should read as a tiny technical hiccup, **not** the dramatic breakdown of `SOFI.EXE`. The result should feel playful and reassuring without suggesting that the error has already been fixed.

No literal dialogue, captions, or UI elements inside the character artwork.

## Existing assets

We already have two new character images created specifically for this animation, plus the existing **Sofi Neutral / Blink** spritesheet.

Each image represents a different emotional moment:

- **Neutral / Blink (existing):** Sofi's usual relaxed appearance. Use it as the natural starting point and to return to her normal state after the reaction. Reuse the existing asset instead of recreating it.
- **error-01 (new image):** Sofi notices something unexpected. Her eyebrows rise, her eyes widen slightly, and her mouth forms a small `o`. This represents a brief, innocent surprise—not fear or panic.
- **error-02 (new image):** Sofi recovers, looking slightly embarrassed. A small awkward smile, a raised eyebrow, and subtle blush suggest she's trying to pretend nothing unusual happened.

These images are the visual material for the animation, not a mandatory frame-by-frame playback order.

## Animation intention

The emotional progression should feel like a brief technical interruption, a surprised reaction, a slightly awkward recovery, and a natural return to Sofi's neutral expression.

**A subtle microglitch is an essential part of this animation.**

It should reinforce the sensation of a momentary technical malfunction without becoming chaotic, aggressive, or visually overwhelming.

The microglitch does not need its own image asset. Choose whichever implementation produces the best result.

Returning to neutral is only a visual recovery; it must not imply that the technical error itself has been resolved.

## Implementation

You have **full creative freedom** over the choreography, frame reuse, transitions, timing, microglitch technique, and overall implementation.

Feel free to reuse other compatible existing assets if they improve the final result, especially `sofi-blink`.

Do not embed dialogue, error messages, or UI elements in the artwork. The Ask Sofi application handles the actual error message and retry functionality.

**Priority:** Create a polished, expressive, lightweight animation that communicates a recoverable technical hiccup while preserving Sofi's personality and crisp pixel-art identity.
