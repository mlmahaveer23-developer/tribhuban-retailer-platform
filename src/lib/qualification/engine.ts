import {
  QualificationInputs,
  QualificationResult,
  MonthlySalesBand,
  TribhubanPotentialBand,
} from '@/types/qualification';

export const CURRENT_QUALIFICATION_RULE_VERSION = 'qualification_rules_v1';

const VIABLE_CURRENT_SALES_TIERS: MonthlySalesBand[] = [
  '₹1–2 lakh',
  '₹2–3 lakh',
  '₹3–5 lakh',
  '₹5–10 lakh',
  '₹10 lakh+',
];

const VIABLE_POTENTIAL_TIERS: TribhubanPotentialBand[] = [
  '₹1–2 lakh',
  '₹2–3 lakh',
  '₹3–5 lakh',
  '₹5–10 lakh',
  '₹10 lakh+',
];

const BENCHMARK_POTENTIAL_TIERS: TribhubanPotentialBand[] = [
  '₹5–10 lakh',
  '₹10 lakh+',
];

/**
 * Pure evaluation engine for qualification_rules_v1.
 * Decoupled from UI components and side effects.
 */
export function evaluateQualification(inputs: QualificationInputs): QualificationResult {
  const {
    monthlyGrocerySales,
    tribhubanSalesPotential,
    potentialSalesChannels,
    operationalCapacity,
    exceptionGrounds = [],
    exceptionNotes = '',
  } = inputs;

  const now = new Date().toISOString();

  // 1. Check for missing or uncertain critical inputs
  if (
    monthlyGrocerySales === 'Prefer not to say' ||
    tribhubanSalesPotential === 'Not sure' ||
    !potentialSalesChannels ||
    potentialSalesChannels.length === 0 ||
    !operationalCapacity
  ) {
    return {
      ruleVersion: CURRENT_QUALIFICATION_RULE_VERSION,
      state: 'NEEDS_VALIDATION',
      reason: 'Critical sales metrics, sales channels, or operational capacity require field validation.',
      meetsCurrentSalesThreshold: false,
      meetsPotentialBenchmark: false,
      requiresCommercialApproval: false,
      timestamp: now,
    };
  }

  const meetsCurrentSalesThreshold = VIABLE_CURRENT_SALES_TIERS.includes(monthlyGrocerySales);
  const meetsPotentialBenchmark = BENCHMARK_POTENTIAL_TIERS.includes(tribhubanSalesPotential);
  const hasViablePotential = VIABLE_POTENTIAL_TIERS.includes(tribhubanSalesPotential);

  // 2. Standard Qualification Pathway
  // Current FMCG sales >= ₹1 Lakh threshold AND has viable potential
  if (meetsCurrentSalesThreshold && hasViablePotential) {
    const isPrime = meetsPotentialBenchmark;
    return {
      ruleVersion: CURRENT_QUALIFICATION_RULE_VERSION,
      state: 'QUALIFIED',
      reason: isPrime
        ? 'Meets primary FMCG sales threshold and achieves ₹5L+ potential sales benchmark.'
        : 'Meets primary FMCG sales threshold (≥ ₹1 Lakh) with viable commercial potential.',
      meetsCurrentSalesThreshold: true,
      meetsPotentialBenchmark: isPrime,
      requiresCommercialApproval: false,
      timestamp: now,
    };
  }

  // 3. Exception Review Pathway (Current < ₹1 Lakh)
  // Approved V1 Rule:
  // - Current < ₹1L + potential < ₹5L → NOT_TARGET
  // - Current < ₹1L + potential ₹5L+ → EXCEPTION_REVIEW (with exception grounds & credible notes)
  if (monthlyGrocerySales === 'Below ₹1 lakh') {
    // Current < ₹1L + potential < ₹5L → strictly NOT_TARGET
    if (!meetsPotentialBenchmark) {
      return {
        ruleVersion: CURRENT_QUALIFICATION_RULE_VERSION,
        state: 'NOT_TARGET',
        reason: 'Current monthly grocery/FMCG sales are below ₹1 Lakh and estimated Tribhuban potential is below the ₹5L+ primary benchmark required for commercial exception review.',
        meetsCurrentSalesThreshold: false,
        meetsPotentialBenchmark: false,
        requiresCommercialApproval: false,
        timestamp: now,
      };
    }

    // Current < ₹1L + potential ≥ ₹5L (meets primary benchmark)
    const hasExceptionGrounds = exceptionGrounds.length > 0;
    const hasCredibleNotes = exceptionNotes.trim().length >= 10;

    if (hasExceptionGrounds && hasCredibleNotes) {
      return {
        ruleVersion: CURRENT_QUALIFICATION_RULE_VERSION,
        state: 'EXCEPTION_REVIEW',
        reason: 'Current sales are below ₹1 Lakh, but retailer achieves the ₹5L+ potential sales benchmark with verified commercial exception factors and documented commercial rationale.',
        meetsCurrentSalesThreshold: false,
        meetsPotentialBenchmark: true,
        requiresCommercialApproval: true,
        timestamp: now,
      };
    }

    if (hasExceptionGrounds && !hasCredibleNotes) {
      return {
        ruleVersion: CURRENT_QUALIFICATION_RULE_VERSION,
        state: 'NEEDS_VALIDATION',
        reason: 'Commercial exception factors flagged with ₹5L+ potential benchmark, but specific commercial documentation is incomplete.',
        meetsCurrentSalesThreshold: false,
        meetsPotentialBenchmark: true,
        requiresCommercialApproval: false,
        timestamp: now,
      };
    }

    return {
      ruleVersion: CURRENT_QUALIFICATION_RULE_VERSION,
      state: 'NOT_TARGET',
      reason: 'Current monthly grocery/FMCG sales are below the ₹1 Lakh threshold without eligible commercial exception criteria.',
      meetsCurrentSalesThreshold: false,
      meetsPotentialBenchmark: true,
      requiresCommercialApproval: false,
      timestamp: now,
    };
  }

  // 4. Low Potential Pathway
  if (tribhubanSalesPotential === 'Below ₹1 lakh') {
    return {
      ruleVersion: CURRENT_QUALIFICATION_RULE_VERSION,
      state: 'NOT_TARGET',
      reason: 'Estimated Tribhuban monthly sales potential is below minimum operational viability threshold.',
      meetsCurrentSalesThreshold: meetsCurrentSalesThreshold,
      meetsPotentialBenchmark: false,
      requiresCommercialApproval: false,
      timestamp: now,
    };
  }

  // Fallback
  return {
    ruleVersion: CURRENT_QUALIFICATION_RULE_VERSION,
    state: 'NEEDS_VALIDATION',
    reason: 'Application parameters do not match standard qualification matrix.',
    meetsCurrentSalesThreshold: false,
    meetsPotentialBenchmark: false,
    requiresCommercialApproval: false,
    timestamp: now,
  };
}
