import { UserRole } from '@/types/auth';

export type Permission =
  | 'retailer:create'
  | 'retailer:view_assigned'
  | 'retailer:view_all'
  | 'retailer:qualify'
  | 'retailer:survey'
  | 'retailer:assess_internal'
  | 'retailer:assign'
  | 'retailer:approve_exception'
  | 'follow_up:manage'
  | 'admin:users'
  | 'admin:survey_config'
  | 'admin:qual_rules'
  | 'admin:audit'
  | 'reports:view_global'
  | 'reports:view_assigned';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'retailer:create',
    'retailer:view_assigned',
    'retailer:view_all',
    'retailer:qualify',
    'retailer:survey',
    'retailer:assess_internal',
    'retailer:assign',
    'retailer:approve_exception',
    'follow_up:manage',
    'admin:users',
    'admin:survey_config',
    'admin:qual_rules',
    'admin:audit',
    'reports:view_global',
    'reports:view_assigned',
  ],
  reviewer: [
    'retailer:view_all',
    'retailer:assess_internal',
    'retailer:approve_exception',
    'follow_up:manage',
    'reports:view_global',
  ],
  coordinator: [
    'retailer:create',
    'retailer:view_assigned',
    'retailer:qualify',
    'retailer:survey',
    'follow_up:manage',
    'reports:view_assigned',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  return !!allowed && allowed.includes(permission);
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === 'admin';
}

export function canConductSurvey(role: UserRole): boolean {
  return role === 'coordinator' || role === 'admin';
}

export function canViewInternalAssessment(role: UserRole): boolean {
  return role === 'admin' || role === 'reviewer';
}
