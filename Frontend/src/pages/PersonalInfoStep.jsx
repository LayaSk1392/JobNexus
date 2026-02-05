import React from "react";
import { User, Mail, Phone, MapPin, Linkedin, Link, FileText } from "lucide-react";

const PersonalInfoStep = ({ data, updateData }) => {
  const personalInfo = data.personalInfo || {};

  const handleChange = (e) => {
    updateData("personalInfo", {
      ...personalInfo,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="step-container">
      <h2>Personal Information</h2>
      <p className="step-description">
        Enter your basic information. This will appear at the top of your resume.
      </p>
      
      <div className="form-grid">
        <div className="form-group">
          <label>
            <User size={16} />
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={personalInfo.firstName || ""}
            onChange={handleChange}
            placeholder="John"
            required
          />
        </div>
        
        <div className="form-group">
          <label>
            <User size={16} />
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={personalInfo.lastName || ""}
            onChange={handleChange}
            placeholder="Doe"
            required
          />
        </div>
        
        <div className="form-group">
          <label>
            <Mail size={16} />
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={personalInfo.email || ""}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label>
            <Phone size={16} />
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={personalInfo.phone || ""}
            onChange={handleChange}
            placeholder="(123) 456-7890"
            required
          />
        </div>
        
        <div className="form-group full-width">
          <label>
            <MapPin size={16} />
            Address
          </label>
          <input
            type="text"
            name="address"
            value={personalInfo.address || ""}
            onChange={handleChange}
            placeholder="City, State, Country"
          />
        </div>
        
        <div className="form-group">
          <label>
            <Linkedin size={16} />
            LinkedIn Profile
          </label>
          <input
            type="url"
            name="linkedIn"
            value={personalInfo.linkedIn || ""}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        
        <div className="form-group">
          <label>
            <Link size={16} />
            Portfolio Website
          </label>
          <input
            type="url"
            name="portfolio"
            value={personalInfo.portfolio || ""}
            onChange={handleChange}
            placeholder="https://yourportfolio.com"
          />
        </div>
        
        <div className="form-group full-width">
          <label>
            <FileText size={16} />
            Professional Summary *
          </label>
          <textarea
            name="summary"
            value={personalInfo.summary || ""}
            onChange={handleChange}
            placeholder="Experienced professional with 5+ years in..."
            rows={4}
            required
          />
          <small className="helper-text">
            Write 2-3 sentences highlighting your key achievements and career goals.
          </small>
        </div>
      </div>
      
      <style jsx>{`
        .step-container {
          padding: 1rem;
        }
        
        .step-description {
          color: #6b7280;
          margin-bottom: 2rem;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        .form-group.full-width {
          grid-column: span 2;
        }
        
        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #374151;
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .helper-text {
          display: block;
          margin-top: 4px;
          color: #9ca3af;
          font-size: 12px;
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .form-group.full-width {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PersonalInfoStep;