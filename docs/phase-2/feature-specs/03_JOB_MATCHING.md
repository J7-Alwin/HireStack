# HireStack AI Job Matching
## Phase 2 – Stage 4

Version: 1.0.0

Status: Planned

---

# 1. Overview

The AI Job Matching Engine automatically evaluates every applicant for a selected job and ranks candidates based on how well they match the job requirements.

Unlike the ATS Score Engine, which evaluates a single candidate against a single job, the Job Matching Engine analyzes all applicants for a job, generates structured AI evaluations, stores match history, and returns a ranked list of candidates.

The system uses the locally hosted Ollama Llama 3.2 model through the existing AI infrastructure to ensure complete data privacy, low operational cost, and consistent evaluation quality.

---

# 2. Objectives

The Job Matching Engine aims to:

- Automatically compare applicants against job requirements
- Rank candidates by overall suitability
- Reduce recruiter screening effort
- Improve hiring quality
- Reuse existing ATS infrastructure
- Preserve historical AI evaluations
- Support recruiter decision-making

---

# 3. Goals

## Business Goals

- Reduce manual resume screening
- Identify the strongest candidates faster
- Improve interview selection accuracy
- Increase recruiter productivity
- Standardize candidate evaluation

---

## Technical Goals

- Reuse existing AI infrastructure
- Modular architecture
- Local AI inference
- High accuracy
- Low response time
- Scalable processing
- Historical result storage

---

# 4. User Roles

## Company Admin

Can

- Generate job matching
- View candidate rankings
- View historical matching results
- Access AI insights

---

## Recruiter

Can

- Generate job matching
- View ranked candidates
- View candidate match details
- Regenerate job matching

---

## Candidate

No direct access.

Future versions may allow candidates to view their own compatibility score for a selected job.

---

# 5. Feature Overview

The Job Matching Engine reuses the existing ATS Score Engine to evaluate every applicant for a selected job.

Instead of implementing a separate AI evaluation flow, the Job Matching Engine orchestrates candidate processing by invoking the ATS Score Engine for each applicant, preserving a single AI evaluation strategy across the HireStack platform.

Each ATS evaluation is converted into a Job Matching record, ranked by match percentage, and returned as a sorted candidate list.

- Skills
- Experience
- Education
- Projects
- Certifications
- Resume Keywords
- Job Responsibilities
- Job Requirements

Each evaluation produces:

- Match Percentage
- Skill Match
- Experience Match
- Education Match
- Project Match
- Keyword Match
- Candidate Strengths
- Missing Skills
- Hiring Recommendation
- Overall AI Explanation

Every evaluation is stored to preserve historical matching records.

The system never overwrites previous AI evaluations.

---

# 6. Functional Requirements

The Job Matching Engine shall:

- Retrieve the selected job
- Retrieve all applications for the selected job
- Load each candidate's parsed resume
- Reuse the existing ATS Score Engine for candidate evaluation
- Generate a JobMatch record for every evaluated candidate
- Rank candidates by overall match percentage
- Preserve historical JobMatch records
- Allow recruiters to regenerate job matching at any time
- Return ranked candidate lists sorted by highest match percentage
- Never overwrite previous JobMatch records

# 7. AI Processing Flow

Recruiter Selects Job

↓

Retrieve Job Details

↓

Retrieve All Applications

↓

Loop Through Every Application

↓

Load Candidate

↓

Load Parsed Resume

↓

Invoke ATS Score Engine

↓

Receive ATS Evaluation

↓

Create JobMatch Record

↓

Repeat For Remaining Candidates

↓

Sort Candidates By Match Percentage

↓

Return Ranked Candidate List
# 8. API Specification

## Generate Job Matching

Method

POST

Endpoint

/api/v1/ai/job-matching

Authentication

JWT Required

Authorization

Company Admin

Recruiter

Request

{
    "jobId": ""
}

Response

{
    "jobId": "",
    "totalCandidates": 0,
    "generatedAt": "",
    "matches": [
        {
            "candidateId": "",
            "matchPercentage": 94,
            "recommendation": "STRONGLY_RECOMMENDED"
        }
    ]
}

---

## Get Job Matching History

Method

GET

Endpoint

/api/v1/ai/job-matching/:jobId

Returns

Historical AI evaluations generated for the selected job.

---

## Get Candidate Match Details

Method

GET

Endpoint

/api/v1/ai/job-matching/:jobId/:candidateId

Returns

Detailed AI evaluation for the selected candidate and job.

---

# 9. Database Design

