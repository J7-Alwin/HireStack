# Stage 8D — AI Job Matching & Applicant Ranking Implementation

## 1. Executive Summary
Stage 8D completes the integration of the backend AI Job Matching capability into the HireStack ATS Jobs module. Recruiter and Company Admin users can now evaluate and rank candidate applicants against specific job requisition criteria, inspect multidimensional match breakdowns, view historical matching analyses, and navigate seamlessly between job requisitions and candidate profiles. All AI operations are advisory-only, explicit-action triggered, and strictly isolated per tenant.

---

## 2. Stage Scope
- **Target Page**: `frontend/src/features/jobs/pages/JobDetailPage.tsx`
- **UI Components**:
  - `frontend/src/features/jobs/components/JobAiMatching.tsx`: Primary AI matching container with header, AI badge, disclaimer, empty states, loading indicators, error resilience, and ranking table.
  - `frontend/src/features/jobs/components/JobAiMatchDetailModal.tsx`: Detailed candidate evaluation dialog showing multidimensional score bars, strengths, missing skills, and reasoning.
- **Contract Integration**: Consumes Stage 8B `aiService` and hooks (`useJobMatches`, `useCandidateJobMatch`, `useGenerateJobMatching`).
- **Tests**: Comprehensive integration, match detail, and RBAC tests under `frontend/tests/jobs/ai/`.

---

## 3. Backend Contract
Verified backend endpoints utilized without any backend modifications:
1. `POST /v1/ai/job-matching`
   - Request: `{ jobId: string }`
   - Response: `JobMatchingResponse` (`jobId`, `totalCandidates`, `generatedAt`, `matches: CandidateMatchResponse[]`)
2. `GET /v1/ai/job-matching/:jobId`
   - Response: `JobMatchHistoryResponse` (`JobMatchDetailsResponse[]` or `JobMatchHistoryItem[]`)
3. `GET /v1/ai/job-matching/:jobId/:candidateId`
   - Response: `JobMatchDetailsResponse` (`id`, `jobId`, `candidateId`, `candidateName`, `matchPercentage`, `skillMatch`, `experienceMatch`, `educationMatch`, `projectMatch`, `keywordMatch`, `strengths`, `missingSkills`, `overallReason`, `recommendation`, `aiModel`, `promptVersion`, `createdAt`, `updatedAt`)

---

## 4. Job Matching Architecture
```
JobDetailPage (/app/jobs/:jobId)
  └── JobAiMatching
        ├── Header & AiBadge
        ├── Historical Notice (Timestamped)
        ├── Action Controls (Generate / Regenerate Matches)
        ├── Loading State (AiLoadingState)
        ├── Error State (AiErrorState)
        ├── Results Ranking (JobMatchRankingTable)
        │     └── View Breakdown Action
        ├── JobAiMatchDetailModal
        │     ├── Candidate Profile Link (/app/candidates/:id)
        │     ├── Overall Match & Recommendation Badges
        │     ├── 5-Factor Dimension Bars (Skill, Exp, Edu, Project, Keyword)
        │     ├── Strengths & Missing Skills
        │     ├── Advisory Reasoning
        │     └── AI Model & Prompt Metadata
        └── AiDisclaimer
```

---

## 5. Generate Matching Flow
1. Recruiter opens a job requisition detail page (`/app/jobs/:jobId`).
2. Recruiter clicks **"Generate Applicant Matches"** (or **"Regenerate Matches"**).
3. `useGenerateJobMatching` triggers `POST /v1/ai/job-matching`.
4. `AiLoadingState` displays non-blocking evaluation feedback.
5. Backend evaluates all applicant resumes against the job requisition via local Ollama inference and persists scores.
6. React Query receives `JobMatchingResponse` and invalidates `aiKeys.jobMatches(jobId)`.
7. `JobMatchRankingTable` renders authoritative backend rankings descending by match score.

---

## 6. Ranking Display
- Utilizes `JobMatchRankingTable` displaying:
  - Rank position (`#1`, `#2`, ...)
  - Candidate Name with direct link to `/app/candidates/:candidateId`
  - Match Score with color-coded variant badge (`getScoreVariant`)
  - Recommendation badge (`STRONGLY_RECOMMENDED`, `RECOMMENDED`, `CONSIDER`, `NOT_RECOMMENDED`)
  - "View Breakdown" action trigger opening modal dialog.
- Strictly preserves backend AI calculated ranking without duplicate frontend scoring algorithms.

---

## 7. Match Detail
- Implemented via `JobAiMatchDetailModal` using HireStack `Dialog` primitive:
  - Overall match percentage & recommendation
  - 5-factor progress breakdown:
    - **Skill Match** (%)
    - **Experience Match** (%)
    - **Education Match** (%)
    - **Project Match** (%)
    - **Keyword Match** (%)
  - Structured list of verified **Key Strengths**
  - Structured list of identified **Missing Skills & Gaps**
  - Comprehensive AI evaluation reasoning summary
  - AI Model and Prompt Version metadata tags
  - Direct link to full candidate profile

---

