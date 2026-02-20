// Usage: npm run seed or ts-node src/scripts/seed-scenarios.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We need the service role key for seeding, but for this simple script, anon key works if RLS allows or we disable it.
// Since we have "Any authenticated user can view" we might need to use dashboard SQL if we can't insert.
// Wait, the initial schema didn't add INSERT policy for scenarios.
// The user should better run this in their SQL editor.
