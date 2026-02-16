import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn) navigate(path);
    else navigate("/login");
  };

  return (
    <>
      <header style={{ position: "relative" }}>
        <h1>Job Nexus</h1>
        <p>Connecting Candidates, Recruiters, and College Admins for Smarter Careers</p>
        <span className="star" style={{ left: "10%", top: "30px" }}></span>
        <span className="star" style={{ left: "80%", top: "60px", background: "#43e97b" }}></span>
        <span className="star" style={{ left: "50%", top: "20px", background: "#ffae00" }}></span>
      </header>

      <nav>
        <a onClick={() => navigate("/")}>Home</a>
        <a onClick={() => handleNavigation("/candidates")}>Candidates</a>
        <a onClick={() => handleNavigation("/recruiters")}>Recruiters</a>
        <a onClick={() => handleNavigation("/collegeadmins")}>College Admins</a>
        <a onClick={() => handleNavigation("/jobs")}>Jobs</a>
        <a onClick={() => navigate("/login")}>Login</a>
      </nav>

      <div className="container">
        <div className="card">
          <span className="role-badge candidate">Candidate</span>
          <h2>Career Analysis</h2>
          <ul>
            <li>Upload or build your resume with smart recommendations</li>
            <li>Get detailed feedback and improvement tips</li>
            <li>See skill gaps and possible career paths</li>
            <li>One-click job applications & match score view</li>
            <li>Personalized course recommendations</li>
          </ul>
          <button className="btn" onClick={() => handleNavigation("/candidates")}>
            Explore as Candidate
          </button>
        </div>

        <div className="card">
          <span className="role-badge recruiter">Recruiter</span>
          <h2>Smart Hiring</h2>
          <ul>
            <li>Upload & enhance job descriptions with AI</li>
            <li>Post jobs and connect with college admins</li>
            <li>Bulk resume analysis, ranking, and shortlisting</li>
            <li>Direct communication with matched candidates</li>
          </ul>
          <button className="btn recruiter" onClick={() => handleNavigation("/recruiters")}>
            Join as Recruiter
          </button>
        </div>

        <div className="card">
          <span className="role-badge admin">College Admin</span>
          <h2>Campus Connect</h2>
          <ul>
            <li>Bulk upload student resumes</li>
            <li>Match requirement of recruiters</li>
            <li>Track application and hiring status</li>
            <li>Build bridges between talent & opportunity</li>
          </ul>
          <button className="btn admin" onClick={() => handleNavigation("/collegeadmins")}>
            Onboard as Admin
          </button>
        </div>
      </div>

      <footer>&copy; 2025 Job Nexus — Built for careers, powered by you!</footer>
    </>
  );
}
