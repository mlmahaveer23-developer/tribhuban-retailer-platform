import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { canAccessAdmin } from '@/lib/auth/rbac';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  FileSpreadsheet, 
  Sliders, 
  CalendarClock, 
  ShieldAlert, 
  Settings, 
  FileCheck, 
  BarChart3 
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Server-side RBAC enforcement
  if (!canAccessAdmin(user.role)) {
    redirect('/dashboard');
  }

  const adminNav = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/retailers', label: 'Retailers', icon: Store },
    { href: '/admin/coordinators', label: 'Coordinators', icon: Users },
    { href: '/admin/surveys', label: 'Surveys', icon: FileSpreadsheet },
    { href: '/admin/qualification', label: 'Qualification', icon: Sliders },
    { href: '/admin/follow-ups', label: 'Follow-ups', icon: CalendarClock },
    { href: '/admin/users', label: 'Users & RBAC', icon: FileCheck },
    { href: '/admin/audit', label: 'Audit Logs', icon: ShieldAlert },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs uppercase tracking-wider mb-1">
          <ShieldAlert className="h-4 w-4" /> System Administration Control Center
        </div>
        <h1 className="text-2xl font-bold text-navy-900">Platform Management Hub</h1>
      </div>

      {/* Admin Horizontal Nav Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-medium">
        {adminNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 whitespace-nowrap shadow-xs transition"
            >
              <Icon className="h-3.5 w-3.5 text-slate-500" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
