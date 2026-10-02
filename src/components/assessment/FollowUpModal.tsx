'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { X, Calendar } from 'lucide-react';

interface FollowUpModalProps {
  retailerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FollowUpModal({ retailerId, isOpen, onClose, onSuccess }: FollowUpModalProps) {
  const router = useRouter();
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/retailers/${retailerId}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          due_date: new Date(dueDate).toISOString(),
          priority,
          notes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create follow-up.');
      }

      if (onSuccess) onSuccess();
      onClose();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-navy-900" />
            <h3 className="font-semibold text-slate-900 text-base">Schedule Follow-up Action</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`p-2 rounded-lg border text-xs font-semibold transition ${
                    priority === p
                      ? p === 'HIGH'
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : p === 'MEDIUM'
                        ? 'border-amber-600 bg-amber-600 text-white'
                        : 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Action Notes & Objectives
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring bundle sample catalog, confirm warehouse delivery access..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Save Follow-up
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
