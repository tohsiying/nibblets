import type { NextApiRequest, NextApiResponse } from 'next'
import { runPipeline } from '../../../lib/pipeline'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { product } = req.body
  if (!product?.id || !product?.title) {
    res.status(400).json({ error: 'Missing product data' })
    return
  }

  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  // Cancellation on client disconnect
  const controller = new AbortController()
  req.on('close', () => controller.abort())

  await runPipeline(
    product,
    (event) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      }
    },
    controller.signal
  )

  if (!res.writableEnded) {
    res.end()
  }
}
