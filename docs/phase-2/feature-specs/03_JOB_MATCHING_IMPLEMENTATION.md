# HireStack AI Job Matching
## Phase 2 – Stage 4
## Implementation Specification

Version: 1.0.0

Status: Ready for Development

---

# 1. Purpose

This document defines the implementation requirements for the AI Job Matching Engine.

Unlike the Product Requirements Document (PRD), this document specifies exactly how the feature must be implemented while preserving the existing HireStack architecture.

The implementation must reuse the existing AI infrastructure and must not introduce duplicate services, utilities, or architectural changes.

---

# 2. Read Before Implementation

Before writing any code, review the following documents.

## Master Documents

docs/phase-2/

- 01_AI_PRD.md
- 02_AI_ARCHITECTURE.md
- 03_AI_DATABASE.md
- 04_AI_API_SPEC.md
- 05_AI_SECURITY.md
- 06_AI_ROADMAP.md

## Previous AI Features

Review the completed implementations.

- Resume Parser
- ATS Score Engine

## Feature Specification

docs/phase-2/feature-specs/

- 03_JOB_MATCHING.md

Implementation must follow these documents.

---

# 3. Existing Architecture

The Job Matching Engine must be implemented inside the existing AI module.

Current module structure

src/modules/ai

clients/
config/
constants/
controllers/
dto/
hooks/
prompts/
routes/
schemas/
services/
swagger/
types/
utils/
validation/

index.ts

Architecture is final.

Do not redesign.

Do not rename folders.

Do not move files.

Do not replace existing AI services.

---

# 4. Existing Components

The following components already exist and MUST be reused.

## AI Infrastructure

✓ Ollama Client

✓ AI Configuration

✓ AiService

✓ Prompt Builder

✓ Json Parser

✓ Error Middleware

✓ Logging Framework

✓ Response Helpers

✓ Swagger Configuration

---

## Existing AI Features

Reuse

- Resume Parser
- ATS Score Engine

Do not duplicate existing implementations.

---

## Existing Business Modules

Reuse

- Candidate Module
- Job Module
- Application Module
- Company Module
- Authentication
- Authorization
- Prisma Repositories

Do not duplicate business logic.

---

# 5. Files To Create

Create only the following files if they do not already exist.

prompts/

job-matching.prompt.ts

schemas/

job-matching.schema.ts

types/

job-matching.types.ts

services/

job-matching.service.ts

---

# 6. Files To Modify

Merge into existing files.

controllers/

ai.controller.ts

routes/

ai.routes.ts

swagger/

ai.swagger.ts

swagger/

ai.schemas.ts

services/

index.ts

types/

index.ts

Never overwrite existing code.

Only merge.

---

# 7. Files That Must Not Change

Do not modify

clients/

config/

AiService

Prompt Builder

Json Parser

Resume Parser

Authentication

Authorization

Logger

Global Error Middleware

The ATS Score Engine should only be modified if a shared bug or enhancement benefits both ATS Score and Job Matching.

Do not duplicate ATS evaluation logic.

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
    "matches": []
}

---

## Get Job Matching History

GET

/api/v1/ai/job-matching/:jobId

---

## Get Candidate Match Details

GET

/api/v1/ai/job-matching/:jobId/:candidateId

---

# 9. Processing Pipeline

Follow this exact sequence.

Validate JWT

↓

Validate Role

↓

Validate Request

↓

Load Job

↓

Load Applications

↓

Loop Through Applications

↓

Load Candidate

↓

Invoke ATS Score Service

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

The sequence must not be modified.

# 10. Business Logic
The service shall

Retrieve Job

Retrieve Applications

Retrieve Candidate

Invoke ATS Score Service

Receive ATS Evaluation

Persist JobMatch

Repeat

Sort Results

Return Ranked Candidates

Controllers must remain thin.

Business logic belongs only inside services.

The Job Matching Engine must never duplicate AI evaluation logic already implemented inside the ATS Score Engine.

---

# 11. Database Rules

Inspect the existing Prisma schema.

If a JobMatch model already exists,

reuse it.

Otherwise create it following the existing Prisma naming conventions.

Every execution creates a NEW JobMatch record.

Never overwrite previous matching history.

Store

- jobId
- candidateId
- matchPercentage
- skillMatch
- experienceMatch
- educationMatch
- projectMatch
- keywordMatch
- strengths
- missingSkills
- overallReason
- recommendation
- aiModel
- promptVersion
- createdAt
- updatedAt

Maintain complete historical records.

---

# 12. AI Rules

The Job Matching Engine must never communicate directly with ChatOllama.

The Job Matching Engine must never build prompts directly.

The Job Matching Engine must reuse the existing ATS Score Engine for candidate evaluation.

The ATS Score Engine already performs

- Prompt generation
- AI communication
- JSON parsing
- Schema validation
- Score calculation

The Job Matching Engine is responsible only for

- Loading applications
- Invoking ATS evaluation
- Creating JobMatch history
- Ranking candidates
- Returning sorted results

No duplicate AI evaluation logic is permitted.
# 13. Validation Rules

Validate

- Job Exists
- Job Is Active
- Applications Exist
- Candidate Exists
- Parsed Resume Exists
- Resume Contains Sufficient Information
- Valid UUID
- Valid AI JSON
- Valid Job Matching Schema
- Match Percentage between 0 and 100

Reuse the existing ValidationError framework.

---

# 14. Logging

Reuse the existing logger.

Log

Job Matching Started

Job Loaded

Applications Loaded

Candidate Loaded

Prompt Generated

AI Request Sent

AI Response Received

AI Response Time

Schema Validation Passed

JobMatch Stored

Candidate Matching Complete

Job Matching Completed

Job Matching Failed

Never log

- Resume contents
- Job description
- Personal information

