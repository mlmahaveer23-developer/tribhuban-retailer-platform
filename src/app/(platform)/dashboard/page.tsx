import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Plus, 
  MapPin, 
  Phone, 
  ArrowUpRight 
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const retailers = await repository.getRetailers(user);
  const metrics = await repository.getSummaryMetrics(user);
  const followUps = await repository.getFollowUps(user);

  const pendingFollowUps = followUps.filter((f) => f.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Retailer Operations Hub</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Logged in as <span className="font-semibold text-slate-800">{user.full_name}</span> ({user.role.toUpperCase()})
          </p>
        </div>

        {user.role !== 'reviewer' && (
          <Link href="/retailers/new">
            <Button size="md" className="shadow-sm">
              <Plus className="mr-1.5 h-4 w-4" /> Add Retailer
            </Button>
          </Link>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total</span>
          <div className="text-2xl font-bold text-navy-900 mt-1">{metrics.totalRetailers}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase">Qualified</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{metrics.counts.QUALIFIED}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase">Exception Rev</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{metrics.counts.EXCEPTION_REVIEW}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 shadow-xs">
          <span className="text-[11px] font-semibold text-sky-800 uppercase">Survey Active</span>
          <div className="text-2xl font-bold text-sky-700 mt-1">{metrics.counts.SURVEY_IN_PROGRESS}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-800 uppercase">Completed</span>
          <div className="text-2xl font-bold text-indigo-700 mt-1">{metrics.counts.SURVEY_COMPLETED}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-800 uppercase">Follow-up Req</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">{metrics.counts.FOLLOW_UP_REQUIRED}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-brand-200 bg-brand-50/60 shadow-xs">
          <span className="text-[11px] font-semibold text-brand-900 uppercase">Ready Next</span>
          <div className="text-2xl font-bold text-brand-800 mt-1">{metrics.counts.READY_FOR_NEXT_STAGE}</div>
        </div>
      </div>

      {/* Pending Follow-Ups Notification Bar */}
      {pendingFollowUps.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-amber-700" />
              <div className="text-xs sm:text-sm text-amber-950">
                <span className="font-semibold">{pendingFollowUps.length} Pending Follow-up Action(s)</span> requiring coordinator attention.
              </div>
            </div>
            <Link
              href="#follow-ups-section"
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
            >
              View list
            </Link>
          </div>
        </div>
      )}

      {/* Main Retailers List */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base text-navy-900">Assigned Retailer Records</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing active accounts visible to your authorization scope.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">{retailers.length} total</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {retailers.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No retailer records found. Click &quot;+ Add Retailer&quot; to initiate your first onboarding.
              </div>
            ) : (
              retailers.map((ret) => {
                const canSurvey = ret.status === 'QUALIFIED' || ret.status === 'SURVEY_IN_PROGRESS';
                const needsQual = ret.status === 'QUALIFICATION_PENDING' || ret.status === 'NEEDS_VALIDATION';

                return (
                  <div
                    key={ret.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/retailers/${ret.id}`}
                          className="font-semibold text-slate-900 hover:text-navy-900 text-sm sm:text-base flex items-center gap-1 group"
                        >
                          {ret.business_name}
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Badge status={ret.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {ret.owner_name} ({ret.business_type})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {ret.city}, {ret.pincode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {ret.phone}
                        </span>
                        <span>Added: {formatDate(ret.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {needsQual && (
                        <Link href={`/retailers/${ret.id}`}>
                          <Button size="sm" variant="primary">
                            Qualify Store
                          </Button>
                        </Link>
                      )}

                      {canSurvey && (
                        <Link href={`/survey/${ret.id}`}>
                          <Button size="sm" variant="success">
                            {ret.status === 'SURVEY_IN_PROGRESS' ? 'Resume Survey' : 'Start Survey'}
                          </Button>
                        </Link>
                      )}

                      <Link href={`/retailers/${ret.id}`}>
                        <Button size="sm" variant="outline">
                          View Details <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Actions Section */}
      <div id="follow-ups-section">
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base text-navy-900">Scheduled Follow-Ups & Tasks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {followUps.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No pending follow-ups scheduled.
                </div>
              ) : (
                followUps.map((flw) => (
                  <div key={flw.id} className="p-4 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {flw.retailer_name}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            flw.priority === 'HIGH'
                              ? 'bg-rose-100 text-rose-700'
                              : flw.priority === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {flw.priority}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{flw.notes || 'Routine follow-up'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-medium text-slate-700">Due: {formatDate(flw.due_date)}</div>
                      <span className="text-[11px] text-slate-400">{flw.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
