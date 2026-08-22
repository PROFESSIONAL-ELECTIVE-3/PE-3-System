import { ArrowRight, BarChart3, ShieldCheck, UsersRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";

const features = [
  {
    icon: <BarChart3 size={20} />,
    title: "Review academic trends",
    text: "Bring approved records into a single, accessible workspace.",
  },
  {
    icon: <UsersRound size={20} />,
    title: "Focus support efforts",
    text: "Identify students who may benefit from a timely conversation.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Keep people in control",
    text: "Use forecasts as context—not as automatic academic decisions.",
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
          <a href="#features">Platform</a>
          <a href="#responsible">Responsible use</a>
        </nav>
        <div className="home-actions">
          
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
            <p className="home-eyebrow">Student success, with better context</p>
            <h1>Make earlier, more thoughtful academic support possible.</h1>
            <p>
              Retainify helps authorized teams review academic trends and
              use decision-support insights to guide the next conversation.
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
            <h2>A clear workspace for academic teams.</h2>
            <p>
              Designed around the real work of reviewing context, coordinating
              support, and documenting thoughtful follow-through.
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
          <h2>Ready to create a more proactive support practice?</h2>
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
