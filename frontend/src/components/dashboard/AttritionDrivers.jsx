import React from 'react';

export default function AttritionDrivers({ drivers }) {
  return (
    <div className="panel panel-interactive p-5">
      <div className="section-head mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Key Attrition Drivers</h3>
        <p className="text-xs text-slate-500">Top features contributing to attrition risk, ranked by feature importance</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {drivers.map((driver, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border space-y-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            style={{ background: 'var(--sand)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow px-1.5 py-0.5 rounded" style={{ color: 'var(--petrol-dark)', background: 'var(--petrol-light)' }}>
                Rank {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-semibold text-slate-600 tabular-nums">{(driver.impact_weight * 100).toFixed(0)}% impact</span>
            </div>
            <div className="text-sm font-semibold text-slate-900">{driver.factor}</div>
            <div className="text-xs text-slate-500">Affects ~{driver.affected_students_pct}% of the flagged cohort</div>
          </div>
        ))}
      </div>
    </div>
  );
}
