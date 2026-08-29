# HireStack ATS — Stage 7B: Candidates Frontend Implementation

## 1. Candidate Module Architecture

The Candidates module is the first complete ATS domain implemented in HireStack ATS. It resides under `src/features/candidates/` with strict domain boundaries and integration with Stage 2 UI components, Stage 3 `ApiClient` & TanStack Query, Stage 4 RBAC, Stage 5 AppShell, and Stage 7A shared ATS components.

```
src/features/candidates/
├── components/
│   ├── CandidateFilters.tsx      # Composable filter bar (Search, Status, Source)
│   ├── CandidateTable.tsx        # DataTable with name, contact, company, recruiter, status, actions
│   ├── CandidateForm.tsx         # Multi-section create/edit form with Zod/frontend validation
│   ├── CandidateSummary.tsx      # Overview card (contact, background, metadata, social links)
│   ├── CandidateNotes.tsx        # Recruiter notes timeline with note creation and deletion
│   ├── CandidateTags.tsx         # Tag pill list with tag addition and removal
│   ├── CandidateResume.tsx       # Resume attachment card with download action
│   └── index.ts
├── hooks/
│   ├── candidate-query-keys.ts   # Centralized query key factory
│   ├── useCandidates.ts          # Paginated list query
│   ├── useCandidate.ts           # Detail query
│   ├── useCreateCandidate.ts     # Create candidate mutation
│   ├── useUpdateCandidate.ts     # Update candidate mutation
│   ├── useDeleteCandidate.ts     # Soft-delete mutation
│   ├── useCandidateNotes.ts      # Add/delete note mutations
│   ├── useCandidateTags.ts       # Assign/remove tag mutations
│   └── index.ts
├── pages/
│   ├── CandidatesPage.tsx        # List view at /app/candidates
│   ├── CandidateDetailPage.tsx   # Profile view at /app/candidates/:candidateId
│   ├── CandidateCreatePage.tsx   # Creation wizard at /app/candidates/new
│   ├── CandidateEditPage.tsx     # Edit screen at /app/candidates/:candidateId/edit
│   └── index.ts
├── services/
│   └── candidates.service.ts     # ApiClient service wrapper
├── types/
│   └── candidates.types.ts       # Domain models, input types, and filter params
└── index.ts
```

---

## 2. Backend Endpoints Used

All operations strictly map to backend OpenAPI/Swagger contracts:

| Operation | Method & Path | Roles Authorized |
| :--- | :--- | :--- |
| **List Candidates** | `GET /candidates` | `COMPANY_ADMIN`, `RECRUITER` |
| **Get Candidate** | `GET /candidates/:id` | `COMPANY_ADMIN`, `RECRUITER` |
| **Create Candidate** | `POST /candidates` | `COMPANY_ADMIN`, `RECRUITER` |
| **Update Candidate** | `PATCH /candidates/:id` | `COMPANY_ADMIN`, `RECRUITER` |
| **Delete Candidate** | `DELETE /candidates/:id` | `COMPANY_ADMIN` |
| **Add Note** | `POST /candidates/:id/notes` | `COMPANY_ADMIN`, `RECRUITER` |
| **Delete Note** | `DELETE /candidates/:id/notes/:noteId` | `COMPANY_ADMIN`, `RECRUITER` |
| **Add Tag** | `POST /candidates/:id/tags` | `COMPANY_ADMIN`, `RECRUITER` |
| **Delete Tag** | `DELETE /candidates/:id/tags/:tagId` | `COMPANY_ADMIN`, `RECRUITER` |

---

## 3. Request / Response Contracts

- **List**: `GET /candidates?page=1&limit=10&search=john&status=ACTIVE&source=LINKEDIN&sortBy=createdAt&sortOrder=desc`
  - Returns `{ success: true, message: "Candidates retrieved successfully", data: SafeCandidate[], meta: { total, totalPages, page, limit } }`.
- **Detail**: `GET /candidates/:id`
  - Returns `{ success: true, data: SafeCandidate }` with nested `skills`, `education`, `experience`, `documents`, `notes`, `tags`, `primaryRecruiter`, `creator`.
- **Create**: `POST /candidates`
  - Request body: `{ firstName, lastName, email, phone, gender, city, state, country, currentCompany, currentDesignation, experienceYears, noticePeriod, source, employmentStatus, primaryRecruiterId }`.
  - Returns `{ success: true, data: SafeCandidate }`.
- **Update**: `PATCH /candidates/:id`
  - Request body: Partial fields plus `status`.

---

## 4. Query Keys

Predictable query key factories defined in `candidate-query-keys.ts`:

```ts
export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (filters?: CandidateFilterParams) => [...candidateKeys.lists(), { ...filters }] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const,
  notes: (id: string) => [...candidateKeys.detail(id), 'notes'] as const,
  tags: (id: string) => [...candidateKeys.detail(id), 'tags'] as const,
  resume: (id: string) => [...candidateKeys.detail(id), 'resume'] as const,
}
```

---

## 5. Search, Filters, Pagination & Sorting

- **Search**: Bound to `search` URL parameter via `useAtsUrlParams`, updating table rows with backend-driven query execution.
- **Filters**: `status` and `source` dropdowns with automatic page reset to `1`.
- **Pagination**: Backed by backend `page` and `limit` contract.
- **Sorting**: `sortBy` and `sortOrder` query parameters.

---

## 6. List, Detail, Create & Edit Experiences

- **List Page** (`/app/candidates`): Standard `AtsPageHeader` with "Add Candidate" primary button, `CandidateFilters`, `CandidateTable` (with clickable rows, status badge, recruiter column, and action buttons), and `Pagination`.
- **Detail Page** (`/app/candidates/:candidateId`): `AtsDetailHeader` with back navigation, `CandidateSummary`, `CandidateNotes`, `CandidateTags`, and `CandidateResume`.
- **Create Page** (`/app/candidates/new`): Wizard view with `CandidateForm` grouped into Basic Info, Professional Background, and Location/Links.
- **Edit Page** (`/app/candidates/:candidateId/edit`): Pre-populated `CandidateForm` allowing updates to candidate details and candidate status.

---

## 7. Notes, Tags & Resume Handling

- **Notes**: Recruiter notes timeline displaying author names, timestamps, and note contents. Includes "Add Note" form and delete action.
- **Tags**: Interactive tag pills with inline tag assignment and removal.
- **Resume**: Secure document listing with file metadata and download link (no raw filesystem paths exposed).

---

## 8. RBAC & Tenant Scoping

- **Role Protections**: Candidate routes are strictly guarded by `<ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>`.
- **Candidate User Isolation**: `CANDIDATE` and `SUPER_ADMIN` users attempting to access `/app/candidates` are redirected to `<ForbiddenPage />` (403 Access Restricted).
- **Tenant Scoping**: All operations rely on the backend JWT token for company context; no untrusted `companyId` parameters from URL or form payloads.

---

## 9. Verification & Test Summary

All test suites pass:
- `tests/candidates/candidates.service.test.ts` (7 tests)
- `tests/candidates/candidates.hooks.test.tsx` (5 tests)
- `tests/candidates/CandidatesPage.test.tsx` (2 tests)
- `tests/candidates/CandidateDetailPage.test.tsx` (2 tests)
- `tests/candidates/CandidateForm.test.tsx` (3 tests)
- `tests/candidates/CandidateRBAC.test.tsx` (2 tests)
- Total: 21 tests in `tests/candidates/` passing; full regression (73 test files, 204 tests) passing.
- `npm run type-check`: 0 errors.
- `npx oxlint`: 0 errors across 259 files.
- `npm run build`: Production client bundle built in 1.36s.
