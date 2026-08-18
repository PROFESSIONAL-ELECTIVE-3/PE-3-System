import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RISK_COLORS } from '../../lib/theme';

export default function RiskDistributionChart({ riskDistribution }) {
  const pieData = [
    { name: 'Low Risk', value: riskDistribution['Low Risk'] || 0, color: RISK_COLORS.Low.text },
    { name: 'Medium Risk', value: riskDistribution['Medium Risk'] || 0, color: RISK_COLORS.Medium.text },
    { name: 'High Risk', value: riskDistribution['High Risk'] || 0, color: RISK_COLORS.High.text },
  ];

  return (
    <div className="panel p-5 flex flex-col justify-between">
      <div className="section-head mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Attrition Risk Classification</h3>
        <p className="text-xs text-slate-500">Model distribution across the current student cohort</p>
      </div>
      <div className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={62} outerRadius={86} paddingAngle={3} dataKey="value">
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--line)', fontSize: 12 }} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
