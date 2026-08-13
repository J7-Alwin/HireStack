# HireStack AI Resume Recommendations — Implementation Plan

## Phase 2 – Stage 5

Version: 1.0.0

Status: Planned

---

# 1. Implementation Overview

The Resume Recommendation Engine must be implemented as part of the existing HireStack AI module.

The implementation must reuse the existing AI infrastructure and must not introduce duplicate AI clients, duplicate evaluation pipelines, or independent AI configuration.

The feature supports two evaluation modes:

1. General Resume Review
2. Job-Specific Resume Optimization

The implementation must integrate with the existing:

- Resume Parser
- ATS Score Engine
- Job Matching Engine
- `ai-evaluation.service.ts`
- `ai.service.ts`
- Prompt Builder
- JSON Parser
- AI schemas
- AI configuration
- Candidate module
- Job module
- Prisma database layer
- Authentication middleware
- Authorization middleware
- Existing API response and error-handling architecture

Before modifying or creating files, inspect the existing Phase 2 AI implementation and follow the patterns already established by the previous AI features.

---

# 2. Implementation Principles

The implementation must follow these principles:

- Reuse existing AI infrastructure.
- Reuse `ai-evaluation.service.ts`.
- Reuse the existing AI service and Ollama client.
- Do not create another AI client.
- Do not create another LLM configuration system.
- Do not hard-code the Ollama URL.
- Do not hard-code the model name.
- Do not duplicate ATS or Job Matching evaluation logic unnecessarily.
- Keep recommendation-specific business logic inside the Resume Recommendation service.
- Validate all input before processing.
- Validate all AI output before persistence.
- Preserve recommendation history.
- Never overwrite previous recommendation evaluations.
- Follow existing HireStack architecture and naming conventions.
- Follow existing API response conventions.
- Follow existing error-handling conventions.

---

# 3. Existing Codebase Inspection

Before implementation, inspect the existing repository.

The coding agent must first identify the actual current structure and implementation of:

## AI Module

Inspect:

- `src/modules/ai`
- AI controller
- AI routes
- AI service
- `ai-evaluation.service.ts`
- AI configuration
- AI constants
- AI types
- AI schemas
- AI prompts
- AI utilities
- `ai.swagger.ts`

## Existing AI Features

Inspect:

- Resume Parser
- ATS Score
- Job Matching

Determine:

- How requests are validated
- How services are structured
- How AI prompts are constructed
- How AI responses are parsed
- How schemas are validated
- How AI configuration is loaded
- How errors are handled
- How logging is performed
- How database records are stored
- How Swagger definitions are organized

## Existing Business Modules

Inspect:

- Candidate module
- Job module
- Application module
- Document/Resume handling
- Existing authorization rules

The implementation must use existing services and repository patterns where appropriate.

Do not assume file names, Prisma model names, or helper methods without inspecting the current codebase first.

---

# 4. Feature Architecture

The Resume Recommendation feature should follow this logical architecture:

```text
API Request
    ↓
AI Route
    ↓
Authentication
    ↓
Authorization
    ↓
AI Controller
    ↓
Resume Recommendation Service
    ↓
Candidate / Job Data
    ↓
Prompt Construction
    ↓
ai-evaluation.service.ts
    ↓
ai.service.ts
    ↓
Ollama
    ↓
Configured LLM Model
    ↓
JSON Parser
    ↓
Schema Validation
    ↓
Recommendation Business Validation
    ↓
Database Persistence
    ↓
API Response

# 5. Required Files and Structure

Follow the existing AI module structure.

Before creating files, inspect the current structure and reuse existing files wherever appropriate.

The feature may require components such as:

```text
src/modules/ai/

controllers/
    ai.controller.ts

services/
    ai.service.ts
    ai-evaluation.service.ts
    resume-parser.service.ts
    ats-score.service.ts
    job-matching.service.ts
    resume-recommendation.service.ts

