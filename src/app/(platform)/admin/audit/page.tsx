import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/utils';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default async function AdminAuditPage() {
  const user = await getCurrentUser();
  const logs = await repository.getAuditLogs(user);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Security & Operational Audit Logs</h2>
          <p className="text-xs text-slate-500">
            Immutable audit trail of retailer state changes, qualification evaluations, survey submissions, and user actions.
          </p>
        </div>
        <span className="text-xs text-slate-500 font-medium">{logs.length} logged events</span>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">Timestamp</th>
                <th className="p-3.5">Actor (Role)</th>
                <th className="p-3.5">Event Type</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5 pr-5">Safe Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 pl-5 text-slate-500 whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <span className="font-bold">{log.actor_role.toUpperCase()}</span>
                    <div className="text-[10px] text-slate-400 font-mono">{log.actor_id}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                      {log.event_type}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <span className="font-medium text-slate-800">{log.entity_type}</span>
                    <div className="text-[10px] text-slate-400 font-mono">{log.entity_id || '—'}</div>
                  </td>
                  <td className="p-3.5 pr-5 text-slate-600 max-w-xs truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : '—'}
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
