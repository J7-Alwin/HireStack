# Phase 3 — Stage 8A: AI Architecture & Backend Contract Audit

## 1. Executive Summary
This document provides a comprehensive technical audit of the artificial intelligence capabilities, backend contracts, database schemas, and integration points in the HireStack ATS repository. The objective of Stage 8A is to establish the ground truth regarding existing backend AI features, determine the exact API contract for frontend integration, identify capability gaps, and formulate an architectural roadmap for Stage 8B+ without fabricating fake endpoints or assuming external cloud LLM providers.

---

## 2. Backend AI Availability
The HireStack backend contains a dedicated, fully implemented AI module located at `backend/src/modules/ai/` and mounted in the Express application at `/api/v1/ai` via `aiRoutes` in `backend/src/app.ts`.

Key architectural characteristics:
- **Backend-Orchestrated Local AI**: All AI capabilities are powered by a local Ollama instance (`@langchain/ollama`) executing on the server side.
- **Provider & Model Abstraction**: Managed through `AI_CONFIG` (`backend/src/modules/ai/config/ai.config.ts`), defaulting to `llama3.2` for text generation and `nomic-embed-text` for embeddings.
- **Zero Frontend API Keys**: No third-party API keys (OpenAI, Anthropic, Gemini) are required or exposed to the client application.

---

## 3. Swagger/OpenAPI Findings
The OpenAPI specification in `backend/src/modules/ai/swagger/ai.swagger.ts` and schema definitions in `backend/src/modules/ai/swagger/ai.schemas.ts` declare **17 distinct endpoints** categorized under the `AI` tag.

All endpoints require JWT Bearer Authentication (`bearerAuth: []`).

---

## 4. Exact AI Endpoints

