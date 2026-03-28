import { useReducer, useRef, useCallback } from 'react'
import type { Product } from '../lib/types'
import type { PipelineEvent, PipelineStep, PipelineState } from '../lib/pipeline-types'

interface State {
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
}

type Action =
  | { type: 'START' }
  | { type: 'EVENT'; event: PipelineEvent }
  | { type: 'RESET' }

const initialState: State = {
  state: 'idle',
  currentStep: null,
  progress: 0,
  message: '',
  events: [],
  videoUrl: null,
  projectId: null,
  error: null,
  costSoFar: 0,
  startedAt: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...initialState, state: 'running', startedAt: Date.now() }
    case 'EVENT': {
      const e = action.event
      const isComplete = e.step === 'complete'
      const isError = e.step === 'error'
      return {
        ...state,
        state: isComplete ? 'complete' : isError ? 'error' : 'running',
        currentStep: e.step,
        progress: e.progress,
        message: e.message,
        events: [...state.events, e],
        videoUrl: e.videoUrl ?? state.videoUrl,
        projectId: e.projectId ?? state.projectId,
        error: e.error ?? state.error,
        costSoFar: e.costSoFar ?? state.costSoFar,
      }
    }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function useGeneratePipeline() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const abortRef = useRef<AbortController | null>(null)

  const start = useCallback(async (product: Product) => {
    // Abort any in-flight pipeline
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    dispatch({ type: 'START' })

    try {
      const response = await fetch('/api/generate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        dispatch({
          type: 'EVENT',
          event: {
            step: 'error',
            progress: 0,
            message: 'Failed to start pipeline',
            error: `Server returned ${response.status}`,
          },
        })
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Split on double newline (SSE delimiter)
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const line = part.trim()
          if (line.startsWith('data: ')) {
            try {
              const event: PipelineEvent = JSON.parse(line.slice(6))
              dispatch({ type: 'EVENT', event })
            } catch {
              // Skip malformed events
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim().startsWith('data: ')) {
        try {
          const event: PipelineEvent = JSON.parse(buffer.trim().slice(6))
          dispatch({ type: 'EVENT', event })
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      dispatch({
        type: 'EVENT',
        event: {
          step: 'error',
          progress: 0,
          message: 'Connection lost',
          error: err.message || 'Network error',
        },
      })
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    dispatch({ type: 'RESET' })
  }, [])

  return {
    ...state,
    start,
    reset,
  }
}
