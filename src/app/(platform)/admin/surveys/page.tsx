import { SURVEY_V1_QUESTIONS, CURRENT_SURVEY_VERSION } from '@/lib/survey/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function AdminSurveysPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Survey Blueprint & Version Control</h2>
          <p className="text-xs text-slate-500">
            Active data-driven survey questions. Historical submissions remain immutable and linked to their original version.
          </p>
        </div>
        <Badge variant="success" className="text-xs font-semibold">
          Active: {CURRENT_SURVEY_VERSION}
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-navy-900 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-navy-800" /> Version: {CURRENT_SURVEY_VERSION} (9 Questions)
          </CardTitle>
          <span className="text-xs text-slate-500">Target Time: 8–12 mins</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {SURVEY_V1_QUESTIONS.map((q) => (
              <div key={q.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{q.order_index}. {q.question_text}</span>
                    {q.is_required && (
                      <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-bold uppercase">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Section: <strong>{q.section}</strong></span>
                    <span>•</span>
                    <span>Type: <strong className="font-mono">{q.question_type}</strong></span>
                    <span>•</span>
                    <span>ID: <code className="text-slate-400">{q.id}</code></span>
                  </div>
                  {q.options && (
                    <div className="flex flex-wrap gap-1 mt-1.5 pt-1">
                      {q.options.map((opt) => (
                        <span key={opt.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                          {opt.option_label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <Badge variant="default" className="text-[10px]">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
