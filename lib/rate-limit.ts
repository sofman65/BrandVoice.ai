import { Redis } from "@upstash/redis"

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

const RATE_LIMIT = 30 // requests per hour
const WINDOW_SEC = 60 * 60 // 1 hour

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  if (!redis) {
    // Fallback: allow when Redis is not configured
    return { allowed: true, remaining: RATE_LIMIT }
  }

  const key = `rl:${ip}`
  const tx = redis.multi()
  tx.incr(key)
  tx.expire(key, WINDOW_SEC)
  const [count] = (await tx.exec()) as [number, unknown]

  const remaining = Math.max(0, RATE_LIMIT - count)
  return { allowed: count <= RATE_LIMIT, remaining }
}
