import { SurveySubmissionPayload } from '@/types/survey';
import { SURVEY_V1_QUESTIONS } from './schema';

export interface ValidationIssue {
  field: string;
  message: string;
}

export function validateSurveySubmission(payload: SurveySubmissionPayload): {
  valid: boolean;
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];

  // 1. Retailer ID & Version checks
  if (!payload.retailerId) {
    issues.push({ field: 'retailerId', message: 'Retailer ID is required.' });
  }
  if (!payload.surveyVersion) {
    issues.push({ field: 'surveyVersion', message: 'Survey version identifier is required.' });
  }

  // 2. Validate mandatory questions
  for (const question of SURVEY_V1_QUESTIONS) {
    if (question.is_required) {
      const answer = payload.responses[question.id];
      if (
        answer === undefined ||
        answer === null ||
        (typeof answer === 'string' && answer.trim() === '') ||
        (Array.isArray(answer) && answer.length === 0)
      ) {
        issues.push({
          field: question.id,
          message: `Question "${question.question_text}" is required.`,
        });
      }
    }
  }

  // 3. Concerns Validation
  if (
    !payload.concerns ||
    !Array.isArray(payload.concerns.concern_categories) ||
    payload.concerns.concern_categories.length === 0
  ) {
    issues.push({
      field: 'concerns.concern_categories',
      message: 'At least one concern category must be selected.',
    });
  }

  if (
    !payload.concerns?.main_concern_description ||
    payload.concerns.main_concern_description.trim().length < 5
  ) {
    issues.push({
      field: 'concerns.main_concern_description',
      message: 'Please provide a meaningful description of the primary concern.',
    });
  }

  // 4. Expectations Validation
  if (
    !payload.suggestions?.useful_expectations ||
    payload.suggestions.useful_expectations.trim().length < 5
  ) {
    issues.push({
      field: 'suggestions.useful_expectations',
      message: 'Please specify what would make Tribhuban more useful for your business.',
    });
  }

  if (
    !payload.suggestions?.platform_expectations ||
    payload.suggestions.platform_expectations.length === 0
  ) {
    issues.push({
      field: 'suggestions.platform_expectations',
      message: 'Please select at least one platform expectation.',
    });
  }

  // 5. Consent Validation (Section 4 & Security Requirements)
  if (!payload.consent?.contact_consent) {
    issues.push({
      field: 'consent.contact_consent',
      message: 'Retailer contact consent is mandatory.',
    });
  }
  if (!payload.consent?.policy_acknowledgement) {
    issues.push({
      field: 'consent.policy_acknowledgement',
      message: 'Retailer policy acknowledgement is mandatory.',
    });
  }
  if (!payload.consent?.follow_up_permission) {
    issues.push({
      field: 'consent.follow_up_permission',
      message: 'Follow-up permission is mandatory.',
    });
  }
  if (!payload.consent?.policy_version) {
    issues.push({
      field: 'consent.policy_version',
      message: 'Policy version identifier is required.',
    });
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
