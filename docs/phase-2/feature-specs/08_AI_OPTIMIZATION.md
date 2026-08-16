# HireStack AI — AI Optimization

## Phase 2 – Stage 8

**Version:** 1.0.0  
**Status:** In Development

---

# 1. Overview

The AI Optimization module is the final infrastructure-hardening stage of HireStack Phase 2.

Unlike previous stages, this module does not introduce a new recruiter-facing AI feature.

Its purpose is to improve the existing shared AI pipeline used by:

- ATS Score
- Job Matching
- Resume Recommendations
- Interview Assistant
- AI Insights

The optimization must be implemented centrally so existing AI modules continue using the same shared infrastructure without duplicated logic.

The existing AI behavior, API contracts, authorization rules, database models, and response schemas must remain backward compatible.

---

# 2. Objectives

The optimization layer must provide:

- Reliable LLM execution
- Controlled retry and timeout handling
- Safe response caching where applicable
- Duplicate-request protection
- Reduced unnecessary AI calls
- Improved AI request performance
- Consistent AI error handling
- Structured operational logging
- Safe monitoring metadata
- Protection against cross-tenant cache leakage
- Protection against duplicate database persistence
- Backward compatibility with all completed AI modules

---

# 3. Existing AI Pipeline

All AI features currently follow the shared evaluation architecture:

