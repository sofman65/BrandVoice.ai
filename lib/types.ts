export interface GeneratedContent {
  /** Long-form text for LinkedIn. */
  linkedin: string
  /** Up to 10 slides of carousel copy. */
  carousel: string[]
  /** ≤ 500 characters for Threads. */
  threads: string
  /** Multi-line script (speaker cues + CTA). */
  video_script: string
}
