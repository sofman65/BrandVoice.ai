import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const missions = pgTable("missions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  platform: text("platform").notNull(), // "youtube" | "instagram"
  sourceUrl: text("source_url").notNull(),
  description: text("description"), // Optional description from YouTube/Instagram
  pinned: boolean("pinned").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  outputs: jsonb("outputs").$type<{
    linkedin: string;
    carousel: { slide: number; text: string; imagePrompt?: string }[];
    threads: string;
    videoScript: string;
  }>().notNull(),
});


