export type RetailerStatus =
  | 'QUALIFICATION_PENDING'
  | 'QUALIFIED'
  | 'SURVEY_IN_PROGRESS'
  | 'SURVEY_COMPLETED'
  | 'INTERNAL_REVIEW'
  | 'FOLLOW_UP_REQUIRED'
  | 'READY_FOR_NEXT_STAGE'
  | 'EXCEPTION_REVIEW'
  | 'NOT_TARGET'
  | 'NEEDS_VALIDATION';

export interface Retailer {
  id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  business_type: string;
  years_in_business: number;
  gst_number?: string | null;
  status: RetailerStatus;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RetailerAssignment {
  id: string;
  retailer_id: string;
  coordinator_id: string;
  assigned_by: string;
  assigned_at: string;
  active: boolean;
  notes?: string;
  coordinator_name?: string;
}

export interface InternalAssessment {
  id: string;
  retailer_id: string;
  retailer_potential: 'High' | 'Medium' | 'Low' | 'Needs review';
  expected_tribhuban_potential: '₹5–10 lakh' | '₹10 lakh+' | 'Below target' | 'Uncertain';
  next_action: 'Proceed' | 'Internal review' | 'Follow-up required' | 'Not target currently';
  internal_notes?: string;
  assessed_by: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  retailer_id: string;
  assigned_to: string;
  created_by: string;
  due_date: string;
  status: 'PENDING' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  retailer_name?: string;
}

export interface CommunicationHistoryItem {
  id: string;
  retailer_id: string;
  coordinator_id: string;
  channel: 'IN_PERSON' | 'PHONE' | 'WHATSAPP' | 'EMAIL';
  summary: string;
  next_action?: string;
  created_at: string;
}
