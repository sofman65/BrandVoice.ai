import { type NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
// import { fetchInstagram } from "@/lib/instagram"
import { fetchYouTubeData } from "@/lib/youtube"
import { generateContent, generateContentWithVoice } from "@/lib/openai"
import { checkRateLimit } from "@/lib/rate-limit"
import { userMessageFromError, newRequestId } from "@/lib/errors"
import { isValidInstagramUrl, isValidYouTubeUrl } from "@/lib/utils"
// import { MetaGraphAPIError } from "@/lib/meta-graph"
import { ProcessPayloadSchema } from "@/lib/models/dto"
import { db } from "@/lib/db"
import { missionOutcomes } from "@/lib/db/schema"

// Temporary stub for Instagram functionality
async function fetchInstagram(url: string) {
  throw new Error("Instagram functionality is not yet implemented")
  // This will never be reached, but satisfies TypeScript
  return {
    media_type: "image",
    caption: "",
    media_url: "",
    username: "",
    timestamp: new Date().toISOString()
  }
}

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

    // Parse request body (supports new DTO while remaining permissive)
    let body: any
    try {
      const raw = await request.json()
      const parsed = ProcessPayloadSchema.safeParse(raw)
      body = parsed.success ? parsed.data : raw
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
    
    console.log("🔍 URL validation:", { url, isInstagram, isYouTube })

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
    const brandVoice = (body.voice ?? user?.publicMetadata?.brandVoice ?? {
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

        // Transcription disabled for now; continue with caption-only for Instagram
        transcript = undefined

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
      console.log("📝 Source data:", { content: sourceData.content, hasTranscript: !!transcript })

      // Support legacy 'referenceContent' by mapping it into referenceItems
      const referenceItems = Array.isArray(body.referenceItems) ? body.referenceItems :
        body.referenceContent ? [
          {
            id: "legacy-0",
            title: body.referenceContent.title,
            platform: body.referenceContent.platform,
            summary: body.referenceContent.description,
            key_points: Array.isArray(body.referenceContent.tags) ? body.referenceContent.tags : undefined,
          },
        ] : undefined

      // Prefer the new orchestrator so we can pass context
      generatedContent = await generateContentWithVoice({
        caption: sourceData.content,
        transcript,
        voice: brandVoice as any,
        autoImage: typeof body.autoImage === "boolean" ? body.autoImage : (process.env.AUTO_IMAGE_GEN === "true"),
      })
      console.log("✅ Content generation completed:", generatedContent)
    } catch (generateError) {
      const requestId = newRequestId()
      console.error("Error generating content:", { requestId, error: generateError })

      const message = userMessageFromError(generateError)
      return NextResponse.json(
        { success: false, error: message, requestId },
        { status: 500 },
      )
    }

    // Save generated content to mission_outcomes table if missionId is provided
    let savedOutcomes: any[] = []
    if (body.missionId && generatedContent) {
      try {
        console.log("💾 Saving outcomes to database for mission:", body.missionId)
        
        const outcomesToSave = [
          {
            id: crypto.randomUUID(),
            missionId: String(body.missionId),
            type: 'linkedin_post' as const,
            title: 'LinkedIn Post',
            content: generatedContent.linkedin,
            metadata: null,
            status: 'draft' as const,
          },
          {
            id: crypto.randomUUID(),
            missionId: String(body.missionId),
            type: 'threads' as const,
            title: 'Threads Post',
            content: generatedContent.threads,
            metadata: null,
            status: 'draft' as const,
          },
          {
            id: crypto.randomUUID(),
            missionId: String(body.missionId),
            type: 'instagram_carousel' as const,
            title: 'Instagram Carousel',
            content: JSON.stringify(generatedContent.carousel),
            metadata: { 
              slideCount: generatedContent.carousel?.length || 0,
              slides: generatedContent.carousel 
            },
            status: 'draft' as const,
          },
          {
            id: crypto.randomUUID(),
            missionId: String(body.missionId),
            type: 'video_script' as const,
            title: 'Video Script',
            content: generatedContent.video_script,
            metadata: null,
            status: 'draft' as const,
          }
        ]

        savedOutcomes = await db.insert(missionOutcomes).values(outcomesToSave).returning()
        console.log("✅ Saved outcomes to database:", savedOutcomes.length, "outcomes")
      } catch (saveError) {
        console.error("⚠️ Failed to save outcomes to database:", saveError)
        // Don't fail the entire request if saving fails, just log the error
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: generatedContent,
        savedOutcomes: savedOutcomes.length > 0 ? savedOutcomes : undefined,
        metadata: {
          source_url: url,
          source_type: sourceData.source_type,
          media_type: sourceData.media_type,
          username: sourceData.username,
          has_transcript: !!transcript,
          transcript_length: transcript?.length || 0,
          timestamp: sourceData.timestamp,
          video_id: sourceData.video_id || null,
          has_reference_content: Array.isArray(body.referenceItems) ? body.referenceItems.length > 0 : !!body.referenceContent,
          reference_content_title: Array.isArray(body.referenceItems) ? (body.referenceItems[0]?.title || null) : (body.referenceContent?.title || null),
          reference_content_platform: Array.isArray(body.referenceItems) ? (body.referenceItems[0]?.platform || null) : (body.referenceContent?.platform || null),
          outcomes_saved: savedOutcomes.length > 0,
          mission_id: body.missionId || null,
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
