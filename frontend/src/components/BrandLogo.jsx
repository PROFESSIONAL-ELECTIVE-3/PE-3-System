import { Link } from "react-router-dom";
import "./BrandLogo.css";

export default function BrandLogo({
  className = "",
  inverse = false,
  to = "/",
}) {
  return (
    <Link
      to={to}
      className={`brand-logo${inverse ? " brand-logo--inverse" : ""}${className ? ` ${className}` : ""}`}
      aria-label="EduForecaster home"
    >
      <span className="brand-logo__accent">Edu</span>
      <span>Forecaster</span>
    </Link>
  );
}