| HTTP Method | Exact Route Path | Operation ID | Allowed Roles | Description / Persistence |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/ai/health` | `healthCheckAI` | `COMPANY_ADMIN`, `RECRUITER` | Verifies local Ollama model connectivity and health |
| `POST` | `/v1/ai/resume/parse` | `parseResume` | `COMPANY_ADMIN`, `RECRUITER` | Uploads PDF resume (multipart/form-data `resume`), extracts structured data, and creates Candidate record |
| `POST` | `/v1/ai/ats-score` | `calculateATSScore` | `COMPANY_ADMIN`, `RECRUITER` | Evaluates candidate resume against job description; persists to `ATSScore` |
| `POST` | `/v1/ai/job-matching` | `generateJobMatching` | `COMPANY_ADMIN`, `RECRUITER` | Computes match scores for all job applicants and persists `JobMatch` records |
| `GET` | `/v1/ai/job-matching/:jobId` | `getJobMatchingHistory` | `COMPANY_ADMIN`, `RECRUITER` | Retrieves historical candidate match list for a job requisition |
| `GET` | `/v1/ai/job-matching/:jobId/:candidateId` | `getCandidateMatchDetails` | `COMPANY_ADMIN`, `RECRUITER` | Retrieves granular match breakdown and score breakdown for candidate on a job |
| `POST` | `/v1/ai/resume-recommendations` | `generateGeneralRecommendations` | `COMPANY_ADMIN`, `RECRUITER`, `CANDIDATE` | Generates general resume formatting and improvement recommendations; persists to `ResumeRecommendation` |
| `POST` | `/v1/ai/resume-recommendations/job` | `generateJobRecommendations` | `COMPANY_ADMIN`, `RECRUITER`, `CANDIDATE` | Generates job-specific resume recommendations and alignment gap analysis; persists to `ResumeRecommendation` |
| `GET` | `/v1/ai/resume-recommendations/history/:candidateId` | `getRecommendationsHistory` | `COMPANY_ADMIN`, `RECRUITER`, `CANDIDATE` | Retrieves audit history of resume recommendations for a candidate |
| `GET` | `/v1/ai/resume-recommendations/:id` | `getRecommendationDetails` | `COMPANY_ADMIN`, `RECRUITER`, `CANDIDATE` | Retrieves detailed resume recommendation breakdown by ID |
| `POST` | `/v1/ai/interview` | `generateGeneralInterview` | `COMPANY_ADMIN`, `RECRUITER`, `CANDIDATE` | Generates structured interview kit & tailored questions based on candidate profile; persists to `InterviewAssistant` |
| `POST` | `/v1/ai/interview/job` | `generateJobInterview` | `COMPANY_ADMIN`, `RECRUITER`, `CANDIDATE` | Generates job-specific interview kit & questions evaluating role alignment; persists to `InterviewAssistant` |
| `GET` | `/v1/ai/interview/history/:candidateId` | `getInterviewHistory` | `COMPANY_ADMIN`, `RECRUITER`, `CANDIDATE` | Retrieves historical interview kits generated for candidate |
| `GET` | `/v1/ai/interview/:id` | `getInterviewDetails` | `COMPANY_ADMIN`, `RECRUITER`, `CANDIDATE` | Retrieves complete interview kit and questions by ID |
| `POST` | `/v1/ai/insights` | `generateAiInsights` | `COMPANY_ADMIN`, `RECRUITER` | Generates recruiter executive summary and risk assessment for candidate on a job; persists to `AiInsight` |
| `GET` | `/v1/ai/insights/history/:candidateId` | `getInsightsHistory` | `COMPANY_ADMIN`, `RECRUITER` | Retrieves historical AI insights generated for a candidate |
| `GET` | `/v1/ai/insights/:id` | `getInsightsDetails` | `COMPANY_ADMIN`, `RECRUITER` | Retrieves detailed AI insight evaluation report by ID |

---

## 5. AI Capability Inventory

| Capability | Status | Backend Support & Implementation |
| :--- | :--- | :--- |
| **Resume Parsing & Candidate Extraction** | `EXISTS` | `POST /v1/ai/resume/parse` (PDF upload $\rightarrow$ Candidate creation) |
| **Candidate ATS Scoring** | `EXISTS` | `POST /v1/ai/ats-score` (Candidate + Job $\rightarrow$ 6-factor score & breakdown) |
| **Job Applicant Matching & Ranking** | `EXISTS` | `POST /v1/ai/job-matching`, `GET /v1/ai/job-matching/:jobId` |
| **Resume Recommendations (General & Job-Specific)** | `EXISTS` | `POST /v1/ai/resume-recommendations[/job]`, history & detail endpoints |
| **Interview Question & Kit Generation** | `EXISTS` | `POST /v1/ai/interview[/job]`, history & detail endpoints |
| **Recruiter AI Insights & Risk Assessment** | `EXISTS` | `POST /v1/ai/insights`, history & detail endpoints |
| **Job Description Generation / Improvement** | `NOT FOUND` | No endpoint for generating or improving job descriptions |
| **Offer / Compensation AI Insights** | `NOT FOUND` | No endpoint for AI compensation or offer generation |
| **Pipeline AI Bottleneck / Stage Forecasting** | `NOT FOUND` | No endpoint for predictive pipeline analytics |
| **AI Chat / Copilot / Interactive Assistant** | `NOT FOUND` | No conversational chat endpoint |
| **Semantic Vector Search for Candidates** | `PARTIAL` | `embeddingModel` configured in backend config, but no dedicated semantic search route |

---

## 6. AI Data Models
The Prisma database schema (`backend/prisma/schema.prisma`) defines 5 dedicated persistent entities for AI output:

1. **`ATSScore`**:
   - `id`: CUID
   - `candidateId`, `jobId`: Relations to Candidate & Job
   - `overallScore`, `skillScore`, `experienceScore`, `educationScore`, `keywordScore`, `certificationScore`: Integers (0–100)
   - `strengths`, `weaknesses`, `missingSkills`, `recommendations`: JSON arrays
   - `hiringRecommendation`: `STRONGLY_RECOMMENDED` | `RECOMMENDED` | `CONSIDER` | `NOT_RECOMMENDED`
   - `overallReason`: Text explanation
   - `aiModel`, `promptVersion`: Audit metadata

2. **`JobMatch`**:
   - `id`: CUID
   - `candidateId`, `jobId`: Relations to Candidate & Job
   - `matchPercentage`, `skillMatch`, `experienceMatch`, `educationMatch`, `projectMatch`, `keywordMatch`: Integers (0–100)
   - `strengths`, `missingSkills`: JSON arrays
   - `overallReason`, `recommendation`: Text
   - `aiModel`, `promptVersion`: Audit metadata

3. **`ResumeRecommendation`**:
   - `id`: CUID
   - `candidateId`, `jobId`: Relations to Candidate & Job (jobId optional for general mode)
   - `mode`: `GENERAL` | `JOB_SPECIFIC`
   - `overallSummary`: Text summary
   - `recommendations`: JSON array of `ResumeRecommendationItem` (category, priority, currentIssue, recommendation, reason, evidence, expectedImprovement)
   - `aiModel`, `promptVersion`: Audit metadata

4. **`InterviewAssistant`**:
   - `id`: CUID
   - `candidateId`, `jobId`: Relations to Candidate & Job (jobId optional for general mode)
   - `mode`: `GENERAL` | `JOB_SPECIFIC`
   - `overallSummary`: Text summary
   - `questions`: JSON array of `InterviewQuestion` (category, question, reason, difficulty, followUps)
   - `aiModel`, `promptVersion`: Audit metadata

5. **`AiInsight`**:
   - `id`: CUID
   - `candidateId`, `jobId`: Relations to Candidate & Job
   - `overallInsight`: Text summary
   - `strengths`, `weaknesses`, `skillGaps`, `experienceConcerns`, `hiringRisks`, `jobFitObservations`, `recruiterFocusAreas`: JSON arrays
   - `hiringConfidence`: Integer (0–100)
   - `recommendation`: Text
   - `aiModel`, `promptVersion`: Audit metadata

---

## 7. AI Provider Architecture
- **Inference Engine**: Local Ollama server (`http://127.0.0.1:11434`), integrated via LangChain ChatOllama.
- **Configurability**: Controlled by backend environment variables:
  - `OLLAMA_BASE_URL` (default: `http://127.0.0.1:11434`)
  - `OLLAMA_MODEL` (default: `llama3.2`)
  - `OLLAMA_EMBEDDING_MODEL` (default: `nomic-embed-text`)
  - `AI_TEMPERATURE` (default: `0.2`)
  - `AI_TIMEOUT` (default: `60000` ms)
  - `AI_MAX_RETRIES` (default: `2`)
