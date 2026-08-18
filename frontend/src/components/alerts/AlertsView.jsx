import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { LoadingState, EmptyState } from '../common/StatusStates';
import { fetchAlerts, resolveAlert as resolveAlertApi } from '../../lib/api';

export default function AlertsView() {
  const [alerts, setAlerts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [resolvingId, setResolvingId] = React.useState(null);

  const loadAlerts = React.useCallback(() => {
    fetchAlerts().then(setAlerts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await resolveAlertApi(id, 'Advisor contacted student and scheduled intervention.');
      loadAlerts();
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="panel p-5">
        <h2 className="text-base font-bold text-slate-900">Early Warning Alerts & Advising Feed</h2>
        <p className="text-xs text-slate-500 mt-0.5">Real-time notifications flagging critical student attrition risks for advisor follow-up.</p>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <LoadingState label="Loading alert feed" rows={4} />
        ) : alerts.length === 0 ? (
          <EmptyState icon={Bell} title="No active warnings" description="Alerts will appear here as the risk model flags students who need outreach." />
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {alerts.map(a => {
              const critical = a.severity === 'CRITICAL';
              return (
                <div key={a.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-150 hover:bg-slate-50/80">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        style={critical ? { color: 'var(--rose)', background: 'var(--rose-bg)' } : { color: 'var(--amber)', background: 'var(--amber-bg)' }}
                      >
                        {a.severity}
                      </span>
                      <span className="text-xs font-mono-data font-medium text-slate-500">{a.student_identifier} — {a.student_name}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{a.title}</h4>
                    <p className="text-xs text-slate-600">{a.message}</p>
                  </div>
                  <div className="shrink-0">
                    {a.is_resolved ? (
                      <span
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center space-x-1"
                        style={{ background: 'var(--emerald-bg)', color: 'var(--emerald)', border: '1px solid #cbe9d6' }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Resolved</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolve(a.id)}
                        disabled={resolvingId === a.id}
                        className="btn-primary px-3.5 py-2 text-xs font-medium rounded-lg disabled:opacity-60"
                      >
                        {resolvingId === a.id ? 'Resolving…' : 'Resolve & schedule'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
