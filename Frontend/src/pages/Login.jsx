import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Login.css";

//const API_BASE = "http://localhost/JobNexus-main/Backend-PHP/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.role) {
      setRole(location.state.role);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "login.php" : "register.php";
    const url = `http://localhost/JobNexus-main/Backend-PHP/api/${endpoint}`;

    const payload = isLogin
      ? { email, password, role }
      : { email, password, role, firstName, lastName };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      // Handle HTTP-level errors clearly
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      // LOGIN SUCCESS
      if (isLogin && data.success) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role);

        switch (data.user.role) {
          case "candidate":
            navigate("/candidates");
            break;
          case "recruiter":
            navigate("/recruiters");
            break;
          case "admin":
            navigate("/collegeadmins");
            break;
          default:
            navigate("/");
        }
        return;
      }

      // REGISTER SUCCESS
      if (!isLogin && data.success) {
        alert("Registration successful! Please sign in.");
        setIsLogin(true);
        setPassword("");
        return;
      }

      // BACKEND-REPORTED ERROR
      alert(data.message || "Authentication failed");

    } catch (error) {
      console.error("Auth request failed:", error);
      alert("Unable to reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-compact">
      <div className="back-home">
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>

      <div className="login-container-compact">
        <div className="brand-compact">
          <h1 className="logo-compact">
            <span className="logo-gradient">Job</span>Nexus
          </h1>
          <p className="tagline-compact">
            {isLogin
              ? "Welcome back! Sign in to continue"
              : "Join our community today"}
          </p>
        </div>

        {/* ROLE TABS */}
        <div className="role-tabs-compact">
          {["candidate", "recruiter", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              className={`role-tab-compact ${role === r ? "active" : ""}`}
              onClick={() => setRole(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="form-compact">
          {!isLogin && (
            <>
              <input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            minLength="6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>

          <p
            className="toggle-form-btn"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Need an account? Sign up"
              : "Have an account? Sign in"}
          </p>
        </form>
      </div>
    </div>
  );
}
