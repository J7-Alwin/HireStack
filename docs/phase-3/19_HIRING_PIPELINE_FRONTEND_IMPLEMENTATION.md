# Phase 3 — Stage 7G: Hiring Pipeline Frontend Implementation

## 1. Overview
The **Hiring Pipeline Module** delivers the recruitment workflow visualization layer for HireStack ATS. It connects candidate applications, job requisitions, interviews, and offers into an accessible recruitment pipeline board.

The complete ATS domain hierarchy is:
$$\text{Candidate} \longrightarrow \text{Application} \longrightarrow \text{Job} \longrightarrow \text{Interview} \longrightarrow \text{Offer} \longrightarrow \text{Hiring Pipeline}$$

---

## 2. Backend Contract & State Machine

### 2.1 Authoritative Endpoints Used
1. `GET /pipeline`: Paginated and searchable pipeline list with filters (`currentStage`, `jobId`, `recruiterId`, `departmentId`, `active`, `completed`, `hired`, `rejected`, `withdrawn`, `startDate`, `endDate`, `sortBy`, `sortOrder`).
2. `GET /pipeline/:id`: Complete pipeline record with related application, candidate, job, and recruiter details.
3. `POST /pipeline`: Create hiring pipeline for an application.
4. `PATCH /pipeline/:id/stage`: Advance or transition a pipeline stage (`toStage`, `reason`, `comments`, `isOverride`).
5. `POST /pipeline/:id/notes`: Add recruiter/admin notes to candidate pipeline record.
6. `GET /pipeline/:id/history`: Audit trail of all stage transitions.
7. `GET /pipeline/:id/timeline`: Activity timeline events.
8. `DELETE /pipeline/:id`: Soft-delete pipeline (*Company Admin only*).
9. `GET /pipeline/dashboard`: Overall pipeline summary metrics.
10. `GET /pipeline/dashboard/company`: Company-wide hiring metrics (*Company Admin only*).
11. `GET /pipeline/dashboard/recruiter`: Recruiter-specific hiring metrics.

### 2.2 Pipeline Stage Ordering & Transitions
The backend defines 12 authoritative stages:
1. `APPLIED` (Order 1)
2. `SCREENING` (Order 2)
3. `SHORTLISTED` (Order 3)
4. `HR_INTERVIEW` (Order 4)
5. `TECHNICAL_INTERVIEW` (Order 5)
6. `FINAL_INTERVIEW` (Order 6)
7. `OFFER_PENDING` (Order 7)
8. `OFFER_SENT` (Order 8)
9. `OFFER_ACCEPTED` (Order 9)
10. `HIRED` (Order 10, Terminal)
11. `REJECTED` (Order 11, Terminal)
12. `WITHDRAWN` (Order 12, Terminal)

- **Standard Sequential Movement**: Recruiters advance candidates to the next sequential stage or to terminal exit states (`REJECTED`, `WITHDRAWN`).
- **Administrator Stage Override**: `COMPANY_ADMIN` users can jump or bypass stages (`isOverride: true`) with a mandatory override explanation reason (10–500 chars).

---

## 3. Architecture & File Structure

```
frontend/src/features/pipeline/
├── types/
│   └── pipeline.types.ts           # PipelineStage, Pipeline, DTOs, inputs, filters
├── utils/
│   └── pipeline-helpers.ts          # Stage order, labels, badges, transition rules, grouper
├── services/
│   └── pipeline.service.ts         # ApiClient service wrapping all 11 endpoints
├── hooks/
│   ├── pipeline-query-keys.ts       # TanStack Query key factory
│   ├── usePipelines.ts             # List query hook
│   ├── usePipeline.ts              # Detail query hook
│   ├── usePipelineHistory.ts       # Movement history query hook
│   ├── usePipelineTimeline.ts      # Activity timeline query hook
│   ├── useMovePipelineStage.ts     # Stage transition mutation hook
│   ├── useAddPipelineNotes.ts      # Notes mutation hook
│   ├── useDeletePipeline.ts        # Soft-delete mutation hook
│   └── index.ts                    # Hooks barrel export
├── components/
│   ├── PipelineStageBadge.tsx      # Stage badge component
│   ├── PipelineFilters.tsx         # Search, job, stage, status category filters
│   ├── PipelineApplicationCard.tsx # Candidate application card with links & actions
│   ├── PipelineColumn.tsx          # Stage column with count and scrollable cards
│   ├── PipelineBoard.tsx           # Multi-column Kanban board container
│   ├── PipelineMoveModal.tsx       # Accessible stage transition & override modal
│   ├── PipelineHistoryDrawer.tsx   # History audit & timeline drawer
│   └── index.ts                    # Components barrel export
├── pages/
│   └── PipelinePage.tsx            # /app/pipeline main page
└── index.ts                        # Feature root barrel export
```

---

## 4. Router & Navigation Configuration

### 4.1 Route (`src/routes/router.tsx`)
- `/app/pipeline`: `PipelinePage` (allowed roles: `COMPANY_ADMIN`, `RECRUITER`)

### 4.2 Navigation (`src/config/navigation.config.ts`)
- Added `pipeline` under `recruitment` section with `GitBranch` icon, enabled for `COMPANY_ADMIN` and `RECRUITER`.

---

## 5. Verification Results

| Verification Check | Target | Result | Details |
| :--- | :--- | :--- | :--- |
| **Type Check** | `npm run type-check` | **PASS** | `tsc -b` exited with 0 errors |
| **Linter** | `npm run lint` | **PASS** | `oxlint` 0 errors, 0 warnings across 405 files |
| **Pipeline Tests** | `vitest run tests/pipeline/` | **PASS** | 7/7 test files, 31/31 tests passing |
| **Full Regression** | `npm run test` | **PASS** | 108/108 test files, 361/361 tests passing |
| **Production Build** | `npm run build` | **PASS** | `vite build` completed in 1.42s |
