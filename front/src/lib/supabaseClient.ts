import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase environment variables are not set.\n' +
    'Create a .env file in the front/ directory with:\n' +
    '  VITE_SUPABASE_URL=https://<your-project>.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=<your-anon-key>\n' +
    'Auth features and invoice storage will not work until configured.',
  );
}

/**
 * Supabase client singleton.
 *
 * If the env vars are missing the client is still created (with empty values)
 * so the React tree renders without crashing. Supabase calls will fail at
 * runtime with clear errors until the variables are configured.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
