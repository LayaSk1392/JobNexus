import React, { useEffect, useState } from "react";
import ProfileIcon from "./ProfileIcon";
import "./Recruiters.css";

export default function Recruiters() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState({});
  
  // New states for resume ranking
  const [showRanking, setShowRanking] = useState(false);
  const [selectedJobForRanking, setSelectedJobForRanking] = useState("");
  const [rankings, setRankings] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState("");
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  
  const API_BASE = "http://localhost/JobNexus/Backend-PHP/api";

  // 🔹 Fetch applicants AND recruiter's jobs
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "recruiter") {
      alert("Please login as recruiter");
      return;
    }

    // Fetch applications
    fetch(`${API_BASE}/get-applicants.php?recruiter_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Applications data:", data);
        if (data.success) {
          setApplications(data.applications || []);
          const initialStatuses = {};
          data.applications?.forEach(app => {
            initialStatuses[app.application_id] = app.status;
          });
          setStatusUpdates(initialStatuses);
        } else {
          console.error("Failed to fetch applications:", data.message);
        }
      })
      .catch((err) => console.error("Error fetching applications:", err));

    // Fetch recruiter's jobs for ranking
    fetch(`${API_BASE}/recruiter-jobs.php?recruiter_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Jobs data:", data);
        if (data.success) {
          setRecruiterJobs(data.jobs || []);
        }
      })
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  // 🔹 Post job
  const handlePostJob = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "recruiter") {
      alert("Please login as recruiter");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/post-job.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          recruiter_id: user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        alert("Job posted successfully");
        setTitle("");
        setDescription("");
        // Refresh jobs list
        fetch(`${API_BASE}/recruiter-jobs.php?recruiter_id=${user.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setRecruiterJobs(data.jobs || []);
            }
          });
      } else {
        alert(data.message || "Failed to post job");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 View Resume
  const handleViewResume = (application) => {
    if (!application.resume_filename) {
      alert("No resume available for this candidate");
      return;
    }

    setSelectedResume({
      application_id: application.application_id,
      filename: application.resume_filename,
      candidate_name: application.candidate_name,
      job_title: application.job_title
    });
    setResumeModalOpen(true);
  };

  // 🔹 Download Resume
  const handleDownloadResume = (application) => {
    if (!application.resume_filename) {
      alert("No resume available for download");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const url = `${API_BASE}/download-resume.php?application_id=${application.application_id}&recruiter_id=${user.id}`;
    
    window.open(url, "_blank");
  };

  // 🔹 Close Resume Modal
  const closeResumeModal = () => {
    setResumeModalOpen(false);
    setSelectedResume(null);
  };

  // 🔹 Update Application Status
  const handleStatusChange = async (applicationId, newStatus) => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    setStatusUpdates(prev => ({
      ...prev,
      [applicationId]: newStatus
    }));

    try {
      const response = await fetch(`${API_BASE}/update-application-status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationId,
          status: newStatus,
          recruiter_id: user.id
        })
      });

      const data = await response.json();
      if (!data.success) {
        alert("Failed to update status");
        setStatusUpdates(prev => ({
          ...prev,
          [applicationId]: applications.find(app => app.application_id === applicationId)?.status
        }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // 🔹 Handle Rank Candidates
  const handleRankCandidates = async () => {
    if (!selectedJobForRanking) {
      setRankingError("Please select a job to rank candidates");
      return;
    }

    setRankingLoading(true);
    setRankingError("");
    
    try {
      const jobApplications = applications.filter(app => 
        app.job_id?.toString() === selectedJobForRanking.toString()
      );

      if (jobApplications.length === 0) {
        setRankingError("No applications found for this job");
        setRankingLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/rank-resumes.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: selectedJobForRanking,
          applications: jobApplications
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRankings(data.rankings || []);
      } else {
        setRankingError(data.message || "Failed to rank resumes");
      }
    } catch (err) {
      console.error(err);
      setRankingError("Server error");
    } finally {
      setRankingLoading(false);
    }
  };

  // 🔹 Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'reviewed': return 'status-reviewed';
      case 'shortlisted': return 'status-shortlisted';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  // 🔹 Get score badge style
  const getScoreBadge = (score) => {
    if (score >= 0.7) return { text: 'Excellent Match', className: 'score-excellent' };
    if (score >= 0.5) return { text: 'Good Match', className: 'score-good' };
    return { text: 'Fair Match', className: 'score-fair' };
  };

  // 🔹 Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🔹 Download resume from rankings
  const downloadRankedResume = (filename) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!filename) {
      alert("No resume available for download");
      return;
    }
    window.open(`${API_BASE}/download-resume.php?filename=${filename}&recruiter_id=${user.id}`, '_blank');
  };

  return (
    <>
      <header className="dashboard-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>Recruiter Dashboard</h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
            Manage job postings and review candidate applications
          </p>
        </div>
        <div className="dashboard-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            onClick={() => setShowRanking(false)}
            className={`tab-btn ${!showRanking ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setShowRanking(true)}
            className={`tab-btn ${showRanking ? 'active' : ''}`}
          >
            🏆 Rank Candidates
          </button>
          <ProfileIcon />
        </div>
      </header>

      {!showRanking ? (
        <main className="container">
          {/* Left Column: Post Job Form */}
          <section className="card">
            <h2>📝 Post New Job</h2>

            <form onSubmit={handlePostJob} className="job-form">
              <label><strong>Job Title</strong></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Senior Frontend Developer"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  margin: '0.5rem 0 1rem 0',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />

              <label><strong>Job Description</strong></label>
              <textarea
                rows="6"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe the job responsibilities, requirements, and benefits..."
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  margin: '0.5rem 0 1rem 0',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              ></textarea>

              <div className="button-group">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn primary"
                  style={{ padding: '0.8rem 2rem' }}
                >
                  {loading ? "Posting..." : "Post Job"}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setTitle(""); setDescription(""); }}
                  className="btn outline"
                >
                  Clear Form
                </button>
              </div>
            </form>

            <div className="feature-grid">
              <div className="feature-box">
                <h3>📊 Analytics</h3>
                <p>Track application metrics</p>
              </div>
              <div className="feature-box">
                <h3>🔍 Search</h3>
                <p>Find ideal candidates</p>
              </div>
              <div className="feature-box">
                <h3>📧 Notify</h3>
                <p>Send updates to candidates</p>
              </div>
              <div className="feature-box">
                <h3>📄 Templates</h3>
                <p>Use job description templates</p>
              </div>
            </div>
          </section>

          {/* Right Column: Applications */}
          <section className="card">
            <h2>👥 Applied Candidates ({applications.length})</h2>

            {applications.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: '#6b7280' 
              }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                  No applications yet.
                </p>
                <p>Applications will appear here when candidates apply to your jobs.</p>
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {applications.map((app) => (
                  <div key={app.application_id} className="application-card">
                    <div className="application-header">
                      <div>
                        <div className="candidate-name">{app.candidate_name || 'Unknown Candidate'}</div>
                        <span className={`application-status ${getStatusClass(app.status)}`}>
                          {app.status?.charAt(0).toUpperCase() + app.status?.slice(1) || 'Pending'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                        {formatDate(app.applied_at)}
                      </div>
                    </div>

                    <div className="application-details">
                      <div><strong>Email:</strong> {app.candidate_email || 'N/A'}</div>
                      <div><strong>Job:</strong> {app.job_title || 'N/A'}</div>
                    </div>

                    <div className="resume-section">
                      <strong>Resume:</strong>
                      {app.resume_filename ? (
                        <div style={{ marginTop: '0.5rem' }}>
                          <button 
                            onClick={() => handleViewResume(app)}
                            className="btn-resume btn-view"
                          >
                            👁️ View Resume
                          </button>
                          <button 
                            onClick={() => handleDownloadResume(app)}
                            className="btn-resume btn-download"
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      ) : (
                        <span className="no-resume"> No resume uploaded</span>
                      )}
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <label><strong>Update Status:</strong></label>
                      <select
                        value={statusUpdates[app.application_id] || app.status || 'pending'}
                        onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                        className="status-selector"
                        style={{ marginLeft: '0.5rem' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      ) : (
        <main className="container ranking-view">
          <section className="card ranking-card">
            <h2>🏆 Rank Candidates by Match Score</h2>
            <p className="ranking-subtitle">Select a job to view and rank candidate resumes</p>

            <div className="ranking-section">
              <label className="ranking-label">
                Select Job Posting
              </label>
              
              {recruiterJobs.length === 0 ? (
                <p className="no-jobs">No jobs posted yet</p>
              ) : (
                <>
                  <select
                    value={selectedJobForRanking}
                    onChange={(e) => {
                      setSelectedJobForRanking(e.target.value);
                      setRankings([]);
                      setRankingError("");
                    }}
                    className="job-selector"
                  >
                    <option value="">Select a job</option>
                    {recruiterJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} - {new Date(job.created_at).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  
                  {selectedJobForRanking && (
                    <div className="selected-job-info">
                      <h4>
                        {
                          recruiterJobs.find(j => j.id.toString() === selectedJobForRanking.toString())
                          ?.title || "Selected Job"
                        }
                      </h4>
                      <p>
                        Applications: {
                          applications.filter(app => 
                            app.job_id?.toString() === selectedJobForRanking.toString()
                          ).length
                        } candidates
                      </p>
                    </div>
                  )}
                </>
              )}

              {rankingError && (
                <div className="ranking-error">
                  {rankingError}
                </div>
              )}
            </div>

            <button
              onClick={handleRankCandidates}
              disabled={rankingLoading || !selectedJobForRanking}
              className="rank-button"
            >
              {rankingLoading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing Resumes...
                </>
              ) : (
                <>
                  <span className="rank-icon">📊</span>
                  Rank Candidates
                </>
              )}
            </button>

            {rankings.length > 0 && (
              <div className="rankings-results">
                <h3>Candidate Rankings</h3>

                <div className="rankings-list">
                  {rankings.map((candidate, index) => {
                    const badge = getScoreBadge(candidate.score);
                    return (
                      <div key={index} className={`ranking-item ${index === 0 ? 'top-ranking' : ''}`}>
                        <div className="ranking-header">
                          <div className="rank-number">
                            {index + 1}
                          </div>
                          <div className="candidate-info">
                            <h4>{candidate.candidate_name || `Candidate ${candidate.candidate_id}`}</h4>
                            <span className={`score-badge ${badge.className}`}>
                              {badge.text}
                            </span>
                          </div>
                          <div className="score-display">
                            <div className="score-value">
                              {(candidate.score * 100).toFixed(1)}%
                            </div>
                            <div className="score-label">Match Score</div>
                          </div>
                        </div>

                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${candidate.score * 100}%` }}
                          ></div>
                        </div>

                        <div className="candidate-details">
                          <div className="detail-group">
                            <strong>Resume:</strong>
                            {candidate.resume_filename ? (
                              <button
                                onClick={() => downloadRankedResume(candidate.resume_filename)}
                                className="resume-link"
                              >
                                📄 {candidate.resume_filename}
                              </button>
                            ) : (
                              <span>No resume</span>
                            )}
                          </div>
                          <div className="detail-group">
                            <strong>Applied:</strong>
                            <span>{formatDate(candidate.applied_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="summary-stats">
                  <div className="stat-card excellent">
                    <div className="stat-title">Excellent Matches</div>
                    <div className="stat-value">
                      {rankings.filter(r => r.score >= 0.7).length}
                    </div>
                  </div>
                  <div className="stat-card good">
                    <div className="stat-title">Good Matches</div>
                    <div className="stat-value">
                      {rankings.filter(r => r.score >= 0.5 && r.score < 0.7).length}
                    </div>
                  </div>
                  <div className="stat-card average">
                    <div className="stat-title">Average Score</div>
                    <div className="stat-value">
                      {rankings.length > 0 ? (
                        (rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length * 100).toFixed(1) + '%'
                      ) : '0%'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {resumeModalOpen && selectedResume && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>
                Resume: {selectedResume.candidate_name} - {selectedResume.job_title}
              </h3>
              <button onClick={closeResumeModal} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              {selectedResume.filename && selectedResume.filename.endsWith('.pdf') ? (
                <iframe
                  src={`${API_BASE}/download-resume.php?application_id=${selectedResume.application_id}&recruiter_id=${JSON.parse(localStorage.getItem("user"))?.id}`}
                  title="Resume Preview"
                  className="resume-frame"
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                  <h3>Document Preview</h3>
                  <p>This document type cannot be previewed in browser.</p>
                  <p>Please download to view.</p>
                  <button
                    onClick={() => window.open(`${API_BASE}/download-resume.php?application_id=${selectedResume.application_id}&recruiter_id=${JSON.parse(localStorage.getItem("user"))?.id}`, '_blank')}
                    className="btn primary"
                    style={{ marginTop: '1rem' }}
                  >
                    Download Resume
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="dashboard-footer">
        <p>&copy; 2025 Job Nexus - Recruiter Dashboard</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          {applications.length} total applications • Last updated: {new Date().toLocaleDateString()}
        </p>
      </footer>
    </>
  );
}