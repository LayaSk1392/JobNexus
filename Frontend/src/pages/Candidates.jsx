import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, BarChart3, MessageSquare, Sparkles, Wand2, BookOpen } from "lucide-react";
import SkillGapModal from "./SkillGapModal";
import ProfileIcon from "./ProfileIcon";

export default function Candidates() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userResumes, setUserResumes] = useState([]);
  const [builderResumes, setBuilderResumes] = useState([]);
  const [matchScores, setMatchScores] = useState({});
  const [interviewLoading, setInterviewLoading] = useState({});
  const [matchLoading, setMatchLoading] = useState({});
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedMatchResult, setSelectedMatchResult] = useState(null);
  const [showSkillGapModal, setShowSkillGapModal] = useState(false);
  const [selectedJobForSkillGap, setSelectedJobForSkillGap] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch uploaded resumes (from applications)
  const fetchUserResumes = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(
        `http://localhost/JobNexus/Backend-PHP/api/get-candidate-resumes.php?candidate_id=${user.id}`
      );
      const data = await response.json();
      if (data.success) {
        setUserResumes(data.resumes);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user?.id]);

  // Fetch builder resumes (from resumes table)
  const fetchBuilderResumes = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(
        `http://localhost/JobNexus/Backend-PHP/api/get-resumes.php?user_id=${user.id}`
      );
      const data = await response.json();
      if (data.success) {
        setBuilderResumes(data.resumes);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user?.id]);

  const fetchAppliedJobs = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(
        `http://localhost/JobNexus/Backend-PHP/api/get-applied-jobs.php?candidate_id=${user.id}`
      );
      const data = await response.json();
      if (data.success) {
        setAppliedJobs(data.applications);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user?.id]);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch("http://localhost/JobNexus/Backend-PHP/api/get-jobs.php");
      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Jobs
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Fetch user-specific data
  useEffect(() => {
    if (user?.id) {
      fetchUserResumes();
      fetchAppliedJobs();
      fetchBuilderResumes();
    }
  }, [user?.id, fetchUserResumes, fetchAppliedJobs, fetchBuilderResumes]);

  // Open Upload Modal
  const openUploadModal = (job) => {
    if (!user || user.role !== "candidate") {
      alert("Please login as candidate");
      return;
    }
    if (appliedJobs.some(app => app.job_id === job.id)) {
      alert("You have already applied for this job");
      return;
    }
    setSelectedJob(job);
    setResumeFile(null);
    setShowUploadModal(true);
  };

  // Open Skill Gap Modal
  const openSkillGapModal = (job) => {
    if (!user || user.role !== "candidate") {
      alert("Please login as candidate");
      return;
    }
    
    // Check if applied
    if (!hasApplied(job.id)) {
      alert("Please apply for this job first to access skill gap analysis");
      return;
    }
    
    setSelectedJobForSkillGap(job);
    setShowSkillGapModal(true);
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf" || file.type === "application/msword" || 
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
          file.type === "text/plain") {
        setResumeFile(file);
      } else {
        alert("Please upload a PDF, DOC, DOCX, or TXT file");
      }
    }
  };

  // Apply to Job with Resume
  const handleApplyWithResume = async () => {
    if (!resumeFile) {
      alert("Please upload a resume");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("job_id", selectedJob.id);
    formData.append("candidate_id", user.id);
    formData.append("resume", resumeFile);

    try {
      const response = await fetch(
        "http://localhost/JobNexus/Backend-PHP/api/apply-job.php",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.success) {
        alert("Applied successfully!");
        setShowUploadModal(false);
        fetchAppliedJobs();
        fetchUserResumes();
      } else {
        alert(data.message || "Application failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setUploading(false);
    }
  };

  // Function to calculate match score (available BEFORE applying)
  const calculateMatchScore = async (jobId, resumeType = "latest") => {
    setMatchLoading(prev => ({ ...prev, [jobId]: true }));
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      // Check if user has any resumes
      if (builderResumes.length === 0 && userResumes.length === 0) {
        alert("Please create or upload a resume first to calculate match score");
        setMatchLoading(prev => ({ ...prev, [jobId]: false }));
        return;
      }

      const formData = new FormData();
      formData.append("candidate_id", user.id);
      formData.append("resume_type", resumeType);

      const response = await fetch(
        `http://localhost:8000/api/match-score-with-existing/${jobId}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.success) {
        setMatchScores(prev => ({ ...prev, [jobId]: data }));
        // Show detailed match modal
        setSelectedMatchResult(data);
        setShowMatchModal(true);
      } else {
        alert("Failed to calculate match score: " + data.message);
      }
    } catch (error) {
      console.error("Match score error:", error);
      alert("Error calculating match score");
    } finally {
      setMatchLoading(prev => ({ ...prev, [jobId]: false }));
    }
  };

  // Function to start interview prep (available AFTER applying)
  const startInterviewPrep = async (jobId) => {
    // Check if user has applied for this job
    if (!hasApplied(jobId)) {
      alert("Please apply for this job first to access interview preparation");
      return;
    }
    setInterviewLoading(prev => ({ ...prev, [jobId]: true }));
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();
      formData.append("candidate_id", user.id);
      const response = await fetch(
        `http://localhost:8000/api/interview-prep/${jobId}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.success) {
        // Navigate to interview prep page with questions
        navigate("/interview-prep", {
          state: {
            questions: data.questions,
            jobId: jobId,
            jobTitle: data.job_title
          }
        });
      } else {
        alert("Failed to start interview prep: " + data.message);
      }
    } catch (error) {
      console.error("Interview prep error:", error);
      alert("Error starting interview prep");
    } finally {
      setInterviewLoading(prev => ({ ...prev, [jobId]: false }));
    };
  };

  // Check if already applied
  const hasApplied = (jobId) => {
    return appliedJobs.some(app => app.job_id === jobId);
  };

  // Navigate to Match Score page (standalone)
  const navigateToMatchScore = () => {
    navigate("/match-score");
  };

  // Navigate to Interview Prep page (standalone)
  const navigateToInterviewPrep = () => {
    navigate("/interview-prep");
  };

  return (
    <>
      <div style={{ 
        padding: "20px", 
        maxWidth: "1800px", 
        margin: "0 auto",
        minHeight: "100vh",
        backgroundColor: "#f9fafb"
      }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
              Candidate Dashboard
            </h1>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>
              Find and apply to your dream job
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <ProfileIcon />
          </div>
        </div>

        {/* THREE COLUMN HORIZONTAL LAYOUT */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr", // Three columns: Resumes | Jobs | Analysis Tools
          gap: "24px",
          alignItems: "start"
        }}>
          {/* COLUMN 1: My Resumes Section */}
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "12px", 
            padding: "24px", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            height: "calc(100vh - 180px)",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ 
                fontSize: "20px", 
                fontWeight: "500", 
                color: "#1f2937", 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                marginBottom: "16px"
              }}>
                <FileText size={20} />
                My Resumes
              </h2>
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <button
                  onClick={() => navigate("/upload-resume")}
                  style={{ 
                    flex: 1,
                    padding: "10px", 
                    backgroundColor: "#4f46e5", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: "6px", 
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "14px",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#4338ca"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4f46e5"}
                >
                  Upload
                </button>
                <button
                  onClick={() => navigate("/resume-builder")}
                  style={{ 
                    flex: 1,
                    padding: "10px", 
                    backgroundColor: "#7c3aed", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: "6px", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    gap: "8px",
                    fontWeight: "500",
                    fontSize: "14px",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#6d28d9"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#7c3aed"}
                >
                  <Wand2 size={16} />
                  Create
                </button>
              </div>
            </div>

            {/* Resumes List */}
            <div style={{ 
              flex: 1,
              overflowY: "auto",
              paddingRight: "8px"
            }}>
              {builderResumes.length === 0 && userResumes.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "40px 20px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  border: "2px dashed #d1d5db"
                }}>
                  <FileText size={48} color="#9ca3af" style={{ marginBottom: "16px" }} />
                  <p style={{ color: "#6b7280", marginBottom: "16px", fontSize: "14px" }}>
                    No resumes yet
                  </p>
                  <p style={{ color: "#9ca3af", fontSize: "12px" }}>
                    Upload or create your first resume
                  </p>
                </div>
              ) : (
                <>
                  {/* Builder Resumes */}
                  {builderResumes.map((resume) => (
                    <div key={resume.id} style={{ 
                      border: "1px solid #e5e7eb", 
                      borderRadius: "8px", 
                      padding: "16px", 
                      marginBottom: "12px",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = "#d1d5db"}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontWeight: "600", marginBottom: "4px", fontSize: "15px", color: "#111827" }}>
                            {resume.title.length > 25 ? `${resume.title.substring(0, 25)}...` : resume.title}
                          </h3>
                          <p style={{ color: "#6b7280", fontSize: "12px" }}>
                            {new Date(resume.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => navigate('/resume-preview', { state: { resumeData: resume } })}
                            style={{ 
                              color: "#10b981", 
                              background: "none", 
                              border: "none", 
                              cursor: "pointer", 
                              fontSize: "12px",
                              fontWeight: "500",
                              padding: "4px 8px",
                              borderRadius: "4px"
                            }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Uploaded Resumes */}
                  {userResumes.length > 0 && (
                    <>
                      <h3 style={{ fontSize: "14px", fontWeight: "500", marginTop: "20px", marginBottom: "12px", color: "#4b5563" }}>
                        Uploaded
                      </h3>
                      {userResumes.slice(0, 3).map((resume, index) => (
                        <div key={index} style={{ 
                          border: "1px solid #e5e7eb", 
                          borderRadius: "8px", 
                          padding: "12px", 
                          marginBottom: "8px",
                          fontSize: "13px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: "500", color: "#111827", fontSize: "13px" }}>
                                {resume.resume_filename.length > 20 ? `${resume.resume_filename.substring(0, 20)}...` : resume.resume_filename}
                              </p>
                              <p style={{ color: "#6b7280", fontSize: "11px" }}>
                                {new Date(resume.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* COLUMN 2: Job Listings Section (WIDEST COLUMN) */}
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "12px", 
            padding: "24px", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            height: "calc(100vh - 180px)",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ 
                fontSize: "20px", 
                fontWeight: "500", 
                color: "#1f2937",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <FileText size={20} />
                Available Jobs
                {!loading && (
                  <span style={{ 
                    fontSize: "14px", 
                    backgroundColor: "#e5e7eb", 
                    color: "#4b5563", 
                    padding: "2px 8px", 
                    borderRadius: "12px",
                    fontWeight: "500"
                  }}>
                    {jobs.length}
                  </span>
                )}
              </h2>
              <button
                onClick={fetchJobs}
                style={{ 
                  padding: "8px 16px", 
                  backgroundColor: "#f3f4f6", 
                  color: "#4b5563", 
                  border: "none", 
                  borderRadius: "6px", 
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                ↻ Refresh
              </button>
            </div>

            {/* Jobs List */}
            <div style={{ 
              flex: 1,
              overflowY: "auto",
              paddingRight: "8px"
            }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div className="spinner" style={{
                    width: "48px",
                    height: "48px",
                    border: "4px solid #e5e7eb",
                    borderTopColor: "#4f46e5",
                    borderRadius: "50%",
                    margin: "0 auto 16px",
                    animation: "spin 1s linear infinite"
                  }} />
                  <p style={{ color: "#6b7280" }}>Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "40px 20px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  border: "2px dashed #d1d5db"
                }}>
                  <FileText size={48} color="#9ca3af" style={{ marginBottom: "16px" }} />
                  <h3 style={{ fontSize: "16px", fontWeight: "500", color: "#4b5563", marginBottom: "8px" }}>
                    No jobs available
                  </h3>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                    Check back later for new openings
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {jobs.map((job) => {
                    const hasAppliedToJob = hasApplied(job.id);
                    const jobMatchScore = matchScores[job.id];
                    return (
                      <div key={job.id} style={{ 
                        border: "1px solid #e5e7eb", 
                        borderRadius: "10px", 
                        padding: "18px",
                        transition: "all 0.2s",
                        backgroundColor: hasAppliedToJob ? "#f0f9ff" : "white"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.1)"}
                      onMouseOut={(e) => e.currentTarget.style.boxShadow = "none"}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: "17px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                              {job.title}
                            </h3>
                            <p style={{ color: "#6b7280", fontSize: "13px" }}>
                              {job.recruiter_email}
                            </p>
                          </div>
                          {hasAppliedToJob && (
                            <div style={{ 
                              backgroundColor: "#10b981", 
                              color: "white", 
                              padding: "4px 8px", 
                              borderRadius: "12px", 
                              fontSize: "12px", 
                              fontWeight: "500",
                              whiteSpace: "nowrap"
                            }}>
                              ✓ Applied
                            </div>
                          )}
                        </div>
                        
                        <p style={{ 
                          color: "#4b5563", 
                          marginBottom: "16px", 
                          lineHeight: "1.5",
                          fontSize: "14px"
                        }}>
                          {job.description.length > 120 ? `${job.description.substring(0, 120)}...` : job.description}
                        </p>

                        {/* Match Score */}
                        <div style={{ marginBottom: "16px" }}>
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            marginBottom: "8px",
                            fontSize: "13px"
                          }}>
                            <span style={{ fontWeight: "500", color: "#6b7280" }}>Match Score</span>
                            <span style={{ 
                              fontWeight: "600", 
                              color: jobMatchScore?.match_percentage >= 70 ? "#10b981" : 
                                    jobMatchScore?.match_percentage >= 50 ? "#f59e0b" : 
                                    jobMatchScore ? "#ef4444" : "#6b7280"
                            }}>
                              {jobMatchScore ? `${jobMatchScore.match_percentage}%` : "Not scored"}
                            </span>
                          </div>
                          {jobMatchScore && (
                            <div style={{ 
                              width: "100%", 
                              backgroundColor: "#e5e7eb", 
                              height: "4px", 
                              borderRadius: "2px", 
                              overflow: "hidden" 
                            }}>
                              <div style={{ 
                                width: `${jobMatchScore.match_percentage}%`, 
                                height: "100%", 
                                backgroundColor: jobMatchScore.match_percentage >= 70 ? "#10b981" : 
                                              jobMatchScore.match_percentage >= 50 ? "#f59e0b" : "#ef4444"
                              }} />
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              calculateMatchScore(job.id);
                            }}
                            disabled={matchLoading[job.id]}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#4f46e5",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: matchLoading[job.id] ? "not-allowed" : "pointer",
                              fontSize: "13px",
                              fontWeight: "500",
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px"
                            }}
                          >
                            <BarChart3 size={14} />
                            {matchLoading[job.id] ? "..." : "Score"}
                          </button>

                          {hasAppliedToJob && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  startInterviewPrep(job.id);
                                }}
                                disabled={interviewLoading[job.id]}
                                style={{
                                  padding: "8px 12px",
                                  backgroundColor: "#8b5cf6",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: interviewLoading[job.id] ? "not-allowed" : "pointer",
                                  fontSize: "13px",
                                  fontWeight: "500",
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px"
                                }}
                              >
                                <MessageSquare size={14} />
                                {interviewLoading[job.id] ? "..." : "Interview"}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  openSkillGapModal(job);
                                }}
                                style={{
                                  padding: "8px 12px",
                                  backgroundColor: "#10b981",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  fontWeight: "500",
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px"
                                }}
                              >
                                <BookOpen size={14} />
                                Skills
                              </button>
                            </>
                          )}
                        </div>

                        {/* Apply Button */}
                        <button
                          onClick={() => openUploadModal(job)}
                          disabled={hasAppliedToJob}
                          style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: hasAppliedToJob ? "#d1d5db" : "#4f46e5",
                            color: hasAppliedToJob ? "#6b7280" : "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: hasAppliedToJob ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            fontSize: "14px"
                          }}
                        >
                          {hasAppliedToJob ? "✓ Applied" : "Apply Now"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: Analysis Tools Section */}
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "12px", 
            padding: "24px", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            height: "calc(100vh - 180px)",
            display: "flex",
            flexDirection: "column"
          }}>
            <h2 style={{ 
              fontSize: "20px", 
              fontWeight: "500", 
              color: "#1f2937", 
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <Sparkles size={20} />
              Analysis Tools
            </h2>

            <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Advanced Match Score Card */}
                <div style={{ 
                  backgroundColor: "#f8fafc", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "10px", 
                  padding: "20px",
                  transition: "all 0.2s",
                  cursor: "pointer"
                }}
                onClick={navigateToMatchScore}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
                >
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    backgroundColor: "#eef2ff",
                    color: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px"
                  }}>
                    <BarChart3 size={24} />
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                    Advanced Match Score
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
                    Get detailed analysis of your resume against job descriptions
                  </p>
                  <div style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "6px",
                    color: "#4f46e5",
                    fontWeight: "500",
                    fontSize: "14px"
                  }}>
                    Try it now →
                  </div>
                </div>

                {/* Interview Prep Card */}
                <div style={{ 
                  backgroundColor: "#f8fafc", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "10px", 
                  padding: "20px",
                  transition: "all 0.2s",
                  cursor: "pointer"
                }}
                onClick={navigateToInterviewPrep}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
                >
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    backgroundColor: "#f3e8ff",
                    color: "#8b5cf6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px"
                  }}>
                    <MessageSquare size={24} />
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                    AI Interview Prep
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
                    Practice with AI-generated interview questions
                  </p>
                  <div style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "6px",
                    color: "#8b5cf6",
                    fontWeight: "500",
                    fontSize: "14px"
                  }}>
                    Start practicing →
                  </div>
                </div>

                {/* Skill Gap Analysis Card */}
                <div style={{ 
                  backgroundColor: "#f8fafc", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "10px", 
                  padding: "20px",
                  transition: "all 0.2s"
                }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    backgroundColor: "#f0fdf4",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px"
                  }}>
                    <BookOpen size={24} />
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                    Skill Gap Analysis
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "12px" }}>
                    <strong>How to use:</strong>
                  </p>
                  <ol style={{ 
                    fontSize: "13px", 
                    color: "#6b7280", 
                    paddingLeft: "20px",
                    marginBottom: "16px",
                    lineHeight: "1.6"
                  }}>
                    <li>Apply to a job first</li>
                    <li>Click "Skills" button on job card</li>
                    <li>See missing skills & course recommendations</li>
                  </ol>
                  <div style={{ 
                    backgroundColor: "#fef3c7",
                    border: "1px solid #fbbf24",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "13px",
                    color: "#92400e"
                  }}>
                    💡 <strong>Tip:</strong> Complete skill gaps to improve your match score!
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: "20px",
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e5e7eb"
            }}>
              <p style={{ 
                fontSize: "13px", 
                color: "#6b7280",
                textAlign: "center",
                fontStyle: "italic"
              }}>
                Use these tools to improve your job applications
              </p>
            </div>
          </div>
        </div>

        {/* Upload Resume Modal */}
        {showUploadModal && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", width: "90%", maxWidth: "500px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
                  Upload Resume for {selectedJob?.title}
                </h3>
                <button onClick={() => setShowUploadModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Resume File</label>
                <div style={{ border: "2px dashed #d1d5db", borderRadius: "8px", padding: "32px", textAlign: "center" }}>
                  <Upload size={40} style={{ color: "#9ca3af", marginBottom: "12px", margin: "0 auto" }} />
                  <p style={{ color: "#6b7280", marginBottom: "8px" }}>
                    Click to upload resume
                  </p>
                  <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                    PDF, DOC, DOCX, or TXT files only
                  </p>
                  <input type="file" onChange={handleFileChange} style={{ display: "none" }} id="resume-upload" />
                  <button
                    onClick={() => document.getElementById('resume-upload').click()}
                    style={{ marginTop: "16px", padding: "8px 16px", backgroundColor: "#f3f4f6", border: "none", borderRadius: "4px", cursor: "pointer", color: "#4b5563" }}
                  >
                    Browse Files
                  </button>
                </div>
                {resumeFile && (
                  <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f0f9ff", borderRadius: "6px", border: "1px solid #7dd3fc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "500" }}>{resumeFile.name}</span>
                      <button onClick={() => setResumeFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleApplyWithResume}
                disabled={uploading || !resumeFile}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  backgroundColor: uploading || !resumeFile ? "#9ca3af" : "#4f46e5", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "6px", 
                  cursor: uploading || !resumeFile ? "not-allowed" : "pointer", 
                  fontWeight: "500",
                  fontSize: "16px"
                }}
              >
                {uploading ? "Applying..." : "Submit Application"}
              </button>
            </div>
          </div>
        )}

        {/* Match Score Modal */}
       
