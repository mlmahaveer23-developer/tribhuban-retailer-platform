import { RetailerStatus } from '@/types/retailer';
import { UserRole } from '@/types/auth';

/**
 * Valid state transitions table.
 * Maps current status to allowed next statuses and minimum required roles.
 */
export const ALLOWED_TRANSITIONS: Record<RetailerStatus, RetailerStatus[]> = {
  QUALIFICATION_PENDING: [
    'QUALIFIED',
    'EXCEPTION_REVIEW',
    'NOT_TARGET',
    'NEEDS_VALIDATION',
  ],
  QUALIFIED: [
    'SURVEY_IN_PROGRESS',
    'SURVEY_COMPLETED',
    'FOLLOW_UP_REQUIRED',
    'NOT_TARGET',
  ],
  EXCEPTION_REVIEW: [
    'QUALIFIED', // Approved by Reviewer/Admin
    'NOT_TARGET',
    'NEEDS_VALIDATION',
    'FOLLOW_UP_REQUIRED',
  ],
  NEEDS_VALIDATION: [
    'QUALIFICATION_PENDING',
    'QUALIFIED',
    'EXCEPTION_REVIEW',
    'NOT_TARGET',
  ],
  SURVEY_IN_PROGRESS: [
    'SURVEY_COMPLETED',
    'FOLLOW_UP_REQUIRED',
  ],
  SURVEY_COMPLETED: [
    'INTERNAL_REVIEW',
    'FOLLOW_UP_REQUIRED',
    'READY_FOR_NEXT_STAGE',
  ],
  INTERNAL_REVIEW: [
    'READY_FOR_NEXT_STAGE',
    'FOLLOW_UP_REQUIRED',
    'NOT_TARGET',
  ],
  FOLLOW_UP_REQUIRED: [
    'SURVEY_IN_PROGRESS',
    'SURVEY_COMPLETED',
    'INTERNAL_REVIEW',
    'READY_FOR_NEXT_STAGE',
    'NOT_TARGET',
  ],
  READY_FOR_NEXT_STAGE: [
    'FOLLOW_UP_REQUIRED', // If post-qualification follow-up needed
  ],
  NOT_TARGET: [
    'QUALIFICATION_PENDING', // Only Admin can reopen
  ],
};

/**
 * Roles permitted to perform specific transitions.
 */
const ROLE_RESTRICTED_TRANSITIONS: Partial<Record<RetailerStatus, UserRole[]>> = {
  READY_FOR_NEXT_STAGE: ['admin', 'reviewer'],
  INTERNAL_REVIEW: ['admin', 'reviewer', 'coordinator'],
};

export function canTransitionStatus(
  current: RetailerStatus,
  target: RetailerStatus,
  userRole: UserRole
): { allowed: boolean; reason?: string } {
  if (current === target) {
    return { allowed: true };
  }

  const allowedNext = ALLOWED_TRANSITIONS[current];
  if (!allowedNext || !allowedNext.includes(target)) {
    return {
      allowed: false,
      reason: `Invalid status transition from "${current}" to "${target}".`,
    };
  }

  // Admin has global authority over all allowed transitions
  if (userRole === 'admin') {
    return { allowed: true };
  }

  // Reopening a NOT_TARGET retailer requires admin authority
  if (current === 'NOT_TARGET') {
    return {
      allowed: false,
      reason: 'Only an Admin can reopen a retailer marked as NOT_TARGET.',
    };
  }

  // Approving EXCEPTION_REVIEW to QUALIFIED requires reviewer or admin
  if (current === 'EXCEPTION_REVIEW' && target === 'QUALIFIED' && userRole === 'coordinator') {
    return {
      allowed: false,
      reason: 'Exception review approval to QUALIFIED requires Reviewer or Admin authorization.',
    };
  }

  // Promoting to READY_FOR_NEXT_STAGE requires reviewer or admin
  if (target === 'READY_FOR_NEXT_STAGE' && userRole === 'coordinator') {
    return {
      allowed: false,
      reason: 'Promoting to READY_FOR_NEXT_STAGE requires Reviewer or Admin authorization.',
    };
  }

  return { allowed: true };
}
