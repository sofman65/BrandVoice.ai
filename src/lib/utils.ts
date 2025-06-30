// Validate Instagram post or reel URLs (allows optional query params)
export function isValidInstagramUrl(url: string): boolean {
  const pattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?(?:\?.*)?$/i
  return pattern.test(url.trim())
}
