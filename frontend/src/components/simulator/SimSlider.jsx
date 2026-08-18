import React from 'react';

export default function SimSlider({ label, value, unit, min, max, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
        <span>{label}</span>
        <span
          className="tabular-nums px-1.5 py-0.5 rounded-md"
          style={{ color: 'var(--petrol-dark)', background: 'var(--petrol-light)' }}
        >
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--petrol) ${pct}%, var(--sand-deep) ${pct}%)`,
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
      />
    </div>
  );
}
