import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, CheckCircle, Clock } from 'lucide-react';

export default async function AdminCoordinatorsPage() {
  const user = await getCurrentUser();
  const allUsers = await repository.getUsers();
  const coordinators = allUsers.filter((u) => u.role === 'coordinator');
  const retailers = await repository.getRetailers(user);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy-900">Coordinator Workload & Performance</h2>
        <p className="text-xs text-slate-500">
          Field coordinator assignments, active pipeline counts, and completed surveys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coordinators.map((coord) => {
          const assignedStores = retailers.filter((r) => r.created_by === coord.id);
          const completedCount = assignedStores.filter((r) => r.status === 'SURVEY_COMPLETED' || r.status === 'READY_FOR_NEXT_STAGE').length;
          const inProgressCount = assignedStores.filter((r) => r.status === 'SURVEY_IN_PROGRESS').length;

          return (
            <Card key={coord.id} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-navy-900 text-sm">{coord.full_name}</h4>
                  <p className="text-xs text-slate-500">{coord.email}</p>
                </div>
                <Badge variant={coord.is_active ? 'success' : 'neutral'}>
                  {coord.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned</span>
                  <span className="text-base font-bold text-slate-900">{assignedStores.length}</span>
                </div>
                <div className="p-2 bg-sky-50 rounded-lg">
                  <span className="text-[10px] text-sky-700 font-bold uppercase block">Active</span>
                  <span className="text-base font-bold text-sky-800">{inProgressCount}</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">Done</span>
                  <span className="text-base font-bold text-emerald-800">{completedCount}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
