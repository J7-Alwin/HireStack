# Stage 8B: AI Frontend Foundation & API Integration

## 1. Executive Summary
Stage 8B establishes the complete, production-grade frontend AI infrastructure for HireStack ATS. Built strictly against the verified backend contract established in Stage 8A, this foundation connects to the backend AI orchestration layer (`/api/v1/ai/*`) which interfaces with local Ollama models. The architecture provides strongly typed domain models, API service methods, TanStack Query key factories and custom hooks, centralized error mapping, accessible presentation components, and multipart file upload handling for resume parsing.

---

## 2. Backend Contract
- **Base Endpoint**: `/api/v1/ai`
- **Orchestration Layer**: Server-side Express controllers interfacing with `@langchain/ollama` (default model `llama3.2`).
- **Communication Boundary**: Browser clients communicate exclusively with `/api/v1/ai/*` via standard Bearer JWT authorization. Direct client-side calls to Ollama are prohibited and impossible.
- **Synchronous Execution Model**: Inference is performed synchronously on the backend with server-side timeouts and retries (`AiExecutor`). Frontend hooks handle standard HTTP response cycles with loading states and retry capabilities.

---

## 3. AI Endpoints
The frontend service wraps all 17 verified backend endpoints:
1. `GET /v1/ai/health`: Model health & connectivity check.
2. `POST /v1/ai/resume/parse`: Multipart PDF upload (`resume` field), LLM extraction, and DB candidate creation.
3. `POST /v1/ai/ats-score`: 6-factor candidate resume vs. job requisition compatibility evaluation.
4. `POST /v1/ai/job-matching`: Batch applicant matching & ranking for a requisition.
5. `GET /v1/ai/job-matching/:jobId`: Historical applicant match rankings for a job.
6. `GET /v1/ai/job-matching/:jobId/:candidateId`: Detailed candidate match breakdown.
7. `POST /v1/ai/resume-recommendations`: General resume improvement suggestions.
8. `POST /v1/ai/resume-recommendations/job`: Job-specific resume gap analysis.
9. `GET /v1/ai/resume-recommendations/history/:candidateId`: Audit history of resume recommendations.
10. `GET /v1/ai/resume-recommendations/:id`: Single recommendation review report.
11. `POST /v1/ai/interview`: Candidate profile general interview question generation.
12. `POST /v1/ai/interview/job`: Role-targeted interview questions & follow-up probes.
13. `GET /v1/ai/interview/history/:candidateId`: Historical interview kits generated for candidate.
14. `GET /v1/ai/interview/:id`: Single interview kit detail report.
15. `POST /v1/ai/insights`: Recruiter executive insight summary, risks, and fit evaluation.
16. `GET /v1/ai/insights/history/:candidateId`: Candidate AI insights audit history.
17. `GET /v1/ai/insights/:id`: Single AI insight evaluation report.

---

## 4. Frontend Architecture
Located at `frontend/src/features/ai/`:
```
src/features/ai/
├── types/
│   ├── ai-common.types.ts
│   ├── ats-score.types.ts
│   ├── job-matching.types.ts
│   ├── resume-recommendation.types.ts
│   ├── interview-assistant.types.ts
│   ├── ai-insights.types.ts
│   └── index.ts
├── services/
│   └── ai.service.ts
├── hooks/
│   ├── ai-query-keys.ts
│   ├── useAiHealth.ts
│   ├── useParseResume.ts
│   ├── useAtsScore.ts
│   ├── useJobMatching.ts
│   ├── useResumeRecommendations.ts
│   ├── useInterviewAssistant.ts
│   ├── useAiInsights.ts
│   └── index.ts
├── components/
│   ├── AiBadge.tsx
│   ├── AiDisclaimer.tsx
│   ├── AiLoadingState.tsx
│   ├── AiErrorState.tsx
│   ├── AtsScoreCard.tsx
│   ├── JobMatchRankingTable.tsx
│   ├── ResumeRecommendationList.tsx
│   ├── InterviewKitPanel.tsx
│   ├── AiInsightSummaryCard.tsx
│   ├── ResumeUploadParserModal.tsx
│   └── index.ts
├── utils/
│   └── ai-helpers.ts
└── index.ts
```

---

