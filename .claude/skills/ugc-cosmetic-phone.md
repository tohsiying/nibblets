# ugc-cosmetic-phone — Cosmetic UGC: Phone Selfie Variant

Creator films herself handheld, talking directly to camera, product in hand. Classic UGC talking head.
Follows ugc-cosmetic-base.md for all phases except Phase 3 and Phase 6.

---

## Phase 3: Script Writing (Phone Selfie)

Write a 4-clip script. Each clip is one continuous Veo shot — no cuts within a clip.

### Clip Structure

**Clip 1 — Hook (6s)**
- Creator appears on screen mid-action (already holding product, already in setting)
- Opens with a strong hook line that stops the scroll
- HIGH energy, genuine excitement, not performative
- Product visible but not the focus yet
- Example hooks: "Okay I need to tell you about this", "Stop scrolling if you have [skin concern]", "This is the [category] product I've been gatekeeping"

**Clip 2 — Problem (6s)**
- Creator speaks to camera about the problem this product solves
- Relatable, "does anyone else..." energy
- Can reference past failed products
- Product may or may not be in frame
- MEDIUM energy, conversational

**Clip 3 — Demo (8s)**
- Creator demonstrates the product — applies it, shows texture, holds it up
- Product MUST be clearly visible, label facing camera
- Speaks about what it does and how it feels
- SATISFIED energy, calm confidence
- This is the longest clip — the money shot

**Clip 4 — CTA (6s)**
- Creator holds product up closer to camera
- Direct call to action: "Link in bio", "Go try this"
- Can add urgency if inventory < 15 or collection is Limited Edition
- DIRECT energy, pointing up or gesturing to bio
- Product fills more of the frame than previous clips

### Script Template

For each clip, write:
- **Visual direction**: What the viewer sees (creator position, product placement, background)
- **Dialogue**: What the creator says (verbatim — this becomes the Veo audio prompt)
- **Energy**: One word (HIGH, MEDIUM, SATISFIED, DIRECT)
- **Duration**: 6s or 8s (must be Veo-compatible: 4, 6, or 8)

### Urgency Signals (from product data)
- `inventory < 15` -> "Only [N] left" in CTA
- `collection == "New Arrivals"` -> "just dropped" in Hook
- `collection == "Limited Edition"` -> exclusivity angle in CTA
- `price > $100` -> quality/investment angle in Problem

---

## Phase 6: Generate Video Clips (Phone Selfie)

Generate 4 Veo clips sequentially. Each clip prompt MUST include:
1. The Character Lock String (verbatim, not paraphrased)
2. ANCHOR_URL as image reference (if available)
3. The specific visual direction and dialogue from Phase 3
4. Duration (6s or 8s)
5. generateAudio: true
6. Portrait 9:16

### Prompt Template per Clip

```
baz prompt "Generate a Veo portrait video clip (9:16, [duration]).

CHARACTER: [CHARACTER LOCK STRING VERBATIM]

REFERENCE: Preserve the person from [ANCHOR_URL] exactly — same face, hair, skin tone, outfit. Change only the action and expression.

SCENE: [Visual direction from script]

DIALOGUE (the creator says this naturally, on camera): '[Dialogue from script]'

Energy: [HIGH/MEDIUM/SATISFIED/DIRECT]. generateAudio: true. Handheld selfie feel, natural lighting." --stream-json --budget 20 --project-id $BAZ_PROJECT_ID
```

### Between clips
After each clip, run:
```bash
baz review --summary --json
```
Check that the new scene was added. If not, retry the prompt.

### After all 4 clips
Run a quick review to confirm all clips exist:
```bash
baz scenes list --json
```
Verify: 4+ scenes on the timeline, all portrait format.
