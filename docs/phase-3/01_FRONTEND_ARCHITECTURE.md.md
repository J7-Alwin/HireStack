# HireStack ATS — Frontend Architecture

**Phase:** 3 — Frontend  
**Version:** 1.0.0  
**Status:** Approved  
**Architecture Type:** React SPA  
**Backend:** HireStack ATS Backend v2.0.0  
**Primary Goal:** Production-ready frontend for the complete ATS platform

---

# 1. Purpose

This document defines the frontend architecture for the HireStack ATS application.

The frontend will provide a role-based, secure, responsive interface for:

- Super Admin
- Company Admin
- Recruiter
- Candidate

The frontend consumes the existing HireStack ATS backend APIs.

The frontend must not duplicate backend business rules.

The backend remains the source of truth for:

- Authentication
- Authorization
- Business rules
- Validation
- State transitions
- Database operations
- AI processing
- File processing
- Audit operations
- Security enforcement

The frontend is responsible for:

- User interface
- Navigation
- Form handling
- Client-side validation
- API communication
- State management
- Loading states
- Error handling
- Responsive layouts
- Role-based UI visibility
- User experience

---

# 2. Frontend Technology Stack

## Core

- React
- TypeScript
- Vite

## Routing

- React Router

## API Communication

- Axios

## Server State

- TanStack Query

## Client State

- Zustand

## Validation

- Zod

## Forms

- React Hook Form

## Styling

- Tailwind CSS

## UI Components

- Reusable internal component system
- Accessible UI primitives

## Icons

- Lucide React

## Charts

- Recharts

## Authentication

- JWT-based authentication using backend API

---

# 3. Architectural Principles

The frontend follows these principles:

1. Feature-based architecture
2. Strong TypeScript typing
3. Reusable components
4. API abstraction
5. Server-state separation from UI state
6. Role-based access control
7. Route protection
8. Backend-driven authorization
9. No business-critical security logic in frontend
10. Responsive-first design
11. Accessibility
12. Consistent error handling
13. Consistent loading states
14. Centralized API configuration
15. Centralized authentication state
16. Minimal duplication
17. Production-ready code structure

---

# 4. High-Level Architecture

