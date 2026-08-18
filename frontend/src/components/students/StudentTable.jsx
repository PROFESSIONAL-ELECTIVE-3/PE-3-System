import React from 'react';
import { ChevronRight } from 'lucide-react';
import { riskTokens } from '../../lib/theme';
import { RiskBadge } from '../common/Badge';

export default function StudentTable({ students, onSelectStudent }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs data-table">
        <thead>
          <tr>
            <th className="p-3.5">Student ID</th>
            <th className="p-3.5">Name & Email</th>
            <th className="p-3.5">Major / Dept.</th>
            <th className="p-3.5">Current GPA</th>
            <th className="p-3.5">Attendance</th>
            <th className="p-3.5">Risk Level</th>
            <th className="p-3.5">Forecast GPA</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => {
            const risk = s.latest_risk?.risk_level || 'Low';
            const rt = riskTokens(risk);
            return (
              <tr key={s.id} className="risk-ribbon" style={{ '--ribbon-color': rt.ribbon }}>
                <td className="p-3.5 pl-5 font-mono-data font-medium text-slate-800">{s.student_id}</td>
                <td className="p-3.5">
                  <div className="font-semibold text-slate-900">{s.first_name} {s.last_name}</div>
                  <div className="text-[11px] text-slate-500">{s.email}</div>
                </td>
                <td className="p-3.5 text-slate-700">
                  <div>{s.major}</div>
                  <div className="text-[10px] text-slate-400">{s.department}</div>
                </td>
                <td className="p-3.5 font-semibold text-slate-800">{s.current_gpa.toFixed(2)}</td>
                <td className="p-3.5 text-slate-700">{s.attendance_rate}%</td>
                <td className="p-3.5">
                  <RiskBadge level={risk} scorePct={((s.latest_risk?.risk_score || 0) * 100).toFixed(0)} />
                </td>
                <td className="p-3.5 font-semibold" style={{ color: 'var(--petrol-dark)' }}>
                  {s.latest_forecast?.predicted_gpa.toFixed(2) || 'N/A'}
                  <span className="text-[10px] font-normal text-slate-500 ml-1">({s.latest_forecast?.grade_trajectory || 'Stable'})</span>
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => onSelectStudent(s)}
                    className="px-3 py-1.5 font-medium rounded-lg transition-colors inline-flex items-center space-x-1"
                    style={{ background: 'var(--petrol-light)', color: 'var(--petrol-dark)' }}
                  >
                    <span>Profile</span>
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
