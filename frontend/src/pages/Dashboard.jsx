import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Database,
  Filter,
  History as HistoryIcon,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import BrandLogo from "../components/BrandLogo";
import "../styles/Dashboard.css";

import AdminDashboardView from "./AdminDashboardView.jsx";
import HistoryView from "./HistoryView.jsx";
import StudentDataForm from "./StudentDataForm.jsx";
import ConnectionManager from "../components/ConnectionManager.jsx";
import StudentInsights from "./StudentInsights.jsx";

const NEXT_STEPS_BY_ROLE = {
  administrator: {
    label: "Prepare student data",
    detail: "Upload a validated institutional data file to begin creating an overview.",
    action: "Prepare data",
  },
  professor: {
    label: "Review student caseload",
    detail: "Automated alerts flag students at immediate risk of attrition or probation.",
    action: "Review alerts",
  },
  student: {
    label: "Review your academic record",
    detail: "Save your academic record, then run a personal forecast whenever you want to check your outlook.",
    action: "Save your record",
  },
};

const TAB_BY_PATH = {
  "/dashboard": "overview",
  "/dashboard/data": "data",
  "/dashboard/insights": "insights",
  "/dashboard/history": "history",
  "/dashboard/connections": "connections",
};

const INITIAL_COHORT = [
  {
    id: "STU-1029",
    name: "Alex Rivera",
    program: "BS Information Technology",
    yearLevel: "3rd Year",
    riskLevel: "high",
    riskScore: 84,
    primaryTrigger: "GPA dropped > 0.6 this term; 3 consecutive absences in Networking 2",
    currentGpa: 2.15,
    attendanceRate: 74,
    trajectory: [
      { term: "Y1-T1", gpa: 3.4, isProjected: false },
      { term: "Y1-T2", gpa: 3.2, isProjected: false },
      { term: "Y2-T1", gpa: 2.85, isProjected: false },
      { term: "Y2-T2", gpa: 2.6, isProjected: false },
      { term: "Y3-T1", gpa: 2.15, isProjected: false },
      { term: "Y3-T2 (Proj)", gpa: 1.85, isProjected: true },
    ],
  },
  {
    id: "STU-1044",
    name: "Bea Santos",
    program: "BS Computer Science",
    yearLevel: "2nd Year",
    riskLevel: "medium",
    riskScore: 58,
    primaryTrigger: "Midterm exam failure in Data Structures; missing lab submissions",
    currentGpa: 2.75,
    attendanceRate: 88,
    trajectory: [
      { term: "Y1-T1", gpa: 3.5, isProjected: false },
      { term: "Y1-T2", gpa: 3.3, isProjected: false },
      { term: "Y2-T1", gpa: 2.75, isProjected: false },
      { term: "Y2-T2 (Proj)", gpa: 2.65, isProjected: true },
    ],
  },
];

function DashboardNavLink({ tab, currentTab, children }) {
  const path = tab === "overview" ? "/dashboard" : `/dashboard/${tab}`;
  return (
    <NavLink
      to={path}
      end={tab === "overview"}
      className={({ isActive }) => (isActive ? "active" : "")}
      aria-current={currentTab === tab ? "page" : undefined}
    >
      {children}
    </NavLink>
  );
}

