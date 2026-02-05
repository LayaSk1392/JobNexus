import React from "react";
import { Check, Eye } from "lucide-react";

const TemplateStep = ({ data, updateData }) => {
  const templates = [
    {
      id: 1,
      name: "Modern",
      description: "Clean and contemporary design",
      category: "Modern",
      thumbnail: "https://placehold.co/200x280/3b82f6/ffffff?text=Modern",
      premium: false
    },
    {
      id: 2,
      name: "Professional",
      description: "Classic ATS-friendly format",
      category: "Professional",
      thumbnail: "https://placehold.co/200x280/10b981/ffffff?text=Professional",
      premium: false
    },
    {
      id: 3,
      name: "Creative",
      description: "Unique design for creative fields",
      category: "Creative",
      thumbnail: "https://placehold.co/200x280/8b5cf6/ffffff?text=Creative",
      premium: true
    },
    {
      id: 4,
      name: "Minimal",
      description: "Simple and elegant layout",
      category: "Minimal",
      thumbnail: "https://placehold.co/200x280/6b7280/ffffff?text=Minimal",
      premium: false
    },
    {
      id: 5,
      name: "Executive",
      description: "Professional with color accents",
      category: "Executive",
      thumbnail: "https://placehold.co/200x280/f59e0b/ffffff?text=Executive",
      premium: true
    },
    {
      id: 6,
      name: "Academic",
      description: "Ideal for research positions",
      category: "Academic",
      thumbnail: "https://placehold.co/200x280/ef4444/ffffff?text=Academic",
      premium: false
    }
  ];

  const handleSelectTemplate = (templateId) => {
    updateData("selectedTemplate", templateId);
  };

  const handlePreview = (template) => {
    // Open template preview
    alert(`Previewing template: ${template.name}`);
  };

  return (
    <div className="step-container">
      <h2>Choose a Template</h2>
      <p className="step-description">
        Select a template that best fits your industry and style.
      </p>
      
      <div className="template-filters">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">Modern</button>
        <button className="filter-btn">Professional</button>
        <button className="filter-btn">Creative</button>
        <button className="filter-btn">Minimal</button>
      </div>
      
      <div className="templates-grid">
        {templates.map(template => (
          <div 
            key={template.id}
            className={`template-card ${data.selectedTemplate === template.id ? 'selected' : ''}`}
          >
            {template.premium && (
              <div className="premium-badge">Premium</div>
            )}
            
            <img 
              src={template.thumbnail} 
              alt={template.name}
              className="template-thumbnail"
            />
            
            <div className="template-info">
              <h4>{template.name}</h4>
              <p>{template.description}</p>
              
              <div className="template-actions">
                <button 
                  className="preview-btn"
                  onClick={() => handlePreview(template)}
                >
                  <Eye size={16} />
                  Preview
                </button>
                
                <button 
                  className={`select-btn ${data.selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  {data.selectedTemplate === template.id ? (
                    <>
                      <Check size={16} />
                      Selected
                    </>
                  ) : (
                    "Select"
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="selected-template-info">
        {data.selectedTemplate ? (
          <>
            <h3>Selected Template</h3>
            <p>
              You have selected the "{templates.find(t => t.id === data.selectedTemplate)?.name}" template.
              Click "Finish & Save" to create your resume.
            </p>
          </>
        ) : (
          <p className="no-selection">Please select a template to continue.</p>
        )}
      </div>
      
      <style jsx>{`
        .step-container {
          padding: 1rem;
        }
        
        .step-description {
          color: #6b7280;
          margin-bottom: 2rem;
        }
        
        .template-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        .filter-btn {
          padding: 8px 16px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          color: #6b7280;
          cursor: pointer;
          font-size: 14px;
        }
        
        .filter-btn.active {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }
        
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 2rem;
        }
        
        .template-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }
        
        .template-card:hover {
          border-color: #9ca3af;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .template-card.selected {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        
        .premium-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          z-index: 2;
        }
        
        .template-thumbnail {
          width: 100%;
          height: 200px;
          object-fit: cover;
          background: #f3f4f6;
        }
        
        .template-info {
          padding: 1.5rem;
        }
        
        .template-info h4 {
          margin: 0 0 8px 0;
          color: #1f2937;
        }
        
        .template-info p {
          margin: 0 0 1rem 0;
          color: #6b7280;
          font-size: 14px;
        }
        
        .template-actions {
          display: flex;
          gap: 10px;
        }
        
        .preview-btn {
          flex: 1;
          padding: 8px 12px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          color: #4b5563;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        
        .preview-btn:hover {
          background: #e5e7eb;
        }
        
        .select-btn {
          flex: 1;
          padding: 8px 12px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        
        .select-btn:hover {
          background: #4338ca;
        }
        
        .select-btn.selected {
          background: #10b981;
        }
        
        .selected-template-info {
          padding: 1.5rem;
          background: #f0f9ff;
          border-radius: 8px;
          border-left: 4px solid #0ea5e9;
        }
        
        .selected-template-info h3 {
          margin: 0 0 8px 0;
          color: #0369a1;
        }
        
        .no-selection {
          text-align: center;
          color: #9ca3af;
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .templates-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }
        
        @media (max-width: 640px) {
          .templates-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TemplateStep;