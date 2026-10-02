export type MonthlySalesBand =
  | 'Below ₹1 lakh'
  | '₹1–2 lakh'
  | '₹2–3 lakh'
  | '₹3–5 lakh'
  | '₹5–10 lakh'
  | '₹10 lakh+'
  | 'Prefer not to say';

export type TribhubanPotentialBand =
  | 'Below ₹1 lakh'
  | '₹1–2 lakh'
  | '₹2–3 lakh'
  | '₹3–5 lakh'
  | '₹5–10 lakh'
  | '₹10 lakh+'
  | 'Not sure';

export type SalesChannel =
  | 'Walk-in customers'
  | 'Individual products'
  | 'Bundles'
  | 'Bulk orders'
  | 'Wholesale'
  | 'Institutional/business customers'
  | 'Online/delivery'
  | 'Referrals'
  | 'Other';

export type OperationalCapacity =
  | 'Small'
  | 'Moderate'
  | 'High'
  | 'Very high';

export type CommercialExceptionGround =
  | 'strong_customer_base'
  | 'bulk_sales'
  | 'wholesale'
  | 'institutional_business_customers'
  | 'online_orders'
  | 'delivery_capability'
  | 'strong_location_demand'
  | 'storage_operational_capacity'
  | 'other_documented_commercial_factors';

export type QualificationState =
  | 'QUALIFIED'
  | 'EXCEPTION_REVIEW'
  | 'NOT_TARGET'
  | 'NEEDS_VALIDATION';

export interface QualificationInputs {
  monthlyGrocerySales: MonthlySalesBand;
  tribhubanSalesPotential: TribhubanPotentialBand;
  potentialSalesChannels: SalesChannel[];
  operationalCapacity: OperationalCapacity;
  exceptionGrounds?: CommercialExceptionGround[];
  exceptionNotes?: string;
}

export interface QualificationResult {
  ruleVersion: string;
  state: QualificationState;
  reason: string;
  meetsCurrentSalesThreshold: boolean;
  meetsPotentialBenchmark: boolean;
  requiresCommercialApproval: boolean;
  timestamp: string;
}

export interface QualificationAssessmentRecord {
  id: string;
  retailer_id: string;
  rule_version: string;
  monthly_grocery_sales: MonthlySalesBand;
  tribhuban_sales_potential: TribhubanPotentialBand;
  potential_sales_channels: SalesChannel[];
  operational_capacity: OperationalCapacity;
  exception_grounds?: CommercialExceptionGround[];
  exception_notes?: string;
  result_state: QualificationState;
  assessed_by?: string;
  created_at: string;
}
