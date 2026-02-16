import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem("loggedIn", true);
      navigate("/");
    } else {
      alert("Please enter valid details!");
    }
  };

  return (
    <>
      <header>
        <h1>Log In to Job Nexus</h1>
      </header>
      <nav>
        <a onClick={() => navigate("/")}>Home</a>
        <a onClick={() => navigate("/candidates")}>Candidates</a>
        <a onClick={() => navigate("/recruiters")}>Recruiters</a>
        <a onClick={() => navigate("/collegeadmins")}>College Admins</a>
        <a onClick={() => navigate("/jobs")}>Jobs</a>
        <a onClick={() => navigate("/login")}>Login</a>
      </nav>

      <main className="container" style={{ justifyContent: "center" }}>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <label>
              Email:{" "}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password:{" "}
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
              <option value="admin">College Admin</option>
            </select>
            <button className="btn" type="submit">Login</button>
          </form>
          <p>
            Don't have an account? <a href="#">Sign Up</a>
          </p>
        </div>
      </main>

      <footer>&copy; 2025 Job Nexus</footer>
    </>
  );
}
