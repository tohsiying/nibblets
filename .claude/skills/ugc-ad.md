# ugc-ad — UGC Ad Generator

Use this skill when the user wants to create a UGC-style (User Generated Content) product ad video from product images.

**This is a GATED workflow.** Complete each phase in order. Do NOT skip phases.

---

## When to Use

- User provides product image(s) and wants a UGC ad
- User mentions "ugc", "creator ad", "tiktok ad", "influencer ad", or "product video"
- User wants a social media ad that looks authentic/human, not polished/corporate

---

## What This Produces

A ~22-second vertical (9:16) UGC ad with:
- A fictional creator persona tailored to the product
- 6 talking-head video clips — creator speaks each line with lip sync
- Voice generated per clip via **ElevenLabs**, video via **Veed Fabric-1.0** (Replicate)
- Background music
- Assembled timeline, ready to export

---

## Phase 1: Gather Inputs (REQUIRED)

Before touching the CLI, extract:

1. **Product images** — paths to 1-5 product images (required)
2. **Product name** — what is this product called?
3. **Key benefit** — what's the #1 thing it does? (optional — infer from images if not given)
4. **Target audience** — who buys this? (optional — infer from product)
5. **CTA** — default to "Link in bio" if not specified
6. **Creator gender preference** — default to woman if not specified (UGC converts best with relatable women for most CPG products)

**Gate:** Do not proceed until you have at least 1 product image and a product name.

---

## Phase 2: Product Analysis & Creator Persona (REQUIRED)

Analyze the product images and reason through:

### Product Analysis
- What is this product? What category?
- Who is the primary buyer (age range, gender, lifestyle)?
- What pain does it solve or desire does it fulfil?
- What are the top 2-3 visual features worth showing?
- What setting/context does someone use this in?

### Creator Persona Design

Design ONE specific creator. Be precise — vague descriptions produce inconsistent video.

Define:
- **Age**: specific (e.g. "27-year-old")
- **Ethnicity/skin tone**: specific (e.g. "mixed-race woman, warm medium skin tone")
- **Hair**: color, length, style (e.g. "dark brown wavy hair past shoulders")
- **Body type**: brief (e.g. "slim athletic build")
- **Outfit**: specific to setting (e.g. "white ribbed tank top, gold hoop earrings")
- **Setting**: where clip takes place (e.g. "sunny outdoor terrace, Mediterranean feel, warm afternoon light")
- **Personality**: 1-2 adjectives (e.g. "warm, trustworthy" or "funny, direct")
- **Camera style**: handheld selfie angle or slight below-eye-level (most UGC)

**Character Lock String** — write one dense paragraph combining all of the above. This string gets copy-pasted verbatim into EVERY image and video generation prompt. Example:

> "27-year-old mixed-race woman, warm medium skin tone, dark brown wavy hair past shoulders, slim athletic build. Wearing a white ribbed tank top and gold hoop earrings. Sunny outdoor terrace, Mediterranean feel, warm afternoon light, potted plants in soft background blur. Handheld selfie angle, slight below-eye-level. Warm and trustworthy energy."

### Present & Gate

Present the product analysis and creator persona to the user. Get confirmation before proceeding.

---

## Phase 3: Script Writing (REQUIRED)

Write a 6-clip script. Each clip is 3-5 seconds. Total: ~22 seconds.

### Script Structure

| Clip | Name | Duration | Purpose | Energy |
|------|------|----------|---------|--------|
| 1 | Hook | 3s | Stop the scroll. Bold opener. | HIGH — direct eye contact, strong open |
| 2 | Problem | 4s | Relatable pain point the product solves | MEDIUM — slightly animated, knowing look |
| 3 | Discovery | 3s | "Then I found [Product]..." — reveal | WARM — positive surprise |
| 4 | Demo 1 | 5s | Using the product — key feature in action | ENGAGED — showing, demonstrating |
| 5 | Demo 2 | 4s | Result or second benefit | SATISFIED — emotional payoff |
| 6 | CTA | 3s | Direct ask + low-friction action | DIRECT — pointing up or at camera |

### Clip Script Format

