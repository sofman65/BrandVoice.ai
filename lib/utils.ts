import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Validate an Instagram URL.
 * Supports   https://www.instagram.com/p/<id>/
 *            https://www.instagram.com/reel/<id>/
 * Allows any trailing query-string ( ?hl=en … ).
 */
export function isValidInstagramUrl(url: string): boolean {
  const regex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?(?:\?.*)?$/
  return regex.test(url.trim())
}

/**
 * Validate a YouTube URL.
 * Supports standard youtube.com/watch?v=<id>, youtu.be/<id>, 
 * youtube.com/shorts/<id>, and youtube.com/embed/<id> formats.
 */
export function isValidYouTubeUrl(url: string): boolean {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/
  return regex.test(url.trim())
}

/** Sleep helper (mainly for stubbing async work). */
export async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncate(text: string | undefined | null, max = 48): string {
  if (!text) return ""
  if (text.length <= max) return text
  return text.slice(0, Math.max(0, max - 1)) + "…"
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

/**
 * Extract audio URL from Instagram video for transcription
 * In practice, this would be the same as media_url for videos
 */
export function getAudioUrlFromVideo(mediaUrl: string): string {
  // For Instagram videos, the media_url contains both video and audio
  // Whisper can extract audio from video files directly
  if (!mediaUrl || !/^https?:\/\//.test(mediaUrl)) {
    throw new Error("Media URL must be a valid HTTP(S) URL")
  }
  return mediaUrl
}

// ============================================================================
// URL VALIDATION & PROCESSING
// ============================================================================

export type SourceType = "instagram" | "youtube"

export interface UrlValidationResult {
  isValid: boolean
  type: SourceType | null
  notSupported?: boolean
}

/**
 * Validate URL and determine source type
 * Note: Instagram support is not yet implemented
 */
export function validateUrl(url: string): UrlValidationResult {
  if (!url.trim()) {
    return { isValid: false, type: null }
  }

  if (isValidYouTubeUrl(url)) {
    return { isValid: true, type: "youtube" }
  }

  // Instagram URLs are detected but marked as not supported
  if (isValidInstagramUrl(url)) {
    return { isValid: false, type: "instagram", notSupported: true }
  }

  return { isValid: false, type: null }
}

/**
 * Get platform icon name for consistent icon usage
 */
export function getPlatformIconName(platform: string): string {
  switch (platform) {
    case "youtube":
      return "youtube"
    case "instagram":
      return "instagram"
    case "tiktok":
      return "video"
    default:
      return "video"
  }
}

/**
 * Get platform icon configuration for consistent styling
 */
export function getPlatformIconConfig(platform: string): { name: string; className: string } {
  switch (platform) {
    case "youtube":
      return { name: "youtube", className: "h-4 w-4 text-red-500" }
    case "instagram":
      return { name: "instagram", className: "h-4 w-4 text-pink-500" }
    case "tiktok":
      return { name: "video", className: "h-4 w-4 text-black" }
    default:
      return { name: "video", className: "h-4 w-4" }
  }
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

/**
 * Transform mission outcomes to generated content format
 */
export function transformOutcomesToGeneratedContent(outcomes: any[]): any | null {
  if (!outcomes || outcomes.length === 0) return null

  const result: any = {}
  
  outcomes.forEach((outcome) => {
    switch (outcome.type) {
      case "linkedin_post":
        result.linkedin = outcome.content
        break
      case "threads":
        result.threads = outcome.content
        break
      case "instagram_carousel":
        result.carousel = outcome.metadata?.slides || [outcome.content]
        break
      case "video_script":
        result.video_script = outcome.content
        break
    }
  })

  return Object.keys(result).length > 0 ? result : null
}

/**
 * Handle both string and object carousel slides
 */
export function readableSlide(slide: any): string {
  if (typeof slide === "string") {
    return slide
  }

  // Handle object format with heading and body
  return `${slide.heading ?? ""}\n\n${slide.body ?? ""}`.trim()
}

/**
 * Get image URL from slide
 */
export function getSlideImage(slide: any): string | null {
  if (typeof slide === "object" && slide.imageUrl) {
    return slide.imageUrl
  }
  return null
}

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

/**
 * Format date with relative time (e.g., "2h ago", "3d ago")
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * Format date for display (e.g., "Jan 15")
 */
export function formatDisplayDate(iso: string | undefined | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

// ============================================================================
// API UTILITIES
// ============================================================================

/**
 * Fetch preview data for a URL
 */
export async function fetchPreviewData(url: string): Promise<any> {
  // This would typically call an API endpoint to get preview data
  // For now, return a mock response
  return {
    title: "Sample Content",
    description: "This is a sample description",
    thumbnail: null,
    duration: null,
  }
}

/**
 * Find existing mission by URL
 */
export async function findExistingMission(url: string): Promise<any> {
  try {
    const response = await fetch("/api/missions")
    if (!response.ok) return null
    
    const data = await response.json()
    return data.data?.find((m: any) => m.sourceUrl === url) || null
  } catch {
    return null
  }
}

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

/**
 * Safe JSON stringify
 */
export function safeJsonStringify(value: any): string {
  try {
    return JSON.stringify(value)
  } catch {
    return "{}"
  }
}

// ============================================================================
// CONTENT PROCESSING
// ============================================================================

/**
 * Process keywords string to array
 */
export function processKeywords(keywords: string | string[] | undefined): string[] {
  if (!keywords) return []
  
  if (Array.isArray(keywords)) {
    return keywords.filter(Boolean)
  }
  
  return keywords.split(',').map(k => k.trim()).filter(Boolean)
}

/**
 * Convert voice profile to brand voice format
 */
export function convertVoiceProfileToBrandVoice(profile: any): any {
  return {
    id: profile.id,
    name: profile.name,
    tone: profile.tone,
    style: profile.style || 'clear, actionable, value-focused',
    vocabulary: Array.isArray(profile.vocabulary) 
      ? profile.vocabulary.join(', ') 
      : profile.vocabulary || 'plain language, avoid jargon',
    audience: profile.audience,
    hashtags: profile.hashtags || ['#BrandVoiceAI'],
    ctaStyle: profile.cta || 'invite conversation and follows, not salesy',
  }
}
