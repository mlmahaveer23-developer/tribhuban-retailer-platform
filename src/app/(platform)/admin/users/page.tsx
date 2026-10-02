import { repository } from '@/lib/store/repository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Users, Shield } from 'lucide-react';

export default async function AdminUsersPage() {
  const users = await repository.getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy-900">User Access & Role-Based Control (RBAC)</h2>
          <p className="text-xs text-slate-500">
            Authorized team member accounts and their server-side authorization scopes.
          </p>
        </div>
        <span className="text-xs text-slate-500 font-medium">{users.length} authorized users</span>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">Team Member</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5 pr-5">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 pl-5 font-semibold text-slate-900 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                      {u.full_name.charAt(0)}
                    </div>
                    {u.full_name}
                  </td>
                  <td className="p-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-700'
                          : u.role === 'reviewer'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <Badge variant={u.is_active ? 'success' : 'neutral'}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="p-3.5 pr-5 text-slate-400">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
