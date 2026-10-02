import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
}

export function Alert({ variant = 'info', title, className, children, ...props }: AlertProps) {
  const icons = {
    info: <Info className="h-5 w-5 text-sky-600 mt-0.5 flex-shrink-0" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />,
  };

  const variants = {
    info: 'bg-sky-50 border-sky-200 text-sky-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
  };

  return (
    <div
      role="alert"
      className={cn('flex items-start gap-3 p-4 rounded-xl border text-sm', variants[variant], className)}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold text-sm mb-1">{title}</h5>}
        <div className="text-xs md:text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
