import { type NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { fetchInstagram } from "@/lib/instagram"
import { fetchYouTubeData } from "@/lib/youtube"
import { generateContent, transcribeAudio } from "@/lib/openai"
import { checkRateLimit } from "@/lib/rate-limit"
import { userMessageFromError, newRequestId } from "@/lib/errors"
import { isValidInstagramUrl, isValidYouTubeUrl } from "@/lib/utils"
import { MetaGraphAPIError } from "@/lib/meta-graph"

export const runtime = "nodejs"
export const maxDuration = 60 // Allow up to 60 seconds for video processing

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    // Get client IP for rate limiting
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(ip)
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
          error: "URL is required",
        },
        { status: 400 },
      )
    }

    // Determine the URL type and validate
    const isInstagram = isValidInstagramUrl(url)
    const isYouTube = isValidYouTubeUrl(url)

    if (!isInstagram && !isYouTube) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid URL format. Please provide a valid Instagram or YouTube URL.",
        },
        { status: 400 },
      )
    }

    // Load user's preferred Brand Voice from Clerk public metadata (fallback default)
    const user = await currentUser()
    const brandVoice = (user?.publicMetadata?.brandVoice ?? {
      id: "default",
      name: "Default",
      tone: "confident, helpful, friendly",
      style: "concise, structured, benefits-first",
      vocabulary: "plain language with light emojis",
      audience: "creators and developers",
      hashtags: ["#BrandVoiceAI"],
      ctaStyle: "invite conversation",
    }) as any

    // Fetch content data based on URL type
    let sourceData: any = {}
    let transcript: string | undefined

    try {
      if (isInstagram) {
        // Fetch Instagram data
        console.log("Fetching Instagram data for:", url)
        const instagramData = await fetchInstagram(url)
        console.log("Instagram data fetched:", {
          media_type: instagramData.media_type,
          has_caption: !!instagramData.caption,
          has_media_url: !!instagramData.media_url,
          username: instagramData.username,
        })

        // Transcribe audio if it's a video with media URL
        if (instagramData.media_type === "video" && instagramData.media_url) {
          try {
            console.log("Starting video transcription...")
            transcript = await transcribeAudio(instagramData.media_url)
            console.log("Transcription completed, length:", transcript.length)
          } catch (transcribeError) {
            console.error("Error transcribing audio:", transcribeError)

            // Don't fail the entire request if transcription fails
            // Log the error and continue with just the caption
            if (typeof transcribeError === 'object' &&
              transcribeError !== null &&
              'message' in transcribeError) {
              console.warn("Transcription error:", (transcribeError as Error).message)
            }

            transcript = undefined
          }
        }

        sourceData = {
          content: instagramData.caption,
          source_type: "instagram",
          media_type: instagramData.media_type,
          username: instagramData.username,
          timestamp: instagramData.timestamp,
        }
      } else if (isYouTube) {
        // Fetch YouTube data
        console.log("Fetching YouTube data for:", url)
        const youtubeData = await fetchYouTubeData(url)
        console.log("YouTube data fetched:", {
          title: youtubeData.title,
          has_description: !!youtubeData.description,
          has_transcript: !!youtubeData.transcript,
          channel: youtubeData.channelTitle,
        })

        // Use the transcript from YouTube data
        transcript = youtubeData.transcript

        sourceData = {
          content: `${youtubeData.title}\n\n${youtubeData.description || ''}`,
          source_type: "youtube",
          media_type: "video",
          username: youtubeData.channelTitle,
          timestamp: youtubeData.publishedAt,
          video_id: youtubeData.videoId,
        }
      }
    } catch (fetchError) {
      console.error("Error fetching content data:", fetchError)

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
          error: `Failed to fetch ${isInstagram ? 'Instagram' : 'YouTube'} data`,
        },
        { status: 500 },
      )
    }

    // Generate content
    let generatedContent
    try {
      console.log("Generating content...")
      // Inject brand voice into caption before generation
      const preface = `Rewrite in this Brand Voice profile:\n- Tone: ${brandVoice.tone}\n- Style: ${brandVoice.style}\n- Vocabulary: ${brandVoice.vocabulary}\n- Audience: ${brandVoice.audience}\n- CTA Style: ${brandVoice.ctaStyle}\n- Hashtags to consider: ${(brandVoice.hashtags || []).join(", ")}`
      generatedContent = await generateContent(`${preface}\n\n${sourceData.content}`, transcript)
      console.log("Content generation completed")
    } catch (generateError) {
      const requestId = newRequestId()
      console.error("Error generating content:", { requestId, error: generateError })

      const message = userMessageFromError(generateError)
      return NextResponse.json(
        { success: false, error: message, requestId },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: generatedContent,
        metadata: {
          source_url: url,
          source_type: sourceData.source_type,
          media_type: sourceData.media_type,
          username: sourceData.username,
          has_transcript: !!transcript,
          transcript_length: transcript?.length || 0,
          timestamp: sourceData.timestamp,
          video_id: sourceData.video_id || null,
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
        },
      },
    )
  } catch (error) {
    const requestId = newRequestId()
    console.error("Unexpected error in API route:", { requestId, error })

    return NextResponse.json(
      {
        success: false,
        error: userMessageFromError(error),
        requestId,
      },
      { status: 500 },
    )
  }
}
