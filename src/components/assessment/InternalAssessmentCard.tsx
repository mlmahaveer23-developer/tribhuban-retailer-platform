'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InternalAssessment } from '@/types/retailer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { ShieldCheck, Lock, Check } from 'lucide-react';

interface InternalAssessmentCardProps {
  retailerId: string;
  retailerName: string;
  existingAssessment?: InternalAssessment | null;
}

export function InternalAssessmentCard({
  retailerId,
  retailerName,
  existingAssessment,
}: InternalAssessmentCardProps) {
  const router = useRouter();

  const [retailerPotential, setRetailerPotential] = useState<InternalAssessment['retailer_potential']>(
    existingAssessment?.retailer_potential || 'High'
  );
  const [expectedTribhubanPotential, setExpectedTribhubanPotential] = useState<
    InternalAssessment['expected_tribhuban_potential']
  >(existingAssessment?.expected_tribhuban_potential || '₹5–10 lakh');
  const [nextAction, setNextAction] = useState<InternalAssessment['next_action']>(
    existingAssessment?.next_action || 'Proceed'
  );
  const [internalNotes, setInternalNotes] = useState<string>(
    existingAssessment?.internal_notes || ''
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/retailers/${retailerId}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailer_potential: retailerPotential,
          expected_tribhuban_potential: expectedTribhubanPotential,
          next_action: nextAction,
          internal_notes: internalNotes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to record internal assessment.');
      }

      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50/20 shadow-sm">
      <CardHeader className="pb-3 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-indigo-700" />
            <CardTitle className="text-base text-indigo-950">Internal Commercial Assessment</CardTitle>
          </div>
          <span className="text-[11px] font-semibold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
            CONFIDENTIAL (Internal Only)
          </span>
        </div>
        <CardDescription className="text-indigo-900/70">
          This assessment is strictly internal for Commercial Reviewers and Admins. It is never exposed to retailers.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">Internal assessment updated and retailer status transitioned.</Alert>}

          {/* 1. Retailer Potential */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
              Retailer Potential
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['High', 'Medium', 'Low', 'Needs review'] as const).map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setRetailerPotential(opt)}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition flex items-center justify-between ${
                    retailerPotential === opt
                      ? 'border-indigo-800 bg-indigo-800 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt}</span>
                  {retailerPotential === opt && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Expected Tribhuban Potential */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
              Expected Tribhuban Potential
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['₹5–10 lakh', '₹10 lakh+', 'Below target', 'Uncertain'] as const).map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setExpectedTribhubanPotential(opt)}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition flex items-center justify-between ${
                    expectedTribhubanPotential === opt
                      ? 'border-indigo-800 bg-indigo-800 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt}</span>
                  {expectedTribhubanPotential === opt && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Next Action */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
              Commercial Next Action
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Proceed', 'Internal review', 'Follow-up required', 'Not target currently'] as const).map(
                (opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setNextAction(opt)}
                    className={`p-2.5 rounded-lg border text-xs font-medium transition flex items-center justify-between ${
                      nextAction === opt
                        ? 'border-navy-900 bg-navy-900 text-white font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {nextAction === opt && <Check className="h-3.5 w-3.5" />}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 4. Internal Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
              Internal Commercial Notes & Strategy
            </label>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Commercial rationale, risk considerations, warehouse assignment, product mix notes..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-700"
            />
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-end">
          <Button type="submit" isLoading={isSaving} size="md" variant="primary">
            Save Internal Assessment
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
