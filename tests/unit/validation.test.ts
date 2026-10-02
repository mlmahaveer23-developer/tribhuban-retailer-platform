import { describe, it, expect } from 'vitest';
import { validateSurveySubmission } from '@/lib/survey/validator';
import { SurveySubmissionPayload } from '@/types/survey';

describe('Survey Submission Validator', () => {
  const validPayload: SurveySubmissionPayload = {
    retailerId: 'ret_test_1',
    surveyVersion: 'survey_v1',
    responses: {
      q_understanding_clarity: 'VERY_CLEAR',
      q_interest_level: 'DEFINITELY_INTERESTED',
      q_readiness_timeline: 'IMMEDIATELY',
      q_concern_categories: ['Delivery'],
      q_main_concern_description: 'Delivery frequency during festive spikes.',
      q_useful_expectations: 'Fast turnaround delivery within 24 hours.',
      q_platform_expectations: ['Easy ordering'],
    },
    concerns: {
      concern_categories: ['Delivery'],
      main_concern_description: 'Delivery frequency during festive spikes.',
    },
    suggestions: {
      useful_expectations: 'Fast turnaround delivery within 24 hours.',
      platform_expectations: ['Easy ordering'],
      model_change_suggestion: '',
    },
    consent: {
      contact_consent: true,
      policy_acknowledgement: true,
      follow_up_permission: true,
      policy_version: 'tribhuban_retailer_policy_v1_2026',
      disclaimer_text: 'Non-banking survey disclaimer',
    },
  };

  it('validates a complete, compliant survey payload successfully', () => {
    const outcome = validateSurveySubmission(validPayload);
    expect(outcome.valid).toBe(true);
    expect(outcome.issues).toHaveLength(0);
  });

  it('rejects if mandatory consent checkmarks are incomplete', () => {
    const incompleteConsent = {
      ...validPayload,
      consent: {
        ...validPayload.consent,
        contact_consent: false, // Not granted
      },
    };

    const outcome = validateSurveySubmission(incompleteConsent);
    expect(outcome.valid).toBe(false);
    expect(outcome.issues.some((i) => i.field === 'consent.contact_consent')).toBe(true);
  });

  it('rejects if required concern details are missing', () => {
    const missingConcern = {
      ...validPayload,
      concerns: {
        concern_categories: [],
        main_concern_description: '',
      },
    };

    const outcome = validateSurveySubmission(missingConcern);
    expect(outcome.valid).toBe(false);
    expect(outcome.issues.some((i) => i.field === 'concerns.concern_categories')).toBe(true);
  });
});
