import React from 'react';
import { Sparkles, Activity, Users, AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import StatCard from '../common/StatCard';
import { LoadingState, ErrorState } from '../common/StatusStates';
import RiskDistributionChart from './RiskDistributionChart';
import DepartmentChart from './DepartmentChart';
import AttritionDrivers from './AttritionDrivers';
import { fetchDashboard } from '../../lib/api';

export default function DashboardView() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    fetchDashboard()
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setFailed(true); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="dashboard-hero rounded-2xl px-6 py-10 sm:px-9 sm:py-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="panel p-5 h-[92px] flex items-center">
              <div className="skeleton w-full h-10 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="panel"><LoadingState label="Loading analytics dashboard" rows={4} /></div>
      </div>
    );
  }
  if (failed || !data) return <ErrorState message="Couldn't load analytics. Confirm the backend service is running, then reload." />;

  return (
    <div className="space-y-6 fade-in">
      <section className="dashboard-hero rounded-2xl px-6 py-8 sm:px-9 sm:py-10 text-white">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] mb-3" style={{ color: '#7fd6da' }}>
            <Sparkles size={14} /> Student success overview
          </div>
          <h1 className="font-display text-2xl sm:text-[34px] leading-tight font-semibold tracking-tight">
            Act early. Support every learner.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 max-w-xl">
            Monitor academic signals across your institution, prioritize outreach where it matters most,
            and turn risk models into timely advisor action.
          </p>
        </div>
        <div className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-xs text-slate-200">
          <Activity size={14} style={{ color: '#7fd6da' }} /> Refreshed from your latest student records
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard title="Total Enrolled Students" value={data.total_students} icon={Users} accent="var(--petrol)" />
        <StatCard title="At-Risk Students Flagged" value={data.at_risk_count} subtitle={`${data.high_risk_count} classified High Risk`} icon={AlertTriangle} accent="var(--amber)" />
        <StatCard title="Institutional Avg. GPA" value={data.average_gpa.toFixed(2)} subtitle="Scale 0.0–4.0" icon={TrendingUp} accent="var(--emerald)" />
        <StatCard title="Active Warning Alerts" value={data.open_alerts_count} icon={Bell} accent="var(--rose)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RiskDistributionChart riskDistribution={data.risk_distribution} />
        <DepartmentChart departmentBreakdown={data.department_breakdown} />
      </div>

      <AttritionDrivers drivers={data.top_attrition_drivers} />
    </div>
  );
}