prompts/
    resume.prompt.ts
    ats-score.prompt.ts
    job-matching.prompt.ts
    resume-recommendation.prompt.ts

schemas/
    resume.schema.ts
    resume-recommendation.schema.ts

types/
    resume.types.ts
    ats.types.ts
    matching.types.ts
    resume-recommendation.types.ts

routes/
    ai.routes.ts

swagger/
    ai.swagger.ts

The exact directory names must follow the actual repository structure.

Do not create duplicate files when an existing file already provides the required functionality.

6. Resume Recommendation Service

Create or extend the Resume Recommendation service according to the existing AI service architecture.

The service should provide functionality for:

General Review

Accept a candidate ID and generate recommendations based on the candidate's available resume information.

Job-Specific Review

Accept a candidate ID and job ID and generate recommendations based on:

Candidate resume
Candidate profile information
Selected job
Job requirements
Job responsibilities
Required skills
Experience requirements
Education requirements

The service must:

Validate the request.
Load the candidate.
Verify candidate access.
Load the active resume.
Verify sufficient resume information.
Load job information when required.
Verify job access.
Build the recommendation context.
Build the AI prompt.
Invoke the existing AI evaluation infrastructure.
Parse the AI response.
Validate the response schema.
Perform business validation.
Persist the recommendation.
Return the structured result.
7. General Resume Review Implementation

The General Resume Review must operate without a job ID.

The service should collect available candidate information such as:

Resume text
Professional summary
Skills
Experience
Education
Projects
Certifications
Other verified resume information

The AI evaluation should identify meaningful improvements related to:

Summary
Experience
Skills
Education
Projects
Certifications
Keywords
ATS optimization
Structure
Clarity
Consistency

The implementation must not require a job for this mode.

If information is unavailable, the system must represent it as missing rather than inventing content.

8. Job-Specific Recommendation Implementation

The Job-Specific Resume Optimization mode must require:

candidateId
jobId

The service must load both candidate and job information.

The job context should include, where available:

Job title
Description
Requirements
Responsibilities
Required skills
Minimum experience
Maximum experience
Education requirements
Other relevant job information

The candidate context should include the candidate's available verified information.

The AI must evaluate how well the candidate's existing information is represented against the selected job.

The implementation must distinguish between:

Skill exists but is poorly represented

and:

Skill is not present in available candidate information

A missing keyword must not automatically be interpreted as proof that the candidate lacks the skill.

9. Evidence-Based Recommendation Validation

The implementation must prevent unsupported recommendations.

The AI must not create:

Fake skills
Fake experience
Fake projects
Fake certifications
Fake achievements
Fake employers
Fake job titles
Fake education
Fake qualifications

Recommendations must be based on the information provided to the AI.

For example, if the candidate has backend development experience but the resume description does not clearly mention API development, the recommendation may suggest making existing API experience clearer if the candidate data supports it.

However, if API development is completely absent from available candidate information, the system must not instruct the candidate to claim API experience.

The implementation should perform business-level validation after schema validation where practical.

10. Prompt Implementation

Create or extend the Resume Recommendation prompt using the existing prompt architecture.

The prompt must clearly define:

AI role
Evaluation mode
Candidate information
Job information when applicable
Evidence-based rules
Recommendation categories
Recommendation priorities
Required output structure
No-fabrication rules

The prompt must instruct the model to return structured JSON only.

The prompt must support both:

GENERAL

and:

JOB_SPECIFIC

evaluation modes.

The prompt must not contain hard-coded candidate information or job information.

Runtime candidate and job data must be injected into the prompt through the existing prompt-building mechanism.

The prompt must have a version identifier so historical evaluations can record which prompt version was used.

11. AI Evaluation Integration

The Resume Recommendation feature must use:

ai-evaluation.service.ts

as the shared AI evaluation layer.

The Resume Recommendation service must not directly create another Ollama client or bypass the existing AI service.

The expected flow is:

ResumeRecommendationService
        ↓
ai-evaluation.service.ts
        ↓
ai.service.ts
        ↓
