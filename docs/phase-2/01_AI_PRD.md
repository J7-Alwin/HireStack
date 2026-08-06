# HireStack AI Module PRD
## Phase 2 – Artificial Intelligence

Version: 2.0.0

Status: In Development

---

# 1. Overview

The AI Module enhances HireStack ATS by automating resume parsing, candidate evaluation, job matching, recruiter assistance, and hiring insights using a locally hosted Large Language Model (LLM).

The AI system is designed to operate completely offline using Ollama and Llama 3.2, ensuring data privacy, reduced operational cost, and high customization without relying on external AI APIs.

---

# 2. Objectives

The primary objectives are:

- Automate resume parsing
- Reduce manual recruiter effort
- Improve hiring accuracy
- Increase ATS efficiency
- Generate recruiter insights
- Assist recruiters during interviews
- Provide intelligent candidate recommendations

---

# 3. Goals

### Business Goals

- Reduce resume screening time
- Improve candidate-job matching
- Increase recruiter productivity
- Improve hiring quality
- Reduce hiring cost

---

### Technical Goals

- Local AI inference
- Modular AI architecture
- High accuracy
- Low response time
- Reusable AI services

---

# 4. AI Features

## Phase 2.1

### Resume Parser

Extract structured candidate information from uploaded resumes.

Extract:

- Name
- Email
- Phone
- Address
- Skills
- Education
- Experience
- Certifications
- Projects
- Languages

Output:

Structured JSON

---

## Phase 2.2

### ATS Score

Evaluate how well a candidate matches a job description.

Generate

- Overall ATS Score
- Missing Skills
- Matching Skills
- Recommendations
- Resume Strengths
- Resume Weaknesses

---

## Phase 2.3

### AI Job Matching

Automatically compare candidate resumes with job descriptions.

Return

- Match Percentage
- Skill Match
- Experience Match
- Education Match
- Missing Requirements
- Hiring Recommendation

---

## Phase 2.4

### AI Resume Recommendations

Suggest improvements to resumes.

Examples

- Missing Skills
- Better Summary
- Formatting Suggestions
- Keyword Optimization
- ATS Optimization

---

## Phase 2.5

### AI Interview Assistant

Generate interview questions based on

- Resume
- Job
- Skills
- Experience

Categories

- Technical
- HR
- Behavioural
- Project-based
- Coding
- Follow-up

---

## Phase 2.6

### AI Insights

Generate recruiter insights.

Examples

- Candidate Strengths
- Candidate Risks
- Hiring Confidence
- Career Growth
- Skill Gap Analysis

---

# 5. User Roles

## Company Admin

Can

- Configure AI
- View AI Insights
- Generate Reports

---

## Recruiter

Can

- Parse Resume
- Score Resume
- Match Candidate
- Generate Interview Questions
- View AI Suggestions

---

## Candidate (Future)

Can

- Improve Resume
- View Resume Score
- Receive Resume Suggestions

---

# 6. Functional Requirements

The system shall

- Parse uploaded resumes
- Extract structured information
- Store extracted data
- Compare resumes with jobs
- Generate ATS scores
- Recommend candidates
- Generate interview questions
- Produce recruiter insights

---

# 7. Non Functional Requirements

## Performance

Resume Parsing

Target

< 10 seconds

ATS Score

< 5 seconds

Job Matching

< 5 seconds

---

## Scalability

Support

- Multiple recruiters
- Multiple companies
- Large resume datasets

---

## Reliability

- Graceful AI failures
- Retry support
- Input validation
- JSON validation

---

## Security

- Local inference only
- No resume leaves server
- Secure file handling
- Authentication required
- Authorization enforced

---

# 8. AI Technology Stack

LLM

- Llama 3.2

Inference Engine

- Ollama

Framework

- LangChain

Runtime

- Node.js

Backend

- Express

Language

- TypeScript

Validation

- Zod

PDF Extraction

- pdf-parse

ORM

- Prisma

Database

- PostgreSQL

---

# 9. AI Processing Flow

Resume Upload

↓

Extract PDF Text

↓

Build Prompt

↓

Send Prompt to Llama

↓

Receive JSON

↓

Validate JSON

↓

Create Candidate

↓

Store in Database

↓

Generate ATS Score

↓

Recommend Jobs

---

# 10. Success Metrics

Resume Parsing Accuracy

Target

95%

ATS Score Accuracy

90%

Average Response Time

<10 sec

Successful Parsing Rate

>99%

---

# 11. Future Enhancements

- Multi-language resume parsing
- OCR support
- Image resume parsing
- Cover letter analysis
- AI Email Generator
- AI Candidate Ranking
- Semantic Search
- RAG Knowledge Base
- Voice Interview Assistant
- AI Hiring Copilot

---

# 12. Current Development Status

Completed

- AI Module Structure
- Ollama Integration
- Llama 3.2 Integration
- LangChain Integration
- AI Health Endpoint

In Progress

- Resume Parser

Upcoming

- ATS Score
- Job Matching
- AI Recommendations
- Interview Assistant
- AI Insights