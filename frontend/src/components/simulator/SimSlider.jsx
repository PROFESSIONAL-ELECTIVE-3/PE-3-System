import React from 'react';

export default function SimSlider({ label, value, unit, min, max, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
        <span>{label}</span>
        <span style={{ color: 'var(--petrol-dark)' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}
