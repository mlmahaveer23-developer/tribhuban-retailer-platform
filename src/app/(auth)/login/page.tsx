'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('coordinator');

  const handleLogin = (role: UserRole) => {
    let email = 'coordinator@tribhuban.com';
    let full_name = 'Suresh Coordinator';
    let id = 'user_coord_1';

    if (role === 'admin') {
      email = 'admin@tribhuban.com';
      full_name = 'Mahaveer Admin';
      id = 'user_admin_1';
    } else if (role === 'reviewer') {
      email = 'reviewer@tribhuban.com';
      full_name = 'Pooja Commercial Reviewer';
      id = 'user_reviewer_1';
    }

    const authUser = {
      id,
      email,
      full_name,
      role,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    document.cookie = `tribhuban_auth_user=${JSON.stringify(authUser)}; path=/; max-age=86400; SameSite=Lax`;
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-2xl shadow-md mb-2">
            T
          </div>
          <CardTitle className="text-xl font-bold text-navy-900">Tribhuban Retailer Platform</CardTitle>
          <CardDescription>
            Secure internal sign-in for Field Coordinators, Reviewers, and System Administrators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Select Authorized User Role:
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedRole('coordinator')}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                  selectedRole === 'coordinator'
                    ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="h-9 w-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Business Coordinator</div>
                  <div className="text-xs text-slate-500">Field sales, qualification & surveys</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('reviewer')}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                  selectedRole === 'reviewer'
                    ? 'border-amber-600 bg-amber-50/60 ring-1 ring-amber-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Commercial Reviewer</div>
                  <div className="text-xs text-slate-500">Internal assessment & exception approvals</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                  selectedRole === 'admin'
                    ? 'border-rose-600 bg-rose-50/60 ring-1 ring-rose-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="h-9 w-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">System Administrator</div>
                  <div className="text-xs text-slate-500">Full operations, audit & configuration</div>
                </div>
              </button>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full mt-4"
            onClick={() => handleLogin(selectedRole)}
          >
            Access Platform as {selectedRole.toUpperCase()}
          </Button>

          <p className="text-[11px] text-center text-slate-400 mt-2">
            Production builds enforce Supabase Auth with Row Level Security.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
