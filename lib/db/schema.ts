import { pgTable, text, timestamp, boolean, jsonb, integer, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ----- Enums -----
export const platformEnum = pgEnum("platform", ["youtube", "tiktok", "upload", "instagram"]);
export const outcomeTypeEnum = pgEnum("outcome_type", [
  "threads", "linkedin_post", "instagram_carousel", "video_script"
]);
export const outcomeStatusEnum = pgEnum("outcome_status", [
  "draft", "final", "published", "archived"
]);

// ----- Missions -----
export const missions = pgTable("missions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  platform: platformEnum("platform").notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceExternalId: text("source_external_id"), // e.g., YouTube videoId
  description: text("description"),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  byUserUrl: uniqueIndex("missions_user_sourceurl_uniq").on(t.userId, t.sourceUrl),
  userIdx: index("missions_user_idx").on(t.userId),
  platformIdx: index("missions_platform_idx").on(t.platform),
  extIdx: index("missions_external_idx").on(t.sourceExternalId),
}));

// ----- Mission Outcomes -----
export const missionOutcomes = pgTable("mission_outcomes", {
  id: text("id").primaryKey(),
  missionId: text("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  type: outcomeTypeEnum("type").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // { slides, scenes, etc. }
  status: outcomeStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  byMissionType: index("outcomes_mission_type_idx").on(t.missionId, t.type),
}));

// ----- Voice Profiles (user instances) -----
export const voiceProfiles = pgTable("voice_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull().default("Default"),
  basePresetId: text("base_preset_id").references(() => presets.id), // optional link to preset
  tone: text("tone").notNull(),
  audience: text("audience").notNull(),
  keywords: jsonb("keywords"), // string[]
  vocabulary: jsonb("vocabulary"), // string[]
  cta: text("cta"),
  hashtags: jsonb("hashtags"), // string[]
  style: text("style"),
  isDefault: boolean("is_default").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  byUser: index("voice_profiles_user_idx").on(t.userId),
  // One default per user (partial unique index)
  oneDefaultPerUser: uniqueIndex("voice_profiles_default_per_user_uniq")
    .on(t.userId)
    .where(sql`${t.isDefault} = true`),
}));

// ----- Onboarding Progress -----
export const onboardingProgress = pgTable("onboarding_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  currentStep: integer("current_step").notNull().default(1), // 1..3
  platformConnected: platformEnum("platform_connected"), // enum instead of text
  voiceProfileId: text("voice_profile_id").references(() => voiceProfiles.id, { onDelete: "set null" }),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  byUserIdx: index("onboarding_user_idx").on(t.userId),
}));

// ----- Presets (user-defined generation templates) -----
export const presets = pgTable("presets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content").notNull(), // generation instructions / prompt
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  byUserName: uniqueIndex("presets_user_name_uniq").on(t.userId, t.name),
  byUserIdx: index("presets_user_idx").on(t.userId),
}));