For each clip, write:
- **Spoken line** (what the creator says, exactly)
- **Action** (what they're physically doing)
- **Emotion** (expression/energy)

### Hook Patterns (pick the right one for the product)

- Question: "Does anyone else's [problem]...?"
- Bold claim: "I haven't [old behaviour] in [timeframe] and here's why."
- Reaction: "I tried [product] so you don't have to and honestly..."
- Social proof: "My whole [relationship] group is obsessed with this."

### CTA Patterns

- "Link in bio — grab yours before they sell out."
- "I'll leave the link above. You can thank me later."
- "Honestly just get it. Link's up there."

### Present & Gate

Show the full 6-clip script (spoken lines + actions) to the user. Get approval before proceeding.

---

## Phase 4: Project Setup (REQUIRED)

```bash
# Create portrait project
baz project create --name "[ProductName] UGC Ad - [Date]" --format portrait --json

# Set session env (parallel-safe)
export BAZ_PROJECT_ID=<id>

# Set goal
baz context add "Create a ~22-second UGC-style product ad for [ProductName]. Audience: [audience]. Goal: viewer clicks link in bio / downloads / purchases after watching. Authentic, human, not polished. Portrait 9:16." --label "goal"

# Set requirements (one per call)
baz context add "Creator persona: [PASTE FULL CHARACTER LOCK STRING]" --label "requirement"
baz context add "Hook: '[clip 1 spoken line]'" --label "requirement"
baz context add "Problem: '[clip 2 spoken line]'" --label "requirement"
baz context add "Discovery: '[clip 3 spoken line]'" --label "requirement"
baz context add "Demo 1: '[clip 4 spoken line]'" --label "requirement"
baz context add "Demo 2: '[clip 5 spoken line]'" --label "requirement"
baz context add "CTA: '[clip 6 spoken line]'" --label "requirement"
baz context add "Total duration: ~22 seconds. 6 video clips, sequential." --label "requirement"
baz context add "Format: portrait 9:16, 1080x1920" --label "requirement"

# Brand
baz context add "Brand: [ProductName]. Product visual: [brief product description]. No custom brand fonts. Match UGC aesthetic: raw, authentic, handheld." --label "brand"

# Character consistency instructions
baz context add "CHARACTER CONSISTENCY: All 6 clips feature the SAME creator. The anchor portrait image is the ground truth — pass it as the 'image' input to every Veed Fabric-1.0 call. Audio is generated per-clip via ElevenLabs. Voice is embedded in each clip — no separate voiceover track needed." --label "instructions"
```

Verify:
```bash
baz context list --json
```

**Gate:** Do not proceed until context shows goal + creator persona + all 6 clip lines + brand + instructions.

---

## Phase 5: Upload Product Images & Generate Anchor Portrait (REQUIRED)

### Step 1: Upload product images

```bash
# Upload each product image
baz media upload /path/to/product-image-1.jpg --json
# -> { "url": "https://..." }
# Repeat for each image. Note ALL returned URLs.
```

### Step 2: Generate the anchor character portrait

The anchor portrait is the character consistency **ground truth**. Every video clip will reference this image. Get it right before generating any video.

Use `baz prompt` to generate it:

```bash
baz prompt "Generate a photorealistic portrait image of our UGC creator. This is the anchor reference image that will be used to maintain character consistency across all 6 video clips — get the face and styling exactly right.

CHARACTER: [PASTE CHARACTER LOCK STRING VERBATIM]

She is holding the product naturally at chest height, product label visible and facing camera. She is looking directly at camera with a warm, natural smile — not posed, feels like she just hit record.

Product reference image(s): [paste product image URLs]

Style: iPhone selfie quality, natural lighting, shallow depth of field background blur. NOT studio. NOT stock photo. Raw, authentic UGC feel.

Generate this as a high-resolution image asset and save it to the project media library." --stream-json
```

**Note the returned image URL** — this is `ANCHOR_URL`. You will pass it to every single video generation.

### Step 3: Review the anchor portrait

Run `baz preview` if possible, or ask the user to check the anchor image URL before proceeding.

**Gate:** Do not generate any video clips until the anchor portrait looks like the right person. If the face/style is wrong, regenerate with a more specific prompt. This is the cheapest fix — fixing character consistency AFTER video generation is expensive.

---

## Phase 6: Generate 6 Clips — ElevenLabs + Veed Fabric-1.0 (REQUIRED)

Each clip is generated in two steps:
1. **ElevenLabs** — spoken line -> mp3 audio
2. **Veed Fabric-1.0 via Replicate** — anchor portrait + audio -> talking head mp4 with lip sync

Voice is embedded in the video. No separate voiceover track needed.

### Prerequisites

```bash
# Required env vars
export ELEVENLABS_API_KEY=your_key
export REPLICATE_API_TOKEN=your_token

# Required packages (run once)
npm install replicate @elevenlabs/elevenlabs-js
```

### Step 1: Pick an ElevenLabs Voice

Choose a voice matching the creator persona. Recommended for warm, authentic UGC women:

| Voice | Style |
|-------|-------|
| `Charlotte` | Warm, British, conversational |
| `Sarah` | Soft American, friendly |
| `Aria` | Energetic, American |
| `Laura` | Natural, warm |

Browse full library at elevenlabs.io/voice-library. Note the voice ID.

### Step 2: Per-Clip Generation Script

Run this for each clip. Save as `/tmp/generate-clip.mjs` and edit per clip:

```javascript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import Replicate from "replicate";
import { writeFile } from "fs/promises";

const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
const replicate = new Replicate();

const ANCHOR_URL = "[ANCHOR_URL]";   // anchor portrait from Phase 5
const VOICE_ID   = "[VOICE_ID]";     // ElevenLabs voice ID
const CLIP_N     = 1;                // clip number
const SPOKEN_LINE = "[spoken line]"; // exact line from script

// Step 1: Generate audio
const audioStream = await elevenlabs.textToSpeech.convert(VOICE_ID, {
  text: SPOKEN_LINE,
  model_id: "eleven_turbo_v2_5",
  voice_settings: {
    stability: 0.4,        // lower = more expressive
    similarity_boost: 0.8,
    style: 0.3,
    use_speaker_boost: true
  }
});
const chunks = [];
for await (const chunk of audioStream) chunks.push(chunk);
const audioBuffer = Buffer.concat(chunks);
await writeFile(`/tmp/clip-${CLIP_N}-audio.mp3`, audioBuffer);
console.log(`Audio saved: /tmp/clip-${CLIP_N}-audio.mp3`);

// Step 2: Upload audio to baz to get a public URL
// Run: baz media upload /tmp/clip-N-audio.mp3 --json
// Then set AUDIO_URL below and run step 3

const AUDIO_URL = "[paste URL from baz media upload]";

// Step 3: Generate talking head video
const output = await replicate.run("veed/fabric-1.0", {
  input: {
    audio: AUDIO_URL,
    image: ANCHOR_URL
  }
});
await writeFile(`/tmp/clip-${CLIP_N}-video.mp4`, output);
console.log(`Video saved: /tmp/clip-${CLIP_N}-video.mp4`);
// Then: baz media upload /tmp/clip-N-video.mp4 --json -> note CLIP_N_URL
```

### All 6 Clips — Spoken Lines

| Clip | Spoken Line | Duration |
|------|-------------|----------|
| 1 — Hook | [hook line] | 3s |
| 2 — Problem | [problem line] | 4s |
| 3 — Discovery | [discovery line] | 3s |
| 4 — Demo 1 | [demo 1 line] | 5s |
| 5 — Demo 2 | [demo 2 line] | 4s |
| 6 — CTA | [CTA line] | 3s |

### After Each Clip

Upload the output mp4 via `baz media upload` and note the URL:

```
CLIP_1_URL = https://...
CLIP_2_URL = https://...
CLIP_3_URL = https://...
CLIP_4_URL = https://...
CLIP_5_URL = https://...
CLIP_6_URL = https://...
```

### ElevenLabs Tuning

| Setting | Value | Why |
|---------|-------|-----|
| `model_id` | `eleven_turbo_v2_5` | Fast, natural, good for short clips |
| `stability` | 0.3-0.5 | Lower = more expressive and energetic |
| `similarity_boost` | 0.8 | Keeps voice consistent across clips |
| `style` | 0.2-0.4 | Adds personality/delivery energy |

### Fabric-1.0 Troubleshooting

- **Lip sync off**: Audio URL must be publicly accessible — use the baz CDN URL, not a local path
- **Wrong face**: Confirm `image` is `ANCHOR_URL`, not a product image
- **Output too short**: Fabric output duration matches audio length — keep spoken lines under 6s per clip

---

## Phase 7: Assemble Timeline (REQUIRED)

Place all 6 clips sequentially on track 0 using `baz prompt`:

```bash
baz prompt "Assemble the 6 UGC video clips onto the timeline in order. Place them sequentially on track 0 with no gaps.

Clip 1 (Hook, 3s): [CLIP_1_URL]
Clip 2 (Problem, 4s): [CLIP_2_URL]
Clip 3 (Discovery, 3s): [CLIP_3_URL]
Clip 4 (Demo 1, 5s): [CLIP_4_URL]
Clip 5 (Demo 2, 4s): [CLIP_5_URL]
Clip 6 (CTA, 3s): [CLIP_6_URL]

Place them on the timeline sequentially. Total should be ~22s." --stream-json
```

---

## Phase 8: Background Music (REQUIRED)

Voice is already embedded in each clip from Phase 6 — no separate voiceover track needed.

### Background Music

```bash
baz prompt "Generate trending-style background music for a UGC TikTok/Reels ad for [ProductName]. Style: upbeat but not jarring — the kind of background music you'd hear on a viral TikTok (not lo-fi, more energetic). ~22 seconds. Volume 0.15 — very low, voiceover and creator voice must dominate. Add to track 2, frame 0." --stream-json
```

---

## Phase 9: Review & Validate (REQUIRED — never skip)

```bash
baz review --summary --json
baz project validate --json
baz verify --criteria "duration<=25s,scenes>=6,portrait" --json
```

Check:
- All 6 video clips are on track 0
- Voiceover is on track 1
- Music is on track 2
- Total duration is ~22s (allow up to 25s)
- Format is portrait

**Gate:** If validate returns errors, fix before exporting. If clips are out of order, use `baz scenes positions` to reorder.

---

## Phase 10: Export (only if user requests it)

```bash
baz export start --wait --json
```

Share the rendered video URL with the user.

---

## Completion Checklist

You are NOT done until ALL are true:

- [ ] Creator persona confirmed by user
- [ ] Script (all 6 clips) confirmed by user
- [ ] Product images uploaded, URLs noted
- [ ] Anchor character portrait generated and approved
- [ ] ElevenLabs voice selected, VOICE_ID noted
- [ ] 6 audio clips generated via ElevenLabs and uploaded to baz
- [ ] 6 talking head videos generated via Veed Fabric-1.0 (Replicate) and uploaded to baz
- [ ] Clips assembled on timeline sequentially
- [ ] Background music added (track 1)
- [ ] `baz project validate` passes
- [ ] `baz verify --criteria "duration<=25s,scenes>=6,portrait"` passes
- [ ] Export started (only if requested)

---

## Character Consistency — Troubleshooting

**Problem: Creator looks like a different person in some clips**

Cause: The anchor image URL wasn't passed, or the character description drifted between prompts.

Fix:
1. Identify the inconsistent clip(s) by frame number
2. Regenerate that clip with a more explicit prompt: "Match character EXACTLY to reference image: [ANCHOR_URL]. Same face, same hair, same outfit, same skin tone. The reference image is the ground truth."
3. Replace on timeline with `baz scenes positions`

**Problem: Product not visible in demo clips**

Fix: Add to the clip prompt: "Product [ProductName] is clearly visible and identifiable — label facing camera. Product image reference: [PRODUCT_URL]."

**Problem: Clips feel disconnected (different lighting/backgrounds)**

Cause: Setting description varied between clips.

Prevention: Include the full setting description in EVERY clip prompt (copy the CHARACTER LOCK STRING which includes setting).

---

## Clip Duration Reference

| Clip | Target | Min | Max |
|------|--------|-----|-----|
| Hook | 3s | 2s | 4s |
| Problem | 4s | 3s | 5s |
| Discovery | 3s | 2s | 4s |
| Demo 1 | 5s | 4s | 6s |
| Demo 2 | 4s | 3s | 5s |
| CTA | 3s | 2s | 4s |
| **Total** | **22s** | **16s** | **28s** |

---

## Video Model Guide

| Clip type | Model | Why |
|-----------|-------|-----|
| All talking head clips (1-6) | **Veed Fabric-1.0** via Replicate | Lip-synced talking head from image + audio in one call |
| Product-only close-up (optional insert) | Veo via baz | No character needed, Veo quality superior for objects |

Default to **Veed Fabric-1.0 for all clips with the creator's face**.

---

## Security & Privacy

- Product images are uploaded to Bazaar's CDN and stored as project assets
- Generated character is fictional — no real person's likeness is used
- All assets stored on Bazaar infrastructure
- Check `baz balance` before generating — each video clip costs credits