Include identifiers where appropriate.

Example

Candidate Loaded (candidateId)

Job Loaded (jobId)

JobMatch Stored (matchPercentage)

---

# 15. Swagger

Do NOT create

job-matching.swagger.ts

Reuse

src/modules/ai/swagger/

ai.swagger.ts

ai.schemas.ts

Document

POST

/api/v1/ai/job-matching

GET

/api/v1/ai/job-matching/:jobId

GET

/api/v1/ai/job-matching/:jobId/:candidateId

Include

- Summary
- Description
- JWT Authentication
- Role Authorization
- Request Schema
- Response Schema
- 400
- 401
- 403
- 404
- 422
- 500
- Example Request
- Example Response

Maintain the existing Swagger style.

---

# 16. Error Handling

Reuse the existing global error handling framework.

Do not introduce new response formats.

Handle the following scenarios.

## Validation Errors

- Invalid Job ID
- Invalid Request Body
- Invalid UUID
- Missing Required Fields

---

## Business Errors

- Job Not Found
- Job Not Active
- No Applications Found
- Candidate Not Found
- Resume Not Parsed
- Resume Contains Insufficient Information

---

## AI Errors

- AI Timeout
- Empty AI Response
- Invalid JSON Response
- Schema Validation Failure

---

## Database Errors

- Failed to Save JobMatch
- Prisma Errors
- Transaction Failures

---

## Unexpected Errors

Catch all unexpected exceptions.

Log the error using the existing logging framework.

Return standardized API responses using the existing response helpers.

Never expose internal server details.

---

# 17. Code Quality Rules

The implementation must follow the existing HireStack coding standards.

Requirements

- Strict TypeScript
- No any types
- SOLID Principles
- Thin Controllers
- Business Logic only inside Services
- Reuse existing repositories
- Reuse existing services
- Reuse existing middleware
- Reuse existing AI infrastructure
- No duplicate code
- No breaking changes
- Consistent naming conventions
- Small reusable methods
- Readable code
- Proper comments where necessary

Never communicate directly with ChatOllama.

Always use

AiService.generate()

---

# 18. Performance Considerations

The implementation should support future scalability.

Current Version

- Sequential ATS evaluations
- Preserve AI evaluation history
- Store every JobMatch

Future versions may introduce

- Parallel ATS execution
- Background queue processing
- Incremental matching
- Caching

without changing the public API.
---

# 19. Testing Requirements

Verify the following scenarios.

## Successful Cases

✓ Valid Job

✓ Applications Exist

✓ Candidate Resume Parsed

✓ AI Response Valid

✓ JobMatch Stored

✓ Ranked Candidate List Returned

---

## Validation Cases

✓ Invalid UUID

✓ Invalid Request Body

✓ Missing Job

✓ Missing Candidate

✓ Missing Resume

✓ Empty Applications

---

## AI Cases

✓ Invalid JSON

✓ AI Timeout

✓ Schema Validation Failure

✓ Empty AI Response

---

## Security

✓ JWT Authentication

✓ Role Authorization

✓ Recruiter Access Validation

---

## Swagger

✓ Swagger Renders Successfully

✓ Request Schema Correct

✓ Response Schema Correct

---

## Build Verification

✓ npm run type-check

✓ npm run build

---

# 20. Definition of Done

The Job Matching Engine is considered complete only when all of the following are satisfied.

✓ Job Matching Prompt Created

✓ Job Matching Types Created

✓ Job Matching Schema Created

✓ Job Matching Service Implemented

✓ Controller Updated

✓ Routes Added

✓ Candidate Module Reused

✓ Job Module Reused

✓ Application Module Reused

✓ Resume Parser Reused

✓ ATS Infrastructure Reused

✓ AiService Reused

✓ PromptBuilder Reused

✓ JsonParser Reused

✓ JobMatch History Stored

✓ Logging Implemented

✓ Validation Implemented

✓ Swagger Updated

✓ Error Handling Complete

✓ TypeScript Compiles

✓ Build Passes

✓ No Duplicate Code

✓ No Breaking Changes

✓ Production Ready
✓ ATS Score Service Reused

✓ No Duplicate AI Prompt

✓ No Duplicate AI Evaluation Logic

✓ Single AI Evaluation Strategy Maintained

---

# 21. Coding Agent Instructions

Before writing code

Review

- Existing AI Module
- Resume Parser
- ATS Score Engine
- Candidate Module
- Job Module
- Application Module
- Prisma Schema

The Job Matching Engine must reuse the ATS Score Engine wherever possible.

Do not create a second AI evaluation pipeline.

Do not duplicate prompts, AI communication, JSON parsing, or schema validation.

The ATS Score Engine remains the single source of truth for candidate evaluation.

Provide

1. Files to Create

2. Files to Modify

3. Prisma Changes Required

4. Potential Risks

5. Implementation Plan

If any shared module requires modification

STOP

Review the existing implementation first.

Do not guess.

Do not invent repository methods.

Reuse existing implementations wherever possible.

Only after completing the review should implementation begin.

---

# 22. Final Review Checklist

Before marking the feature complete verify.

Architecture preserved

No duplicate implementations

Existing AI infrastructure reused

Existing Resume Parser reused

Existing ATS Score reused

Existing Candidate Module reused

Existing Job Module reused

Existing Application Module reused

Swagger updated

Logging implemented

Validation complete

Error handling complete

JobMatch history preserved

TypeScript clean

Build successful

Production-ready implementation

Only after every checklist item passes should the AI Job Matching Engine be considered complete.


ATS Score Service Reused

No Duplicate AI Prompt

No Duplicate AI Communication

No Duplicate JSON Parsing

No Duplicate Schema Validation

Single AI Evaluation Strategy Maintained