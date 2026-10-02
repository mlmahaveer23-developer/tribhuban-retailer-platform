import { Retailer, RetailerAssignment, InternalAssessment, FollowUp } from '@/types/retailer';
import { AppUser } from '@/types/auth';
import { SurveySession, SurveyResponseMap, RetailerConcernData, RetailerSuggestionData, ConsentData } from '@/types/survey';
import { QualificationAssessmentRecord } from '@/types/qualification';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user_admin_1',
    email: 'admin@tribhuban.com',
    full_name: 'Mahaveer Admin',
    role: 'admin',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_coord_1',
    email: 'coordinator@tribhuban.com',
    full_name: 'Suresh Coordinator',
    phone: '+91 98290 12345',
    role: 'coordinator',
    is_active: true,
    created_at: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'user_reviewer_1',
    email: 'reviewer@tribhuban.com',
    full_name: 'Pooja Commercial Reviewer',
    role: 'reviewer',
    is_active: true,
    created_at: '2026-01-08T00:00:00.000Z',
  },
];

export const INITIAL_RETAILERS: Retailer[] = [
  {
    id: 'ret_001',
    business_name: 'Shree Balaji Kirana & Superstore',
    owner_name: 'Ramesh Sharma',
    phone: '+91 98291 55443',
    email: 'balaji.kirana@example.com',
    address: 'Shop 14, Main Mandi Road',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    business_type: 'Kirana & Grocery',
    years_in_business: 12,
    gst_number: '08AAAAA0000A1Z5',
    status: 'QUALIFIED',
    created_by: 'user_coord_1',
    created_at: '2026-02-10T10:00:00.000Z',
    updated_at: '2026-02-10T10:15:00.000Z',
  },
  {
    id: 'ret_002',
    business_name: 'Kisan Mini Mart',
    owner_name: 'Gopal Soni',
    phone: '+91 94140 88776',
    address: 'Near Clock Tower',
    city: 'Jodhpur',
    state: 'Rajasthan',
    pincode: '342001',
    business_type: 'General Store',
    years_in_business: 4,
    status: 'EXCEPTION_REVIEW',
    created_by: 'user_coord_1',
    created_at: '2026-02-12T11:30:00.000Z',
    updated_at: '2026-02-12T11:45:00.000Z',
  },
  {
    id: 'ret_003',
    business_name: 'Mahalaxmi Daily Provision',
    owner_name: 'Sunil Choudhary',
    phone: '+91 97850 11223',
    address: 'Station Road',
    city: 'Kota',
    state: 'Rajasthan',
    pincode: '324002',
    business_type: 'Grocery',
    years_in_business: 8,
    status: 'SURVEY_IN_PROGRESS',
    created_by: 'user_coord_1',
    created_at: '2026-02-14T09:00:00.000Z',
    updated_at: '2026-02-14T09:20:00.000Z',
  },
  {
    id: 'ret_004',
    business_name: 'Chandan Mega Traders',
    owner_name: 'Vikram Singh',
    phone: '+91 99280 44332',
    address: 'Surajpole Mandi',
    city: 'Udaipur',
    state: 'Rajasthan',
    pincode: '313001',
    business_type: 'Wholesale & Retail',
    years_in_business: 18,
    gst_number: '08BBBBB1111B1Z2',
    status: 'SURVEY_COMPLETED',
    created_by: 'user_coord_1',
    created_at: '2026-02-15T14:00:00.000Z',
    updated_at: '2026-02-15T14:45:00.000Z',
  },
];

export const INITIAL_ASSIGNMENTS: RetailerAssignment[] = [
  {
    id: 'asgn_001',
    retailer_id: 'ret_001',
    coordinator_id: 'user_coord_1',
    assigned_by: 'user_admin_1',
    assigned_at: '2026-02-10T10:05:00.000Z',
    active: true,
  },
  {
    id: 'asgn_002',
    retailer_id: 'ret_002',
    coordinator_id: 'user_coord_1',
    assigned_by: 'user_admin_1',
    assigned_at: '2026-02-12T11:35:00.000Z',
    active: true,
  },
  {
    id: 'asgn_003',
    retailer_id: 'ret_003',
    coordinator_id: 'user_coord_1',
    assigned_by: 'user_admin_1',
    assigned_at: '2026-02-14T09:05:00.000Z',
    active: true,
  },
  {
    id: 'asgn_004',
    retailer_id: 'ret_004',
    coordinator_id: 'user_coord_1',
    assigned_by: 'user_admin_1',
    assigned_at: '2026-02-15T14:05:00.000Z',
    active: true,
  },
];

