// Server-only: Postiz CLI wrappers for social publishing
import { execFile as execFileCb } from 'child_process'
import { promisify } from 'util'

const execFile = promisify(execFileCb)
const POSTIZ_BIN = '/usr/local/bin/postiz'

// Integration IDs
export const INTEGRATIONS = {
  instagram: { id: 'cmlsw4huv03y0r00yjigcpihg', label: 'Instagram', icon: 'IG' },
  youtube: { id: 'cmlsw28mg03xrr00ytw39kln9', label: 'YouTube', icon: 'YT' },
  tiktok: { id: 'cmm8wc0o9004bkj0y8uts03h5', label: 'TikTok', icon: 'TT' },
  x: { id: 'cmls46ieq0002r00ya5rijxyh', label: 'X', icon: 'X' },
} as const

export type Platform = keyof typeof INTEGRATIONS

export async function uploadMedia(videoUrl: string): Promise<string> {
  // postiz upload accepts a URL or file path
  const { stdout } = await execFile(POSTIZ_BIN, ['upload', videoUrl], {
    timeout: 120_000,
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env },
  })

  // Extract uploaded URL from output
  const match = stdout.match(/https:\/\/uploads\.postiz\.com\/\S+/)
  if (match) return match[0]

  // Try to find any URL in output
  const urlMatch = stdout.match(/https?:\/\/\S+/)
  if (urlMatch) return urlMatch[0]

  throw new Error(`Upload failed: ${stdout.slice(0, 200)}`)
}

export async function postToSocial(
  platform: Platform,
  caption: string,
  mediaUrl: string,
  title?: string
): Promise<string> {
  const integration = INTEGRATIONS[platform]
  const scheduleDate = new Date(Date.now() + 2 * 60 * 1000).toISOString()

  const args = [
    'posts:create',
    '--no-shortLink',
    '-c', caption,
    '-m', mediaUrl,
    '-i', integration.id,
    '-s', scheduleDate,
  ]

  // Platform-specific settings
  if (platform === 'instagram') {
    args.push('--settings', '{"post_type":"post"}')
  } else if (platform === 'youtube') {
    args.push('--settings', JSON.stringify({ title: title || caption.slice(0, 70), type: 'public' }))
  }

  const { stdout, stderr } = await execFile(POSTIZ_BIN, args, {
    timeout: 60_000,
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env },
  })

  return stdout || stderr || 'Post scheduled'
}
