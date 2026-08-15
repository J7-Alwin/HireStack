# HireStack AI Interview Assistant

## Phase 2 – Stage 6

Version: 1.0.0

Status: Planned

---

# 1. Overview

The AI Interview Assistant generates structured interview questions for a candidate based on the candidate's resume/profile and, when provided, the selected job.

The system uses the existing HireStack AI infrastructure and locally hosted Ollama Llama 3.2 model.

The Interview Assistant does not conduct interviews or evaluate candidate answers in this version.

Its responsibility is to generate a useful, structured interview question set that recruiters can use during candidate interviews.

The module must reuse the existing AI evaluation infrastructure and must not introduce a separate AI client or duplicate LLM communication logic.

---

# 2. Objectives

The Interview Assistant aims to:

- Generate candidate-specific interview questions
- Generate job-specific questions when a job is provided
- Cover multiple interview categories
- Generate questions based only on available candidate evidence
- Avoid fabricated candidate experience
- Preserve generated interview history
- Provide recruiters with a structured interview kit
- Reuse the existing local AI infrastructure

---

# 3. Scope

## Included

The first version supports:

- Candidate-based interview generation
- Job-specific interview generation
- Technical questions
- HR questions
- Behavioral questions
- Project/experience questions
- Role-specific questions
- Follow-up questions
- Interview question history
- Interview generation details
- Role-based authorization
- AI response validation
- Database persistence

---

## Not Included

The first version must NOT implement:

- Live AI interviews
- Voice interviews
- Video interviews
- Candidate answer evaluation
- Automated hiring decisions
- Interview scoring
- Speech-to-text
- Text-to-speech
- Adaptive real-time questioning
- Background queue processing
- RAG
- Vector database
- Embeddings
- AI interviewer chat

These may be considered future enhancements.

---

# 4. User Roles

## Company Admin

Can:

- Generate interview kits
- View interview history
- View interview details
- Generate job-specific interview kits

---

## Recruiter

Can:

- Generate interview kits
- View interview history
- View interview details
- Generate job-specific interview kits

Recruiters must remain restricted to their authorized company/job scope according to the existing HireStack authorization architecture.

---

## Candidate

Candidates may only access interview functionality according to the existing candidate authorization rules.

Candidates must never be able to access another candidate's interview data.

Candidate access to job-specific interview generation must respect existing job/application ownership rules.

---

# 5. Interview Generation Modes

The module supports two modes.

## General Candidate Interview

Input:

- candidateId

The AI generates questions based on the candidate's available:

- Skills
- Experience
- Education
- Projects
- Resume summary
- Certifications when available

A job is not required.

---

## Job-Specific Interview

Input:

- candidateId
- jobId

The AI generates questions based on:

Candidate information:

- Skills
- Experience
- Education
- Projects
- Resume summary

Job information:

- Job title
- Description
- Requirements
- Responsibilities
- Required skills
- Experience requirements

The questions should focus on the candidate's suitability for that specific role.

---

# 6. Question Categories

The generated interview kit should contain questions from the following categories where sufficient evidence exists.

## Technical

Questions evaluating technical knowledge relevant to the candidate's skills and the selected job.

Examples of areas:

- Programming languages
- Frameworks
- Databases
- Cloud
- AI/ML
- APIs
- System design

The AI must select topics based on the actual candidate/job information.

---

## HR

Questions covering:

- Motivation
- Career goals
- Communication
- Work preferences
- Role expectations

---

## Behavioral

Questions covering:

- Problem solving
- Teamwork
- Conflict handling
- Adaptability
- Decision making
- Leadership where supported by evidence

---

## Project / Experience

Questions based on actual candidate experience.

Questions should investigate:

- Candidate responsibilities
- Technical decisions
- Challenges
- Architecture
- Contributions
- Results
- Lessons learned

The AI must not invent projects or responsibilities.

---

## Role-Specific

For job-specific interviews, questions should directly evaluate the candidate against the selected job's:

- Responsibilities
- Requirements
- Required skills
- Experience expectations

---

## Follow-Up

Where appropriate, the AI may generate follow-up questions that help the interviewer investigate an earlier answer.

Follow-up questions must remain grounded in the candidate's available information.

