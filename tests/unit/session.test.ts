import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';

// Setup mock for next/headers and supabase
const mockGetCookie = vi.fn();
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: mockGetCookie,
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => null, // Supabase not configured in local/unit test
}));

describe('Session Security & Anti-Tampering (session.ts)', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalAppEnv = process.env.NEXT_PUBLIC_APP_ENV;

  beforeEach(() => {
    mockGetCookie.mockReset();
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_APP_ENV;
  });

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    (process.env as Record<string, string | undefined>).NEXT_PUBLIC_APP_ENV = originalAppEnv;
  });

  it('rejects forged admin identity from unknown user ID in cookie', async () => {
    const { getCurrentUser } = await import('@/lib/auth/session');

    // Attacker crafts a cookie claiming to be an admin with an arbitrary user ID
    mockGetCookie.mockReturnValue({
      value: JSON.stringify({
        id: 'attacker_fake_id_999',
        email: 'hacker@malicious.com',
        full_name: 'Hacker',
        role: 'admin',
      }),
    });

    const user = await getCurrentUser();
    // Must NOT be admin and must NOT accept the attacker ID
    expect(user.role).not.toBe('admin');
    expect(user.id).not.toBe('attacker_fake_id_999');
    expect(user.role).toBe('coordinator');
  });

  it('ignores client-tampered role for a valid coordinator account', async () => {
    const { getCurrentUser } = await import('@/lib/auth/session');

    // Attacker has valid coordinator ID but attempts to escalate role to admin in cookie
    mockGetCookie.mockReturnValue({
      value: JSON.stringify({
        id: 'user_coord_1',
        email: 'coordinator@tribhuban.com',
        role: 'admin', // Tampered! Server record is coordinator
      }),
    });

    const user = await getCurrentUser();
    // Role must be authoritative from database record (coordinator), NOT client-supplied admin
    expect(user.id).toBe('user_coord_1');
    expect(user.role).toBe('coordinator');
    expect(user.role).not.toBe('admin');
  });

  it('strictly rejects cookie fallback in production environment', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    const { getCurrentUser } = await import('@/lib/auth/session');

    mockGetCookie.mockReturnValue({
      value: JSON.stringify({
        id: 'user_admin_1',
        email: 'admin@tribhuban.com',
        role: 'admin',
      }),
    });

    // In production, unverified cookies must throw authentication error
    await expect(getCurrentUser()).rejects.toThrow(
      'Authentication required: Valid Supabase authentication session not found.'
    );
  });
});