- **Isolation**: The browser client communicates exclusively with HireStack API endpoints (`/api/v1/ai/*`). No client-side LLM SDKs or direct provider connections exist.

---

## 8. Async Processing
- **Execution Model**: All AI endpoints in the backend execute **synchronously** within the HTTP request lifecycle (`await aiEvaluationService.evaluate(...)`).
- **Resilience Layer**: Handled server-side by `AiExecutor` with in-memory timeout, bounded exponential backoff retries, error classification, and optional cache deduplication.
- **Lifecycle for Frontend**:
  - Request initiated via HTTP POST / GET.
  - Spinner / skeleton displayed during processing (typically 2–10 seconds for local LLM inference).
  - Response delivered directly in HTTP 200 payload.
  - No background polling endpoints or WebSocket status queues are required or present.

---

## 9. Authentication
- Enforced on all routes via `authMiddleware`.
- Requires standard JWT Bearer token in `Authorization: Bearer <token>` header.
- Unauthenticated requests return HTTP 401 `UnauthorizedError`.

---

## 10. RBAC
Backend route authorization rules (`authorizeRoles` in `backend/src/modules/ai/routes/ai.routes.ts`):

| Capability / Resource | `SUPER_ADMIN` | `COMPANY_ADMIN` | `RECRUITER` | `CANDIDATE` |
| :--- | :--- | :--- | :--- | :--- |
| **Health Check** | Forbidden | **Allowed** | **Allowed** | Forbidden |
| **Resume Parsing** | Forbidden | **Allowed** | **Allowed** | Forbidden |
| **ATS Scoring** | Forbidden | **Allowed** | **Allowed** | Forbidden |
| **Job Matching & Ranking** | Forbidden | **Allowed** | **Allowed** (Assigned jobs only) | Forbidden |
| **Resume Recommendations** | Forbidden | **Allowed** | **Allowed** | **Allowed** (Own resume only) |
| **Interview Kit Generation** | Forbidden | **Allowed** | **Allowed** | **Allowed** (Own profile only) |
| **AI Insights** | Forbidden | **Allowed** | **Allowed** (Assigned jobs only) | Forbidden |

---

