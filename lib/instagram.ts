import { sleep } from "./utils"

/**
 * A **stubbed** Instagram fetcher so the repo works without real API tokens.
 * Replace with the Instagram Basic Display API or oEmbed when ready.
 */
export async function fetchInstagram(url: string): Promise<{
  caption: string
  media_type: "image" | "video"
  /** Present only for video */
  audio_url?: string
}> {
  // Simulate network latency
  await sleep(500)

  // Dummy logic: treat any "/p/" as image, any "/reel/" as video.
  const isVideo = /\/reel\//.test(url)

  return {
    caption: "🚀 Explaining how I boosted developer productivity by 10× with Space-Tech hacks. #coding #productivity",
    media_type: isVideo ? "video" : "image",
    audio_url: isVideo
      ? "https://example.com/mock-audio.mp3" // fake
      : undefined,
  }
}
