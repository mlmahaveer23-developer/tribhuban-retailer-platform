import { describe, it, expect } from 'vitest';
import { canTransitionStatus } from '@/lib/status/transitions';

describe('Retailer Status State Machine', () => {
  it('allows QUALIFICATION_PENDING to transition to QUALIFIED, EXCEPTION_REVIEW, NOT_TARGET, NEEDS_VALIDATION', () => {
    expect(canTransitionStatus('QUALIFICATION_PENDING', 'QUALIFIED', 'coordinator').allowed).toBe(true);
    expect(canTransitionStatus('QUALIFICATION_PENDING', 'EXCEPTION_REVIEW', 'coordinator').allowed).toBe(true);
    expect(canTransitionStatus('QUALIFICATION_PENDING', 'NOT_TARGET', 'coordinator').allowed).toBe(true);
    expect(canTransitionStatus('QUALIFICATION_PENDING', 'NEEDS_VALIDATION', 'coordinator').allowed).toBe(true);
  });

  it('forbids invalid transitions directly jumping steps', () => {
    // Cannot skip directly from QUALIFICATION_PENDING to SURVEY_COMPLETED
    const check1 = canTransitionStatus('QUALIFICATION_PENDING', 'SURVEY_COMPLETED', 'coordinator');
    expect(check1.allowed).toBe(false);

    // Cannot skip directly from NOT_TARGET to READY_FOR_NEXT_STAGE
    const check2 = canTransitionStatus('NOT_TARGET', 'READY_FOR_NEXT_STAGE', 'coordinator');
    expect(check2.allowed).toBe(false);
  });

  it('requires reviewer or admin to approve EXCEPTION_REVIEW into QUALIFIED', () => {
    // Coordinator cannot approve exception review directly
    const coordCheck = canTransitionStatus('EXCEPTION_REVIEW', 'QUALIFIED', 'coordinator');
    expect(coordCheck.allowed).toBe(false);

    // Reviewer can approve
    const reviewerCheck = canTransitionStatus('EXCEPTION_REVIEW', 'QUALIFIED', 'reviewer');
    expect(reviewerCheck.allowed).toBe(true);

    // Admin can approve
    const adminCheck = canTransitionStatus('EXCEPTION_REVIEW', 'QUALIFIED', 'admin');
    expect(adminCheck.allowed).toBe(true);
  });

  it('requires reviewer or admin to promote to READY_FOR_NEXT_STAGE', () => {
    const coordCheck = canTransitionStatus('INTERNAL_REVIEW', 'READY_FOR_NEXT_STAGE', 'coordinator');
    expect(coordCheck.allowed).toBe(false);

    const reviewerCheck = canTransitionStatus('INTERNAL_REVIEW', 'READY_FOR_NEXT_STAGE', 'reviewer');
    expect(reviewerCheck.allowed).toBe(true);
  });

  it('allows self-transition as no-op', () => {
    expect(canTransitionStatus('QUALIFIED', 'QUALIFIED', 'coordinator').allowed).toBe(true);
  });
});
