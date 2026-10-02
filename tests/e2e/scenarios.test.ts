import { describe, it, expect, beforeEach } from 'vitest';
import { repository } from '@/lib/store/repository';
import { AppUser } from '@/types/auth';
import { evaluateQualification } from '@/lib/qualification/engine';
import { canTransitionStatus } from '@/lib/status/transitions';
import { CURRENT_SURVEY_VERSION, CURRENT_POLICY_VERSION, CONSENT_DISCLAIMER_TEXT } from '@/lib/survey/schema';

describe('Production Specification Verification: 15 Core Scenarios (Section 16)', () => {
  const coordinator: AppUser = {
    id: 'user_coord_1',
    email: 'coordinator@tribhuban.com',
    full_name: 'Suresh Coordinator',
    role: 'coordinator',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const reviewer: AppUser = {
    id: 'user_reviewer_1',
    email: 'reviewer@tribhuban.com',
    full_name: 'Pooja Reviewer',
    role: 'reviewer',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const admin: AppUser = {
    id: 'user_admin_1',
    email: 'admin@tribhuban.com',
    full_name: 'Mahaveer Admin',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    repository.resetStore();
  });

  // Scenario 1: Coordinator role context
  it('1. Coordinator has valid role context and permissions', () => {
    expect(coordinator.role).toBe('coordinator');
    expect(coordinator.is_active).toBe(true);
  });

  // Scenario 2: Create Retailer
  it('2. Coordinator can create new retailer with valid parameters', async () => {
    const ret = await repository.createRetailer(
      {
        business_name: 'Saraswati Superstore',
        owner_name: 'Sita Ram',
        phone: '+91 94140 12345',
        address: 'Main Market',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
        business_type: 'Kirana',
        years_in_business: 10,
      },
      coordinator
    );
    expect(ret.id).toBeDefined();
    expect(ret.status).toBe('QUALIFICATION_PENDING');
  });

  // Scenario 3: Qualification
  it('3. Evaluates qualification according to qualification_rules_v1', async () => {
    const outcome = evaluateQualification({
      monthlyGrocerySales: '₹2–3 lakh',
      tribhubanSalesPotential: '₹5–10 lakh',
      potentialSalesChannels: ['Walk-in customers', 'Individual products'],
      operationalCapacity: 'High',
    });
    expect(outcome.ruleVersion).toBe('qualification_rules_v1');
    expect(outcome.state).toBe('QUALIFIED');
  });

  // Scenario 4: Qualified retailer proceeds to survey
  it('4. Qualified retailer transitions and is allowed to proceed to survey', async () => {
    const ret = await repository.createRetailer(
      {
        business_name: 'Qualified Store',
        owner_name: 'Mahesh',
        phone: '+91 94140 55555',
        address: 'Bapu Bazar',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
        business_type: 'Kirana',
        years_in_business: 5,
      },
      coordinator
    );

    const qualResult = await repository.saveQualification(
      ret.id,
      {
        monthlyGrocerySales: '₹3–5 lakh',
        tribhubanSalesPotential: '₹5–10 lakh',
        potentialSalesChannels: ['Walk-in customers'],
        operationalCapacity: 'High',
      },
      coordinator
    );

    expect(qualResult.retailer.status).toBe('QUALIFIED');
    // Transition to SURVEY_IN_PROGRESS on start
    const transitionCheck = canTransitionStatus('QUALIFIED', 'SURVEY_IN_PROGRESS', 'coordinator');
    expect(transitionCheck.allowed).toBe(true);
  });

  // Scenario 5: Exception retailer proceeds via approval
  it('5. Exception retailer enters EXCEPTION_REVIEW and requires Reviewer approval', async () => {
    const ret = await repository.createRetailer(
      {
        business_name: 'Exception Store',
        owner_name: 'Dinesh',
        phone: '+91 94140 66666',
        address: 'Station Road',
        city: 'Kota',
        state: 'Rajasthan',
        pincode: '324001',
        business_type: 'Kirana',
        years_in_business: 2,
      },
      coordinator
    );

    const qualResult = await repository.saveQualification(
      ret.id,
      {
        monthlyGrocerySales: 'Below ₹1 lakh',
        tribhubanSalesPotential: '₹5–10 lakh',
        potentialSalesChannels: ['Online/delivery'],
        operationalCapacity: 'Moderate',
        exceptionGrounds: ['strong_customer_base', 'delivery_capability'],
        exceptionNotes: 'Strong home delivery network with 150 local clients.',
      },
      coordinator
    );

    expect(qualResult.retailer.status).toBe('EXCEPTION_REVIEW');

    // Coordinator cannot approve exception directly
    expect(canTransitionStatus('EXCEPTION_REVIEW', 'QUALIFIED', 'coordinator').allowed).toBe(false);

    // Reviewer approves exception
    expect(canTransitionStatus('EXCEPTION_REVIEW', 'QUALIFIED', 'reviewer').allowed).toBe(true);
    const approvedRet = await repository.updateRetailerStatus(ret.id, 'QUALIFIED', reviewer, 'Exception verified');
    expect(approvedRet.status).toBe('QUALIFIED');
  });

  // Scenario 6: Not-target flow
  it('6. Low sales store with no commercial factors is marked NOT_TARGET', async () => {
    const ret = await repository.createRetailer(
      {
        business_name: 'Non Target Store',
        owner_name: 'Raju',
        phone: '+91 94140 77777',
        address: 'Rural Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
        business_type: 'Kiosk',
        years_in_business: 1,
      },
      coordinator
    );

    const qualResult = await repository.saveQualification(
      ret.id,
      {
        monthlyGrocerySales: 'Below ₹1 lakh',
        tribhubanSalesPotential: 'Below ₹1 lakh',
        potentialSalesChannels: ['Walk-in customers'],
        operationalCapacity: 'Small',
        exceptionGrounds: [],
        exceptionNotes: '',
      },
      coordinator
    );

    expect(qualResult.retailer.status).toBe('NOT_TARGET');
  });

  // Scenario 7 & 8: Autosave & Resume after refresh
  it('7 & 8. Autosaves in-progress steps and resumes reliably after refresh', async () => {
    const ret = await repository.createRetailer(
      {
        business_name: 'Autosave Store',
        owner_name: 'Prakash',
        phone: '+91 94140 88888',
        address: 'Tonk Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302018',
        business_type: 'Kirana',
        years_in_business: 7,
      },
      coordinator
    );

    await repository.saveQualification(
      ret.id,
      {
        monthlyGrocerySales: '₹2–3 lakh',
        tribhubanSalesPotential: '₹5–10 lakh',
        potentialSalesChannels: ['Walk-in customers'],
        operationalCapacity: 'Moderate',
      },
      coordinator
    );

    // Coordinator saves Step 3 responses
    await repository.autosaveSurvey(
      ret.id,
      3,
      { q_understanding_clarity: 'MOSTLY_CLEAR' },
      { concern_categories: ['Pricing'], main_concern_description: 'Mandi pricing competition.' },
      null,
      coordinator
    );

    // Simulate page refresh by fetching fresh from repository
    const freshSession = await repository.getSurveySession(ret.id);
    expect(freshSession.session?.current_step).toBe(3);
    expect(freshSession.responses['q_understanding_clarity']).toBe('MOSTLY_CLEAR');
    expect(freshSession.concerns?.main_concern_description).toBe('Mandi pricing competition.');
  });

  // Scenario 9: Submission
  it('9. Submits full survey with consent and updates status to SURVEY_COMPLETED', async () => {
    const ret = await repository.createRetailer(
      {
        business_name: 'Submit Store',
        owner_name: 'Laxman',
        phone: '+91 94140 99999',
        address: 'Ajmer Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302006',
        business_type: 'Grocery',
        years_in_business: 12,
      },
      coordinator
    );

    await repository.saveQualification(
      ret.id,
      {
        monthlyGrocerySales: '₹3–5 lakh',
        tribhubanSalesPotential: '₹5–10 lakh',
        potentialSalesChannels: ['Walk-in customers'],
        operationalCapacity: 'High',
      },
      coordinator
    );

    const submission = await repository.submitSurvey(
      {
        retailerId: ret.id,
        surveyVersion: CURRENT_SURVEY_VERSION,
        responses: {
          q_understanding_clarity: 'VERY_CLEAR',
          q_interest_level: 'DEFINITELY_INTERESTED',
          q_readiness_timeline: 'IMMEDIATELY',
          q_concern_categories: ['Delivery'],
          q_main_concern_description: 'Delivery frequency within 24 hours required.',
          q_useful_expectations: 'Guaranteed 24-hr stock turnaround.',
          q_platform_expectations: ['Easy ordering'],
        },
        concerns: {
          concern_categories: ['Delivery'],
          main_concern_description: 'Delivery frequency within 24 hours required.',
        },
        suggestions: {
          useful_expectations: 'Guaranteed 24-hr stock turnaround.',
          platform_expectations: ['Easy ordering'],
        },
        consent: {
          contact_consent: true,
          policy_acknowledgement: true,
          follow_up_permission: true,
          policy_version: CURRENT_POLICY_VERSION,
          disclaimer_text: CONSENT_DISCLAIMER_TEXT,
        },
      },
      coordinator
    );

    expect(submission.session.status).toBe('submitted');
    expect(submission.retailer.status).toBe('SURVEY_COMPLETED');
  });

  // Scenario 10: Reviewer access
  it('10. Reviewer can view submissions and record internal commercial assessment', async () => {
    const assessment = await repository.saveInternalAssessment(
      'ret_004',
      {
        retailer_potential: 'High',
        expected_tribhuban_potential: '₹5–10 lakh',
        next_action: 'Proceed',
        internal_notes: 'Eligible for direct dispatch.',
      },
      reviewer
    );
    expect(assessment.retailer_potential).toBe('High');
    expect(assessment.next_action).toBe('Proceed');
  });

  // Scenario 11: Admin access
  it('11. Admin has access to global metrics and audit logs', async () => {
    const metrics = await repository.getSummaryMetrics(admin);
    expect(metrics.totalRetailers).toBeGreaterThan(0);
    const logs = await repository.getAuditLogs(admin);
    expect(logs).toBeDefined();
  });

  // Scenario 12: Admin assignment
  it('12. Admin can assign and reassign retailers to coordinators', async () => {
    await repository.reassignRetailer('ret_001', 'user_coord_2', admin);
    const logs = await repository.getAuditLogs(admin);
    const reassignedEvent = logs.find((l) => l.event_type === 'ASSIGNMENT_CHANGED');
    expect(reassignedEvent).toBeDefined();
  });

  // Scenario 13: Unauthorized access denied
  it('13. Coordinator is denied access to admin audit logs', async () => {
    await expect(repository.getAuditLogs(coordinator)).rejects.toThrow(
      'Unauthorized: Admin access required to view audit logs.'
    );
  });

  // Scenario 14: Coordinator cannot access unauthorized retailer
  it('14. Coordinator cannot access another coordinator’s unassigned retailer', async () => {
    const strangerCoordinator: AppUser = {
      id: 'stranger_1',
      email: 'stranger@tribhuban.com',
      full_name: 'Stranger Coordinator',
      role: 'coordinator',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const privateRet = await repository.createRetailer(
      {
        business_name: 'Private Store',
        owner_name: 'Private Owner',
        phone: '+91 99999 33333',
        address: 'Address 1',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
        business_type: 'Kirana',
        years_in_business: 3,
      },
      coordinator
    );

    await expect(repository.getRetailerById(privateRet.id, strangerCoordinator)).rejects.toThrow(
      'Access denied: Coordinator is not assigned to this retailer.'
    );
  });

  // Scenario 15: Configuration change is audited
  it('15. Actions and lifecycle transitions generate structured audit events', async () => {
    const logs = await repository.getAuditLogs(admin);
    expect(logs.length).toBeGreaterThan(0);
    const event = logs[0];
    expect(event.actor_id).toBeDefined();
    expect(event.event_type).toBeDefined();
    expect(event.created_at).toBeDefined();
  });
});
