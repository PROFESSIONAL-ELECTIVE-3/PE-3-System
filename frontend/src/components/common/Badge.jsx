import React from 'react';
import { riskTokens } from '../../lib/theme';

/** Pill badge for a risk level (Low / Medium / High), with optional score text. */
export function RiskBadge({ level, scorePct }) {
  const rt = riskTokens(level);
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[10px] font-bold border"
      style={{ color: rt.text, background: rt.bg, borderColor: rt.border }}
    >
      {level} Risk{scorePct != null ? ` · ${scorePct}%` : ''}
    </span>
  );
}

/** Generic colored pill for statuses like "CRITICAL", "Resolved", "FERPA secure". */
export function StatusPill({ children, color = '#6b7280', bg = '#f1f5f9', icon: Icon }) {
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1"
      style={{ color, background: bg }}
    >
      {Icon && <Icon size={11} />}
      {children}
    </span>
  );
}