Each evaluation creates a new JobMatch record.

The Job Matching Engine never overwrites existing records.

Suggested fields

- Job ID
- Candidate ID
- Match Percentage
- Skill Match
- Experience Match
- Education Match
- Project Match
- Keyword Match
- Strengths
- Missing Skills
- Overall Reason
- Recommendation
- AI Model
- Prompt Version
- Created At
- Updated At

Every execution preserves historical results.

---

# 10. Business Rules

The Job Matching Engine must reuse the existing ATS Score Engine.

The ATS Score Engine remains the single source of truth for AI candidate evaluation.

The Job Matching Engine is responsible only for:

- Loading the selected job
- Loading all applications for the selected job
- Invoking ATS evaluation for every candidate
- Creating JobMatch history
- Ranking candidates
- Returning sorted results

Business Rules

- Every execution evaluates ALL applicants for the selected job.
- Every execution creates NEW JobMatch records.
- Previous JobMatch records are never overwritten.
- Historical matching results are always preserved.
- Candidates must be returned in descending order of match percentage.
- No duplicate AI evaluation logic is permitted.

# 11. Security

The Job Matching Engine must follow the existing HireStack security architecture.

Authentication

- JWT Required

Authorization

- Company Admin
- Recruiter

Security Requirements

- Only authorized users can generate job matching
- Recruiters can only generate matching for jobs they are assigned to
- Candidate resume data must never leave the local server
- AI inference must remain completely local using Ollama
- No external AI APIs are permitted
- Input validation must occur before AI processing
- All responses must use the existing global error handling framework

---

# 12. Performance

Target Performance

Generate Job Matching

Target: <30 seconds for up to 100 applicants using sequential ATS evaluations.

Future versions may optimize performance through background processing and parallel execution.

Single Candidate Evaluation

< 10 seconds

Average AI Response Time

< 5 seconds

Database Operations

Optimized through existing repositories

The system should remain responsive while processing multiple applicants.

---

# 13. Scalability

The Job Matching Engine should support

- Multiple companies
- Multiple recruiters
- Multiple active jobs
- Hundreds of applications per job
- Historical AI evaluations
- Future background job processing

The architecture is designed so the ATS Score Engine remains the single AI evaluation service while the Job Matching Engine orchestrates candidate evaluation.

Future optimizations such as queue processing, parallel execution, caching, and incremental matching should be implemented without changing the public API or duplicating AI evaluation logic.
---

# 14. Success Metrics

Target Metrics

Job Matching Accuracy

95%

Recommendation Accuracy

90%

Successful Matching Rate

>99%

Average Candidate Processing Time

<10 seconds

Average Job Matching Completion Time

<30 seconds for 100 candidates

---

# 15. Future Enhancements

Future versions may include

- Batch processing using background queues
- Incremental matching for newly applied candidates
- AI-powered candidate ranking dashboard
- Recruiter-defined weighting for skills
- Department-specific evaluation profiles
- Semantic similarity matching
- Embedding-based candidate search
- Vector database integration
- RAG-enhanced job understanding
- AI Hiring Copilot

These enhancements must reuse the existing AI architecture wherever possible.

---

# 16. Current Development Status

Completed

- AI Infrastructure
- Ollama Integration
- LangChain Integration
- Resume Parser
- ATS Score Engine

In Progress

- Job Matching Documentation

Planned

- Job Matching Engine
- Resume Recommendations
- Interview Assistant
- AI Insights

---
# 17. Summary

The AI Job Matching Engine extends the existing Resume Parser and ATS Score Engine by orchestrating AI evaluations for every applicant of a selected job.

Instead of implementing a separate AI evaluation pipeline, the Job Matching Engine reuses the ATS Score Engine as the single source of truth for candidate evaluation, ensuring consistent scoring, simplified maintenance, and reusable AI logic.

Each execution generates new JobMatch records, preserves historical evaluations, ranks candidates by match percentage, and returns an explainable AI-powered candidate ranking.

This document serves as the functional specification for the Job Matching Engine.

Implementation details are defined separately in

03_JOB_MATCHING_IMPLEMENTATION.md

The AI Job Matching Engine builds upon the existing Resume Parser and ATS Score Engine to provide intelligent candidate ranking for recruiters.

The feature reuses the existing AI infrastructure, preserves historical evaluations, and produces explainable AI recommendations while maintaining HireStack's modular architecture and local-first AI design.

This document serves as the functional specification for the Job Matching Engine.

Implementation details are defined separately in

03_JOB_MATCHING_IMPLEMENTATION.md