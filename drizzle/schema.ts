import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const missions = pgTable("missions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: text().notNull(),
	platform: text().notNull(),
	sourceUrl: text("source_url").notNull(),
	pinned: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	outputs: jsonb().notNull(),
	description: text(),
});

export const presets = pgTable("presets", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	description: text(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const voices = pgTable("voices", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	tone: text(),
	style: text(),
	vocabulary: text(),
	audience: text(),
	cta: text(),
	hashtags: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});
