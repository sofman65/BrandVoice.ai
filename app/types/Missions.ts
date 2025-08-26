export type MissionPlatform = "youtube" | "instagram";

export interface MissionListItem {
  id: string;
  title: string;
  platform: MissionPlatform;
  sourceUrl: string;
  pinned: boolean;
  createdAt: string; // ISO string
  description?: string; // Optional description from YouTube/Instagram
}

