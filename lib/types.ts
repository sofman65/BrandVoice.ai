export type CarouselSlide = string | {
  heading?: string;
  body?: string;
  imageUrl?: string;
  imagePrompt?: string;
  [key: string]: any
};

export interface GeneratedContent {
  /** Long-form text for LinkedIn. */
  linkedin: string
  /** Up to 10 slides of carousel copy. */
  carousel: CarouselSlide[]
  /** ≤ 500 characters for Threads. */
  threads: string
  /** Multi-line script (speaker cues + CTA). */
  video_script: string
}