// Advisor Command Center Module
function AdvisorDashboardModule({ user, students }) {
  const [selectedStudent, setSelectedStudent] = useState(students[0] || null);
  const [filterRisk, setFilterRisk] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (students.length > 0 && (!selectedStudent || !students.some((s) => s.id === selectedStudent.id))) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  const filteredStudents = students.filter((stu) => {
    const matchesRisk = filterRisk === "all" || stu.riskLevel === filterRisk;
    const matchesSearch =
      stu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const highRiskCount = students.filter((s) => s.riskLevel === "high").length;
  const medRiskCount = students.filter((s) => s.riskLevel === "medium").length;
  const lowRiskCount = students.filter((s) => s.riskLevel === "low").length;

  return (
    <div className="advisor-dashboard">
      <section className="dashboard-intro">
        <p className="dashboard-eyebrow">{user.institution || "Advisory Caseload Workspace"}</p>
        <h1>Advisor Command Center</h1>
        <p>
          Monitor cohort risk levels, review automated attrition warnings, and inspect individual academic trajectory forecasts.
        </p>
      </section>

      <section className="advisor-summary-grid">
        <div className="summary-card">
          <div className="card-icon red">
            <AlertTriangle size={20} />
          </div>
          <div className="card-details">
            <span className="card-value">{highRiskCount}</span>
            <span className="card-label">High-Risk Critical Alerts</span>
            <small>Immediate intervention needed</small>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon amber">
            <TrendingDown size={20} />
          </div>
          <div className="card-details">
            <span className="card-value">{medRiskCount}</span>
            <span className="card-label">Moderate Warnings</span>
            <small>Requires academic check-in</small>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon green">
            <UserCheck size={20} />
          </div>
          <div className="card-details">
            <span className="card-value">{lowRiskCount}</span>
            <span className="card-label">On Track</span>
            <small>Satisfactory progress</small>
          </div>
        </div>
      </section>

      <div className="advisor-workspace-grid">
        <section className="caseload-panel">
          <div className="panel-header">
            <div>
              <h3>At-Risk Caseload Alerts</h3>
              <p>Automated signals derived from model predictions</p>
            </div>
          </div>

          <div className="caseload-controls">
            <div className="search-box">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search student or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-select">
              <Filter size={15} />
              <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
                <option value="all">All Tiers</option>
                <option value="high">Critical</option>
                <option value="medium">Moderate</option>
                <option value="low">On Track</option>
              </select>
            </div>
          </div>

          <div className="alert-list">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudent?.id === student.id;
              return (
                <article
                  key={student.id}
                  className={`alert-item ${student.riskLevel} ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="alert-item-header">
                    <div>
                      <strong>{student.name}</strong>
                      <span className="student-id-tag">{student.id}</span>
                    </div>
                    <span className={`risk-pill ${student.riskLevel}`}>
                      {student.riskScore}% Risk
                    </span>
                  </div>
                  <p className={`alert-trigger-text ${student.riskLevel === "low" ? "text-success" : ""}`}>
                    {student.riskLevel === "low" ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <AlertTriangle size={13} />
                    )}{" "}
                    {student.primaryTrigger}
                  </p>
                  <div className="alert-meta">
                    <span>GPA: <strong>{student.currentGpa.toFixed(2)}</strong></span>
                    <span>Attendance: <strong>{student.attendanceRate}%</strong></span>
                    <ChevronRight size={15} className="chevron" />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {selectedStudent && (
          <section className="trajectory-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Trajectory Graph</span>
                <h3>{selectedStudent.name} ({selectedStudent.id})</h3>
                <p>{selectedStudent.program} • {selectedStudent.yearLevel}</p>
              </div>
              <button type="button" className="action-button primary">
                Log Intervention
              </button>
            </div>

            <div className={`alert-banner ${selectedStudent.riskLevel === "low" ? "banner-safe" : ""}`}>
              <Sparkles size={16} />
              <div>
                {selectedStudent.riskLevel === "low" ? (
                  <><strong>Academic Stability:</strong> The student is performing consistently with an estimated <strong>{selectedStudent.riskScore}% attrition risk</strong>. Academic progress is satisfactory.</>
                ) : (
                  <><strong>Predictive Signal:</strong> At current trajectory, this student faces an <strong>{selectedStudent.riskScore}% likelihood of academic probation</strong> by next term.</>
                )}
              </div>
            </div>

            <div className="chart-container">
              <h4>Term GPA Trajectory vs. Retention Cutoff</h4>
              <p className="chart-subtext">
                Longitudinal grade point performance and projected trend.
              </p>

              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={selectedStudent.trajectory}
                    margin={{ top: 15, right: 25, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5eaf1" />
                    <XAxis dataKey="term" stroke="#718399" fontSize={12} />
                    <YAxis domain={[1.0, 4.0]} stroke="#718399" fontSize={12} />
                    <Tooltip
                      formatter={(value, name) => [value, name === "gpa" ? "Term GPA" : name]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #c6d6e5" }}
                    />
                    <ReferenceLine
                      y={2.0}
                      label={{ value: "Probation Limit (2.0)", fill: "#a63834", position: "insideTopRight", fontSize: 11 }}
                      stroke="#d55752"
                      strokeDasharray="4 4"
                    />
                    <Line
                      type="monotone"
                      dataKey="gpa"
                      stroke={selectedStudent.riskLevel === "high" ? "#d55752" : "#0c5bb4"}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: selectedStudent.riskLevel === "high" ? "#d55752" : "#0c5bb4" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="trajectory-metrics">
              <div className="metric-box">
                <small>Current Term GPA</small>
                <strong>{selectedStudent.currentGpa.toFixed(2)}</strong>
              </div>
              <div className="metric-box">
                <small>Class Attendance</small>
                <strong>{selectedStudent.attendanceRate}%</strong>
              </div>
              <div className="metric-box">
                <small>Calculated Attrition Risk</small>
                <strong className={selectedStudent.riskLevel === "high" ? "text-danger" : ""}>
                  {selectedStudent.riskScore} / 100
                </strong>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout, apiFetch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cohort, setCohort] = useState(INITIAL_COHORT);
  const [studentRecord, setStudentRecord] = useState(() => {
    try {
      const saved = localStorage.getItem("retainify_student_record");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const activeTab = TAB_BY_PATH[location.pathname] || "overview";
  const nextStep = NEXT_STEPS_BY_ROLE[user?.role] ?? NEXT_STEPS_BY_ROLE.student;
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User";

  const processAndStoreRecord = useCallback((record) => {
    if (!record || record.previousSemesterGrade === undefined || record.previousSemesterGrade === "") return;

    setStudentRecord(record);
    try {
      localStorage.setItem("retainify_student_record", JSON.stringify(record));
    } catch (e) {
      console.warn("Could not write to localStorage", e);
    }

    const scaleMax = Number(record.gradeMaximum) || 20;
    const rawGrade = Number(record.previousSemesterGrade) || 0;
    const normalizedGpa = Number(((rawGrade / scaleMax) * 4.0).toFixed(2));

    const unitsEnrolled = Number(record.previousSemesterUnitsEnrolled) || 1;
    const unitsApproved = Number(record.previousSemesterUnitsApproved) || 0;
    const passRate = unitsApproved / unitsEnrolled;

    const isLowGpa = normalizedGpa < 2.0;
    const isMediumRisk = normalizedGpa >= 2.0 && normalizedGpa < 2.8;

    let riskLevel = "low";
    let riskScore = 15;
    let trigger = "Academic record satisfactory; student is not at risk";

    if (isLowGpa || passRate < 0.6) {
      riskLevel = "high";
      riskScore = 88;
      trigger = `Critical: GPA ${normalizedGpa.toFixed(2)} is below 2.0 probation threshold`;
    } else if (isMediumRisk || passRate < 0.85) {
      riskLevel = "medium";
      riskScore = 55;
      trigger = `Moderate: Passing, but unit completion rate is ${(passRate * 100).toFixed(0)}%`;
    }

    const updatedStudentEntry = {
      id: user?._id || "STU-CURRENT",
      name: user?.fullName || "Current Student",
      program: user?.program || "BS Information Technology",
      yearLevel: "Current Term",
      riskLevel,
      riskScore,
      primaryTrigger: trigger,
      currentGpa: normalizedGpa,
      attendanceRate: record.attendance === "day" ? 94 : 85,
      trajectory: [
        { term: "Prev-1", gpa: Math.min(4.0, Number((normalizedGpa + 0.25).toFixed(2))), isProjected: false },
        { term: "Current Term", gpa: normalizedGpa, isProjected: false },
        { term: "Next (Proj)", gpa: Math.max(1.0, Number((normalizedGpa + (riskLevel === "high" ? -0.3 : 0.15)).toFixed(2))), isProjected: true },
      ],
    };

    setCohort((prevCohort) => {
      const idx = prevCohort.findIndex((s) => s.id === updatedStudentEntry.id);
      if (idx >= 0) {
        const next = [...prevCohort];
        next[idx] = updatedStudentEntry;
        return next;
      }
      return [updatedStudentEntry, ...prevCohort];
    });
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!apiFetch) return;
        const res = await apiFetch("/api/students/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.record) {
            processAndStoreRecord(data.record);
          }
        }
      } catch (err) {
        console.warn("Could not fetch user record on Dashboard mount", err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [apiFetch, processAndStoreRecord]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((name) => name[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Student";
  const hasConnectionAccess = user?.role === "student" || user?.role === "professor";

  const currentStudentGpa =
    studentRecord && studentRecord.previousSemesterGrade !== "" && studentRecord.previousSemesterGrade !== undefined
      ? (
          (Number(studentRecord.previousSemesterGrade) / (Number(studentRecord.gradeMaximum) || 20)) *
          4.0
        ).toFixed(2)
      : null;

  const isAtRisk = currentStudentGpa !== null && Number(currentStudentGpa) < 2.0;

  // Trajectory series generated for the student
  const studentTrajectoryData = currentStudentGpa !== null ? [
    { term: "Term Y1", gpa: Math.min(4.0, Number((Number(currentStudentGpa) + 0.35).toFixed(2))) },
    { term: "Term Y2", gpa: Math.min(4.0, Number((Number(currentStudentGpa) + 0.15).toFixed(2))) },
    { term: "Current Term", gpa: Number(currentStudentGpa) },
    {
      term: "Next Term (Proj)",
      gpa: Math.max(1.0, Number((Number(currentStudentGpa) + (isAtRisk ? -0.35 : 0.2)).toFixed(2))),
    },
  ] : [];

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <BrandLogo className="app-brand" inverse to="/dashboard" />
        <nav aria-label="Dashboard navigation">
          <DashboardNavLink tab="overview" currentTab={activeTab}>
            <LayoutDashboard size={18} /> Overview
          </DashboardNavLink>
          <DashboardNavLink tab="data" currentTab={activeTab}>
            <Database size={18} /> Data Workspace
          </DashboardNavLink>
          <DashboardNavLink tab="insights" currentTab={activeTab}>
            <BarChart3 size={18} /> Insights
          </DashboardNavLink>
          {hasConnectionAccess && (
            <DashboardNavLink tab="connections" currentTab={activeTab}>
              <UsersRound size={18} /> {user.role === "student" ? "My Professor" : "Students"}
            </DashboardNavLink>
          )}
          <DashboardNavLink tab="history" currentTab={activeTab}>
            <HistoryIcon size={18} /> History
          </DashboardNavLink>
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
            <span className="user-initials">{userInitials}</span>
            <div>
              <strong>{user?.fullName || "User"}</strong>
              <small>{roleLabel}</small>
            </div>
            <button type="button" onClick={handleLogout} aria-label="Log out">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <nav className="mobile-dashboard-nav" aria-label="Mobile navigation">
          <DashboardNavLink tab="overview" currentTab={activeTab}>Overview</DashboardNavLink>
          <DashboardNavLink tab="data" currentTab={activeTab}>Data</DashboardNavLink>
          <DashboardNavLink tab="insights" currentTab={activeTab}>Insights</DashboardNavLink>
          {hasConnectionAccess && (
            <DashboardNavLink tab="connections" currentTab={activeTab}>
              {user.role === "student" ? "Professor" : "Students"}
            </DashboardNavLink>
          )}
          <DashboardNavLink tab="history" currentTab={activeTab}>History</DashboardNavLink>
        </nav>

        {(user?.role === "professor" || user?.role === "advisor") && activeTab === "overview" && (
          <AdvisorDashboardModule user={user} students={cohort} />
        )}

        {user?.role === "administrator" && activeTab === "overview" && (
          <AdminDashboardView user={user} nextStep={nextStep} activeTab={activeTab} />
        )}

        {user?.role === "student" && activeTab === "overview" && (
          <>
            <section className="dashboard-intro" id="overview">
              <p className="dashboard-eyebrow">
                {user.institution || "Your academic workspace"}
              </p>
              <h1>Good to see you, {firstName}.</h1>
              <p>
                Save your academic record, run a forecast when you are ready, and
                revisit your History to track changes over time.
              </p>
            </section>

            {/* Visual KPI Summaries */}
            <section className="dashboard-summary" aria-label="Advisor module objectives">
              <article>
                <span className={`summary-icon ${isAtRisk ? "amber" : "green"}`}>
                  <AlertTriangle size={19} />
                </span>
                <div>
                  <strong>
                    {currentStudentGpa !== null
                      ? isAtRisk
                        ? "At-Risk Alert"
                        : "Not At Risk"
                      : "No Record Yet"}
                  </strong>
                  <small>
                    {currentStudentGpa !== null
                      ? isAtRisk
                        ? "Low GPA detected (< 2.0 probation line)"
                        : "Academic standing is satisfactory"
                      : "Go to Data Workspace to submit your grades"}
                  </small>
                </div>
              </article>

              <article>
                <span className="summary-icon blue">
                  <BarChart3 size={19} />
                </span>
                <div>
                  <strong>
                    {currentStudentGpa !== null ? `${currentStudentGpa} / 4.00` : "GPA Not Set"}
                  </strong>
                  <small>
                    {currentStudentGpa !== null
                      ? "Normalized cumulative GPA"
                      : "Awaiting your semester input"}
                  </small>
                </div>
              </article>

              <article>
                <span className="summary-icon green">
                  <TrendingUp size={19} />
                </span>
                <div>
                  <strong>
                    {studentRecord && studentRecord.previousSemesterUnitsApproved !== undefined
                      ? `${studentRecord.previousSemesterUnitsApproved} of ${studentRecord.previousSemesterUnitsEnrolled} Units`
                      : "Units Incomplete"}
                  </strong>
                  <small>
                    {studentRecord && studentRecord.previousSemesterUnitsApproved !== undefined
                      ? "Approved course completion"
                      : "Trajectory calculated upon entry"}
                  </small>
                </div>
              </article>
            </section>

            {/* Individual Student Trajectory Graph Workspace */}
            <section className="workspace-section" style={{ marginTop: "1.4rem" }}>
              <div className="section-heading">
                <div>
                  <p className="dashboard-eyebrow">Predictive Outlook</p>
                  <h2>Your Academic Trajectory Graph</h2>
                </div>
              </div>

              {currentStudentGpa !== null ? (
                <div style={{ marginTop: "1.2rem" }}>
                  <div className={`alert-banner ${!isAtRisk ? "banner-safe" : ""}`}>
                    <Sparkles size={16} />
                    <div>
                      {isAtRisk ? (
                        <>
                          <strong>Warning:</strong> Your normalized GPA ({currentStudentGpa}) has fallen below the 2.0 institutional threshold. Review your support plan or contact your advisor.
                        </>
                      ) : (
                        <>
                          <strong>On Track:</strong> Your current academic trajectory indicates stable progress toward graduation requirements with minimal risk.
                        </>
                      )}
                    </div>
                  </div>

                  <div className="chart-container" style={{ marginTop: "1rem" }}>
                    <h4>Cumulative GPA Trajectory vs. 2.0 Probation Cutoff</h4>
                    <p className="chart-subtext">
                      Track historical performance, current term GPA, and projected completion trajectory.
                    </p>

                    <div style={{ width: "100%", height: 260 }}>
                      <ResponsiveContainer>
                        <LineChart
                          data={studentTrajectoryData}
                          margin={{ top: 15, right: 25, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5eaf1" />
                          <XAxis dataKey="term" stroke="#718399" fontSize={12} />
                          <YAxis domain={[1.0, 4.0]} stroke="#718399" fontSize={12} />
                          <Tooltip
                            formatter={(value) => [value, "Term GPA"]}
                            contentStyle={{ borderRadius: "8px", border: "1px solid #c6d6e5" }}
                          />
                          <ReferenceLine
                            y={2.0}
                            label={{
                              value: "Probation Line (2.0)",
                              fill: "#a63834",
                              position: "insideTopRight",
                              fontSize: 11,
                            }}
                            stroke="#d55752"
                            strokeDasharray="4 4"
                          />
                          <Line
                            type="monotone"
                            dataKey="gpa"
                            stroke={isAtRisk ? "#d55752" : "#0c5bb4"}
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: isAtRisk ? "#d55752" : "#0c5bb4" }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ minHeight: "180px" }}>
                  <div className="empty-illustration">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3>No Trajectory Available Yet</h3>
                    <p>
                      Enter your latest term grades and completed credit units in the Data Workspace to plot your historical trajectory and predictive forecast.
                    </p>
                    <NavLink to="/dashboard/data" className="dashboard-action">
                      Enter Academic Record
                    </NavLink>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {user?.role === "student" && activeTab === "data" && (
          <section className="workspace-section" id="data">
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
            <StudentDataForm onSaveRecord={processAndStoreRecord} />
          </section>
        )}

        {hasConnectionAccess && activeTab === "connections" && (
          <section className="workspace-section" id="connections">
            <div className="section-heading">
              <div>
                <p className="dashboard-eyebrow">Academic support</p>
                <h2>
                  {user.role === "student" ? "My professor connections" : "Manage student connections"}
                </h2>
              </div>
            </div>
            <ConnectionManager />
          </section>
        )}

        {user?.role === "student" && activeTab === "insights" && <StudentInsights />}

        {activeTab === "history" && (
          <HistoryView user={user} nextStep={nextStep} />
        )}
      </main>
    </div>
  );
}