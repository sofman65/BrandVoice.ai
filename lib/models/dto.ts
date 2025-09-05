import { z } from "zod";

export const ContextRefSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  url: z.string().url().optional(),
  platform: z.enum(["youtube", "instagram", "tiktok", "web"]).optional(),
  summary: z.string().optional(),
  key_points: z.array(z.string()).optional(),
});

export const PastMissionSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  createdAt: z.string().optional(),
  summary: z.string().min(1),
  tone_hint: z.string().optional(),
  performance_score: z.number().min(0).max(1).optional(),
});

export const ProcessPayloadSchema = z.object({
  url: z.string().url().optional(),
  caption: z.string().optional(),
  transcript: z.string().optional(),
  voice: z.any().optional(),                 // validated elsewhere via BrandVoice schema
  referenceItems: z.array(ContextRefSchema).optional(),
  pastMissions: z.array(PastMissionSchema).optional(),
  presetNote: z.string().optional(),
  targetNotes: z.string().optional(),
  autoImage: z.boolean().optional(),
  missionId: z.string().optional(),          // Optional: if provided, save outcomes to this mission
});

export type ProcessPayload = z.infer<typeof ProcessPayloadSchema>;

// Voice schema for user-defined brand voices
export const VoiceSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1),
  tone: z.string().optional(),
  style: z.string().optional(),
  vocabulary: z.string().optional(), // comma-separated or JSON string
  audience: z.string().optional(),
  cta: z.string().optional(),
  hashtags: z.string().optional(), // comma-separated
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Preset schema for user-defined content presets
export const PresetSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  content: z.string().min(1), // the actual preset instructions
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Input schemas for creating/updating voices and presets
export const CreateVoiceSchema = z.object({
  name: z.string().min(1).max(100),
  tone: z.string().max(500).optional(),
  style: z.string().max(500).optional(),
  vocabulary: z.string().max(1000).optional(),
  audience: z.string().max(500).optional(),
  cta: z.string().max(500).optional(),
  hashtags: z.string().max(500).optional(),
});

export const UpdateVoiceSchema = CreateVoiceSchema.partial();

export const CreatePresetSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  content: z.string().min(1).max(2000),
});

export const UpdatePresetSchema = CreatePresetSchema.partial();

// ============================================================================
// MISSION DTOs
// ============================================================================

export const MissionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  platform: z.enum(["youtube", "instagram", "tiktok", "upload"]),
  sourceUrl: z.string().url(),
  sourceExternalId: z.string().optional(),
  description: z.string().optional(),
  pinned: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateMissionSchema = z.object({
  title: z.string().min(1).max(200),
  platform: z.enum(["youtube", "instagram", "tiktok", "upload"]),
  sourceUrl: z.string().url(),
  sourceExternalId: z.string().optional(),
  description: z.string().max(1000).optional(),
  pinned: z.boolean().optional().default(false),
});

export const UpdateMissionSchema = CreateMissionSchema.partial().extend({
  id: z.string().min(1),
});

// ============================================================================
// MISSION OUTCOME DTOs
// ============================================================================

