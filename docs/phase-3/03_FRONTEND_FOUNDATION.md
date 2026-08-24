# HireStack ATS — Frontend Foundation Specification

**Phase:** 3  
**Stage:** 1 — Frontend Foundation  
**Version:** 1.0.0  
**Status:** Ready for Implementation  
**Backend Baseline:** ATS Backend v2.0.0  
**Frontend:** React + TypeScript

---

# 1. Purpose

This document defines the technical foundation that must be established before implementing the HireStack ATS frontend business modules.

The objective is to create a stable, scalable, secure, and role-aware frontend foundation that all subsequent Phase 3 modules can build upon.

The foundation must support:

- Authentication
- Authorization-aware routing
- Super Admin
- Company Admin
- Recruiter
- Candidate
- Centralized API communication
- Error handling
- Loading states
- Notifications
- Shared layouts
- Shared UI components
- Environment configuration
- Responsive behavior
- Future AI integration
- Future frontend feature modules

No major ATS business feature should be implemented until this foundation is working and verified.

---

# 2. Backend Contract

The frontend integrates with:

```text
ATS Backend v2.0.0


The backend remains the source of truth for:

Authentication
Authorization
Tenant isolation
Business rules
Validation
State transitions
AI processing
Database operations
File processing

The frontend must consume the existing backend APIs.

The frontend must not duplicate backend business logic.

3. Foundation Objectives

The foundation must establish:

React application structure.
TypeScript configuration.
Environment configuration.
Centralized API client.
Authentication state.
User/role context.
Protected routes.
Role-based routes.
Application layouts.
Shared UI foundation.
Global error handling.
Notification system.
Loading system.
API response normalization.
Security-safe client behavior.
Development conventions.
4. Required Roles

The frontend must support exactly these application roles:

SUPER_ADMIN
COMPANY_ADMIN
RECRUITER
CANDIDATE

Role handling must be centralized.

Do not scatter literal role comparisons throughout the application.

Bad:

if (user.role === "RECRUITER") {
    ...
}

throughout dozens of components.

Preferred:

constants
    ↓
permissions
    ↓
route guards
    ↓
feature components
5. Recommended Frontend Structure

The foundation should establish the following structure:

frontend/
├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── feedback/
│   │   └── layout/
│   │
│   ├── config/
│   │   ├── env.ts
│   │   └── constants.ts
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── companies/
│   │   ├── departments/
│   │   ├── recruiters/
│   │   ├── candidates/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── interviews/
│   │   ├── offers/
│   │   ├── hiring-pipeline/
│   │   └── ai/
│   │
│   ├── hooks/
│   │
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   ├── SuperAdminLayout.tsx
│   │   ├── CompanyAdminLayout.tsx
│   │   ├── RecruiterLayout.tsx
│   │   └── CandidateLayout.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── errors/
│   │   └── utils/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   ├── super-admin/
│   │   ├── company-admin/
│   │   ├── recruiter/
│   │   └── candidate/
│   │
│   ├── routes/
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleRoute.tsx
│   │   └── routeConfig.ts
│   │
│   ├── services/
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   └── common.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── tokens.css
│   │
│   └── main.tsx
│
├── .env.example
├── .gitignore
├── eslint.config.*
├── package.json
├── tsconfig.json
└── vite.config.*

The exact names may be adjusted during implementation if required by the selected tooling, but the architectural separation must remain.

6. Application Entry Point

The application entry point must initialize the application in a predictable order.

Expected flow:

main.tsx
    ↓
Global styles
    ↓
Providers
    ↓
App
    ↓
Router
    ↓
Layout
    ↓
Page

Global providers should be centralized rather than repeatedly initialized inside individual pages.

7. Provider Architecture

The application should have a centralized provider layer.

Example:

<Providers>
    <AuthProvider>
        <App />
    </AuthProvider>
</Providers>

Additional providers may be added later when required.

Do not create providers unnecessarily.

Providers should have a clear responsibility.

8. Environment Configuration

Frontend configuration must use environment variables.

At minimum:

VITE_API_BASE_URL

Example:

VITE_API_BASE_URL=http://localhost:5000/api/v1

Production values must not be committed to source control.

Provide:

.env.example

Example:

VITE_API_BASE_URL=
9. Environment Validation

Environment configuration should be centralized.

Do not repeatedly access:

import.meta.env.VITE_API_BASE_URL

throughout the application.

Instead:

environment
    ↓
config/env.ts
    ↓
API client

The application should fail clearly during startup/build configuration when required environment variables are missing.

10. API Client

All HTTP requests must go through a centralized API client.

Example architecture:

src/lib/api/
├── client.ts
├── auth.api.ts
├── companies.api.ts
├── departments.api.ts
├── recruiters.api.ts
├── candidates.api.ts
├── jobs.api.ts
├── applications.api.ts
├── interviews.api.ts
├── offers.api.ts
└── ai.api.ts

Feature APIs may alternatively live within their respective feature folders, but they must still use the centralized HTTP client.

11. API Client Responsibilities

The centralized client should handle:

Base URL
Authentication headers
Request configuration
Response parsing
Error normalization
Unauthorized handling
Common headers
Request cancellation where appropriate

It must not contain business-specific logic.

12. Authentication Architecture

Authentication must be centralized.

The authentication layer should expose concepts such as:

user
isAuthenticated
isLoading
login()
logout()
refreshSession()

Exact implementation depends on the backend authentication contract.

The frontend must not invent a new authentication mechanism.

13. Authentication Flow

Expected flow:

User
 ↓
Login Page
 ↓
POST login API
 ↓
Backend authentication
 ↓
Authenticated response/session
 ↓
Store required authentication state
 ↓
Load current user
 ↓
Resolve role
 ↓
Redirect to correct dashboard

Example:

SUPER_ADMIN
    → /super-admin/dashboard


COMPANY_ADMIN
    → /company-admin/dashboard


RECRUITER
    → /recruiter/dashboard


CANDIDATE
    → /candidate/dashboard

Actual paths may be finalized during route implementation.

14. Authentication State

Authentication state must include only the information necessary for frontend operation.

Typical user information:

id
email
role
companyId where applicable
isActive where applicable

Do not store unnecessary sensitive backend data in client state.

15. Token / Session Handling

The implementation must follow the backend's actual authentication contract.

Do not assume a particular token storage mechanism without checking the backend implementation.

If JWTs are used:

Follow the backend's existing JWT contract.
Do not expose secrets.
Handle expiration.
Handle unauthorized responses.
Clear authentication state on invalid/expired sessions.

If refresh tokens are supported by the backend, integrate them through the centralized authentication/API layer.

16. Logout

Logout must:

End the authenticated frontend session.
Clear authentication state.
Clear protected client state where necessary.
Prevent access to protected routes.
Redirect to login.

Example:

Logout
 ↓
Clear auth state
 ↓
Clear protected state
 ↓
Navigate /login
17. Protected Routes

All authenticated application routes must be protected.

Expected behavior:

Not authenticated
        ↓
Protected route
        ↓
Redirect /login

Authenticated users may proceed to role validation.

18. Role-Based Routes

After authentication:

Authenticated
      ↓
Determine role
      ↓
RoleRoute
      ↓
Allowed?
 ┌────┴────┐
YES        NO
 ↓          ↓
Page     Unauthorized

Role checks should be centralized.

19. Role Route Configuration

A centralized configuration should define allowed roles.

Example concept:

{
    path: "/company-admin/jobs",
    roles: ["COMPANY_ADMIN"]
}

For shared pages:

{
    path: "/jobs/:id",
    roles: ["COMPANY_ADMIN", "RECRUITER"]
}

The exact permissions must follow backend authorization rules.

20. Super Admin Architecture

Super Admin must have a separate layout and navigation model.

Super Admin
    ↓
SuperAdminLayout
    ├── Header
    ├── Sidebar
    └── Content

Super Admin is platform-level.

It must not be treated as another Company Admin.

The frontend must not automatically assign a company context to Super Admin unless the backend explicitly provides one.

21. Company Admin Architecture

Company Admin uses:

CompanyAdminLayout

Possible navigation:

Dashboard
Company
Departments
Recruiters
Candidates
Jobs
Applications
Interviews
Offers
Hiring Pipeline
AI
Settings

Actual navigation should be based on backend capabilities.

22. Recruiter Architecture

Recruiter uses:

RecruiterLayout

Possible navigation:

Dashboard
My Jobs
Candidates
Applications
Interviews
Hiring Pipeline
Offers
AI Evaluation

Recruiter visibility must follow backend assignment rules.

23. Candidate Architecture

Candidate uses:

CandidateLayout

Possible navigation:

Dashboard
Profile
Resume
Applications
Interviews
Offers
AI Tools

Candidate-facing AI functionality must only expose APIs that the backend authorizes for candidates.

24. Layout Architecture

Each authenticated role should have an appropriate layout.

Common layout structure:

┌─────────────────────────────────────────────┐
│ Header                                      │
├───────────────┬─────────────────────────────┤
│ Sidebar       │ Main Content                │
│               │                             │
│ Navigation    │ Page                        │
│               │                             │
│               │                             │
└───────────────┴─────────────────────────────┘

The layout should be reusable and responsive.

25. Shared UI Foundation

Create reusable UI primitives before implementing complex pages.

Minimum foundation:

Button
Input
Textarea
Select
Checkbox
Radio
Label
Card
Badge
Avatar
Table
Pagination
Modal
Dialog
Dropdown
Tabs
Tooltip
Toast
Spinner
Skeleton
Alert
EmptyState
ErrorState

Only implement components that are actually required.

26. Design Tokens

Centralize visual values.

Examples:

Colors
Typography
Spacing
Border Radius
Shadows
Breakpoints
Z-index
Transitions

Do not hard-code repeated design values across dozens of components.

27. Theme

The initial frontend should establish a consistent HireStack visual identity.

The theme should prioritize:

Professional ATS appearance
Clear information hierarchy
High readability
Consistent spacing
Accessible contrast
Consistent status colors
Responsive layouts

Dark mode should only be implemented if included in the approved frontend requirements.

Do not introduce unnecessary visual features during foundation work.

28. Notification System

A centralized notification/toast mechanism should be established.

It should support:

Success
Error
Warning
Info

Examples:

Candidate created successfully.
Job updated successfully.
Failed to load candidates.
You do not have permission to perform this action.

Notifications should not expose raw backend stack traces.

29. Global Error Handling

The frontend must provide centralized error handling.

Error categories:

Network Error
Authentication Error
Authorization Error
Validation Error
Not Found
Conflict
Server Error
Unknown Error

The user should receive a useful message.

Internal server details should not be exposed.

30. API Error Normalization

Backend errors should be converted into a predictable frontend structure.

Conceptually:

type ApiError = {
    status: number;
    code?: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
};

The exact structure must be adapted to the backend's actual response format.

Do not invent incompatible response handling.

31. Unauthorized Handling

For:

401 Unauthorized

the frontend should:

Clear invalid authentication state when appropriate.
Redirect to login.
Preserve a safe redirect target if useful.

For:

403 Forbidden

the frontend should:

Keep the user authenticated.
Display an authorization message.
Redirect to an unauthorized page when appropriate.
32. Loading Architecture

The foundation must support:

Global loading

For:

Initial application/session loading.
Page loading

For:

Page-level API requests.
Component loading

For:

Tables
Cards
Individual widgets.
Action loading

For:

Form submissions
Delete actions
AI generation
Status transitions.

Avoid blocking the entire application for small component operations.

33. Skeleton Loading

Skeletons should be used for major content areas where appropriate.

Example:

Dashboard
├── Summary card skeleton
├── Summary card skeleton
├── Table skeleton
└── Activity skeleton

Loading UI should represent the approximate structure of the final content.

34. Empty States

Reusable empty states must support:

Title
Description
Optional action

Examples:

No jobs found.
Create your first job to begin recruiting.

Search empty state:

No jobs match your search.
Try changing your filters.

These should not be confused with API errors.

35. Form Foundation

Forms should use reusable patterns for:

Labels
Inputs
Errors
Required fields
Submit states
Server validation errors

Example:

Label
Input
Helper text
Validation error

Forms must prevent accidental duplicate submissions.

36. Confirmation Dialogs

Destructive operations should require confirmation where appropriate.

Examples:

Delete company
Delete recruiter
Delete candidate
Delete job
Withdraw application
Cancel interview

The exact actions depend on backend-supported operations.

37. Search and Filtering Foundation

Reusable search/filter UI should be established for management pages.

Common controls:

Search
Status
Date
Role
Department
Job
Pagination
Sort

Actual filter parameters must follow backend API contracts.

38. Pagination Foundation

The frontend should support backend pagination.

Generic structure:

Table
 ↓
Pagination metadata
 ↓
Current page
 ↓
Page size
 ↓
Next / Previous

Do not load the entire database into the browser when the backend supports pagination.

39. Request Cancellation

Where appropriate, API requests should be cancellable.

This is especially useful for:

Search
Rapid filter changes
Page navigation
Component unmounting

Avoid unnecessary race conditions where older requests overwrite newer results.

40. Duplicate Request Protection

The frontend should prevent accidental duplicate actions.

Examples:

Submit
 ↓
Disable button
 ↓
Request
 ↓
Success/Error
 ↓
Re-enable

This is especially important for:

Create operations
Delete operations
Interview scheduling
Offer actions
AI generation

The backend remains responsible for authoritative duplicate-request protection.

41. AI Foundation Compatibility

The foundation must be capable of supporting the Phase 2 AI modules.

AI API operations may include:

Resume Parser
ATS Score
Job Matching
Resume Recommendations
Interview Assistant
AI Insights

The API client must support longer-running requests without incorrectly treating them as ordinary instant operations.

42. AI Loading UX

AI operations should display explicit status.

Example:

Generating ATS evaluation...
Analyzing candidate...
Generating interview questions...
Preparing AI insights...

Do not show fake progress percentages unless the backend actually provides progress information.

43. AI Error UX

If an AI request fails:

AI evaluation failed.
Please try again.

The UI must not display partial or fabricated AI results.

If the backend returns a specific safe error message, it may be presented appropriately.

44. Security Rules

The frontend must follow these security rules:

Never store secrets in frontend source code.
Never expose backend credentials.
Never trust frontend role checks as security.
Never bypass backend authorization.
Never expose filesystem paths.
Never expose raw server errors.
Never log passwords or tokens.
Avoid logging sensitive API responses.
Avoid storing unnecessary PII.
Clear authentication state when the session becomes invalid.
Do not expose cross-company resources.
Do not construct authorization decisions from user-controlled values.
45. Logging

Frontend logging should be minimal and safe.

Development logging may be enabled where useful.

Production logging must not include:

Passwords
Tokens
Resume contents
Full AI prompts
Raw AI responses
Sensitive PII
Internal filesystem paths

Errors should be normalized before being logged.

46. TypeScript Rules

TypeScript must remain strict.

Avoid:

any

unless there is a documented and justified reason.

Prefer:

unknown

with proper narrowing.

API responses should have explicit types.

Shared domain types should not be duplicated unnecessarily.

47. API Types

Frontend types should correspond to backend API contracts.

Example:

AuthUser
Candidate
Job
Application
Interview
Offer
AiEvaluation

Types should be organized so that feature modules can reuse them.

If Swagger/OpenAPI generation is introduced later, generated types may replace manually maintained API types where appropriate.

48. Component Rules

Components should:

Have one clear responsibility.
Avoid large business logic blocks.
Avoid direct database assumptions.
Avoid direct environment access.
Use typed props.
Handle loading/error states where appropriate.
Remain reusable where possible.

Large pages should be decomposed into smaller sections.

49. Page Rules

Pages should primarily coordinate:

Route
 ↓
Feature data
 ↓
Components

Pages should not become giant components containing every UI element and API call.

50. Feature Module Rules

Each business feature should eventually contain its own:

components/
hooks/
api/
types/
pages/
utils/

Only create subfolders when the feature complexity requires them.

Avoid creating empty architectural folders without purpose.

51. Dependency Rules

Before adding a package:

Verify the requirement.
Check whether the functionality can be implemented using existing dependencies.
Confirm compatibility with the project.
Avoid duplicate libraries solving the same problem.

The frontend should remain maintainable and lightweight.

52. Responsive Foundation

The layout must support:

Desktop
Tablet
Mobile

Sidebar behavior should adapt to screen size.

Tables should use responsive patterns such as:

Horizontal scrolling
Responsive cards
Condensed columns
Mobile-specific actions

Do not simply force desktop layouts onto mobile screens.

53. Accessibility Foundation

All reusable UI components should consider:

Semantic HTML
Keyboard navigation
Focus state
Form labels
Accessible dialogs
Button semantics
Error announcements
Accessible status indicators

Accessibility issues should be fixed at the shared component level where possible.

54. Initial Route Map

The foundation should reserve route namespaces for:

/auth
/super-admin
/company-admin
/recruiter
/candidate

Public routes:

/login
/unauthorized
/not-found

Exact business routes will be introduced during subsequent implementation stages.

55. Initial Layout Map
AuthLayout
    ↓
Authentication pages


SuperAdminLayout
    ↓
Super Admin pages


CompanyAdminLayout
    ↓
Company Admin pages


RecruiterLayout
    ↓
Recruiter pages


CandidateLayout
    ↓
Candidate pages
56. Initial Shared Components

The first foundation implementation should establish only the components required by the initial pages.

Recommended initial set:

Button
Input
Label
Card
Badge
Spinner
Skeleton
Alert
Toast
Modal/Dialog
Table
Pagination
EmptyState
ErrorState
PageHeader
Sidebar
Header
Breadcrumb

Additional components can be introduced as feature requirements emerge.

57. Initial Development Workflow

The implementation should proceed in this order:

1. Create React project
        ↓
2. Configure TypeScript
        ↓
3. Configure environment
        ↓
4. Configure linting/formatting
        ↓
5. Create source structure
        ↓
6. Create API client
        ↓
7. Create auth architecture
        ↓
8. Create route architecture
        ↓
9. Create role layouts
        ↓
10. Create shared UI foundation
        ↓
11. Create global error handling
        ↓
12. Create notification system
        ↓
13. Create initial login page
        ↓
14. Verify foundation
58. Foundation Verification

Before moving to the next frontend stage, verify:

Project
 React application starts successfully.
 TypeScript compilation succeeds.
 Production build succeeds.
 ESLint passes.
 Environment configuration works.
API
 API base URL is configurable.
 API client can communicate with backend.
 API errors are normalized.
 401 handling works.
 403 handling works.
Authentication
 Login page loads.
 Login API integration works.
 Authenticated user state is available.
 Logout works.
 Protected routes work.
 Invalid sessions are handled.
Roles
 Super Admin routing works.
 Company Admin routing works.
 Recruiter routing works.
 Candidate routing works.
 Unauthorized access is blocked.
UI
 Shared layout renders.
 Sidebar works.
 Header works.
 Responsive behavior works.
 Toast/notification system works.
 Loading state works.
 Error state works.
 Empty state works.
59. Definition of Done

Frontend Foundation is complete only when:

 Project structure is established.
 React/TypeScript setup is stable.
 Environment configuration is centralized.
 API client is operational.
 Authentication architecture is operational.
 Protected routing is operational.
 Role routing is operational.
 Four role layouts exist.
 Shared UI foundation exists.
 Error handling exists.
 Notification system exists.
 Loading states exist.
 Responsive foundation exists.
 Security rules are followed.
 Type checking passes.
 Lint passes.
 Production build passes.
 Backend API connectivity is verified.
 No existing backend functionality is modified unnecessarily.
60. Scope Boundaries

This stage does not implement:

Company CRUD
Department CRUD
Recruiter CRUD
Candidate CRUD
Job CRUD
Application workflows
Interview workflows
Offer workflows
Hiring pipeline
AI feature pages
Advanced analytics

Those are implemented in subsequent Phase 3 stages.

This stage establishes the platform on which those features will be built.

61. Expected Result

At the end of this stage, the application should provide a working shell:

                    HireStack ATS
                         │
                 Authentication
                         │
                    Role Router
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   SUPER ADMIN      COMPANY ADMIN      RECRUITER
        │                │                │
 Platform Layout   Company Layout    Recruiter Layout
        │                │                │
        └────────────────┼────────────────┘
                         │
                     CANDIDATE
                         │
                  Candidate Layout

All layouts should be functional even if their business pages initially contain placeholders.