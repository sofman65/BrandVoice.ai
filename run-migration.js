import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

// Use the same database connection logic as the app
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);

// Read the migration file
const migration = readFileSync('./drizzle/0006_manual_keyword_conversion.sql', 'utf8');

// Split into individual statements (basic splitting on semicolon + newline)
const statements = migration
  .split(';\n')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`Running ${statements.length} statements...`);

try {
  // Execute the entire migration as one query
  console.log('Executing migration...');
  await sql`${migration}`;
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  console.error('Error details:', error.message);
  process.exit(1);
}
