export type PipelineStep =
  | 'gathering_inputs'
  | 'analyzing_product'
  | 'writing_scripts'
  | 'creating_project'
  | 'adding_context'
  | 'verifying_context'
  | 'generating_anchor'
  | 'generating_clip_1'
  | 'generating_clip_2'
  | 'generating_clip_3'
  | 'generating_clip_4'
  | 'assembling_timeline'
  | 'previewing'
  | 'reviewing'
  | 'validating'
  | 'exporting'
  | 'complete'
  | 'error'

export type PipelineState = 'idle' | 'running' | 'complete' | 'error'

export interface PipelineEvent {
  step: PipelineStep
  progress: number
  message: string
  detail?: string
  videoUrl?: string
  projectId?: string
  error?: string
  costSoFar?: number
}

export const PIPELINE_STEPS: { key: PipelineStep; label: string; progressStart: number; progressEnd: number }[] = [
  { key: 'gathering_inputs', label: 'Gathering inputs', progressStart: 0, progressEnd: 3 },
  { key: 'analyzing_product', label: 'Analyzing product', progressStart: 3, progressEnd: 6 },
  { key: 'writing_scripts', label: 'Writing scripts', progressStart: 6, progressEnd: 10 },
  { key: 'creating_project', label: 'Creating project', progressStart: 10, progressEnd: 12 },
  { key: 'adding_context', label: 'Setting up context', progressStart: 12, progressEnd: 15 },
  { key: 'verifying_context', label: 'Verifying context', progressStart: 15, progressEnd: 16 },
  { key: 'generating_anchor', label: 'Generating anchor portrait', progressStart: 16, progressEnd: 28 },
  { key: 'generating_clip_1', label: 'Generating clip 1 — Hook', progressStart: 28, progressEnd: 40 },
  { key: 'generating_clip_2', label: 'Generating clip 2 — Problem', progressStart: 40, progressEnd: 52 },
  { key: 'generating_clip_3', label: 'Generating clip 3 — Demo', progressStart: 52, progressEnd: 64 },
  { key: 'generating_clip_4', label: 'Generating clip 4 — CTA', progressStart: 64, progressEnd: 76 },
  { key: 'assembling_timeline', label: 'Assembling timeline', progressStart: 76, progressEnd: 80 },
  { key: 'previewing', label: 'Previewing frames', progressStart: 80, progressEnd: 84 },
  { key: 'reviewing', label: 'Reviewing project', progressStart: 84, progressEnd: 88 },
  { key: 'validating', label: 'Validating', progressStart: 88, progressEnd: 92 },
  { key: 'exporting', label: 'Exporting video', progressStart: 92, progressEnd: 100 },
]