## 5. Type Architecture
Explicit, read-only TypeScript interfaces mirror the Swagger schemas without using `any` or loose `Record<string, unknown>`:
- `ATSScoreResponse`: Includes 5 dimension scores (`skillScore`, `experienceScore`, `educationScore`, `keywordScore`, `certificationScore`), `strengths`, `weaknesses`, `missingSkills`, `recommendations`, `hiringRecommendation`, `overallReason`, `aiModel`, `promptVersion`.
- `JobMatchDetailsResponse` & `CandidateMatchResponse`: Match percentages, dimension breakdowns, rankings, and recommendations.
- `ResumeRecommendationResponse`: Mode (`GENERAL` | `JOB_SPECIFIC`), `overallSummary`, structured recommendation items with categories, priorities, issues, and expected impact.
- `InterviewAssistantResponse`: Mode, structured questions with categories, difficulty (`EASY` | `MEDIUM` | `HARD`), rationale, and follow-up probes.
- `AiInsightResponse`: Executive summary, confidence score (0–100), key strengths, weaknesses, skill gaps, experience concerns, hiring risks, recruiter focus areas, and recommendation.

---

## 6. API Service
`aiService` in `src/features/ai/services/ai.service.ts` uses the centralized `ApiClient` instance:
- Automatically attaches Bearer JWT authentication.
- Automatically handles `FormData` for multipart resume parsing without overriding header boundary calculations.
- Normalizes server error responses via `ApiError`.

---

## 7. Query Keys
Hierarchical cache key structure via `aiKeys`:
- `aiKeys.all`: `['ai']`
- `aiKeys.health()`: `['ai', 'health']`
- `aiKeys.jobMatches(jobId)`: `['ai', 'job-matching', jobId]`
- `aiKeys.jobMatchDetail(jobId, candidateId)`: `['ai', 'job-matching', jobId, candidateId]`
- `aiKeys.resumeRecommendationHistory(candidateId)`: `['ai', 'resume-recommendations', 'history', candidateId]`
- `aiKeys.resumeRecommendationDetail(id)`: `['ai', 'resume-recommendations', 'detail', id]`
- `aiKeys.interviewAssistantHistory(candidateId)`: `['ai', 'interview-assistant', 'history', candidateId]`
- `aiKeys.interviewAssistantDetail(id)`: `['ai', 'interview-assistant', 'detail', id]`
- `aiKeys.insightHistory(candidateId)`: `['ai', 'insights', 'history', candidateId]`
- `aiKeys.insightDetail(id)`: `['ai', 'insights', 'detail', id]`

---

## 8. Hooks
- **Queries**: `useAiHealth`, `useJobMatches`, `useCandidateJobMatch`, `useResumeRecommendationHistory`, `useResumeRecommendation`, `useInterviewAssistantHistory`, `useInterviewAssistant`, `useAiInsightHistory`, `useAiInsight`.
- **Mutations**: `useParseResume`, `useAtsScore`, `useGenerateJobMatching`, `useCreateResumeRecommendations`, `useCreateJobResumeRecommendations`, `useCreateInterviewAssistant`, `useCreateJobInterviewAssistant`, `useCreateAiInsights`.

---

## 9. Components
Reusable, accessible UI components following HireStack design standards:
- `AiBadge`: Distinctive AI attribution indicator.
- `AiDisclaimer`: Clear advisory notice.
- `AiLoadingState`: Spinner and skeleton states with contextual messages.
- `AiErrorState`: Graceful error container with retry callback.
- `AtsScoreCard`: Comprehensive 6-factor score presentation card with progress bars, strengths, missing skills, and hiring recommendations.
- `JobMatchRankingTable`: Accessible table of candidate match rankings with sort ordering and detail triggers.
- `ResumeRecommendationList`: Categorized action item cards with priority badges and impact summaries.
- `InterviewKitPanel`: Question list with difficulty indicators, objective rationale, and follow-up probes.
- `AiInsightSummaryCard`: Recruiter executive analysis with confidence meter, key strengths, risks, and focus areas.
- `ResumeUploadParserModal`: Drag-and-drop PDF upload dialog with client validation and candidate creation confirmation.

---

