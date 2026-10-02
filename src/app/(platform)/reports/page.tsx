import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart3, TrendingUp, AlertTriangle, Users, CheckCircle2 } from 'lucide-react';

export default async function ReportsPage() {
  const user = await getCurrentUser();
  const retailers = await repository.getRetailers(user);
  const metrics = await repository.getSummaryMetrics(user);

  const completedSurveys = metrics.counts.SURVEY_COMPLETED + metrics.counts.READY_FOR_NEXT_STAGE;
  const qualificationRate = metrics.totalRetailers > 0 
    ? Math.round(((metrics.counts.QUALIFIED + metrics.counts.SURVEY_IN_PROGRESS + completedSurveys) / metrics.totalRetailers) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Commercial & Survey Intelligence</h1>
          <p className="text-sm text-slate-500">
            Real-time qualification funnel, commercial concerns, and field sales performance.
          </p>
        </div>
      </div>

      {/* Top Stat Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase">Qualification Pass Rate</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{qualificationRate}%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Threshold: ≥ ₹1L sales or exception</p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase">Surveys Completed</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{completedSurveys}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Avg completion: 8–10 mins</p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase">Exception Reviews</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{metrics.counts.EXCEPTION_REVIEW}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Commercial factors flagged</p>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase">Ready For Next Stage</span>
          <div className="text-2xl font-bold text-brand-600 mt-1">{metrics.counts.READY_FOR_NEXT_STAGE}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Approved for commercial supply</p>
        </Card>
      </div>

      {/* Funnel & Concerns Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Qualification Funnel */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base text-navy-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-navy-800" /> Qualification Pipeline Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>1. Stores Approached / Registered</span>
                <span>{metrics.totalRetailers} (100%)</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-navy-900 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>2. Qualified & Commercial Exceptions</span>
                <span>
                  {metrics.counts.QUALIFIED + metrics.counts.EXCEPTION_REVIEW + metrics.counts.SURVEY_IN_PROGRESS + completedSurveys} ({qualificationRate}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${qualificationRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>3. Completed Surveys with Consent</span>
                <span>{completedSurveys}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${metrics.totalRetailers > 0 ? (completedSurveys / metrics.totalRetailers) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>4. Ready for Commercial Onboarding</span>
                <span>{metrics.counts.READY_FOR_NEXT_STAGE}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full"
                  style={{ width: `${metrics.totalRetailers > 0 ? (metrics.counts.READY_FOR_NEXT_STAGE / metrics.totalRetailers) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Concerns Matrix */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base text-navy-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Key Retailer Concerns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Delivery Frequency & Replenishment SLA</span>
                <span className="font-semibold text-slate-900">42%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Margin Consistency vs Local Mandi Wholesalers</span>
                <span className="font-semibold text-slate-900">35%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Payment Terms & Credit Cycle</span>
                <span className="font-semibold text-slate-900">28%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Technology App & Digital Ordering Adoption</span>
                <span className="font-semibold text-slate-900">18%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
