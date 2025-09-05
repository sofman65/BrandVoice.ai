import { z } from "zod"

// ============================================================================
// ZOD SCHEMAS (for validation)
// ============================================================================

export const BrandVoiceSchema = z.object({
  id: z.string().min(1).default("default"),
  name: z.string().min(1).default("Default"),
  tone: z.string().min(1).default("professional, friendly, concise"),
  style: z.string().min(1).default("clear, actionable, value-focused"),
  vocabulary: z.string().min(1).default("plain language, avoid jargon"),
  audience: z.string().min(1).default("developers and tech professionals"),
  hashtags: z.array(z.string()).default(["#BrandVoiceAI"]),
  ctaStyle: z.string().min(1).default("invite conversation and follows, not salesy"),
})

export const CarouselSlideSchema = z.union([
  z.string().min(1),
  z.object({
    heading: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
    imageUrl: z.string().url().optional(),
    imagePrompt: z.string().min(1).optional(),
  }).passthrough(),
])

export const GeneratedContentSchema = z.object({
  linkedin: z.string().min(1),
  carousel: z.array(CarouselSlideSchema).min(1),
  threads: z.string().min(1),
  video_script: z.string().min(1),
})

// ============================================================================
// TYPESCRIPT TYPES (inferred from schemas)
// ============================================================================

export type BrandVoice = z.infer<typeof BrandVoiceSchema>
export type CarouselSlide = z.infer<typeof CarouselSlideSchema>
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>

// ============================================================================
// ADDITIONAL TYPES (not covered by schemas)
// ============================================================================

export type MissionPlatform = "youtube" | "instagram" | "tiktok" | "upload"
export type OutcomeType = "threads" | "linkedin_post" | "instagram_carousel" | "video_script"
export type OutcomeStatus = "draft" | "final" | "published" | "archived"

export interface MissionListItem {
  id: string
  title: string
  platform: MissionPlatform
  sourceUrl: string
  description?: string
  pinned: boolean
  createdAt: string // ISO string
}

export interface Mission {
  id: string
  userId: string
  title: string
  platform: MissionPlatform
  sourceUrl: string
  sourceExternalId?: string
  description?: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface MissionOutcome {
  id: string
  missionId: string
  type: OutcomeType
  title?: string
  content: string
  metadata?: any // Type-specific data: { threadCount, slideCount, estimatedDuration, scenes, slides, etc. }
  status: OutcomeStatus
  createdAt: string
  updatedAt: string
}

export interface VoiceProfile {
  id: string
  userId: string
  name: string
  basePresetId?: string
  tone: string
  audience: string
  keywords?: string[] // Now an array instead of comma-separated
  vocabulary?: string[]
  cta?: string
  hashtags?: string[]
  style?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface OnboardingProgress {
  id: string
  userId: string
  currentStep: number
  platformConnected?: MissionPlatform
  voiceProfileId?: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}


export type ReferenceItem = {
  id: string;
  title?: string;
  url?: string;
  platform?: "youtube" | "instagram" | "tiktok" | "web";
  summary?: string;           // ~400–600 chars
  key_points?: string[];      // optional
};

export type PastMissionSummary = {
  id: string;
  title?: string;
  createdAt?: string;
  summary: string;            // ~400–600 chars
  tone_hint?: string;
  performance_score?: number; // 0..1
};


