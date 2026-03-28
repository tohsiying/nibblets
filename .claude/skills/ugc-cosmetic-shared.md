# UGC Cosmetic Ad — Shared Phases

This file contains all shared phases for cosmetic UGC ad variants. It is NOT invoked directly.
Variant skills (ugc-cosmetic-phone, ugc-cosmetic-unboxing, etc.) handle Phase 3 and Phase 6, then delegate everything else here.

---

## Phase 1: Gather Inputs

Only a product image is required. Infer everything else.

From the product image, extract or infer:
- **Product name** — read from packaging/label. If unclear, describe the product type (e.g. "vitamin C serum")
- **Brand** — read from packaging. If unclear, use "the brand"
- **Product category** — serum, moisturiser, cleanser, SPF, eye cream, lip product, foundation, blush, etc.
- **Key benefit** — infer from category + any visible claims on packaging (glow, hydration, anti-aging, brightening, etc.)
- **Target audience** — women. Narrow by product positioning: luxury vs. accessible, age-skewing young vs. mature, etc.
- **CTA** — default: "Link in bio"
- **Product type** — cosmetics are always **Handheld**: small enough to hold on camera, label visible

Do NOT ask the user for any of this. Infer confidently and present your assumptions in Phase 2 for confirmation.

**Gate:** Do not proceed without at least 1 product image.

---

## Phase 2: Product Analysis & Creator Persona

### Product Analysis
- What exactly is this product? (category, format — e.g. "30ml glass dropper bottle vitamin C serum")
- What is the primary benefit/claim?
- Who is the buyer? (age range, skin concern, lifestyle, price sensitivity)
- What are the 2-3 most visually compelling features? (packaging, texture, colour, applicator)
- What emotional desire does it fulfil? (glow, confidence, self-care ritual, looking younger)

### Creator Persona Design

Design ONE specific creator matched to the product's target buyer. She should look like the customer, not a model.

Define:
- **Age**: specific (e.g. "29-year-old")
- **Ethnicity/skin tone**: specific (e.g. "South Asian woman, warm medium-deep skin tone")
- **Hair**: color, length, style
- **Skin**: relevant to the product (e.g. "visible pores, slight redness — the skin concern this product targets")
- **Outfit**: casual and authentic to setting (not styled, not polished)
- **Setting**: home environment — bedroom, bathroom vanity, kitchen counter. Warm, lived-in, real.
- **Personality and speech**: 1-2 adjectives plus how she talks (e.g. "warm and dry — talks like she's texting a friend, not performing")
- **Camera style**: handheld selfie, slightly below eye level or straight-on

**Character Lock String** — one dense paragraph including personality and speech style, copy-pasted verbatim into EVERY Veo prompt. The voice Veo generates will be inferred from this description, so be specific about how she speaks.

Example:
> "29-year-old South Asian woman, warm medium-deep skin tone, long dark hair loosely tied back. Minimal makeup. Wearing an oversized cream hoodie. Sitting at a bathroom vanity, soft natural light, product bottles visible on shelf behind her. Handheld selfie angle, straight-on. Warm and dry energy, talks like she is texting a friend a recommendation, conversational not performative, calm delivery with occasional self-deprecating humour."

### Present & Gate

Show the user:
1. What you inferred about the product
2. The creator persona + Character Lock String

Get confirmation before proceeding. If anything is wrong, correct it before moving on — this string anchors every clip including the voice.

---

## Phase 4: Project Setup

```bash
baz project create --name "[ProductName] UGC - [Variant] - [Date]" --json
export BAZ_PROJECT_ID=<id>

baz context add "Create a UGC-style cosmetic product ad for [ProductName] by [Brand]. Audience: [audience]. Goal: viewer clicks link in bio. Authentic, raw, not polished. Portrait 9:16, 1080x1920." --label "goal"
baz context add "Creator persona: [CHARACTER LOCK STRING]" --label "requirement"
baz context add "Format: portrait 9:16, 1080x1920, 1080p" --label "requirement"
baz context add "Brand: [Brand]. Product: [ProductName]. Visual: [brief product description — shape, colour, packaging]." --label "brand"
baz context add "CHARACTER CONSISTENCY: All clips feature the SAME creator. Pass ANCHOR_URL as image input to every Veo call. The Character Lock String must be copy-pasted verbatim into every prompt — never paraphrased." --label "instructions"
```

