'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  MonthlySalesBand,
  TribhubanPotentialBand,
  SalesChannel,
  OperationalCapacity,
  CommercialExceptionGround,
  QualificationInputs,
} from '@/types/qualification';
import { evaluateQualification } from '@/lib/qualification/engine';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Check, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

interface QualificationFormProps {
  retailerId: string;
  retailerName: string;
  initialData?: QualificationInputs;
  onSuccess?: () => void;
}

const MONTHLY_SALES_OPTIONS: MonthlySalesBand[] = [
  'Below ₹1 lakh',
  '₹1–2 lakh',
  '₹2–3 lakh',
  '₹3–5 lakh',
  '₹5–10 lakh',
  '₹10 lakh+',
  'Prefer not to say',
];

const POTENTIAL_SALES_OPTIONS: TribhubanPotentialBand[] = [
  'Below ₹1 lakh',
  '₹1–2 lakh',
  '₹2–3 lakh',
  '₹3–5 lakh',
  '₹5–10 lakh', // Prime benchmark
  '₹10 lakh+',
  'Not sure',
];

const SALES_CHANNELS: SalesChannel[] = [
  'Walk-in customers',
  'Individual products',
  'Bundles',
  'Bulk orders',
  'Wholesale',
  'Institutional/business customers',
  'Online/delivery',
  'Referrals',
  'Other',
];

const OPERATIONAL_CAPACITY_OPTIONS: OperationalCapacity[] = [
  'Small',
  'Moderate',
  'High',
  'Very high',
];

const EXCEPTION_FACTORS: { id: CommercialExceptionGround; label: string }[] = [
  { id: 'strong_customer_base', label: 'Strong existing customer base' },
  { id: 'bulk_sales', label: 'Bulk sales volume' },
  { id: 'wholesale', label: 'Wholesale / B2B operations' },
  { id: 'institutional_business_customers', label: 'Institutional / Business clients' },
  { id: 'online_orders', label: 'Active online order intake' },
  { id: 'delivery_capability', label: 'Dedicated delivery capability' },
  { id: 'strong_location_demand', label: 'Prime retail location & high footfall' },
  { id: 'storage_operational_capacity', label: 'Ample warehouse / storage space' },
  { id: 'other_documented_commercial_factors', label: 'Other documented commercial factors' },
];

