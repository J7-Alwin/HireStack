# HireStack ATS Score Engine
## Phase 2 – Stage 3

Version: 1.0.0

Status: Design

---

# 1. Overview

The ATS Score Engine evaluates how well a candidate matches a specific job opening using Artificial Intelligence.

Unlike traditional Applicant Tracking Systems that primarily rely on keyword matching, HireStack uses a locally hosted Large Language Model (LLM) to analyze the candidate's resume together with the selected job description and generate an explainable compatibility report.

The ATS Score Engine provides recruiters with a detailed evaluation rather than a single percentage score. It analyzes multiple hiring dimensions and produces actionable recommendations to help recruiters make faster, more informed hiring decisions.

The engine is designed to run completely offline using Ollama and Llama 3.2, ensuring complete data privacy while eliminating external AI API costs.

---

# 2. Objectives

The ATS Score Engine aims to:

- Automatically compare candidates against job descriptions.
- Reduce manual resume screening effort.
- Provide transparent and explainable ATS scoring.
- Identify candidate strengths and weaknesses.
- Highlight missing skills and qualifications.
- Recommend resume improvements.
- Assist recruiters in shortlisting candidates.
- Improve hiring quality using AI-assisted analysis.

---

# 3. Business Goals

The ATS Score Engine should help organizations:

- Reduce recruiter screening time.
- Improve hiring accuracy.
- Increase recruiter productivity.
- Standardize candidate evaluation.
- Reduce hiring bias through consistent AI evaluation.
- Improve interview selection quality.
- Increase overall recruitment efficiency.

---

# 4. Functional Requirements

The system shall:

- Retrieve candidate information from the database.
- Retrieve job information from the database.
- Compare resume content against the selected job description.
- Evaluate technical skills.
- Evaluate experience relevance.
- Evaluate education relevance.
- Evaluate certifications.
- Evaluate projects.
- Evaluate keywords.
- Generate an Overall ATS Score.
- Generate category-wise scores.
- Identify strengths.
- Identify weaknesses.
- Identify missing skills.
- Generate recruiter recommendations.
- Generate hiring recommendations.
- Save ATS evaluation history.
- Return a structured ATS report.

---

# 5. User Roles

## Company Admin

Can

- View ATS reports.
- Configure AI settings.
- View analytics.
- Generate reports.

---

## Recruiter

Can

- Generate ATS Scores.
- Compare candidates.
- View recommendations.
- Download ATS reports.
- Re-run ATS analysis.

---

## Candidate (Future)

Can

- View ATS Score.
- View missing skills.
- Receive resume improvement suggestions.
- Re-analyze updated resumes.

---

# 6. High Level Workflow

Recruiter selects Candidate

↓

Recruiter selects Job

↓

Candidate Resume Retrieved

↓

Job Description Retrieved

↓

Prompt Builder

↓

ATS Prompt

↓

AiService

↓

Ollama

↓

Llama 3.2

↓

JSON Response

↓

Schema Validation

↓

Store ATS Result

↓

Return ATS Report

---
# 7. API Design

## Endpoint

POST

/api/v1/ai/ats-score

---

## Authentication

Required

Bearer JWT

---

## Authorization

Allowed Roles

- Company Admin
- Recruiter

---

## Request

Content-Type

application/json

Example

```json
{
    "candidateId": "candidate-uuid",
    "jobId": "job-uuid"
}
```

---

## Processing

The API shall

- Validate JWT.
- Validate user role.
- Validate request body.
- Verify candidate exists.
- Verify job exists.
- Retrieve parsed resume data.
- Retrieve job description.
- Generate ATS Prompt.
- Invoke AI Service.
- Validate AI JSON.
- Store ATS Score.
- Return ATS Report.

---

## Success Response

HTTP Status

200 OK

Example

```json
{
    "success": true,
    "message": "ATS score generated successfully.",
    "data": {
        "overallScore": 89,
        "skillScore": 94,
        "experienceScore": 86,
        "educationScore": 91,
        "keywordScore": 84,
        "certificationScore": 72,
        "strengths": [],
        "weaknesses": [],
        "missingSkills": [],
        "recommendations": [],
        "hiringRecommendation": "Recommended"
    }
}
```

