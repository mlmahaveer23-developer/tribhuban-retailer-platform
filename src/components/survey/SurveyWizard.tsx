'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Retailer } from '@/types/retailer';
import { 
  SurveySession, 
  SurveyResponseMap, 
  RetailerConcernData, 
  RetailerSuggestionData, 
  ConsentData 
} from '@/types/survey';
import { SURVEY_V1_QUESTIONS, CURRENT_SURVEY_VERSION, CURRENT_POLICY_VERSION, CONSENT_DISCLAIMER_TEXT } from '@/lib/survey/schema';
import { BusinessModelCards } from './BusinessModelCards';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Alert } from '@/components/ui/Alert';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  CloudOff, 
  Loader2, 
  Send, 
  ShieldCheck, 
  FileCheck2 
} from 'lucide-react';

interface SurveyWizardProps {
  retailer: Retailer;
  initialSession?: SurveySession | null;
  initialResponses?: SurveyResponseMap;
  initialConcerns?: RetailerConcernData | null;
  initialSuggestions?: RetailerSuggestionData | null;
  initialConsent?: ConsentData | null;
}

export function SurveyWizard({
  retailer,
  initialSession,
  initialResponses = {},
  initialConcerns,
  initialSuggestions,
  initialConsent,
}: SurveyWizardProps) {
  const router = useRouter();

  // Step 1: Presentation, Step 2: Understanding & Interest, Step 3: Concerns, Step 4: Expectations & Suggestions, Step 5: Consent
  const [currentStep, setCurrentStep] = useState<number>(initialSession?.current_step || 1);
  const [responses, setResponses] = useState<SurveyResponseMap>(initialResponses);
  const [concerns, setConcerns] = useState<RetailerConcernData>(
    initialConcerns || {
      concern_categories: ['Delivery'],
      main_concern_description: '',
    }
  );
  const [suggestions, setSuggestions] = useState<RetailerSuggestionData>(
    initialSuggestions || {
      useful_expectations: '',
      platform_expectations: ['Easy ordering', 'Product catalogue'],
      model_change_suggestion: '',
    }
  );
  const [consent, setConsent] = useState<ConsentData>(
    initialConsent || {
      contact_consent: false,
      policy_acknowledgement: false,
      follow_up_permission: false,
      policy_version: CURRENT_POLICY_VERSION,
      disclaimer_text: CONSENT_DISCLAIMER_TEXT,
    }
  );

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(initialSession?.status === 'submitted');

  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Autosave execution
  const performAutosave = useCallback(
    async (step: number) => {
      if (isSubmitted) return;
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/survey/${retailer.id}/autosave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentStep: step,
            responses,
            concerns,
            suggestions,
          }),
        });
        if (!res.ok) throw new Error('Autosave failed');
        setSaveStatus('saved');
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('error');
      }
    },
    [isSubmitted, retailer.id, responses, concerns, suggestions]
  );

  // Trigger debounced autosave on state changes
  useEffect(() => {
    if (isSubmitted) return;
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    autosaveTimeoutRef.current = setTimeout(() => {
      performAutosave(currentStep);
    }, 1200);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [responses, concerns, suggestions, currentStep, performAutosave, isSubmitted]);

  // Handle single choice option selection
  const handleSingleChoice = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  // Handle multi choice toggle
  const handleMultiChoiceToggle = (questionId: string, value: string) => {
    setResponses((prev) => {
      const currentList = (prev[questionId] as string[]) || [];
      const updated = currentList.includes(value)
        ? currentList.filter((v) => v !== value)
        : [...currentList, value];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    performAutosave(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Final checks
    if (!consent.contact_consent || !consent.policy_acknowledgement || !consent.follow_up_permission) {
      setSubmitError('All consent checkmarks are required before survey submission.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/survey/${retailer.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: retailer.id,
          surveyVersion: CURRENT_SURVEY_VERSION,
          responses,
          concerns,
          suggestions,
          consent: {
            ...consent,
            consented_at: new Date().toISOString(),
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Submission failed.');
      }

      setIsSubmitted(true);
      router.push(`/retailers/${retailer.id}?submitted=true`);
      router.refresh();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 5;
  const progressPct = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Step 2 Question lookups
  const qClarity = SURVEY_V1_QUESTIONS.find((q) => q.id === 'q_understanding_clarity');
  const qExplanation = SURVEY_V1_QUESTIONS.find((q) => q.id === 'q_understanding_explanation');
  const qInterest = SURVEY_V1_QUESTIONS.find((q) => q.id === 'q_interest_level');
  const qReadiness = SURVEY_V1_QUESTIONS.find((q) => q.id === 'q_readiness_timeline');
  const qConcerns = SURVEY_V1_QUESTIONS.find((q) => q.id === 'q_concern_categories');
  const qPlatform = SURVEY_V1_QUESTIONS.find((q) => q.id === 'q_platform_expectations');

  return (
    <div className="space-y-6">
      {/* Top Header with Autosave Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Retailer Survey ({CURRENT_SURVEY_VERSION})
          </span>
          <h2 className="text-lg font-bold text-navy-900">{retailer.business_name}</h2>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
              Autosaving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-medium">
              <CloudOff className="h-4 w-4" />
              Autosave failed
            </span>
          )}

          <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPct} />

      {submitError && (
        <Alert variant="error" title="Validation Issue">
          {submitError}
        </Alert>
      )}

      {/* STEP 1: Presentation */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <BusinessModelCards />
          <div className="flex justify-end pt-4">
            <Button size="lg" onClick={() => handleStepChange(2)}>
              Retailer Understood — Continue to Survey
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Understanding, Interest & Readiness */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Business Model Clarity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{qClarity?.question_text}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {qClarity?.options?.map((opt) => {
                  const isSelected = responses['q_understanding_clarity'] === opt.option_value;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleSingleChoice('q_understanding_clarity', opt.option_value)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition text-left min-h-[48px] ${
                        isSelected
                          ? 'border-navy-900 bg-navy-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.option_label}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* What needs more explanation? */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{qExplanation?.question_text}</CardTitle>
              <CardDescription>Select any areas the retailer requested further clarity on.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {qExplanation?.options?.map((opt) => {
                  const currentList = (responses['q_understanding_explanation'] as string[]) || [];
                  const isSelected = currentList.includes(opt.option_label);
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleMultiChoiceToggle('q_understanding_explanation', opt.option_label)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs sm:text-sm font-medium transition text-left min-h-[44px] ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.option_label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Interest Level */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{qInterest?.question_text}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {qInterest?.options?.map((opt) => {
                  const isSelected = responses['q_interest_level'] === opt.option_value;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleSingleChoice('q_interest_level', opt.option_value)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition text-left min-h-[48px] ${
                        isSelected
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.option_label}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Readiness Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{qReadiness?.question_text}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {qReadiness?.options?.map((opt) => {
                  const isSelected = responses['q_readiness_timeline'] === opt.option_value;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleSingleChoice('q_readiness_timeline', opt.option_value)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs sm:text-sm font-medium transition text-left min-h-[48px] ${
                        isSelected
                          ? 'border-navy-900 bg-navy-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.option_label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => handleStepChange(1)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Presentation
            </Button>
            <Button size="lg" onClick={() => handleStepChange(3)}>
              Continue to Concerns <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Concerns */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{qConcerns?.question_text}</CardTitle>
              <CardDescription>Select all specific concern categories voiced by the retailer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {qConcerns?.options?.map((opt) => {
                  const isChecked = concerns.concern_categories.includes(opt.option_label);
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => {
                        const updated = isChecked
                          ? concerns.concern_categories.filter((c) => c !== opt.option_label)
                          : [...concerns.concern_categories, opt.option_label];
                        setConcerns({ ...concerns, concern_categories: updated });
                      }}
                      className={`flex items-center justify-between p-3 rounded-lg border text-xs sm:text-sm font-medium transition text-left min-h-[48px] ${
                        isChecked
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.option_label}</span>
                      {isChecked && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Please describe your main concern <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={concerns.main_concern_description}
                  onChange={(e) =>
                    setConcerns({ ...concerns, main_concern_description: e.target.value })
                  }
                  placeholder="e.g. Retailer is concerned about delivery frequency during peak festivals and margin consistency compared to local wholesalers..."
                  className="w-full text-sm p-3.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => handleStepChange(2)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              size="lg"
              disabled={
                concerns.concern_categories.length === 0 ||
                concerns.main_concern_description.trim().length < 5
              }
              onClick={() => handleStepChange(4)}
            >
              Continue to Expectations <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Expectations & Suggestions */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Expectations & Digital Needs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  What would make Tribhuban more useful for your business? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={suggestions.useful_expectations}
                  onChange={(e) =>
                    setSuggestions({ ...suggestions, useful_expectations: e.target.value })
                  }
                  placeholder="e.g. 24-hour replenishment, seasonal bulk credit, easy WhatsApp order bot..."
                  className="w-full text-sm p-3.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Which digital platform features do you expect to use most?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {qPlatform?.options?.map((opt) => {
                    const isChecked = suggestions.platform_expectations.includes(opt.option_label);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          const updated = isChecked
                            ? suggestions.platform_expectations.filter((p) => p !== opt.option_label)
                            : [...suggestions.platform_expectations, opt.option_label];
                          setSuggestions({ ...suggestions, platform_expectations: updated });
                        }}
                        className={`flex items-center justify-between p-3 rounded-lg border text-xs sm:text-sm font-medium transition text-left min-h-[44px] ${
                          isChecked
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.option_label}</span>
                        {isChecked && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  If you could change one thing about this business model, what would it be?
                </label>
                <textarea
                  rows={2}
                  value={suggestions.model_change_suggestion || ''}
                  onChange={(e) =>
                    setSuggestions({ ...suggestions, model_change_suggestion: e.target.value })
                  }
                  placeholder="Optional feedback on minimum orders, payment terms, or product mix..."
                  className="w-full text-sm p-3.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => handleStepChange(3)}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Concerns
            </Button>
            <Button
              size="lg"
              disabled={
                suggestions.useful_expectations.trim().length < 5 ||
                suggestions.platform_expectations.length === 0
              }
              onClick={() => handleStepChange(5)}
            >
              Continue to Consent & Review <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: Consent & Final Submission */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <Card className="border-slate-300 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-brand-600" />
                <CardTitle className="text-base text-navy-900">Retailer Consent & Acknowledgement</CardTitle>
              </div>
              <CardDescription>
                Record verified retailer consent according to compliance guidelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {/* Mandatory Non-Banking Disclaimer Banner */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950 leading-relaxed">
                <p className="font-semibold text-amber-900 mb-1">Commercial Disclaimer Notice:</p>
                <p>{consent.disclaimer_text}</p>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent.contact_consent}
                    onChange={(e) => setConsent({ ...consent, contact_consent: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="text-xs sm:text-sm">
                    <span className="font-semibold text-slate-900">Contact Permission:</span>{' '}
                    <span className="text-slate-600">
                      I consent to Tribhuban Concepts reaching out via phone, WhatsApp, and in-person store visits regarding FMCG distribution.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent.policy_acknowledgement}
                    onChange={(e) => setConsent({ ...consent, policy_acknowledgement: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="text-xs sm:text-sm">
                    <span className="font-semibold text-slate-900">Policy Acknowledgement ({consent.policy_version}):</span>{' '}
                    <span className="text-slate-600">
                      I acknowledge the commercial terms, quality guidelines, and operational policies of Tribhuban Concepts.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent.follow_up_permission}
                    onChange={(e) => setConsent({ ...consent, follow_up_permission: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="text-xs sm:text-sm">
                    <span className="font-semibold text-slate-900">Follow-Up Coordination:</span>{' '}
                    <span className="text-slate-600">
                      Permission granted for business coordinators to schedule onboarding and next-stage follow-ups.
                    </span>
                  </div>
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => handleStepChange(4)} className="w-full sm:w-auto">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back to Expectations
              </Button>
              <Button
                size="lg"
                variant="success"
                isLoading={isSubmitting}
                disabled={
                  isSubmitted ||
                  !consent.contact_consent ||
                  !consent.policy_acknowledgement ||
                  !consent.follow_up_permission
                }
                onClick={handleFinalSubmit}
                className="w-full sm:w-auto"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Survey & Complete Session
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
