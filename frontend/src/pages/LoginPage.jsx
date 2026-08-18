import React from 'react';
import { GraduationCap, ArrowLeft, User, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, TrendingUp, Bell } from 'lucide-react';
import { login } from '../lib/api';
import '../styles/LoginPage.css';

const TRUST_POINTS = [
  { icon: TrendingUp, text: 'Risk scores refresh the moment new records land' },
  { icon: Bell, text: 'Advisors get alerted before a student falls behind' },
  { icon: ShieldCheck, text: 'Every access is written to a FERPA audit trail' },
];

export default function LoginPage({ onLoginSuccess, onBackToHome }) {
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('password123');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setSubmitting(true);
    try {
      const { ok, data } = await login(username, password);
      if (ok) {
        onLoginSuccess(data.access_token, data.user);
      } else {
        setLoginError(data.detail || "That username or password isn't right. Try admin / password123.");
        triggerShake();
      }
    } catch (err) {
      setLoginError("Can't reach the server. Check that the backend is running and try again.");
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const fillDemo = () => {
    setUsername('admin');
    setPassword('password123');
  };

  return (
    <div className="login-page">
      {/* ---------- Brand panel (lg+) ---------- */}
      <div className="login-brand-panel hidden lg:flex lg:w-[46%] xl:w-[42%] p-11 xl:p-14">
        <div className="relative z-10 fade-in-up">
          <div className="flex items-center gap-3">
            <div className="login-brand-icon">
              <GraduationCap size={22} />
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">EduRisk AI</span>
          </div>

          <h2 className="font-display text-3xl xl:text-[38px] leading-[1.12] font-semibold tracking-tight mt-12 max-w-sm">
            See attrition risk before it becomes attrition.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-300 max-w-sm">
            Sign in to your advising workspace — every score, forecast, and alert refreshed from your latest student records.
          </p>
        </div>

        <div className="login-trust-list space-y-3 fade-in-up" style={{ animationDelay: '100ms' }}>
          {TRUST_POINTS.map((p, i) => (
            <div key={i} className="login-trust-item">
              <div className="login-trust-icon">
                <p.icon size={15} style={{ color: '#7fd6da' }} />
              </div>
              <span className="text-xs text-slate-200">{p.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Form panel ---------- */}
      <div className="login-form-panel p-4 sm:p-8">
        <div className="login-form-panel-dots lg:hidden" />

        <div className="relative w-full max-w-[400px]">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="mb-6 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors duration-150"
            >
              <ArrowLeft size={14} /> Back to homepage
            </button>
          )}

          <div className="fade-in-up">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl text-white" style={{ background: 'var(--ink)' }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold tracking-tight text-slate-950">EduRisk AI</h1>
                <p className="text-xs text-slate-500">Student success intelligence platform</p>
              </div>
            </div>

            <div className="hidden lg:block mb-8">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-950">Welcome back</h1>
              <p className="text-sm text-slate-500 mt-1.5">Sign in to your advising workspace to continue.</p>
            </div>

            <div className={`login-card panel p-7 sm:p-8${shake ? ' is-shaking' : ''}`} style={{ boxShadow: 'var(--shadow-lg)' }}>
              {loginError && (
                <div className="mb-5 px-3.5 py-3 rounded-lg text-sm flex items-start gap-2.5 fade-in" style={{ background: 'var(--rose-bg)', border: '1px solid #f0c7cb', color: 'var(--rose)' }}>
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      autoComplete="username"
                      autoFocus
                      className="input-clean w-full pl-10 pr-3.5 py-2.5 bg-white rounded-lg text-slate-900 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="input-clean w-full pl-10 pr-10 py-2.5 bg-white rounded-lg text-slate-900 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="login-eye-toggle"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full py-3 font-semibold rounded-lg text-sm disabled:opacity-60">
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white spinner-smooth" />
                      Signing in…
                    </span>
                  ) : 'Sign in to portal'}
                </button>
              </form>
            </div>

            <button
              onClick={fillDemo}
              className="mt-4 w-full px-4 py-3 rounded-xl border text-xs text-slate-500 flex items-center justify-between transition-all duration-150 hover:border-slate-300 hover:bg-white group"
              style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}
            >
              <span className="text-left">
                <span className="font-semibold text-slate-700 block">Demo credentials</span>
                <span className="font-mono-data">admin&nbsp;/&nbsp;password123</span>
              </span>
              <span className="login-demo-badge">Autofill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}