Existing AI Configuration
        ↓
Ollama
        ↓
Configured LLM

The AI model must be obtained from the existing AI configuration.

The implementation must not hard-code:

llama3.2

or the Ollama server URL inside the recommendation service.

The same principle applies to:

timeout
temperature
model settings
retry configuration

when those values are already controlled by the existing AI configuration.

# 12. Schema and Type Design

Create or extend the Resume Recommendation types and schemas following the existing HireStack AI conventions.

The request schema must support both recommendation modes.

## General Review Request

Required:

- `candidateId`

## Job-Specific Review Request

Required:

- `candidateId`
- `jobId`

The schema must ensure that the request cannot contain an invalid or unsupported evaluation mode.

The response schema must validate:

- Recommendation mode
- Candidate ID
- Job ID when applicable
- Overall summary
- Recommendations
- Recommendation category
- Priority
- Current issue
- Recommendation
- Reason
- Evidence
- Expected improvement
- Job requirement when applicable

The schema must reject:

- Invalid recommendation categories
- Invalid priorities
- Missing required fields
- Incorrect data types
- Malformed AI responses

AI output must never be persisted before schema validation succeeds.

---

# 13. Recommendation Persistence

Every successful recommendation evaluation must be stored in the database.

The implementation must preserve historical evaluations.

A new generation must create a new record rather than update an existing recommendation.

The persisted record should contain, where supported by the existing database design:

- Candidate ID
- Job ID when applicable
- Recommendation mode
- Overall summary
- Recommendations
- AI model
- Prompt version
- Created timestamp
- Updated timestamp

The implementation must inspect the existing Prisma schema before creating or modifying database models.

Do not create a duplicate model if an existing evaluation/history model can support the feature appropriately.

If a new Prisma model is required, follow the existing naming and relation conventions.

---

# 14. Controller Implementation

The AI controller must expose the Resume Recommendation operations through the existing AI controller architecture.

The controller should remain thin.

It must be responsible for:

1. Reading the authenticated user.
2. Validating authentication.
3. Parsing request input through the appropriate schema.
4. Calling the Resume Recommendation service.
5. Returning the standardized API response.

Business logic must remain inside the service layer.

The controller must not:

- Build AI prompts.
- Call Ollama directly.
- Parse LLM JSON.
- Perform database operations.
- Implement recommendation logic.

---

# 15. Route Implementation

Resume Recommendation routes must be added to the existing AI route structure.

Routes must use:

- Existing authentication middleware
- Existing role authorization middleware
- Existing async handler
- Existing controller
- Existing request validation conventions

Expected operations include:

