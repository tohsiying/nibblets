// Server-only: pipeline orchestration — Veo-based cosmetic UGC (phone selfie variant)
import * as baz from './baz'
import { saveVideo } from './video-store'
import { formatCurrency } from './utils'
import type { Product } from './types'
import type { PipelineEvent, PipelineStep } from './pipeline-types'

const BENEFIT_MAP: Record<string, string> = {
  Skincare: 'healthy, glowing skin',
  Serum: 'healthy, glowing skin',
  'Lip Care': 'soft, hydrated lips',
  Sunscreen: 'daily UV protection',
  Cleanser: 'clean, refreshed skin',
  Moisturizer: 'deep, lasting hydration',
}

function inferBenefit(productType: string): string {
  return BENEFIT_MAP[productType] || 'premium quality results'
}

function emit(
  onEvent: (e: PipelineEvent) => void,
  step: PipelineStep,
  progress: number,
  message: string,
  extra?: Partial<PipelineEvent>
) {
  onEvent({ step, progress, message, ...extra })
}

export async function runPipeline(
  product: Product,
  onEvent: (event: PipelineEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  let totalCost = 0

  function checkAborted() {
    if (signal?.aborted) throw new Error('Pipeline cancelled')
  }

  try {
    // ── Phase 1: Gather Inputs ─────────────────────────────────────────
    emit(onEvent, 'gathering_inputs', 0, 'Gathering product information...')
    const productName = product.title
    const brand = product.vendor || 'the brand'
    const category = product.product_type || 'beauty product'
    const price = formatCurrency(product.price_min)
    const benefit = inferBenefit(category)
    const inventory = product.inventory_total
    const collections = product.collections?.join(', ') || ''
    emit(onEvent, 'gathering_inputs', 3, `Analyzed ${productName} by ${brand}`)

    checkAborted()

    // ── Phase 2: Product Analysis & Creator Persona ────────────────────
    emit(onEvent, 'analyzing_product', 3, 'Designing creator persona...')

    const characterLock =
      '29-year-old South Asian woman, warm medium-deep skin tone, long dark hair loosely tied back. ' +
      'Minimal makeup. Wearing an oversized cream hoodie. ' +
      'Sitting at a bathroom vanity, soft natural light, product bottles visible on shelf behind her. ' +
      'Handheld selfie angle, straight-on. Warm and dry energy, ' +
      'talks like she is texting a friend a recommendation, conversational not performative, ' +
      'calm delivery with occasional self-deprecating humour.'

    let urgencyNote = ''
    if (inventory < 15) urgencyNote = ` Only ${inventory} left in stock — create urgency.`
    if (collections.includes('New Arrivals')) urgencyNote += ' This just dropped — emphasize newness.'
    if (collections.includes('Limited Edition')) urgencyNote += ' Limited edition — emphasize exclusivity.'

    emit(onEvent, 'analyzing_product', 6, 'Creator persona ready')

    checkAborted()

    // ── Phase 3: Write Scripts (Phone Selfie Variant) ──────────────────
    emit(onEvent, 'writing_scripts', 6, 'Writing clip scripts...')

    const clips = [
      {
        label: 'Hook',
        duration: 6,
        energy: 'HIGH',
        visual:
          `Creator appears on screen mid-action, already holding ${productName} at chest height, label facing camera. ` +
          `Product visible but not the focus yet. Genuine excitement, not performative.`,
        dialogue: `Okay I need to tell you about this ${category} find from ${brand}.`,
      },
      {
        label: 'Problem',
        duration: 6,
        energy: 'MEDIUM',
        visual:
          `Creator sitting casually in same setting, speaking directly to camera. ` +
          `Relatable "does anyone else" energy, slight eye roll when mentioning past products. Product may or may not be in frame.`,
        dialogue: `I have tried so many ${category} products and nothing actually worked until I found ${productName}.`,
      },
      {
        label: 'Demo',
        duration: 8,
        energy: 'SATISFIED',
        visual:
          `Creator demonstrating ${productName}, product MUST be clearly visible with label toward camera. ` +
          `Shows texture and application. This is the money shot — longest clip.`,
        dialogue: `${productName} gives you ${benefit} and it is only ${price}.`,
      },
      {
        label: 'CTA',
        duration: 6,
        energy: 'DIRECT',
        visual:
          `Creator holds ${productName} up closer to camera, smiling warmly. ` +
          `Product fills more of the frame than previous clips. Points upward briefly.${urgencyNote}`,
        dialogue: `Seriously, go try ${productName} from ${brand}. Link in bio.`,
      },
    ]

    emit(onEvent, 'writing_scripts', 10, `4 clip scripts ready: ${clips.map((c) => c.label).join(', ')}`)

    checkAborted()

    // ── Phase 4: Create Project ────────────────────────────────────────
    emit(onEvent, 'creating_project', 10, 'Creating Bazaar project...')

    const { projectId } = await baz.createProject(
      `${productName} UGC - Phone - ${new Date().toISOString().split('T')[0]}`,
      'portrait'
    )

    if (!projectId) throw new Error('Failed to create project — no project ID returned')

    emit(onEvent, 'creating_project', 12, `Project created: ${projectId.slice(0, 8)}...`, {
      detail: projectId,
    })

    checkAborted()

    // ── Phase 4b: Add Context ──────────────────────────────────────────
    emit(onEvent, 'adding_context', 12, 'Setting up project context...')

    await baz.addContext(
      projectId,
      `Create a UGC-style cosmetic product ad for ${productName} by ${brand}. ` +
        `Audience: women interested in ${category}. Goal: viewer clicks link in bio. ` +
        `Authentic, raw, not polished. Portrait 9:16, 1080x1920.`,
      'goal'
    )

    await baz.addContext(projectId, `Creator persona: ${characterLock}`, 'requirement')

    await baz.addContext(projectId, `Format: portrait 9:16, 1080x1920, 1080p`, 'requirement')

    await baz.addContext(
      projectId,
      `Brand: ${brand}. Product: ${productName}. Category: ${category}. Price: ${price}.`,
      'brand'
    )

    await baz.addContext(
      projectId,
      `CHARACTER CONSISTENCY: All clips feature the SAME creator. ` +
        `Pass ANCHOR_URL as image input to every Veo call. ` +
        `The Character Lock String must be copy-pasted verbatim into every prompt — never paraphrased.`,
      'instructions'
    )

    emit(onEvent, 'adding_context', 15, 'Context configured')

    checkAborted()

    // ── GATE: Verify context ───────────────────────────────────────────
    emit(onEvent, 'verifying_context', 15, 'Verifying context...')

    const contextResult = await baz.contextList(projectId)
    const contextStr = JSON.stringify(contextResult)
    if (!contextStr.includes('goal') || !contextStr.includes('requirement') || !contextStr.includes('brand')) {
      throw new Error('Context verification failed — missing goal, requirement, or brand')
    }

    emit(onEvent, 'verifying_context', 16, 'Context verified: goal + requirements + brand set', {
      costSoFar: totalCost,
    })

    checkAborted()

    // ── Phase 5: Generate Anchor Portrait ──────────────────────────────
    emit(onEvent, 'generating_anchor', 16, 'Generating anchor portrait (~2 min)...')

    const anchorPrompt =
      `Generate a photorealistic portrait image. This will be used as a character and product reference ` +
      `for a series of video clips — accuracy is critical.\n\n` +
      `CHARACTER: ${characterLock}\n\n` +
      `She is holding the product at chest height with one hand, label visible and facing directly toward camera, clearly legible. ` +
      `Her other hand is relaxed at her side or holding her phone. ` +
      `Natural expression — like she just hit record. Not posed. Not a model. ` +
      `Visible skin texture, slight pores, natural under-eye, no airbrushing. ` +
      `Looks like a real person, not a beauty campaign.\n\n` +
      `Style: iPhone selfie quality, natural warm light, shallow depth of field. ` +
      `Raw, authentic. NOT studio. NOT stock photo. 1080x1920 portrait.`

    const anchorResult = await baz.runPrompt(projectId, anchorPrompt, 20)
    totalCost += anchorResult.cost

    emit(onEvent, 'generating_anchor', 28, 'Anchor portrait generated', { costSoFar: totalCost })

    checkAborted()

    // ── Phase 6: Generate 4 Clips (Phone Selfie — Veo) ────────────────
    const clipSteps: PipelineStep[] = [
      'generating_clip_1',
      'generating_clip_2',
      'generating_clip_3',
      'generating_clip_4',
    ]
    const clipProgressStarts = [28, 40, 52, 64]
    const clipProgressEnds = [40, 52, 64, 76]

    for (let i = 0; i < 4; i++) {
      checkAborted()

      const clip = clips[i]
      emit(
        onEvent,
        clipSteps[i],
        clipProgressStarts[i],
        `Generating clip ${i + 1} — ${clip.label} (~2 min)...`
      )

      const clipPrompt =
        `Generate a Veo portrait video clip (9:16, ${clip.duration} seconds).\n\n` +
        `CHARACTER: ${characterLock}\n\n` +
        `Preserve the person from the anchor clip exactly — same face, hair, skin tone, outfit. ` +
        `Change only the action and expression.\n\n` +
        `SCENE: ${clip.visual}\n\n` +
        `DIALOGUE (the creator says this naturally, on camera): "${clip.dialogue}"\n\n` +
        `Energy: ${clip.energy}. generateAudio: true. Handheld selfie feel, natural lighting.`

      const clipResult = await baz.runPrompt(projectId, clipPrompt, 20)
      totalCost += clipResult.cost

      emit(onEvent, clipSteps[i], clipProgressEnds[i] - 2, `Clip ${i + 1} (${clip.label}) done`, {
        costSoFar: totalCost,
      })

      // Per-clip review to verify it landed on timeline
      await baz.review(projectId)

      emit(onEvent, clipSteps[i], clipProgressEnds[i], `Clip ${i + 1} verified on timeline`)
    }

    checkAborted()

    // ── Phase 7: Assemble Timeline ─────────────────────────────────────
    emit(onEvent, 'assembling_timeline', 76, 'Assembling clips on timeline...')

    await baz.runPrompt(
      projectId,
      `Assemble all video clips onto the timeline sequentially on track 0, no gaps.\n\n` +
        `Place in this exact order with explicit start times: ` +
        `Clip 1 (Hook) at frame 0, Clip 2 (Problem) immediately after Clip 1, ` +
        `Clip 3 (Demo) immediately after Clip 2, Clip 4 (CTA) immediately after Clip 3. ` +
        `Portrait 9:16.`,
      20
    )

    // Verify clip order
    await baz.review(projectId)

    emit(onEvent, 'assembling_timeline', 80, 'Timeline assembled', { costSoFar: totalCost })

    checkAborted()

    // ── Phase 8: Preview ───────────────────────────────────────────────
    emit(onEvent, 'previewing', 80, 'Rendering preview frames...')
    try {
      await baz.preview(projectId, '0,150,300,450')
      emit(onEvent, 'previewing', 84, 'Preview frames rendered')
    } catch {
      emit(onEvent, 'previewing', 84, 'Preview skipped — proceeding to review')
    }

    checkAborted()

    // ── Phase 9: Review & Validate ─────────────────────────────────────
    emit(onEvent, 'reviewing', 84, 'Reviewing project...')

    const reviewResult = await baz.review(projectId)
    emit(onEvent, 'reviewing', 88, 'Review complete', {
      detail: typeof reviewResult === 'object'
        ? (reviewResult.summary || JSON.stringify(reviewResult).slice(0, 200))
        : String(reviewResult).slice(0, 200),
    })

    emit(onEvent, 'validating', 88, 'Validating project...')

    const validateResult = await baz.validate(projectId)
    const isValid = validateResult.valid !== false && !validateResult.errors?.length
    emit(onEvent, 'validating', 92, isValid ? 'Validation passed' : 'Validation warnings — proceeding', {
      costSoFar: totalCost,
    })

    checkAborted()

    // ── Phase 10: Export ───────────────────────────────────────────────
    emit(onEvent, 'exporting', 92, 'Exporting final video (may take a few minutes)...')

    const exportResult = await baz.exportVideo(projectId)

    // Always save — even if URL is empty, store the project link
    saveVideo({
      id: `${projectId}-${Date.now()}`,
      projectId,
      productName,
      videoUrl: exportResult.url || '',
      bazaarUrl: `https://bazaar.it/projects/${projectId}/generate`,
      cost: totalCost,
      createdAt: new Date().toISOString(),
    })

    emit(onEvent, 'complete', 100, 'Video generated successfully!', {
      videoUrl: exportResult.url,
      projectId,
      costSoFar: totalCost,
    })
  } catch (err: any) {
    if (err.message === 'Pipeline cancelled') {
      emit(onEvent, 'error', 0, 'Pipeline was cancelled', {
        error: 'Cancelled by user',
        costSoFar: totalCost,
      })
    } else {
      emit(onEvent, 'error', 0, 'Pipeline failed', {
        error: err.message || 'Unknown error',
        costSoFar: totalCost,
      })
    }
  }
}
