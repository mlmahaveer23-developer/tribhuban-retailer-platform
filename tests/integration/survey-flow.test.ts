import { describe, it, expect, beforeEach } from 'vitest';
import { repository } from '@/lib/store/repository';
import { AppUser } from '@/types/auth';
import { CURRENT_SURVEY_VERSION, CURRENT_POLICY_VERSION, CONSENT_DISCLAIMER_TEXT } from '@/lib/survey/schema';

describe('End-to-End Core Workflow: Retailer -> Qualification -> Survey -> Submission', () => {
  const coordinator: AppUser = {
    id: 'user_coord_1',
    email: 'coordinator@tribhuban.com',
    full_name: 'Suresh Coordinator',
    role: 'coordinator',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    repository.resetStore();
  });

  it('executes full pipeline: creation, qualification, autosave, submission, and idempotency', async () => {
    // 1. Create Retailer
    const retailer = await repository.createRetailer(
      {
        business_name: 'Test New Mart',
        owner_name: 'Kailash Suthar',
        phone: '+91 98290 99887',
        address: 'Bapu Bazar',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302003',
        business_type: 'Kirana',
        years_in_business: 6,
      },
      coordinator
    );

    expect(retailer.id).toBeDefined();
    expect(retailer.status).toBe('QUALIFICATION_PENDING');

    // 2. Qualify Retailer (Meeting prime benchmark)
    const qual = await repository.saveQualification(
      retailer.id,
      {
        monthlyGrocerySales: '₹3–5 lakh',
        tribhubanSalesPotential: '₹5–10 lakh',
        potentialSalesChannels: ['Walk-in customers', 'Individual products', 'Bundles'],
        operationalCapacity: 'High',
      },
      coordinator
    );

    expect(qual.result.state).toBe('QUALIFIED');
    expect(qual.retailer.status).toBe('QUALIFIED');

    // 3. Autosave Survey (Step 2)
    const session = await repository.autosaveSurvey(
      retailer.id,
      2,
      {
        q_understanding_clarity: 'VERY_CLEAR',
        q_interest_level: 'DEFINITELY_INTERESTED',
      },
      {
        concern_categories: ['Delivery'],
        main_concern_description: 'Delivery frequency within 24 hours required.',
      },
      null,
      coordinator
    );

    expect(session.current_step).toBe(2);
    expect(session.status).toBe('in_progress');

    // Verify session survives and resumes
    const retrievedSession = await repository.getSurveySession(retailer.id);
    expect(retrievedSession.session?.current_step).toBe(2);
    expect(retrievedSession.responses['q_understanding_clarity']).toBe('VERY_CLEAR');

    // 4. Submit Full Survey with Consent
    const submitResult = await repository.submitSurvey(
      {
        retailerId: retailer.id,
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

    expect(submitResult.session.status).toBe('submitted');
    expect(submitResult.retailer.status).toBe('SURVEY_COMPLETED');

    // 5. Test Idempotency (prevent duplicate submission / double submission)
    const secondSubmit = await repository.submitSurvey(
      {
        retailerId: retailer.id,
        surveyVersion: CURRENT_SURVEY_VERSION,
        responses: {},
        concerns: { concern_categories: ['Pricing'], main_concern_description: 'New concern' },
        suggestions: { useful_expectations: 'Test', platform_expectations: [] },
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

    expect(secondSubmit.session.status).toBe('submitted');
    // Ensure responses are not overwritten by duplicate submit
    const finalStored = await repository.getSurveySession(retailer.id);
    expect(finalStored.responses['q_understanding_clarity']).toBe('VERY_CLEAR');
  });
});
