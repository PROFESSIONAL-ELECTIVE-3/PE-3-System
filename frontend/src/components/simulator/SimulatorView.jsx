import React from 'react';
import { Sliders } from 'lucide-react';
import { EmptyState } from '../common/StatusStates';
import SimSlider from './SimSlider';
import ResultTile from './ResultTile';
import { runWhatIfSimulation } from '../../lib/api';

export default function SimulatorView() {
  const [attendance, setAttendance] = React.useState(85);
  const [studyHours, setStudyHours] = React.useState(15);
  const [midtermAvg, setMidtermAvg] = React.useState(75);
  const [lmsScore, setLmsScore] = React.useState(80);
  const [empHours, setEmpHours] = React.useState(10);

  const [simResult, setSimResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const runSimulation = React.useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        base_features: {
          current_gpa: 2.8,
          cumulative_gpa: 2.9,
          high_school_gpa: 3.2,
          credit_completion_rate: 0.85,
          midterm_average: midtermAvg,
          course_failure_count: 1,
          attendance_rate: attendance,
          lms_engagement_score: lmsScore,
          study_hours_per_week: studyHours,
          first_generation_student: true,
          socio_economic_index: 45.0,
          employment_hours_per_week: empHours,
          commute_time_minutes: 25,
          department: 'Computer Science',
          financial_aid_status: 'Partial Grant',
        },
        simulated_attendance_rate: attendance,
        simulated_study_hours: studyHours,
        simulated_midterm_average: midtermAvg,
        simulated_lms_engagement: lmsScore,
        simulated_employment_hours: empHours,
      };
      const data = await runWhatIfSimulation(payload);
      setSimResult(data);
    } catch (err) {
      // Swallow — output panel falls back to the empty state.
    } finally {
      setLoading(false);
    }
  }, [attendance, studyHours, midtermAvg, lmsScore, empHours]);

  React.useEffect(() => { runSimulation(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6 fade-in">
      <div className="panel p-5">
        <h2 className="text-base font-bold text-slate-900">What-If Academic Intervention Simulator</h2>
        <p className="text-xs text-slate-500 mt-0.5">Adjust behavioral parameters to forecast the immediate impact on attrition risk and GPA trajectory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="panel p-5 space-y-5">
          <h3 className="text-sm font-bold text-slate-800">Behavioral Parameters</h3>
          <div className="space-y-5">
            <SimSlider label="Attendance Rate" value={attendance} unit="%" min={40} max={100} onChange={setAttendance} />
            <SimSlider label="Study Hours / Week" value={studyHours} unit=" hrs" min={2} max={40} onChange={setStudyHours} />
            <SimSlider label="Midterm Examination Average" value={midtermAvg} unit=" / 100" min={30} max={100} onChange={setMidtermAvg} />
            <SimSlider label="LMS Portal Engagement Score" value={lmsScore} unit=" / 100" min={20} max={100} onChange={setLmsScore} />
            <SimSlider label="Outside Employment Hours / Week" value={empHours} unit=" hrs" min={0} max={40} onChange={setEmpHours} />
          </div>
          <button
            onClick={runSimulation}
            disabled={loading}
            className="btn-primary w-full py-2.5 font-semibold rounded-xl text-xs disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white spinner-smooth" />
                Running…
              </span>
            ) : 'Run ML Simulation'}
          </button>
        </div>

        <div className="panel p-6 lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="section-head">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Comparative Simulation Results</h3>
            <p className="text-xs text-slate-500">Real-time inference from the XGBoost & gradient-boosting models</p>
          </div>

          {simResult ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ResultTile
                label="Attrition Risk Score"
                value={`${(simResult.simulated_risk_score * 100).toFixed(1)}%`}
                pill={simResult.simulated_risk_level}
                delta={simResult.risk_score_delta}
                deltaFormat={v => `${(v * 100).toFixed(1)}%`}
                baseline={`Baseline ${(simResult.baseline_risk_score * 100).toFixed(1)}%`}
                lowerIsBetter
              />
              <ResultTile
                label="Forecasted GPA"
                value={simResult.simulated_predicted_gpa.toFixed(2)}
                sub="Scale 0.0–4.0"
                delta={simResult.gpa_delta}
                deltaFormat={v => v.toFixed(2)}
                baseline={`Baseline ${simResult.baseline_predicted_gpa.toFixed(2)}`}
              />
            </div>
          ) : (
            <EmptyState icon={Sliders} title="No simulation run yet" description="Adjust parameters and run the model to view comparative analytics." />
          )}

          {simResult && (
            <div className="p-4 rounded-xl border text-xs space-y-1 fade-in" style={{ background: 'var(--petrol-light)', borderColor: '#bfe2e4', color: 'var(--petrol-dark)' }}>
              <span className="font-bold">Intervention impact analysis</span>
              <p className="text-slate-700">{simResult.impact_summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
