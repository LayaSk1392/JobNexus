import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Printer } from 'lucide-react';

export default function ResumePreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const resumeData = location.state?.resumeData;

  if (!resumeData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No resume data found</p>
        <button onClick={() => navigate('/candidate')}>Go Back</button>
      </div>
    );
  }

  const { resume_data, title } = resumeData;
  const { personalInfo, experience, education, skills, settings } = resume_data;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Use browser's print dialog with "Save as PDF"
    window.print();
  };

  return (
    <>
      {/* Action Bar - Hidden when printing */}
      <div className="action-bar no-print">
        <button onClick={() => navigate('/candidate')} className="btn-back">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn-action">
            <Printer size={20} />
            Print
          </button>
          <button onClick={handleDownloadPDF} className="btn-action btn-primary">
            <Download size={20} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="resume-container" id="resume-content">
        <div className="resume-paper">
          {/* Header */}
          <header className="resume-header">
            <h1 className="name">
              {personalInfo?.firstName} {personalInfo?.lastName}
            </h1>
            {personalInfo?.email && (
              <div className="contact-info">
                <span>{personalInfo.email}</span>
                {personalInfo?.phone && <span> • {personalInfo.phone}</span>}
                {personalInfo?.address && <span> • {personalInfo.address}</span>}
              </div>
            )}
            {(personalInfo?.linkedIn || personalInfo?.portfolio) && (
              <div className="contact-info">
                {personalInfo?.linkedIn && <span>{personalInfo.linkedIn}</span>}
                {personalInfo?.linkedIn && personalInfo?.portfolio && <span> • </span>}
                {personalInfo?.portfolio && <span>{personalInfo.portfolio}</span>}
              </div>
            )}
          </header>

          {/* Summary */}
          {personalInfo?.summary && (
            <section className="resume-section">
              <h2 className="section-title">Professional Summary</h2>
              <p className="summary">{personalInfo.summary}</p>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">Work Experience</h2>
              {experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-header">
                    <h3 className="job-title">{exp.position}</h3>
                    <span className="date-range">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="company-name">{exp.company}</div>
                  {exp.description && (
                    <p className="description">{exp.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">Education</h2>
              {education.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="education-header">
                    <h3 className="degree">{edu.degree}</h3>
                    <span className="date-range">
                      {edu.startDate} - {edu.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="institution">{edu.institution}</div>
                  {edu.gpa && <div className="gpa">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">Skills</h2>
              <div className="skills-container">
                {skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: ${settings?.font || 'Arial'}, sans-serif;
          background-color: #f3f4f6;
        }

        .action-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          z-index: 100;
        }

        .btn-back, .btn-action {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-back:hover, .btn-action:hover {
          background: #f9fafb;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }

        .btn-primary:hover {
          background: #4338ca;
        }

        .resume-container {
          padding: 100px 2rem 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .resume-paper {
          background: white;
          padding: 60px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          min-height: 11in;
        }

        .resume-header {
          text-align: center;
          border-bottom: 2px solid ${settings?.color || '#2563eb'};
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .name {
          font-size: 36px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .contact-info {
          font-size: 14px;
          color: #6b7280;
          margin-top: 8px;
        }

        .resume-section {
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: ${settings?.color || '#2563eb'};
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .summary {
          font-size: 15px;
          line-height: 1.6;
          color: #374151;
        }

        .experience-item, .education-item {
          margin-bottom: 20px;
        }

        .experience-header, .education-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 5px;
        }

        .job-title, .degree {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .date-range {
          font-size: 14px;
          color: #6b7280;
          font-style: italic;
        }

        .company-name, .institution {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 8px;
        }

        .gpa {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }

        .description {
          font-size: 15px;
          line-height: 1.6;
          color: #374151;
          margin-top: 8px;
        }

        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .skill-tag {
          padding: 6px 16px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          font-size: 14px;
          color: #374151;
        }

        /* Print Styles */
        @media print {
          .no-print {
            display: none !important;
          }

          .resume-container {
            padding: 0;
            max-width: 100%;
          }

          .resume-paper {
            box-shadow: none;
            padding: 0.5in;
            min-height: auto;
          }

          body {
            background: white;
          }

          @page {
            margin: 0.5in;
            size: letter;
          }
        }

        @media screen and (max-width: 768px) {
          .resume-paper {
            padding: 30px 20px;
          }

          .name {
            font-size: 28px;
          }

          .experience-header, .education-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .date-range {
            margin-top: 4px;
          }
        }
      `}</style>
    </>
  );
}