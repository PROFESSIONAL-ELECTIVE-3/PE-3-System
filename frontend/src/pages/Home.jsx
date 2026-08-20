import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <span className="logo-highlight">Edu</span>Forecaster
        </div>
        <div className="navbar-actions">
          <button className="btn-signup" onClick={() => navigate('/register')}>
            Sign Up
          </button>
          <button className="btn-login" onClick={() => navigate('/login')}>
            Log In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section" id="home">
        <div className="hero-content">
          <h1>Student Academic Attrition Risk Classification <br/> & Performance Forecasting System</h1>
          <p>
            Empowering educators and administrators with predictive analytics. 
            Identify at-risk students early, forecast academic trajectories, and implement 
            data-driven interventions to improve student retention and success.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Go to Dashboard
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Run New Prediction
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2>System Capabilities</h2>
          <p>Advanced machine learning models designed for institutional success.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚠️</div>
            <h3>Attrition Risk Classification</h3>
            <p>Automatically flag students who are at a high risk of dropping out based on historical data, attendance, and current academic standing.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Performance Forecasting</h3>
            <p>Predict future GPA and course outcomes for individual students, allowing advisors to guide course selection and study habits.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Data Visualization</h3>
            <p>Interactive charts and comprehensive dashboards that provide a bird's-eye view of department-wide or university-wide academic health.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Student Academic Attrition Risk Classification & Performance Forecasting System. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;