// Single place for every network call the app makes. Views import from
// here instead of calling fetch() directly, so the endpoints, headers,
// and error handling only need to change in one spot.

async function asJson(res) {
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export async function login(username, password) {
  const res = await fetch('/api/v1/auth/login-json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return asJson(res);
}

export async function fetchDashboard() {
  const res = await fetch('/api/v1/analytics/dashboard');
  if (!res.ok) throw new Error('dashboard_fetch_failed');
  return res.json();
}

export async function fetchStudents({ search = '', riskLevel = '' } = {}) {
  let url = '/api/v1/students?size=50';
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (riskLevel) url += `&risk_level=${riskLevel}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('students_fetch_failed');
  const data = await res.json();
  return data.items || [];
}

export async function runWhatIfSimulation(payload) {
  const res = await fetch('/api/v1/predictions/what-if', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('simulation_failed');
  return res.json();
}

export async function seedMockData(numSamples = 250) {
  const res = await fetch(`/api/v1/etl/seed-mock-data?num_samples=${numSamples}`, { method: 'POST' });
  if (!res.ok) throw new Error('seed_failed');
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch('/api/v1/alerts');
  if (!res.ok) throw new Error('alerts_fetch_failed');
  return res.json();
}

export async function resolveAlert(id, resolutionNotes) {
  const res = await fetch(`/api/v1/alerts/${id}/resolve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolution_notes: resolutionNotes }),
  });
  if (!res.ok) throw new Error('resolve_failed');
  return res.json();
}

export async function fetchAuditLogs() {
  const res = await fetch('/api/v1/analytics/ferpa-logs');
  if (!res.ok) throw new Error('audit_fetch_failed');
  return res.json();
}
