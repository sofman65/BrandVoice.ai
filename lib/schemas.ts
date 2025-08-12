import { z } from "zod"

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

export type GeneratedContentValidated = z.infer<typeof GeneratedContentSchema>


