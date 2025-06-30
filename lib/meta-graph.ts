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

// Regular class, not exported directly from server module
class MetaGraphAPIErrorClass extends Error {
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

// Export through an async wrapper function
export async function createMetaGraphAPIError(
  message: string,
  code: number,
  type: string,
  subcode?: number,
  traceId?: string,
): Promise<MetaGraphAPIErrorClass> {
  return new MetaGraphAPIErrorClass(message, code, type, subcode, traceId);
}

// Type for external use
export type MetaGraphAPIError = MetaGraphAPIErrorClass;

// Helper function to check if an error is a MetaGraphAPIError
export async function isMetaGraphAPIError(error: unknown): Promise<boolean> {
  return error instanceof MetaGraphAPIErrorClass;
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
export async function shortcodeToMediaId(shortcode: string): Promise<string> {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
  let mediaId = BigInt(0)

  for (let i = 0; i < shortcode.length; i++) {
    const char = shortcode[i]
    const index = alphabet.indexOf(char)
    if (index === -1) {
      throw new Error(`Invalid character in shortcode: ${char}`)
    }
    mediaId = mediaId * BigInt(64) + BigInt(index)
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
    const error = await createMetaGraphAPIError("Meta access token is not configured", 401, "AuthenticationError");
    throw error;
  }

  const shortcode = extractInstagramMediaId(url)
  if (!shortcode) {
    const error = await createMetaGraphAPIError("Invalid Instagram URL format", 400, "InvalidURL");
    throw error;
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
      const error = await createMetaGraphAPIError(
        errorData.error.message,
        errorData.error.code,
        errorData.error.type,
        errorData.error.error_subcode,
        errorData.error.fbtrace_id,
      )
      throw error
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
    if (error instanceof MetaGraphAPIErrorClass) {
      throw error
    }

    // Handle rate limiting
    if (error instanceof Error && error.message.includes("rate limit")) {
      const rateLimitError = await createMetaGraphAPIError(
        "Instagram API rate limit exceeded. Please try again later.",
        429,
        "RateLimitError"
      );
      throw rateLimitError;
    }

    // Handle network errors
    if (error instanceof Error && error.message.includes("network")) {
      const networkError = await createMetaGraphAPIError(
        "Network error while fetching Instagram data",
        503,
        "NetworkError"
      );
      throw networkError;
    }

    // Generic API error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const genericError = await createMetaGraphAPIError(
      `Instagram API error: ${errorMessage}`,
      500,
      "APIError"
    );
    throw genericError;
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
      const error = await createMetaGraphAPIError(
        `Failed to download video: HTTP ${response.status}`,
        response.status,
        "DownloadError",
      );
      throw error;
    }

    const contentType = response.headers.get("content-type")
    if (!contentType?.startsWith("video/")) {
      throw new Error(`Invalid content type: ${contentType}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    if (error instanceof MetaGraphAPIErrorClass) {
      throw error
    }

    const downloadError = await createMetaGraphAPIError(
      error instanceof Error ? error.message : "Unknown download error",
      500,
      "DownloadError",
    );
    throw downloadError;
  }
}

/**
 * Validate video file for Whisper processing
 */
export async function validateVideoForTranscription(buffer: Buffer, maxSizeBytes = 25 * 1024 * 1024): Promise<void> {
  // Check file size (Whisper has a 25MB limit)
  if (buffer.length > maxSizeBytes) {
    const error = await createMetaGraphAPIError(
      `Video file too large (${Math.round(buffer.length / 1024 / 1024)}MB). Max size is ${Math.round(
        maxSizeBytes / 1024 / 1024,
      )}MB`,
      413,
      "PayloadTooLargeError",
    )
    throw error
  }

  // Additional validations can be added here
}