## 11. Tenant Isolation
- **Scoping**: All candidate, job, and evaluation queries filter by the user's `companyId` retrieved strictly from the verified JWT session context.
- **Cross-Tenant Protection**: Attempts to access candidates or jobs belonging to another company trigger HTTP 403 / HTTP 404. Tenant IDs are never accepted as client parameters.

---

## 12. Privacy
- Resume parsing and evaluations extract candidate qualifications, education, experience, and skills.
- The backend runs local on-premise Ollama inference by default; candidate data is not transmitted to external cloud LLM providers.
- Client applications must avoid logging candidate resume text or PII into browser console, URLs, or local storage.

---

## 13. AI Output Trust Model
- **Advisory & Evaluative**: AI scores, match rankings, recommendations, and insights are non-authoritative decision-support signals.
- **Separation from ATS State**: An AI recommendation or low ATS score does not automatically reject, advance, or modify an application or pipeline stage. Human recruiters retain full authority over hiring decisions.
- **Audit Grounding**: Every generated record stores `aiModel` and `promptVersion` to ensure traceability and reproducibility.

---

## 14. Error Model
Standardized error codes returned by the backend:
- `400 Bad Request`: Input validation failed (e.g. missing candidate ID or invalid format).
- `401 Unauthorized`: Missing or invalid JWT session.
- `403 Forbidden`: Insufficient role permissions or unassigned recruiter access.
- `404 Not Found`: Candidate, Job, or AI Record not found.
- `409 Conflict`: Candidate duplicate email/phone on resume upload.
- `422 Unprocessable Entity`: Candidate resume missing or text insufficient for evaluation.
- `500 Internal Server Error`: Local AI inference failure, LLM connection failure, or JSON parsing failure.

---

## 15. Rate Limits / Usage
- **Rate Limiting**: Protected by global Express rate limiters (`generalLimiter`, `uploadLimiter`).
- **Quota Tracking**: No per-tenant token usage quotas, billing credits, or subscription counters exist in the current backend (`NOT FOUND IN CURRENT BACKEND`).

---

## 16. Audit Logging
- Evaluations are persisted directly in Prisma models (`ATSScore`, `JobMatch`, `ResumeRecommendation`, `InterviewAssistant`, `AiInsight`) with timestamps, candidate IDs, job IDs, model identifiers, and prompt versions.

---

## 17. Existing Frontend AI Infrastructure
- `frontend/src/features/ai/`: Currently does not exist (clean slate).
- `apiClient`: Configured with `/api/v1` baseUrl, automatic Bearer token injection, and structured `ApiError` extraction.
- `TanStack Query`: Standard query key factory and cache management ready for AI query/mutation hooks.

---

## 18. Proposed Frontend Architecture
To be built in Stage 8B+:
```
frontend/src/features/ai/
├── types/
│   ├── ai-common.types.ts
│   ├── ats-score.types.ts
│   ├── job-matching.types.ts
│   ├── resume-recommendation.types.ts
│   ├── interview-assistant.types.ts
│   └── ai-insights.types.ts
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
│   ├── AtsScoreCard.tsx
│   ├── JobMatchRankingTable.tsx
│   ├── ResumeRecommendationList.tsx
│   ├── InterviewKitPanel.tsx
│   ├── AiInsightSummaryCard.tsx
│   ├── ResumeUploadParserModal.tsx
│   └── index.ts
└── index.ts
```

---

## 19–24. ATS Feature Mapping

### 19. Candidate AI Mapping
- **Features**: Resume Parser (`POST /v1/ai/resume/parse`), General Resume Recommendations (`POST /v1/ai/resume-recommendations`), General Interview Prep (`POST /v1/ai/interview`).
- **Integration Points**: `/app/candidates` (Upload & Parse button) and `/app/candidates/:id` (Resume Recommendations & Interview tabs).

### 20. Job AI Mapping
- **Features**: Job Applicant Matching & Ranking (`POST /v1/ai/job-matching`, `GET /v1/ai/job-matching/:jobId`).
- **Integration Points**: `/app/jobs/:id` (AI Match & Ranking tab).

