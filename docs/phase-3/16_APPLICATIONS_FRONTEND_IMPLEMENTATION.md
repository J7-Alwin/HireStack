# HireStack ATS — Stage 7D: Applications Frontend Implementation

## 1. Application Module Architecture

The Applications module links Candidates and Job Requisitions to power hiring progression in HireStack ATS. It resides under `src/features/applications/` and integrates with Stage 2 Design System, Stage 3 `ApiClient` & TanStack Query, Stage 4 RBAC, Stage 5 AppShell, Stage 7A shared ATS components, Stage 7B Candidates module, and Stage 7C Jobs module.

```
src/features/applications/
├── components/
│   ├── ApplicationFilters.tsx    # Composable filter bar (Search, Stage, Status, Source)
│   ├── ApplicationTable.tsx      # DataTable with Candidate, Job, Stage, Status, Recruiter, Actions
│   ├── ApplicationCandidate.tsx  # Relational summary card with direct link to /app/candidates/:id
│   ├── ApplicationJob.tsx        # Relational summary card with direct link to /app/jobs/:id
│   ├── ApplicationSummary.tsx    # Metadata overview card (Source, Recruiter, Dates, Remarks, Rejection info)
│   ├── ApplicationActions.tsx    # Workflow controls (Stage progression, Rejection dialog, Withdrawal dialog)
│   ├── ApplicationForm.tsx       # Reusable create / edit remarks form
│   └── index.ts
├── hooks/
│   ├── application-query-keys.ts # Centralized query key factory
│   ├── useApplications.ts        # Paginated list query
│   ├── useApplication.ts         # Detail query
│   ├── useCreateApplication.ts   # Create application mutation
│   ├── useUpdateApplication.ts   # Update application remarks mutation
│   ├── useDeleteApplication.ts   # Soft-delete mutation
│   ├── useWorkflowMutations.ts   # Stage advancement, Status update, Rejection, Withdrawal mutations
│   └── index.ts
├── pages/
│   ├── ApplicationsPage.tsx      # List view at /app/applications
│   ├── ApplicationDetailPage.tsx # Detail view at /app/applications/:applicationId
│   ├── ApplicationCreatePage.tsx # Creation wizard at /app/applications/new
│   ├── ApplicationEditPage.tsx   # Edit remarks screen at /app/applications/:applicationId/edit
│   └── index.ts
├── services/
│   └── applications.service.ts   # ApiClient service wrapper
├── types/
│   └── applications.types.ts     # Domain models, input types, and filter params
└── index.ts
```

---

## 2. Exact Backend Endpoints Used

All operations strictly map to backend OpenAPI/Swagger contracts:

| Operation | Method & Path | Roles Authorized | Description |
| :--- | :--- | :--- | :--- |
| **List Applications** | `GET /applications` | `COMPANY_ADMIN`, `RECRUITER` | Paginated search, filters, and sorting |
| **Get Application** | `GET /applications/:id` | `COMPANY_ADMIN`, `RECRUITER` | Full application details with Candidate and Job summaries |
| **Create Application** | `POST /applications` | `COMPANY_ADMIN`, `RECRUITER` | Match active candidate with open job |
| **Update Application** | `PATCH /applications/:id` | `COMPANY_ADMIN`, `RECRUITER` | Update editable fields (`remarks`) |
| **Update Stage** | `PATCH /applications/:id/stage` | `COMPANY_ADMIN`, `RECRUITER` | Advance pipeline stage |
| **Update Status** | `PATCH /applications/:id/status` | `COMPANY_ADMIN`, `RECRUITER` | Update status (e.g. `HIRED`) |
| **Reject Application** | `PATCH /applications/:id/reject` | `COMPANY_ADMIN`, `RECRUITER` | Reject with reason code & optional note |
| **Withdraw Application** | `PATCH /applications/:id/withdraw` | `COMPANY_ADMIN`, `RECRUITER` | Record withdrawal with reason code & optional note |
| **Assign Recruiter** | `PATCH /applications/:id/assign` | `COMPANY_ADMIN` | Assign or reassign recruiter |
| **Soft Delete** | `DELETE /applications/:id` | `COMPANY_ADMIN` | Soft delete application |
| **Restore** | `PATCH /applications/:id/restore` | `COMPANY_ADMIN` | Restore soft-deleted application |

---

## 3. Request / Response Contracts

- **List**: `GET /applications?page=1&limit=10&search=Jane&stage=APPLIED&status=ACTIVE&sortBy=appliedAt&sortOrder=desc`
  - Returns `{ success: true, message: "Applications retrieved successfully", data: SafeApplication[], meta: { total, totalPages, page, limit } }`.
- **Detail**: `GET /applications/:id`
  - Returns `{ success: true, data: SafeApplication }` with nested `candidate`, `job`, `assignedRecruiter`, `creator`, `updater`.
- **Create**: `POST /applications`
  - Request body: `{ candidateId, jobId, assignedRecruiterId, source, remarks }`.
  - Returns `{ success: true, data: SafeApplication }`.
- **Update**: `PATCH /applications/:id`
  - Request body: `{ remarks }`.

---

## 4. Query Keys

Centralized in `application-query-keys.ts`:

```ts
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters?: ApplicationFilterParams) => [...applicationKeys.lists(), { ...filters }] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  timeline: (id: string) => [...applicationKeys.detail(id), 'timeline'] as const,
  notes: (id: string) => [...applicationKeys.detail(id), 'notes'] as const,
}
```

---

## 5. State Transition Machine

- **Stages**: `APPLIED` → `SCREENING` → `SHORTLISTED` → `INTERVIEW` → `OFFER`
- **Statuses**:
  - `ACTIVE`: Application is active. Can transition to `HIRED`, `REJECTED`, `WITHDRAWN`, or `ARCHIVED`.
  - `HIRED`, `REJECTED`, `WITHDRAWN`, `ARCHIVED`: Terminal statuses.

---

## 6. RBAC & Tenant Scoping

- **Role Protections**: Application routes are guarded by `<ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>`.
- **Candidate User Isolation**: `CANDIDATE` and `SUPER_ADMIN` roles cannot access company application management and are redirected to `<ForbiddenPage />` (403 Access Restricted).
- **Tenant Scoping**: All operations rely on backend JWT context; no arbitrary `companyId` parameters from URL or form payloads.

---

## 7. Verification & Test Summary

All test suites pass:
- `tests/applications/applications.service.test.ts` (9 tests)
- `tests/applications/applications.hooks.test.tsx` (6 tests)
- `tests/applications/ApplicationsPage.test.tsx` (2 tests)
- `tests/applications/ApplicationDetailPage.test.tsx` (2 tests)
- `tests/applications/ApplicationForm.test.tsx` (2 tests)
- `tests/applications/ApplicationRBAC.test.tsx` (2 tests)
- Total: 23 tests in `tests/applications/` passing; full regression (85 test files, 250 tests) passing.
- `npm run type-check`: 0 errors.
- `npx oxlint`: 0 errors across 313 files.
- `npm run build`: Production client bundle built in 1.51s.
