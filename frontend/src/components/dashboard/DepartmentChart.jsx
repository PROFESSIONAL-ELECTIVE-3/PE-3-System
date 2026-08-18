import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DepartmentChart({ departmentBreakdown }) {
  return (
    <div className="panel p-5 lg:col-span-2">
      <div className="section-head mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Enrollment & Attrition by Department</h3>
        <p className="text-xs text-slate-500">Student distribution across academic departments</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={departmentBreakdown}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
            <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--line)', fontSize: 12 }} cursor={{ fill: 'var(--sand-deep)' }} />
            <Bar dataKey="count" fill="var(--petrol)" radius={[6, 6, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