export const MissionOutcomeSchema = z.object({
  id: z.string().min(1),
  missionId: z.string().min(1),
  type: z.enum(["threads", "linkedin_post", "instagram_carousel", "video_script"]),
  title: z.string().optional(),
  content: z.string().min(1),
  metadata: z.any().optional(), // JSONB field
  status: z.enum(["draft", "final", "published", "archived"]).default("draft"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateMissionOutcomeSchema = z.object({
  missionId: z.string().min(1),
  type: z.enum(["threads", "linkedin_post", "instagram_carousel", "video_script"]),
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(10000),
  metadata: z.any().optional(),
  status: z.enum(["draft", "final", "published", "archived"]).optional().default("draft"),
});

export const UpdateMissionOutcomeSchema = CreateMissionOutcomeSchema.partial().extend({
  id: z.string().min(1),
});

// ============================================================================
// VOICE PROFILE DTOs (Updated)
// ============================================================================

export const VoiceProfileSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).max(100),
  basePresetId: z.string().optional(),
  tone: z.string().min(1).max(500),
  audience: z.string().min(1).max(500),
  keywords: z.array(z.string()).optional(),
  vocabulary: z.array(z.string()).optional(),
  cta: z.string().max(500).optional(),
  hashtags: z.array(z.string()).optional(),
  style: z.string().max(500).optional(),
  isDefault: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateVoiceProfileSchema = z.object({
  name: z.string().min(1).max(100).optional().default("Default"),
  basePresetId: z.string().optional(),
  tone: z.string().min(1).max(500),
  audience: z.string().min(1).max(500),
  keywords: z.array(z.string()).optional(),
  vocabulary: z.array(z.string()).optional(),
  cta: z.string().max(500).optional(),
  hashtags: z.array(z.string()).optional(),
  style: z.string().max(500).optional(),
  isDefault: z.boolean().optional().default(false),
});

export const UpdateVoiceProfileSchema = CreateVoiceProfileSchema.partial().extend({
  id: z.string().min(1),
});

// ============================================================================
// ONBOARDING DTOs
// ============================================================================

export const OnboardingProgressSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  currentStep: z.number().min(1).max(3),
  platformConnected: z.enum(["youtube", "instagram", "tiktok", "upload"]).optional(),
  voiceProfileId: z.string().optional(),
  isCompleted: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UpdateOnboardingProgressSchema = z.object({
  currentStep: z.number().min(1).max(3).optional(),
  platformConnected: z.enum(["youtube", "instagram", "tiktok", "upload"]).optional(),
  voiceProfileId: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

// ============================================================================
// API RESPONSE DTOs
// ============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }).optional(),
  error: z.string().optional(),
});

// ============================================================================
// CONTENT GENERATION DTOs
// ============================================================================

export const GeneratedContentSchema = z.object({
  linkedin: z.string().min(1),
  carousel: z.array(z.union([
    z.string(),
    z.object({
      heading: z.string().optional(),
      body: z.string().optional(),
      imageUrl: z.string().url().optional(),
      imagePrompt: z.string().optional(),
    })
  ])).min(1),
  threads: z.string().min(1),
  video_script: z.string().min(1),
});

// ============================================================================
// REFERENCE CONTENT DTOs
// ============================================================================

export const ReferenceContentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  link: z.string().url(),
  platform: z.enum(["youtube", "instagram", "tiktok", "web"]),
  savedAt: z.string().datetime(),
  thumbnail: z.string().url().optional(),
  duration: z.string().optional(),
  views: z.string().optional(),
  tags: z.array(z.string()),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Legacy types (keeping for backward compatibility)
export type Voice = z.infer<typeof VoiceSchema>;
export type Preset = z.infer<typeof PresetSchema>;
export type CreateVoice = z.infer<typeof CreateVoiceSchema>;
export type UpdateVoice = z.infer<typeof UpdateVoiceSchema>;
export type CreatePreset = z.infer<typeof CreatePresetSchema>;
export type UpdatePreset = z.infer<typeof UpdatePresetSchema>;

// New comprehensive types
export type Mission = z.infer<typeof MissionSchema>;
export type CreateMission = z.infer<typeof CreateMissionSchema>;
export type UpdateMission = z.infer<typeof UpdateMissionSchema>;

export type MissionOutcome = z.infer<typeof MissionOutcomeSchema>;
export type CreateMissionOutcome = z.infer<typeof CreateMissionOutcomeSchema>;
export type UpdateMissionOutcome = z.infer<typeof UpdateMissionOutcomeSchema>;

export type VoiceProfile = z.infer<typeof VoiceProfileSchema>;
export type CreateVoiceProfile = z.infer<typeof CreateVoiceProfileSchema>;
export type UpdateVoiceProfile = z.infer<typeof UpdateVoiceProfileSchema>;

export type OnboardingProgress = z.infer<typeof OnboardingProgressSchema>;
export type UpdateOnboardingProgress = z.infer<typeof UpdateOnboardingProgressSchema>;

export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & { data?: T };
export type PaginatedResponse<T = any> = z.infer<typeof PaginatedResponseSchema> & { data: T[] };

export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;
export type ReferenceContent = z.infer<typeof ReferenceContentSchema>;

