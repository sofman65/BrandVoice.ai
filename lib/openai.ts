"use server"
import "server-only"

import type { GeneratedContent } from "./types"
import { sleep } from "./utils"

/* -------------------------------------------------------------------------- */
/*                         LAZY-LOAD AND SINGLETON SETUP                      */
/* -------------------------------------------------------------------------- */

let cachedClient: import("openai").default | null = null

async function getOpenAI() {
  if (cachedClient) return cachedClient

  if (!process.env.OPENAI_API_KEY) {
    // No key → stay in mock mode
    return null
  }

  // Pure-ESM dynamic import so we never hit `require`
  const { default: OpenAI } = await import("openai")
  cachedClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  return cachedClient
}

/* -------------------------------------------------------------------------- */
/*                               PUBLIC METHODS                               */
/* -------------------------------------------------------------------------- */

export async function transcribeAudio(audioUrl: string): Promise<string> {
  // ---------- MOCK MODE ----------
  if (!process.env.OPENAI_API_KEY) {
    await sleep(300)
    return "Mock transcript – astronaut talking about content repurposing."
  }

  const openai = await getOpenAI()
  if (!openai) throw new Error("OpenAI client not initialised")

  // NOTE: In production you’d download the file to a Buffer first.
  const result = await openai.audio.transcriptions.create({
    file: audioUrl,
    model: "whisper-1",
  })

  return result.text
}

export async function generateContent(caption: string, transcript?: string): Promise<GeneratedContent> {
  // ---------- MOCK MODE ----------
  if (!process.env.OPENAI_API_KEY) {
    await sleep(600)
    return {
      linkedin: `🚀 Mock LinkedIn post based on:\n\n${caption}`,
      carousel: [
        "Slide 1 – Space-Tech Productivity 🚀",
        "Slide 2 – Automate the boring stuff",
        "Slide 3 – Focus on deep work",
      ],
      threads: "Mock Threads post 🌠  -- keep hustling in zero-g!",
      video_script:
        'INT. SPACESHIP – DAY\nSpeaker: "Welcome to zero-gravity coding!"\nCTA: "Follow @spaceslam for more."',
    }
  }

  const openai = await getOpenAI()
  if (!openai) throw new Error("OpenAI client not initialised")

  const systemPrompt = `You are Spaceslam's energetic, space-tech savvy copywriter with a hint of humour.
Return STRICT JSON with keys: linkedin, carousel, threads, video_script.`

  const userPrompt = `Instagram Caption:\n${caption}` + (transcript ? `\n\nVideo Transcript:\n${transcript}` : "")

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1800,
  })

  const raw = completion.choices[0]?.message?.content ?? "{}"

  let parsed: GeneratedContent
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error("AI response was not valid JSON")
  }

  // Basic structural check
  if (!parsed.linkedin || !Array.isArray(parsed.carousel) || !parsed.threads || !parsed.video_script) {
    throw new Error("AI response missing required fields")
  }

  return parsed
}
