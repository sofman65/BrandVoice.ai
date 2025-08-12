"use server"
import "server-only"

import type { GeneratedContent } from "./types"
import { sleep } from "./utils"
import { downloadInstagramVideo, validateVideoForTranscription, type MetaGraphAPIError } from "./meta-graph"
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
    // Use Vercel's writable temp directory when on serverless
    const tempDir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "tmp")
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
      temperature: 0.0, // Lower temperature for more consistent results
    })

    await fileStream.close()

    if (!transcription || typeof transcription !== "string") {
      throw new Error("Invalid transcription response from Whisper")
    }

    console.log("Transcription completed successfully")
    return transcription.trim()
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
  // Mock mode for development without API keys
  if (!process.env.OPENAI_API_KEY) {
    console.log("OpenAI not configured, using mock data")
    await sleep(1000) // Simulate API delay

    const mockContent = {
      linkedin: `🚀 Exciting breakthrough in space technology! 

${caption}

${transcript ? `As explained in the video: "${transcript.slice(0, 150)}..."` : ""}

This innovation is set to revolutionize how we approach space exploration and satellite deployment. The implications for global connectivity and scientific research are truly astronomical! 💫

What do you think about this development? Would love to hear your thoughts in the comments!

#SpaceTechnology #Innovation #FutureOfSpace #SatelliteTech #BrandVoice.ai`,

      carousel: [
        {
          heading: "🚀 BREAKING: Space-Tech Revolution",
          body: `${caption.slice(0, 100)}... This changes everything about how we approach space!`
        },
        {
          heading: "The Challenge We've Been Facing",
          body: "For decades, space technology has been limited by cost, weight, and deployment challenges. These constraints have held back innovation and practical applications."
        },
        {
          heading: "Introducing the Game-Changer",
          body: `${transcript ? `${transcript.slice(0, 150)}...` : "This new technology"} represents a paradigm shift in how we approach orbital deployments and space missions.`
        },
        {
          heading: "Why This Matters for Everyone",
          body: "Beyond the scientific community, this breakthrough will impact global communications, climate monitoring, and could accelerate our journey to becoming a multi-planetary species."
        },
        {
          heading: "The Future is Looking Up 🌌",
          body: "Follow @spaceslam for more cutting-edge space technology updates and insights that are changing our cosmic future!"
        }
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
    };

    // Generate image prompts for the carousel slides
    const slidesWithPrompts = await generateImagePrompts(mockContent.carousel);

    // Env-gated image generation to avoid long blocking requests by default
    const autoGenerate = process.env.AUTO_IMAGE_GEN === "true";
    if (!autoGenerate) {
      return {
        ...mockContent,
        carousel: slidesWithPrompts,
      };
    }

    // Generate images for the slides
    const slidesWithImages = await generateImagesForSlides(slidesWithPrompts);

    return {
      ...mockContent,
      carousel: slidesWithImages,
    };
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
  "carousel": [
    {
      "heading": "Slide 1 Title (attention-grabbing)",
      "body": "Slide 1 main content that expands on the title"
    },
    {
      "heading": "Slide 2 Title (problem/challenge)",
      "body": "Slide 2 main content that addresses the problem"
    },
    {
      "heading": "Slide 3 Title (solution/insight)",
      "body": "Slide 3 main content that presents the solution"
    },
    {
      "heading": "Slide 4 Title (benefits/results)",
      "body": "Slide 4 main content that showcases benefits"
    },
    {
      "heading": "Slide 5 Title (call to action)",
      "body": "Slide 5 main content that prompts engagement"
    }
  ],
  "threads": "Conversational Threads post under 500 characters",
  "video_script": "Complete video script with visual cues and timing"
}

IMPORTANT RULES:
- carousel MUST be an array of exactly 5 objects, each with a 'heading' and 'body' (not strings)
- Each carousel slide should be a complete, engaging story element (not just a title)
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
      const { GeneratedContentSchema } = await import("./schemas")
      // Parse and validate JSON to avoid malformed outputs from LLMs
      parsed = GeneratedContentSchema.parse(JSON.parse(raw)) as GeneratedContent
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", raw)
      throw new Error("AI response was not valid JSON or failed validation")
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
    console.log("Generating image prompts for carousel slides...");
    const slidesWithPrompts = await generateImagePrompts(parsed.carousel);

    // Env-gated image generation to avoid blocking the main request
    const autoGenerate = process.env.AUTO_IMAGE_GEN === "true";
    if (!autoGenerate) {
      parsed.carousel = slidesWithPrompts;
      return parsed;
    }

    // Generate images for the slides
    console.log("Generating images for carousel slides...");
    const slidesWithImages = await generateImagesForSlides(slidesWithPrompts);

    // Update the carousel with image URLs
    parsed.carousel = slidesWithImages;

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
