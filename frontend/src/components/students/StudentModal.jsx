import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { riskTokens } from '../../lib/theme';

export default function StudentModal({ student, onClose }) {
  const risk = student.latest_risk;
  const forecast = student.latest_forecast;
  const rt = riskTokens(risk?.risk_level || 'Low');

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 text-white flex items-center justify-between" style={{ background: 'var(--ink)' }}>
          <div>
            <div className="font-mono-data text-xs" style={{ color: '#7fd6da' }}>Student ID: {student.student_id}</div>
            <h3 className="font-display text-lg font-semibold mt-0.5">{student.first_name} {student.last_name}</h3>
            <div className="text-xs text-slate-300 mt-0.5">{student.major} · {student.department} · Cohort {student.cohort}</div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 active:bg-white/25 text-slate-200 rounded-lg text-xs shrink-0 transition-colors duration-150" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricTile label="Current GPA" value={student.current_gpa.toFixed(2)} />
            <MetricTile label="Attendance Rate" value={`${student.attendance_rate}%`} />
            <MetricTile label="LMS Engagement" value={`${student.lms_engagement_score}/100`} />
            <MetricTile label="Course Failures" value={student.course_failure_count} valueColor="var(--rose)" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border space-y-3" style={{ background: rt.bg, borderColor: rt.border }}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm" style={{ color: rt.text }}>Attrition Risk Evaluation</span>
                <span className="px-2.5 py-1 text-white text-xs font-bold rounded-full" style={{ background: rt.text }}>
                  {risk?.risk_level || 'Low'} Risk · {((risk?.risk_score || 0) * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-slate-600">Model confidence: {((risk?.confidence_score || 0) * 100).toFixed(1)}%</p>

              <div className="space-y-2 mt-3">
                <div className="text-xs font-semibold" style={{ color: rt.text }}>Top contributing factors</div>
                {risk?.top_risk_factors?.map((f, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-lg border text-xs transition-shadow duration-150 hover:shadow-sm" style={{ borderColor: rt.border }}>
                    <span className="font-bold" style={{ color: rt.text }}>{f.factor}:</span> {f.description}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border space-y-3" style={{ background: 'var(--petrol-light)', borderColor: '#bfe2e4' }}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm" style={{ color: 'var(--petrol-dark)' }}>Performance Forecast</span>
                <span className="px-2.5 py-1 text-white text-xs font-bold rounded-full" style={{ background: 'var(--petrol)' }}>
                  {forecast?.forecast_term || 'Next Semester'}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-display text-2xl font-semibold tabular-nums" style={{ color: 'var(--petrol-dark)' }}>{forecast?.predicted_gpa?.toFixed(2) || 'N/A'}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--petrol)' }}>Trajectory: {forecast?.grade_trajectory || 'Stable'}</span>
              </div>
              <p className="text-xs text-slate-600 tabular-nums">95% confidence interval: [{forecast?.lower_bound_gpa?.toFixed(2)} – {forecast?.upper_bound_gpa?.toFixed(2)}]</p>

              <div className="space-y-2 mt-3">
                <div className="text-xs font-semibold" style={{ color: 'var(--petrol-dark)' }}>Recommended advisor interventions</div>
                {risk?.recommended_actions?.map((act, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border text-xs text-slate-700 flex items-center space-x-2 transition-shadow duration-150 hover:shadow-sm" style={{ borderColor: '#bfe2e4' }}>
                    <CheckCircle2 size={14} style={{ color: 'var(--petrol)' }} className="shrink-0" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, valueColor = '#0f172a' }) {
  return (
    <div className="p-4 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm" style={{ background: 'var(--sand)', borderColor: 'var(--line)' }}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-display text-xl font-semibold mt-1 tabular-nums" style={{ color: valueColor }}>{value}</div>
    </div>
  );
}