```text
                         ┌───────────────────────┐
                         │       Browser         │
                         │                       │
                         │      React SPA        │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │     React Router      │
                         │                       │
                         │ Public / Protected    │
                         │ Role-Based Routes     │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      Page Layer       │
                         │                       │
                         │ Dashboards / Pages    │
                         └───────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
              Components        Hooks/State       Forms
                    │                │                │
                    └────────────────┼────────────────┘
                                     ▼
                         ┌───────────────────────┐
                         │    Service Layer      │
                         │                       │
                         │ API / Query Services  │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │     Axios Client      │
                         │                       │
                         │ JWT / Errors / Base   │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │ HireStack Backend     │
                         │                       │
                         │ Node + Express +      │
                         │ Prisma + PostgreSQL   │
                         └───────────────────────┘

5. Application Architecture Layers

The frontend is divided into the following logical layers:

Presentation Layer
        │
        ▼
Page / Feature Layer
        │
        ▼
Hook / State Layer
        │
        ▼
Service Layer
        │
        ▼
API Client Layer
        │
        ▼
Backend API
6. Presentation Layer

Responsible for rendering the UI.

Contains:

Buttons
Inputs
Tables
Cards
Modals
Dialogs
Dropdowns
Navigation
Sidebar
Header
Charts
Empty states
Error states
Loading states

Presentation components must remain reusable.

Example:

components/
├── ui/
├── layout/
├── forms/
├── tables/
├── charts/
└── feedback/
7. Feature Architecture

Features are organized by business domain.

features/
├── auth/
├── super-admin/
├── company/
├── recruiters/
├── candidates/
├── jobs/
├── applications/
├── interviews/
├── offers/
├── hiring-pipeline/
├── ai/
├── notifications/
├── analytics/
└── reports/

Each feature should contain only code belonging to that feature.

Example:

features/jobs/
├── components/
├── pages/
├── hooks/
├── services/
├── schemas/
├── types/
└── index.ts
8. Role Architecture

HireStack has four primary frontend roles.

                         HireStack
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
    Super Admin       Company Admin       Recruiter
                                              │
                                              ▼
                                          Candidate

Actual authorization remains enforced by the backend.

Frontend role checks exist for:

Route visibility
Navigation
UI visibility
Better user experience

Frontend role checks must never be treated as a security boundary.

9. Super Admin Dashboard

The Super Admin dashboard is included in Phase 3.

Super Admin operates at the platform level rather than inside a single company tenant.

Primary responsibilities:

Platform overview
Company management
Platform statistics
Company activation/deactivation
Platform-level monitoring
System configuration where supported by backend APIs

The Super Admin must not automatically receive company recruiter/candidate data unless the backend explicitly exposes such access.

Suggested routes:

/super-admin
/super-admin/companies
/super-admin/companies/:id
/super-admin/analytics
/super-admin/settings
10. Company Admin Dashboard

Company Admin operates within one company tenant.

Primary areas:

/company-admin
/company-admin/recruiters
/company-admin/candidates
/company-admin/jobs
/company-admin/applications
/company-admin/interviews
/company-admin/offers
/company-admin/pipeline
/company-admin/analytics
/company-admin/reports
/company-admin/ai

Company Admin can manage company-level ATS operations according to backend authorization.

11. Recruiter Dashboard

Recruiters operate within assigned company jobs and recruiter permissions.

Suggested routes:

/recruiter
/recruiter/jobs
/recruiter/jobs/:id
/recruiter/candidates
/recruiter/candidates/:id
/recruiter/applications
/recruiter/interviews
/recruiter/offers
/recruiter/pipeline
/recruiter/ai

Recruiter visibility must respect backend job assignment rules.

12. Candidate Dashboard

Candidates have self-scoped access.

Suggested routes:

/candidate
/candidate/profile
/candidate/resume
/candidate/jobs
/candidate/jobs/:id
/candidate/applications
/candidate/interviews
/candidate/offers
/candidate/ai

Candidate users must never be able to access another candidate's resources.

13. AI Frontend Architecture

Phase 2 introduced the following backend AI modules:

AI
├── Resume Parser
├── ATS Score
├── Job Matching
├── Resume Recommendations
├── Interview Assistant
├── AI Insights
└── AI Optimization

Frontend integration will consume the existing APIs.

The frontend must not implement AI logic.

14. AI UI Areas
Resume Parser

Candidate resume upload and parsed profile display.

Possible UI:

Resume
 ├── Upload Resume
 ├── Parsing Status
 ├── Parsed Skills
 ├── Experience
 ├── Education
 └── Resume Preview
ATS Score

Display:

Overall score
Score breakdown
Strengths
Weaknesses
Missing keywords
Improvement suggestions
Job Matching

Display:

Match score
Matching skills
Missing skills
Experience match
Job suitability
Resume Recommendations

Display:

Recommendations
Improvement areas
Resume suggestions
Job-specific recommendations
Interview Assistant

Display:

Interview kit
Questions
Categories
Difficulty
Reasons
Follow-up questions
Interview history
AI Insights

Display:

Overall insight
Strengths
Weaknesses
Skill gaps
Experience concerns
Hiring risks
Hiring confidence
Job-fit observations
Recruiter focus areas
Recommendation
Historical insights
15. Authentication Architecture

Authentication flow:

Login
  │
  ▼
POST /auth/login
  │
  ▼
Backend validates credentials
  │
  ▼
JWT returned
  │
  ▼
Frontend stores authentication state
  │
  ▼
Protected routes become available

The frontend must maintain:

Auth State
├── isAuthenticated
├── user
├── role
├── companyId
└── session state
16. Protected Routes

Protected routes must verify authentication before rendering protected pages.

Example:

ProtectedRoute
      │
      ├── Not authenticated
      │       └── Redirect /login
      │
      └── Authenticated
              │
              ▼
        RoleProtectedRoute
              │
              ├── Unauthorized
              │       └── /403
              │
              └── Authorized
                      │
                      ▼
                    Page
17. API Architecture

All backend requests must pass through a centralized Axios client.

api/
├── client.ts
├── auth.api.ts
├── companies.api.ts
├── recruiters.api.ts
├── candidates.api.ts
├── jobs.api.ts
├── applications.api.ts
├── interviews.api.ts
├── offers.api.ts
├── pipeline.api.ts
└── ai.api.ts

No component should directly create Axios requests.

Bad:

axios.get("/jobs");

Good:

jobApi.getJobs();
18. Axios Client

Central client responsibilities:

Base URL
JWT attachment
Request configuration
Response handling
Error normalization
Authentication failure handling

Example:

Axios Client
     │
     ├── Attach Authorization
     │
     ├── Send Request
     │
     ├── Receive Response
     │
     ├── Normalize Errors
     │
     └── Return Typed Response
19. Server State Management

TanStack Query will manage server state.

Used for:

API fetching
Caching
Refetching
Mutations
Loading states
Error states
Query invalidation

Example:

useJobs()
useCandidates()
useApplications()
useInterviews()
useAiInsights()
20. Client State Management

Zustand will be used only for client-side application state.

Examples:

Authentication state
Sidebar state
UI preferences
Temporary UI state

Do not duplicate API data unnecessarily in Zustand.

21. Form Architecture

React Hook Form + Zod will be used.

Flow:

User Input
    │
    ▼
React Hook Form
    │
    ▼
Zod Validation
    │
    ├── Invalid
    │      └── Display errors
    │
    └── Valid
           │
           ▼
        API Call

Backend validation remains authoritative.

22. Error Handling

The frontend will use a centralized error strategy.

Error categories:

400 → Validation Error
401 → Authentication Error
403 → Authorization Error
404 → Not Found
409 → Conflict
422 → Business Validation Error
429 → Rate Limit
500 → Server Error
503 → Service Unavailable

The UI should display user-friendly messages.

Internal backend details must not be exposed unnecessarily.

23. Loading States

Every asynchronous operation must have an appropriate loading state.

Examples:

Page Loading
Table Loading
Button Loading
Form Submission Loading
AI Generation Loading
File Upload Loading

AI operations should provide clear progress feedback because AI generation can take longer than normal API requests.

24. AI Loading UX

For AI operations:

Request Started
      │
      ▼
Generating...
      │
      ├── Success
      │      └── Display Result
      │
      └── Failure
             └── Display Retry Option

The frontend must never expose internal retry implementation details.

25. File Upload Architecture

Frontend file uploads will be implemented through the backend API.

Flow:

Select File
    │
    ▼
Client Validation
    │
    ▼
Upload API
    │
    ▼
Backend Validation
    │
    ▼
File Processing
    │
    ▼
Response

Client validation may check:

File type
File size
Required file

Backend remains authoritative.

26. Pagination

Large datasets must use backend pagination.

Examples:

Candidates
Jobs
Applications
Interviews
Recruiters
Companies

Frontend pagination should preserve:

page
limit
search
filters
sort
order
27. Search, Filtering & Sorting

Search/filter/sort controls should map directly to backend API query parameters.

Example:

/candidates
  ?page=1
  &limit=20
  &search=john
  &status=ACTIVE
  &sortBy=createdAt
  &sortOrder=desc

Frontend must not fetch the entire dataset merely to filter it locally when the backend supports server-side filtering.

28. Component Architecture

Shared components:

components/
├── ui/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Dialog
│   ├── Badge
│   ├── Card
│   ├── Table
│   ├── Tabs
│   └── Pagination
│
├── layout/
│   ├── AppLayout
│   ├── Sidebar
│   ├── Header
│   └── MobileNavigation
│
├── feedback/
│   ├── Loading
│   ├── EmptyState
│   ├── ErrorState
│   └── ConfirmationDialog
│
└── charts/
    ├── LineChart
    ├── BarChart
    ├── PieChart
    └── AreaChart
29. Layout Architecture

Different roles may have different navigation structures.

App
 │
 ├── PublicLayout
 │
 └── AuthenticatedLayout
        │
        ├── SuperAdminLayout
        │
        ├── CompanyAdminLayout
        │
        ├── RecruiterLayout
        │
        └── CandidateLayout

Shared layout components should be reused wherever possible.

30. Routing Architecture

Suggested routing structure:

/
├── login
├── forgot-password
├── reset-password
│
├── super-admin/*
│
├── company-admin/*
│
├── recruiter/*
│
└── candidate/*

Unknown routes:

/*
└── 404

Unauthorized routes:

/403
31. Suggested Frontend Directory Structure
frontend/
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── query-client.ts
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── charts/
│   │   └── feedback/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── super-admin/
│   │   ├── company/
│   │   ├── recruiters/
│   │   ├── candidates/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── interviews/
│   │   ├── offers/
│   │   ├── hiring-pipeline/
│   │   ├── ai/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   └── reports/
│   │
│   ├── hooks/
│   │
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   ├── services/
│   │   └── api/
│   │
│   ├── stores/
│   │
│   ├── schemas/
│   │
│   ├── types/
│   │
│   ├── config/
│   │
│   ├── pages/
│   │
│   ├── routes/
│   │
│   └── main.tsx
│
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
32. Environment Configuration

Frontend environment variables must be centralized.

Example:

VITE_API_BASE_URL=http://localhost:5000/api/v1

Production values must not be hardcoded into source files.

.env.example must document required variables.

33. Security Architecture

Frontend security requirements:

Never hardcode secrets
Never expose API secrets
Never trust client-side authorization
Never store passwords
Never log JWTs
Never log sensitive resume content
Never log AI prompts
Never log AI responses containing candidate information
Validate forms before submission
Handle expired authentication gracefully
Prevent unauthorized route navigation
Use backend authorization as final authority
34. Multi-Tenant Architecture

Company-scoped data must always be obtained through authenticated backend APIs.

Frontend should not manually construct company ownership rules.

Example:

Current User
     │
     ▼
Backend JWT
     │
     ▼
Backend company scope
     │
     ▼
Allowed resources
     │
     ▼
Frontend

The frontend must never allow a user to select an arbitrary companyId to bypass backend restrictions.

35. AI Security

AI-related frontend components must treat AI-generated content as untrusted output.

The UI must:

Render AI output safely
Avoid injecting raw HTML
Avoid executing AI-generated scripts
Avoid interpreting AI text as frontend instructions
Clearly identify AI-generated information
Handle AI failures gracefully
36. Accessibility

Frontend must target accessible UI.

Requirements:

Keyboard navigation
Semantic HTML
Form labels
Accessible buttons
Focus states
Screen-reader-friendly messages
Dialog accessibility
Sufficient contrast
Error announcements
37. Responsive Design

The frontend must support:

Desktop
Tablet
Mobile

Primary dashboard experience:

Desktop → Full sidebar
Tablet  → Collapsible sidebar
Mobile  → Mobile navigation

Tables should provide responsive alternatives rather than forcing unusable horizontal layouts wherever practical.

38. Dashboard Architecture

Each dashboard should contain:

Dashboard
├── Header
├── Summary Cards
├── Primary Metrics
├── Recent Activity
├── Quick Actions
└── Role-Specific Widgets

Dashboard data should be fetched using TanStack Query.

39. AI Dashboard Widgets

Where applicable, dashboards may display:

AI Metrics
├── ATS Score Overview
├── Matching Overview
├── Recommendation Activity
├── Interview Activity
└── AI Insights

These are presentation components and must consume backend API data.

40. Frontend Testing Strategy

Testing layers:

Unit Tests
     │
     ▼
Component Tests
     │
     ▼
Feature Tests
     │
     ▼
Integration Tests
     │
     ▼
End-to-End Tests

Critical flows must be tested:

Login
Logout
Protected routes
Role access
Candidate management
Job management
Application management
Interview management
AI workflows
File upload
Form validation
Error handling
41. Performance Strategy

Frontend performance requirements:

Lazy-load large route modules
Avoid unnecessary API calls
Use TanStack Query caching
Paginate large datasets
Debounce search
Optimize large tables
Lazy-load charts where appropriate
Avoid unnecessary global state
Memoize only when beneficial
Avoid rendering large datasets unnecessarily
42. API Contract Strategy

The frontend must consume the existing Swagger-documented backend APIs.

Backend API contracts are authoritative.

If an API changes:

Backend API
     │
     ▼
Swagger Contract
     │
     ▼
Frontend API Service
     │
     ▼
Feature Hooks
     │
     ▼
UI
43. Frontend Development Order

Frontend implementation should follow this sequence:

Stage 1 — Foundation
React + Vite setup
TypeScript configuration
Tailwind
Routing
Axios
TanStack Query
Zustand
Shared UI components
Stage 2 — Authentication
Login
Logout
Session handling
Protected routes
Role routing
Stage 3 — Layout
Sidebar
Header
Dashboard shell
Responsive navigation
Error pages
Stage 4 — Super Admin
Dashboard
Company management
Company details
Platform metrics
Stage 5 — Company Admin
Dashboard
Recruiters
Candidates
Jobs
Applications
Interviews
Offers
Pipeline
Stage 6 — Recruiter
Dashboard
Assigned jobs
Candidates
Applications
Interviews
Offers
Pipeline
Stage 7 — Candidate
Dashboard
Profile
Resume
Jobs
Applications
Interviews
Offers
Stage 8 — AI
Resume Parser
ATS Score
Job Matching
Recommendations
Interview Assistant
AI Insights
Stage 9 — Cross-Cutting Features
Notifications
Analytics
Reports
Advanced search
Error handling
Loading states
Accessibility
Responsive optimization
Stage 10 — Testing & Release
Unit tests
Integration tests
E2E tests
Security testing
Performance testing
Production build
Release preparation
44. Backend Compatibility

Frontend must remain compatible with the released backend:

HireStack ATS Backend
Version: 2.0.0

The frontend should consume only documented API contracts.

No direct database access is permitted.

45. Architecture Decision

The approved frontend architecture is:

React + TypeScript
        │
        ├── React Router
        │
        ├── TanStack Query
        │
        ├── Zustand
        │
        ├── React Hook Form
        │
        ├── Zod
        │
        ├── Axios
        │
        └── Tailwind CSS
                │
                ▼
        HireStack Backend v2.0.0
46. Final Architecture Rules

The following rules are mandatory:

Backend remains the source of truth.
Frontend must never access the database directly.
Frontend must never contain secrets.
Frontend authorization is only a UX layer.
Backend authorization is authoritative.
API calls must use centralized services.
Server state must use TanStack Query.
Client-only state should use Zustand.
Forms should use React Hook Form + Zod.
Features should follow feature-based architecture.
Shared components must be reusable.
AI logic remains on the backend.
AI output must be treated as untrusted data.
Tenant boundaries must never be implemented solely on the frontend.
Sensitive data must not be logged.
All major routes must be responsive.
All critical flows must be tested.
Swagger/API contracts must remain the integration source of truth.