import { useEffect, useState } from "react";
import { CheckCircle2, CircleHelp, GraduationCap, Landmark, Pencil, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/StudentDataForm.css";

const EMPTY_FORM = {
  educationalSpecialNeeds: "",
  tuitionFeeStatus: "",
  scholarshipStatus: "",
  attendance: "",
  gradeMaximum: "20",
  previousSemesterGrade: "",
  previousSemesterUnitsEnrolled: "",
  previousSemesterUnitsApproved: "",
};

const boolToString = (value) =>
  value === true ? "yes" : value === false ? "no" : "";

const recordToForm = (record) => ({
  educationalSpecialNeeds: boolToString(record.educationalSpecialNeeds),
  tuitionFeeStatus: boolToString(record.tuitionFeeStatus),
  scholarshipStatus: boolToString(record.scholarshipStatus),
  attendance: record.attendance || "",
  gradeMaximum: record.gradeMaximum ?? 20,
  previousSemesterGrade: record.previousSemesterGrade ?? "",
  previousSemesterUnitsEnrolled: record.previousSemesterUnitsEnrolled ?? "",
  previousSemesterUnitsApproved: record.previousSemesterUnitsApproved ?? "",
});

const yesNoLabel = (value) => value ? "Yes" : "No";

const isCurrentRecord = (record) =>
  record &&
  typeof record.previousSemesterGrade === "number" &&
  typeof record.previousSemesterUnitsEnrolled === "number" &&
  typeof record.previousSemesterUnitsApproved === "number" &&
  ["day", "night"].includes(record.attendance) &&
  typeof record.tuitionFeeStatus === "boolean" &&
  typeof record.scholarshipStatus === "boolean";

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
        if (isMounted && isCurrentRecord(data.record)) {
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
    if (formData.tuitionFeeStatus === "") next.tuitionFeeStatus = "Select an option.";
    if (formData.scholarshipStatus === "") next.scholarshipStatus = "Select an option.";
    if (!formData.attendance) next.attendance = "Select day or night attendance.";

    const gradeMaximum = Number(formData.gradeMaximum);
    if (Number.isNaN(gradeMaximum) || gradeMaximum <= 0 || gradeMaximum > 100)
      next.gradeMaximum = "Select a valid grade scale.";

    const previousSemesterGrade = Number(formData.previousSemesterGrade);
    if (formData.previousSemesterGrade === "" || Number.isNaN(previousSemesterGrade) || previousSemesterGrade < 0 || previousSemesterGrade > gradeMaximum)
      next.previousSemesterGrade = "Enter a grade within the selected scale.";

    const previousSemesterUnitsEnrolled = Number(formData.previousSemesterUnitsEnrolled);
    if (formData.previousSemesterUnitsEnrolled === "" || !Number.isInteger(previousSemesterUnitsEnrolled) || previousSemesterUnitsEnrolled < 1 || previousSemesterUnitsEnrolled > 100)
      next.previousSemesterUnitsEnrolled = "Enter whole enrolled units between 1 and 100.";

    const previousSemesterUnitsApproved = Number(formData.previousSemesterUnitsApproved);
    if (formData.previousSemesterUnitsApproved === "" || !Number.isInteger(previousSemesterUnitsApproved) || previousSemesterUnitsApproved < 0 || previousSemesterUnitsApproved > 100)
      next.previousSemesterUnitsApproved = "Enter whole approved units between 0 and 100.";
    else if (Number.isInteger(previousSemesterUnitsEnrolled) && previousSemesterUnitsApproved > previousSemesterUnitsEnrolled)
      next.previousSemesterUnitsApproved = "Approved units cannot exceed enrolled units.";

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
          tuitionFeeStatus: formData.tuitionFeeStatus === "yes",
          scholarshipStatus: formData.scholarshipStatus === "yes",
          attendance: formData.attendance,
          gradeMaximum: Number(formData.gradeMaximum),
          previousSemesterGrade: Number(formData.previousSemesterGrade),
          previousSemesterUnitsEnrolled: Number(formData.previousSemesterUnitsEnrolled),
          previousSemesterUnitsApproved: Number(formData.previousSemesterUnitsApproved),
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
          <div><span>Study schedule</span><strong>{savedRecord.attendance === "day" ? "Daytime" : "Evening/night"}</strong></div>
          <div><span>Previous-semester grade</span><strong>{savedRecord.previousSemesterGrade} / {savedRecord.gradeMaximum || 20}</strong></div>
          <div><span>Previous-semester units enrolled</span><strong>{savedRecord.previousSemesterUnitsEnrolled}</strong></div>
          <div><span>Previous-semester units approved</span><strong>{savedRecord.previousSemesterUnitsApproved}</strong></div>
        </div>
        <div className="student-data-summary__details">
          <p><span>Educational special needs</span><strong>{yesNoLabel(savedRecord.educationalSpecialNeeds)}</strong></p>
          <p><span>Tuition-fee status</span><strong>{yesNoLabel(savedRecord.tuitionFeeStatus)}</strong></p>
          <p><span>Scholarship status</span><strong>{yesNoLabel(savedRecord.scholarshipStatus)}</strong></p>
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
          name="tuitionFeeStatus"
          label="Are your tuition fees up to date?"
        />
        <YesNoField
          name="scholarshipStatus"
          label="Do you have a scholarship?"
        />
      </fieldset>

      <fieldset className="student-data-fieldset">
        <legend>
          <GraduationCap size={16} aria-hidden="true" />
          Academic details
        </legend>
        <p className="student-data-section-description">
          Share your attendance schedule and previous-semester results.
        </p>

        <div className="form-group">
          <label htmlFor="attendance">Study schedule</label>
          <select
            id="attendance"
            name="attendance"
            value={formData.attendance}
            onChange={handleChange}
            className={errors.attendance ? "input-error" : ""}
          >
            <option value="">Select study schedule</option>
            <option value="day">Daytime</option>
            <option value="night">Evening/night</option>
          </select>
          {errors.attendance && <span className="field-error">{errors.attendance}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="gradeMaximum">Grade scale maximum</label>
          <select id="gradeMaximum" name="gradeMaximum" value={formData.gradeMaximum} onChange={handleChange} className={errors.gradeMaximum ? "input-error" : ""}>
            <option value="4">4.0</option>
            <option value="5">5.0</option>
            <option value="20">20</option>
            <option value="100">100</option>
          </select>
          {errors.gradeMaximum && <span className="field-error">{errors.gradeMaximum}</span>}
        </div>

        <div className="student-data-grade-row">
          <div className="form-group">
            <label htmlFor="previousSemesterGrade">Previous-semester grade (0–{formData.gradeMaximum || "?"})</label>
            <input
              type="number"
              id="previousSemesterGrade"
              name="previousSemesterGrade"
              min="0"
              max={formData.gradeMaximum || 100}
              step="0.1"
              value={formData.previousSemesterGrade}
              onChange={handleChange}
              className={errors.previousSemesterGrade ? "input-error" : ""}
            />
            {errors.previousSemesterGrade && (
              <span className="field-error">{errors.previousSemesterGrade}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="previousSemesterUnitsEnrolled">Previous-semester units enrolled</label>
            <input type="number" id="previousSemesterUnitsEnrolled" name="previousSemesterUnitsEnrolled" min="1" max="100" step="1" value={formData.previousSemesterUnitsEnrolled} onChange={handleChange} className={errors.previousSemesterUnitsEnrolled ? "input-error" : ""} />
            {errors.previousSemesterUnitsEnrolled && <span className="field-error">{errors.previousSemesterUnitsEnrolled}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="previousSemesterUnitsApproved">Previous-semester units approved</label>
            <input
              type="number"
              id="previousSemesterUnitsApproved"
              name="previousSemesterUnitsApproved"
              min="0"
              max="100"
              step="1"
              value={formData.previousSemesterUnitsApproved}
              onChange={handleChange}
              className={errors.previousSemesterUnitsApproved ? "input-error" : ""}
            />
            {errors.previousSemesterUnitsApproved && (
              <span className="field-error">{errors.previousSemesterUnitsApproved}</span>
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
