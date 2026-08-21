import {
  BarChart3,
  ChevronRight,
  Database,
  FileUp,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";
import "../styles/Dashboard.css";

const nextStepByRole = {
  administrator: {
    label: "Prepare student data",
    detail:
      "Upload a validated institutional data file to begin creating an overview.",
    action: "Prepare data",
  },
  professor: {
    label: "Await class access",
    detail:
      "Your assigned classes and students will appear when your institution connects data.",
    action: "View access status",
  },
  student: {
    label: "Await your academic record",
    detail:
      "Your personal outlook will be available after your institution connects approved data.",
    action: "Learn about forecasts",
  },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nextStep = nextStepByRole[user.role] ?? nextStepByRole.student;
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <BrandLogo className="app-brand" inverse to="/dashboard" />
        <nav aria-label="Dashboard navigation">
          <a className="active" href="#overview">
            <LayoutDashboard size={18} /> Overview
          </a>
          <a href="#data">
            <Database size={18} /> Data workspace
          </a>
          <a href="#insights">
            <BarChart3 size={18} /> Insights
          </a>
        </nav>
        <div className="sidebar-support">
          <ShieldCheck size={18} />
          <p>
            <strong>Responsible use</strong>
            <br />
            Always review context before acting on a signal.
          </p>
        </div>
      </aside>
      <main className="app-main" id="overview">
        <header className="app-topbar">
          <BrandLogo className="mobile-brand" to="/dashboard" />
          <div className="account-menu">
            <span className="user-initials">
              {user.fullName
                .split(" ")
                .map((name) => name[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <strong>{user.fullName}</strong>
              <small>{roleLabel}</small>
            </div>
            <button type="button" onClick={handleLogout} aria-label="Log out">
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <section className="dashboard-intro">
          <p className="dashboard-eyebrow">
            {user.institution || "Your academic workspace"}
          </p>
          <h1>Good to see you, {user.fullName.split(" ")[0]}.</h1>
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
              <small>
                Data import is being prepared for this version of EduForecaster.
              </small>
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
      </main>
    </div>
  );
}
