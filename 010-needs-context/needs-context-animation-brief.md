# Needs More Context — Ask Sofi Animation Brief

## Purpose in Ask Sofi

This animation represents the **`needs_context`** outcome of Ask Sofi's message interpretation flow. Sofi has received a message, but the available information is not sufficient to interpret it responsibly. Instead of guessing, the application asks the user a follow-up question to obtain the missing context.

**This is not an error state.** The experience should feel like a natural continuation of the conversation: Sofi is engaged, attentive, and genuinely interested in learning a little more before responding.

The sprite animation is a **visual reaction**, not the clarification question itself. The application will handle the actual question and user input through its normal interface.

## What the animation must communicate

Sofi should come across as:

- **Curious and receptive**, not confused or clueless.
- **Cute, slightly playful, and a little mischievous**, in keeping with her personality.
- **Thoughtful and confident** that she can help once she has more information.
- **Warm and inviting**, making it comfortable for the user to clarify their message.

The intended emotional beat is a small, knowing request for another clue — **not** a dramatic reaction, a failure, an apology, or an exaggerated thinking/loading gag.

**Do not include literal phrases, dialogue, captions, speech bubbles, or UI copy in the spritesheet.** Expression and motion should carry the meaning on their own.

## Assets and creative freedom

The character artwork and a **separate transparent question-mark effect** have already been created for this interaction. They are source material, **not instructions to draw replacements**. You may use whichever of the supplied images works best, omit redundant ones, or combine them with relevant existing resources in the spritesheet repository.

In particular, you are free to reuse the existing **Sofi blink / neutral animation**, or any other compatible Sofi sprite, to improve continuity and the finished result.

You have **full creative freedom** over the choreography, selection and reuse of images, number of frames used, transitions, timings, holds, looping behavior, sprite layout, and optional effects. **There is intentionally no prescribed frame order or storyboard.** Choose the best result for the emotional intention and the conventions of the repository.

If the question-mark effect is used, keep it **independent of the character artwork** so the application can position, animate, or omit it separately. It should enhance the gesture rather than dominate it.

## Task in this repository

Build the **finished spritesheet/animation asset and any accompanying metadata or preview** using the existing spritesheet repository's tooling and conventions. Inspect what is already implemented and reuse it; do not create a parallel animation framework.

This task **does not** include implementing `needs_context` handling, generating the follow-up question, or wiring the app's React state machine. The main Ask Sofi application will decide when to show this animation, interrupt it, and transition to another state. Make the result easy to integrate and interrupt without blocking the question or imposing artificial delays.

Preserve Sofi's recognizable pixel-art identity: crisp pixels, clean transparency, split dark/blonde hair, purple eyes, pink sweater, and the **choker**. Match the existing scale and visual alignment as closely as practical; avoid smoothing or blur. Respect existing reduced-motion/static-fallback conventions if supported by this repo.

## Priority

**Make requesting additional context feel like Sofi is continuing the conversation — never like the system has failed.** Beyond that, use your own animation judgment to create the most expressive, polished, and natural result possible from the available assets.
