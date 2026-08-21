import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const dashboardCopy = {
  administrator: ['Institution overview', 'Upload student data', 'Manage access'],
  professor: ['Class overview', 'View assigned students', 'Record an intervention'],
  student: ['My academic outlook', 'View my forecast', 'Request support'],
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const actions = dashboardCopy[user.role] || dashboardCopy.student;
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  return <main className="dashboard-page">
    <header className="dashboard-header"><div><span className="dashboard-brand"><b>Edu</b>Forecaster</span><p>{user.institution || 'Academic success platform'}</p></div><div className="dashboard-user"><span>{user.fullName}</span><button onClick={handleLogout}>Log out</button></div></header>
    <section className="dashboard-welcome"><p className="eyebrow">{user.role}</p><h1>Welcome, {user.fullName.split(' ')[0]}.</h1><p>Your secure academic analytics workspace is ready.</p></section>
    <section className="dashboard-grid">
      <article className="dashboard-card"><h2>{actions[0]}</h2><p>Connect approved academic records to see live risk classifications and performance forecasts.</p><span className="status-pill">Data connection required</span></article>
      <article className="dashboard-card"><h2>Next step</h2><p>{actions[1]}. Once data is available, this page will show only the students your role is authorized to access.</p><button className="dashboard-primary" disabled>{actions[1]} — coming soon</button></article>
      <article className="dashboard-card"><h2>Prediction service</h2><p>The dashboard will call the protected prediction API using your active session. The ML service still needs to be connected.</p><span className="status-pill">ML service pending</span></article>
    </section>
    <p className="dashboard-note">Risk scores are decision-support tools and should never be the sole basis for an academic decision.</p>
  </main>;
}
