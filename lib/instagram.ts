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
  // Use Instagram oEmbed endpoint to fetch post data
  const oEmbedUrl = `https://www.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`;
  try {
    const response = await fetch(oEmbedUrl);
    if (!response.ok) throw new Error();
    const data = await response.json();
    // oEmbed returns 'thumbnail_url' for images, 'type' for media type, and 'title' for caption
    return {
      caption: data.title || "",
      media_type: data.type === "video" ? "video" : "image",
      // oEmbed does not provide audio_url, so we omit it
    };
  } catch (err) {
    // Fallback to mock data if oEmbed fails
    return {
      caption: "🚀 Explaining how I boosted developer productivity by 10× with Space-Tech hacks. #coding #productivity",
      media_type: /reel|video/.test(url) ? "video" : "image",
      audio_url: /reel|video/.test(url)
        ? "https://example.com/mock-audio.mp3"
        : undefined,
    };
  }
}
