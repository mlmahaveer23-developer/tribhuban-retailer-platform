import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { QualificationForm } from '@/components/qualification/QualificationForm';
import { InternalAssessmentCard } from '@/components/assessment/InternalAssessmentCard';
import { canConductSurvey, canViewInternalAssessment } from '@/lib/auth/rbac';
import { formatDate, formatDateTime } from '@/lib/utils';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ChevronLeft, 
  ClipboardList, 
  FileText, 
  CheckCircle, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';

export default async function RetailerDetailPage({
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

  const qualification = await repository.getQualification(retailer.id);
  const internalAssessment = await repository.getInternalAssessment(retailer.id, user);
  const surveyData = await repository.getSurveySession(retailer.id);
  const followUps = await repository.getFollowUps(user);
  const retailerFollowUps = followUps.filter((f) => f.retailer_id === retailer.id);

  const canSurvey = (retailer.status === 'QUALIFIED' || retailer.status === 'SURVEY_IN_PROGRESS') && canConductSurvey(user.role);
  const isSurveyCompleted = retailer.status === 'SURVEY_COMPLETED' || retailer.status === 'READY_FOR_NEXT_STAGE';

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-slate-500 hover:text-navy-900 transition flex items-center text-sm">
          <ChevronLeft className="h-4 w-4 mr-0.5" /> Back to Dashboard
        </Link>
        <div className="text-xs text-slate-400">ID: {retailer.id}</div>
      </div>

      {/* Retailer Primary Banner Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-navy-900">{retailer.business_name}</h1>
                <Badge status={retailer.status} className="text-xs px-3 py-1" />
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-medium text-slate-800">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {retailer.owner_name} ({retailer.business_type})
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {retailer.phone}
                </span>
                {retailer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {retailer.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {retailer.address}, {retailer.city} - {retailer.pincode}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="h-4 w-4" />
                  Added {formatDate(retailer.created_at)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              {canSurvey && (
                <Link href={`/survey/${retailer.id}`}>
                  <Button size="lg" variant="success" className="shadow-sm">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    {retailer.status === 'SURVEY_IN_PROGRESS' ? 'Resume Survey' : 'Conduct Full Survey'}
                  </Button>
                </Link>
              )}

              {retailer.status === 'EXCEPTION_REVIEW' && user.role !== 'coordinator' && (
                <Link href="#internal-assessment-section">
                  <Button size="lg" variant="primary">
                    Commercial Review Required
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Qualification Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-navy-800" /> Qualification Assessment
          </h2>
          {qualification && (
            <span className="text-xs text-slate-500">
              Evaluated via <strong className="text-slate-700">{qualification.rule_version}</strong> on {formatDate(qualification.created_at)}
            </span>
          )}
        </div>

        {qualification ? (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Monthly FMCG Sales</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{qualification.monthly_grocery_sales}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Tribhuban Potential</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{qualification.tribhuban_sales_potential}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Store Capacity</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{qualification.operational_capacity}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Result Outcome</span>
                  <div className="mt-1">
                    <Badge status={qualification.result_state} />
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">Sales Channels:</span>
                <div className="flex flex-wrap gap-1.5">
                  {qualification.potential_sales_channels.map((ch) => (
                    <span key={ch} className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {qualification.exception_notes && (
                <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 text-xs text-amber-950 space-y-1">
                  <span className="font-semibold text-amber-900 block">Commercial Exception Grounds:</span>
                  <p>{qualification.exception_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <QualificationForm retailerId={retailer.id} retailerName={retailer.business_name} />
        )}
      </div>

      {/* Survey Results Overview (if survey completed or submitted) */}
      {surveyData.session && surveyData.session.status === 'submitted' && (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-600" /> Completed Survey & Consent Record
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Concerns Box */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-navy-900">Retailer Concerns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex flex-wrap gap-1">
                  {surveyData.concerns?.concern_categories.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-2.5 rounded border border-slate-100">
                  &quot;{surveyData.concerns?.main_concern_description}&quot;
                </p>
              </CardContent>
            </Card>

            {/* Suggestions & Platform Needs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-navy-900">Expectations & Digital Needs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-slate-700">
                  <strong>Usefulness:</strong> {surveyData.suggestions?.useful_expectations}
                </p>
                <div className="flex flex-wrap gap-1">
                  {surveyData.suggestions?.platform_expectations.map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consent Proof Badge */}
          {surveyData.consent && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Verified Consent Recorded:</span> Contact consent, policy acknowledgement, and follow-up permissions accepted on {formatDateTime(surveyData.consent.consented_at)}.
                <p className="text-[11px] text-emerald-800 mt-0.5">Policy Version: {surveyData.consent.policy_version}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Internal Commercial Assessment (Reviewer / Admin only) */}
      {canViewInternalAssessment(user.role) && (
        <div id="internal-assessment-section" className="space-y-3">
          <InternalAssessmentCard
            retailerId={retailer.id}
            retailerName={retailer.business_name}
            existingAssessment={internalAssessment}
          />
        </div>
      )}
    </div>
  );
}
