import { CURRENT_QUALIFICATION_RULE_VERSION } from '@/lib/qualification/engine';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sliders, ShieldCheck } from 'lucide-react';

export default function AdminQualificationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Qualification Rules Engine Control</h2>
          <p className="text-xs text-slate-500">
            Versioned commercial eligibility thresholds and commercial exception rules.
          </p>
        </div>
        <Badge variant="success" className="text-xs">
          Active: {CURRENT_QUALIFICATION_RULE_VERSION}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base text-navy-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-navy-800" /> Standard Qualification Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs">
            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-slate-900">Current Grocery/FMCG Sales Threshold</span>
                <p className="text-[11px] text-slate-500">Minimum monthly store turnover required for instant qualification</p>
              </div>
              <span className="font-bold text-navy-900 shrink-0">≥ ₹1 Lakh</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-slate-900">Tribhuban Potential Prime Benchmark</span>
                <p className="text-[11px] text-slate-500">Primary commercial viability benchmark (non-guaranteed)</p>
              </div>
              <span className="font-bold text-brand-700 shrink-0">≥ ₹5–10 Lakh</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-slate-900">Minimum Potential Viability</span>
                <p className="text-[11px] text-slate-500">Stores below this potential are classified as NOT_TARGET</p>
              </div>
              <span className="font-bold text-rose-700 shrink-0">₹1 Lakh</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base text-navy-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" /> Commercial Exception Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs text-slate-700 leading-relaxed">
            <p>
              A retailer with current monthly FMCG sales below the ₹1 Lakh threshold may still qualify under <strong>EXCEPTION_REVIEW</strong> if credible commercial factors are verified.
            </p>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-950 space-y-1">
              <span className="font-bold block">Approved Exception Grounds:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Strong customer base or dense residential sector</li>
                <li>Wholesale or B2B operations</li>
                <li>Institutional / corporate supply contracts</li>
                <li>Active online order and dedicated delivery fleet</li>
                <li>Warehouse / bulk storage capacity</li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Note: Moving an exception store to QUALIFIED requires Reviewer or Admin approval and is fully audited.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
