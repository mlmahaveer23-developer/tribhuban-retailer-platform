import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { CalendarClock } from 'lucide-react';

export default async function AdminFollowUpsPage() {
  const user = await getCurrentUser();
  const followUps = await repository.getFollowUps(user);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Follow-up Pipeline & Due Dates</h2>
          <p className="text-xs text-slate-500">
            Global queue of scheduled field actions across all coordinators.
          </p>
        </div>
        <span className="text-xs text-slate-500 font-medium">{followUps.length} follow-ups scheduled</span>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">Retailer</th>
                <th className="p-3.5">Action Objective</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5 pr-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {followUps.map((flw) => (
                <tr key={flw.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 pl-5 font-semibold text-slate-900">{flw.retailer_name}</td>
                  <td className="p-3.5 text-slate-600">{flw.notes || 'Routine follow-up'}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        flw.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : flw.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {flw.priority}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">{formatDate(flw.due_date)}</td>
                  <td className="p-3.5 pr-5">
                    <Badge variant={flw.status === 'COMPLETED' ? 'success' : 'warning'}>
                      {flw.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
