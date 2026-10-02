import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';
import { SurveyWizard } from '@/components/survey/SurveyWizard';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ShieldAlert } from 'lucide-react';

export default async function SurveyPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  let retailer = null;

  try {
    retailer = await repository.getRetailerById(params.id, user);
  } catch {
    // Unauthorized access returns clean notFound to prevent leaking retailer existence
    notFound();
  }

  if (!retailer) {
    notFound();
  }

  // Section 3: Only QUALIFIED and approved EXCEPTION_REVIEW retailers normally proceed
  const canProceed =
    retailer.status === 'QUALIFIED' ||
    retailer.status === 'SURVEY_IN_PROGRESS' ||
    retailer.status === 'SURVEY_COMPLETED';

  if (!canProceed) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 pt-6">
        <Link href={`/retailers/${retailer.id}`} className="text-slate-500 hover:text-navy-900 transition flex items-center text-sm">
          <ChevronLeft className="h-4 w-4 mr-0.5" /> Back to Retailer Profile
        </Link>

        <Alert variant="warning" title="Qualification Required Before Survey">
          Retailer <strong>{retailer.business_name}</strong> is currently in status <strong>{retailer.status.replace(/_/g, ' ')}</strong>.
          <p className="mt-1">
            According to Tribhuban business rules, only <strong>QUALIFIED</strong> retailers (or approved commercial exceptions) can proceed to the structured survey.
          </p>
          <div className="mt-3">
            <Link href={`/retailers/${retailer.id}`}>
              <Button size="sm" variant="primary">
                Complete Qualification Assessment
              </Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  const surveyData = await repository.getSurveySession(retailer.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/retailers/${retailer.id}`} className="text-slate-500 hover:text-navy-900 transition flex items-center text-sm">
          <ChevronLeft className="h-4 w-4 mr-0.5" /> Back to Retailer Record
        </Link>
        <span className="text-xs text-slate-400">Target Completion: 8–12 mins</span>
      </div>

      <SurveyWizard
        retailer={retailer}
        initialSession={surveyData.session}
        initialResponses={surveyData.responses}
        initialConcerns={surveyData.concerns}
        initialSuggestions={surveyData.suggestions}
        initialConsent={surveyData.consent}
      />
    </div>
  );
}
