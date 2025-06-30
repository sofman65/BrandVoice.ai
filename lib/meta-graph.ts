"use server"
import "server-only"

interface MetaGraphResponse {
  id: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  media_url?: string
  permalink: string
  caption?: string
  timestamp: string
  thumbnail_url?: string
  username?: string
}

interface MetaGraphError {
  error: {
    message: string
    type: string
    code: number
    error_subcode?: number
    fbtrace_id: string
  }
}

export class MetaGraphAPIError extends Error {
  constructor(
    message: string,
    public code: number,
    public type: string,
    public subcode?: number,
    public traceId?: string,
  ) {
    super(message)
    this.name = "MetaGraphAPIError"
  }
}

/**
 * Extract Instagram media ID from various URL formats
 */
function extractInstagramMediaId(url: string): string | null {
  // Handle various Instagram URL formats:
  // https://www.instagram.com/p/ABC123/
  // https://www.instagram.com/reel/ABC123/
  // https://instagram.com/p/ABC123/?hl=en

  const patterns = [
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * Convert Instagram shortcode to media ID
 * Instagram uses base64-like encoding for shortcodes
 */
function shortcodeToMediaId(shortcode: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
  let mediaId = 0n

  for (let i = 0; i < shortcode.length; i++) {
    const char = shortcode[i]
    const index = alphabet.indexOf(char)
    if (index === -1) {
      throw new Error(`Invalid character in shortcode: ${char}`)
    }
    mediaId = mediaId * 64n + BigInt(index)
  }

  return mediaId.toString()
}

/**
 * Fetch Instagram media data using Meta Graph API
 */
export async function fetchInstagramMedia(url: string): Promise<{
  caption: string
  media_type: "image" | "video"
  media_url?: string
  thumbnail_url?: string
  username?: string
  timestamp: string
}> {
  if (!process.env.META_ACCESS_TOKEN) {
    throw new MetaGraphAPIError("Meta access token is not configured", 401, "AuthenticationError")
  }

  const shortcode = extractInstagramMediaId(url)
  if (!shortcode) {
    throw new MetaGraphAPIError("Invalid Instagram URL format", 400, "InvalidURL")
  }

  try {
    // Convert shortcode to media ID for Graph API
    const mediaId = shortcodeToMediaId(shortcode)

    // Fetch media data from Meta Graph API
    const fields = [
      "id",
      "media_type",
      "media_url",
      "permalink",
      "caption",
      "timestamp",
      "thumbnail_url",
      "username",
    ].join(",")

    const graphUrl = `https://graph.instagram.com/${mediaId}?fields=${fields}&access_token=${process.env.META_ACCESS_TOKEN}`

    const response = await fetch(graphUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "BrandVoice.ai/1.0",
      },
    })

    if (!response.ok) {
      const errorData: MetaGraphError = await response.json()
      throw new MetaGraphAPIError(
        errorData.error.message,
        errorData.error.code,
        errorData.error.type,
        errorData.error.error_subcode,
        errorData.error.fbtrace_id,
      )
    }

    const data: MetaGraphResponse = await response.json()

    return {
      caption: data.caption || "",
      media_type: data.media_type === "VIDEO" ? "video" : "image",
      media_url: data.media_url,
      thumbnail_url: data.thumbnail_url,
      username: data.username,
      timestamp: data.timestamp,
    }
  } catch (error) {
    if (error instanceof MetaGraphAPIError) {
      throw error
    }

    // Handle rate limiting
    if (error instanceof Error && error.message.includes("rate limit")) {
      throw new MetaGraphAPIError("Instagram API rate limit exceeded. Please try again later.", 429, "RateLimitError")
    }

    // Handle network errors
    if (error instanceof Error && (error.message.includes("fetch") || error.message.includes("network"))) {
      throw new MetaGraphAPIError("Network error while fetching Instagram data", 503, "NetworkError")
    }

    throw new MetaGraphAPIError(
      `Failed to fetch Instagram media: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
      "UnknownError",
    )
  }
}

/**
 * Download video file from Instagram media URL
 */
export async function downloadInstagramVideo(mediaUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(mediaUrl, {
      headers: {
        "User-Agent": "BrandVoice.ai/1.0",
        Accept: "video/*",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to download video: HTTP ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType?.startsWith("video/")) {
      throw new Error(`Invalid content type: ${contentType}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    throw new MetaGraphAPIError(
      `Failed to download video: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
      "DownloadError",
    )
  }
}

/**
 * Validate video file for Whisper processing
 */
export function validateVideoForTranscription(buffer: Buffer, maxSizeBytes = 25 * 1024 * 1024): void {
  // Check file size (Whisper has a 25MB limit)
  if (buffer.length > maxSizeBytes) {
    throw new MetaGraphAPIError(
      `Video file too large: ${(buffer.length / 1024 / 1024).toFixed(1)}MB (max: ${maxSizeBytes / 1024 / 1024}MB)`,
      413,
      "FileTooLarge",
    )
  }

  // Basic validation - check for video file signatures
  const videoSignatures = [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // MP4
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // MP4
    [0x1a, 0x45, 0xdf, 0xa3], // WebM/MKV
    [0x46, 0x4c, 0x56, 0x01], // FLV
  ]

  const hasValidSignature = videoSignatures.some((signature) => {
    return signature.every((byte, index) => buffer[index] === byte)
  })

  if (!hasValidSignature) {
    throw new MetaGraphAPIError("Invalid video file format", 415, "UnsupportedMediaType")
  }
}
