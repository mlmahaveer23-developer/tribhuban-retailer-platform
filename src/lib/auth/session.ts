import { cookies } from 'next/headers';
import { AppUser, UserRole } from '@/types/auth';
import { repository } from '@/lib/store/repository';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const AUTH_COOKIE_NAME = 'tribhuban_auth_user';

export async function getCurrentUser(): Promise<AppUser> {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'production';

  const supabase = createServerSupabaseClient();

  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user && user.email) {
        const dbUser = await repository.getUserByEmail(user.email);
        if (dbUser && dbUser.is_active) {
          return dbUser;
        }

        // If authenticated via Supabase but record not yet in local repository,
        // strictly default to coordinator (least-privilege). Never trust user_metadata for admin/reviewer roles.
        return {
          id: user.id,
          email: user.email,
          full_name: (user.user_metadata?.full_name as string) || user.email.split('@')[0],
          role: 'coordinator',
          is_active: true,
          created_at: user.created_at,
        };
      }
    } catch (err) {
      if (isProduction) {
        throw new Error('Authentication required: Failed to verify Supabase session.');
      }
      console.warn('Supabase auth check fallback:', err);
    }
  }

  // In production, NEVER trust client-controlled cookies or fallback users
  if (isProduction) {
    throw new Error('Authentication required: Valid Supabase authentication session not found.');
  }

  // Local development / testing mode ONLY:
  // If an auth cookie is present, resolve identity strictly against verified server records.
  // NEVER trust client-provided 'role' or unregistered user IDs.
  try {
    const cookieStore = cookies();
    const cookieVal = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal);
      if (parsed && typeof parsed.id === 'string') {
        const verifiedUser = await repository.getUserById(parsed.id);
        if (verifiedUser && verifiedUser.is_active) {
          // Return the server-authoritative user record (server-assigned role)
          return verifiedUser;
        }
      }
      // If cookie contains invalid, untrusted, or forged user ID, reject it.
      console.warn('[Security Warning] Rejected untrusted or unregistered session cookie identity.');
    }
  } catch {
    // cookies() may throw in certain client or static render contexts
  }

  // Default development coordinator for local dev/testing
  const defaultCoord = await repository.getUserByEmail('coordinator@tribhuban.com');
  if (defaultCoord) return defaultCoord;

  return {
    id: 'user_coord_1',
    email: 'coordinator@tribhuban.com',
    full_name: 'Suresh Coordinator',
    role: 'coordinator',
    is_active: true,
    created_at: new Date().toISOString(),
  };
}