### 21. Application AI Mapping
- **Features**: Application ATS Scoring (`POST /v1/ai/ats-score`), Candidate Job Match Details (`GET /v1/ai/job-matching/:jobId/:candidateId`), Job-Specific Resume Recommendations (`POST /v1/ai/resume-recommendations/job`), Job-Specific Interview Kit (`POST /v1/ai/interview/job`), AI Recruiter Insights (`POST /v1/ai/insights`).
- **Integration Points**: `/app/applications/:id` (AI Evaluation Panel / Score breakdown).

### 22. Interview AI Mapping
- **Features**: Tailored Interview Questions & Kits (`POST /v1/ai/interview[/job]`, `GET /v1/ai/interview/:id`).
- **Integration Points**: `/app/interviews/:id` or `/app/applications/:id` (Interview Preparation kit).

### 23. Offer AI Mapping
- **Features**: `NOT FOUND` in current backend. No mock or synthetic offer AI should be added.

### 24. Pipeline AI Mapping
- **Features**: `NOT FOUND` in current backend. No predictive pipeline forecasting should be added.

---

## 25. UX Principles
1. **Clear Attribution**: AI-generated scores, insights, and questions must carry explicit AI badges and disclaimers.
2. **Non-Destructive**: AI outputs are purely informational recommendations and never automatically mutate application or pipeline state.
3. **Graceful Loading & Fallback**: Skeletons and progress spinners during evaluation; clean error states if Ollama is unavailable or unpopulated.
4. **Design System Alignment**: Follow HireStack Design System (charcoal, warm white, lime accent, clean typography) without generic purple gradients.

---

## 26. Security Considerations
- JWT authorization on all endpoints.
- Role checking on all UI triggers (Company Admin / Recruiter / Candidate scoping).
- Zero client-side API keys or LLM provider credentials.

---

## 27. Dependencies
- No new client dependencies required.
- Uses existing `apiClient`, `@tanstack/react-query`, `lucide-react`, and HireStack UI components.

---

## 28. Implementation Readiness

| Capability | Readiness Classification | Notes |
| :--- | :--- | :--- |
| **AI Service Health Check** | `READY` | Backend endpoint exists and verified |
| **Resume PDF Parsing & Candidate Creation** | `READY` | Backend endpoint exists with multer upload |
| **Candidate ATS Scoring** | `READY` | Backend endpoint and persistent model verified |
| **Job Applicant Matching & Ranking** | `READY` | Backend endpoints and persistent model verified |
| **Resume Recommendations** | `READY` | Backend endpoints, modes, and history verified |
| **Interview Assistant / Question Kit** | `READY` | Backend endpoints, modes, and history verified |
| **Recruiter AI Insights** | `READY` | Backend endpoints and persistent model verified |
| **Job Description Generator** | `NOT FOUND` | Backend does not implement this capability |
| **Offer Insights / Compensation AI** | `NOT FOUND` | Backend does not implement this capability |
| **Pipeline Predictive Forecasting** | `NOT FOUND` | Backend does not implement this capability |
| **Interactive AI Chat / Copilot** | `NOT FOUND` | Backend does not implement this capability |

---

## 29. Backend Gaps
1. **Job Description Generation**: No backend endpoint exists for AI job description drafting or improvement.
2. **Offer Intelligence**: No backend endpoint exists for compensation benchmark recommendations.
3. **Pipeline Bottleneck Analytics**: No backend endpoint exists for predictive time-to-hire or candidate drop-off forecasts.
4. **Token Usage Quotas**: No per-tenant AI usage quotas or rate limit status endpoints are exposed.

---

## 30. Recommendations
1. Proceed with Stage 8B implementing frontend types, API service, query hooks, and presentation components for the **7 verified backend AI capabilities**.
2. Do not build mock or synthetic UI for Offer AI, Job Description Generation, or Pipeline AI until backend endpoints are formally added.

---

## 31. Verification Results

| Check | Command | Result |
| :--- | :--- | :--- |
| **Type Check** | `npm run type-check` | **PASS** (0 errors) |
| **Linter** | `npm run lint` | **PASS** (0 errors, 0 warnings) |
| **Full Regression Tests** | `npm run test` | **PASS** (108 test files, 361 tests passing) |
| **Production Build** | `npm run build` | **PASS** (Vite build successful) |

---

## 32. Scope Confirmation
This audit was conducted strictly as an investigation and architectural mapping stage. No backend files, Prisma schemas, or dependencies were modified, and no fake AI endpoints or mock responses were introduced.