export function QualificationForm({
  retailerId,
  retailerName,
  initialData,
  onSuccess,
}: QualificationFormProps) {
  const router = useRouter();

  const [monthlyGrocerySales, setMonthlyGrocerySales] = useState<MonthlySalesBand>(
    initialData?.monthlyGrocerySales || '₹2–3 lakh'
  );
  const [tribhubanSalesPotential, setTribhubanSalesPotential] = useState<TribhubanPotentialBand>(
    initialData?.tribhubanSalesPotential || '₹5–10 lakh'
  );
  const [potentialSalesChannels, setPotentialSalesChannels] = useState<SalesChannel[]>(
    initialData?.potentialSalesChannels || ['Walk-in customers', 'Individual products', 'Bundles']
  );
  const [operationalCapacity, setOperationalCapacity] = useState<OperationalCapacity>(
    initialData?.operationalCapacity || 'High'
  );
  const [exceptionGrounds, setExceptionGrounds] = useState<CommercialExceptionGround[]>(
    initialData?.exceptionGrounds || []
  );
  const [exceptionNotes, setExceptionNotes] = useState<string>(initialData?.exceptionNotes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Live Pure Engine Evaluation
  const liveResult = useMemo(() => {
    return evaluateQualification({
      monthlyGrocerySales,
      tribhubanSalesPotential,
      potentialSalesChannels,
      operationalCapacity,
      exceptionGrounds,
      exceptionNotes,
    });
  }, [
    monthlyGrocerySales,
    tribhubanSalesPotential,
    potentialSalesChannels,
    operationalCapacity,
    exceptionGrounds,
    exceptionNotes,
  ]);

  const toggleChannel = (channel: SalesChannel) => {
    if (potentialSalesChannels.includes(channel)) {
      setPotentialSalesChannels(potentialSalesChannels.filter((c) => c !== channel));
    } else {
      setPotentialSalesChannels([...potentialSalesChannels, channel]);
    }
  };

  const toggleExceptionGround = (ground: CommercialExceptionGround) => {
    if (exceptionGrounds.includes(ground)) {
      setExceptionGrounds(exceptionGrounds.filter((g) => g !== ground));
    } else {
      setExceptionGrounds([...exceptionGrounds, ground]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/retailers/${retailerId}/qualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyGrocerySales,
          tribhubanSalesPotential,
          potentialSalesChannels,
          operationalCapacity,
          exceptionGrounds,
          exceptionNotes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit qualification assessment.');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/retailers/${retailerId}`);
        router.refresh();
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBelowTarget = monthlyGrocerySales === 'Below ₹1 lakh';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <Alert variant="error" title="Submission Error">
          {submitError}
        </Alert>
      )}

      {/* 1. Current Monthly Grocery / FMCG Sales */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">1. Current Monthly Grocery / FMCG Sales</CardTitle>
            <span className="text-xs text-slate-500 font-medium">Initial threshold: ₹1 Lakh</span>
          </div>
          <CardDescription>
            Reported monthly counter & grocery turnover of {retailerName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {MONTHLY_SALES_OPTIONS.map((tier) => {
              const isSelected = monthlyGrocerySales === tier;
              const isBelow = tier === 'Below ₹1 lakh';
              return (
                <button
                  type="button"
                  key={tier}
                  onClick={() => setMonthlyGrocerySales(tier)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition-all text-left min-h-[48px] ${
                    isSelected
                      ? 'border-navy-900 bg-navy-900 text-white shadow-sm ring-1 ring-navy-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{tier}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
                  {isBelow && !isSelected && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                      Exception
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Estimated Tribhuban Sales Potential */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">2. Estimated Tribhuban Sales Potential</CardTitle>
            <span className="text-xs text-brand-700 font-semibold bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
              Primary Benchmark: ₹5–10 Lakh
            </span>
          </div>
          <CardDescription>
            Projected monthly turnover potential with Tribhuban product lines & bundles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {POTENTIAL_SALES_OPTIONS.map((tier) => {
              const isSelected = tribhubanSalesPotential === tier;
              const isBenchmark = tier === '₹5–10 lakh' || tier === '₹10 lakh+';
              return (
                <button
                  type="button"
                  key={tier}
                  onClick={() => setTribhubanSalesPotential(tier)}
                  className={`relative flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition-all text-left min-h-[48px] ${
                    isSelected
                      ? 'border-brand-600 bg-brand-600 text-white shadow-sm ring-1 ring-brand-600'
                      : isBenchmark
                      ? 'border-brand-200 bg-brand-50/40 text-brand-900 hover:bg-brand-50 hover:border-brand-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isBenchmark && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                    {tier}
                  </span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Potential Sales Channels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">3. Active / Potential Sales Channels</CardTitle>
          <CardDescription>Select all commercial channels the retailer currently uses or intends to deploy.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SALES_CHANNELS.map((channel) => {
              const isSelected = potentialSalesChannels.includes(channel);
              return (
                <button
                  type="button"
                  key={channel}
                  onClick={() => toggleChannel(channel)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs sm:text-sm font-medium transition text-left min-h-[44px] ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{channel}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
          {potentialSalesChannels.length === 0 && (
            <p className="text-xs text-rose-500 mt-2">Please select at least one sales channel.</p>
          )}
        </CardContent>
      </Card>

      {/* 4. Operational Capacity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">4. Store Operational Capacity</CardTitle>
          <CardDescription>Warehouse, storage floor space, staffing, and dispatch capability.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {OPERATIONAL_CAPACITY_OPTIONS.map((cap) => {
              const isSelected = operationalCapacity === cap;
              return (
                <button
                  type="button"
                  key={cap}
                  onClick={() => setOperationalCapacity(cap)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition text-left min-h-[44px] ${
                    isSelected
                      ? 'border-navy-900 bg-navy-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{cap}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Conditional Commercial Exception Review Box (when sales < ₹1 Lakh) */}
      {isBelowTarget && (
        <Card className="border-amber-300 bg-amber-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-base text-amber-900">Commercial Exception Assessment</CardTitle>
            </div>
            <CardDescription className="text-amber-800">
              Retailers below ₹1 Lakh current sales may qualify under <strong>EXCEPTION_REVIEW</strong> with verified commercial factors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Qualifying Commercial Factors:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXCEPTION_FACTORS.map((factor) => {
                  const isChecked = exceptionGrounds.includes(factor.id);
                  return (
                    <label
                      key={factor.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                        isChecked
                          ? 'border-amber-500 bg-amber-100/60 text-amber-950 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleExceptionGround(factor.id)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <span>{factor.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Commercial Exception Documentation Rationale <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={exceptionNotes}
                onChange={(e) => setExceptionNotes(e.target.value)}
                placeholder="Explain credible potential (e.g. prime location, commercial accounts, delivery van fleet, wholesale linkage)..."
                className="w-full text-xs md:text-sm p-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Minimum 10 characters required for reviewer audit.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Engine Outcome Preview */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-semibold text-slate-500">Evaluation Result:</span>
                <Badge status={liveResult.state}>{liveResult.state.replace(/_/g, ' ')}</Badge>
                <span className="text-[10px] text-slate-400">({liveResult.ruleVersion})</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-snug">{liveResult.reason}</p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                disabled={potentialSalesChannels.length === 0}
                variant={liveResult.state === 'NOT_TARGET' ? 'danger' : 'primary'}
                className="w-full sm:w-auto"
              >
                Record Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
