import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Validate an Instagram URL.
 * Supports   https://www.instagram.com/p/<id>/
 *            https://www.instagram.com/reel/<id>/
 * Allows any trailing query-string ( ?hl=en … ).
 */
export function isValidInstagramUrl(url: string): boolean {
  const regex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?(?:\?.*)?$/
  return regex.test(url.trim())
}

/** Sleep helper (mainly for stubbing async work). */
export async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
