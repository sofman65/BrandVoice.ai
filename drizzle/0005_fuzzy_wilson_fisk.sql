CREATE TYPE "public"."outcome_status" AS ENUM('draft', 'final', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."outcome_type" AS ENUM('threads', 'linkedin_post', 'instagram_carousel', 'video_script');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('youtube', 'tiktok', 'upload', 'instagram');--> statement-breakpoint
ALTER TABLE "voices" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "voices" CASCADE;--> statement-breakpoint
ALTER TABLE "mission_outcomes" ALTER COLUMN "type" SET DATA TYPE "public"."outcome_type" USING "type"::"public"."outcome_type";--> statement-breakpoint
ALTER TABLE "mission_outcomes" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."outcome_status";--> statement-breakpoint
ALTER TABLE "mission_outcomes" ALTER COLUMN "status" SET DATA TYPE "public"."outcome_status" USING "status"::"public"."outcome_status";--> statement-breakpoint
ALTER TABLE "missions" ALTER COLUMN "platform" SET DATA TYPE "public"."platform" USING "platform"::"public"."platform";--> statement-breakpoint
ALTER TABLE "onboarding_progress" ALTER COLUMN "platform_connected" SET DATA TYPE "public"."platform" USING "platform_connected"::"public"."platform";--> statement-breakpoint
ALTER TABLE "voice_profiles" ALTER COLUMN "keywords" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "missions" ADD COLUMN "source_external_id" text;--> statement-breakpoint
ALTER TABLE "missions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "voice_profiles" ADD COLUMN "name" text DEFAULT 'Default' NOT NULL;--> statement-breakpoint
ALTER TABLE "voice_profiles" ADD COLUMN "base_preset_id" text;--> statement-breakpoint
ALTER TABLE "voice_profiles" ADD COLUMN "vocabulary" jsonb;--> statement-breakpoint
ALTER TABLE "voice_profiles" ADD COLUMN "cta" text;--> statement-breakpoint
ALTER TABLE "voice_profiles" ADD COLUMN "hashtags" jsonb;--> statement-breakpoint
ALTER TABLE "voice_profiles" ADD COLUMN "style" text;--> statement-breakpoint
ALTER TABLE "mission_outcomes" ADD CONSTRAINT "mission_outcomes_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_voice_profile_id_voice_profiles_id_fk" FOREIGN KEY ("voice_profile_id") REFERENCES "public"."voice_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_profiles" ADD CONSTRAINT "voice_profiles_base_preset_id_presets_id_fk" FOREIGN KEY ("base_preset_id") REFERENCES "public"."presets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "outcomes_mission_type_idx" ON "mission_outcomes" USING btree ("mission_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "missions_user_sourceurl_uniq" ON "missions" USING btree ("user_id","source_url");--> statement-breakpoint
CREATE INDEX "missions_user_idx" ON "missions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "missions_platform_idx" ON "missions" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "missions_external_idx" ON "missions" USING btree ("source_external_id");--> statement-breakpoint
CREATE INDEX "onboarding_user_idx" ON "onboarding_progress" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "presets_user_name_uniq" ON "presets" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "presets_user_idx" ON "presets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "voice_profiles_user_idx" ON "voice_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "voice_profiles_default_per_user_uniq" ON "voice_profiles" USING btree ("user_id") WHERE "voice_profiles"."is_default" = true;