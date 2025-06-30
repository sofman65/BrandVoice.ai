"use server"
import "server-only"

import type { GeneratedContent } from "./types"
import { sleep } from "./utils"
import { downloadInstagramVideo, validateVideoForTranscription, MetaGraphAPIError } from "./meta-graph"
import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

let cachedClient: import("openai").default | null = null

async function getOpenAI() {
  if (cachedClient) return cachedClient

  if (!process.env.OPENAI_API_KEY) {
    return null
  }

  try {
    const { default: OpenAI } = await import("openai")
    cachedClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    return cachedClient
  } catch (error) {
    console.error("Failed to initialize OpenAI client:", error)
    throw new Error("OpenAI client initialization failed")
  }
}

/**
 * Transcribe audio from Instagram video using Whisper-1
 */
export async function transcribeAudio(mediaUrl: string): Promise<string> {
  // Mock mode
  if (!process.env.OPENAI_API_KEY) {
    await sleep(1000)
    return "Mock transcript: Welcome to this amazing space-tech tutorial! Today I'm going to show you how to boost your productivity using cutting-edge tools and techniques. This is going to revolutionize the way you work and create content."
  }

  const openai = await getOpenAI()
  if (!openai) {
    throw new Error("OpenAI client not initialized")
  }

  let tempFilePath: string | null = null

  try {
    // Download the video file
    console.log("Downloading video for transcription:", mediaUrl)
    const videoBuffer = await downloadInstagramVideo(mediaUrl)

    // Validate the video file
    validateVideoForTranscription(videoBuffer)

    // Create temporary file
    const tempDir = path.join(process.cwd(), "tmp")
    await fs.mkdir(tempDir, { recursive: true })

    const fileName = `video_${randomUUID()}.mp4`
    tempFilePath = path.join(tempDir, fileName)

    // Write video buffer to temporary file
    await fs.writeFile(tempFilePath, videoBuffer)

    console.log("Transcribing video with Whisper-1...")

    // Create file stream for OpenAI
    const fileStream = await fs.open(tempFilePath, "r")

    // Transcribe using Whisper-1
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream.createReadStream(),
      model: "whisper-1",
      language: "en", // Specify language for better accuracy
      response_format: "text",
      temperature: 0.2, // Lower temperature for more consistent results
    })

    await fileStream.close()

    if (!transcription || typeof transcription !== "string") {
      throw new Error("Invalid transcription response from Whisper")
    }

    console.log("Transcription completed successfully")
    return transcription.trim()
  } catch (error) {
    console.error("Transcription error:", error)

    if (error instanceof MetaGraphAPIError) {
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
  // Mock mode
  if (!process.env.OPENAI_API_KEY) {
    await sleep(800)
    return {
      linkedin: `🚀 Exciting developments in the space-tech world! 

${caption}

This innovation is pushing the boundaries of what's possible. The future of technology is literally out of this world! 🌌

${transcript ? `\n\nKey insights from the video:\n• ${transcript.slice(0, 200)}...\n` : ""}

What are your thoughts on this breakthrough? Let's discuss in the comments!

#SpaceTech #Innovation #TechTrends #FutureOfWork #DigitalTransformation #TechNews #BrandVoiceAI`,

      carousel: [
        "🚀 SPACE-TECH BREAKTHROUGH ALERT! Something incredible just happened in the tech world that's about to change everything...",
        "💡 THE INNOVATION REVEALED: Here's what's changing the game and why it matters for the future of technology and business...",
        "🌌 REAL-WORLD IMPACT: This technology is already transforming how we work, create, and connect in the digital universe...",
        "⚡ WHY IT MATTERS NOW: The implications for businesses, creators, and innovators are absolutely massive and immediate...",
        "🔥 WHAT'S NEXT: Ready to be part of the space-tech revolution? Here's how to get started and stay ahead of the curve...",
      ],

      threads: `🚀 Just discovered something mind-blowing in the space-tech world!

${caption.slice(0, 150)}...

${transcript ? `Video highlights: ${transcript.slice(0, 100)}...\n\n` : ""}The future is literally launching right before our eyes. What do you think about this innovation? 

#SpaceTech #Innovation 🌌`,

      video_script: `[HOOK - 0-3 seconds]
🎬 VISUAL: Dramatic zoom on excited face with space background
🗣️ SCRIPT: "You won't believe what just happened in space-tech!"

[PROBLEM/SETUP - 3-8 seconds]  
🎬 VISUAL: Show the innovation/technology
🗣️ SCRIPT: "${caption.slice(0, 100)}..."

[SOLUTION/REVEAL - 8-20 seconds]
🎬 VISUAL: Demonstrate the technology in action with space graphics
🗣️ SCRIPT: "Here's why this changes EVERYTHING for the future...${transcript ? ` As mentioned in the original: ${transcript.slice(0, 80)}...` : ""}"

[CALL TO ACTION - 20-30 seconds]
🎬 VISUAL: Direct to camera with Spaceslam logo
🗣️ SCRIPT: "Follow @spaceslam for more space-tech insights! What's your take on this breakthrough? Drop it in the comments!"

[END SCREEN]
🎬 VISUAL: Subscribe animation with space theme
🗣️ SCRIPT: "Don't miss the next space-tech revolution!"`,
    }
  }

  const openai = await getOpenAI()
  if (!openai) {
    throw new Error("OpenAI client not initialized")
  }

  try {
    const systemPrompt = `You are Spaceslam's energetic, space-tech savvy copywriter with a hint of humor and cosmic flair.

Create cross-platform content that embodies Spaceslam's brand: innovative, energetic, space-themed, and engaging.

CRITICAL: Return ONLY valid JSON in this EXACT format:
{
  "linkedin": "Professional LinkedIn post with hashtags and engagement hooks",
  "carousel": ["slide 1 text", "slide 2 text", "slide 3 text", "slide 4 text", "slide 5 text"],
  "threads": "Conversational Threads post under 500 characters",
  "video_script": "Complete video script with visual cues and timing"
}

IMPORTANT RULES:
- carousel MUST be an array of exactly 5 strings (not objects)
- Each carousel slide should be complete, engaging copy (not just headings)
- Use space-tech terminology and emojis (🚀🌌⚡🔥💡)
- Keep Spaceslam's energetic, innovative tone
- LinkedIn: Professional but exciting, include hashtags, mention BrandVoice.ai
- Carousel: Each slide should tell part of a story, be engaging and complete
- Threads: Conversational, under 500 chars, include hashtags
- Video Script: Include timing, visual cues, and clear CTAs
- If transcript is provided, incorporate key insights naturally`

    const userPrompt = `Transform this Instagram content into multi-platform content:

Caption: ${caption}${transcript ? `\n\nVideo Transcript: ${transcript}` : ""}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      throw new Error("No content generated by OpenAI")
    }

    let parsed: GeneratedContent
    try {
      parsed = JSON.parse(raw)
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", raw)
      throw new Error("AI response was not valid JSON")
    }

    // Validate structure
    if (!parsed.linkedin || !Array.isArray(parsed.carousel) || !parsed.threads || !parsed.video_script) {
      console.error("Invalid response structure:", parsed)
      throw new Error("AI response missing required fields")
    }

    // Ensure carousel contains strings
    if (parsed.carousel.some((slide) => typeof slide !== "string")) {
      console.error("Carousel contains non-string values:", parsed.carousel)
      throw new Error("Carousel must contain only strings")
    }

    // Ensure exactly 5 carousel slides
    while (parsed.carousel.length < 5) {
      parsed.carousel.push(`Slide ${parsed.carousel.length + 1}: Continue the space-tech story...`)
    }
    parsed.carousel = parsed.carousel.slice(0, 5)

    return parsed
  } catch (error) {
    console.error("Content generation error:", error)

    if (error instanceof Error) {
      if (error.message.includes("rate_limit")) {
        throw new Error("OpenAI API rate limit exceeded. Please try again later.")
      }

      if (error.message.includes("insufficient_quota")) {
        throw new Error("OpenAI API quota exceeded. Please check your billing.")
      }

      throw new Error(`Content generation failed: ${error.message}`)
    }

    throw new Error("Unknown error during content generation")
  }
}
