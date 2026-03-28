import type { NextApiRequest, NextApiResponse } from 'next'
import { getVideos } from '../../../lib/video-store'
import { projectList } from '../../../lib/baz'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    // Source 1: locally saved videos (have mp4 URLs)
    const savedVideos = getVideos()
    const savedProjectIds = new Set(savedVideos.map((v) => v.projectId))

    // Source 2: baz project list (for projects that weren't saved locally)
    let bazProjects: any[] = []
    try {
      const allProjects = await projectList()
      bazProjects = allProjects
        .filter(
          (p) =>
            p.title?.includes('UGC') &&
            parseInt(p.sceneCount, 10) >= 4 &&
            !savedProjectIds.has(p.id)
        )
        .map((p) => ({
          id: p.id,
          projectId: p.id,
          productName: p.title.replace(/\s*UGC.*$/, ''),
          videoUrl: '', // no mp4 URL — not exported locally
          bazaarUrl: `https://bazaar.it/projects/${p.id}/generate`,
          cost: 0,
          createdAt: p.createdAt,
        }))
    } catch {
      // If baz project list fails, just use saved videos
    }

    // Merge: saved videos first (they have mp4s), then baz projects
    const allVideos = [...savedVideos, ...bazProjects]

    res.status(200).json({ videos: allVideos })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