export const INITIAL_ASSESSMENTS: QualificationAssessmentRecord[] = [
  {
    id: 'qual_001',
    retailer_id: 'ret_001',
    rule_version: 'qualification_rules_v1',
    monthly_grocery_sales: '₹3–5 lakh',
    tribhuban_sales_potential: '₹5–10 lakh',
    potential_sales_channels: ['Walk-in customers', 'Individual products', 'Bundles'],
    operational_capacity: 'High',
    result_state: 'QUALIFIED',
    assessed_by: 'user_coord_1',
    created_at: '2026-02-10T10:15:00.000Z',
  },
  {
    id: 'qual_002',
    retailer_id: 'ret_002',
    rule_version: 'qualification_rules_v1',
    monthly_grocery_sales: 'Below ₹1 lakh',
    tribhuban_sales_potential: '₹2–3 lakh',
    potential_sales_channels: ['Walk-in customers', 'Online/delivery'],
    operational_capacity: 'Moderate',
    exception_grounds: ['strong_customer_base', 'delivery_capability'],
    exception_notes: 'Prime location facing residential sector with strong existing local home-delivery demand.',
    result_state: 'EXCEPTION_REVIEW',
    assessed_by: 'user_coord_1',
    created_at: '2026-02-12T11:45:00.000Z',
  },
];

export const INITIAL_SESSIONS: SurveySession[] = [
  {
    id: 'sess_003',
    retailer_id: 'ret_003',
    survey_version: 'survey_v1',
    current_step: 3,
    status: 'in_progress',
    started_at: '2026-02-14T09:10:00.000Z',
    last_saved_at: '2026-02-14T09:20:00.000Z',
  },
  {
    id: 'sess_004',
    retailer_id: 'ret_004',
    survey_version: 'survey_v1',
    current_step: 5,
    status: 'submitted',
    started_at: '2026-02-15T14:10:00.000Z',
    completed_at: '2026-02-15T14:45:00.000Z',
    last_saved_at: '2026-02-15T14:45:00.000Z',
  },
];

export const INITIAL_RESPONSES: Record<string, SurveyResponseMap> = {
  sess_003: {
    q_understanding_clarity: 'VERY_CLEAR',
    q_understanding_explanation: ['Bundles', 'Delivery'],
    q_interest_level: 'DEFINITELY_INTERESTED',
  },
  sess_004: {
    q_understanding_clarity: 'VERY_CLEAR',
    q_understanding_explanation: ['Pricing'],
    q_interest_level: 'DEFINITELY_INTERESTED',
    q_readiness_timeline: 'IMMEDIATELY',
    q_concern_categories: ['Delivery', 'Margin/benefit'],
    q_main_concern_description: 'Timely replenishment of fast-moving grocery units during festival peaks.',
    q_useful_expectations: 'Guaranteed 48-hour delivery SLA with wholesale margin consistency.',
    q_platform_expectations: ['Easy ordering', 'Sales tracking', 'Delivery support'],
    q_suggestion_change: 'Provide a direct WhatsApp alert option for stock dispatch.',
  },
};

export const INITIAL_CONCERNS: Record<string, RetailerConcernData> = {
  ret_004: {
    concern_categories: ['Delivery', 'Margin/benefit'],
    main_concern_description: 'Timely replenishment of fast-moving grocery units during festival peaks.',
  },
};

export const INITIAL_SUGGESTIONS: Record<string, RetailerSuggestionData> = {
  ret_004: {
    useful_expectations: 'Guaranteed 48-hour delivery SLA with wholesale margin consistency.',
    platform_expectations: ['Easy ordering', 'Sales tracking', 'Delivery support'],
    model_change_suggestion: 'Provide a direct WhatsApp alert option for stock dispatch.',
  },
};

export const INITIAL_CONSENTS: Record<string, ConsentData> = {
  ret_004: {
    contact_consent: true,
    policy_acknowledgement: true,
    follow_up_permission: true,
    policy_version: 'tribhuban_retailer_policy_v1_2026',
    disclaimer_text: 'Acknowledged non-banking business survey disclaimer.',
    consented_at: '2026-02-15T14:40:00.000Z',
  },
};

export const INITIAL_INTERNAL_ASSESSMENTS: Record<string, InternalAssessment> = {
  ret_004: {
    id: 'int_ass_004',
    retailer_id: 'ret_004',
    retailer_potential: 'High',
    expected_tribhuban_potential: '₹5–10 lakh',
    next_action: 'Proceed',
    internal_notes: 'Established wholesaler with strong counter sales. Recommended for Tier 1 onboarding.',
    assessed_by: 'user_reviewer_1',
    created_at: '2026-02-16T10:00:00.000Z',
    updated_at: '2026-02-16T10:00:00.000Z',
  },
};

export const INITIAL_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'flw_001',
    retailer_id: 'ret_001',
    assigned_to: 'user_coord_1',
    created_by: 'user_coord_1',
    due_date: '2026-03-05T10:00:00.000Z',
    status: 'PENDING',
    priority: 'HIGH',
    notes: 'Schedule full survey conversation and presentation with owner Rameshji.',
    created_at: '2026-02-10T10:20:00.000Z',
    updated_at: '2026-02-10T10:20:00.000Z',
  },
  {
    id: 'flw_002',
    retailer_id: 'ret_002',
    assigned_to: 'user_coord_1',
    created_by: 'user_reviewer_1',
    due_date: '2026-03-02T15:00:00.000Z',
    status: 'PENDING',
    priority: 'MEDIUM',
    notes: 'Collect photo verification of delivery vehicle capacity for commercial exception file.',
    created_at: '2026-02-13T12:00:00.000Z',
    updated_at: '2026-02-13T12:00:00.000Z',
  },
];
