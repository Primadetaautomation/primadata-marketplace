import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';

if (!connectionString) {
  throw new Error('DATABASE_URL or SUPABASE_DB_URL must be set');
}

// For query client
const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(queryClient, { schema });

export default db;

// Export schema for easy access
export * from './schema';