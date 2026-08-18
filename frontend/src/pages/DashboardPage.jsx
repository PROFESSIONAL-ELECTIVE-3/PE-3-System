import React from 'react';
import Header from '../components/layout/Header';
import NavTabs from '../components/layout/NavTabs';
import DashboardView from '../components/dashboard/DashboardView';
import StudentsView from '../components/students/StudentsView';
import SimulatorView from '../components/simulator/SimulatorView';
import ETLView from '../components/etl/ETLView';
import AlertsView from '../components/alerts/AlertsView';
import AuditView from '../components/audit/AuditView';
import '../styles/index.css';

const VIEWS = {
  dashboard: DashboardView,
  students: StudentsView,
  simulator: SimulatorView,
  etl: ETLView,
  alerts: AlertsView,
  audit: AuditView,
};

export default function DashboardPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const ActiveView = VIEWS[activeTab] || DashboardView;

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Header user={user} onLogout={onLogout} />
      <NavTabs activeTab={activeTab} onSelect={setActiveTab} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <ActiveView />
      </main>
    </div>
  );
}
