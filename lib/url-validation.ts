export type SourceType = "instagram" | "youtube";

export interface UrlValidationResult {
  isValid: boolean;
  type: SourceType | null;
  notSupported?: boolean;
}

const INSTAGRAM_REGEX = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?(?:\?.*)?$/;
const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;

export function validateUrl(url: string): UrlValidationResult {
  const trimmed = (url || "").trim();
  if (!trimmed) return { isValid: false, type: null };
  if (YOUTUBE_REGEX.test(trimmed)) return { isValid: true, type: "youtube" };
  if (INSTAGRAM_REGEX.test(trimmed))
    return { isValid: false, type: "instagram", notSupported: true };
  return { isValid: false, type: null };
}
