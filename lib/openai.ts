"use server"
import "server-only"

import type { GeneratedContent } from "./types"
import type { BrandVoice } from "./types"
import { sleep } from "./utils"
// import { downloadInstagramVideo, validateVideoForTranscription, type MetaGraphAPIError } from "./meta-graph"
import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { generateImagePrompts, generateImagesForSlides } from "./image-generator"

let cachedClient: import("openai").default | null = null

export async function getOpenAI() {
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

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  return new Promise<T>((resolve, reject) => {
    promise
      .then((v) => resolve(v))
      .catch((e) => {
        if ((e as any)?.name === "AbortError") {
          reject(new Error(`${label} timed out after ${ms}ms`))
          return
        }
        reject(e)
      })
      .finally(() => clearTimeout(timeout))
  })
}

function buildVoiceHeader(voice?: BrandVoice): string {
  if (!voice) return ""
  const tags = Array.isArray(voice.hashtags) && voice.hashtags.length > 0 ? voice.hashtags.join(", ") : ""
  return `Use this Brand Voice exactly:
- Name: ${voice.name}
- Tone: ${voice.tone}
- Style: ${voice.style}
- Vocabulary: ${voice.vocabulary}
- Audience: ${voice.audience}
- CTA Style: ${voice.ctaStyle ?? "invite conversation"}
- Hashtags to consider: ${tags}`
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
  return generateContentWithVoice({ caption, transcript })
}

export async function generateContentWithVoice({
  caption,
  transcript,
  voice,
  autoImage = process.env.AUTO_IMAGE_GEN === "true",
}: {
  caption: string
  transcript?: string
  voice?: BrandVoice
  autoImage?: boolean
}): Promise<GeneratedContent> {
  // Mock mode for development without API keys
  if (!process.env.OPENAI_API_KEY) {
    console.log("OpenAI not configured, using mock data")
    await sleep(1000) // Simulate API delay

    const tagLine = voice?.hashtags?.join(" ") || "#BrandVoiceAI"
    const mockContent = {
      linkedin: `🚀 ${voice?.name || "BrandVoice"} Take:

${caption}

${transcript ? `Video insight: "${transcript.slice(0, 150)}..."` : ""}

${tagLine}`,
      carousel: [
        { heading: "Key Idea", body: caption.slice(0, 120) + "..." },
        { heading: "Why It Matters", body: "Clear benefit-focused explanation in the saved voice." },
        { heading: "How To Use It", body: "Practical next steps the audience can take today." },
        { heading: "Common Pitfall", body: "One mistake to avoid, phrased in the saved voice." },
        { heading: "Call To Action", body: voice?.ctaStyle || "Invite conversation and follows." },
      ],
      threads: `Quick takeaway → ${caption.slice(0, 120)}… ${tagLine}`,
      video_script: `Intro → Hook in saved voice\nBody → 2–3 benefit points\nCTA → ${voice?.ctaStyle || "Join the conversation"}`,
    }

    // Generate image prompts for the carousel slides
    const slidesWithPrompts = await generateImagePrompts(mockContent.carousel)
    if (!autoImage) {
      return {
        ...mockContent,
        carousel: slidesWithPrompts,
      }
    }

    // Generate images for the slides
    const slidesWithImages = await generateImagesForSlides(slidesWithPrompts)

    return {
      ...mockContent,
      carousel: slidesWithImages,
    }
  }

  const openai = await getOpenAI()
  if (!openai) {
    throw new Error("OpenAI client not initialized")
  }

  try {
    const systemPrompt = `${buildVoiceHeader(voice)}

You are the BrandVoice.ai writer. Rewrite and transform content according to the Brand Voice above.

IMPORTANT: You must return a JSON object with exactly these 4 fields:
- "linkedin": A professional LinkedIn post (long-form text)
- "carousel": An array of 5 objects, each with "heading" and "body" fields for Instagram carousel slides
- "threads": A short Threads post (under 500 characters)
- "video_script": A multi-line video script with timing cues

Example structure:
{
  "linkedin": "Professional LinkedIn content here...",
  "carousel": [
    {"heading": "Slide 1 Title", "body": "Slide 1 content..."},
    {"heading": "Slide 2 Title", "body": "Slide 2 content..."},
    {"heading": "Slide 3 Title", "body": "Slide 3 content..."},
    {"heading": "Slide 4 Title", "body": "Slide 4 content..."},
    {"heading": "Slide 5 Title", "body": "Slide 5 content..."}
  ],
  "threads": "Short Threads post here...",
  "video_script": "Video script with timing cues..."
}

Return ONLY this JSON structure, nothing else.`

    const userPrompt = `Transform this content into the required JSON format:

Source Caption:
${caption}${transcript ? `\n\nTranscript (optional):\n${transcript}` : ""}

Generate cross-platform content in the saved voice. Make sure to return exactly the JSON structure specified in the system prompt.`

    const completion = await withTimeout(
      openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" as any },
    }),
      30000,
      "Content generation"
    )

    let raw = completion.choices[0]?.message?.content
    if (!raw) {
      throw new Error("No content generated by OpenAI")
    }

    let parsed: GeneratedContent | null = null
    let retryCount = 0
    const maxRetries = 2

    while (retryCount <= maxRetries && !parsed) {
      try {
        const { GeneratedContentSchema } = await import("./types")
        // Parse and validate JSON to avoid malformed outputs from LLMs
        parsed = GeneratedContentSchema.parse(JSON.parse(raw)) as GeneratedContent
        break // Success, exit retry loop
      } catch (parseError) {
        retryCount++
        console.error(`Failed to parse OpenAI response (attempt ${retryCount}):`, raw)
        console.error("Parse error details:", parseError)
        
        if (retryCount > maxRetries) {
          // Final attempt failed, generate fallback content
          console.warn("All retries failed, generating fallback content")
          return await generateFallbackContent(caption, transcript, voice)
        }
        
        // Retry with more explicit instructions
        console.log(`Retrying with more explicit instructions (attempt ${retryCount + 1})`)
        const retryPrompt = `The previous response was invalid. Please return ONLY a valid JSON object with exactly these fields:
{
  "linkedin": "Professional LinkedIn post content",
  "carousel": [
    {"heading": "Slide 1", "body": "Content for slide 1"},
    {"heading": "Slide 2", "body": "Content for slide 2"},
    {"heading": "Slide 3", "body": "Content for slide 3"},
    {"heading": "Slide 4", "body": "Content for slide 4"},
    {"heading": "Slide 5", "body": "Content for slide 5"}
  ],
  "threads": "Short Threads post",
  "video_script": "Video script content"
}

Transform this content: ${caption}${transcript ? `\n\nTranscript: ${transcript}` : ""}`

        const retryCompletion = await withTimeout(
          openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a JSON generator. Return ONLY valid JSON." },
              { role: "user", content: retryPrompt },
            ],
            temperature: 0.3, // Lower temperature for more consistent output
            max_tokens: 2500,
            response_format: { type: "json_object" as any },
          }),
          30000,
          "Content generation retry"
        )
        
        raw = retryCompletion.choices[0]?.message?.content
        if (!raw) {
          throw new Error("No content generated in retry")
        }
      }
    }

    if (!parsed) {
      throw new Error("Failed to generate valid content after all retries")
    }

    // Validate structure
    if (!parsed.linkedin || !Array.isArray(parsed.carousel) || !parsed.threads || !parsed.video_script) {
      console.error("Invalid response structure:", parsed)
      throw new Error("AI response missing required fields")
    }

    // Ensure carousel contains objects with heading and body
    if (parsed.carousel.some((slide) => typeof slide !== "object" || !slide.heading || !slide.body)) {
      console.error("Carousel contains invalid objects:", parsed.carousel)
      throw new Error("Carousel must contain objects with 'heading' and 'body'")
    }

    // Ensure exactly 5 carousel slides
    while (parsed.carousel.length < 5) {
      parsed.carousel.push({
        heading: `Slide ${parsed.carousel.length + 1} Title`,
        body: `Continue the space-tech story...`,
      })
    }
    parsed.carousel = parsed.carousel.slice(0, 5)

    // Generate image prompts for the carousel slides
    console.log("Generating image prompts for carousel slides...")
    const slidesWithPrompts = await generateImagePrompts(parsed.carousel)
    if (!autoImage) {
      parsed.carousel = slidesWithPrompts
      return parsed
    }

    // Generate images for the slides
    console.log("Generating images for carousel slides...")
    const slidesWithImages = await generateImagesForSlides(slidesWithPrompts)

    // Update the carousel with image URLs
    parsed.carousel = slidesWithImages

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

