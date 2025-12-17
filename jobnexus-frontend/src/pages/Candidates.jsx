import React from "react";
import { useNavigate } from "react-router-dom";

export default function Candidates() {
  const navigate = useNavigate();

  return (
    <>
      <header><h1>Candidate Dashboard</h1></header>
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
          <h2>Upload or Generate Resume</h2>
          <form>
            <label>Upload Resume: <input type="file" accept=".pdf,.doc,.docx" /></label>
            <button className="btn" type="submit">Upload</button>
          </form>
          <a className="btn" href="#">Build Resume Online</a>
        </section>

        <section className="card">
          <h2>Resume Analysis & Feedback</h2>
          <ul>
            <li>Get skill gap analysis</li>
            <li>Receive personalized improvement tips</li>
            <li>View your match score for jobs</li>
            <li>AI-generated interview questions for preparation</li>
            <li>See suitable career paths based on resume</li>
          </ul>
        </section>

        <section className="card">
          <h2>Job Search & Recommendations</h2>
          <form>
            <input type="text" placeholder="Search jobs by keyword, location, or skill" />
            <button className="btn" type="submit">Search</button>
          </form>
          <ul>
            <li>One-click applications</li>
            <li>Recommended courses for missing skills</li>
            <li>Track application status</li>
          </ul>
        </section>
      </main>

      <footer>&copy; 2025 Job Nexus</footer>
    </>
  );
}
