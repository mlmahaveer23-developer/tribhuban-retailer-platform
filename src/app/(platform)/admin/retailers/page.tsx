import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

export default async function AdminRetailersPage() {
  const user = await getCurrentUser();
  const retailers = await repository.getRetailers(user);
  const coordinators = (await repository.getUsers()).filter((u) => u.role === 'coordinator');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Retailer Master Registry</h2>
          <p className="text-xs text-slate-500">
            Global administrative view of all stores, qualification statuses, and assignments.
          </p>
        </div>
        <span className="text-xs text-slate-500 font-medium">{retailers.length} stores total</span>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">Business Name</th>
                <th className="p-3.5">Owner / Contact</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Registered</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {retailers.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 pl-5 font-semibold text-slate-900">
                    <Link href={`/retailers/${ret.id}`} className="hover:underline flex items-center gap-1">
                      {ret.business_name}
                      <ArrowUpRight className="h-3 w-3 text-slate-400" />
                    </Link>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {ret.owner_name}
                    <div className="text-[11px] text-slate-400">{ret.phone}</div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {ret.city} ({ret.pincode})
                  </td>
                  <td className="p-3.5">
                    <Badge status={ret.status} />
                  </td>
                  <td className="p-3.5 text-slate-500">{formatDate(ret.created_at)}</td>
                  <td className="p-3.5 pr-5 text-right">
                    <Link href={`/retailers/${ret.id}`}>
                      <Button size="sm" variant="outline">
                        View / Audit
                      </Button>
                    </Link>
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