---

# 7. AI Output

The AI must return structured JSON.

Expected structure:

```json
{
  "overallSummary": "Interview focus summary",
  "questions": [
    {
      "category": "TECHNICAL",
      "question": "Explain how you used Node.js in your project.",
      "reason": "The candidate lists Node.js experience.",
      "difficulty": "MEDIUM",
      "followUps": [
        "What challenges did you face?"
      ]
    }
  ]
}
8. Evidence Rules

The AI must follow strict evidence rules.

Allowed Evidence

The AI may use:

Candidate profile
Parsed resume information
Candidate skills
Candidate experience
Candidate education
Candidate projects
Candidate certifications
Candidate resume summary
Selected job information
Prohibited Behavior

The AI must NOT:

Invent projects
Invent employment
Invent certifications
Invent technologies
Invent responsibilities
Claim the candidate has a skill that is not present
Create questions based on unavailable candidate information as if it were factual

If evidence is unavailable, the AI should generate a general question instead of making a factual assumption.

9. Database Design

Create a new InterviewAssistant model.

Suggested fields:

id
candidateId
jobId
mode
overallSummary
questions
aiModel
promptVersion
createdAt
updatedAt

Where:

questions is stored as structured JSON.

jobId should remain optional for general candidate interviews.

Historical interview generations must be preserved.

The system must NOT overwrite previous interview generations.

10. API Specification
Generate General Interview

Method:

POST

Endpoint:

/api/v1/ai/interview

Request:

{
  "candidateId": "candidate-id"
}

Response:

{
  "id": "interview-id",
  "candidateId": "candidate-id",
  "jobId": null,
  "mode": "GENERAL",
  "overallSummary": "Interview focus summary",
  "questions": []
}
Generate Job-Specific Interview

Method:

POST

Endpoint:

/api/v1/ai/interview/job

Request:

{
  "candidateId": "candidate-id",
  "jobId": "job-id"
}

Response:

{
  "id": "interview-id",
  "candidateId": "candidate-id",
  "jobId": "job-id",
  "mode": "JOB_SPECIFIC",
  "overallSummary": "Interview focus summary",
  "questions": []
}
Get Interview History

Method:

GET

Endpoint:

/api/v1/ai/interview/history/:candidateId

Returns previous interview generations for the candidate.

Historical records must remain immutable.

Pagination should follow the existing API conventions.

Get Interview Details

Method:

GET

Endpoint:

/api/v1/ai/interview/:id

Returns the complete generated interview kit.

11. Validation

Use Zod validation for:

Request Body

General:

candidateId required

Job-specific:

candidateId required
jobId required
Route Parameters

Validate:

candidateId
interview id

Do not rely on TypeScript casts such as:

req.params.id as string

Use dedicated Zod parameter schemas.

12. Authorization

The Interview Assistant must follow the existing HireStack authorization architecture.

Admin

Company-scoped access.

Recruiter

Company-scoped access.

For job-specific interviews, the recruiter must have permission to access the selected job.

Candidate

Candidates may only access their own candidate profile.

For job-specific interview generation, candidate access must respect the existing application/job access rules.

No user may retrieve another candidate's interview history or interview details.

Authorization checks must occur before AI processing.

13. AI Architecture

The module must reuse:

ai-evaluation.service.ts
ai.service.ts
Existing Ollama client
Existing AI configuration
Existing PromptBuilder
Existing JsonParser
Existing error handling
Existing logging infrastructure

Do NOT create:

Another Ollama client
Another LangChain integration
Another AI configuration system
Duplicate JSON parsing logic
Duplicate prompt-building infrastructure

The model must continue to be controlled through the existing AI configuration/environment.

No hard-coded production AI credentials or external AI API keys are permitted.

14. Prompt

Create:

interview.prompt.ts

The prompt must define:

Interview generation objective
General mode behavior
Job-specific mode behavior
Question categories
Evidence rules
Anti-hallucination rules
JSON output format
Difficulty rules
Follow-up question rules

Prompt version:

1.0.0

The prompt version must be stored with each generated interview record.

15. Types

Create:

interview.types.ts

Types should represent:

Interview request
Job-specific interview request
Interview question
Interview response
Interview mode
Question category
Difficulty

Use strict types.

Avoid unnecessary any.

16. Schemas

Create:

interview.schema.ts

The schema must validate:

Request payloads
Route parameters
AI response JSON

The AI response must never be persisted before schema validation succeeds.

17. Service

Create:

interview.service.ts

The service is responsible for:

Validate input
Load candidate
Authorize candidate access
Optionally load job
Authorize job access
Build candidate context
Build job context when applicable
Build interview prompt
Call existing AI evaluation infrastructure
Parse AI JSON
Validate AI response
Persist interview generation
Return structured response

The service must not contain duplicated low-level LLM communication logic.

18. Controller and Routes

Update the existing AI controller and routes.

The controller should remain thin.

Business logic belongs in:

interview.service.ts

Routes must use the existing:

Authentication middleware
Authorization middleware
Validation conventions
Error handling framework
19. Swagger

Update:

ai.swagger.ts
ai.schemas.ts

Document:

General interview generation
Job-specific interview generation
Interview history
Interview details

Swagger examples must use the current prompt version.

20. Error Handling

The module must correctly handle:

Candidate not found
Job not found
Unauthorized access
Invalid request
Missing candidate information
Missing job information
AI timeout
AI unavailable
Invalid AI JSON
AI schema validation failure
Database failure

All errors must use the existing HireStack error-handling system.

Do not expose internal AI errors or database details to API consumers.

21. History

Every successful generation creates a new database record.

Example:

Candidate A
    │
    ├── Interview #1
    ├── Interview #2
    ├── Interview #3
    └── Interview #4

Previous generations must never be overwritten.

Each record should retain:

AI model
Prompt version
Generated questions
Generation mode
Candidate
Job when applicable
Creation timestamp
22. Testing Requirements

Testing should be focused and proportional to the module.

Required Tests
General Generation
Valid candidate request
Successful AI generation
Database persistence
Job-Specific Generation
Valid candidate/job request
Successful AI generation
Job context included
Validation
Missing candidateId
Missing jobId
Invalid route parameters
Authorization
Unauthorized candidate access
Cross-company access
Unauthorized recruiter job access
Candidate accessing another candidate
AI Failure
Invalid JSON
AI timeout/failure
Schema validation failure
History
History retrieval
Details retrieval
Multiple generations preserved
23. Regression Testing

After implementation, run:

Interview Assistant smoke/integration tests
ATS Score regression test
Job Matching regression test
Resume Recommendations regression test
Resume Parser regression test

Also run:

npm run type-check
npm run build
npx eslint .

Run Prisma validation/migration checks according to the existing project workflow.

The module should not be considered complete if shared AI functionality is broken.

24. Completion Criteria

The Interview Assistant is considered complete only when:

 Prisma model created
 Migration created and verified
 Prompt implemented
 Types implemented
 Zod schemas implemented
 Service implemented
 Controller implemented
 Routes implemented
 Swagger updated
 General interview generation works
 Job-specific interview generation works
 History works
 Details retrieval works
 Authorization works
 AI failure handling works
 No hallucination/evidence violations in prompt behavior
 Smoke/integration tests pass
 ATS regression passes
 Job Matching regression passes
 Resume Recommendations regression passes
 Resume Parser regression passes
 Type-check passes
 Build passes
 ESLint passes
 Prisma validation/migration checks pass
25. Future Enhancements

Future versions may introduce:

AI answer evaluation
Interview scoring
Adaptive follow-up questions
Live interview assistant
Voice interviews
Video interviews
Speech-to-text
Interview analytics
Candidate comparison
AI interviewer
Interview feedback generation

These features are outside the scope of Version 1.0.0.

26. Summary

The Interview Assistant provides recruiters with structured, candidate-aware interview questions using HireStack's existing local AI infrastructure.

The module has two primary modes:

General Candidate Interview
Job-Specific Interview

It generates structured questions across technical, HR, behavioral, project/experience, role-specific, and follow-up categories.

The module preserves historical generations and follows the existing authentication, authorization, validation, AI, database, and error-handling architecture.

The implementation must remain focused on interview question generation and must not introduce unnecessary live-interview, scoring, voice, RAG, or queue infrastructure in Version 1.0.0.