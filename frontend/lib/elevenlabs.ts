// Server-only: ElevenLabs text-to-speech wrapper
import { writeFile } from 'fs/promises'

const API_KEY = process.env.ELEVENLABS_API_KEY || ''

// Recommended UGC voices
export const VOICES = {
  charlotte: { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', style: 'Warm, British' },
  sarah: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', style: 'Soft American' },
  aria: { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', style: 'Energetic American' },
  laura: { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', style: 'Natural, warm' },
} as const

export async function generateSpeech(
  text: string,
  voiceId: string,
  outputPath: string
): Promise<string> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`ElevenLabs error (${response.status}): ${err}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  await writeFile(outputPath, buffer)
  return outputPath
}
