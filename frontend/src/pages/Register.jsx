import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import '../styles/Register.css';

const STEPS = [
  { id: 1, label: 'Account' },
  { id: 2, label: 'Role' },
  { id: 3, label: 'Security' },
];

const ROLES = [
  {
    value: 'student',
    title: 'Student',
    description: 'Track your own academic progress and forecasts.',
    icon: '🎓',
  },
  {
    value: 'professor',
    title: 'Professor',
    description: 'Monitor class performance and flag at-risk students.',
    icon: '📚',
  },
  {
    value: 'administrator',
    title: 'Administrator',
    description: 'Oversee department or university-wide analytics.',
    icon: '🏛️',
  },
];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const selectRole = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
    if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
  };

  const validateStep = (targetStep) => {
    const newErrors = {};

    if (targetStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Enter a valid email address.';
      }
      if (!formData.institution.trim()) newErrors.institution = 'Institution name is required.';
    }

    if (targetStep === 2) {
      if (!formData.role) newErrors.role = 'Select a role to continue.';
    }

    if (targetStep === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters.';
      }
      if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
      if (!agreedToTerms) {
        newErrors.terms = 'You must agree to the Terms of Service to continue.';
      }
    }

    return newErrors;
  };

  const goNext = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const goBack = () => {
    setErrors({});
    setServerError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const stepErrors = validateStep(3);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          institution: formData.institution,
          role: formData.role,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Could not create your account. Please try again.');
      }

      await response.json();
      navigate('/login', {
        state: { successMessage: 'Account created successfully. Please log in.' },
      });
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Enter should advance the step instead of submitting early, except on the final step
    if (e.key === 'Enter' && step < STEPS.length) {
      e.preventDefault();
      goNext();
    }
  };

  return (
    <div className="login-page">
      {/* Brand Panel */}
      <div className="login-brand-panel">
        <div className="login-brand-content">
          <Link to="/" className="login-logo">
            <span className="logo-highlight">Edu</span>Forecaster
          </Link>
          <h1>Bring predictive analytics to your institution.</h1>
          <p>
            Create an account to start flagging at-risk students, forecasting
            performance, and building dashboards your whole team can rely on.
          </p>
          <ul className="login-brand-points">
            <li>Set up in minutes, no data science team required</li>
            <li>Built for students, professors, and administrators</li>
            <li>Secure, institution-level access controls</li>
          </ul>
        </div>
      </div>

      {/* Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-wrapper register-wrapper">
          <div className="login-form-header">
            <h2>Create Your Account</h2>
            <p>Get started with attrition risk and performance forecasting.</p>
          </div>

          {/* Progress Indicator */}
          <div className="register-progress" role="list">
            {STEPS.map((s, index) => (
              <React.Fragment key={s.id}>
                <div
                  className={`register-progress-step ${
                    step === s.id ? 'active' : step > s.id ? 'completed' : ''
                  }`}
                  role="listitem"
                >
                  <span className="register-progress-dot">
                    {step > s.id ? '✓' : s.id}
                  </span>
                  <span className="register-progress-label">{s.label}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`register-progress-line ${step > s.id ? 'completed' : ''}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {serverError && (
            <div className="login-alert" role="alert">
              {serverError}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            noValidate
          >
            {/* Step 1: Account basics */}
            {step === 1 && (
              <div className="register-step">
                <div className="form-group">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    placeholder="Jane Rivera"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? 'input-error' : ''}
                    autoFocus
                  />
                  {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="institution">Institution</label>
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    autoComplete="organization"
                    placeholder="Riverside State University"
                    value={formData.institution}
                    onChange={handleChange}
                    className={errors.institution ? 'input-error' : ''}
                  />
                  {errors.institution && (
                    <span className="field-error">{errors.institution}</span>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Role selection */}
            {step === 2 && (
              <div className="register-step">
                <div className="role-card-group" role="radiogroup" aria-label="Select your role">
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r.value}
                      className={`role-card ${formData.role === r.value ? 'selected' : ''}`}
                      onClick={() => selectRole(r.value)}
                      role="radio"
                      aria-checked={formData.role === r.value}
                    >
                      <span className="role-card-icon">{r.icon}</span>
                      <span className="role-card-title">{r.title}</span>
                      <span className="role-card-description">{r.description}</span>
                    </button>
                  ))}
                </div>
                {errors.role && <span className="field-error">{errors.role}</span>}
              </div>
            )}

            {/* Step 3: Security */}
            {step === 3 && (
              <div className="register-step">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'input-error' : ''}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'input-error' : ''}
                  />
                  {errors.confirmPassword && (
                    <span className="field-error">{errors.confirmPassword}</span>
                  )}
                </div>

                <div className="form-remember-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                      }}
                    />
                    I agree to the <a href="#terms">Terms of Service</a> and{' '}
                    <a href="#privacy">Privacy Policy</a>
                  </label>
                </div>
                {errors.terms && <span className="field-error">{errors.terms}</span>}
              </div>
            )}

            {/* Step Navigation */}
            <div className="register-step-nav">
              {step > 1 && (
                <button type="button" className="btn-step-back" onClick={goBack}>
                  Back
                </button>
              )}
              {step < STEPS.length ? (
                <button type="button" className="btn-login-submit" onClick={goNext}>
                  Continue
                </button>
              ) : (
                <button type="submit" className="btn-login-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Account…' : 'Create Account'}
                </button>
              )}
            </div>
          </form>

          <p className="login-signup-prompt">
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          <Link to="/" className="login-back-home">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
