import { type NextRequest, NextResponse } from "next/server"
import { fetchInstagram } from "@/lib/instagram"
import { generateContent, transcribeAudio } from "@/lib/openai"
import { checkRateLimit } from "@/lib/rate-limit"
import { isValidInstagramUrl } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"

    // Check rate limit
    const { allowed, remaining } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": remaining.toString(),
          },
        },
      )
    }

    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 },
      )
    }

    const { url } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Instagram URL is required",
        },
        { status: 400 },
      )
    }

    if (!isValidInstagramUrl(url)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Instagram URL format",
        },
        { status: 400 },
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.",
        },
        { status: 500 },
      )
    }

    // Fetch Instagram data with error handling
    let instagramData
    try {
      instagramData = await fetchInstagram(url)
    } catch (fetchError) {
      console.error("Error fetching Instagram data:", fetchError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch Instagram post data",
        },
        { status: 500 },
      )
    }

    // Transcribe audio if it's a video
    let transcript: string | undefined
    if (instagramData.media_type === "video" && instagramData.audio_url) {
      try {
        transcript = await transcribeAudio(instagramData.audio_url)
      } catch (transcribeError) {
        console.error("Error transcribing audio:", transcribeError)
        // Continue without transcript rather than failing completely
        transcript = undefined
      }
    }

    // Generate content with error handling
    let generatedContent
    try {
      generatedContent = await generateContent(instagramData.caption, transcript)
    } catch (generateError) {
      console.error("Error generating content:", generateError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate content. Please check your OpenAI API key and try again.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: generatedContent,
      },
      {
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
        },
      },
    )
  } catch (error) {
    console.error("Unexpected error in API route:", error)

    // Ensure we always return valid JSON
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 },
    )
  }
}
