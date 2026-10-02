export type SurveyQuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'text'
  | 'rating'
  | 'boolean';

export interface SurveyOption {
  id: string;
  question_id: string;
  option_label: string;
  option_value: string;
  order_index: number;
}

export interface SurveyQuestion {
  id: string;
  survey_version: string;
  section: string;
  question_text: string;
  question_type: SurveyQuestionType;
  order_index: number;
  is_required: boolean;
  conditional_rule?: Record<string, unknown> | null;
  options?: SurveyOption[];
}

export interface SurveySession {
  id: string;
  retailer_id: string;
  survey_version: string;
  current_step: number;
  status: 'in_progress' | 'completed' | 'submitted';
  started_at: string;
  completed_at?: string | null;
  last_saved_at: string;
}

export interface SurveyResponseMap {
  [questionId: string]: string | string[] | number | boolean;
}

export interface RetailerConcernData {
  concern_categories: string[];
  main_concern_description: string;
}

export interface RetailerSuggestionData {
  useful_expectations: string;
  platform_expectations: string[];
  model_change_suggestion?: string;
}

export interface ConsentData {
  contact_consent: boolean;
  policy_acknowledgement: boolean;
  follow_up_permission: boolean;
  policy_version: string;
  disclaimer_text: string;
  consented_at?: string;
}

export interface SurveySubmissionPayload {
  retailerId: string;
  surveyVersion: string;
  responses: SurveyResponseMap;
  concerns: RetailerConcernData;
  suggestions: RetailerSuggestionData;
  consent: ConsentData;
}
