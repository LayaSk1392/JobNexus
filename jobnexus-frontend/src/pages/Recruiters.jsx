import React from "react";
import { useNavigate } from "react-router-dom";

export default function Recruiters() {
  const navigate = useNavigate();

  return (
    <>
      <header><h1>Recruiter Dashboard</h1></header>
      <nav>
        <a onClick={() => navigate("/")}>Home</a>
        <a onClick={() => navigate("/candidates")}>Candidates</a>
        <a onClick={() => navigate("/recruiters")}>Recruiters</a>
        <a onClick={() => navigate("/collegeadmins")}>College Admins</a>
        <a onClick={() => navigate("/jobs")}>Jobs</a>
        <a onClick={() => navigate("/login")}>Login</a>
      </nav>

      <main className="container">
        <section className="card">
          <h2>Post & Enhance Jobs</h2>
          <form>
            <label>Job Description:</label><br />
            <textarea rows="4" cols="32"></textarea><br />
            <button className="btn" type="button">Enhance with AI</button>
            <button className="btn" type="submit">Post Job</button>
          </form>
        </section>

        <section className="card">
          <h2>Resume Analysis</h2>
          <ul>
            <li>Bulk upload candidate resumes</li>
            <li>Rank candidates by match score</li>
            <li>Shortlist and contact matched talent</li>
            <li>Connect with college admins for campus hiring</li>
          </ul>
        </section>
      </main>

      <footer>&copy; 2025 Job Nexus</footer>
    </>
  );
}