/**
 * Generate fallback content when AI validation fails
 */
async function generateFallbackContent(
  caption: string,
  transcript?: string,
  voice?: BrandVoice
): Promise<GeneratedContent> {
  console.log("Generating fallback content")
  
  const tagLine = voice?.hashtags?.join(" ") || "#BrandVoiceAI"
  const shortCaption = caption.length > 200 ? caption.substring(0, 200) + "..." : caption
  
  const fallbackContent: GeneratedContent = {
    linkedin: `🚀 ${voice?.name || "BrandVoice"} Take:

${shortCaption}

${transcript ? `Video insight: "${transcript.slice(0, 150)}..."` : ""}

${tagLine}`,
    carousel: [
      { heading: "Key Insight", body: shortCaption },
      { heading: "Why It Matters", body: "This content provides valuable insights for creators and developers." },
      { heading: "How To Apply", body: "Take action on these insights to improve your workflow." },
      { heading: "Pro Tip", body: "Remember to adapt these concepts to your specific needs." },
      { heading: "Next Steps", body: voice?.ctaStyle || "Join the conversation and share your thoughts!" },
    ],
    threads: `Quick takeaway → ${shortCaption.slice(0, 120)}… ${tagLine}`,
    video_script: `Intro → Hook with this insight\nBody → 2–3 key points from the content\nCTA → ${voice?.ctaStyle || "Join the conversation"}`,
  }

  // Generate image prompts for the carousel slides
  const slidesWithPrompts = await generateImagePrompts(fallbackContent.carousel)
  return {
    ...fallbackContent,
    carousel: slidesWithPrompts,
  }
}
