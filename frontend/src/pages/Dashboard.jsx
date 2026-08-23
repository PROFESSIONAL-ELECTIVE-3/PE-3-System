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
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";
import "../styles/Dashboard.css";

import ProfessorDashboardView from "./ProfessorDashboardView.jsx";
import AdminDashboardView from "./AdminDashboardView.jsx";
import HistoryView from "./HistoryView.jsx";

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
    label: "Review your academic record",
    detail:
      "Your personal outlook will appear after your institution connects approved data. You can view your own record, but only authorized staff can manage institutional data.",
    action: "No action required",
  },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tabByPath = {
    "/dashboard": "overview",
    "/dashboard/data": "data",
    "/dashboard/insights": "insights",
    "/dashboard/history": "history",
  };
  const activeTab = tabByPath[location.pathname] || "overview";
  const nextStep = nextStepByRole[user.role] ?? nextStepByRole.student;
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  const DashboardNavLink = ({ tab, children }) => {
    const path = tab === "overview" ? "/dashboard" : `/dashboard/${tab}`;
    return (
      <NavLink to={path} end={tab === "overview"} className={({ isActive }) => (isActive ? "active" : "")} aria-current={activeTab === tab ? "page" : undefined}>
        {children}
      </NavLink>
    );
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <BrandLogo className="app-brand" inverse to="/dashboard" />
        <nav aria-label="Dashboard navigation">
          <DashboardNavLink tab="overview">
            <LayoutDashboard size={18} /> Overview
          </DashboardNavLink>
          <DashboardNavLink tab="data">
            <Database size={18} /> Data Workspace
          </DashboardNavLink>
          <DashboardNavLink tab="insights">
            <BarChart3 size={18} /> Insights
          </DashboardNavLink>
          {(
            <DashboardNavLink tab="history">
              <TimelineIcon size={18} /> History
            </DashboardNavLink>
          )}
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
      <main className="app-main">
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
        <nav className="mobile-dashboard-nav" aria-label="Dashboard navigation">
          <DashboardNavLink tab="overview">Overview</DashboardNavLink>
          <DashboardNavLink tab="data">Data</DashboardNavLink>
          <DashboardNavLink tab="insights">Insights</DashboardNavLink>
          <DashboardNavLink tab="history">History</DashboardNavLink>
        </nav>

        {user.role === "professor" && <ProfessorDashboardView user={user} nextStep={nextStep} activeTab={activeTab} />}
        {user.role === "administrator" && <AdminDashboardView user={user} nextStep={nextStep} activeTab={activeTab} />}
        
        {user.role === "student" && activeTab === "overview" && <>
        <section className="dashboard-intro" id="overview">
          <p className="dashboard-eyebrow">
            {user.institution || "Your academic workspace"}
          </p>
          <h1>Good to see you, {user.fullName.split(" ")[0]}.</h1>
          <p>
            Your personal academic outlook will appear here once your
            institution connects approved data. Your dashboard only shows your
            own record and support information.
          </p>
        </section>
        <section className="dashboard-summary" aria-label="Workspace status">
          <article>
            <span className="summary-icon blue">
              <UsersRound size={19} />
            </span>
            <div>
              <strong>—</strong>
              <small>Your enrolled courses</small>
            </div>
          </article>
          <article>
            <span className="summary-icon amber">
              <BarChart3 size={19} />
            </span>
            <div>
              <strong>—</strong>
              <small>Your support signals</small>
            </div>
          </article>
          <article>
            <span className="summary-icon green">
              <Database size={19} />
            </span>
            <div>
              <strong>Not connected</strong>
              <small>Academic record</small>
            </div>
          </article>
        </section>
        </>}
        {user.role === "student" && activeTab === "data" && <section className="workspace-section" id="data">
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
        </section>}
        {user.role === "student" && activeTab === "insights" && <section className="dashboard-guidance" id="insights">
          <ShieldCheck size={21} />
          <p>
            <strong>Your forecast is a guide, not a judgment.</strong> Use it
            to start a conversation with your professor or adviser and to find
            support early when you need it.
          </p>
        </section>}
        {user.role === "student" && activeTab === "history" && <HistoryView user={user} nextStep={nextStep} />}
        {user.role === "professor" && activeTab === "history" && <HistoryView user={user} nextStep={nextStep} />}
        {user.role === "administrator" && activeTab === "history" && <HistoryView user={user} nextStep={nextStep} />}
      </main>
    </div>
  );
}
