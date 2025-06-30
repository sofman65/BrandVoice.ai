import type { RateLimitData } from "./types"

const rateLimitMap = new Map<string, RateLimitData>()
const RATE_LIMIT = 30 // requests per hour
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const userData = rateLimitMap.get(ip)

  if (!userData || now > userData.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }

  if (userData.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  userData.count++
  return { allowed: true, remaining: RATE_LIMIT - userData.count }
}
