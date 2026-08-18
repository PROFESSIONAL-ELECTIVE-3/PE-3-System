import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Simple state-based router. Swap this for react-router-dom's
// <BrowserRouter> if the project already depends on it — the three
// pages below don't care how `page` gets set, only what its value is.
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [page, setPage] = useState(() => (localStorage.getItem('token') ? 'dashboard' : 'home'));

  const handleLoginSuccess = (accessToken, loggedInUser) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setToken(accessToken);
    setUser(loggedInUser);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPage('home');
  };

  if (page === 'dashboard' && token) {
    return <DashboardPage user={user} onLogout={handleLogout} />;
  }

  if (page === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onBackToHome={() => setPage('home')} />;
  }

  return <HomePage onNavigateLogin={() => setPage('login')} />;
}
