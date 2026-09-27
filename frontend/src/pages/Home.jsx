import { ArrowRight, BarChart3, ShieldCheck, UsersRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";

const features = [
  {
    icon: <BarChart3 size={20} />,
    title: "Manage academic records",
    text: "Students can save their academic information and review their personal forecast.",
  },
  {
    icon: <UsersRound size={20} />,
    title: "Connect with academic support",
    text: "Students and professors can create accepted connections and start private conversations.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Use forecasts responsibly",
    text: "Forecasts provide context for support; they do not make academic decisions.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const destination = isAuthenticated ? "/dashboard" : "/register";
  const actionLabel = isAuthenticated ? "Open workspace" : "Get started";

  return (
    <div className="home-shell">
      <header className="home-header">
        <BrandLogo />
        <nav className="home-nav" aria-label="Primary navigation">
        </nav>
        <div className="home-actions">
           {!isAuthenticated && (
            <button className="home-signin" onClick={() => navigate("/login")}>
              Sign in
            </button>
          )}
          
          <button
            className="home-primary home-primary--small"
            onClick={() => navigate(destination)}
          >
            {actionLabel}
            <ArrowRight size={16} />
          </button>
        </div>
      </header>
      <main>
        <section className="home-hero">
          <div>
            <p className="home-eyebrow">Academic information, in one place</p>
            <h1>Understand academic progress and stay connected.</h1>
            <p>
              Retainify helps students manage their academic record and run a
              personal forecast. Accepted student–professor connections can
              also use private messages for academic support conversations.
            </p>
            <div className="home-hero-actions">
              <button
                className="home-primary"
                onClick={() => navigate(destination)}
              >
                {actionLabel}
                <ArrowRight size={17} />
              </button>
              <a className="home-secondary" href="#features">
                Explore the platform
              </a>
            </div>
          </div>
        </section>
        <section className="home-features" id="features">
          <div className="home-section-heading">
            <p className="home-eyebrow">The platform</p>
            <h2>A focused workspace for students and professors.</h2>
            <p>
              Built around academic records, personal forecasts, accepted
              connections, and direct support messages.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="home-feature" key={feature.title}>
                <span>{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="home-responsible" id="responsible">
          <ShieldCheck size={25} />
          <div>
            <p className="home-eyebrow">Responsible use</p>
            <h2>Insight informs action. People make decisions.</h2>
            <p>
              Attrition classifications and performance forecasts are
              statistical estimates. They should always be considered alongside
              student context, professional judgment, and institutional policy.
            </p>
          </div>
        </section>
        <section className="home-closing">
          <h2>Ready to get started?</h2>
          <button
            className="home-primary"
            onClick={() => navigate(destination)}
          >
            {actionLabel}
            <ArrowRight size={17} />
          </button>
        </section>
      </main>
      <footer className="home-footer">
        <div>
          <BrandLogo inverse />
          <p>Academic insight for thoughtful student support.</p>
        </div>
        <div>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
