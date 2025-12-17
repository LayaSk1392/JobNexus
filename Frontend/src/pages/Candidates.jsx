import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Candidates() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Jobs from correct API
  useEffect(() => {
    fetch("http://localhost/JobNexus-main/Backend-PHP/api/get-jobs.php")
      .then((res) => res.json())
      .then((data) => {
        console.log("Jobs fetched:", data); // DEBUG
        if (data.success) {
          setJobs(data.jobs);
        } else {
          setJobs([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <header>
        <h1>Candidate Dashboard</h1>
      </header>

      <main className="container">
        {/* Job Listings */}
        <section className="card">
          <h2>Available Job Openings</h2>

          {loading && <p>Loading jobs...</p>}

          {!loading && jobs.length === 0 && (
            <p>No jobs available at the moment.</p>
          )}

          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                border: "1px solid #e5e7eb",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            >
              <h3>{job.title}</h3>

              <p style={{ whiteSpace: "pre-line" }}>
                {job.description}
              </p>

              <small>
                Posted by: {job.recruiter_email}
              </small>
              <br />

              <small>
                {new Date(job.created_at).toLocaleString()}
              </small>
            </div>
          ))}
        </section>

        {/* Existing Candidate Features */}
        <section className="card">
          <h2>Resume Analysis & Feedback</h2>
          <ul>
            <li
              style={{ cursor: "pointer", color: "#4f46e5" }}
              onClick={() => navigate("/match-score")}
            >
              View your match score
            </li>
            <li
              style={{ cursor: "pointer", color: "#4f46e5" }}
              onClick={() => navigate("/interview-prep")}
            >
              AI interview preparation
            </li>
          </ul>
        </section>
      </main>

      <footer>&copy; 2025 Job Nexus</footer>
    </>
  );
}
