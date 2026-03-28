import type { NextApiRequest, NextApiResponse } from 'next'
import { exportVideo } from '../../../lib/baz'
import { saveVideo } from '../../../lib/video-store'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { projectId, productName } = req.body
  if (!projectId) {
    res.status(400).json({ error: 'Missing projectId' })
    return
  }

  try {
    const result = await exportVideo(projectId)

    if (result.url) {
      saveVideo({
        id: `${projectId}-${Date.now()}`,
        projectId,
        productName: productName || 'Unknown Product',
        videoUrl: result.url,
        bazaarUrl: `https://bazaar.it/projects/${projectId}/generate`,
        cost: 0,
        createdAt: new Date().toISOString(),
      })
    }

    res.status(200).json({ success: true, url: result.url })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
