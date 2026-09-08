import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ClipboardList, Save, UsersRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const statuses = [
  ["monitoring", "Monitoring"], ["outreach", "Reach out"], ["meeting", "Meeting planned"], ["plan_active", "Plan active"], ["resolved", "Resolved"],
];

const emptyPlan = { status: "monitoring", priority: "routine", sharedNextStep: "", privateNote: "", dueDate: "" };
const asDate = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";

export default function ProfessorSupportWorkflow() {
  const { apiFetch } = useAuth();
  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState({});
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(emptyPlan);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { let mounted = true; (async () => {
    try {
      const [studentResponse, planResponse] = await Promise.all([apiFetch("/api/professor/students"), apiFetch("/api/support-plans/professor")]);
      const studentData = await studentResponse.json().catch(() => ({}));
      const planData = await planResponse.json().catch(() => ({}));
      if (!studentResponse.ok) throw new Error(studentData.message || "Could not load students.");
      if (!planResponse.ok) throw new Error(planData.message || "Could not load support workflows.");
      if (!mounted) return;
      setStudents(studentData.students || []);
      setPlans(Object.fromEntries((planData.plans || []).map((plan) => [String(plan.studentId), plan])));
      if (studentData.students?.[0]) setSelectedId(String(studentData.students[0].student.id));
    } catch (requestError) { if (mounted) setError(requestError.message || "Could not load the support workflow."); }
    finally { if (mounted) setLoading(false); }
  })(); return () => { mounted = false; }; }, [apiFetch]);

  const selected = useMemo(() => students.find(({ student }) => String(student.id) === selectedId), [students, selectedId]);
  useEffect(() => {
    const plan = plans[selectedId];
    setDraft(plan ? { ...emptyPlan, ...plan, dueDate: asDate(plan.dueDate) } : emptyPlan);
    setMessage("");
  }, [selectedId, plans]);

  const save = async (event) => {
    event.preventDefault(); if (!selectedId) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await apiFetch(`/api/support-plans/professor/${selectedId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not save the workflow.");
      setPlans((current) => ({ ...current, [selectedId]: data.plan }));
      setMessage("Support workflow saved. The student can see only the shared next step.");
    } catch (requestError) { setError(requestError.message || "Could not save the workflow."); }
    finally { setSaving(false); }
  };

  if (loading) return <p className="connected-students-loading">Loading support workflow…</p>;
  if (error && !students.length) return <p className="connected-students-error" role="alert">{error}</p>;
  if (!students.length) return <div className="workflow-empty"><UsersRound size={22} /><div><strong>No students to triage yet</strong><p>Approve a student connection request first. Their shared academic context will then be available here.</p></div></div>;
  return <section className="support-workflow" aria-labelledby="support-workflow-title">
    <div className="support-workflow__intro"><span><ClipboardList size={19} /></span><div><p className="dashboard-eyebrow">Support workflow</p><h3 id="support-workflow-title">Triage, follow up, and keep students informed</h3></div></div>
    <div className="support-workflow__layout"><aside><p>Connected students</p>{students.map(({ student, forecast }) => <button type="button" onClick={() => setSelectedId(String(student.id))} className={selectedId === String(student.id) ? "is-selected" : ""} key={student.id}><span className="connection-avatar">{student.fullName.split(" ").map((name) => name[0]).slice(0, 2).join("")}</span><span><strong>{student.fullName}</strong><small>{forecast ? `${Math.round(forecast.dropoutProbability * 100)}% forecast signal` : "No forecast yet"}</small></span><i className={`workflow-priority workflow-priority--${plans[String(student.id)]?.priority || "routine"}`} /></button>)}</aside>
      <form onSubmit={save}><div className="workflow-student"><div><h4>{selected?.student.fullName}</h4><p>{selected?.student.institution}</p></div>{selected?.forecast && <span>{Math.round(selected.forecast.dropoutProbability * 100)}% estimated dropout probability</span>}</div><div className="workflow-fields"><label>Status<select value={draft.status} onChange={(e) => setDraft((current) => ({ ...current, status: e.target.value }))}>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Priority<select value={draft.priority} onChange={(e) => setDraft((current) => ({ ...current, priority: e.target.value }))}><option value="routine">Routine</option><option value="watch">Watch</option><option value="priority">Priority</option></select></label><label><CalendarDays size={14} /> Follow-up date<input type="date" value={draft.dueDate} onChange={(e) => setDraft((current) => ({ ...current, dueDate: e.target.value }))} /></label></div><label className="workflow-textarea">Shared next step <small>Visible to this student</small><textarea required maxLength="500" value={draft.sharedNextStep} onChange={(e) => setDraft((current) => ({ ...current, sharedNextStep: e.target.value }))} placeholder="For example: Let’s meet after your Tuesday class to discuss study support options." /></label><label className="workflow-textarea">Private note <small>Visible only to you</small><textarea maxLength="1000" value={draft.privateNote} onChange={(e) => setDraft((current) => ({ ...current, privateNote: e.target.value }))} placeholder="Context to guide your next conversation…" /></label>{error && <p className="connection-message connection-message--error" role="alert">{error}</p>}{message && <p className="connection-message connection-message--success" role="status">{message}</p>}<button className="dashboard-action" disabled={saving}><Save size={16} />{saving ? "Saving…" : "Save support workflow"}</button></form></div>
    <p className="support-workflow__notice"><CheckCircle2 size={16} /> Keep decisions human: this workflow organizes supportive follow-up; it does not determine academic outcomes.</p>
  </section>;
}
