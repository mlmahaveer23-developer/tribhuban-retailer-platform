import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CURRENT_SURVEY_VERSION, CURRENT_POLICY_VERSION } from '@/lib/survey/schema';
import { CURRENT_QUALIFICATION_RULE_VERSION } from '@/lib/qualification/engine';
import { Settings, ShieldCheck, Database, Key } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy-900">System & Policy Settings</h2>
        <p className="text-xs text-slate-500">
          Environment configuration parameters, compliance versions, and security flags.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base text-navy-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Active Platform Versions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs">
            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Qualification Engine Version</span>
              <span className="font-mono font-bold text-slate-900">{CURRENT_QUALIFICATION_RULE_VERSION}</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Active Survey Blueprint</span>
              <span className="font-mono font-bold text-slate-900">{CURRENT_SURVEY_VERSION}</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Consent Policy Identifier</span>
              <span className="font-mono font-bold text-slate-900">{CURRENT_POLICY_VERSION}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base text-navy-900 flex items-center gap-2">
              <Database className="h-4 w-4 text-navy-800" /> Database & Security Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs text-slate-600 leading-relaxed">
            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Database Engine</span>
              <span className="font-semibold text-slate-900">PostgreSQL (Supabase)</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Row Level Security (RLS)</span>
              <span className="font-semibold text-emerald-700">Enforced</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Sensitive Financial Data Storage</span>
              <span className="font-semibold text-rose-700">Disabled (Non-Goal)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
