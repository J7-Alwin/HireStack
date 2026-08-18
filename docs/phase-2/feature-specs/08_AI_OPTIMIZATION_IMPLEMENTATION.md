# HireStack AI — AI Optimization Implementation Plan

## Phase 2 – Stage 8

**Version:** 1.0.0  
**Status:** In Development

---

# 1. Purpose

This document defines the implementation plan for the final Phase 2 module: **AI Optimization**.

The objective is to harden and optimize the existing shared AI infrastructure used by:

- Resume Parser
- ATS Score
- Job Matching
- Resume Recommendations
- Interview Assistant
- AI Insights

This module must improve reliability, performance, observability, and operational safety without changing existing business-feature contracts.

---

# 2. Implementation Principles

The implementation must follow these rules:

1. Optimize the shared AI infrastructure rather than duplicating logic in feature services.
2. Preserve existing API contracts.
3. Preserve existing authorization behavior.
4. Preserve existing database history semantics.
5. Keep AI failures controlled and predictable.
6. Never allow caching or deduplication to bypass authorization.
7. Never allow cached data to cross company, candidate, or job boundaries.
8. Do not introduce a database table unless genuinely required.
9. Do not log sensitive candidate, resume, job, prompt, or raw LLM data.
10. Every shared change must be regression-tested against existing AI modules.

---

# 3. Existing Architecture

The implementation must build on the existing architecture:

