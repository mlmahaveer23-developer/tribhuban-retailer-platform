import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Store, Users, FileCheck2, ArrowRight, ShieldCheck } from 'lucide-react';

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  const metrics = await repository.getSummaryMetrics(user);
  const retailers = await repository.getRetailers(user);
  const auditLogs = await repository.getAuditLogs(user);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Total Retailers</span>
          <div className="text-xl font-bold text-navy-900 mt-1">{metrics.totalRetailers}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <span className="text-[10px] font-bold text-emerald-800 uppercase">Qualified</span>
          <div className="text-xl font-bold text-emerald-700 mt-1">{metrics.counts.QUALIFIED}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
          <span className="text-[10px] font-bold text-amber-800 uppercase">Exception Rev</span>
          <div className="text-xl font-bold text-amber-700 mt-1">{metrics.counts.EXCEPTION_REVIEW}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
          <span className="text-[10px] font-bold text-rose-800 uppercase">Not Target</span>
          <div className="text-xl font-bold text-rose-700 mt-1">{metrics.counts.NOT_TARGET}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50">
          <span className="text-[10px] font-bold text-sky-800 uppercase">In Progress</span>
          <div className="text-xl font-bold text-sky-700 mt-1">{metrics.counts.SURVEY_IN_PROGRESS}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50">
          <span className="text-[10px] font-bold text-indigo-800 uppercase">Completed</span>
          <div className="text-xl font-bold text-indigo-700 mt-1">{metrics.counts.SURVEY_COMPLETED}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
          <span className="text-[10px] font-bold text-amber-800 uppercase">Follow-up Req</span>
          <div className="text-xl font-bold text-amber-700 mt-1">{metrics.counts.FOLLOW_UP_REQUIRED}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-brand-200 bg-brand-50/60">
          <span className="text-[10px] font-bold text-brand-900 uppercase">Ready Next</span>
          <div className="text-xl font-bold text-brand-800 mt-1">{metrics.counts.READY_FOR_NEXT_STAGE}</div>
        </div>
      </div>

      {/* Admin Modules Quick Launch */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/retailers">
          <Card className="hover:border-navy-900 transition hover:shadow-xs p-4 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-navy-50 text-navy-900">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Retailer Assignments</h4>
                  <p className="text-xs text-slate-500">Manage coordinator allocations</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/qualification">
          <Card className="hover:border-navy-900 transition hover:shadow-xs p-4 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Qualification Rules</h4>
                  <p className="text-xs text-slate-500">qualification_rules_v1 active</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/audit">
          <Card className="hover:border-navy-900 transition hover:shadow-xs p-4 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Security Audit Logs</h4>
                  <p className="text-xs text-slate-500">{auditLogs.length} events logged</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent System Activity Preview */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-navy-900">Recent System Activity</CardTitle>
          <Link href="/admin/audit" className="text-xs font-semibold text-navy-800 hover:underline">
            View full log
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900">{log.event_type}</span> on{' '}
                  <span className="text-slate-600 font-mono text-[11px]">{log.entity_type}</span> ({log.entity_id || '—'})
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Actor: {log.actor_role} ({log.actor_id})
                  </p>
                </div>
                <span className="text-slate-400 text-[11px] shrink-0">{formatDate(log.created_at)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
