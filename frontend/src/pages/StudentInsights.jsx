import { useEffect, useState } from "react";
import { BarChart3, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const scheduleToApi = (attendance) => attendance === "day" ? "day" : "night";

export default function StudentInsights() {
  const { apiFetch } = useAuth();
  const [state, setState] = useState({ loading: true, error: "", prediction: null, hasRecord: false });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const recordResponse = await apiFetch("/api/students/me");
        const { record } = await recordResponse.json();
        if (!recordResponse.ok) throw new Error("Your academic record could not be loaded.");
        if (!record || !record.previousSemesterUnitsEnrolled) {
          if (active) setState({ loading: false, error: "", prediction: null, hasRecord: false });
          return;
        }

        const response = await apiFetch("/api/ml/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            educationalSpecialNeeds: record.educationalSpecialNeeds,
            tuitionFeeStatus: record.tuitionFeeStatus,
            scholarshipStatus: record.scholarshipStatus,
            studySchedule: scheduleToApi(record.attendance),
            previousSemesterUnitsEnrolled: record.previousSemesterUnitsEnrolled,
            previousSemesterUnitsApproved: record.previousSemesterUnitsApproved,
            previousSemesterGrade: record.previousSemesterGrade,
            gradeMaximum: record.gradeMaximum || 20,
          }),
        });
        const prediction = await response.json();
        if (!response.ok) throw new Error(prediction.detail || prediction.message || "Your forecast could not be generated.");
        if (active) setState({ loading: false, error: "", prediction, hasRecord: true });
      } catch (error) {
        if (active) setState({ loading: false, error: error.message || "Your forecast could not be generated.", prediction: null, hasRecord: true });
      }
    })();
    return () => { active = false; };
  }, [apiFetch]);

  if (state.loading) return <p className="student-data-loading">Generating your forecast…</p>;

  if (!state.hasRecord) return <section className="workspace-section"><div className="section-heading"><div><p className="dashboard-eyebrow">Your forecast</p><h2>Add your semester record first</h2></div></div><p className="dashboard-subtext">Save your study schedule, units, and previous-semester grade in Data Workspace to generate a forecast.</p></section>;

  if (state.error) return <section className="workspace-section"><div className="section-heading"><div><p className="dashboard-eyebrow">Your forecast</p><h2>Forecast unavailable</h2></div></div><div className="login-alert" role="alert">{state.error}</div><p className="dashboard-subtext">Make sure the ML service is running, then try again.</p></section>;

  const { prediction } = state;
  const completionPercent = Math.round(prediction.completionRate * 100);
  const dropoutPercent = Math.round(prediction.dropoutProbability * 100);
  return <section className="workspace-section" id="insights">
    <div className="section-heading"><div><p className="dashboard-eyebrow">Your forecast</p><h2>Next-semester outlook</h2></div></div>
    <div className="dashboard-summary" aria-label="Forecast results">
      <article><span className="summary-icon blue"><BarChart3 size={19} /></span><div><strong>{prediction.predictedNextSemesterGrade} / {prediction.gradeMaximum}</strong><small>Predicted next-semester grade</small></div></article>
      <article><span className="summary-icon amber"><ShieldCheck size={19} /></span><div><strong>{dropoutPercent}%</strong><small>Estimated dropout probability</small></div></article>
      <article><span className="summary-icon green"><BarChart3 size={19} /></span><div><strong>{completionPercent}%</strong><small>Previous-semester completion rate</small></div></article>
    </div>
    <section className="dashboard-guidance"><ShieldCheck size={21} /><p><strong>{prediction.riskLevel[0].toUpperCase() + prediction.riskLevel.slice(1)} support risk.</strong> This is a forecast, not a decision or diagnosis. Discuss it with an adviser or professor to identify useful support early.</p></section>
  </section>;
}
