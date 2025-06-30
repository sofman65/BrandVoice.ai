interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT = 30 // requests per hour
const WINDOW_MS = 60 * 60 * 1000 // 1 hour in milliseconds

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitMap.delete(ip)
  }

  const currentEntry = rateLimitMap.get(ip)

  if (!currentEntry) {
    // First request from this IP
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }

  if (currentEntry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  // Increment count
  currentEntry.count++
  rateLimitMap.set(ip, currentEntry)

  return { allowed: true, remaining: RATE_LIMIT - currentEntry.count }
}
