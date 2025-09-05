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

// Type exports
export type Voice = z.infer<typeof VoiceSchema>;
export type Preset = z.infer<typeof PresetSchema>;
export type CreateVoice = z.infer<typeof CreateVoiceSchema>;
export type UpdateVoice = z.infer<typeof UpdateVoiceSchema>;
export type CreatePreset = z.infer<typeof CreatePresetSchema>;
export type UpdatePreset = z.infer<typeof UpdatePresetSchema>;

