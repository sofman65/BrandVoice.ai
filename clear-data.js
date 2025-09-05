import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);

try {
  console.log('Clearing all data from tables...');
  
  // Clear all data from tables to avoid constraint issues
  await sql`TRUNCATE TABLE onboarding_progress CASCADE`;
  await sql`TRUNCATE TABLE mission_outcomes CASCADE`;
  await sql`TRUNCATE TABLE voice_profiles CASCADE`;
  await sql`TRUNCATE TABLE missions CASCADE`;
  await sql`TRUNCATE TABLE presets CASCADE`;
  
  console.log('Data cleared successfully!');
} catch (error) {
  console.error('Failed to clear data:', error);
  process.exit(1);
}
