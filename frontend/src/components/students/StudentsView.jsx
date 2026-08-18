import React from 'react';
import { Search, Users } from 'lucide-react';
import { LoadingState, EmptyState } from '../common/StatusStates';
import StudentTable from './StudentTable';
import StudentModal from './StudentModal';
import { fetchStudents } from '../../lib/api';

export default function StudentsView() {
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [riskFilter, setRiskFilter] = React.useState('');
  const [selectedStudent, setSelectedStudent] = React.useState(null);

  const loadStudents = React.useCallback(() => {
    setLoading(true);
    fetchStudents({ search, riskLevel: riskFilter })
      .then(setStudents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, riskFilter]);

  React.useEffect(() => { loadStudents(); }, [loadStudents]);

  return (
    <div className="space-y-6 fade-in">
      <div className="panel flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Student Academic Roster</h2>
          <p className="text-xs text-slate-500">Individual profiles, risk classifications, and performance forecasts</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
            <input
              type="text"
              placeholder="Search by name, ID, major…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-clean w-full pl-9 pr-3 py-2 rounded-lg text-xs"
              style={{ background: 'var(--sand)' }}
            />
          </div>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="input-clean px-3 py-2 rounded-lg text-xs"
            style={{ background: 'var(--sand)' }}
          >
            <option value="">All risk levels</option>
            <option value="High">High risk</option>
            <option value="Medium">Medium risk</option>
            <option value="Low">Low risk</option>
          </select>
        </div>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <LoadingState label="Loading student records" rows={6} />
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students match this view"
            description="Adjust your filters, or seed sample records from Data Ingestion to get started."
          />
        ) : (
          <StudentTable students={students} onSelectStudent={setSelectedStudent} />
        )}
      </div>

      {selectedStudent && (
        <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}