## 8. Match History
- Retrieved via `GET /v1/ai/job-matching/:jobId` using `useJobMatches(jobId)`.
- If previous matching runs exist in the database, results are immediately presented with a historical notice showing generation timestamp.
- The recruiter can review previous evaluations without incurring re-computation costs until explicitly requesting **"Regenerate Matches"**.

---

## 9. Candidate Navigation
- All candidate mentions throughout ranking tables and detail modals provide clean, accessible links to `/app/candidates/:candidateId`.
- No sensitive PII (phone, private notes, email) is displayed in the matching summary table.

---

## 10. Application Navigation
- Preserves standard ATS routing; context remains scoped to the active job requisition without page displacement.

---

## 11. React Query Integration
- Reuses Stage 8B query key architecture:
  - `aiKeys.jobMatches(jobId)`: `['ai', 'job-matching', jobId]`
  - `aiKeys.jobMatchDetail(jobId, candidateId)`: `['ai', 'job-matching', jobId, candidateId]`
- Query hooks:
  - `useJobMatches(jobId)`
  - `useCandidateJobMatch(jobId, candidateId)`
  - `useGenerateJobMatching()`

---

## 12. Cache Strategy
- Targeted cache invalidation:
  - On `useGenerateJobMatching` success, only `aiKeys.jobMatches(jobId)` is invalidated.
  - Does not invalidate unrelated candidate, job, or system queries.

---

## 13. RBAC
- **Permitted Roles**:
  - `COMPANY_ADMIN`: Full access to company-scoped job applicant matching.
  - `RECRUITER`: Full access to assigned company job applicant matching.
- **Forbidden Roles**:
  - `SUPER_ADMIN`: Hidden / Forbidden (platform administration does not access company-scoped hiring applicant evaluations).
  - `CANDIDATE`: Hidden / Forbidden (candidates cannot view company-wide applicant rankings).

---

## 14. Tenant Isolation
- Frontend strictly relies on the authenticated JWT session context.
- Never passes `companyId` or `tenantId` in request payloads or query parameters.
- Backend enforces multi-tenant boundaries.

---

## 15. Privacy
- No resume raw text, candidate private notes, or sensitive AI debug logs are placed into URLs, localStorage, sessionStorage, or client console logs.

---

## 16. AI Trust Model
- Advisory disclaimer displayed prominently across all AI matching sections and detail modals.
- Terminology uses advisory framing ("Highest AI match", "Recommendation", "AI Match Recommendation") rather than absolute statements.
- **No Automatic ATS State Changes**: AI matching never automatically shortlists, rejects, hires, modifies pipeline stages, or assigns recruiters.

---

## 17. Error Handling
- Standardized via `AiErrorState` handling 400, 401, 403, 404, 409, 422, 500, and AI inference failures.
- Includes clean retry capabilities without breaking the surrounding Job Detail page.

---

## 18. Loading States
- Implemented using `AiLoadingState` with non-blocking progress messaging ("Analyzing applicants against this role...").
- Avoids fake percentages or artificial timers.

---

## 19. Responsive Design
- Supports viewports from 320px to 1280px+.
- Multi-column dimensional score grids collapse cleanly into single columns on mobile.
- Table supports horizontal scrolling on mobile viewports without causing page-level overflow.

---

## 20. Accessibility
- Proper ARIA roles on dialogs (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`).
- Focus trapping and Escape key support in modal dialogs.
- High-contrast badge tokens adhering to WCAG 2.1 AA.

---

## 21. Performance
- No automatic generation triggers on mount or tab switching.
- React Query caching prevents duplicate network requests.
- Modals only query candidate match breakdown when explicitly opened.

---

## 22. Testing
New test suite created under `frontend/tests/jobs/ai/`:
- `JobAiMatching.test.tsx` (5 tests)
- `JobAiMatchDetail.test.tsx` (3 tests)
- `JobAiMatchingRBAC.test.tsx` (4 tests)
- Regression test coverage across Job Detail page and all Phase 3 stages.

---

## 23. Files Created
1. `frontend/src/features/jobs/components/JobAiMatching.tsx`
2. `frontend/src/features/jobs/components/JobAiMatchDetailModal.tsx`
3. `frontend/tests/jobs/ai/JobAiMatching.test.tsx`
4. `frontend/tests/jobs/ai/JobAiMatchDetail.test.tsx`
5. `frontend/tests/jobs/ai/JobAiMatchingRBAC.test.tsx`
6. `docs/phase-3/23_AI_JOB_MATCHING_IMPLEMENTATION.md`

---

## 24. Files Modified
1. `frontend/src/features/jobs/components/index.ts`
2. `frontend/src/features/jobs/pages/JobDetailPage.tsx`

---

## 25. Dependencies
No new third-party dependencies were added. Uses existing React, TanStack Query, React Router, and Lucide React icons.

---

## 26. Backend Modification Confirmation
No files in `backend/` were modified. All verified backend contracts were consumed as-is.

---

## 27. Scope Confirmation
Implementation strictly limited to Stage 8D (AI Job Matching & Applicant Ranking Integration in the Jobs module). No out-of-scope features (e.g. AI Copilot, Chat, Offer AI, Pipeline AI) were introduced.
