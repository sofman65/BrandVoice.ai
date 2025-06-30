"use server"
import "server-only"

import { fetchInstagramMedia, MetaGraphAPIError } from "./meta-graph"
import { sleep } from "./utils"

/**
 * Enhanced Instagram fetcher using Meta Graph API
 * Falls back to mock data if API is not configured
 */
export async function fetchInstagram(url: string): Promise<{
  caption: string
  media_type: "image" | "video"
  media_url?: string
  thumbnail_url?: string
  username?: string
  timestamp?: string
}> {
  // Check if Meta Graph API is configured
  if (!process.env.META_ACCESS_TOKEN) {
    console.warn("Meta Graph API not configured, using mock data")
    await sleep(500)

    // Enhanced mock data based on URL pattern
    const isVideo = /\/reel\/|\/tv\//.test(url) || url.includes("video")

    return {
      caption:
        "🚀 Explaining how I boosted developer productivity by 10× with Space-Tech hacks. #coding #productivity #spaceslam",
      media_type: isVideo ? "video" : "image",
      media_url: isVideo ? "https://example.com/mock-video.mp4" : "https://example.com/mock-image.jpg",
      thumbnail_url: "https://example.com/mock-thumbnail.jpg",
      username: "spaceslam_official",
      timestamp: new Date().toISOString(),
    }
  }

  try {
    const mediaData = await fetchInstagramMedia(url)
    return mediaData
  } catch (error) {
    if (error instanceof MetaGraphAPIError) {
      // Log the specific error for debugging
      console.error("Meta Graph API Error:", {
        message: error.message,
        code: error.code,
        type: error.type,
        subcode: error.subcode,
        traceId: error.traceId,
      })

      // Handle specific error types
      switch (error.type) {
        case "AuthenticationError":
          throw new Error("Instagram API authentication failed. Please check your access token.")

        case "RateLimitError":
          throw new Error("Instagram API rate limit exceeded. Please try again later.")

        case "InvalidURL":
          throw new Error("Invalid Instagram URL format. Please provide a valid Instagram post URL.")

        case "NetworkError":
          throw new Error("Network error while fetching Instagram data. Please try again.")

        default:
          throw new Error(`Instagram API error: ${error.message}`)
      }
    }

    // Handle unexpected errors
    console.error("Unexpected error in fetchInstagram:", error)
    throw new Error("Failed to fetch Instagram post data")
  }
}

/**
 * Extract audio URL from Instagram video for transcription
 * In practice, this would be the same as media_url for videos
 */
export function getAudioUrlFromVideo(mediaUrl: string): string {
  // For Instagram videos, the media_url contains both video and audio
  // Whisper can extract audio from video files directly
  return mediaUrl
}