```text
AI Feature Service
        ↓
AI Evaluation Service
        ↓
Prompt Builder
        ↓
AI Service
        ↓
Ollama Client
        ↓
Llama 3.2
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

Stage 8 must improve this pipeline rather than replacing it.

4. Implementation Scope

Stage 8 is divided into four implementation parts.

Part 1
Core AI Execution Hardening
        ↓
Part 2
Safe Caching & Duplicate Request Protection
        ↓
Part 3
Performance & Monitoring
        ↓
Part 4
Full Regression & Production Readiness
5. Part 1 — Core AI Execution Hardening
5.1 Objective

Make the shared AI execution layer resilient to transient Ollama failures and timeouts.

The first implementation part must focus only on:

Configurable timeout
Retry handling
Retry classification
Bounded retry count
Backoff
Consistent error propagation
Execution metadata

Do not implement caching in Part 1.

6. AI Configuration

Review the existing:

src/modules/ai/config/ai.config.ts

and extend the existing configuration pattern rather than creating a separate configuration system.

Configuration should support:

model
timeout
maxRetries
retryBackoff

The exact environment variable names must follow the project's existing configuration conventions.

Configuration must:

Have safe defaults for development
Validate numeric values
Reject invalid negative values
Prevent unlimited retries
Prevent unreasonable timeout values
Remain centralized

Do not hard-code timeout or retry values inside feature services.

7. Ollama Client Timeout

Review:

src/modules/ai/clients/ollama.client.ts

The Ollama client must support the configured timeout.

Conceptually:

AI Request
    ↓
Start timeout
    ↓
Ollama
    ↓
Response

If the timeout expires:

Timeout
   ↓
Retry decision

The implementation must not leave hanging requests indefinitely.

8. Retry Architecture

Retry handling should live in the shared AI infrastructure.

It must NOT be implemented independently inside:

ATS Score Service
Job Matching Service
Resume Recommendation Service
Interview Service
AI Insights Service

The shared layer should determine whether a failure is retryable.

9. Retryable Errors

Potential retryable failures:

Temporary Ollama connection failure
Temporary network failure
Service unavailable
Request timeout
Temporary transport errors

Retry count must be bounded.

Example:

Attempt 1
   ↓
Transient failure
   ↓
Backoff
   ↓
Attempt 2
   ↓
Transient failure
   ↓
Backoff
   ↓
Attempt 3
   ↓
Success / Final Failure
10. Non-Retryable Errors

The following should normally not trigger retries:

Authorization failure
Invalid request
Invalid prompt configuration
Invalid input
JSON parsing failure
Zod schema failure
Business validation failure

The exact classification must follow the existing error architecture.

11. Retry Backoff

Use a bounded backoff strategy.

The implementation must:

Avoid immediate repeated requests
Avoid infinite waiting
Respect maximum retry count
Remain configurable

No external queue or job-processing infrastructure should be introduced for Stage 8.

12. Error Propagation

After retry attempts are exhausted:

Ollama Failure
      ↓
Retry Logic
      ↓
Retry Limit Reached
      ↓
Existing AI Error Handling
      ↓
Global Error Handler
      ↓
API Response

The server must not crash.

No incomplete AI database record may be created.

13. Execution Metadata

The shared AI evaluation layer should internally track:

feature
model
promptVersion
durationMs
retryCount
status

This metadata may be used for logging and monitoring.

Do not expose internal operational metadata in existing API responses unless already supported by the API contract.

14. Part 1 Verification

Part 1 must verify:

Normal Ollama request succeeds
Timeout is respected
Transient failure retries
Retry eventually succeeds
Retry limit is respected
Non-retryable failure is not retried
Server remains stable after repeated failures
No incomplete database records are created
Existing AI services continue functioning

Required checks:

npx prisma validate
npm run type-check
npm run build
npx eslint .
15. Part 2 — Safe Response Caching
15.1 Objective

Reduce unnecessary repeated LLM calls while preserving:

Tenant isolation
Authorization
Prompt versioning
Model versioning
Evaluation history
Existing API contracts

Caching must be introduced only after Part 1 is stable.

16. Cache Architecture

First inspect the existing project dependencies and infrastructure.

Do not assume Redis or another external cache is already available.

If a cache library/infrastructure already exists, reuse it.

If no safe cache infrastructure exists, implement the smallest appropriate solution without introducing unnecessary production dependencies.

Do not create a database cache table unless there is a demonstrated need.

17. Cache Key

The cache key must include all information capable of changing the AI result.

At minimum, where applicable:

feature
company scope
candidate
job
prompt version
AI model
relevant input/version

Conceptually:

AI
:
FEATURE
:
COMPANY
:
CANDIDATE
:
JOB
:
PROMPT_VERSION
:
MODEL
:
INPUT_HASH

The exact implementation should use a stable hash rather than storing large raw inputs in the key.

18. Input Hashing

The cache identity must be deterministic.

Equivalent inputs should generate the same hash.

Changing relevant inputs must generate a different hash.

Do not place:

Resume text
Job description
Personal data

directly into logs or externally visible cache identifiers.

19. Cache Isolation

Cache lookup must occur only after authentication and authorization.

Correct order:

Request
 ↓
Authentication
 ↓
Input Validation
 ↓
Authorization
 ↓
Cache Lookup
 ↓
AI Evaluation if Cache Miss

Never:

Request
 ↓
Cache Lookup
 ↓
Authorization

This is mandatory.

20. Prompt Version Invalidation

Changing:

promptVersion

must produce a different cache key.

For example:

1.0.0 ≠ 1.1.0

Old cached results must never be returned for a new prompt version.

21. Model Invalidation

Changing the configured AI model must also invalidate the cache identity.

For example:

llama3.2 ≠ another-model

The model identity must be part of the cache key.

22. Cache TTL

Caching must support expiration.

TTL must be configurable.

Expired entries must be treated as cache misses.

The system must never return cached AI results indefinitely.

23. Cache and Immutable History

Caching must not break existing history behavior.

The implementation must distinguish between:

AI generation optimization

and:

database history persistence

A cache hit must not silently mutate existing records.

The existing feature contract for immutable historical evaluations must remain unchanged.

24. Part 2 Verification

Test:

Cache miss
Cache hit
Cache expiration
Prompt version change
Model change
Candidate change
Job change
Company change
Cross-company isolation
Unauthorized cache access
Cache failure fallback
Cache cleanup

If the cache itself fails, AI functionality should fail safely according to the selected architecture rather than exposing data or returning incorrect results.

25. Duplicate Request Protection

Duplicate-request protection should be implemented with the caching/deduplication layer.

The objective is to prevent identical concurrent requests from unnecessarily invoking the LLM multiple times.

Example:

Request A
Request A
Request A
      ↓
Same deterministic request identity
      ↓
One AI execution
      ↓
Shared result
26. Deduplication Rules

Deduplication must:

Use deterministic request identity
Be scoped safely
Occur only after authorization
Prevent uncontrolled concurrent AI calls
Clean up failed in-flight requests
Never permanently block future requests

An unauthorized request must not discover whether another request is currently running.

27. Deduplication Failure Handling

If the active AI execution fails:

Active Request
      ↓
AI Failure
      ↓
Clear in-flight state
      ↓
Return failure

A subsequent valid request must be able to execute normally.

28. Part 2 Verification

Test:

Identical concurrent requests
Different candidates
Different jobs
Different companies
Unauthorized requests
Successful deduplication
Failed deduplicated request
In-flight cleanup
Repeated requests after failure
29. Part 3 — Performance Optimization
29.1 Objective

Improve execution efficiency without changing business behavior.

Focus on:

Database query efficiency
PDF extraction reuse
Prompt construction efficiency
Avoiding unnecessary AI calls
Avoiding duplicate processing
30. Database Optimization

Review shared AI services for repeated queries.

Ensure the optimization work does not introduce:

N + 1 queries

Do not rewrite already-correct feature services unnecessarily.

Only make changes supported by measurable or clearly identifiable inefficiencies.

31. PDF Extraction

Review:

pdf-extractor.ts
ai-evaluation.service.ts

Ensure PDF extraction is not unnecessarily repeated during a single evaluation lifecycle.

Do not persist raw extracted resume text merely for optimization.

32. Prompt Construction

Continue using:

PromptBuilder

as the centralized prompt construction mechanism.

Do not duplicate prompt-building logic.

Prompt optimization must preserve:

Evidence grounding
Anti-injection rules
Structured output
Existing prompt versions
33. Avoid Unnecessary LLM Calls

Before calling Ollama, the system should determine:

Is request valid?
       ↓
Is user authorized?
       ↓
Is reusable result available?
       ↓
Is identical evaluation already running?
       ↓
Call LLM

This sequence must remain safe and deterministic.

34. Part 3 Verification

Measure or verify:

AI execution duration
Cache hit behavior
Cache miss behavior
Retry duration
PDF extraction behavior
Database query behavior
Duplicate request behavior

Do not optimize purely for theoretical performance at the expense of correctness or security.

35. Part 3 — Monitoring & Structured Logging

The shared AI layer should provide structured operational metadata.

Recommended fields:

feature
model
promptVersion
durationMs
retryCount
cacheHit
status
errorCategory
36. Logging Restrictions

Never log:

Raw resume text
PDF contents
Full candidate profile
Full job description
Full prompt
Raw LLM response
Candidate email
Candidate phone number
Other unnecessary personal information

Logs must remain useful without exposing sensitive information.

37. Error Categories

AI failures should be categorized where practical:

TIMEOUT
CONNECTION_ERROR
OLLAMA_ERROR
JSON_PARSE_ERROR
SCHEMA_VALIDATION_ERROR
BUSINESS_VALIDATION_ERROR
UNKNOWN_ERROR

The exact categories should integrate with the existing error architecture.

38. Monitoring Verification

Verify:

Successful AI request logs success metadata
Failed request logs failure category
Retry count is accurate
Duration is recorded
Cache hit/miss is recorded where implemented
Sensitive data is absent
Logging does not expose prompts or raw AI output
39. Part 4 — Full Regression Testing

After all optimization changes are complete, execute the complete AI regression suite.

Required modules:

Resume Parser
ATS Score
Job Matching
Resume Recommendations
Interview Assistant
AI Insights
40. Existing Regression Tests

Run the project's existing test suites, including where present:

tests/ats-score.integration.test.ts
tests/job-matching.integration.test.ts
tests/smoke-recommendations.ts
tests/smoke-interview-assistant.ts
tests/smoke-ai-insights.ts

Also run existing core module regressions:

tests/candidates.integration.test.ts
tests/jobs.integration.test.ts
tests/applications.integration.test.ts
tests/interviews.integration.test.ts

Do not assume filenames that do not exist. Use the actual repository test structure.

41. AI Optimization Test Suite

Create a dedicated test suite for Stage 8.

Suggested location:

tests/
└── smoke-ai-optimization.ts

The test suite should cover:

Configuration
Valid timeout
Valid retry configuration
Invalid configuration handling
Retry limit enforcement
Retry
Success without retry
Retry on transient failure
Retry exhaustion
Non-retryable failure
Timeout handling
Cache
Cache miss
Cache hit
TTL expiration
Prompt version isolation
Model isolation
Candidate isolation
Job isolation
Company isolation
Deduplication
Concurrent identical requests
Failed in-flight request
In-flight cleanup
Different request identity
Security
Unauthorized cache access
Cross-company isolation
Candidate isolation
Job isolation
Observability
Metadata correctness
No sensitive logs
42. Regression Safety

After optimization:

ATS Score

must still produce the same API contract.

Job Matching

must still produce the same API contract.

Resume Recommendations

must preserve history and authorization.

Interview Assistant

must preserve question generation and access controls.

AI Insights

must preserve evaluation context and recruiter authorization.

No optimization may bypass feature-specific business validation.

43. Database Verification

Stage 8 should avoid database schema changes.

Run:

npx prisma validate
npx prisma migrate status

Expected result:

Database schema is up to date.

If a migration becomes genuinely necessary, stop and review the migration design before applying it.

Do not create migrations merely to support caching if an existing infrastructure solution is sufficient.

44. Static Verification

Run:

npm run type-check
npm run build
npx eslint .

All must complete with:

0 TypeScript errors
0 build errors
0 ESLint errors
0 ESLint warnings
45. Production Security Review

Verify:

Authorization

Authorization happens before:

Cache lookup
Deduplication lookup
Historical result reuse
Tenant Isolation

No cached or deduplicated result can cross:

Company
Candidate
Job
Prompt Safety

Cached AI outputs remain untrusted generated data.

Data Privacy

Sensitive data is not written to operational logs.

Failure Safety

Failed AI calls do not create incomplete database records.

46. Production Performance Review

Verify:

Timeout is bounded
Retry count is bounded
Backoff is bounded
Cache TTL is bounded
Duplicate requests are controlled
No unnecessary LLM calls occur
No N+1 database behavior is introduced
PDF extraction is not unnecessarily repeated
Cache failures do not compromise correctness
47. Backward Compatibility Review

Confirm that no existing public API contracts were changed unintentionally.

Review:

Routes
Request schemas
Response schemas
Controllers
Feature services
Database persistence
Authorization
Swagger documentation

Any intentional contract change must be explicitly documented and approved before merge.

48. Files Expected to Be Reviewed

The exact file list must be determined from the existing repository.

Likely shared AI files include:

src/modules/ai/config/ai.config.ts
src/modules/ai/clients/ollama.client.ts
src/modules/ai/services/ai.service.ts
src/modules/ai/services/ai-evaluation.service.ts
src/modules/ai/utils/json-parser.ts
src/modules/ai/utils/prompt-builder.ts
src/modules/ai/constants/ai.constants.ts

Potential new shared files may include:

src/modules/ai/utils/retry.ts
src/modules/ai/utils/cache.ts
src/modules/ai/utils/request-deduplication.ts

Only create these if the existing architecture does not already provide equivalent functionality.

49. Implementation Order

Follow this exact order:

1. Review existing shared AI infrastructure
        ↓
2. Add/validate AI configuration
        ↓
3. Implement timeout handling
        ↓
4. Implement bounded retry logic
        ↓
5. Implement retry tests
        ↓
6. Verify existing AI modules
        ↓
7. Implement safe caching
        ↓
8. Implement cache key generation
        ↓
9. Implement TTL
        ↓
10. Implement duplicate-request protection
        ↓
11. Test cache + deduplication
        ↓
12. Optimize PDF/database/prompt processing
        ↓
13. Add structured monitoring metadata
        ↓
14. Run complete regression suite
        ↓
15. Run security review
        ↓
16. Run static checks
        ↓
17. Production-readiness review

Do not skip ahead if an earlier shared infrastructure change is failing.

50. Implementation Constraints

Do NOT:

Rewrite all AI services
Replace Ollama
Replace Llama 3.2
Introduce Redis without checking existing infrastructure
Introduce a new database cache table without justification
Change authorization rules
Remove existing schema validation
Remove JSON parsing
Remove prompt grounding
Store raw resumes for caching
Store raw prompts in logs
Store raw AI responses in logs
Add unlimited retries
Add unbounded cache lifetime
Bypass existing feature services
51. Acceptance Criteria

Stage 8 is accepted only when all of the following are true:

[ ] Timeout is configurable
[ ] Timeout is enforced
[ ] Retry logic is bounded
[ ] Retryable failures are correctly classified
[ ] Non-retryable failures are not retried
[ ] Backoff is bounded
[ ] Cache is deterministic
[ ] Cache has TTL
[ ] Prompt version affects cache identity
[ ] Model affects cache identity
[ ] Candidate affects cache identity
[ ] Job affects cache identity
[ ] Company isolation is enforced
[ ] Authorization occurs before cache access
[ ] Duplicate requests are controlled
[ ] Failed in-flight requests are cleaned up
[ ] Sensitive information is not logged
[ ] Monitoring metadata is available
[ ] Existing AI APIs remain compatible
[ ] No unnecessary database migration is introduced
[ ] Resume Parser passes
[ ] ATS Score passes
[ ] Job Matching passes
[ ] Resume Recommendations passes
[ ] Interview Assistant passes
[ ] AI Insights passes
[ ] Prisma validation passes
[ ] Migration status passes
[ ] Type-check passes
[ ] Build passes
[ ] ESLint passes
[ ] Security review passes
[ ] Production-readiness review passes
52. Final Production Readiness

The module may be marked:

AI OPTIMIZATION STATUS: GO

only after all acceptance criteria pass.

The final Phase 2 status becomes:

AI Core                 ✅
Resume Parser           ✅
ATS Score               ✅
Job Matching            ✅
Resume Recommendations  ✅
Interview Assistant     ✅
AI Insights             ✅
AI Optimization        ✅
53. Phase 2 Completion

After Stage 8 reaches GO:

Run the complete Phase 2 regression suite.
Perform final security and multi-tenant review.
Verify Prisma migration status.
Verify Swagger/API contracts.
Verify TypeScript build.
Verify ESLint.
Review all Phase 2 AI modules.
Commit Stage 8 changes.
Push feature/ai-optimization.
Merge into main.
Tag Phase 2 as complete if project versioning supports release tags.