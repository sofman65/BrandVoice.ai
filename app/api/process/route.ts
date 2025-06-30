import { type NextRequest, NextResponse } from "next/server"
import { fetchInstagram } from "@/lib/instagram"
import { generateContent, transcribeAudio } from "@/lib/openai"
import { checkRateLimit } from "@/lib/rate-limit"
import { isValidInstagramUrl } from "@/lib/utils"
import { MetaGraphAPIError } from "@/lib/meta-graph"

export const runtime = "nodejs"
export const maxDuration = 60 // Allow up to 60 seconds for video processing

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

    // Parse request body
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

    // Fetch Instagram data
    let instagramData
    try {
      console.log("Fetching Instagram data for:", url)
      instagramData = await fetchInstagram(url)
      console.log("Instagram data fetched:", {
        media_type: instagramData.media_type,
        has_caption: !!instagramData.caption,
        has_media_url: !!instagramData.media_url,
        username: instagramData.username,
      })
    } catch (fetchError) {
      console.error("Error fetching Instagram data:", fetchError)

      if (fetchError instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: fetchError.message,
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch Instagram post data",
        },
        { status: 500 },
      )
    }

    // Transcribe audio if it's a video with media URL
    let transcript: string | undefined
    if (instagramData.media_type === "video" && instagramData.media_url) {
      try {
        console.log("Starting video transcription...")
        transcript = await transcribeAudio(instagramData.media_url)
        console.log("Transcription completed, length:", transcript.length)
      } catch (transcribeError) {
        console.error("Error transcribing audio:", transcribeError)

        // Don't fail the entire request if transcription fails
        // Log the error and continue with just the caption
        if (transcribeError instanceof MetaGraphAPIError) {
          console.warn("Meta Graph API error during transcription:", transcribeError.message)
        } else if (transcribeError instanceof Error) {
          console.warn("Transcription error:", transcribeError.message)
        }

        transcript = undefined
      }
    }

    // Generate content
    let generatedContent
    try {
      console.log("Generating content...")
      generatedContent = await generateContent(instagramData.caption, transcript)
      console.log("Content generation completed")
    } catch (generateError) {
      console.error("Error generating content:", generateError)

      if (generateError instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: generateError.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate content",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: generatedContent,
        metadata: {
          source_url: url,
          media_type: instagramData.media_type,
          username: instagramData.username,
          has_transcript: !!transcript,
          transcript_length: transcript?.length || 0,
          timestamp: instagramData.timestamp,
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
        },
      },
    )
  } catch (error) {
    console.error("Unexpected error in API route:", error)

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 },
    )
  }
}
