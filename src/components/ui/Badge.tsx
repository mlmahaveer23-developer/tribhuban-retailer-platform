import React from 'react';
import { cn } from '@/lib/utils';
import { RetailerStatus } from '@/types/retailer';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  status?: RetailerStatus;
}

export function Badge({ className, variant, status, children, ...props }: BadgeProps) {
  let computedVariant = variant || 'default';

  if (status) {
    switch (status) {
      case 'QUALIFIED':
      case 'READY_FOR_NEXT_STAGE':
        computedVariant = 'success';
        break;
      case 'EXCEPTION_REVIEW':
      case 'INTERNAL_REVIEW':
      case 'FOLLOW_UP_REQUIRED':
      case 'NEEDS_VALIDATION':
        computedVariant = 'warning';
        break;
      case 'NOT_TARGET':
        computedVariant = 'danger';
        break;
      case 'SURVEY_IN_PROGRESS':
      case 'SURVEY_COMPLETED':
        computedVariant = 'info';
        break;
      case 'QUALIFICATION_PENDING':
      default:
        computedVariant = 'neutral';
        break;
    }
  }

  const variants = {
    default: 'bg-navy-100 text-navy-900 border-navy-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variants[computedVariant],
        className
      )}
      {...props}
    >
      {children || (status ? status.replace(/_/g, ' ') : '')}
    </span>
  );
}
