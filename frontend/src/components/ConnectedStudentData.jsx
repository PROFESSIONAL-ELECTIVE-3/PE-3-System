import { useEffect, useState } from "react";
import { BookOpen, Database, GraduationCap, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const yesNo = (value) => value ? "Yes" : "No";

export default function ConnectedStudentData() {
  const { apiFetch } = useAuth();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await apiFetch("/api/connections/students");
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Could not load connected student data.");
        if (isMounted) setStudents(data.students || []);
      } catch (requestError) {
        if (isMounted) setError(requestError.message || "Could not load connected student data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [apiFetch]);

  if (isLoading) return <p className="connected-students-loading">Loading connected student data…</p>;
  if (error) return <p className="connected-students-error" role="alert">{error}</p>;

  return (
    <section className="connected-students" aria-labelledby="connected-students-title">
      <div className="connected-students__heading">
        <div className="connected-students__icon" aria-hidden="true"><Database size={19} /></div>
        <div><p className="dashboard-eyebrow">Connected students</p><h3 id="connected-students-title">Student data shared with you</h3></div>
        <span>{students.length} connected</span>
      </div>
      <p className="connected-students__description">Only students who approved a connection with you appear here. Their information is read-only and should be used to provide academic support.</p>
      {students.length === 0 ? <div className="connected-students-empty"><UserRound size={20} /><p>No connected students yet. Approve requests in the Students tab to view shared records here.</p></div> : <div className="connected-students-list">
        {students.map(({ connectionId, student, record }) => <article key={connectionId} className="connected-student-card">
          <header><span className="connection-avatar" aria-hidden="true">{student.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><h4>{student.fullName}</h4><p>{student.institution}</p></div></header>
          {!record ? <div className="connected-student-card__empty"><BookOpen size={18} /><p>This student has not submitted their academic information yet.</p></div> : <><div className="connected-student-card__summary"><div><span>Attendance</span><strong>{record.attendance === "day" ? "Day" : "Night"}</strong></div><div><span>Previous-semester grade</span><strong>{record.previousSemesterGrade} / 20</strong></div><div><span>Approved units</span><strong>{record.previousSemesterUnitsApproved}</strong></div></div><details className="connected-student-card__details"><summary><GraduationCap size={15} /> View additional context</summary><div><p><span>Educational special needs</span><strong>{yesNo(record.educationalSpecialNeeds)}</strong></p><p><span>Tuition-fee status</span><strong>{yesNo(record.tuitionFeeStatus)}</strong></p><p><span>Scholarship status</span><strong>{yesNo(record.scholarshipStatus)}</strong></p></div></details></>}
        </article>)}
      </div>}
    </section>
  );
}
