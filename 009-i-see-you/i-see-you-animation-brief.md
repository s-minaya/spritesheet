# I See You — Animation Brief

## Purpose
This animation is an **easter egg / playful microinteraction** for **Ask Sofi**.

The goal is to make Sofi feel alive and mischievous: she notices the user, quietly follows the cursor with her gaze, and if the user realizes what is happening, she reacts with a small **“oops, you caught me”** moment and then shifts into a **cute troll / giggle** vibe.

This should feel light, funny, and self-aware — never aggressive, creepy, or distracting.

## Core intention
This interaction should communicate:

- **Sofi is watching the user’s movement in a playful way.**
- She is **tracking the mouse with her eyes / expression**.

The final result should feel like a **small, charming easter egg** that rewards attention.

## Important behavioral rule
**Sofi must look toward wherever the user’s mouse/cursor is.**

That is the key behavior.

The implementation can be as simple or as refined as needed, but the final effect should clearly give the impression that:

- the cursor moves,
- Sofi follows it,
- and the user can notice that she is doing it.

## Creative freedom
You have **total creative freedom** to use the available assets however you think works best.

Please use them in whatever way gives the **best final result according to the intention above**.

You may:

- choose how to organize the spritesheet,
- choose timing,
- choose state transitions,
- choose when the “caught” reaction appears,
- choose whether reactions are subtle or slightly more expressive,
- combine base frames and effect assets if that improves the result.

The priority is **expressive quality and clarity of intention**, not strict adherence to a rigid sequence.

## Available assets / emotional beats
We already have the asset set prepared. Use what is useful.

### Base expression groups
There are assets covering these beats:

1. **Neutral / base Sofi**  
   Standard resting pose.

2. **Looking up / gaze tracking**  
   A version where Sofi clearly looks upward. This can be used as part of the cursor-follow behavior, or as a reference for gaze direction.

3. **“Oh, I’ve been caught” reaction**  
   A surprised expression that gives the feeling of:  
   *“Oops, you noticed I was following you.”*

4. **Mischievous / troll smile**  
   Sofi looks playful and pleased with herself.  
   The feeling should be more **cute / teasing** than smug or mean.

5. **Laugh / giggle frame**  
   A more obvious laughing expression, including the more exaggerated cute-laugh version.

### Special effect assets
We also have supporting effect assets that can be layered if useful:

- **surprise / exclamation-style effect** for the “caught” moment,
- **tricky / playful sparkle** for the teasing moment,
- any other existing small decoration that helps reinforce the mood without overloading the screen.

## Recommended interaction logic
This is only a suggested structure — feel free to improve it.

### 1) Idle tracking
Default state: Sofi is present and subtly alive.

- She starts from the neutral pose.
- Her gaze should shift so she appears to **follow the cursor**.
- Keep it playful and subtle.

### 2) User notices / reveal moment
At some point, or under the condition you consider best, Sofi can briefly switch to the **caught** reaction.

This should communicate:

- “Oh.”
- “You noticed.”
- “I wasn’t being subtle, was I?”

The surprise effect asset can be used here.

### 3) Teasing resolution
After the caught moment, Sofi can transition into the **mischievous smile** and optionally the **giggle / laugh** frame.

This should communicate:

- “Yep, I was following you.”
- “Jijiji.”
- “I’m trolling you a little.”

The playful sparkle asset can be used here.

### 4) Return / loop
The interaction can then:

- return to neutral,
- resume tracking,
- or remain in a softer mischievous state briefly before resetting.

## Tone and UX notes
Please keep the overall feel:

- **cute**,
- **playful**,
- **self-aware**,
- **lightweight**,
- and aligned with **Ask Sofi’s personality**.

Avoid making it:

- too noisy,
- too constant,
- too intrusive,
- or visually overwhelming.

