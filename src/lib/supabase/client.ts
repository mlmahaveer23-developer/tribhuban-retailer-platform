import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    // Return mock-safe or null-guarded client for local test environments
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
