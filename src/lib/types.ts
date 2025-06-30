export interface InstagramData {
  caption: string
  media_type: "image" | "video"
  audio_url?: string
}

export interface GeneratedContent {
  linkedin: string
  carousel: string[]
  threads: string
  video_script: string
}

export interface ProcessResponse {
  success: boolean
  data?: GeneratedContent
  error?: string
}

export interface RateLimitData {
  count: number
  resetTime: number
}