```text
POST /api/v1/ai/resume-recommendations
POST /api/v1/ai/resume-recommendations/job
GET  /api/v1/ai/resume-recommendations/history/:candidateId
GET  /api/v1/ai/resume-recommendations/:id

The exact route prefix must follow the existing AI route configuration.

Do not create a separate Express router for Resume Recommendations unless the existing architecture requires it.

16. Authorization Rules

Authorization must follow the existing HireStack access-control implementation.

Before generating or retrieving recommendations, verify that the authenticated user has permission to access the relevant candidate and job.

Candidate

A candidate may:

Generate recommendations for their own resume.
View their own recommendation history.
View their own recommendation details.

A candidate must not access another candidate's recommendations.

Recruiter

A recruiter may access recommendations only for candidates and jobs they are authorized to access according to the existing recruitment/job assignment rules.

Company Admin

A company admin may access recommendations within the company scope according to existing company-level authorization rules.

Do not introduce a separate authorization system for Resume Recommendations.

17. History Retrieval

The history endpoint must return previous recommendation evaluations without modifying them.

History should support identifying:

Recommendation ID
Candidate
Job when applicable
Evaluation mode
Overall summary
AI model
Prompt version
Created timestamp

The implementation should follow the existing pagination conventions if the project already uses pagination for historical collections.

History retrieval must respect authorization and company/resource boundaries.

18. Regeneration Behavior

When a user requests recommendations again:

Existing Recommendation
        ↓
Preserved
        ↓
New Evaluation
        ↓
New Recommendation Record

The implementation must never overwrite the previous evaluation.

The new evaluation must record the current:

Candidate information
Job information when applicable
AI model
Prompt version
Generation timestamp

This allows future comparison between recommendation versions.

19. Swagger Integration

All Resume Recommendation Swagger definitions must be added to the existing:

ai.swagger.ts

Do not create:

resume-recommendation.swagger.ts

or another feature-specific Swagger file unless the existing architecture already requires it.

Swagger documentation should cover:

General recommendation request
Job-specific recommendation request
Recommendation response
Recommendation history response
Recommendation detail response
Error responses
Authentication requirements

Swagger schemas must match the actual TypeScript/Zod response structures.

Do not document fields that are not actually returned by the implementation.

20. Error Handling and Logging

Use the existing HireStack error framework.

Expected errors include:

Invalid request
Unauthenticated request
Unauthorized access
Candidate not found
Job not found
Resume not found
Insufficient resume information
Invalid AI response
AI timeout
AI service failure
Schema validation failure
Database failure

The service must not expose:

Raw stack traces
Internal file paths
Complete AI prompts
Complete resume contents
Internal infrastructure details

Logging should provide enough information to diagnose failures while avoiding unnecessary sensitive candidate data.

Important events should be logged consistently with the existing AI module logging pattern.

21. Testing and Smoke Test Requirements

The implementation must include appropriate tests according to the existing project testing structure.

At minimum verify:

General Review
Valid candidate generates recommendations.
Missing candidate is rejected.
Missing resume is rejected.
Invalid request is rejected.
AI response is validated.
Successful recommendation is persisted.
Job-Specific Review
Valid candidate and job generate recommendations.
Missing candidate is rejected.
Missing job is rejected.
Unauthorized recruiter access is rejected.
Missing resume is rejected.
Job-specific context is passed to the AI evaluation.
Successful recommendation is persisted.
History
History can be retrieved.
Previous evaluations remain unchanged.
Multiple generations create multiple records.
Unauthorized history access is rejected.
AI Failure
Invalid JSON is handled.
Invalid schema response is handled.
Empty response is handled.
AI timeout/failure is handled.
Infrastructure

Verify:

TypeScript type-check passes.
Build succeeds.
Existing AI features still work.
Existing ATS Score functionality is not broken.
Existing Job Matching functionality is not broken.
Existing Resume Parser functionality is not broken.
Swagger loads successfully.

The smoke test must verify the complete request flow:

Request
  ↓
Authentication
  ↓
Authorization
  ↓
Validation
  ↓
Resume Recommendation Service
  ↓
AI Evaluation
  ↓
Schema Validation
  ↓
Persistence
  ↓
API Response
22. Definition of Done

Resume Recommendations are considered complete only when all of the following are satisfied:

 General Resume Review implemented.
 Job-Specific Resume Optimization implemented.
 Existing AI infrastructure reused.
 ai-evaluation.service.ts reused.
 Existing AI configuration reused.
 No hard-coded Ollama URL.
 No hard-coded model configuration.
 Recommendation prompt implemented.
 Request schemas implemented.
 Response schemas implemented.
 TypeScript types implemented.
 Database persistence implemented.
 Recommendation history preserved.
 Regeneration creates a new history record.
 Authentication implemented.
 Authorization implemented.
 Candidate access boundaries enforced.
 Recruiter job/candidate access enforced.
 Company boundaries enforced.
 Swagger added to ai.swagger.ts.
 Error handling follows existing architecture.
 Sensitive resume information is not unnecessarily logged.
 General recommendation smoke test passes.
 Job-specific recommendation smoke test passes.
 History smoke test passes.
 Invalid AI response handling verified.
 Type-check passes.
 Build passes.
 Existing Phase 2 AI features remain functional.
 Final code review completed.