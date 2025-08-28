"use server"
import "server-only"

import type { GeneratedContent } from "./types"
import type { BrandVoice } from "./types"
import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

// Wrapper exports (must be async in a "use server" file)
export async function getOpenAI() {
  const { getOpenAI } = await import("@/lib/ai/openai-client")
  return getOpenAI()
}

export async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const { withTimeout } = await import("@/lib/ai/openai-client")
  return withTimeout(promise, ms, label)
}

/**
 * Transcribe audio from Instagram video using Whisper-1
 */
export async function transcribeAudio(mediaUrl: string): Promise<string> {
  // Mock mode
  if (!process.env.OPENAI_API_KEY) {
    const { sleep } = await import("./utils")
    await sleep(1000)
    return "Mock transcript: Welcome to this amazing space-tech tutorial! Today I'm going to show you how to boost your productivity using cutting-edge tools and techniques. This is going to revolutionize the way you work and create content."
  }

  const { getOpenAI } = await import("@/lib/ai/openai-client")
  const openai = await getOpenAI()
  if (!openai) {
    throw new Error("OpenAI client not initialized")
  }

  let tempFilePath: string | null = null

  try {
    // Download the video file
    console.log("Downloading video for transcription:", mediaUrl)
    // const videoBuffer = await downloadInstagramVideo(mediaUrl)

    // Validate the video file
    // validateVideoForTranscription(videoBuffer)

    // Create temporary file
    // Use Vercel's writable temp directory when on serverless
    const tempDir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "tmp")
    await fs.mkdir(tempDir, { recursive: true })

    const fileName = `video_${randomUUID()}.mp4`
    tempFilePath = path.join(tempDir, fileName)

    // Write video buffer to temporary file
    // await fs.writeFile(tempFilePath, videoBuffer)
    throw new Error("Video transcription not yet implemented")

    // The following code is commented out since video transcription is not yet implemented
    /*
    console.log("Transcribing video with Whisper-1...")

    // Create file stream for OpenAI
    const fileStream = await fs.open(tempFilePath, "r")

    // Transcribe using Whisper-1
    const transcription = await openai?.audio.transcriptions.create({
      file: fileStream.createReadStream(),
      model: "whisper-1",
      language: "en", // Specify language for better accuracy
      response_format: "text",
      temperature: 0.0, // Lower temperature for more consistent results
    })

    await fileStream.close()

    if (!transcription || typeof transcription !== "string") {
      throw new Error("Invalid transcription response from Whisper")
    }

    console.log("Transcription completed successfully")
    return transcription.trim()
    */
  } catch (error) {
    console.error("Transcription error:", error)

    // Check if error is from Meta Graph API
    if (error && typeof error === 'object' && 'name' in error && error.name === 'MetaGraphAPIError') {
      throw error
    }

    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes("rate_limit")) {
        throw new Error("OpenAI API rate limit exceeded. Please try again later.")
      }

      if (error.message.includes("insufficient_quota")) {
        throw new Error("OpenAI API quota exceeded. Please check your billing.")
      }

      if (error.message.includes("invalid_request")) {
        throw new Error("Invalid audio file format for transcription.")
      }

      throw new Error(`Transcription failed: ${error.message}`)
    }

    throw new Error("Unknown error during transcription")
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath)
        console.log("Temporary file cleaned up:", tempFilePath)
      } catch (cleanupError) {
        console.warn("Failed to clean up temporary file:", cleanupError)
      }
    }
  }
}

/**
 * Generate multi-platform content using GPT-4o-mini
 */
export async function generateContent(caption: string, transcript?: string): Promise<GeneratedContent> {
  // Overload preserved for backwards compatibility
  const { generateContentWithVoice } = await import("@/lib/ai/generate")
  return generateContentWithVoice({ caption, transcript })
}

// Keep generateContentWithVoice available via legacy module path for any imports
export async function generateContentWithVoice(args: {
  caption: string
  transcript?: string
  voice?: BrandVoice
  autoImage?: boolean
}): Promise<GeneratedContent> {
  const { generateContentWithVoice } = await import("@/lib/ai/generate")
  return generateContentWithVoice(args as any)
}
