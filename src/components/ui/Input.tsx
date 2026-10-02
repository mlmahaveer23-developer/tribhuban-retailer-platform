import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-navy-900 disabled:cursor-not-allowed disabled:bg-slate-50',
            error && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500',
            className
          )}
          {...props}
        />
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
