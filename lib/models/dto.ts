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
});

export type ProcessPayload = z.infer<typeof ProcessPayloadSchema>;