## 10. Resume Upload
- File type validation strictly checks for PDF mime type (`application/pdf`) and file extension (`.pdf`).
- File size validation checks against maximum 10MB limit (`MAX_RESUME_FILE_SIZE_BYTES`).
- Multi-part form creation attaches file to the `resume` form key.
- Upon successful parsing, the newly generated `Candidate` record is returned and candidate cache queries (`['candidates']`) are invalidated.

---

## 11. Error Handling
- Safe error mapping using `ApiError`.
- Clear user-facing alerts for 400 (validation), 401 (unauthorized), 403 (forbidden role), 404 (resource not found), 409 (duplicate candidate email/phone), 422 (unprocessable resume text), and 500 (inference/connection failure).
- Internal LLM prompts, provider credentials, and raw resume texts are never exposed.

---

## 12. RBAC
Authorization is aligned with the backend contract:
- `COMPANY_ADMIN`: All AI capabilities.
- `RECRUITER`: All AI capabilities (job-scoped).
- `CANDIDATE`: Resume recommendations and interview kits for their own profile.
- `SUPER_ADMIN`: Forbidden from tenant-scoped AI endpoints.

---

## 13. Tenant Isolation
No tenant or company identifiers are accepted in client request bodies or URLs. Scoping is strictly derived from the verified JWT session context on the backend.

---

## 14. Privacy
- No candidate PII, resume text, or AI prompts are stored in `localStorage`, `sessionStorage`, or URL search params.
- Logging of sensitive resume content is strictly prevented.

---

## 15. AI Attribution
Every AI-generated output is accompanied by the `AiBadge` component to explicitly communicate machine-generated provenance.

---

## 16. AI Trust Model
All AI outputs are explicitly framed as **advisory decision support**. The frontend strictly prohibits AI outputs from automatically changing candidate pipeline stages, rejecting applicants, sending offers, or mutating ATS core state.

---

## 17. Loading States
Informative, non-blocking loading states (`AiLoadingState`) provide user feedback during multi-second LLM inference operations without fabricated completion percentages.

---

## 18. Responsive Design
All cards, tables, and dialogs are fully responsive across mobile (320px), tablet (768px), and desktop (1024px, 1280px+) viewport breakpoints.

---

## 19. Accessibility
- Semantic markup (`<table>`, `<th>`, `<form>`, `<button>`).
- Keyboard accessible dialogs with focus trapping and ESC dismissal.
- Color-independent state indicators (combining icons, badges, text labels, and contrast compliance).

---

## 20. Cache Invalidation
Targeted query cache invalidation ensures fresh data without unnecessary full-cache invalidations:
- `useParseResume` $\rightarrow$ invalidates `['candidates']`.
- `useAtsScore` $\rightarrow$ invalidates `aiKeys.jobMatches(jobId)` and `aiKeys.jobMatchDetail(jobId, candidateId)`.
- `useGenerateJobMatching` $\rightarrow$ invalidates `aiKeys.jobMatches(jobId)`.
- `useCreateResumeRecommendations` $\rightarrow$ invalidates `aiKeys.resumeRecommendationHistory(candidateId)`.
- `useCreateInterviewAssistant` $\rightarrow$ invalidates `aiKeys.interviewAssistantHistory(candidateId)`.
- `useCreateAiInsights` $\rightarrow$ invalidates `aiKeys.insightHistory(candidateId)`.

---

## 21. Testing
Created 4 comprehensive test suites in `frontend/tests/ai/` with 31 tests:
- `ai.service.test.ts`: Verifies all 17 endpoint calls, HTTP methods, paths, and multipart handling.
- `ai.hooks.test.tsx`: Verifies query key generation, query execution, mutations, cache invalidation, and data hydration.
- `AiComponents.test.tsx`: Verifies rendering and user interaction of all 9 presentation components.
- `ResumeUploadParserModal.test.tsx`: Verifies file validation, upload states, success flows, error states, and accessibility.

---

## 22. Dependencies
No new npm dependencies were installed. Utilizes existing `react`, `@tanstack/react-query`, `lucide-react`, and HireStack UI components.

---

## 23. Backend Modification Confirmation
No changes were made to backend controllers, services, routes, Prisma schemas, Swagger documentation, or database migrations.

---

## 24. Scope Confirmation
Stage 8B implemented the reusable AI frontend foundation without prematurely modifying ATS domain pages or building unsupported capabilities (e.g. Job Description AI, Offer AI, Pipeline AI, or AI Chat).
