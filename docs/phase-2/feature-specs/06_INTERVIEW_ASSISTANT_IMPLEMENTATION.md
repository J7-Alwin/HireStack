# HireStack AI Interview Assistant

## Phase 2 – Stage 6 Implementation Plan

Version: 1.0.0

Status: Planned

---

# 1. Implementation Objective

Implement the Interview Assistant using the existing HireStack AI architecture.

The implementation must reuse the existing:

- `ai-evaluation.service.ts`
- `ai.service.ts`
- Ollama client
- AI configuration
- PromptBuilder
- JsonParser
- Zod validation
- Authentication
- Authorization
- Error handling
- Logging
- Prisma infrastructure

No duplicate AI infrastructure should be introduced.

---

# 2. Implementation Order

The implementation must follow this order:

```text
Database
   ↓
Types
   ↓
Schemas
   ↓
Prompt
   ↓
Service
   ↓
Controller
   ↓
Routes
   ↓
Swagger
   ↓
Tests
   ↓
Regression Tests
   ↓
Production Review

Do not start with controllers or routes before the underlying service contract is finalized.

3. Step 1 – Database Model

Update:

prisma/schema.prisma

Create:

InterviewAssistant

Suggested structure:

model InterviewAssistant {
  id              String   @id @default(cuid())
  candidateId     String
  jobId           String?
  mode            InterviewAssistantMode
  overallSummary  String
  questions       Json
  aiModel         String
  promptVersion   String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  candidate       Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  job             Job?       @relation(fields: [jobId], references: [id], onDelete: SetNull)

  @@index([candidateId])
  @@index([jobId])
  @@index([candidateId, createdAt])
}

enum InterviewAssistantMode {
  GENERAL
  JOB_SPECIFIC
}

The exact relation syntax must follow the existing Prisma schema.

Requirements:

Candidate deletion must remove interview records.
Job deletion should preserve interview history and set jobId to null.
Historical records must not be overwritten.
Add indexes needed by history queries.

Do not modify unrelated database models unnecessarily.

4. Step 2 – Migration

Create a dedicated Prisma migration for the Interview Assistant.

The migration must contain only the changes required for:

InterviewAssistantMode
InterviewAssistant
Required indexes
Required foreign keys

Do NOT modify existing historical migrations.

Run:

npx prisma validate

Then apply the migration using the project's existing migration workflow.

Verify:

npx prisma migrate status

Do not introduce synthetic production data or fabricated defaults.

5. Step 3 – Types

Create:

src/modules/ai/types/interview.types.ts

Define strict types for:

Interview mode
Question category
Difficulty
General request
Job-specific request
Interview question
Interview response
History response

Suggested enums:

GENERAL
JOB_SPECIFIC

Question categories:

TECHNICAL
HR
BEHAVIORAL
PROJECT
ROLE_SPECIFIC
FOLLOW_UP

Difficulty:

EASY
MEDIUM
HARD

Do not use any unless there is a documented unavoidable boundary.

6. Step 4 – Zod Schemas

Create:

src/modules/ai/schemas/interview.schema.ts

Implement schemas for:

General Request
{
  "candidateId": "..."
}
Job-Specific Request
{
  "candidateId": "...",
  "jobId": "..."
}
Route Parameters

Create dedicated schemas for:

candidateId
id
AI Response

Validate:

overallSummary
questions[]
questions[].category
questions[].question
questions[].reason
questions[].difficulty
questions[].followUps

The AI response must pass schema validation before database persistence.

7. Step 5 – Prompt

Create:

src/modules/ai/prompts/interview.prompt.ts

Use the same prompt configuration pattern already established by the ATS, Job Matching, and Resume Recommendation modules.

Configuration should include:

name
version
template

Initial version:

1.0.0

The prompt must clearly distinguish:

General Mode

Generate questions based on the candidate.

Job-Specific Mode

Generate questions based on both candidate and job.

The prompt must enforce:

Evidence-based questions
No fabricated candidate information
Structured JSON only
Appropriate difficulty
Relevant categories
Useful follow-ups
Job-specific relevance when job context exists

The prompt should not contain business authorization logic.

8. Step 6 – AI Evaluation Integration

Use:

ai-evaluation.service.ts

Do not create a new Ollama/LangChain client.

The service should receive the appropriate candidate/job context and invoke the existing AI evaluation pipeline.

The implementation must preserve the existing AI configuration behavior.

The model must continue to come from the existing AI configuration/environment rather than being hard-coded inside the Interview Assistant.

9. Step 7 – Interview Service

Create:

src/modules/ai/services/interview.service.ts

The service should expose methods similar to:

generateInterview()
generateJobSpecificInterview()
getInterviewHistory()
getInterviewDetails()
General Generation Flow
Validate Request
      ↓
Load Candidate
      ↓
Authorize Candidate
      ↓
Build Candidate Context
      ↓
Build Prompt
      ↓
AI Evaluation
      ↓
Parse JSON
      ↓
Validate Schema
      ↓
Persist Result
      ↓
Return Result
Job-Specific Generation Flow
Validate Request
      ↓
Load Candidate
      ↓
Authorize Candidate
      ↓
Load Job
      ↓
Authorize Job
      ↓
Build Candidate Context
      ↓
Build Job Context
      ↓
Build Prompt
      ↓
AI Evaluation
      ↓
Parse JSON
      ↓
Validate Schema
      ↓
Persist Result
      ↓
Return Result
10. Candidate Authorization

Implement authorization using the existing HireStack authorization architecture.

Candidate access must verify the candidate actually belongs to the authenticated user.

Do not perform a global candidate lookup by email alone if company scoping is required.

Prefer database-level ownership conditions.

Example concept:

candidateId
+
authenticated user ownership
+
company scope where applicable

Candidates must not be able to enumerate other candidate IDs.

11. Job Authorization

For job-specific interviews:

Admin

Verify company ownership.

Recruiter

Verify:

Same company
Recruiter has access to the job
Candidate

Verify:

Candidate owns the candidate profile
Candidate satisfies the existing application/job access rule

Authorization must happen before calling the AI.

12. Candidate Context

Build a structured candidate context using existing candidate data.

Include when available:

Skills
Experience
Education
Projects
Resume Summary
Certifications

Do not fabricate missing information.

Use:

None

or the existing project convention when information is unavailable.

13. Job Context

For job-specific interviews include:

Job Title
Description
Requirements
Responsibilities
Experience Minimum
Experience Maximum
Required Skills

Only include fields actually available from the Job model.

14. Interview Question Generation

The AI should generate a balanced interview kit.

The exact number of questions should be controlled by the implementation configuration/prompt rather than scattered hard-coded values.

Questions should cover relevant categories rather than blindly generating every category when evidence does not support it.

For example:

Technical
Behavioral
Project
HR
Role Specific

Follow-up questions are optional and should only be generated where useful.

15. Persistence

After successful AI validation:

Create:

InterviewAssistant

Store:

candidateId
jobId
mode
overallSummary
questions
aiModel
promptVersion

Never persist an invalid AI response.

Never overwrite previous interview generations.

16. History

Implement:

getInterviewHistory(candidateId)

Return historical records ordered according to the existing API convention, preferably newest first.

The response should contain enough metadata for the UI to distinguish:

General

from:

Job-Specific

History should be pagination-ready.

Do not expose unauthorized records.

17. Interview Details

Implement:

getInterviewDetails(id)

The method must:

Validate the ID
Load the interview
Load required ownership context
Verify authorization
Return the complete interview kit

Unauthorized users must receive the existing authorization error.

Do not reveal whether another user's interview ID exists where existing security conventions require resource hiding.

18. Controller

Update:

src/modules/ai/controllers/ai.controller.ts

Add handlers for:

generateInterview
generateJobSpecificInterview
getInterviewHistory
getInterviewDetails

The controller must remain thin.

It should handle:

Request extraction
Schema validation
Service invocation
Response formatting

Business logic must remain inside the service.

19. Routes

Update:

src/modules/ai/routes/ai.routes.ts

Add:

POST /api/v1/ai/interview
POST /api/v1/ai/interview/job
GET  /api/v1/ai/interview/history/:candidateId
GET  /api/v1/ai/interview/:id

Use existing:

JWT authentication
Role authorization
Middleware
Error handling
Validation conventions

Do not create a separate authentication mechanism.

20. Module Exports

Update the appropriate:

services/index.ts
types/index.ts
schemas/index.ts

Export:

interviewService
Interview types
Interview schemas

Follow the existing project export conventions.

21. Swagger

Update:

ai.swagger.ts
ai.schemas.ts

Document all four endpoints.

Add schemas for:

InterviewRequest
JobSpecificInterviewRequest
InterviewQuestion
InterviewResponse
InterviewHistoryResponse

Examples must use:

promptVersion: "1.0.0"

until the prompt version is intentionally changed.

Validate the generated Swagger configuration.

22. Error Handling

Use existing errors such as:

ValidationError
NotFoundError
ForbiddenError

as appropriate.

Handle:

Invalid request
Candidate not found
Job not found
Unauthorized access
AI timeout
AI unavailable
Invalid JSON
Schema validation failure
Database failure

Do not expose:

Stack traces
Raw database errors
Internal file paths
Internal Ollama errors
23. Logging

Use the existing logger.

Log meaningful lifecycle events such as:

Interview generation started
Candidate loaded
Job loaded
AI request sent
AI response received
Schema validation passed
Interview stored
Interview generation completed

Avoid logging:

Full resume contents
Sensitive candidate information
Complete AI prompts
Complete AI responses

Logs should contain IDs and safe metadata where possible.

24. Testing Strategy

Testing should remain proportional to the module.

Create:

tests/interview-assistant.integration.test.ts

and/or:

tests/smoke-interview-assistant.ts

Use the existing project's testing style.

25. Required Test Cases
General Generation

Test:

Valid candidate
Successful AI response
Correct persistence
Correct mode

Expected:

mode = GENERAL
jobId = null
Job-Specific Generation

Test:

Valid candidate
Valid job
Successful AI response
Correct persistence

Expected:

mode = JOB_SPECIFIC
jobId = selected job
Validation

Test:

Missing candidateId
Missing jobId
Invalid candidateId
Invalid jobId
Invalid route parameter
Authorization

Test:

Candidate accessing another candidate
Candidate accessing unauthorized job
Recruiter accessing another company's job
Recruiter without job assignment
Admin accessing another company
AI Failure

Test:

Invalid JSON
Schema-invalid JSON
AI timeout/failure

Verify that invalid AI results are NOT persisted.

History

Test:

Generate #1
Generate #2
Generate #3

Verify:

3 records

and that previous records remain unchanged.

Details

Test:

Valid interview ID
Non-existent ID
Unauthorized ID
26. Regression Testing

After Interview Assistant tests pass, run the existing Phase 2 regression tests.

At minimum:

npx tsx tests/ats-score.integration.test.ts
npx tsx tests/job-matching.integration.test.ts

Run the Resume Recommendations regression/smoke test according to the existing project test command.

Run Resume Parser regression tests if available.

The purpose is to verify that changes to shared AI infrastructure did not break existing modules.

27. Static Verification

Run:

npx prisma validate
npx prisma migrate status
npm run type-check
npm run build
npx eslint .

All must pass before merge.

28. Final Smoke Test

Run the dedicated Interview Assistant smoke test.

Minimum successful flow:

Create/Test Candidate
        ↓
Generate General Interview
        ↓
Verify Database Record
        ↓
Generate Job-Specific Interview
        ↓
Verify Database Record
        ↓
Retrieve History
        ↓
Retrieve Details
        ↓
Verify Authorization
        ↓
Verify AI Failure Handling
        ↓
Cleanup

The smoke test must clean up all test-created records.

Use try/finally cleanup where appropriate.

Do not delete unrelated development/production data.

29. Production Readiness Review

Before merge, verify:

Architecture
 Existing AI infrastructure reused
 No duplicate Ollama client
 No duplicate AI service
 No unnecessary infrastructure
Database
 Dedicated migration
 No fabricated production data
 Correct foreign keys
 Correct delete behavior
 History preserved
Security
 Authentication enforced
 Candidate ownership enforced
 Company scope enforced
 Recruiter job access enforced
 Candidate job access enforced
AI
 Model comes from existing AI configuration
 Prompt version stored
 JSON validated
 Hallucination controls included
API
 Request validation
 Route parameter validation
 Consistent error handling
 Swagger documentation
Testing
 Smoke test passes
 Integration test passes
 ATS regression passes
 Job Matching regression passes
 Resume Recommendations regression passes
 Resume Parser regression passes
 Type-check passes
 Build passes
 ESLint passes
 Prisma validation passes
30. Merge Criteria

Do NOT merge if:

AI responses are persisted without validation
Authorization can be bypassed
Candidate data crosses company boundaries
Job-specific access is unrestricted
Existing AI modules regress
Prisma migration is unsafe
Build fails
Type-check fails
ESLint fails
Smoke tests fail

The module is ready for merge only when all mandatory checks pass.

31. Implementation Constraints

The implementation must remain within Version 1.0 scope.

Do NOT add:

Voice
Video
Live interviews
Answer scoring
RAG
Vector databases
Embeddings
Background queues
AI interviewer agents

unless explicitly requested in a later phase.

Do not refactor unrelated modules.

Do not modify ATS, Job Matching, or Resume Recommendations behavior unless required to maintain compatibility with shared infrastructure.

32. Expected Implementation Structure

The expected new files are approximately:

src/modules/ai/
│
├── prompts/
│   └── interview.prompt.ts
│
├── schemas/
│   └── interview.schema.ts
│
├── services/
│   └── interview.service.ts
│
├── types/
│   └── interview.types.ts
│
└── tests/
    └── interview-assistant.integration.test.ts

Existing files may be modified:

prisma/schema.prisma

src/modules/ai/controllers/ai.controller.ts
src/modules/ai/routes/ai.routes.ts
src/modules/ai/services/index.ts
src/modules/ai/types/index.ts
src/modules/ai/schemas/index.ts
src/modules/ai/swagger/ai.swagger.ts
src/modules/ai/swagger/ai.schemas.ts

The exact paths must follow the existing repository structure.

33. Final Deliverables

The completed module must provide:

Interview Assistant Prisma model
Safe Prisma migration
Interview prompt
Interview types
Zod schemas
Interview service
Controller integration
Route integration
Swagger documentation
General interview generation
Job-specific interview generation
Interview history
Interview details
Authorization
AI error handling
Smoke/integration tests
Regression verification
Production-readiness verification
34. Final Definition of Done

The Interview Assistant is complete when:

PRD
 ↓
Database
 ↓
Migration
 ↓
Types
 ↓
Schemas
 ↓
Prompt
 ↓
Service
 ↓
Controller
 ↓
Routes
 ↓
Swagger
 ↓
Tests
 ↓
Regression
 ↓
Build
 ↓
Production Review
 ↓
GO