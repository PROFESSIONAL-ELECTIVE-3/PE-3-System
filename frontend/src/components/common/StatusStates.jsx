import React from 'react';
import { AlertTriangle, FileText } from 'lucide-react';

export function LoadingState({ label }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 animate-spin" style={{ borderTopColor: 'var(--petrol)' }} />
      <span className="text-xs font-medium">{label}…</span>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
      <AlertTriangle size={22} style={{ color: 'var(--rose)' }} />
      <p className="text-sm text-slate-600 max-w-sm">{message}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = FileText, title, description }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
      <div className="p-3 rounded-full mb-1" style={{ background: 'var(--sand-deep)' }}>
        <Icon size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="text-xs text-slate-500 max-w-sm">{description}</p>}
    </div>
  );
}
