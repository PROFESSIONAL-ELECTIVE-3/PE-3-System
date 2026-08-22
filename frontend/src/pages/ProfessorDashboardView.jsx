import {
  BarChart3,
  ChevronRight,
  Database,
  FileUp,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  TimelineIcon,
  UsersRound,
} from "lucide-react";

export default function ProfessorDashboardView({ user, nextStep }) {
  return (
    <>
        <section className="dashboard-intro">
            <p className="dashboard-eyebrow">
                {user.institution || "Your academic workspace"}
            </p>
            <h1>Good to see you, Professor {user?.fullName ? user.fullName.split(" ")[0] : "Professor"}.</h1>
            <p>
                Start by preparing your approved data. When it’s ready, you’ll see a
                clear view of academic trends and students who may benefit from
                support.
            </p>
        </section>

        <section className="dashboard-summary" aria-label="Workspace status">
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
              <small>Signals to review</small>
            </div>
          </article>
          <article>
            <span className="summary-icon green">
              <Database size={19} />
            </span>
            <div>
              <strong>Not connected</strong>
              <small>Data workspace</small>
            </div>
          </article>
        </section>
    
        <section className="workspace-section" id="data">
            <div className="section-heading">
            <div>
                <p className="dashboard-eyebrow">Your next step</p>
                <h2>{nextStep.label}</h2>
            </div>
            <span className="setup-badge">Setup required</span>
            </div>
            <div className="empty-state">
            <div className="empty-illustration">
                <FileUp size={29} />
            </div>
            <div>
                <h3>There’s no academic data here yet.</h3>
                <p>
                {nextStep.detail} The workspace will only show records you are
                authorized to view.
                </p>
                <button type="button" className="dashboard-action" disabled>
                {nextStep.action} <ChevronRight size={17} />
                </button>
            </div>
            </div>
        </section>

        <section className="dashboard-guidance" id="insights">
          <ShieldCheck size={21} />
          <p>
            <strong>Keep the human in the loop.</strong> Risk scores and
            forecasts are decision-support tools. Use them with student context,
            professional judgment, and appropriate support processes.
          </p>
        </section>
    </>
  );
}