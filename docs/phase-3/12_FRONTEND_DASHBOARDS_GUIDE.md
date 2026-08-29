# HireStack ATS — Frontend Dashboards Guide

## 1. Overview

This document details the production dashboard architecture, role resolution logic, Swagger/OpenAPI backend contracts, data fetching strategy, and component design implemented in **Phase 3 — Stage 6** of HireStack ATS.

The dashboard system provides four dedicated, role-specific dashboard experiences:
1. **`SUPER_ADMIN`** — Platform-level operational metrics and tenant management telemetry.
2. **`COMPANY_ADMIN`** — Company-wide hiring pipeline health, job openings, and candidate progression.
3. **`RECRUITER`** — Recruiter-specific workspace focusing on assigned candidate pipelines and scheduled interviews.
4. **`CANDIDATE`** — Applicant self-service portal with profile summary and status tracking.

---

## 2. Dashboard Architecture

```
src/features/dashboard/
├── components/
│   ├── DashboardHeader.tsx       # Header with role badge and action buttons
│   ├── KpiCard.tsx               # Metric cards with skeleton loading
│   ├── PipelineStageBreakdown.tsx# Visual distribution of candidates across stages
│   └── DashboardLoadingState.tsx # Skeleton grid for initial dashboard loading
├── hooks/
│   ├── dashboard-query-keys.ts   # Centralized query keys for React Query
│   ├── useSuperAdminDashboard.ts # Platform telemetry hook
│   ├── useCompanyAdminDashboard.ts# Company pipeline & jobs hook
│   ├── useRecruiterDashboard.ts  # Recruiter assignments hook
│   └── useCandidateDashboard.ts  # Candidate profile hook
├── pages/
│   ├── SuperAdminDashboardPage.tsx
│   ├── CompanyAdminDashboardPage.tsx
│   ├── RecruiterDashboardPage.tsx
│   ├── CandidateDashboardPage.tsx
│   └── DashboardRouter.tsx       # Centralized role resolution router
├── services/
│   └── dashboard.service.ts      # ApiClient HTTP service calls
├── types/
│   └── dashboard.types.ts        # Data contracts & interfaces
└── utils/
    └── dashboard-formatters.ts   # Number, date, and pipeline stage formatting
```

---

## 3. Backend Swagger / OpenAPI Endpoints Used

All metrics are fetched from real backend contracts without invented endpoints or mock numbers:

### 3.1 Super Admin Endpoints
- **`GET /companies`** (`listCompanies`)
  - Parameters: `{ page: 1, limit: 10 }`
  - Returns: Total registered companies, active companies count, and recently onboarded tenant details.
- **`GET /users`** (`listUsers`)
  - Parameters: `{ page: 1, limit: 10 }`
  - Returns: Total platform users count, active account count, and recently registered accounts.

### 3.2 Company Admin Endpoints
- **`GET /pipeline/dashboard/company`** (`getCompanyDashboard`)
  - Returns: `activeCandidates`, `hiredCount`, `rejectedCount`, `withdrawnCount`, `interviewsToday`, `offersPending`, `offersAccepted`, and `stageBreakdown`.
- **`GET /jobs`** (`listJobs`)
  - Parameters: `{ page: 1, limit: 5, sortOrder: 'desc' }`
  - Returns: Latest job openings with status and department.
- **`GET /applications`** (`listApplications`)
  - Parameters: `{ page: 1, limit: 5, sortOrder: 'desc' }`
  - Returns: Latest candidate applications with codes and stage.
- **`GET /interviews`** (`listInterviews`)
  - Parameters: `{ page: 1, limit: 5, sortOrder: 'desc' }`
  - Returns: Upcoming scheduled interviews.

### 3.3 Recruiter Endpoints
- **`GET /pipeline/dashboard/recruiter`** (`getRecruiterDashboard`)
  - Returns: Recruiter-scoped `activeCandidates`, `hiredCount`, `interviewsToday`, `offersPending`, and `stageBreakdown`.
- **`GET /applications`** (`listApplications`)
  - Automatically filtered to `assignedRecruiterId === currentUser.id` by the backend.
- **`GET /interviews`** (`listInterviews`)
  - Recruiter scheduled interview sessions.

### 3.4 Candidate Endpoints
- **`GET /users/me`** (`getCurrentUserProfile`)
  - Returns: Candidate identity, registration status, and profile context.

---

## 4. Role Resolution Mechanism

The application mounts `DashboardRouter` at the `/app` index route inside `<ProtectedRoute><AppShell /></ProtectedRoute>`.

The role is resolved strictly from the verified authenticated state (`useAuth().user.role`), preventing URL-based privilege escalation:

```tsx
export function DashboardRouter() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <ErrorState title="Authentication required" />
  }

  switch (user.role) {
    case Role.SUPER_ADMIN:
      return <SuperAdminDashboardPage />
    case Role.COMPANY_ADMIN:
      return <CompanyAdminDashboardPage />
    case Role.RECRUITER:
      return <RecruiterDashboardPage />
    case Role.CANDIDATE:
      return <CandidateDashboardPage />
    default:
      return <ErrorState title="Unsupported Account Role" />
  }
}
```

---

## 5. React Query & Server State Strategy

### 5.1 Query Keys
Predictable query keys are generated via `dashboardKeys`:
- `dashboardKeys.superAdmin()` → `['dashboard', 'super-admin']`
- `dashboardKeys.companyAdmin()` → `['dashboard', 'company-admin']`
- `dashboardKeys.recruiter()` → `['dashboard', 'recruiter']`
- `dashboardKeys.candidate()` → `['dashboard', 'candidate']`

### 5.2 Caching & Invalidation
- **Stale Time**: `60 seconds` default freshness to minimize redundant network calls while keeping dashboard data fresh.
- **Cache Invalidation**: On logout, `authService.logout()` wipes the entire React Query cache, ensuring no tenant or candidate data leaks into subsequent sessions.

---

## 6. UI & Design System Components

- **Visual Direction**: HireStack Editorial SaaS (Warm White `#F6F5F2`, Charcoal `#2B2B2B`, Lime `#E3FF7A` accents).
- **KPI Cards**: `KpiCard` component built on Stage 2 `Card` with built-in `pulse` skeleton loaders.
- **Pipeline Visualization**: `PipelineStageBreakdown` renders animated distribution progress bar and stage count badges.
- **Tables**: Stage 2 `DataTable` with strongly typed `ColumnDef` configurations and responsive scrolling.
- **Loading & Errors**: `DashboardLoadingState` for seamless skeletons, and `ErrorState` with retry callbacks on network failure.

---

## 7. Security & Tenant Isolation

1. **Company Isolation**: All company requests rely on the backend token extraction (`req.user.companyId`). The frontend never sends or trusts arbitrary `?companyId=` overrides.
2. **Candidate Isolation**: Candidate requests are scoped to the authenticated user token.
3. **Role Enforcement**: Both client-side guards (`ProtectedRoute`, `DashboardRouter`) and backend middleware (`authorizeRoles`) enforce access controls at every layer.
