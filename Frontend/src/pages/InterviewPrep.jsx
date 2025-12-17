import React, { useState } from "react";

export default function InterviewPrep() {
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const startInterview = async () => {
    if (!resume || !jd) {
      alert("Please upload both Resume and Job Description PDFs");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jd);

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/start-interview", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend response:", data);

      if (!data.questions || data.questions.length === 0) {
        alert("Failed to generate questions. Please try again.");
        return;
      }

      if (data.questions.length === 1 && data.questions[0].toLowerCase().includes("error")) {
        alert(data.questions[0]);
        return;
      }

      setQuestions(data.questions);
      setInterviewStarted(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setFeedback({});
      
    } catch (err) {
      console.error(err);
      alert("Unable to connect to backend. Make sure the Flask server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (e) => {
    const newAnswers = { ...answers };
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  const evaluateAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];

    if (!currentAnswer || currentAnswer.trim() === "") {
      alert("Please provide an answer before evaluating.");
      return;
    }

    setEvaluating(true);

    try {
      const response = await fetch("http://localhost:5000/evaluate-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          answer: currentAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error(`Evaluation error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Evaluation response:", data);

      const newFeedback = { ...feedback };
      newFeedback[currentQuestionIndex] = data.feedback;
      setFeedback(newFeedback);

    } catch (err) {
      console.error(err);
      alert("Failed to evaluate answer. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const resetInterview = () => {
    setQuestions([]);
    setAnswers({});
    setFeedback({});
    setInterviewStarted(false);
    setCurrentQuestionIndex(0);
    setResume(null);
    setJd(null);
  };

  const calculateOverallScore = () => {
    const scores = Object.values(feedback)
      .filter(f => f && typeof f.score === 'number')
      .map(f => f.score);
    
    if (scores.length === 0) return 0;
    
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  return (
    <div className="interview-prep-container" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>AI Interview Preparation</h2>
      
      {!interviewStarted ? (
        <div className="upload-section" style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h3>Step 1: Upload Documents</h3>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Upload Resume (PDF):
            </label>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setResume(e.target.files[0])}
              style={{ padding: "8px" }}
            />
            {resume && <p style={{ color: "green", marginTop: "5px" }}>✓ {resume.name}</p>}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Upload Job Description (PDF):
            </label>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => setJd(e.target.files[0])}
              style={{ padding: "8px" }}
            />
            {jd && <p style={{ color: "green", marginTop: "5px" }}>✓ {jd.name}</p>}
          </div>

          <button 
            onClick={startInterview} 
            disabled={loading || !resume || !jd}
            style={{
              padding: "12px 24px",
              backgroundColor: loading ? "#ccc" : "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {loading ? "Generating Questions..." : "Start Interview"}
          </button>
        </div>
      ) : (
        <div className="interview-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3>Interview in Progress</h3>
            <button 
              onClick={resetInterview}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Restart Interview
            </button>
          </div>

          {/* Progress indicator */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>Overall Score: {calculateOverallScore()}/10</span>
            </div>
            <div style={{ height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px" }}>
              <div 
                style={{ 
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`, 
                  height: "100%", 
                  backgroundColor: "#4f46e5",
                  borderRadius: "4px",
                  transition: "width 0.3s"
                }}
              ></div>
            </div>
          </div>

          {/* Current Question */}
          <div className="question-card" style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h4 style={{ marginBottom: "15px", color: "#374151" }}>
              Question {currentQuestionIndex + 1}:
            </h4>
            <p style={{ fontSize: "18px", marginBottom: "20px" }}>{questions[currentQuestionIndex]}</p>

            {/* Answer Input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                Your Answer:
              </label>
              <textarea
                value={answers[currentQuestionIndex] || ""}
                onChange={handleAnswerChange}
                placeholder="Type your answer here..."
                rows="6"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "16px",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                onClick={evaluateAnswer}
                disabled={evaluating || !answers[currentQuestionIndex]}
                style={{
                  padding: "10px 20px",
                  backgroundColor: evaluating ? "#ccc" : "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: evaluating || !answers[currentQuestionIndex] ? "not-allowed" : "pointer",
                  flex: 1,
                }}
              >
                {evaluating ? "Evaluating..." : "Get AI Feedback"}
              </button>
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                style={{
                  padding: "8px 16px",
                  backgroundColor: currentQuestionIndex === 0 ? "#f3f4f6" : "#4f46e5",
                  color: currentQuestionIndex === 0 ? "#9ca3af" : "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
                }}
              >
                Previous Question
              </button>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={goToNextQuestion}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Next Question
                </button>
              ) : (
                <button
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Complete Interview
                </button>
              )}
            </div>
          </div>

          {/* Feedback Section */}
          {feedback[currentQuestionIndex] && (
            <div className="feedback-card" style={{ 
              marginTop: "30px", 
              padding: "20px", 
              border: "1px solid #10b981",
              borderRadius: "8px",
              backgroundColor: "#f0fdf4"
            }}>
              <h4 style={{ marginBottom: "15px", color: "#065f46" }}>
                AI Feedback {feedback[currentQuestionIndex].score !== undefined ? `(Score: ${feedback[currentQuestionIndex].score}/10)` : ''}
              </h4>
              
              {feedback[currentQuestionIndex].error ? (
                <p style={{ color: "#dc2626" }}>Error: {feedback[currentQuestionIndex].error}</p>
              ) : (
                <>
                  {feedback[currentQuestionIndex].strength && (
                    <div style={{ marginBottom: "15px" }}>
                      <h5 style={{ color: "#065f46", marginBottom: "8px" }}>Strengths:</h5>
                      <ul style={{ marginLeft: "20px" }}>
                        {feedback[currentQuestionIndex].strength.map((item, index) => (
                          <li key={index} style={{ marginBottom: "5px" }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {feedback[currentQuestionIndex].improvement && (
                    <div>
                      <h5 style={{ color: "#b91c1c", marginBottom: "8px" }}>Areas for Improvement:</h5>
                      <ul style={{ marginLeft: "20px" }}>
                        {feedback[currentQuestionIndex].improvement.map((item, index) => (
                          <li key={index} style={{ marginBottom: "5px" }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* All Questions Overview */}
          <div style={{ marginTop: "40px" }}>
            <h4>All Questions</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
              {questions.map((question, index) => (
                <div 
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  style={{
                    padding: "12px",
                    border: "2px solid",
                    borderColor: currentQuestionIndex === index ? "#4f46e5" : 
                                 feedback[index] ? "#10b981" : "#d1d5db",
                    borderRadius: "6px",
                    backgroundColor: currentQuestionIndex === index ? "#eef2ff" : 
                                   feedback[index] ? "#f0fdf4" : "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "5px" }}>
                    Q{index + 1}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", height: "40px", overflow: "hidden" }}>
                    {question.substring(0, 60)}...
                  </div>
                  <div style={{ fontSize: "12px", marginTop: "5px" }}>
                    {feedback[index] ? (
                      <span style={{ color: "#059669" }}>✓ Score: {feedback[index].score}/10</span>
                    ) : answers[index] ? (
                      <span style={{ color: "#f59e0b" }}>✎ Answered</span>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>Not answered</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}