import React from 'react';
import { AlertTriangle, FileText } from 'lucide-react';

/** Skeleton rows that mimic a data table while content loads — feels faster than a spinner. */
export function LoadingState({ label, rows = 5 }) {
  return (
    <div className="p-5 space-y-3" role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="skeleton h-9 w-9 rounded-full shrink-0" style={{ animationDelay: `${i * 60}ms` }} />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 rounded" style={{ width: `${62 - i * 4}%` }} />
            <div className="skeleton h-2.5 rounded" style={{ width: `${38 - i * 3}%` }} />
          </div>
        </div>
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-2 text-center fade-in">
      <div className="p-3 rounded-full mb-1" style={{ background: 'var(--rose-bg)' }}>
        <AlertTriangle size={20} style={{ color: 'var(--rose)' }} />
      </div>
      <p className="text-sm text-slate-600 max-w-sm">{message}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = FileText, title, description }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-2 text-center fade-in">
      <div className="p-3 rounded-full mb-1" style={{ background: 'var(--sand-deep)' }}>
        <Icon size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="text-xs text-slate-500 max-w-sm">{description}</p>}
    </div>
  );
}
