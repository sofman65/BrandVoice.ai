-- Manual migration to handle keyword conversion from text to jsonb
-- This needs to be done before the main schema migration

-- First create the enums
CREATE TYPE "public"."outcome_status" AS ENUM('draft', 'final', 'published', 'archived');
CREATE TYPE "public"."outcome_type" AS ENUM('threads', 'linkedin_post', 'instagram_carousel', 'video_script');
CREATE TYPE "public"."platform" AS ENUM('youtube', 'tiktok', 'upload', 'instagram');

-- Handle voice_profiles keywords conversion
-- Add a temporary column for the conversion
ALTER TABLE voice_profiles ADD COLUMN keywords_temp jsonb;

-- Convert existing text keywords to jsonb arrays
UPDATE voice_profiles 
SET keywords_temp = CASE 
  WHEN keywords IS NULL OR keywords = '' THEN NULL
  WHEN keywords LIKE '%,%' THEN 
    -- Convert comma-separated string to jsonb array
    (SELECT jsonb_agg(trim(value)) 
     FROM unnest(string_to_array(keywords, ',')) AS value 
     WHERE trim(value) != '')
  ELSE 
    -- Single keyword
    jsonb_build_array(trim(keywords))
END;

-- Drop old column and rename temp
ALTER TABLE voice_profiles DROP COLUMN keywords;
ALTER TABLE voice_profiles RENAME COLUMN keywords_temp TO keywords;

-- Drop the voices table
ALTER TABLE "voices" DISABLE ROW LEVEL SECURITY;
DROP TABLE "voices" CASCADE;

-- Update other columns to use enums
ALTER TABLE "mission_outcomes" ALTER COLUMN "type" SET DATA TYPE "public"."outcome_type" USING "type"::"public"."outcome_type";
ALTER TABLE "mission_outcomes" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."outcome_status";
ALTER TABLE "mission_outcomes" ALTER COLUMN "status" SET DATA TYPE "public"."outcome_status" USING "status"::"public"."outcome_status";
ALTER TABLE "missions" ALTER COLUMN "platform" SET DATA TYPE "public"."platform" USING "platform"::"public"."platform";
ALTER TABLE "onboarding_progress" ALTER COLUMN "platform_connected" SET DATA TYPE "public"."platform" USING "platform_connected"::"public"."platform";

-- Add new columns
ALTER TABLE "missions" ADD COLUMN "source_external_id" text;
ALTER TABLE "missions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE "voice_profiles" ADD COLUMN "name" text DEFAULT 'Default' NOT NULL;
ALTER TABLE "voice_profiles" ADD COLUMN "base_preset_id" text;
ALTER TABLE "voice_profiles" ADD COLUMN "vocabulary" jsonb;
ALTER TABLE "voice_profiles" ADD COLUMN "cta" text;
ALTER TABLE "voice_profiles" ADD COLUMN "hashtags" jsonb;
ALTER TABLE "voice_profiles" ADD COLUMN "style" text;

-- Add foreign key constraints
ALTER TABLE "mission_outcomes" ADD CONSTRAINT "mission_outcomes_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_voice_profile_id_voice_profiles_id_fk" FOREIGN KEY ("voice_profile_id") REFERENCES "public"."voice_profiles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "voice_profiles" ADD CONSTRAINT "voice_profiles_base_preset_id_presets_id_fk" FOREIGN KEY ("base_preset_id") REFERENCES "public"."presets"("id") ON DELETE no action ON UPDATE no action;

-- Add indexes
CREATE INDEX "outcomes_mission_type_idx" ON "mission_outcomes" USING btree ("mission_id","type");
CREATE UNIQUE INDEX "missions_user_sourceurl_uniq" ON "missions" USING btree ("user_id","source_url");
CREATE INDEX "missions_user_idx" ON "missions" USING btree ("user_id");
CREATE INDEX "missions_platform_idx" ON "missions" USING btree ("platform");
CREATE INDEX "missions_external_idx" ON "missions" USING btree ("source_external_id");
CREATE INDEX "onboarding_user_idx" ON "onboarding_progress" USING btree ("user_id");
CREATE UNIQUE INDEX "presets_user_name_uniq" ON "presets" USING btree ("user_id","name");
CREATE INDEX "presets_user_idx" ON "presets" USING btree ("user_id");
CREATE INDEX "voice_profiles_user_idx" ON "voice_profiles" USING btree ("user_id");
CREATE UNIQUE INDEX "voice_profiles_default_per_user_uniq" ON "voice_profiles" USING btree ("user_id") WHERE "voice_profiles"."is_default" = true;
