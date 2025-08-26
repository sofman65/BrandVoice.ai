// Test database connection
require('dotenv').config({ path: '.env.local' });

const { getDatabaseUrl } = require('./lib/env.ts');

console.log('Testing database configuration...');
console.log('DB_ENV:', process.env.DB_ENV);
console.log('DATABASE_URL_DEV:', process.env.DATABASE_URL_DEV ? 'SET' : 'NOT SET');
console.log('Resolved URL:', getDatabaseUrl() ? 'AVAILABLE' : 'NOT AVAILABLE');

// Test if we can import the db module
try {
  const { db } = require('./lib/db/index.ts');
  console.log('DB client:', db ? 'CREATED' : 'NOT CREATED');
  console.log('✅ Database configuration is working!');
} catch (error) {
  console.log('❌ Database configuration error:', error.message);
}
