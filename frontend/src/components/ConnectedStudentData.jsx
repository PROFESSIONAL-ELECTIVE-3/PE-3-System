import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const yesNo = (value) => value ? "Yes" : "No";

export default function ConnectedStudentData() {
  const { apiFetch } = useAuth();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await apiFetch("/api/professor/students");
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Could not load connected student data.");
        if (active) setStudents(data.students || []);
      } catch (requestError) {
        if (active) setError(requestError.message || "Could not load connected student data.");
      } finally { if (active) setIsLoading(false); }
    })();
    return () => { active = false; };
  }, [apiFetch]);

  if (isLoading) return <p className="connected-students-loading">Loading connected student data…</p>;
  if (error) return <p className="connected-students-error" role="alert">{error}</p>;
  return <section className="connected-students" aria-labelledby="connected-students-title">
    <div className="connected-students__heading"><div className="connected-students__icon" aria-hidden="true"><GraduationCap size={19} /></div><div><p className="dashboard-eyebrow">Connected students</p><h3 id="connected-students-title">Student context and forecasts</h3></div><span>{students.length} connected</span></div>
    <p className="connected-students__description">Records and forecasts are read-only decision support. Review the full context with the student; do not use this information for automated academic decisions.</p>
    {students.length === 0 ? <div className="connected-students-empty"><BookOpen size={20} /><p>No connected students yet. Approve requests in the Students tab to view shared records here.</p></div> : <div className="connected-students-list">{students.map(({ student, record, forecast }) => <article key={student.id} className="connected-student-card"><header><span className="connection-avatar" aria-hidden="true">{student.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><h4>{student.fullName}</h4><p>{student.institution}</p></div></header>
      {!record ? <div className="connected-student-card__empty"><BookOpen size={18} /><p>This student has not submitted academic information yet.</p></div> : <><div className="connected-student-card__summary"><div><span>Schedule</span><strong>{record.attendance === "day" ? "Day" : "Night"}</strong></div><div><span>Prior grade</span><strong>{record.previousSemesterGrade} / {record.gradeMaximum}</strong></div><div><span>Units</span><strong>{record.previousSemesterUnitsApproved} / {record.previousSemesterUnitsEnrolled}</strong></div></div><details className="connected-student-card__details"><summary><ShieldCheck size={15} /> View shared context</summary><div><p><span>Educational support needs</span><strong>{yesNo(record.educationalSpecialNeeds)}</strong></p><p><span>Tuition-fee status</span><strong>{yesNo(record.tuitionFeeStatus)}</strong></p><p><span>Scholarship status</span><strong>{yesNo(record.scholarshipStatus)}</strong></p></div></details></>}
      <section className="professor-forecast"><div><ShieldCheck size={17} /><h5>Latest forecast summary</h5></div>{forecast ? <p><strong>{forecast.predictedNextSemesterGrade} / {forecast.gradeMaximum}</strong> predicted grade · <strong>{Math.round(forecast.dropoutProbability * 100)}%</strong> estimated dropout probability</p> : <p>No student-run forecast is available.</p>}<small>Use this only to start a supportive conversation, not as a verdict.</small></section>
    </article>)}</div>}
  </section>;
}
