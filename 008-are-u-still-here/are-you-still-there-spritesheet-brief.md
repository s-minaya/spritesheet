# Are You Still Here? — Spritesheet Implementation Brief


## Why this animation exists in Ask Sofi

**Are You Still Here?** is an occasional, quiet *easter egg*, not a regular loading animation:

- If the user has been genuinely inactive for a while, Sofi grows sleepy and eventually nods off.
- While asleep, a separate, gently animated `Zzz` effect may float above her.
- When the user returns, Sofi jolts awake, briefly looks caught off guard, then tries to act innocent and returns to normal.
- The joke is that the supposedly diligent assistant was caught sleeping on the job.

This is distinct from the existing `Stop Poking Me` easter egg (triggered by clicks on Sofi). This one is **idle-driven and interruptible**.

## Definitive supplied artwork

| Source file | Beat | Intended use |
| --- | --- | --- |
| `aush-01.png` | Getting sleepy | First transition from normal/idle |
| `aush-02.png` | Eyes closing, head drooping | Transition toward sleep |
| `aush-03.png` | Fully asleep | Hold / sleeping state |
| `aush-04.png` | Suddenly startled awake | Immediate wake-up beat |
| `aush-05.png` | Guilty, trying to look composed | Recovery beat |
| `aush-zzz.png` | Pink pixel-art `Zzz` | **Independent** sleep overlay |
| `aush-wake-up-sf.png` | Pink/cream pixel-art wake-up burst | **Independent** brief alert overlay |


 Sofi must remain asleep until awakened or canceled by the host application. If the user becomes active before she reaches `aush-03`, the sequence should also be interruptible and able to recover without waiting through the whole sleep animation.

The sleeping `Zzz` should float/pulse subtly; the wake-up burst should appear with the surprise pose.

## Creative freedom
You have **full freedom** to produce the best possible result.
There are **no formal acceptance criteria** for this repo task.
You can **reuse anything useful spritesheet, asset or special effect in this repo**.

