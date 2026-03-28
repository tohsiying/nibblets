import type { NextApiRequest, NextApiResponse } from 'next'
import { uploadMedia, postToSocial, INTEGRATIONS } from '../../lib/postiz'
import type { Platform } from '../../lib/postiz'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { videoUrl, platform, caption, title } = req.body as {
    videoUrl: string
    platform: Platform
    caption: string
    title?: string
  }

  if (!videoUrl || !platform || !caption) {
    res.status(400).json({ error: 'Missing videoUrl, platform, or caption' })
    return
  }

  if (!(platform in INTEGRATIONS)) {
    res.status(400).json({ error: `Unknown platform: ${platform}` })
    return
  }

  try {
    // Step 1: Upload video to Postiz CDN
    const uploadedUrl = await uploadMedia(videoUrl)

    // Step 2: Create post
    const result = await postToSocial(platform, caption, uploadedUrl, title)

    res.status(200).json({
      success: true,
      uploadedUrl,
      result,
      platform,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
