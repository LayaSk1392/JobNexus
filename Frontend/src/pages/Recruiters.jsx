import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Recruiters() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePostJob = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "recruiter") {
      alert("Please login as recruiter");
      return;
    }

    if (!title || !description) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost/JobNexus-main/Backend-PHP/api/post-job.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title,
            description,
            recruiter_id: user.id
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Job posted successfully");
        setTitle("");
        setDescription("");
      } else {
        alert(data.message || "Failed to post job");
      }
    } catch (error) {
      console.error(error);
      alert("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header>
        <h1>Recruiter Dashboard</h1>
      </header>

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
          <h2>Post Job</h2>

          <form onSubmit={handlePostJob}>
            <label>Job Title</label><br />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            /><br /><br />

            <label>Job Description</label><br />
            <textarea
              rows="4"
              cols="40"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea><br /><br />

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </button>
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
