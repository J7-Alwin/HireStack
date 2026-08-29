# HireStack ATS — Stage 7C: Jobs Frontend Implementation

## 1. Job Module Architecture

The Jobs module provides end-to-end job requisition management for authorized company administrators and recruiters in HireStack ATS. It resides under `src/features/jobs/` with strict domain boundaries and integration with Stage 2 UI components, Stage 3 `ApiClient` & TanStack Query, Stage 4 RBAC, Stage 5 AppShell, and Stage 7A shared ATS components.

```
src/features/jobs/
├── components/
│   ├── JobFilters.tsx        # Composable filter bar (Search, Status, EmploymentType, Department)
│   ├── JobTable.tsx          # DataTable with title, department, workplace, openings, status, actions
│   ├── JobForm.tsx           # Multi-section create/edit form with Zod/frontend validation
│   ├── JobSummary.tsx        # Overview card (department, location, compensation, recruiter metadata)
│   ├── JobDescription.tsx    # Sections for description, responsibilities, requirements, benefits
│   ├── JobActions.tsx        # Action triggers for lifecycle transitions (Publish, Open, Pause, Close, Archive)
│   └── index.ts
├── hooks/
│   ├── job-query-keys.ts     # Centralized query key factory
│   ├── useJobs.ts            # Paginated list query
│   ├── useJob.ts             # Detail query
│   ├── useCreateJob.ts       # Create requisition mutation
│   ├── useUpdateJob.ts       # Update requisition mutation
│   ├── useDeleteJob.ts       # Soft-delete mutation
│   ├── useJobStatus.ts       # Status lifecycle transition mutations
│   ├── useDepartmentOptions.ts # Department options query
│   └── index.ts
├── pages/
│   ├── JobsPage.tsx          # List view at /app/jobs
│   ├── JobDetailPage.tsx     # Requisition view at /app/jobs/:jobId
│   ├── JobCreatePage.tsx     # Creation wizard at /app/jobs/new
│   ├── JobEditPage.tsx       # Edit screen at /app/jobs/:jobId/edit
│   └── index.ts
├── services/
│   └── jobs.service.ts       # ApiClient service wrapper
├── types/
│   └── jobs.types.ts         # Domain models, input types, and filter params
└── index.ts
```

---

## 2. Backend Endpoints Used

All operations strictly map to backend OpenAPI/Swagger contracts:

| Operation | Method & Path | Roles Authorized |
| :--- | :--- | :--- |
| **List Jobs** | `GET /jobs` | `COMPANY_ADMIN`, `RECRUITER` |
| **Get Job** | `GET /jobs/:id` | `COMPANY_ADMIN`, `RECRUITER` |
| **Create Job** | `POST /jobs` | `COMPANY_ADMIN`, `RECRUITER` |
| **Update Job** | `PATCH /jobs/:id` | `COMPANY_ADMIN`, `RECRUITER` |
| **Publish Job** | `PATCH /jobs/:id/publish` | `COMPANY_ADMIN`, `RECRUITER` |
| **Open Job** | `PATCH /jobs/:id/open` | `COMPANY_ADMIN`, `RECRUITER` |
| **Pause Job** | `PATCH /jobs/:id/pause` | `COMPANY_ADMIN`, `RECRUITER` |
| **Reopen Job** | `PATCH /jobs/:id/reopen` | `COMPANY_ADMIN`, `RECRUITER` |
| **Close Job** | `PATCH /jobs/:id/close` | `COMPANY_ADMIN`, `RECRUITER` |
| **Archive Job** | `PATCH /jobs/:id/archive` | `COMPANY_ADMIN`, `RECRUITER` |
| **Delete Job** | `DELETE /jobs/:id` | `COMPANY_ADMIN` |
| **Department Options** | `GET /departments/options` | `COMPANY_ADMIN`, `RECRUITER` |

---

## 3. Request / Response Contracts

- **List**: `GET /jobs?page=1&limit=10&search=frontend&department=dept_eng&status=OPEN&employmentType=FULL_TIME&sortBy=createdAt&sortOrder=desc`
  - Returns `{ success: true, message: "Jobs retrieved successfully", data: SafeJob[], meta: { total, totalPages, page, limit } }`.
- **Detail**: `GET /jobs/:id`
  - Returns `{ success: true, data: SafeJob }` with nested `department`, `recruiters`, `skills`, `creator`.
- **Create**: `POST /jobs`
  - Request body: `{ title, departmentId, description, responsibilities, requirements, benefits, employmentType, workplaceType, experienceMin, experienceMax, salaryMin, salaryMax, currency, location, openings }`.
  - Returns `{ success: true, data: SafeJob }`.
- **Update**: `PATCH /jobs/:id`
  - Request body: Partial fields.

---

## 4. Query Keys

Centralized in `job-query-keys.ts`:

```ts
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters?: JobFilterParams) => [...jobKeys.lists(), { ...filters }] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
}
```

---

## 5. Job Lifecycle State Machine

- **`DRAFT`**: Can be published (`/publish`) or directly opened (`/open`).
- **`PUBLISHED`**: Can be opened (`/open`).
- **`OPEN`**: Active requisition receiving applications. Can be paused (`/pause`) or closed (`/close`).
- **`PAUSED`**: Temporarily frozen. Can be reopened (`/reopen`) or closed (`/close`).
- **`CLOSED`**: Hiring concluded. Can be archived (`/archive`).
- **`ARCHIVED`**: Retained for historical record.

---

## 6. RBAC & Tenant Scoping

- **Role Protections**: Job routes are strictly guarded by `<ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>`.
- **Candidate User Isolation**: `CANDIDATE` and `SUPER_ADMIN` users attempting to access `/app/jobs` are redirected to `<ForbiddenPage />` (403 Access Restricted).
- **Tenant Scoping**: All operations rely on the backend JWT token for company context; no untrusted `companyId` parameters from URL or form payloads.

---

## 7. Verification & Test Summary

All test suites pass:
- `tests/jobs/jobs.service.test.ts` (7 tests)
- `tests/jobs/jobs.hooks.test.tsx` (7 tests)
- `tests/jobs/JobsPage.test.tsx` (2 tests)
- `tests/jobs/JobDetailPage.test.tsx` (2 tests)
- `tests/jobs/JobForm.test.tsx` (3 tests)
- `tests/jobs/JobRBAC.test.tsx` (2 tests)
- Total: 23 tests in `tests/jobs/` passing; full regression (79 test files, 227 tests) passing.
- `npm run type-check`: 0 errors.
- `npx oxlint`: 0 errors across 286 files.
- `npm run build`: Production client bundle built in 1.33s.
