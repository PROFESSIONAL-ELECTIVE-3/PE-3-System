import React from 'react';
import {
  GraduationCap, Sparkles, TrendingUp, Sliders, Bell, ShieldAlert, UploadCloud,
  LayoutDashboard, ArrowRight, CheckCircle2,
} from 'lucide-react';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Executive dashboard',
    description: 'One view of institutional GPA trends, risk distribution, and department-level attrition — updated as new records land.',
  },
  {
    icon: TrendingUp,
    title: 'Predictive risk scoring',
    description: 'Gradient-boosted models score every student on 30+ behavioral and academic signals, ranked by feature importance.',
  },
  {
    icon: Sliders,
    title: 'What-if simulator',
    description: 'Adjust attendance, study hours, or engagement for a student and see the projected effect on GPA and risk instantly.',
  },
  {
    icon: Bell,
    title: 'Early warning alerts',
    description: 'Advisors get notified the moment a student crosses a risk threshold, with recommended next steps attached.',
  },
  {
    icon: UploadCloud,
    title: 'Flexible data ingestion',
    description: 'Bring in records via CSV upload or connect your SIS and LMS exports through the ETL pipeline.',
  },
  {
    icon: ShieldAlert,
    title: 'FERPA-compliant by design',
    description: 'Every access, export, and inference is written to an immutable audit trail your compliance team can review.',
  },
];

const STEPS = [
  { title: 'Ingest', description: 'Academic, attendance, and engagement records flow in from your SIS, LMS, or a CSV upload.' },
  { title: 'Score', description: 'The risk model evaluates each student and ranks the factors driving their attrition risk.' },
  { title: 'Act', description: 'Advisors see prioritized alerts and forecasts, and log outreach directly against the record.' },
];

export default function HomePage({ onNavigateLogin }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--sand)' }}>
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b backdrop-blur bg-white/90" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg text-white" style={{ background: 'var(--ink)' }}>
              <GraduationCap size={20} />
            </div>
            <span className="font-display font-semibold text-base tracking-tight text-slate-950">EduRisk AI</span>
          </div>
          <button
            onClick={onNavigateLogin}
            className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16,21,31,0.07) 1px, transparent 0)',
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-24 sm:pb-20">
          <div className="max-w-2xl fade-in-up">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] mb-5 px-3 py-1.5 rounded-full" style={{ color: 'var(--petrol-dark)', background: 'var(--petrol-light)' }}>
              <Sparkles size={13} /> Student success intelligence
            </div>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] font-semibold tracking-tight text-slate-950">
              See attrition risk before it becomes attrition.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600 max-w-xl">
              EduRisk AI scores every student on academic and behavioral signals, forecasts what
              a single intervention could change, and gets the right alert to the right advisor —
              all inside a FERPA-compliant workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateLogin}
                className="btn-primary px-5 py-3 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 group"
              >
                Sign in to your workspace <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
              <a href="#features" className="btn-secondary px-5 py-3 rounded-lg text-sm font-semibold">
                See what it does
              </a>
            </div>
          </div>

          {/* Signature visual: dashboard preview card */}
          <div className="mt-14 sm:mt-16 panel panel-interactive p-4 sm:p-6 max-w-4xl shadow-xl shadow-slate-950/10 fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--rose)' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--amber)' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--emerald)' }} />
              </div>
              <span className="eyebrow text-slate-400">Executive Dashboard preview</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'At-risk flagged', value: '312', accent: 'var(--amber)' },
                { label: 'Avg. institutional GPA', value: '3.02', accent: 'var(--emerald)' },
                { label: 'Open alerts', value: '47', accent: 'var(--rose)' },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-xl border transition-transform duration-200 hover:-translate-y-0.5" style={{ background: 'var(--sand)', borderColor: 'var(--line)' }}>
                  <div className="text-[10px] text-slate-500">{s.label}</div>
                  <div className="font-display text-2xl font-semibold mt-1 tabular-nums" style={{ color: s.accent }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-xl mb-10">
          <span className="eyebrow" style={{ color: 'var(--petrol-dark)' }}>How it works</span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 mt-2">From raw records to advisor action</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger">
          {STEPS.map((step, i) => (
            <div key={i} className="panel panel-interactive p-6">
              <span className="font-display text-3xl font-semibold" style={{ color: 'var(--petrol-light)', WebkitTextStroke: '1.5px var(--petrol)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-3">{step.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-5">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-xl mb-10">
          <span className="eyebrow" style={{ color: 'var(--petrol-dark)' }}>What's inside</span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 mt-2">Everything an advising team needs in one workspace</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {FEATURES.map((f, i) => (
            <div key={i} className="panel panel-interactive p-5">
              <div className="p-2.5 rounded-lg inline-flex mb-4" style={{ background: 'var(--petrol-light)' }}>
                <f.icon size={18} style={{ color: 'var(--petrol-dark)' }} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-5">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="dashboard-hero rounded-2xl px-6 py-10 sm:px-12 sm:py-14 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="relative z-10 max-w-lg">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">Ready to see it on your own roster?</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {['FERPA-compliant audit trail', 'Real-time risk scoring', 'No setup required for the demo workspace'].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={15} style={{ color: '#7fd6da' }} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={onNavigateLogin}
            className="relative z-10 shrink-0 px-6 py-3.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: 'white', color: 'var(--ink)' }}
          >
            Sign in to your workspace <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <GraduationCap size={14} />
            <span>EduRisk AI — Student success intelligence platform</span>
          </div>
          <span>Built for academic advising teams. Not affiliated with any institution shown.</span>
        </div>
      </footer>
    </div>
  );
}
