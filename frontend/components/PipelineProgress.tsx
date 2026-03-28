import React, { useEffect, useState } from 'react'
import Card from './ui/Card'
import Button from './ui/Button'
import { cn } from '../lib/utils'
import { PIPELINE_STEPS } from '../lib/pipeline-types'
import type { PipelineEvent, PipelineStep, PipelineState } from '../lib/pipeline-types'

interface PipelineProgressProps {
  state: PipelineState
  currentStep: PipelineStep | null
  progress: number
  message: string
  events: PipelineEvent[]
  videoUrl: string | null
  projectId: string | null
  error: string | null
  costSoFar: number
  startedAt: number | null
  onReset: () => void
  onRetry?: () => void
}

function useElapsedTime(startedAt: number | null): string {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!startedAt) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  if (!startedAt) return '0s'
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

function getStepStatus(
  stepKey: PipelineStep,
  currentStep: PipelineStep | null,
  progress: number
): 'completed' | 'active' | 'pending' {
  const stepInfo = PIPELINE_STEPS.find((s) => s.key === stepKey)
  const currentInfo = PIPELINE_STEPS.find((s) => s.key === currentStep)
  if (!stepInfo || !currentInfo) return 'pending'

  if (progress >= stepInfo.progressEnd) return 'completed'
  if (stepKey === currentStep) return 'active'
  if (stepInfo.progressStart < (currentInfo?.progressStart ?? 0)) return 'completed'
  return 'pending'
}

export default function PipelineProgress({
  state,
  currentStep,
  progress,
  message,
  videoUrl,
  projectId,
  error,
  costSoFar,
  startedAt,
  onReset,
  onRetry,
}: PipelineProgressProps) {
  const elapsedTime = useElapsedTime(state === 'running' || state === 'complete' ? startedAt : null)
  const [copied, setCopied] = useState(false)

  // ── Error State ──────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <Card>
        <div className="flex flex-col items-center py-8 gap-4">
          <div className="w-10 h-10 rounded-full bg-status-error/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M14 6l-8 8" stroke="#FF4444" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary mb-1">Generation failed</p>
            <p className="text-xs text-text-tertiary max-w-md">{error}</p>
            {costSoFar > 0 && (
              <p className="text-xs text-text-tertiary mt-2">Cost incurred: ${costSoFar.toFixed(2)}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onRetry && (
              <Button variant="primary" onClick={onRetry}>
                Retry
              </Button>
            )}
            <Button variant="secondary" onClick={onReset}>
              Back
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // ── Complete State ───────────────────────────────────────────────────
  if (state === 'complete') {
    return (
      <Card>
        <div className="flex flex-col items-center py-6 gap-5">
          {/* Success indicator */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#0A0A0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-medium text-accent">Video generated</span>
          </div>

          {/* Video player */}
          {videoUrl ? (
            <div className="w-full max-w-[280px]">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full rounded-lg border border-border"
                style={{ aspectRatio: '9/16', maxHeight: 500 }}
              />
            </div>
          ) : (
            <p className="text-xs text-text-tertiary">Video exported — URL not available for inline preview</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-text-tertiary">
            <span>Cost: ${costSoFar.toFixed(2)}</span>
            <span>·</span>
            <span>Time: {elapsedTime}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={onReset}>
              Generate Another
            </Button>
            {videoUrl && (
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(videoUrl)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </Button>
            )}
            {projectId && (
              <a
                href={`https://bazaar.it/projects/${projectId}/generate`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary bg-surface-2 border border-border rounded-md hover:border-border-hover transition-all duration-150"
              >
                View in Bazaar
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4.5 2.5h5v5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // ── Running State ────────────────────────────────────────────────────
  return (
    <Card>
      <div className="py-2">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-text-tertiary">{Math.round(progress)}%</span>
            <span className="text-xs text-text-tertiary">{elapsedTime}</span>
          </div>
          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current message */}
        <div className="mb-5">
          <p className="text-sm text-text-primary">{message}</p>
          {costSoFar > 0 && (
            <p className="text-xs text-text-tertiary mt-0.5">Cost so far: ${costSoFar.toFixed(2)}</p>
          )}
        </div>

        {/* Step list */}
        <div className="space-y-1">
          {PIPELINE_STEPS.map((step) => {
            const status = getStepStatus(step.key, currentStep, progress)
            return (
              <div key={step.key} className="flex items-center gap-2.5 py-1">
                {/* Status icon */}
                {status === 'completed' ? (
                  <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#00FF94" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : status === 'active' ? (
                  <div className="w-4 h-4 rounded-full border-2 border-accent flex-shrink-0 animate-pulse" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-surface-2 flex-shrink-0" />
                )}

                {/* Label */}
                <span
                  className={cn(
                    'text-xs',
                    status === 'completed'
                      ? 'text-text-secondary'
                      : status === 'active'
                      ? 'text-text-primary'
                      : 'text-text-tertiary'
                  )}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
