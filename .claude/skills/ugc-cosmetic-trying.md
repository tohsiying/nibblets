# ugc-cosmetic-trying — Cosmetic UGC: ASMR First Try Variant

Creator films herself actually applying the product for the first time. ASMR-style — sensory, close-up, whisper-soft. Less talking, more showing. The sound of the product IS the content.

**Architecture:** Image generation and video generation use Replicate directly (reliable). Bazaar CLI is used only for project setup, context, timeline assembly, preview, validate, and export — what it's actually designed for.

---

## Phase 3: Script Writing (ASMR First Try)

Write a 3-clip script. This variant is sensory-first — the product experience matters more than words.

### Clip Structure

**Clip 1 — Unbox/Reveal (6s)**
- Close-up of hands opening the product for the first time
- ASMR sounds: packaging crinkle, cap click, pump press
- Whispered or no dialogue — let the sounds sell
- Product packaging clearly visible
- GENTLE energy, curiosity

**Clip 2 — First Application (8s)**
- Creator applies the product to skin (face, lips, hands — depends on product type)
- EXTREME close-up of texture, application, absorption
- Whispered reaction: "oh wow", "the texture is insane", "it just melts in"
- Natural lighting showing skin texture change
- SENSORY energy, genuine discovery

**Clip 3 — Reaction + CTA (6s)**
- Pull back to show creator's face — genuine reaction to the product
- Brief verbal review: "okay this is actually amazing" or "I'm obsessed"
- Hold product up, label visible
- Soft CTA: "link in bio if you want to try"
- WARM energy, satisfied

### Urgency Signals
Same as phone selfie variant — inventory, collection, price signals.

---

## Phase 6: Generate Video Clips (ASMR First Try)

This variant uses close-up, sensory-focused Veo prompts. The key difference from Phone Selfie:
- More close-up shots (hands, skin, product texture)
- Less dialogue, more ambient sound
- ASMR audio aesthetic — whispers, product sounds
- Slower pacing, lingering shots

### Prompt Template per Clip

```
baz prompt "Generate a Veo portrait video clip (9:16, [duration]).

CHARACTER: [CHARACTER LOCK STRING VERBATIM]

SCENE: [Visual direction — emphasize close-up, texture, sensory details]

AUDIO: ASMR aesthetic. [Specific sounds: packaging crinkle / pump press / product spreading on skin]. [Any whispered dialogue]. generateAudio: true.

Style: Extreme close-up where specified. Natural warm lighting. Shallow depth of field. Portrait 9:16." --stream-json --budget 20 --project-id $BAZ_PROJECT_ID
```

### Between clips
Same as phone selfie — review after each clip, scenes list after all clips.
