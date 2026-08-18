import React from 'react';
import { UploadCloud, Activity } from 'lucide-react';
import { seedMockData } from '../../lib/api';

export default function ETLView() {
  const [seeding, setSeeding] = React.useState(false);
  const [seedMsg, setSeedMsg] = React.useState(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const data = await seedMockData(250);
      setSeedMsg(data.message);
    } catch (err) {
      setSeedMsg('Seeding failed. Confirm the backend server is running and try again.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="panel p-5">
        <h2 className="text-base font-bold text-slate-900">Data Ingestion & ETL Studio</h2>
        <p className="text-xs text-slate-500 mt-0.5">Import student demographic and academic performance records for automated feature extraction and risk scoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="panel p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Sample Dataset Seeder</h3>
            <p className="text-xs text-slate-500">Generate and ingest 250 realistic student records complete with GPA, attendance, LMS scores, and socio-economic indicators.</p>
          </div>

          {seedMsg && (
            <div className="p-3 rounded-xl text-xs" style={{ background: 'var(--emerald-bg)', border: '1px solid #cbe9d6', color: 'var(--emerald)' }}>
              {seedMsg}
            </div>
          )}

          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn-primary w-full py-3 font-medium rounded-xl text-xs shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            <Activity size={16} />
            <span>{seeding ? 'Running ETL pipeline…' : 'Seed 250 student records'}</span>
          </button>
        </div>

        <div className="panel p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">CSV Dataset Upload</h3>
            <p className="text-xs text-slate-500">Upload a CSV of student records to run the ETL cleaning and prediction pipeline.</p>
          </div>

          <label className="rounded-xl p-6 text-center cursor-pointer transition-colors block" style={{ border: '2px dashed var(--line-strong)', background: 'var(--sand)' }}>
            <UploadCloud size={26} className="mx-auto text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-slate-700">Click to upload a CSV file</span>
            <p className="text-[10px] text-slate-400 mt-1 font-mono-data">student_id, first_name, last_name, gpa, attendance</p>
            <input type="file" accept=".csv" className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
