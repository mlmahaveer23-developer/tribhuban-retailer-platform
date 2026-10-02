export type UserRole = 'admin' | 'coordinator' | 'reviewer';

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthSession {
  user: AppUser;
  token?: string;
}
