import { BarChart3, ChevronRight, Database, FileUp, ShieldCheck, UsersRound } from "lucide-react";

export default function ProfessorDashboardView({ user, nextStep, activeTab }) {
  if (activeTab === "history") return null;

  if (activeTab === "data") {
    return <section className="workspace-section" id="data"><div className="section-heading"><div><p className="dashboard-eyebrow">Class access</p><h2>{nextStep.label}</h2></div><span className="setup-badge">Setup required</span></div><div className="empty-state"><div className="empty-illustration"><FileUp size={29} /></div><div><h3>Your assigned classes are not connected yet.</h3><p>{nextStep.detail} Administrators manage institutional data; you will only see students and classes assigned to you.</p><button type="button" className="dashboard-action" disabled>{nextStep.action} <ChevronRight size={17} /></button></div></div></section>;
  }

  if (activeTab === "insights") {
    return <section className="dashboard-guidance" id="insights"><ShieldCheck size={21} /><p><strong>Use class insights to support, not label, students.</strong> Review course context, attendance, and recent work before responding to a risk signal or forecast.</p></section>;
  }

  return <><section className="dashboard-intro" id="overview"><p className="dashboard-eyebrow">{user.institution || "Your academic workspace"}</p><h1>Welcome, Professor {user?.fullName ? user.fullName.split(" ")[0] : ""}.</h1><p>Monitor the learners and courses assigned to you. Class-level trends and support signals will appear once your institution connects approved academic data.</p></section><section className="dashboard-summary" aria-label="Class workspace status"><article><span className="summary-icon blue"><UsersRound size={19} /></span><div><strong>—</strong><small>Students assigned</small></div></article><article><span className="summary-icon amber"><BarChart3 size={19} /></span><div><strong>—</strong><small>Signals to review</small></div></article><article><span className="summary-icon green"><Database size={19} /></span><div><strong>Not connected</strong><small>Class data access</small></div></article></section></>;
}
