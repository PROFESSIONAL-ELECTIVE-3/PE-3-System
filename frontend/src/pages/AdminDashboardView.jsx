import {
  BarChart3,
  ChevronRight,
  Database,
  FileUp,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export default function AdminDashboardView({ user, nextStep, activeTab }) {
  if (activeTab === "history") return null;

  if (activeTab === "data") {
    return (
      <section className="workspace-section" id="data">
        <div className="section-heading">
          <div>
            <p className="dashboard-eyebrow">Institutional data workspace</p>
            <h2>{nextStep.label}</h2>
          </div>
          <span className="setup-badge">Setup required</span>
        </div>
        <div className="empty-state">
          <div className="empty-illustration">
            <FileUp size={29} />
          </div>
          <div>
            <h3>No approved institutional data has been connected.</h3>
            <p>
              {nextStep.detail} Only authorized administrators can prepare and
              manage this workspace.
            </p>
            <button type="button" className="dashboard-action" disabled>
              {nextStep.action} <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (activeTab === "insights") {
    return (
      <section className="dashboard-guidance" id="insights">
        <ShieldCheck size={21} />
        <p>
          <strong>Use institutional insights responsibly.</strong> Review
          aggregate patterns and individual context before action. Forecasts
          are decision support, not automated decisions.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="dashboard-intro" id="overview">
        <p className="dashboard-eyebrow">
          {user.institution || "Your academic workspace"}
        </p>
        <h1>
          Welcome, {user?.fullName ? user.fullName.split(" ")[0] : "Administrator"}.
        </h1>
        <p>
          Prepare approved institutional data and oversee access to analytics.
          Institution-wide indicators will appear once a validated dataset is
          connected.
        </p>
      </section>

      <section className="dashboard-summary" aria-label="Institution workspace status">
        <article>
          <span className="summary-icon blue">
            <UsersRound size={19} />
          </span>
          <div>
            <strong>—</strong>
            <small>Students in scope</small>
          </div>
        </article>
        <article>
          <span className="summary-icon amber">
            <BarChart3 size={19} />
          </span>
          <div>
            <strong>—</strong>
            <small>Institutional signals</small>
          </div>
        </article>
        <article>
          <span className="summary-icon green">
            <Database size={19} />
          </span>
          <div>
            <strong>Not connected</strong>
            <small>Institutional data</small>
          </div>
        </article>
      </section>
    </>
  );
}
