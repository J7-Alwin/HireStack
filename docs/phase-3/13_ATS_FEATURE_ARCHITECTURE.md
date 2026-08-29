# HireStack ATS — ATS Feature Architecture Guide

## 1. Overview & Objectives

This document establishes the frontend architecture, reusable shared component layer, URL state management patterns, and server-state conventions for the six core ATS modules in HireStack ATS:
1. **Candidates** (Stage 7B)
2. **Jobs** (Stage 7C)
3. **Applications** (Stage 7D)
4. **Interviews** (Stage 7E)
5. **Offers** (Stage 7F)
6. **Hiring Pipeline** (Stage 7G)

This architecture guarantees strict adherence to real backend OpenAPI/Swagger contracts, predictable state management via TanStack Query, seamless URL synchronization, and strict tenant/candidate security isolation.

---

## 2. Feature Boundaries & Folder Structure

All ATS features are located under `src/features/` with isolated domain boundaries:

```
src/features/<feature>/
├── components/       # Feature-specific presentation components
├── hooks/            # Query hooks & feature-specific query key factories
├── pages/            # List, Detail, Create, and Edit page views
├── services/         # ApiClient service wrappers
├── types/            # Domain models and input types matching Swagger
├── utils/            # Domain-specific formatters and calculations
└── index.ts          # Public feature barrel export
```

### Feature Module Responsibilities
- **`candidates/`**: Candidate profile lifecycle, resumes, candidate tags, and recruiter notes.
- **`jobs/`**: Job requisitions, department association, publication status, and openings.
- **`applications/`**: Central linking entity connecting Candidate, Job, Interviews, Offers, and Pipeline.
- **`interviews/`**: Multi-round interview scheduling, scorecards, and interviewer feedback.
- **`offers/`**: Compensation packages, approval workflows, sending, and candidate acceptance/rejection.
- **`pipeline/`**: Visual stage progression, transition histories, and pipeline bottlenecks.

---

## 3. Shared ATS Components (`src/components/ats/`)

To prevent duplication and ensure visual consistency across all ATS modules, shared components build on top of Stage 2 UI foundations:

1. **`AtsPageHeader`**: Standardized module header supporting title, subtitle, status/count badges, primary CTA button, and secondary action buttons.
2. **`AtsStatusBadge`**: Universal status badge automatically translating domain status enums into human-readable labels and semantic `BadgeVariant` colors.
3. **`AtsFilterBar`**: Composable filter container with responsive layout and integrated "Reset Filters" action.
4. **`AtsDetailHeader`**: Detail view header featuring back navigation, entity title, status badge, metadata tags, and action toolbars.
5. **`AtsConfirmDialog`**: Accessible modal dialog for confirming destructive actions (e.g. deletion, status transitions, offer withdrawals).
6. **`AtsEmptyState`**: Empty state container providing friendly messaging and call-to-action buttons.

---

## 4. API Service Pattern

All ATS network requests must flow through the Stage 3 `ApiClient` singleton. Direct `fetch` or `axios` calls within components are strictly prohibited:

```
UI Component / Page
       ↓
React Query Hook (e.g., useCandidates)
       ↓
Feature Service (e.g., candidateService)
       ↓
ApiClient (src/services/api/api-client.ts)
       ↓
Backend OpenAPI REST Endpoints
```

---

## 5. React Query & Query Key Architecture

Each feature module defines a centralized query key factory following standard hierarchy:

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

### Invalidation Rules:
- Creating a resource invalidates `lists()`.
- Updating a resource invalidates `detail(id)` and `lists()`.
- Adding sub-resources (e.g., candidate notes) invalidates `notes(id)` and `detail(id)`.

---

## 6. URL State, Filtering, Search & Pagination

List page state is persisted in URL search parameters using `useAtsUrlParams`:

```tsx
const { params, setParam, setPage, setSearch, resetParams } = useAtsUrlParams<JobFilterParams>({
  defaults: { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
})
```

- **Persistence**: Supports browser refresh, back/forward history, and deep-link sharing.
- **Auto-Reset**: Changing search or filters automatically resets `page` to `1`.
- **Debouncing**: Search inputs debounce changes before updating URL search parameters.
- **Pagination**: Strictly uses backend-supported `page` and `limit` pagination.

---

## 7. Status Architecture & Presentation

Backend enum values are authoritative and never mutated. `src/utils/ats/status-helpers.ts` provides clean presentation mapping:

| Backend Status | Display Label | Badge Variant |
| :--- | :--- | :--- |
| `ACTIVE`, `OPEN`, `HIRED`, `ACCEPTED` | Active, Open, Hired, Accepted | `success` |
| `REJECTED`, `CANCELLED`, `BLACKLISTED` | Rejected, Cancelled, Blacklisted | `error` |
| `PENDING_APPROVAL`, `PAUSED`, `OFFER_PENDING` | Pending Approval, Paused, Offer Pending | `warning` |
| `SHORTLISTED`, `TECHNICAL_INTERVIEW`, `SCHEDULED` | Shortlisted, Technical Interview, Scheduled | `accent` |
| `DRAFT`, `CLOSED`, `ARCHIVED`, `WITHDRAWN` | Draft, Closed, Archived, Withdrawn | `neutral` |

---

## 8. Role-Based Access Control (RBAC) & Tenant Isolation

- **Role Capabilities**:
  - `SUPER_ADMIN`: Cross-company platform administration.
  - `COMPANY_ADMIN`: Full company tenant ATS administration (job requisitions, department workflows, offer configurations).
  - `RECRUITER`: Sourcing, candidate management, interview scheduling, and feedback submission within the company.
  - `CANDIDATE`: Candidate portal (own profile, applied jobs, scheduled interviews).
- **Tenant Isolation**:
  - The frontend never passes or trusts arbitrary `companyId` URL params.
  - Tenant scoping is enforced by backend JWT token extraction.

---

## 9. List, Detail & Form Patterns

### List Page Pattern
`AtsPageHeader` → `AtsFilterBar` (Search + Filters) → `DataTable` → `Pagination`

### Detail Page Pattern
`AtsDetailHeader` → `Card` (Primary Overview) → Tabbed Sections (Applications, Timeline, Notes) → Action Toolbar

### Form Pattern
Validation (zod/form schemas) → `Input` / `Select` / `Textarea` → Mutation via TanStack Query → Targeted Invalidation → Success Toast & Navigate

---

## 10. Future AI Integration Boundary

AI features (e.g. AI resume parsing, candidate match scoring, automated job description generation) will integrate into designated slots within detail and list pages without altering core ATS architecture.
