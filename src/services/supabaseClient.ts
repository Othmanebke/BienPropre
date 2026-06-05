import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl  = import.meta.env['VITE_SUPABASE_URL'];
const supabaseAnon = import.meta.env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || typeof supabaseUrl !== 'string') {
  throw new Error(
    '[supabaseClient] VITE_SUPABASE_URL is missing. ' +
    'Copy .env.example → .env.local and fill in the value.',
  );
}

if (!supabaseAnon || typeof supabaseAnon !== 'string') {
  throw new Error(
    '[supabaseClient] VITE_SUPABASE_ANON_KEY is missing. ' +
    'Copy .env.example → .env.local and fill in the value.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
