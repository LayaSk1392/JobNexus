import React, { useState } from 'react';
import { Upload, FileText, Loader2, XCircle, Award, TrendingUp, User } from 'lucide-react';

// Main Component for Resume Ranking
export default function ResumeRanking() {
  const [resumeFiles, setResumeFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || file.type === 'text/plain'
    );
    
    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Only PDF and TXT files are allowed.');
    } else {
      setError('');
    }
    
    setResumeFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setResumeFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRankResumes = async () => {
    if (resumeFiles.length === 0 || !jobDescription.trim()) {
      setError('Please upload at least one resume and enter a job description');
      return;
    }

    setLoading(true);
    setError('');
    setRankings([]);

    const formData = new FormData();
    resumeFiles.forEach(file => {
      formData.append('resumes', file);
    });
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch('http://localhost:8000/api/rank-candidates', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to rank resumes');
      }

      const data = await response.json();
      setRankings(data.rankings);
    } catch (err) {
      setError(err.message || 'An error occurred while ranking resumes');
    } finally {
      setLoading(false);
    }
  };



  const getScoreBadge = (score) => {
    if (score >= 0.7) return { text: 'Excellent Match', color: 'bg-green-500' };
    if (score >= 0.5) return { text: 'Good Match', color: 'bg-yellow-500' };
    return { text: 'Fair Match', color: 'bg-red-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Rank Candidates by Match Score</h1>
          </div>
          <p className="text-gray-600">Upload multiple resumes and compare them against a job description</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Resume Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Upload Resumes ({resumeFiles.length})
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-indigo-500 transition-colors mb-4">
              <input
                type="file"
                accept=".pdf,.txt"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 text-center">
                  Click to upload multiple resumes
                  <br />
                  <span className="text-xs text-gray-500">(PDF or TXT)</span>
                </span>
              </label>
            </div>

            {/* Uploaded Files List */}
            {resumeFiles.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {resumeFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job Description Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in Python, React, and cloud technologies. Strong problem-solving skills and experience with microservices architecture required."
              className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Rank Button */}
        <button
          onClick={handleRankResumes}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg mb-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Analyzing Resumes...
            </>
          ) : (
            <>
              <TrendingUp className="w-6 h-6" />
              Rank Candidates
            </>
          )}
        </button>

        {/* Rankings Display */}
        {rankings.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Award className="w-7 h-7 text-indigo-600" />
              Candidate Rankings
            </h2>

            <div className="space-y-4">
              {rankings.map((candidate, index) => {
                const badge = getScoreBadge(candidate.similarity_score);
                return (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-6 transition-all hover:shadow-md ${
                      index === 0 ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          index === 2 ? 'bg-orange-300 text-orange-900' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            {candidate.resume_id}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${badge.color} text-white font-medium`}>
                            {badge.text}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600">
                          {(candidate.similarity_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Match Score</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${candidate.similarity_score * 100}%` }}
                      ></div>
                    </div>

                    {/* Skills Display */}
                    {/*candidate.skills && candidate.skills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Skills Detected:</h4>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.slice(0, 8).map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 8 && (
                            <span className="text-xs text-gray-500 self-center">
                              +{candidate.skills.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    )*/}
                  </div>
                );
              })}
            </div>

            {/* Summary Statistics */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-green-700 font-medium">Excellent Matches</div>
                <div className="text-2xl font-bold text-green-600">
                  {rankings.filter(r => r.similarity_score >= 0.7).length}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-sm text-yellow-700 font-medium">Good Matches</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {rankings.filter(r => r.similarity_score >= 0.5 && r.similarity_score < 0.7).length}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 font-medium">Average Score</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(rankings.reduce((sum, r) => sum + r.similarity_score, 0) / rankings.length * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}