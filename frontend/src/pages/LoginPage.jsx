import React from 'react';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { login } from '../lib/api';

export default function LoginPage({ onLoginSuccess, onBackToHome }) {
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('password123');
  const [loginError, setLoginError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

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
      }
    } catch (err) {
      setLoginError("Can't reach the server. Check that the backend is running and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-shell min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      {onBackToHome && (
        <button
          onClick={onBackToHome}
          className="mb-6 self-start sm:self-center flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors duration-150"
        >
          <ArrowLeft size={14} /> Back to homepage
        </button>
      )}

      <div className="max-w-md w-full fade-in-up">
        <div className="panel shadow-xl shadow-slate-950/10 p-7 sm:p-9">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl text-white" style={{ background: 'var(--ink)' }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight text-slate-950">EduRisk AI</h1>
              <p className="text-xs text-slate-500">Student success intelligence platform</p>
            </div>
          </div>

          {loginError && (
            <div className="mb-5 px-3.5 py-3 rounded-lg text-sm fade-in" style={{ background: 'var(--rose-bg)', border: '1px solid #f0c7cb', color: 'var(--rose)' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-clean w-full px-3.5 py-2.5 bg-white rounded-lg text-slate-900 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-clean w-full px-3.5 py-2.5 bg-white rounded-lg text-slate-900 text-sm"
                required
              />
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

        <div className="mt-4 px-4 py-3 rounded-xl border text-xs text-slate-500 space-y-1" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
          <p className="font-semibold text-slate-700">Demo credentials</p>
          <p className="font-mono-data">admin&nbsp;&nbsp;/&nbsp;&nbsp;password123</p>
        </div>
      </div>
    </div>
  );
}
