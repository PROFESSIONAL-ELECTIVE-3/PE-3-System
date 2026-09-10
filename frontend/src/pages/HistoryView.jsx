import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FilePenLine,
  FilePlus2,
  History as HistoryIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const eventCopy = {
  record_created: { label: "Academic record created", icon: FilePlus2 },
  record_updated: { label: "Academic record updated", icon: FilePenLine },
  forecast_run: { label: "Forecast prediction run", icon: BarChart3 },
  insight_generated: { label: "Support suggestions generated", icon: Activity },
};

const formatDate = (value) => {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function HistoryView({ user }) {
  const { apiFetch } = useAuth();
  const [state, setState] = useState({
    loading: user?.role === "student",
    error: "",
    activities: [],
  });

  useEffect(() => {
    if (user?.role !== "student") return;
    let active = true;

    (async () => {
      try {
        const response = await apiFetch("/api/students/me/history");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Could not load your history.");
        }
        if (active) {
          setState({
            loading: false,
            error: "",
            activities: data.activities || [],
          });
        }
      } catch (error) {
        if (active) {
          setState({
            loading: false,
            error: error.message || "Could not load your history.",
            activities: [],
          });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [apiFetch, user?.role]);

  if (user?.role !== "student") {
    return (
      <section className="workspace-section" id="history">
        <div className="section-heading">
          <div>
            <p className="dashboard-eyebrow">Forecast history</p>
            <h2>Cohort Timeline & Audits</h2>
          </div>
        </div>
        <p className="dashboard-subtext">
          Historical log tracking is active for individual student forecasting runs and institutional updates.
        </p>
      </section>
    );
  }

  if (state.loading) {
    return <p className="student-data-loading">Loading your timeline history…</p>;
  }

  return (
    <section className="workspace-section" id="history">
      <div className="section-heading">
        <div>
          <p className="dashboard-eyebrow">Your Activity</p>
          <h2>Record & Forecast Timeline</h2>
        </div>
      </div>
      <p className="dashboard-subtext">
        A chronological timeline of updates to your academic profile and retention risk forecasts.
      </p>

      {state.error && (
        <div className="login-alert" role="alert">
          {state.error}
        </div>
      )}

      {!state.error && state.activities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            <HistoryIcon size={28} />
          </div>
          <div>
            <h3>No activity logged yet</h3>
            <p>
              Save your academic data in the Data Workspace or generate an academic forecast to begin tracking your timeline.
            </p>
          </div>
        </div>
      ) : (
        <ul className="history-timeline history-timeline--live">
          {state.activities.map((entry) => {
            const details = eventCopy[entry.type] || {
              label: "System Event",
              icon: Activity,
            };
            const Icon = details.icon;
            const forecast = entry.forecast;
            const isHighRisk =
              forecast && Math.round((forecast.dropoutProbability || 0) * 100) > 50;

            return (
              <li key={entry.id || entry._id} className="history-timeline-item">
                <span className="history-timeline-icon">
                  <Icon size={16} />
                </span>

                <div className="history-timeline-body">
                  <div className="history-timeline-main">
                    <strong>{details.label}</strong>
                    <time>{formatDate(entry.createdAt)}</time>
                  </div>

                  {entry.record && (
                    <div className="history-timeline-record-meta">
                      <span>
                        Previous Grade:{" "}
                        <strong>
                          {entry.record.previousSemesterGrade} / {entry.record.gradeMaximum || 20}
                        </strong>
                      </span>
                      <span>
                        Units Approved:{" "}
                        <strong>
                          {entry.record.previousSemesterUnitsApproved} of {entry.record.previousSemesterUnitsEnrolled}
                        </strong>
                      </span>
                      <span>
                        Schedule:{" "}
                        <strong>{entry.record.attendance === "day" ? "Daytime" : "Evening"}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {forecast && (
                  <div className="history-timeline-value">
                    <span className="forecast-metric-badge">
                      Proj. Grade: {forecast.predictedNextSemesterGrade} / {forecast.gradeMaximum || 20}
                    </span>
                    <span
                      className={`forecast-risk-tag ${isHighRisk ? "risk-high" : "risk-low"}`}
                    >
                      {isHighRisk ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                      {Math.round((forecast.dropoutProbability || 0) * 100)}% Attrition Risk
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}