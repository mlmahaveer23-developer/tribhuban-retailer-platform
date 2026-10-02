import { describe, it, expect } from 'vitest';
import { evaluateQualification, CURRENT_QUALIFICATION_RULE_VERSION } from '@/lib/qualification/engine';
import { QualificationInputs } from '@/types/qualification';

describe('Qualification Engine (qualification_rules_v1)', () => {
  it('should tag the outcome with the exact rule version', () => {
    const inputs: QualificationInputs = {
      monthlyGrocerySales: '₹3–5 lakh',
      tribhubanSalesPotential: '₹5–10 lakh',
      potentialSalesChannels: ['Walk-in customers', 'Individual products'],
      operationalCapacity: 'High',
    };

    const result = evaluateQualification(inputs);
    expect(result.ruleVersion).toBe('qualification_rules_v1');
    expect(result.state).toBe('QUALIFIED');
    expect(result.meetsCurrentSalesThreshold).toBe(true);
    expect(result.meetsPotentialBenchmark).toBe(true);
  });

  it('should qualify retailer when FMCG sales >= ₹1 Lakh and potential >= ₹1 Lakh', () => {
    const inputs: QualificationInputs = {
      monthlyGrocerySales: '₹1–2 lakh',
      tribhubanSalesPotential: '₹2–3 lakh',
      potentialSalesChannels: ['Walk-in customers'],
      operationalCapacity: 'Moderate',
    };

    const result = evaluateQualification(inputs);
    expect(result.state).toBe('QUALIFIED');
    expect(result.meetsCurrentSalesThreshold).toBe(true);
    expect(result.meetsPotentialBenchmark).toBe(false); // Only ₹5L+ is prime benchmark
  });

  it('should trigger EXCEPTION_REVIEW when FMCG sales < ₹1 Lakh but potential >= ₹5 Lakh and credible commercial factors exist', () => {
    const inputs: QualificationInputs = {
      monthlyGrocerySales: 'Below ₹1 lakh',
      tribhubanSalesPotential: '₹5–10 lakh',
      potentialSalesChannels: ['Walk-in customers', 'Online/delivery'],
      operationalCapacity: 'Moderate',
      exceptionGrounds: ['strong_customer_base', 'delivery_capability'],
      exceptionNotes: 'Store has active local home delivery fleet serving over 200 households daily.',
    };

    const result = evaluateQualification(inputs);
    expect(result.state).toBe('EXCEPTION_REVIEW');
    expect(result.requiresCommercialApproval).toBe(true);
    expect(result.meetsCurrentSalesThreshold).toBe(false);
    expect(result.meetsPotentialBenchmark).toBe(true);
  });

  it('should classify as NOT_TARGET when FMCG sales < ₹1 Lakh and potential < ₹5 Lakh even if exception grounds exist', () => {
    const inputs: QualificationInputs = {
      monthlyGrocerySales: 'Below ₹1 lakh',
      tribhubanSalesPotential: '₹3–5 lakh',
      potentialSalesChannels: ['Walk-in customers', 'Online/delivery'],
      operationalCapacity: 'Moderate',
      exceptionGrounds: ['strong_customer_base', 'delivery_capability'],
      exceptionNotes: 'Store has active local home delivery fleet serving over 200 households daily.',
    };

    const result = evaluateQualification(inputs);
    expect(result.state).toBe('NOT_TARGET');
    expect(result.requiresCommercialApproval).toBe(false);
    expect(result.meetsCurrentSalesThreshold).toBe(false);
    expect(result.meetsPotentialBenchmark).toBe(false);
  });

  it('should require validation if exception grounds are selected with ₹5L+ potential but documentation notes are missing', () => {
    const inputs: QualificationInputs = {
      monthlyGrocerySales: 'Below ₹1 lakh',
      tribhubanSalesPotential: '₹5–10 lakh',
      potentialSalesChannels: ['Walk-in customers'],
      operationalCapacity: 'Moderate',
      exceptionGrounds: ['strong_customer_base'],
      exceptionNotes: '', // Missing explanation
    };

    const result = evaluateQualification(inputs);
    expect(result.state).toBe('NEEDS_VALIDATION');
  });

  it('should classify as NOT_TARGET when sales < ₹1 Lakh with no commercial exception factors', () => {
    const inputs: QualificationInputs = {
      monthlyGrocerySales: 'Below ₹1 lakh',
      tribhubanSalesPotential: '₹1–2 lakh',
      potentialSalesChannels: ['Walk-in customers'],
      operationalCapacity: 'Small',
      exceptionGrounds: [],
      exceptionNotes: '',
    };

    const result = evaluateQualification(inputs);
    expect(result.state).toBe('NOT_TARGET');
  });

  it('should flag NEEDS_VALIDATION if critical fields are uncertain or missing', () => {
    const inputs: QualificationInputs = {
      monthlyGrocerySales: 'Prefer not to say',
      tribhubanSalesPotential: 'Not sure',
      potentialSalesChannels: [],
      operationalCapacity: 'Small',
    };

    const result = evaluateQualification(inputs);
    expect(result.state).toBe('NEEDS_VALIDATION');
  });
});
