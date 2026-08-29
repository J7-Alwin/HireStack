# Stage 8F — AI Recruiter Workflow Intelligence & Insights Implementation

## 1. Stage Status
**PASS** — Full backend-verified integration of AI Recruiter Workflow Intelligence and Candidate Insights into the HireStack ATS application workflow (`/app/applications/:applicationId`).

---

## 2. Backend Audit & Verified Endpoints
During Phase 0 audit of the backend routes (`backend/src/modules/ai/routes/ai.routes.ts`), schemas (`insights.schema.ts`), types (`insights.types.ts`), and Swagger documentation (`ai.swagger.ts`), the following endpoints were verified:

1. `POST /v1/ai/insights`:
   - **Purpose**: Generates evidence-grounded recruiter insights evaluating a candidate against a job opening.
   - **Request Body**: `{ candidateId: string, jobId: string }`
   - **Response**: `AiInsightResponse`
     - `id`: CUID identifier
     - `candidateId`: CUID
     - `jobId`: CUID | null
     - `overallInsight`: Executive recruiter synthesis
     - `strengths`: Core demonstrated strengths
     - `weaknesses`: Identified areas of improvement
     - `skillGaps`: Specific missing technical or domain skills
     - `experienceConcerns`: Experience and tenure caveats
     - `hiringRisks`: Critical hiring risk factors
     - `hiringConfidence`: Score 0–100
     - `jobFitObservations`: Job suitability observations
     - `recruiterFocusAreas`: Structured inquiry and interview focus areas
     - `recommendation`: Actionable recommendation (e.g., `STRONG_HIRE`, `HIRE`, `CONSIDER`, `REJECT`)
     - `aiModel`: Model name
     - `promptVersion`: Prompt version string
     - `createdAt`, `updatedAt`: ISO timestamps
2. `GET /v1/ai/insights/history/:candidateId`:
   - **Purpose**: Retrieves historical AI Insight evaluations generated for a specific candidate in reverse chronological order.
   - **Response**: `AiInsightHistoryResponse` (`AiInsightHistoryItem[]`)
3. `GET /v1/ai/insights/:id`:
   - **Purpose**: Retrieves complete detailed AI Insight evaluation report for a specific evaluation ID.
   - **Response**: `AiInsightDetailsResponse` (`AiInsightResponse`)

---

## 3. UI/UX Integration
- Integrated `ApplicationAiInsights` into `ApplicationDetailPage.tsx` (`/app/applications/:applicationId`) directly below `ApplicationSummary`.
- Embedded without disrupting core ATS workflow actions (status changes, stage advancement, candidate notes).
- Features:
  - Header with `AiBadge` and `AiDisclaimer`
  - Explicit action buttons: "Generate Recruiter Insights", "Regenerate Insights"
  - Hiring Confidence gauge with colored score tokens (`success`, `warning`, `error`, `default`)
  - Executive Recruiter Synthesis callout with recommendation badge
  - Six categorized findings grids: Demonstrated Strengths, Hiring Risks & Caveats, Recruiter Focus Probes, Identified Skill Gaps, Job Fit Observations, Experience Concerns
  - Historical evaluations switcher bar
  - ATS Quick Context links (`/app/candidates/:id`, `/app/jobs/:id`)
  - Loading (`AiLoadingState`) and error retry (`AiErrorState`) states

---

## 4. Architecture
Adheres strictly to the layered architecture:
```
ApplicationDetailPage / ApplicationAiInsights
        ↓
useCreateAiInsights / useAiInsightHistory / useAiInsight (TanStack Query)
        ↓
aiService (createAiInsights, getAiInsightHistory, getAiInsight)
        ↓
ApiClient (Axios with Bearer JWT Auth)
        ↓
Backend Express Route (/v1/ai/insights)
```

---

## 5. React Query & Cache Strategy
- Query Keys:
  - `aiKeys.insightHistory(candidateId)`
  - `aiKeys.insightDetail(id)`
- Mutation:
  - `useCreateAiInsights` invalidates `aiKeys.insightHistory(variables.candidateId)` and populates `aiKeys.insightDetail(data.id)`.
- No global cache invalidations.

---

## 6. RBAC Enforcement
- Allowed: `COMPANY_ADMIN` and `RECRUITER`.
- Forbidden: `SUPER_ADMIN` and `CANDIDATE` (component returns `null`).

---

## 7. AI Trust Model & Safety
- AI recommendations are strictly advisory decision support for human recruiters.
- Zero automated ATS state mutations: AI output never automatically updates application stage, changes application status, hires, or rejects candidates.
- Prominent `AiDisclaimer` is rendered in both empty and active results states.

---

## 8. Explicit User Triggers
- Generation is never triggered automatically on mount, navigation, or page load.
- Generation requires explicit user clicks on "Generate Recruiter Insights" or "Regenerate Insights".

---

## 9. Tenant Isolation & Privacy
- Zero tenant identifiers passed in request payloads or URL parameters; tenant context is strictly extracted from verified JWT headers.
- Sensitive PII, recruiter notes, and system prompts are never written to client storage, URLs, or browser logs.

---

## 10. Verification Results
- **TypeScript**: `npm run type-check` (0 errors)
- **Linter**: `npm run lint` (0 warnings, 0 errors across 458 files)
- **Focused Tests**: `npx vitest run tests/applications/ai/` (4 files, 13 passed)
- **Full Test Suite**: `npm run test -- --run` (124 test files, 444 tests passed)
- **Production Build**: `npm run build` (0 errors)
