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
import StudentDataForm from "./StudentDataForm.jsx";
import ConnectionManager from "../components/ConnectionManager.jsx";
import StudentInsights from "./StudentInsights.jsx";

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
      "Save your academic record, then run a personal forecast whenever you want to check your outlook.",
    action: "Save your record",
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
    "/dashboard/connections": "connections",
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
          {(user.role === "student" || user.role === "professor") && <DashboardNavLink tab="connections">
            <UsersRound size={18} /> {user.role === "student" ? "My Professor" : "Students"}
          </DashboardNavLink>}
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
          {(user.role === "student" || user.role === "professor") && <DashboardNavLink tab="connections">{user.role === "student" ? "Professor" : "Students"}</DashboardNavLink>}
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
            Save your academic record, run a forecast when you are ready, and
            revisit your History to track changes over time. Your dashboard
            only shows your own record and support information.
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
              <strong>Ready</strong>
              <small>Academic record workspace</small>
            </div>
          </article>
        </section>
        </>}
        {user.role === "student" && activeTab === "data" && <section className="workspace-section" id="data">
          <div className="section-heading">
            <div>
              <p className="dashboard-eyebrow">Your data</p>
              <h2>Tell us about your term</h2>
            </div>
          </div>
          <p className="dashboard-subtext">
           This information is used to generate your personal risk forecast.
           Only you and authorized staff at your institution can see it.
          </p>
           <StudentDataForm />
        </section>}
        {(user.role === "student" || user.role === "professor") && activeTab === "connections" && <section className="workspace-section" id="connections">
          <div className="section-heading">
            <div>
              <p className="dashboard-eyebrow">Academic support</p>
              <h2>{user.role === "student" ? "My professor connections" : "Manage student connections"}</h2>
            </div>
          </div>
          <ConnectionManager />
        </section>}
        {user.role === "student" && activeTab === "insights" && <StudentInsights />}
        {user.role === "student" && activeTab === "history" && <HistoryView user={user} nextStep={nextStep} />}
        {user.role === "professor" && activeTab === "history" && <HistoryView user={user} nextStep={nextStep} />}
        {user.role === "administrator" && activeTab === "history" && <HistoryView user={user} nextStep={nextStep} />}
      </main>
    </div>
  );
}
