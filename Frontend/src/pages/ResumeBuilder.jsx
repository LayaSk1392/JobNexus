import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Save, AlertCircle } from "lucide-react";
import ProfileIcon from "./ProfileIcon";

// Import steps
import PersonalInfoStep from "./PersonalInfoStep";
import ExperienceStep from "./ExperienceStep";
import EducationStep from "./EducationStep";
import SkillsStep from "./SkillsStep";
import TemplateStep from "./TemplateStep";

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [error, setError] = useState("");
  const [tailorSummary, setTailorSummary] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      linkedIn: "",
      portfolio: "",
      summary: ""
    },
    experience: [],
    education: [],
    skills: [],
    selectedTemplate: null,
    settings: {
      font: "Arial",
      color: "#2563eb",
      spacing: "normal"
    }
  });

  const steps = [
    { id: 1, title: "Personal Info", component: PersonalInfoStep },
    { id: 2, title: "Experience", component: ExperienceStep },
    { id: 3, title: "Education", component: EducationStep },
    { id: 4, title: "Skills", component: SkillsStep },
    { id: 5, title: "Template", component: TemplateStep }
  ];

  // Validation function
  const validateCurrentStep = () => {
    setError("");
    
    if (currentStep === 5 && !resumeData.selectedTemplate) {
      setError("Please select a template before continuing");
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - trigger save
      handleSaveResume();
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveResume = async () => {
    // Validate template selection
    if (!resumeData.selectedTemplate) {
      setError("Please select a template before saving your resume");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (!user || !user.id) {
        throw new Error("User not found. Please log in again.");
      }

      console.log("Sending resume data:", {
        user_id: user.id,
        resume_data: resumeData,
        template_id: resumeData.selectedTemplate
      });

      const response = await fetch("http://localhost/JobNexus/Backend-PHP/api/save-resume.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          resume_data: resumeData,
          template_id: resumeData.selectedTemplate
        })
      });

      console.log("Response status:", response.status);

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      // Check content type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned invalid response format");
      }

      const data = await response.json();
      console.log("Server response:", data);

      if (data.success) {
        alert("Resume saved successfully!");
        navigate("/candidates");
      } else {
        throw new Error(data.message || "Failed to save resume");
      }
    } catch (error) {
      console.error("Full error:", error);
      setError(error.message || "Failed to save resume. Please try again.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTailorResume = async () => {
    setError("");
    setTailorSummary("");

    const trimmedJobId = jobId.trim();
    const trimmedJobDescription = jobDescription.trim();

    if (!trimmedJobId && !trimmedJobDescription) {
      setError("Please enter a job ID or paste a job description to tailor your resume.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsTailoring(true);

    try {
      const response = await fetch("http://localhost:8000/api/tailor-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_data: resumeData,
          job_id: trimmedJobId || null,
          job_description: trimmedJobDescription || null,
        }),
      });

      let data = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: false, error: text };
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (!data.success || !data.resume_data) {
        throw new Error(data.message || "Failed to tailor resume");
      }

      setResumeData((prev) => ({
        ...prev,
        ...data.resume_data,
        selectedTemplate: prev.selectedTemplate,
        settings: prev.settings
      }));

      if (data.changes_summary) {
        setTailorSummary(data.changes_summary);
      } else {
        setTailorSummary("Resume tailored successfully.");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Tailor resume error:", err);
      setError(err.message || "Failed to tailor resume. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsTailoring(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="resume-builder">
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>Resume Builder</h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
            Create a professional resume step by step
          </p>
        </div>
        <ProfileIcon />
      </header>

      <div className="builder-container">
        {/* Error Alert */}
        {error && (
          <div className="error-alert">
            <AlertCircle size={20} />
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Tailor Summary */}
        {tailorSummary && (
          <div className="success-alert">
            <div>
              <strong>Tailoring Complete:</strong> {tailorSummary}
            </div>
          </div>
        )}

        {/* Tailor Resume */}
        <div className="tailor-panel">
          <div className="tailor-header">
            <div>
              <h2>Tailor Your Resume</h2>
              <p>Use a job ID, paste a job description, or both to tailor your resume with Gemini.</p>
            </div>
            <button
              onClick={handleTailorResume}
              disabled={isTailoring}
              className="nav-button primary"
            >
              {isTailoring ? "Tailoring..." : "Tailor with Gemini"}
            </button>
          </div>
          <div className="tailor-body">
            <div className="tailor-field">
              <label>Job ID (Optional)</label>
              <input
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="e.g., 123"
              />
              <small>We will fetch the job description from your database.</small>
            </div>
            <div className="tailor-field">
              <label>Job Description (Optional)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
              />
              <small>If you provide both, we will combine them for better tailoring.</small>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          {steps.map((step, index) => (
            <div key={step.id} className="step-container">
              <div className={`step-circle ${currentStep > step.id ? "completed" : currentStep === step.id ? "active" : ""}`}>
                {currentStep > step.id ? "✓" : step.id}
              </div>
              <span className="step-title">{step.title}</span>
              {index < steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="step-content">
          <CurrentStepComponent 
            data={resumeData}
            updateData={(section, data) => {
              setResumeData(prev => ({
                ...prev,
                [section]: data
              }));
              setError(""); // Clear error when user makes changes
            }}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="builder-footer">
          <button 
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className="nav-button secondary"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          
          <div className="action-buttons">
            <button 
              onClick={handleSaveResume}
              disabled={isLoading}
              className="nav-button"
            >
              <Save size={18} />
              {isLoading ? "Saving..." : "Save Draft"}
            </button>
            
            <button 
              onClick={handleNext}
              disabled={isLoading}
              className="nav-button primary"
            >
              {isLoading ? "Saving..." : currentStep === steps.length ? "Finish & Save" : "Next"}
              {currentStep < steps.length && !isLoading && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .resume-builder {
          min-height: 100vh;
          background: #f9fafb;
        }
        
        .builder-container {
          max-width: 1000px;
          margin: 2rem auto;
          padding: 0 20px;
        }
        
        .error-alert {
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-left: 4px solid #dc2626;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #991b1b;
        }

        .success-alert {
          background: #dcfce7;
          border: 1px solid #86efac;
          border-left: 4px solid #16a34a;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #166534;
        }

        .tailor-panel {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
        }

        .tailor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .tailor-header h2 {
          margin: 0 0 0.25rem 0;
          color: #1f2937;
          font-size: 1.25rem;
        }

        .tailor-header p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .tailor-body {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1.5rem;
        }

        .tailor-field label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .tailor-field input,
        .tailor-field textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
        }

        .tailor-field small {
          display: block;
          margin-top: 0.5rem;
          color: #9ca3af;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .tailor-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .tailor-body {
            grid-template-columns: 1fr;
          }
        }
        
        .progress-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          position: relative;
        }
        
        .step-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }
        
        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          background: #e5e7eb;
          color: #6b7280;
          margin-bottom: 8px;
          transition: all 0.3s;
        }
        
        .step-circle.active {
          background: #4f46e5;
          color: white;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2);
        }
        
        .step-circle.completed {
          background: #10b981;
          color: white;
        }
        
        .step-title {
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        
        .step-line {
          position: absolute;
          top: 20px;
          left: 70%;
          right: -70%;
          height: 2px;
          background: #e5e7eb;
          z-index: -1;
        }
        
        .step-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          min-height: 400px;
        }
        
        .builder-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding: 1.5rem 0;
        }
        
        .nav-button {
          padding: 10px 20px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .nav-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }
        
        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .nav-button.primary {
          background: #4f46e5;
          color: white;
          border: none;
        }
        
        .nav-button.primary:hover:not(:disabled) {
          background: #4338ca;
        }
        
        .nav-button.secondary {
          background: #f3f4f6;
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;
