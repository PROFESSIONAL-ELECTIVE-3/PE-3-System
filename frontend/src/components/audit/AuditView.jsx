import React from 'react';
import { ShieldAlert, FileText } from 'lucide-react';
import { LoadingState, EmptyState } from '../common/StatusStates';
import { fetchAuditLogs } from '../../lib/api';

export default function AuditView() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAuditLogs().then(setLogs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 fade-in">
      <div className="panel p-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">FERPA Compliance & Access Audit Trail</h2>
          <p className="text-xs text-slate-500 mt-0.5">Immutable log of every student record access, export, and model inference.</p>
        </div>
        <div className="p-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald)', border: '1px solid #cbe9d6' }}>
          <ShieldAlert size={16} />
          <span>FERPA secure</span>
        </div>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <LoadingState label="Loading audit logs" rows={6} />
        ) : logs.length === 0 ? (
          <EmptyState icon={FileText} title="No audit activity yet" description="Access and export events will be recorded here as they happen." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs data-table">
              <thead>
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Resource</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="p-3.5 pl-5 font-mono-data text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{log.username}</td>
                    <td className="p-3.5 uppercase text-[10px] font-bold" style={{ color: 'var(--petrol-dark)' }}>{log.user_role}</td>
                    <td className="p-3.5 font-mono-data text-slate-700">{log.action}</td>
                    <td className="p-3.5">{log.resource_type} {log.resource_id ? `(${log.resource_id})` : ''}</td>
                    <td className="p-3.5 text-slate-600">{log.details}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald)' }}>
                        {log.compliance_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
