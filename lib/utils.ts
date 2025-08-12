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
