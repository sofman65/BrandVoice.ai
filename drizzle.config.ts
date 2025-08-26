import type { Config } from "drizzle-kit";
// Note: drizzle-kit runs in Node context and doesn't support TS path aliases by default
// so we read from process.env directly. Ensure .env.local has DATABASE_URL or DATABASE_URL_DEV.

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_DEV || process.env.DATABASE_URL || "",
  },
  verbose: true,
  strict: true,
} satisfies Config;