```text
AI Feature Service
        ↓
aiEvaluationService
        ↓
Prompt Builder
        ↓
AI Service
        ↓
Ollama Client
        ↓
Llama 3.2
        ↓
Raw AI Response
        ↓
JSON Parser
        ↓
Zod Schema Validation
        ↓
Business Validation
        ↓
Feature Service
        ↓
Database
        ↓
API Response

Stage 8 must optimize this pipeline without changing the responsibilities of the individual feature services.

4. Scope
4.1 In Scope

The following shared infrastructure improvements are included:

LLM timeout handling
Controlled retry mechanism
Retry classification
Response caching
Cache-key generation
Cache isolation
Duplicate-request protection
AI execution performance improvements
Structured AI execution logging
AI failure metrics/log metadata
Consistent error propagation
Regression testing
Production-readiness validation
4.2 Out of Scope

The following are NOT part of Stage 8:

New AI features
New recruiter-facing endpoints
RAG
Vector database
Embeddings
OCR
Vision models
Voice assistant
Multi-agent workflows
Changing Llama 3.2 to another model
Replacing Ollama
Rewriting existing AI feature services
Changing existing API response contracts
Changing existing authorization behavior

These remain future enhancements.

5. Design Principles

Stage 8 must follow these principles:

Centralized

Optimization logic must live in shared AI infrastructure rather than being duplicated across feature services.

Backward Compatible

Existing AI modules must continue working without requiring changes to their public APIs.

Deterministic

The same valid request and evaluation context must produce the same cache identity.

Tenant Safe

Cached AI responses must never be returned across:

Companies
Candidates
Jobs
Users
Failure Safe

A failed AI request must never create an incomplete or invalid database record.

Observable

AI execution should provide enough metadata for debugging and performance analysis without logging sensitive candidate information.

Privacy First

Never log:

Raw resumes
Resume PDF contents
Full candidate profiles
Full job descriptions
Full prompts
Raw LLM responses containing personal data
6. Retry & Timeout Handling
6.1 Timeout

The shared AI execution layer must enforce a configurable timeout.

The timeout value must come from centralized AI configuration rather than being hard-coded inside individual services.

Example configuration concept:

AI_TIMEOUT_MS

The exact configuration name must follow the existing AI configuration conventions.

6.2 Retry

Transient LLM failures may be retried.

Retryable failures may include:

Temporary Ollama connection failure
Network interruption
Temporary service unavailable error
Request timeout

Non-retryable failures must not be repeatedly retried.

Examples:

Invalid request
Invalid prompt configuration
Schema validation failure
Invalid business input
Authorization failure
6.3 Retry Limits

Retry attempts must be strictly bounded.

The system must never retry indefinitely.

The maximum number of attempts must be configurable.

Example:

initial attempt
      ↓
retry 1
      ↓
retry 2
      ↓
final failure

If all attempts fail, return the existing standardized AI error.

6.4 Backoff

Retries should use controlled backoff to prevent repeatedly hitting an unavailable Ollama service.

A simple bounded backoff strategy is sufficient.

Do not introduce unnecessary external queue infrastructure for Stage 8.

7. Response Caching
7.1 Purpose

Caching should reduce unnecessary repeated LLM calls when the same evaluation can safely reuse an existing valid result.

Caching must be implemented only where it does not conflict with the existing immutable-history behavior.

7.2 Cache Eligibility

Only deterministic evaluation results may be considered for caching.

The cache identity must account for all information that can change the AI result, including where applicable:

Feature type
Candidate ID
Job ID
Relevant evaluation input/version
Prompt version
AI model
Relevant configuration/version
7.3 Cache Isolation

A cache key must never rely only on a candidate ID or job ID.

The cache must be designed so that records cannot accidentally cross tenant boundaries.

At minimum, the identity must preserve the relevant company/candidate/job scope.

7.4 Prompt Version

Changing the prompt version must invalidate the previous cache identity.

For example:

promptVersion = 1.0.0

and:

promptVersion = 1.1.0

must not share the same cached response.

7.5 Model Version

Changing the configured AI model must also produce a different cache identity.

The cached result must record the model identity used for generation.

7.6 Cache Invalidation

Cache entries must not survive beyond their configured validity period.

The implementation must support configurable expiration/TTL.

The cache must not return stale results indefinitely.

7.7 Cache and History

Caching must NOT break the existing append-only history requirements.

A cache hit must not silently mutate an existing historical evaluation.

If the existing module contract requires a new historical record for each explicit evaluation request, that behavior must remain intact.

Caching should optimize AI generation, not rewrite historical audit semantics.

8. Duplicate Request Protection

The system must prevent accidental duplicate AI execution where the same request is submitted concurrently.

Examples:

Request A
Request A
Request A

submitted within a short period must not unnecessarily trigger multiple identical LLM executions when safe deduplication is possible.

The implementation must:

Generate a deterministic request identity
Detect an active identical evaluation
Avoid uncontrolled concurrent LLM calls
Return the appropriate result
Preserve existing authorization checks

Duplicate protection must happen only after authorization and validation.

An unauthorized request must never be able to discover another user's active AI request.

9. Performance Optimization
9.1 Database Access

Existing AI services should avoid unnecessary duplicate database queries.

The shared optimization work must not introduce N+1 query behavior.

9.2 PDF Processing

Resume PDF extraction should not be repeated unnecessarily during the same AI evaluation lifecycle.

If caching or reuse is introduced, it must remain safely scoped to the candidate/evaluation context.

Raw extracted resume text must not be stored in logs.

9.3 Prompt Construction

Prompt construction should avoid unnecessary repeated processing.

The existing centralized prompt builder should remain the source of prompt construction.

Do not create feature-specific duplicate prompt-building implementations.

9.4 AI Calls

Before calling Ollama, the system should verify whether:

The request is valid
The request is authorized
A safe reusable result exists
An identical request is already running

This prevents unnecessary LLM execution.

10. AI Monitoring & Logging

The shared AI layer should emit structured metadata for each AI execution.

Useful metadata includes:

Feature name
AI model
Prompt version
Execution duration
Success/failure status
Retry count
Cache hit/miss
Validation result
Error category

Example conceptual log:

AI Evaluation
feature=ATS_SCORE
model=llama3.2
promptVersion=1.0.0
durationMs=4200
retryCount=0
cacheHit=false
status=success
10.1 Sensitive Data Restrictions

Logs must never contain:

Resume text
PDF content
Candidate personal information
Email addresses
Phone numbers
Full job descriptions
Full prompts
Raw AI responses

Identifiers should only be logged where they are already considered safe operational metadata and according to existing project logging conventions.

11. Error Handling

All shared AI failures must map consistently to the application's existing error-handling architecture.

The following cases must be handled:

Timeout
Ollama
 ↓
Timeout
 ↓
Retry
 ↓
Final failure
 ↓
Standard AI error
Invalid JSON
LLM
 ↓
Invalid JSON
 ↓
JsonParser
 ↓
ValidationError

Invalid JSON must not be retried indefinitely.

Schema Failure
LLM
 ↓
Valid JSON
 ↓
Zod validation failure
 ↓
ValidationError

No incomplete database record may be created.

Ollama Failure
LLM unavailable
 ↓
Bounded retry
 ↓
Final failure
 ↓
Standard error

The API server must remain stable.

12. Database Safety

Stage 8 must not introduce unnecessary database changes.

A new database table should NOT be introduced merely for caching unless there is a demonstrated architectural requirement.

Existing evaluation tables remain the source of persisted AI history.

The optimization layer must preserve:

Candidate cascade behavior
Job SetNull behavior
Immutable history
Existing indexes
Existing tenant boundaries
13. Backward Compatibility

All completed AI modules must continue working:

Resume Parser
ATS Score
Job Matching
Resume Recommendations
Interview Assistant
AI Insights

Existing:

Request schemas
Response schemas
Routes
Authorization
Database models
Prompt contracts

must remain compatible unless a change is strictly required for optimization.

Any required shared-service change must be regression-tested against every dependent module.

14. Security Requirements
Authentication

Existing JWT authentication remains mandatory.

Authorization

Optimization must never bypass service-level authorization.

Authorization must occur before:

Cache lookup
Duplicate-request lookup
Historical result reuse
Multi-Tenant Isolation

No cache, deduplication mechanism, or optimization path may allow:

Company A
   ↓
access
   ↓
Company B AI result

This must be explicitly tested.

Prompt Injection

Existing prompt-injection protections must remain active.

Optimization must never treat cached AI output as trusted instructions.

Cached AI output remains untrusted generated data.

15. Testing Requirements

Stage 8 must include focused tests for:

Retry
Transient failure → retry succeeds
Transient failure → retries exhausted
Non-retryable failure → no retry
Timeout → bounded retry
Retry count does not exceed configured maximum
Cache
Valid cache hit
Cache miss
Expired cache
Different prompt version → cache miss
Different model → cache miss
Different job → cache miss
Different candidate → cache miss
Cross-company cache isolation
Duplicate Requests
Identical concurrent requests
Different requests
Unauthorized duplicate request
Failed duplicate request cleanup
Performance
Cache reduces unnecessary LLM execution
PDF extraction is not unnecessarily repeated
No N+1 database behavior introduced
Security
Cross-company isolation
Candidate isolation
Job isolation
Authorization occurs before cache access
No sensitive data in logs
Regression

All existing AI modules must continue passing:

ATS Score
Job Matching
Resume Recommendations
Interview Assistant
AI Insights
Resume Parser
16. Static Verification

The following must pass:

npx prisma validate
npx prisma migrate status
npm run type-check
npm run build
npx eslint .

No new migration should be created unless the implementation genuinely requires a database change.

17. Production Readiness Criteria

Stage 8 can be marked GO only when:

 Retry behavior is bounded
 Timeout is configurable
 Non-retryable failures are not retried
 Cache behavior is deterministic
 Cache TTL is enforced
 Prompt version invalidates cache
 Model changes invalidate cache
 Cache is tenant-safe
 Duplicate AI execution is controlled
 Authorization happens before cache/dedup lookup
 AI execution metrics/log metadata are available
 Sensitive information is excluded from logs
 Existing AI response contracts remain compatible
 No unnecessary database changes introduced
 All Stage 2–7 AI regression tests pass
 Prisma validation passes
 Type-check passes
 Build passes
 ESLint passes
 Production-readiness review passes
18. Final Phase 2 Validation

After Stage 8 implementation, perform a complete Phase 2 validation.

AI Modules
Resume Parser          → PASS
ATS Score              → PASS
Job Matching           → PASS
Resume Recommendations → PASS
Interview Assistant    → PASS
AI Insights            → PASS
AI Optimization        → PASS
Infrastructure
Ollama                 → PASS
Llama 3.2              → PASS
LangChain              → PASS
Shared AI Evaluation   → PASS
JSON Parsing           → PASS
Schema Validation      → PASS
Error Handling         → PASS
Monitoring             → PASS
Final Checks
Prisma Validation      → PASS
Migration Status       → PASS
TypeScript             → PASS
Build                  → PASS
ESLint                 → PASS
Regression Suite       → PASS
Security Review        → PASS
Production Review      → PASS
19. Completion

Stage 8 is complete only after the optimization changes have been implemented, tested, and verified without regressions to the previously completed AI modules.

The final result must provide a stable shared AI infrastructure capable of supporting the existing HireStack AI features efficiently and safely.

Future capabilities such as:

OCR
Vision Models
Embeddings
Vector Database
RAG
Voice Assistant
AI Copilot
Multi-Agent Workflows

remain outside Phase 2 and may be addressed in future phases.