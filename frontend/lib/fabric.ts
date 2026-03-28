// Server-only: Veed Fabric-1.0 lip-sync video generation via Replicate
import Replicate from 'replicate'
import { writeFile } from 'fs/promises'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
})

export async function generateTalkingHead(
  anchorImageUrl: string,
  audioUrl: string,
  outputPath: string
): Promise<string> {
  const output = await replicate.run('veed/fabric-1.0', {
    input: {
      image: anchorImageUrl,
      audio: audioUrl,
    },
  })

  // Output is a ReadableStream or URL — handle both
  if (typeof output === 'string') {
    // It's a URL — download it
    const res = await fetch(output)
    const buffer = Buffer.from(await res.arrayBuffer())
    await writeFile(outputPath, buffer)
  } else if (output instanceof ReadableStream || (output && typeof (output as any).pipe === 'function')) {
    // It's a stream
    const chunks: Buffer[] = []
    const reader = (output as ReadableStream).getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(Buffer.from(value))
    }
    await writeFile(outputPath, Buffer.concat(chunks))
  } else if (Buffer.isBuffer(output)) {
    await writeFile(outputPath, output)
  } else {
    // Try treating as URL string
    const url = String(output)
    const res = await fetch(url)
    const buffer = Buffer.from(await res.arrayBuffer())
    await writeFile(outputPath, buffer)
  }

  return outputPath
}
