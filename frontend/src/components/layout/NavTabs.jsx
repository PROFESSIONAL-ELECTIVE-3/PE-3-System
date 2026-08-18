import React from 'react';
import { LayoutDashboard, Users, Sliders, UploadCloud, Bell, FileText } from 'lucide-react';

export const TABS = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Student Roster', icon: Users },
  { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
  { id: 'etl', label: 'Data Ingestion', icon: UploadCloud },
  { id: 'alerts', label: 'Early Warnings', icon: Bell },
  { id: 'audit', label: 'FERPA Audit Log', icon: FileText },
];

function NavTab({ id, label, icon: Icon, activeTab, onSelect }) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => onSelect(id)}
      aria-current={isActive ? 'page' : undefined}
      className={`nav-tab ${isActive ? 'active' : ''} flex items-center space-x-2 py-4 px-3 font-medium text-xs sm:text-sm whitespace-nowrap`}
    >
      <Icon size={17} className="transition-transform duration-200" style={isActive ? { color: 'var(--petrol)' } : undefined} />
      <span>{label}</span>
    </button>
  );
}

export default function NavTabs({ activeTab, onSelect }) {
  return (
    <div className="bg-white/95 border-b border-slate-200/80 shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 sm:gap-2 overflow-x-auto">
        {TABS.map(tab => (
          <NavTab key={tab.id} {...tab} activeTab={activeTab} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