---

## Error Responses

400

Invalid Request

401

Unauthorized

403

Forbidden

404

Candidate Not Found

404

Job Not Found

422

Resume Not Parsed

500

AI Processing Failed

---

# 8. Database Design

## Existing Tables Used

Candidate

Job

Resume

---

## New Table

ATSScore

Fields

- id
- candidateId
- jobId
- overallScore
- skillScore
- experienceScore
- educationScore
- keywordScore
- certificationScore
- strengths (JSON)
- weaknesses (JSON)
- missingSkills (JSON)
- recommendations (JSON)
- hiringRecommendation
- aiModel
- promptVersion
- createdAt
- updatedAt

---

## Relationships

Candidate

1 → N

ATSScore

Job

1 → N

ATSScore

---

# 9. AI Prompt Design

The AI Prompt shall compare

Candidate Resume

with

Selected Job Description.

The prompt must instruct the model to return ONLY valid JSON.

The prompt must evaluate

- Technical Skills
- Experience
- Education
- Certifications
- Projects
- Keywords
- Overall Candidate Quality

The prompt shall not return markdown.

The prompt shall not return explanations.

The prompt shall return only JSON matching the ATS Schema.

---

# 10. Response Schema

The ATS Engine shall return

```typescript
interface ATSScoreResponse {

    overallScore: number;

    skillScore: number;

    experienceScore: number;

    educationScore: number;

    keywordScore: number;

    certificationScore: number;

    strengths: string[];

    weaknesses: string[];

    missingSkills: string[];

    recommendations: string[];

    hiringRecommendation: string;

}
```

---

# 11. ATS Evaluation Criteria

## Technical Skills

Evaluate

- Required Skills
- Preferred Skills
- Technology Stack

Weight

35%

---

## Experience

Evaluate

- Years of Experience
- Relevant Experience
- Industry Experience
- Project Experience

Weight

25%

---

## Education

Evaluate

- Degree
- Field of Study
- Academic Relevance

Weight

15%

---

## Certifications

Evaluate

- Professional Certifications
- Cloud Certifications
- Technical Certifications

Weight

10%

---

## Keywords

Evaluate

- ATS Keywords
- Job Keywords
- Technical Terminology

Weight

15%

---

## Overall Score

The Overall Score shall be generated by AI after considering all evaluation categories.

The score must range from

0

to

100.

---

# 12. Validation Rules

The ATS Score Engine shall validate all incoming requests before AI processing begins.

## Request Validation

The system shall validate:

- Candidate ID is provided.
- Job ID is provided.
- Candidate ID is a valid UUID.
- Job ID is a valid UUID.

---

## Business Validation

The system shall verify:

- Candidate exists.
- Job exists.
- Candidate belongs to the current company.
- Job belongs to the current company.
- Candidate has a parsed resume.
- Job has a valid job description.
- Resume contains sufficient information for evaluation.

---

## AI Response Validation

The AI response must:

- Be valid JSON.
- Match the ATS Score Schema.
- Contain all required fields.
- Contain numeric scores between 0 and 100.
- Contain valid recommendation arrays.
- Contain a valid hiring recommendation.

If validation fails, the request shall be rejected.

---

# 13. Error Handling

The ATS Score Engine shall gracefully handle the following scenarios.

## Client Errors

- Missing Candidate ID
- Missing Job ID
- Invalid UUID
- Candidate Not Found
- Job Not Found
- Resume Not Parsed
- Missing Job Description

## AI Errors

- AI Timeout
- Empty AI Response
- Invalid JSON
- Invalid Schema
- Unsupported Model

## Database Errors

- Candidate Retrieval Failure
- Job Retrieval Failure
- ATS Score Persistence Failure

All errors shall reuse the existing global error handling framework.

---

# 14. Logging

The ATS Score Engine shall reuse the existing logging framework.

