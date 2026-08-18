import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { riskTokens } from '../../lib/theme';

export default function ResultTile({ label, value, sub, pill, delta, deltaFormat, baseline, lowerIsBetter }) {
  const isFlat = delta === 0;
  const isGood = lowerIsBetter ? delta < 0 : delta > 0;
  const DeltaIcon = isFlat ? Minus : (delta > 0 ? ArrowUpRight : ArrowDownRight);
  const deltaColor = isFlat ? '#6b7280' : (isGood ? 'var(--emerald)' : 'var(--rose)');
  const rt = pill ? riskTokens(pill) : null;

  return (
    <div className="p-5 rounded-2xl border space-y-3" style={{ background: 'var(--sand)', borderColor: 'var(--line)' }}>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="flex items-baseline space-x-3">
        <span className="font-display text-3xl font-semibold text-slate-900">{value}</span>
        {pill && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: rt.text, background: rt.bg }}>
            {pill} Risk
          </span>
        )}
        {sub && <span className="text-xs font-bold text-slate-500">{sub}</span>}
      </div>
      <div className="flex items-center gap-1.5 text-xs" style={{ color: deltaColor }}>
        <DeltaIcon size={13} />
        <span className="font-semibold">{delta > 0 ? '+' : ''}{deltaFormat(delta)}</span>
        <span className="text-slate-400 font-normal">· {baseline}</span>
      </div>
    </div>
  );
}
