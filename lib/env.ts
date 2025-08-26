import { z } from "zod"

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  YOUTUBE_API_KEY: z.string().min(1).optional(),
  META_ACCESS_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  // Database URLs for different environments
  DATABASE_URL: z.string().url().optional(),
  DATABASE_URL_DEV: z.string().url().optional(),
  DATABASE_URL_STAGING: z.string().url().optional(),
  DATABASE_URL_PROD: z.string().url().optional(),
  // Environment selector
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DB_ENV: z.enum(["dev", "staging", "prod"]).default("dev"),
})

export const env = EnvSchema.parse(process.env)

export const isMockMode = !env.OPENAI_API_KEY

// Get the appropriate database URL based on environment
export function getDatabaseUrl(): string | undefined {
  // If DB_ENV is explicitly set, use that
  if (env.DB_ENV === "staging" && env.DATABASE_URL_STAGING) {
    return env.DATABASE_URL_STAGING
  }
  if (env.DB_ENV === "prod" && env.DATABASE_URL_PROD) {
    return env.DATABASE_URL_PROD
  }
  
  // Default to dev database
  return env.DATABASE_URL_DEV || env.DATABASE_URL
}


