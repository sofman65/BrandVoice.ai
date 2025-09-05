import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);

try {
  console.log('Recreating voice_profiles table...');
  
  // Drop the existing voice_profiles table
  await sql`DROP TABLE IF EXISTS voice_profiles CASCADE`;
  
  // Create the new voice_profiles table with the correct structure
  await sql`
    CREATE TABLE voice_profiles (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      name text DEFAULT 'Default' NOT NULL,
      base_preset_id text,
      tone text NOT NULL,
      audience text NOT NULL,
      keywords jsonb,
      vocabulary jsonb,
      cta text,
      hashtags jsonb,
      style text,
      is_default boolean DEFAULT true NOT NULL,
      created_at timestamp with time zone DEFAULT now() NOT NULL,
      updated_at timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  
  console.log('voice_profiles table recreated successfully!');
} catch (error) {
  console.error('Failed to recreate table:', error);
  process.exit(1);
}
