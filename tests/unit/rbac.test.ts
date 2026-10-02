import { describe, it, expect } from 'vitest';
import { hasPermission, canAccessAdmin, canConductSurvey, canViewInternalAssessment } from '@/lib/auth/rbac';

describe('RBAC Permission Matrix', () => {
  it('allows ADMIN full permissions across all modules', () => {
    expect(hasPermission('admin', 'retailer:create')).toBe(true);
    expect(hasPermission('admin', 'retailer:view_all')).toBe(true);
    expect(hasPermission('admin', 'retailer:assign')).toBe(true);
    expect(hasPermission('admin', 'admin:audit')).toBe(true);
    expect(canAccessAdmin('admin')).toBe(true);
    expect(canViewInternalAssessment('admin')).toBe(true);
  });

  it('restricts COORDINATOR from admin modules and internal assessments', () => {
    expect(hasPermission('coordinator', 'retailer:create')).toBe(true);
    expect(hasPermission('coordinator', 'retailer:qualify')).toBe(true);
    expect(hasPermission('coordinator', 'retailer:survey')).toBe(true);
    expect(canConductSurvey('coordinator')).toBe(true);

    // Forbidden for Coordinator
    expect(hasPermission('coordinator', 'retailer:view_all')).toBe(false);
    expect(hasPermission('coordinator', 'retailer:assign')).toBe(false);
    expect(hasPermission('coordinator', 'admin:audit')).toBe(false);
    expect(hasPermission('coordinator', 'retailer:assess_internal')).toBe(false);
    expect(canAccessAdmin('coordinator')).toBe(false);
    expect(canViewInternalAssessment('coordinator')).toBe(false);
  });

  it('allows REVIEWER to access internal assessments and global retailer views', () => {
    expect(hasPermission('reviewer', 'retailer:view_all')).toBe(true);
    expect(hasPermission('reviewer', 'retailer:assess_internal')).toBe(true);
    expect(hasPermission('reviewer', 'retailer:approve_exception')).toBe(true);
    expect(canViewInternalAssessment('reviewer')).toBe(true);

    // Reviewer cannot administer users or audit logs
    expect(hasPermission('reviewer', 'admin:users')).toBe(false);
    expect(hasPermission('reviewer', 'admin:audit')).toBe(false);
    expect(canAccessAdmin('reviewer')).toBe(false);
  });
});
