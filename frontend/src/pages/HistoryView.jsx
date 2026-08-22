import { History as HistoryIcon, Info, TrendingDown, TrendingUp } from "lucide-react";

const copyByRole = {
  professor: {
    title: "Forecast history",
    body:
      "You'll see how your class's risk signals and forecasts have changed over time once your institution connects data. This helps you spot trends, not just single-point-in-time scores.",
  },
  administrator: {
    title: "Forecast history",
    body:
      "You'll see how risk signals and forecasts have shifted across your institution over time once data is connected.",
  },
  student: {
    title: "Your forecast history",
    body:
      "You'll see how your own risk score and GPA forecast have changed over time once your institution connects your academic data.",
  },
};

// Static example rows just to illustrate the shape of the timeline.
// These are NOT real data — they're greyed out and clearly marked as an example.
const EXAMPLE_ENTRIES = [
  {
    id: "ex-1",
    period: "This term",
    label: "Latest forecast",
    trend: "steady",
  },
  {
    id: "ex-2",
    period: "Previous term",
    label: "Forecast snapshot",
    trend: "up",
  },
  {
    id: "ex-3",
    period: "Two terms ago",
    label: "Forecast snapshot",
    trend: "down",
  },
];

const trendIcon = {
  up: <TrendingUp size={16} />,
  down: <TrendingDown size={16} />,
  steady: <HistoryIcon size={16} />,
};

export default function HistoryView({ user, nextStep }) {
  const copy = copyByRole[user?.role] ?? copyByRole.student;

  return (
    <section className="workspace-section" id="history">
        <div className="section-heading">
          <div>
            <p className="dashboard-eyebrow">{copy.title}</p>
            <h2>No history yet</h2>
          </div>
          <span className="setup-badge">Setup required</span>
        </div>
        <p className="dashboard-subtext">{copy.body}</p>

        <div className="empty-state">
          <div className="empty-illustration">
            <HistoryIcon size={29} />
          </div>
          <div>
            <h3>Nothing to show yet.</h3>
            <p>
              {nextStep?.detail ||
                "History will appear here once academic data is connected."}{" "}
              Below is an example of how entries will look, for reference
              only.
            </p>
          </div>
        </div>

        <div className="history-example" aria-label="Example timeline layout">
          <p className="history-example-label">
            <Info size={14} /> Example layout — not real data
          </p>
          <ul className="history-timeline">
            {EXAMPLE_ENTRIES.map((entry) => (
              <li key={entry.id} className="history-timeline-item history-timeline-item--placeholder">
                <span className="history-timeline-icon">
                  {trendIcon[entry.trend]}
                </span>
                <div>
                  <strong>{entry.label}</strong>
                  <small>{entry.period}</small>
                </div>
                <span className="history-timeline-value">—</span>
              </li>
            ))}
          </ul>
        </div>
    </section>
  );
}
