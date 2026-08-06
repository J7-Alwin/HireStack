# HireStack AI Database Design
## Phase 2 – AI Database

Version: 2.0.0

Status: Planned / In Progress

---

# 1. Overview

The AI module introduces several supporting entities to store AI-generated results, resume parsing outputs, ATS scores, recommendations, and future AI analytics.

The existing Candidate, Job, Application, Interview, Offer, and Pipeline tables remain unchanged.

AI-specific tables extend the existing recruitment workflow.

---

# 2. Database Relationships

Candidate
│
├── Resume Analysis
├── ATS Scores
├── Job Matches
├── AI Recommendations
└── Interview Questions

Job
│
└── ATS Scores

Recruiter
│
└── AI Requests

---

# 3. Resume Analysis

Purpose

Stores parsed resume information returned by AI.

Fields

- id
- candidateId
- rawResumeText
- extractedJson
- parserVersion
- confidenceScore
- processingTime
- createdAt

---

# 4. ATS Score

Purpose

Stores candidate-job compatibility.

Fields

- id
- candidateId
- jobId
- overallScore
- skillScore
- experienceScore
- educationScore
- strengths
- weaknesses
- missingSkills
- recommendations
- createdAt

---

# 5. Job Matching

Purpose

Stores AI matching results.

Fields

- id
- candidateId
- jobId
- matchPercentage
- matchedSkills
- missingSkills
- recommendation
- confidence
- createdAt

---

# 6. AI Recommendations

Purpose

Stores AI-generated improvement suggestions.

Fields

- id
- candidateId
- recommendationType
- title
- description
- priority
- createdAt

Examples

- Resume Improvement
- Missing Skills
- Career Advice
- ATS Optimization

---

# 7. Interview Questions

Purpose

Stores AI-generated interview questions.

Fields

- id
- jobId
- candidateId
- category
- difficulty
- question
- expectedAnswer
- createdAt

Categories

- HR
- Technical
- Behavioural
- Coding
- Project

---

# 8. AI Request Log

Purpose

Tracks every AI request.

Fields

- id
- recruiterId
- module
- model
- promptTokens
- completionTokens
- responseTime
- status
- createdAt

---

# 9. AI Prompt History

Purpose

Stores prompts used for debugging.

Fields

- id
- module
- prompt
- response
- model
- createdAt

Sensitive information should be masked before storage.

---

# 10. Future Tables

Planned

- Resume Embeddings
- Vector Index
- Semantic Search Cache
- AI Chat History
- AI Feedback
- OCR Cache
- AI Knowledge Base

---

# 11. Database Strategy

The AI module follows these principles:

- Existing ATS tables remain unchanged.
- AI features extend the current schema.
- AI-generated data is stored separately.
- AI results are reproducible.
- Historical AI outputs are preserved.

---
---

# 12. Architectural Decision

HireStack follows an **AI Extension Model**.

AI-generated data will **not** be stored directly inside the existing ATS entities such as Candidate, Job, or Application.

Instead, every AI feature stores its output in dedicated tables linked through foreign keys.

Example:

Candidate
│
├── ResumeAnalysis
├── ATSScore
├── JobMatch
├── AIRecommendation
└── InterviewQuestion

Benefits

- Keeps ATS entities clean
- Supports multiple AI analyses for the same candidate
- Allows AI model versioning
- Preserves historical AI outputs
- Simplifies future upgrades
- Improves database scalability
# 13. Future Expansion

The schema supports future integration with:

- pgvector
- ChromaDB
- Pinecone
- Weaviate
- Milvus
- Redis Cache

without requiring changes to existing ATS entities.