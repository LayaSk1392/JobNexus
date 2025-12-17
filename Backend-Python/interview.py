import os
import fitz  # PyMuPDF package
from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import json
import logging
from dotenv import load_dotenv
from flask_cors import CORS

# Setup
load_dotenv() # Load environment variables from .env file
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = Flask(__name__)
# CORS configuration - IMPORTANT!
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Gemini API Configuration 
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file")
    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel('gemini-2.5-flash') 
    
    log.info("--- Gemini API configured successfully with model 'gemini-1.0-pro' ---")
except Exception as e:
    log.error(f"Error configuring Gemini API: {e}")
    model = None

# ... rest of your code remains the same ...


MAX_TEXT_LENGTH = 10000 

def extract_text_from_pdf(pdf_file):
    """Extracts text from an uploaded PDF file."""
    try:
        doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
        text = "".join(page.get_text() for page in doc)
        doc.close()
        if len(text) > MAX_TEXT_LENGTH:
            log.info(f"Original text length ({len(text)}) exceeds limit. Truncating.")
            text = text[:MAX_TEXT_LENGTH]
        else:
            log.info(f"Extracted text length: {len(text)} characters.")
        return text
    except Exception as e:
        log.error(f"Error extracting text from PDF: {e}")
        return ""


def generate_questions(resume_text, jd_text):
    """Generates interview questions using the Gemini API."""
    if not model:
        return ["Error: Gemini model not initialized. Check your API key."]

    log.info("Generating questions with the Gemini API...")
    prompt = f"""
    As an expert HR manager, analyze the following resume and job description.
    Generate 5 insightful interview questions designed to probe the candidate's suitability for the role.

    Return your response ONLY as a single, valid JSON-formatted list of strings. Do not add any introductory text, explanations, or closing remarks. For example: ["Question 1?", "Question 2?"]

    Job Description:
    ---
    {jd_text}
    ---
    Candidate's Resume:
    ---
    {resume_text}
    ---
    """
    
    try:
        response = model.generate_content(prompt)
        raw_text = response.text
        log.info(f"Gemini Raw Response for questions: {raw_text}")
        
        start_index = raw_text.find('[')
        end_index = raw_text.rfind(']') + 1

        if start_index != -1 and end_index != -1:
            json_str = raw_text[start_index:end_index]
            log.info(f"Attempting to parse JSON: {json_str}")
            questions = json.loads(json_str)
            return questions
        else:
            log.error("Could not find a JSON list in the raw response.")
            return ["Error: Could not find a valid list in the AI's response."]

    except json.JSONDecodeError as e:
        log.error(f"JSON Decode Error: {e}. Failed to parse the Gemini response.")
        return ["Error: The AI response was not in a valid JSON format."]
    except Exception as e:
        log.error(f"Error during question generation with Gemini: {e}")
        return ["Error: An exception occurred while generating questions."]


def evaluate_answer(resume_text, jd_text, question, answer):
    """Evaluates a candidate's answer using the Gemini API."""
    if not model:
        return {"error": "Gemini model not initialized."}

    log.info(f"Evaluating answer for question: '{question}'")
    prompt = f"""
    As a helpful and constructive interview coach, evaluate the following answer to an interview question.
    Your feedback should be personalized and address the user directly as "you". Do not refer to them as "the candidate".
    Base your evaluation on the user's resume and the provided job description.

    Provide your feedback as a single, valid JSON object with three keys: "score" (an integer out of 10), "strength" (a list of strings), and "improvement" (a list of strings).
    Do not use any markdown formatting (like asterisks).

    Example of a good response format: {{"score": 8, "strength": ["You clearly explained the technical details of the project."], "improvement": ["To make your answer stronger, try to connect it back to the specific requirements in the job description."]}}

    Job Description:
    ---
    {jd_text}
    ---
    Your Resume:
    ---
    {resume_text}
    ---
    Question:
    {question}
    ---
    Your Answer:
    {answer}
    ---
    """

    try:
        response = model.generate_content(prompt)
        raw_text = response.text
        log.info(f"Gemini Raw Response for feedback: {raw_text}")

        start_index = raw_text.find('{')
        end_index = raw_text.rfind('}') + 1

        if start_index != -1 and end_index != -1:
            json_str = raw_text[start_index:end_index]
            log.info(f"Attempting to parse JSON: {json_str}")
            feedback_obj = json.loads(json_str)
            return feedback_obj
        else:
            log.error("Could not find a JSON object in the raw response.")
            return {"error": "Could not find a valid object in the AI's response."}
            
    except json.JSONDecodeError as e:
        log.error(f"JSON Decode Error: {e}. Failed to parse the Gemini feedback.")
        return {"error": "The AI feedback was not in a valid JSON format."}
    except Exception as e:
        log.error(f"Error during answer evaluation with Gemini: {e}")
        return {"error": "An exception occurred while evaluating the answer."}

# --- Flask Routes ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start-interview', methods=['POST'])
def start_interview():
    log.info("--- Received request for /start-interview ---")
    if 'resume' not in request.files or 'job_description' not in request.files:
        return jsonify({'error': 'Both resume and job description files are required.'}), 400

    resume_file = request.files['resume']
    jd_file = request.files['job_description']

    resume_text = extract_text_from_pdf(resume_file)
    jd_text = extract_text_from_pdf(jd_file)

    if not resume_text or not jd_text:
        return jsonify({'error': 'Could not extract text from one or both PDFs.'}), 500

    questions = generate_questions(resume_text, jd_text)
    
    app.config['resume_text'] = resume_text
    app.config['jd_text'] = jd_text
    
    return jsonify({'questions': questions})

@app.route('/evaluate-answer', methods=['POST'])
def evaluate():
    log.info("--- Received request for /evaluate-answer ---")
    data = request.get_json()
    question = data.get('question')
    answer = data.get('answer')
    
    resume_text = app.config.get('resume_text', '')
    jd_text = app.config.get('jd_text', '')

    if not all([question, answer, resume_text, jd_text]):
        return jsonify({'error': 'Missing data for evaluation.'}), 400

    feedback = evaluate_answer(resume_text, jd_text, question, answer)
    return jsonify({'feedback': feedback})

if __name__ == '__main__':
    if not model:
        log.error("Application cannot start. Gemini model failed to initialize. Please check your API key and .env file.")
    else:
        app.run(host='0.0.0.0', port=5000)