{showMatchModal && selectedMatchResult && (
  <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", width: "90%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
          Match Score Analysis
        </h3>
        <button onClick={() => setShowMatchModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
          <X size={20} />
        </button>
      </div>
      
      {/* Score Header */}
      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
          {selectedMatchResult.job_title || "Job"}
        </h4>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ 
            fontSize: "48px", 
            fontWeight: "700", 
            marginBottom: "8px", 
            color: selectedMatchResult.match_percentage >= 70 ? "#10b981" : 
                  selectedMatchResult.match_percentage >= 50 ? "#f59e0b" : "#ef4444" 
          }}>
            {selectedMatchResult.match_percentage}%
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>Match Score</div>
          <div style={{ width: "100%", height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px", marginTop: "12px", overflow: "hidden" }}>
            <div style={{ 
              width: `${selectedMatchResult.match_percentage}%`, 
              height: "100%", 
              backgroundColor: selectedMatchResult.match_percentage >= 70 ? "#10b981" : 
                            selectedMatchResult.match_percentage >= 50 ? "#f59e0b" : "#ef4444",
              transition: "width 0.5s"
            }} />
          </div>
          
          {/* Score Interpretation */}
          {selectedMatchResult.reasoning?.score_interpretation && (
            <div style={{ 
              marginTop: "12px", 
              padding: "8px 12px", 
              backgroundColor: "#f0f9ff", 
              borderRadius: "6px",
              display: "inline-block"
            }}>
              <span style={{ 
                fontSize: "14px", 
                fontWeight: "500", 
                color: selectedMatchResult.match_percentage >= 70 ? "#0d9488" : 
                      selectedMatchResult.match_percentage >= 50 ? "#d97706" : "#dc2626"
              }}>
                {selectedMatchResult.reasoning.score_interpretation}
              </span>
            </div>
          )}
        </div>
        
        {/* Detected Skills */}
        {selectedMatchResult.detected_skills && selectedMatchResult.detected_skills.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h5 style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
              Detected Skills:
            </h5>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {selectedMatchResult.detected_skills.map((skill, idx) => (
                <span key={idx} style={{ backgroundColor: "#e0e7ff", color: "#4f46e5", padding: "4px 8px", borderRadius: "4px", fontSize: "0.875rem" }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* REASONING SECTION */}
        {selectedMatchResult.reasoning && (
          <div style={{ marginBottom: "24px" }}>
            <h5 style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              marginBottom: "16px", 
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <Sparkles size={16} />
              AI Match Analysis
              {selectedMatchResult.reasoning.source && (
                <span style={{ 
                  fontSize: "12px", 
                  backgroundColor: selectedMatchResult.reasoning.source === "AI Analysis" ? "#dbeafe" : "#f3f4f6",
                  color: selectedMatchResult.reasoning.source === "AI Analysis" ? "#1e40af" : "#6b7280",
                  padding: "2px 8px", 
                  borderRadius: "12px",
                  fontWeight: "500"
                }}>
                  {selectedMatchResult.reasoning.source}
                </span>
              )}
            </h5>
            
            <div style={{ display: "grid", gap: "16px" }}>
              {/* Score Explanation */}
              {selectedMatchResult.reasoning.score_explanation && (
                <div style={{ 
                  backgroundColor: "#f8fafc", 
                  padding: "16px", 
                  borderRadius: "8px",
                  borderLeft: "3px solid #3b82f6"
                }}>
                  <h6 style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#1e40af" }}>
                    📊 Score Explanation
                  </h6>
                  <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.5" }}>
                    {selectedMatchResult.reasoning.score_explanation}
                  </p>
                </div>
              )}
              
              {/* Two-column layout for strengths and gaps */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Strengths */}
                <div style={{ 
                  backgroundColor: "#f0fdf4", 
                  padding: "16px", 
                  borderRadius: "8px",
                  borderLeft: "3px solid #10b981"
                }}>
                  <h6 style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#065f46", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#10b981" }}>✓</span> Strengths
                  </h6>
                  {Array.isArray(selectedMatchResult.reasoning.strengths) ? (
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      {selectedMatchResult.reasoning.strengths.map((strength, idx) => (
                        <li key={idx} style={{ color: "#065f46", fontSize: "14px", marginBottom: "6px", lineHeight: "1.4" }}>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "#065f46", fontSize: "14px", lineHeight: "1.5" }}>
                      {selectedMatchResult.reasoning.strengths || "No strengths identified."}
                    </p>
                  )}
                </div>
                
                {/* Gaps */}
                <div style={{ 
                  backgroundColor: "#fef3c7", 
                  padding: "16px", 
                  borderRadius: "8px",
                  borderLeft: "3px solid #f59e0b"
                }}>
                  <h6 style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#f59e0b" }}>⚠</span> Areas to Improve
                  </h6>
                  {Array.isArray(selectedMatchResult.reasoning.gaps) ? (
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      {selectedMatchResult.reasoning.gaps.map((gap, idx) => (
                        <li key={idx} style={{ color: "#92400e", fontSize: "14px", marginBottom: "6px", lineHeight: "1.4" }}>
                          {gap}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "#92400e", fontSize: "14px", lineHeight: "1.5" }}>
                      {selectedMatchResult.reasoning.gaps || "No major gaps identified."}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Suggestions */}
              {selectedMatchResult.reasoning.suggestions && (
                <div style={{ 
                  backgroundColor: "#eff6ff", 
                  padding: "16px", 
                  borderRadius: "8px",
                  borderLeft: "3px solid #60a5fa"
                }}>
                  <h6 style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#1e40af", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#3b82f6" }}>💡</span> Suggestions
                  </h6>
                  {Array.isArray(selectedMatchResult.reasoning.suggestions) ? (
                    <ul style={{ paddingLeft: "20px", margin: 0 }}>
                      {selectedMatchResult.reasoning.suggestions.map((suggestion, idx) => (
                        <li key={idx} style={{ color: "#1e40af", fontSize: "14px", marginBottom: "6px", lineHeight: "1.4" }}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "#1e40af", fontSize: "14px", lineHeight: "1.5" }}>
                      {selectedMatchResult.reasoning.suggestions}
                    </p>
                  )}
                </div>
              )}
              
              {/* Overall Assessment */}
              {selectedMatchResult.reasoning.overall_assessment && (
                <div style={{ 
                  backgroundColor: "#f5f3ff", 
                  padding: "16px", 
                  borderRadius: "8px",
                  borderLeft: "3px solid #8b5cf6"
                }}>
                  <h6 style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#5b21b6", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#8b5cf6" }}>📝</span> Overall Assessment
                  </h6>
                  <p style={{ color: "#5b21b6", fontSize: "14px", lineHeight: "1.5" }}>
                    {selectedMatchResult.reasoning.overall_assessment}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Recommendation Card */}
        <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "6px", borderLeft: "4px solid #3b82f6", marginBottom: "24px" }}>
          <h5 style={{ fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#3b82f6" }}>🎯</span> Recommendation
          </h5>
          <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.5" }}>
            {selectedMatchResult.recommendation || "No recommendation available."}
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        {hasApplied(selectedMatchResult.job_id) ? (
          <>
            <button
              onClick={() => {
                setShowMatchModal(false);
                startInterviewPrep(selectedMatchResult.job_id);
              }}
              style={{ 
                flex: 1,
                padding: "12px", 
                backgroundColor: "#8b5cf6", 
                color: "white", 
                border: "none", 
                borderRadius: "6px", 
                cursor: "pointer", 
                fontWeight: "500",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <MessageSquare size={16} />
              Start Interview Prep
            </button>
            <button
              onClick={() => openSkillGapModal(jobs.find(j => j.id === selectedMatchResult.job_id))}
              style={{ 
                flex: 1,
                padding: "12px", 
                backgroundColor: "#10b981", 
                color: "white", 
                border: "none", 
                borderRadius: "6px", 
                cursor: "pointer", 
                fontWeight: "500",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <BookOpen size={16} />
              Skill Gap
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              const job = jobs.find(j => j.id === selectedMatchResult.job_id);
              if (job) {
                setShowMatchModal(false);
                openUploadModal(job);
              }
            }}
            style={{ 
              width: "100%",
              padding: "12px", 
              backgroundColor: "#4f46e5", 
              color: "white", 
              border: "none", 
              borderRadius: "6px", 
              cursor: "pointer", 
              fontWeight: "500",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <Upload size={16} />
            Apply for this Job
          </button>
        )}
      </div>
      
      {/* Note about reasoning */}
      {selectedMatchResult.reasoning_success === false && (
        <div style={{ 
          marginTop: "16px", 
          padding: "12px", 
          backgroundColor: "#fef3c7", 
          borderRadius: "6px",
          border: "1px solid #fbbf24"
        }}>
          <p style={{ fontSize: "12px", color: "#92400e", margin: 0, textAlign: "center" }}>
            Note: Using basic analysis. Enable AI analysis in backend for more detailed insights.
          </p>
        </div>
      )}
    </div>
  </div>
)}

        {/* Skill Gap Analysis Modal */}
        {showSkillGapModal && selectedJobForSkillGap && (
          <SkillGapModal
            isOpen={showSkillGapModal}
            onClose={() => setShowSkillGapModal(false)}
            jobId={selectedJobForSkillGap.id}
            jobTitle={selectedJobForSkillGap.title}
            candidateId={user.id}
            matchPercentage={matchScores[selectedJobForSkillGap.id]?.match_percentage || 0}
          />
        )}
      </div>

      {/* Footer */}
      <footer style={{ 
        marginTop: "40px", 
        padding: "20px", 
        textAlign: "center", 
        color: "#6b7280", 
        fontSize: "14px", 
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "white"
      }}>
        <p>© 2025 Job Nexus</p>
      </footer>

      {/* CSS */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
          }
        `}
      </style>
    </>
  );
}