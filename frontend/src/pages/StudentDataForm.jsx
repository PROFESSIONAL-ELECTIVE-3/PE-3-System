import { useEffect, useState } from "react";
import { CheckCircle2, CircleHelp, GraduationCap, Landmark, Pencil, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/StudentDataForm.css";

const EMPTY_FORM = {
  educationalSpecialNeeds: "",
  tuitionFeesUpToDate: "",
  scholarshipHolder: "",
  course: "",
  attendance: "",
  firstSemesterGrade: "",
  secondSemesterGrade: "",
};

const boolToString = (value) =>
  value === true ? "yes" : value === false ? "no" : "";

const recordToForm = (record) => ({
  educationalSpecialNeeds: boolToString(record.educationalSpecialNeeds),
  tuitionFeesUpToDate: boolToString(record.tuitionFeesUpToDate),
  scholarshipHolder: boolToString(record.scholarshipHolder),
  course: record.course || "",
  attendance: record.attendance || "",
  firstSemesterGrade: record.firstSemesterGrade ?? "",
  secondSemesterGrade: record.secondSemesterGrade ?? "",
});

const yesNoLabel = (value) => value ? "Yes" : "No";

export default function StudentDataForm() {
  const { apiFetch } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [savedRecord, setSavedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await apiFetch("/api/students/me");
        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Your student data could not be loaded. Please refresh the page and try again."
              : "Could not load your data.",
          );
        }
        const data = await response.json();
        if (isMounted && data.record) {
          setFormData(recordToForm(data.record));
          setSavedRecord(data.record);
          setIsEditing(false);
          setSavedAt(data.record.updatedAt || data.record.submittedAt || null);
        }
      } catch (error) {
        // No record yet leaves the form blank. Other failures are shown without
        // logging the user out of the dashboard.
        if (isMounted) setServerError(error.message || "Could not load your data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [apiFetch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (formData.educationalSpecialNeeds === "")
      next.educationalSpecialNeeds = "Select an option.";
    if (formData.tuitionFeesUpToDate === "")
      next.tuitionFeesUpToDate = "Select an option.";
    if (formData.scholarshipHolder === "")
      next.scholarshipHolder = "Select an option.";
    if (!formData.course.trim()) next.course = "Course is required.";
    if (!formData.attendance) next.attendance = "Select daytime or evening.";

    const grade1 = Number(formData.firstSemesterGrade);
    if (formData.firstSemesterGrade === "" || Number.isNaN(grade1) || grade1 < 0 || grade1 > 20)
      next.firstSemesterGrade = "Enter a grade between 0 and 20.";

    const grade2 = Number(formData.secondSemesterGrade);
    if (formData.secondSemesterGrade === "" || Number.isNaN(grade2) || grade2 < 0 || grade2 > 20)
      next.secondSemesterGrade = "Enter a grade between 0 and 20.";

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSavedAt(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch("/api/students/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          educationalSpecialNeeds: formData.educationalSpecialNeeds === "yes",
          tuitionFeesUpToDate: formData.tuitionFeesUpToDate === "yes",
          scholarshipHolder: formData.scholarshipHolder === "yes",
          course: formData.course.trim(),
          attendance: formData.attendance,
          firstSemesterGrade: Number(formData.firstSemesterGrade),
          secondSemesterGrade: Number(formData.secondSemesterGrade),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message || "Could not save your information.");
      }

      const record = data.record || { ...formData };
      setSavedRecord(record);
      setFormData(recordToForm(record));
      setSavedAt(record.updatedAt || new Date().toISOString());
      setIsEditing(false);
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const YesNoField = ({ name, label, hint }) => (
    <div className="form-group">
      <label>{label}</label>
      {hint && <p className="student-data-hint">{hint}</p>}
      <div className="yes-no-toggle" role="radiogroup" aria-label={label}>
        {["yes", "no"].map((option) => (
          <button
            type="button"
            key={option}
            className={`yes-no-option ${formData[name] === option ? "selected" : ""}`}
            onClick={() =>
              handleChange({ target: { name, value: option } })
            }
            aria-pressed={formData[name] === option}
          >
            {option === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  if (isLoading) {
    return <p className="student-data-loading">Loading your information…</p>;
  }

  if (savedRecord && !isEditing) {
    const lastUpdatedAt = savedAt || savedRecord.updatedAt || savedRecord.submittedAt;
    const lastUpdated = lastUpdatedAt && new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(lastUpdatedAt));

    return (
      <section className="student-data-summary" aria-labelledby="student-data-summary-title">
        <div className="student-data-summary__header">
          <div>
            <p className="dashboard-eyebrow">Your saved record</p>
            <h3 id="student-data-summary-title">Academic information saved</h3>
            <p>{lastUpdated ? `Last updated ${lastUpdated}` : "Your information is up to date."}</p>
          </div>
          <button type="button" className="student-data-edit" onClick={() => { setIsEditing(true); setSavedAt(null); setServerError(""); }}>
            <Pencil size={15} /> Edit information
          </button>
        </div>
        <div className="student-data-summary__grid">
          <div><span>Course</span><strong>{savedRecord.course}</strong></div>
          <div><span>Attendance</span><strong>{savedRecord.attendance === "daytime" ? "Daytime" : "Evening"}</strong></div>
          <div><span>1st semester grade</span><strong>{savedRecord.firstSemesterGrade} / 20</strong></div>
          <div><span>2nd semester grade</span><strong>{savedRecord.secondSemesterGrade} / 20</strong></div>
        </div>
        <div className="student-data-summary__details">
          <p><span>Educational special needs</span><strong>{yesNoLabel(savedRecord.educationalSpecialNeeds)}</strong></p>
          <p><span>Tuition fees up to date</span><strong>{yesNoLabel(savedRecord.tuitionFeesUpToDate)}</strong></p>
          <p><span>Scholarship holder</span><strong>{yesNoLabel(savedRecord.scholarshipHolder)}</strong></p>
        </div>
      </section>
    );
  }

  return (
    <form className="student-data-form" onSubmit={handleSubmit} noValidate>
      <div className="student-data-form__intro">
        <div className="student-data-form__intro-icon" aria-hidden="true">
          <GraduationCap size={20} />
        </div>
        <div>
          <h3>Build your academic snapshot</h3>
          <p>
            Answer a few questions about your current term. You can update this
            information whenever your circumstances change.
          </p>
        </div>
      </div>
      {serverError && (
        <div className="login-alert" role="alert">
          {serverError}
        </div>
      )}
      {savedAt && (
        <div className="student-data-saved" role="status">
          <CheckCircle2 size={16} /> Saved successfully.
        </div>
      )}

      <fieldset className="student-data-fieldset">
        <legend>
          <Landmark size={16} aria-hidden="true" />
          Personal circumstances
        </legend>
        <p className="student-data-section-description">
          These details help put your academic experience in context.
        </p>
        <YesNoField
          name="educationalSpecialNeeds"
          label="Do you have educational special needs?"
        />
        <YesNoField
          name="tuitionFeesUpToDate"
          label="Are your tuition fees up to date?"
        />
        <YesNoField
          name="scholarshipHolder"
          label="Are you a scholarship holder?"
        />
      </fieldset>

      <fieldset className="student-data-fieldset">
        <legend>
          <GraduationCap size={16} aria-hidden="true" />
          Academic details
        </legend>
        <p className="student-data-section-description">
          Share the course and results from your current term.
        </p>

        <div className="form-group">
          <label htmlFor="course">Course</label>
          <input
            type="text"
            id="course"
            name="course"
            placeholder="e.g. BS Computer Science"
            value={formData.course}
            onChange={handleChange}
            className={errors.course ? "input-error" : ""}
          />
          {errors.course && <span className="field-error">{errors.course}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="attendance">Attendance</label>
          <select
            id="attendance"
            name="attendance"
            value={formData.attendance}
            onChange={handleChange}
            className={errors.attendance ? "input-error" : ""}
          >
            <option value="">Select attendance type</option>
            <option value="daytime">Daytime</option>
            <option value="evening">Evening</option>
          </select>
          {errors.attendance && <span className="field-error">{errors.attendance}</span>}
        </div>

        <div className="student-data-grade-row">
          <div className="form-group">
            <label htmlFor="firstSemesterGrade">1st semester grade (0–20)</label>
            <input
              type="number"
              id="firstSemesterGrade"
              name="firstSemesterGrade"
              min="0"
              max="20"
              step="0.1"
              value={formData.firstSemesterGrade}
              onChange={handleChange}
              className={errors.firstSemesterGrade ? "input-error" : ""}
            />
            {errors.firstSemesterGrade && (
              <span className="field-error">{errors.firstSemesterGrade}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="secondSemesterGrade">2nd semester grade (0–20)</label>
            <input
              type="number"
              id="secondSemesterGrade"
              name="secondSemesterGrade"
              min="0"
              max="20"
              step="0.1"
              value={formData.secondSemesterGrade}
              onChange={handleChange}
              className={errors.secondSemesterGrade ? "input-error" : ""}
            />
            {errors.secondSemesterGrade && (
              <span className="field-error">{errors.secondSemesterGrade}</span>
            )}
          </div>
        </div>
      </fieldset>

      <div className="student-data-submit-row">
        <p>
          <CircleHelp size={15} aria-hidden="true" /> Your information is only
          visible to you and authorized staff.
        </p>
        <div className="student-data-submit-actions">
          {savedRecord && <button type="button" className="student-data-cancel" onClick={() => { setFormData(recordToForm(savedRecord)); setErrors({}); setServerError(""); setIsEditing(false); }}>Cancel</button>}
          <button type="submit" className="dashboard-action" disabled={isSubmitting}>
            <Save size={16} /> {isSubmitting ? "Saving…" : savedRecord ? "Save changes" : "Save my information"}
          </button>
        </div>
      </div>
    </form>
  );
}
