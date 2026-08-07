# HireStack ATS Score Engine
## Phase 2 – Stage 3
## Implementation Specification

Version: 1.0.0

Status: Ready for Development

---

# 1. Purpose

This document defines the implementation requirements for the ATS Score Engine.

Unlike the Product Requirements Document (PRD), this document is intended for developers and coding agents. It specifies exactly how the feature must be implemented while preserving the existing HireStack architecture.

The implementation must reuse the existing AI infrastructure and must not introduce duplicate services, utilities, or architectural changes.

---

# 2. Read Before Implementation

Before writing any code, review the following documents.

## Master Documents

- 01_AI_PRD.md
- 02_AI_ARCHITECTURE.md
- 03_AI_DATABASE.md
- 04_AI_API_SPEC.md
- 05_AI_SECURITY.md
- 06_AI_ROADMAP.md

## Feature Specification

- feature-specs/02_ATS_SCORE.md

Implementation must follow these documents.

---

# 3. Existing Architecture

The ATS Score Engine must be implemented inside the existing AI module.

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

Do not move files.

Do not rename folders.

---

# 4. Existing Components

The following components already exist and MUST be reused.

## AI Infrastructure

✓ Ollama Client

✓ AI Configuration

✓ AI Service

✓ Prompt Builder

✓ JSON Parser

✓ Error Middleware

✓ Logging Framework

✓ Response Helpers

✓ Swagger Configuration

---

## Resume Parser

Already Completed

Do not modify its functionality.

Reuse only where necessary.

---

## Existing Business Modules

Reuse existing

Candidate Module

Job Module

Company Module

Authentication

Authorization

Repositories

Prisma

No duplicate business logic.

---

# 5. Files To Create

Create only the following files.

prompts/

ats-score.prompt.ts

schemas/

ats-score.schema.ts

types/

ats.types.ts

services/

ats-score.service.ts

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

Do not overwrite.

Always merge.

---

# 7. Files That Must Not Change

Do not modify

clients/

config/

resume-parser.service.ts

resume.prompt.ts

resume.schema.ts

pdf-extractor.ts

prompt-builder.ts

json-parser.ts

AiService

Ollama Client

Authentication Middleware

Logging Framework

Global Error Middleware

Unless a bug is discovered.

---

# 8. API Specification

Endpoint

POST

/api/v1/ai/ats-score

Authentication

JWT Required

Authorization

Company Admin

Recruiter

Request

application/json

{
    "candidateId": "...",
    "jobId": "..."
}

---

# 9. Processing Pipeline

The ATS Score Engine shall follow this exact sequence.

Receive Request

↓

JWT Validation

↓

Role Authorization

↓

Validate Request Body

↓

Retrieve Candidate

↓

Retrieve Parsed Resume

↓

Retrieve Job

↓

Retrieve Job Description

↓

Build ATS Prompt

↓

AiService.generate()

↓

Ollama

↓

Llama 3.2

↓

Receive JSON

↓

JSON Parser

↓

ATS Schema Validation

↓

Persist ATS Result

↓

Return ATS Report

The sequence shall not be modified.

---

# 10. Business Logic

The service shall

Retrieve Candidate

Retrieve Resume

Retrieve Job

Generate Prompt

Invoke AI

Validate AI JSON

Generate ATS Report

Store ATS Result

Return ATS Report

Controllers must remain thin.

Business logic belongs only inside services.

---

# 11. Database Rules

Reuse existing

Candidate Repository

Job Repository

Prisma Client

Repositories

If ATSScore table already exists

Reuse it.

If not

Create it following the database specification.

Do not duplicate database logic.

---

# 12. AI Rules

Never communicate directly with ChatOllama.

Always use

AiService

AiService internally uses

Ollama Client

Prompt generation must reuse

PromptBuilder

JSON extraction must reuse

JsonParser

---

# 13. Validation Rules

Validate

Candidate Exists

Job Exists

Parsed Resume Exists

Job Description Exists

Valid UUID

Valid AI JSON

Valid ATS Schema

Score Range

0–100

Validation failures must reuse the existing ValidationError framework.

---

# 14. Logging

Reuse existing logger.

Log

ATS Scoring Started

Candidate Loaded

Job Loaded

Prompt Generated

AI Request Sent

AI Response Received

AI Response Time

ATS Validation Passed

ATS Score Stored

ATS Scoring Completed

ATS Scoring Failed

Never log resume contents.

Never log job descriptions.

Never log personal information.

---

# 15. Error Handling

Reuse existing

Error Middleware

Response Helpers

Validation Errors

Do not create another response format.

Handle

Candidate Missing

Job Missing

Resume Missing

AI Timeout

Invalid JSON

Schema Failure

Database Failure

Unexpected Errors

---

# 16. Swagger

Do not create new Swagger files.

Merge into

swagger/

ai.swagger.ts

ai.schemas.ts

Document

POST

/api/v1/ai/ats-score

Include

Summary

Description

JWT Security

Request Schema

Response Schema

Error Responses

Example Request

Example Response

---

# 17. Code Quality Rules

Strict TypeScript

No any

SOLID Principles

Dependency Injection where applicable

Small Methods

Reusable Functions

No Duplicate Logic

Consistent Naming

Readable Code

No Hardcoded Values

No Circular Dependencies

No Breaking Changes

---

# 18. Testing Requirements

Verify

✓ Valid Candidate

✓ Valid Job

✓ Candidate Missing

✓ Job Missing

✓ Resume Missing

✓ Invalid UUID

✓ Invalid JSON

✓ Invalid AI Response

✓ Schema Validation Failure

✓ ATS Result Stored

✓ Swagger Rendering

✓ Authentication

✓ Authorization

---

# 19. Definition of Done

The ATS Score Engine is complete only when all of the following are satisfied.

✓ ATS Prompt Created

✓ ATS Types Created

✓ ATS Schema Created

✓ ATS Service Implemented

✓ Controller Updated

✓ Route Added

✓ Candidate Module Reused

✓ Job Module Reused

✓ AI Service Reused

✓ Prompt Builder Reused

✓ JsonParser Reused

✓ ATS Result Persisted

✓ Logging Implemented

✓ Validation Implemented

✓ Swagger Updated

✓ Error Handling Complete

✓ TypeScript Compiles

✓ No Duplicate Code

✓ Architecture Preserved

✓ Production Ready

---

# 20. Coding Agent Instructions

Before generating code

Review the existing implementation.

Provide

1.

Files to Create

2.

Files to Modify

3.

Reason for every modification

4.

Potential risks

If Candidate Module

Job Module

Prisma Schema

Logger

Swagger

Repositories

or any shared utility is required

STOP.

Request those files.

Do not guess.

Do not invent implementations.

Generate code only after reviewing the existing project structure.

---

# 21. Final Review Checklist

Before marking the feature complete verify

Architecture preserved

No duplicate implementations

Existing AI infrastructure reused

Business modules reused

Swagger updated

Logging implemented

Validation complete

Error handling complete

Database persistence verified

TypeScript clean

Production-ready implementation

Only after every checklist item passes should the ATS Score Engine be considered complete.