---

## Phase 5: Upload Product Image & Generate Anchor Portrait

### Step 1: Upload product image

```bash
baz media upload /path/to/product.jpg --json
# Note the returned URL as PRODUCT_URL
```

### Step 2: Generate anchor portrait

The anchor portrait is the **single source of truth** for character and product appearance. Every Veo clip prompt will say "preserve the person and product from this image exactly, change only the background." Get it right here — it is far cheaper to fix than after video generation.

```bash
baz prompt "Generate a photorealistic portrait image. This will be used as a character and product reference for a series of video clips — accuracy is critical.

CHARACTER: [CHARACTER LOCK STRING VERBATIM]

She is holding the product at chest height with one hand, label visible and facing directly toward camera, clearly legible. Her other hand is relaxed at her side or holding her phone. Natural expression — like she just hit record. Not posed. Not a model. Visible skin texture, slight pores, natural under-eye, no airbrushing. Looks like a real person, not a beauty campaign.

Product reference: [PRODUCT_URL]
The product must match this reference exactly — same packaging shape, colour, and label.

Style: iPhone selfie quality, natural warm light, shallow depth of field. Raw, authentic. NOT studio. NOT stock photo. 1080x1920 portrait." --stream-json
```

Note returned URL as `ANCHOR_URL`.

### Step 3: Review

Show the anchor URL to the user. Ask them to confirm:
- Does the person look right?
- Is the product clearly visible and accurate?

**Do not generate any clips until both are approved.** Each Veo clip will use this as the "preserve exactly, change only the background" reference image.

---

## Phase 7: Assemble Timeline

After generating all clips, assemble sequentially with explicit start positions. Then verify order immediately.

```bash
baz prompt "Assemble [N] UGC video clips onto the timeline sequentially on track 0, no gaps.

Clip 1 ([label]): [CLIP_1_URL]
Clip 2 ([label]): [CLIP_2_URL]
Clip 3 ([label]): [CLIP_3_URL]

Place in this exact order with explicit start times: Clip 1 at frame 0, Clip 2 immediately after Clip 1, Clip 3 immediately after Clip 2. Portrait 9:16." --stream-json
```

After assembly, run:
```bash
baz review --summary --json
```

Verify clip order matches intended sequence. If out of order, reorder using `baz scenes positions` before exporting.

---

## Phase 9: Review & Validate

```bash
baz project validate --json
baz verify --criteria "duration<=30s,portrait" --json
```

Check:
- All clips on track 0 in correct order, no gaps
- Portrait format
- No validation errors

**Gate:** Fix any errors before exporting.

---

## Phase 10: Export (only if user requests)

```bash
baz export start --wait --json
```

Share the rendered video URL.

---

## Character Consistency — Troubleshooting

**Creator looks different between clips**
The core pattern: anchor image = ground truth. Every clip prompt must have ANCHOR_URL at the top as a required image input, plus the Character Lock String verbatim. If you only include one without the other, Veo may drift.

Checklist:
- ANCHOR_URL at the very top of every clip prompt, labeled as required image input
- Character Lock String copy-pasted verbatim (not paraphrased)
- Prompt explicitly says "preserve face, hair, skin tone, outfit EXACTLY from reference image, change ONLY the background"

If still drifting: regenerate the clip and add "The person must be a perfect match to the reference image [ANCHOR_URL]. Identical face, identical hair, identical skin tone, identical outfit. Any deviation is wrong."

**Product looks different between clips**
- PRODUCT_URL must be passed as an image input in every clip prompt
- State placement explicitly: "product held at chest height, label facing camera, clearly legible"
- If product drifts: describe it in more detail in the prompt — shape, colour, label text, material

**Voice sounds different between clips**
- The Character Lock String defines the voice — ensure it includes personality and speech style, not just appearance
- If it drifts, the Character Lock String description of personality/speech is probably too vague — make it more specific
