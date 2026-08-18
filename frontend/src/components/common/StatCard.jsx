import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, accent }) {
  return (
    <div className="stat-card p-5 pl-6 flex items-center justify-between" style={{ '--accent': accent }}>
      <div className="min-w-0">
        <div className="text-xs font-medium text-slate-500">{title}</div>
        <div className="font-display text-[26px] leading-tight font-semibold text-slate-900 mt-1 tabular-nums">{value}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-1 truncate">{subtitle}</div>}
      </div>
      <div
        className="p-3 rounded-xl text-white shrink-0 ml-3"
        style={{ background: accent, boxShadow: `0 6px 16px -6px ${accent}99` }}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}