The following events shall be logged.

- ATS Scoring Started
- Candidate Loaded
- Job Loaded
- Prompt Generated
- AI Request Sent
- AI Response Received
- AI Response Time
- Schema Validation Passed
- ATS Score Stored
- ATS Scoring Completed
- ATS Scoring Failed

Sensitive information such as resume content or personal data shall never be written to logs.

---

# 15. Security

The ATS Score Engine shall follow the same security standards as the existing AI module.

Requirements

- JWT Authentication
- Role Based Authorization
- Company Data Isolation
- Local AI Processing Only
- No External AI APIs
- Secure Database Access
- Secure File Handling
- Existing Middleware Reuse

Only Company Admins and Recruiters are authorized to generate ATS Scores.

---

# 16. Swagger Requirements

The ATS Score endpoint shall be documented using the existing AI Swagger module.

Do not create new Swagger files.

Merge documentation into:

- ai.swagger.ts
- ai.schemas.ts

Swagger documentation shall include:

- Summary
- Description
- Tags
- JWT Security
- Request Schema
- Response Schema
- Error Responses
- Example Request
- Example Response

---

# 17. Performance Requirements

Target response times

Candidate Retrieval

< 500 ms

Job Retrieval

< 500 ms

AI Processing

< 8 seconds

Complete ATS Score Generation

< 10 seconds

The service shall remain responsive under concurrent recruiter requests.

---

# 18. Testing Strategy

The following scenarios shall be tested.

## Successful Cases

- Valid Candidate + Valid Job
- High Match Candidate
- Medium Match Candidate
- Low Match Candidate

---

## Validation Cases

- Missing Candidate ID
- Missing Job ID
- Invalid UUID
- Candidate Not Found
- Job Not Found
- Resume Not Parsed
- Missing Job Description

---

## AI Cases

- AI Timeout
- Invalid JSON
- Empty Response
- Schema Validation Failure

---

## Database Cases

- ATS Score Stored Successfully
- Database Failure
- Transaction Rollback

---

# 19. Implementation Checklist

## Infrastructure

- [ ] ATS Prompt
- [ ] ATS Schema
- [ ] ATS Types
- [ ] ATS Service

---

## API

- [ ] ATS Endpoint
- [ ] Controller
- [ ] Route
- [ ] Validation
- [ ] Swagger

---

## AI

- [ ] Prompt Generation
- [ ] AI Invocation
- [ ] JSON Parsing
- [ ] Schema Validation

---

## Database

- [ ] Candidate Retrieval
- [ ] Job Retrieval
- [ ] ATS Score Storage

---

## Quality

- [ ] Logging
- [ ] Error Handling
- [ ] Unit Testing
- [ ] Integration Testing

---

# 20. Definition of Done

The ATS Score feature shall be considered complete only when all of the following are satisfied.

- ATS Score API implemented.
- JWT Authentication enforced.
- Role Authorization enforced.
- Candidate validation completed.
- Job validation completed.
- Resume validation completed.
- Prompt Builder integrated.
- AI Service integrated.
- JSON Parser integrated.
- ATS Schema validation completed.
- ATS Score persisted.
- Swagger documentation completed.
- Logging implemented.
- Error handling completed.
- End-to-End testing completed.
- No duplicate code introduced.
- Existing architecture preserved.
- Existing middleware reused.
- Existing response helpers reused.
- Existing logger reused.
- Production-ready implementation verified.

---

# 21. Future Enhancements

The ATS Score Engine architecture shall support future enhancements without major refactoring.

Planned improvements include:

- Custom scoring weights per company.
- AI-assisted recruiter notes.
- Historical ATS score comparison.
- ATS score trends.
- Resume re-scoring after updates.
- Candidate ranking across multiple jobs.
- Batch ATS scoring.
- AI explainability dashboard.
- Recruiter feedback learning.
- AI model version comparison.
- Multi-model evaluation.
- Semantic skill matching.
- Vector-based candidate similarity.
- RAG-enhanced job matching.
- Explainable AI (XAI) support.