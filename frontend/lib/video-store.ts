// Server-only: simple JSON file store for generated video URLs
import fs from 'fs'
import path from 'path'

const STORE_PATH = path.join(process.cwd(), '.generated-videos.json')

export interface GeneratedVideo {
  id: string
  projectId: string
  productName: string
  videoUrl: string
  bazaarUrl: string
  cost: number
  createdAt: string
}

function readStore(): GeneratedVideo[] {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeStore(videos: GeneratedVideo[]) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(videos, null, 2))
}

export function saveVideo(video: GeneratedVideo) {
  console.log(`[video-store] Saving video for ${video.productName} at ${STORE_PATH}`)
  const videos = readStore()
  // Avoid duplicates by projectId
  const filtered = videos.filter((v) => v.projectId !== video.projectId)
  filtered.unshift(video) // newest first
  writeStore(filtered)
  console.log(`[video-store] Saved. Total videos: ${filtered.length}`)
}

export function getVideos(): GeneratedVideo[] {
  return readStore()
}
