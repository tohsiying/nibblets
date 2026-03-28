// Server-only: baz CLI wrappers using child_process
import { execFile as execFileCb, spawn } from 'child_process'
import { promisify } from 'util'

const execFile = promisify(execFileCb)
const BAZ_BIN = '/usr/local/bin/baz'

export class BazError extends Error {
  constructor(
    message: string,
    public command: string,
    public stderr: string,
    public exitCode: number | null
  ) {
    super(message)
    this.name = 'BazError'
  }
}

async function bazExec(args: string[], timeoutMs: number): Promise<any> {
  const cmd = `baz ${args.join(' ')}`
  try {
    const { stdout, stderr } = await execFile(BAZ_BIN, args, {
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
    })

    // Try parsing the whole stdout as JSON first (baz often outputs pretty-printed JSON)
    try {
      return JSON.parse(stdout)
    } catch {
      // Fall back to finding the last valid JSON line (for NDJSON output)
    }

    const lines = stdout.trim().split('\n')
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        return JSON.parse(lines[i])
      } catch {
        continue
      }
    }

    if (stderr) {
      console.warn(`[baz] stderr: ${stderr}`)
    }
    return { raw: stdout }
  } catch (err: any) {
    throw new BazError(
      err.message || 'baz command failed',
      cmd,
      err.stderr || '',
      err.code ?? null
    )
  }
}

// For `baz prompt` which requires --stream-json (outputs NDJSON)
// Collects all output and returns the final summary event
async function bazPromptExec(args: string[], timeoutMs: number): Promise<any> {
  const cmd = `baz ${args.join(' ')}`

  return new Promise((resolve, reject) => {
    const proc = spawn(BAZ_BIN, args, { timeout: timeoutMs })
    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new BazError(`Process exited with code ${code}`, cmd, stderr, code))
        return
      }

      // Strategy 1: Try to find JSON objects in stdout (handles mix of NDJSON + pretty-printed)
      // Look for the last complete JSON object by finding matching braces
      let bestResult: any = null

      // First try single-line NDJSON parsing
      const lines = stdout.trim().split('\n')
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line)
          if (parsed.type === 'summary' || parsed.type === 'complete' || parsed.type === 'export_completed') {
            bestResult = parsed
          } else if (parsed.type === 'asset_generated' || parsed.type === 'scene_updated') {
            if (!bestResult) bestResult = parsed
            else bestResult = { ...bestResult, ...parsed }
          }
        } catch {
          continue
        }
      }

      // Strategy 2: Find the last pretty-printed JSON block (starts with { on its own line)
      if (!bestResult || !bestResult.url) {
        const jsonBlockMatch = stdout.match(/\{[\s\S]*"(?:url|exportUrl|videoUrl|type)"[\s\S]*\}/g)
        if (jsonBlockMatch) {
          // Try each match from last to first
          for (let i = jsonBlockMatch.length - 1; i >= 0; i--) {
            try {
              const parsed = JSON.parse(jsonBlockMatch[i])
              if (parsed.url || parsed.type === 'export_completed' || parsed.type === 'summary') {
                bestResult = parsed
                break
              }
            } catch {
              continue
            }
          }
        }
      }

      if (bestResult) {
        resolve(bestResult)
      } else {
        try {
          resolve(JSON.parse(stdout))
        } catch {
          resolve({ raw: stdout })
        }
      }
    })

    proc.on('error', (err: any) => {
      reject(new BazError(err.message, cmd, stderr, null))
    })
  })
}

export async function createProject(
  name: string,
  format: 'portrait' | 'landscape' | 'square' = 'portrait'
): Promise<{ projectId: string }> {
  const result = await bazExec(
    ['project', 'create', '--name', name, '--format', format, '--json'],
    30_000
  )
  return { projectId: result.projectId || result.id }
}

export async function bazMediaUpload(projectId: string, filePath: string): Promise<string> {
  const result = await bazExec(
    ['media', 'upload', filePath, '--project-id', projectId, '--json'],
    120_000
  )
  return result.url || result.mediaUrl || ''
}

export async function addContext(
  projectId: string,
  content: string,
  label: string
): Promise<void> {
  await bazExec(
    ['context', 'add', content, '--label', label, '--project-id', projectId],
    30_000
  )
}

export async function runPrompt(
  projectId: string,
  promptText: string,
  budget: number = 20
): Promise<{ summary: string; assets: { type: string; url: string }[]; cost: number }> {
  // baz prompt requires --stream-json, not --json
  const result = await bazPromptExec(
    ['prompt', promptText, '--budget', String(budget), '--project-id', projectId, '--stream-json'],
    600_000
  )

  // Parse assets and cost from baz output
  const assets: { type: string; url: string }[] = []
  if (result.scenesCreated) {
    for (const s of result.scenesCreated) {
      if (s.url) assets.push({ type: 'scene', url: s.url })
    }
  }
  if (result.scenesUpdated) {
    for (const s of result.scenesUpdated) {
      if (typeof s === 'string') {
        assets.push({ type: 'scene', url: s })
      } else if (s.url) {
        assets.push({ type: 'scene', url: s.url })
      }
    }
  }

  const cost = result.billing?.runCostUsd ?? result.budget?.totalBilledUsd ?? 0

  return {
    summary: result.summary || '',
    assets,
    cost,
  }
}

export async function contextList(projectId: string): Promise<any> {
  return bazExec(
    ['context', 'list', '--project-id', projectId, '--json'],
    30_000
  )
}

export async function scenesList(projectId: string): Promise<any> {
  return bazExec(
    ['scenes', 'list', '--project-id', projectId, '--json'],
    30_000
  )
}

export async function preview(projectId: string, frames: string = '0,150,300'): Promise<any> {
  return bazExec(
    ['preview', '--frames', frames, '--project-id', projectId, '--json'],
    120_000
  )
}

export async function review(projectId: string): Promise<any> {
  return bazExec(
    ['review', '--summary', '--project-id', projectId, '--json'],
    60_000
  )
}

export async function validate(projectId: string): Promise<any> {
  return bazExec(
    ['project', 'validate', '--project-id', projectId, '--json'],
    60_000
  )
}

export async function projectList(): Promise<any[]> {
  const result = await bazExec(['project', 'list', '--json'], 30_000)
  return Array.isArray(result) ? result : []
}

export async function exportVideo(projectId: string): Promise<{ url: string }> {
  // Export outputs NDJSON with progress events, then a final export_completed event
  const result = await bazPromptExec(
    ['export', 'start', '--wait', '--project-id', projectId, '--json'],
    600_000
  )
  const url = result.url || result.videoUrl || result.exportUrl || ''
  return { url }
}
