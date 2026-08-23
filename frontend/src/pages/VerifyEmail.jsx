import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import "../styles/Login.css";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email address…");

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email/${token}`, { method: "POST" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Unable to verify this email address.");
        setStatus("success");
        setMessage(data.message);
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Unable to verify this email address.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="login-page">
      <div className="login-brand-panel">
        <div className="login-brand-content">
          <BrandLogo className="login-logo" inverse />
          <h1>Secure your account before you begin.</h1>
        </div>
      </div>
      <div className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>{status === "success" ? "Email verified" : "Verify your email"}</h2>
            <p>{message}</p>
          </div>
          {status === "verifying" && <div className="login-success" role="status">Please wait…</div>}
          {status === "error" && <div className="login-alert" role="alert">{message}</div>}
          {status === "success" && (
            <Link to="/login" className="btn-login-submit verify-email-login-link">
              Continue to log in
            </Link>
          )}
          <Link to="/" className="login-back-home">← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
