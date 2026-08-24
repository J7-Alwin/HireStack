# HireStack ATS — Frontend Routing & Navigation

**Phase:** 3 — Frontend  
**Document:** 06  
**Status:** Planned  
**Version:** 1.0.0

---

## 1. Purpose

This document defines the complete frontend routing and navigation architecture for HireStack ATS.

It establishes:

- Public routes
- Authentication routes
- Protected application routes
- Role-based routes
- Super Admin routes
- Company Admin routes
- Recruiter routes
- Candidate routes
- Nested feature routes
- Route guards
- Redirect behavior
- 401 / 403 / 404 handling
- Navigation configuration
- Breadcrumb configuration
- Route metadata
- Route-level access control
- Mobile navigation behavior

The frontend routing system must provide a predictable navigation structure while keeping the backend as the final authorization authority.

---

# 2. Routing Principles

The routing architecture follows these principles:

1. Public routes must remain accessible without authentication.
2. Authentication routes must not expose authenticated application functionality.
3. Protected routes require an authenticated user.
4. Role-specific routes must check the user's authenticated role.
5. Tenant-specific authorization must remain enforced by the backend.
6. Frontend route guards are for navigation and UX, not security.
7. Super Admin routes must remain separated from company-level routes.
8. Unauthorized users must receive a controlled `403 Forbidden` experience.
9. Unknown routes must display a controlled `404 Not Found` page.
10. Authentication failures must be handled centrally.
11. Navigation visibility must come from a centralized configuration.
12. Route definitions must not be duplicated across feature components.

---

# 3. High-Level Route Architecture

The frontend route tree is organized into four major areas:

```text
/
├── Public
├── Authentication
├── Application
└── Error

Conceptually:

/
├── login
├── forgot-password
├── reset-password
│
├── app
│   ├── dashboard
│   ├── candidates
│   ├── jobs
│   ├── applications
│   ├── interviews
│   ├── offers
│   ├── ai
│   ├── departments
│   ├── recruiters
│   ├── reports
│   └── settings
│
├── platform
│   ├── companies
│   ├── users
│   ├── ai-usage
│   ├── system-health
│   └── audit-logs
│
├── 403
├── 404
└── *

The exact frontend router library may be selected during implementation, but the logical route structure must remain consistent with this document.

4. Public Routes

Public routes do not require authentication.

Recommended routes:

/
├── login
├── forgot-password
├── reset-password
└── 404

Depending on the final product requirements, additional public pages may be added later.

Examples:

/
├── privacy
├── terms
└── public-job

These must only be added when defined by the product requirements.

5. Root Route

The root route:

/

should not directly render an application dashboard.

It should determine the appropriate destination based on authentication state.

Unauthenticated
/
   ↓
/login
Authenticated
/
   ↓
/app/dashboard

The dashboard then resolves the correct role-specific dashboard.

6. Authentication Routes

Authentication routes:

/login
/forgot-password
/reset-password

These routes are public.

Authenticated users should normally not remain on /login.

Example:

Authenticated user
        ↓
/login
        ↓
/app/dashboard

The redirect must preserve intended navigation when appropriate.

7. Protected Application Routes

All authenticated business functionality should exist below:

/app

Example:

/app/dashboard
/app/candidates
/app/jobs
/app/applications
/app/interviews
/app/offers
/app/ai
/app/reports
/app/settings

A protected application route must require:

Authenticated User

before rendering its page.

8. Application Route Structure

Recommended structure:

/app
├── dashboard
│
├── candidates
│   ├── /
│   ├── /new
│   └── /:candidateId
│
├── jobs
│   ├── /
│   ├── /new
│   └── /:jobId
│
├── applications
│   ├── /
│   └── /:applicationId
│
├── interviews
│   ├── /
│   ├── /new
│   └── /:interviewId
│
├── offers
│   ├── /
│   ├── /new
│   └── /:offerId
│
├── departments
│   ├── /
│   └── /:departmentId
│
├── recruiters
│   ├── /
│   └── /:recruiterId
│
├── reports
│   ├── /
│   └── /ai
│
├── ai
│   ├── ats-score
│   ├── matching
│   ├── recommendations
│   ├── interview-assistant
│   └── insights
│
└── settings
    ├── profile
    ├── account
    └── security

The final route implementation must match the backend API capabilities and Phase 3 feature requirements.

9. Role Model

The routing system recognizes the existing backend roles:

SUPER_ADMIN
COMPANY_ADMIN
RECRUITER
CANDIDATE

No new role should be invented at the frontend layer.

10. Role-Based Routing

Frontend route metadata should specify allowed roles.

Example:

{
  path: "/app/candidates",
  allowedRoles: [
    "SUPER_ADMIN",
    "COMPANY_ADMIN",
    "RECRUITER"
  ]
}

For candidate-only routes:

{
  path: "/app/my-applications",
  allowedRoles: [
    "CANDIDATE"
  ]
}

For Super Admin routes:

{
  path: "/platform/companies",
  allowedRoles: [
    "SUPER_ADMIN"
  ]
}
11. Important Authorization Rule

Frontend role checks are not security controls.

This is required:

Frontend Route Guard
        ↓
Backend Authorization
        ↓
Database / Business Logic

Never rely exclusively on:

localStorage.role

or:

currentUser.role

to protect sensitive resources.

The backend must independently verify:

Authentication
Role
Company scope
Candidate ownership
Recruiter assignment
Job access
Other business rules
12. Route Guard Architecture

Protected routes should use reusable guards.

Recommended conceptual structure:

src/
└── routes/
    ├── AppRouter.tsx
    ├── routeConfig.ts
    ├── guards/
    │   ├── ProtectedRoute.tsx
    │   ├── RoleRoute.tsx
    │   └── PublicRoute.tsx
    └── navigation/
        ├── navigation.config.ts
        └── breadcrumbs.config.ts
13. ProtectedRoute

ProtectedRoute checks whether the user is authenticated.

Conceptual flow:

ProtectedRoute
      ↓
Auth State
      ↓
Authenticated?
 ┌────┴────┐
 NO        YES
 ↓          ↓
/login    Continue

It must not perform business authorization.

14. RoleRoute

RoleRoute checks whether the authenticated user's role is permitted for the route.

Conceptual flow:

RoleRoute
    ↓
Authenticated?
    ↓
Role available?
    ↓
Role allowed?
 ┌────┴─────┐
 NO         YES
 ↓           ↓
/403       Continue
15. Tenant Authorization

The frontend route system should not attempt to determine tenant access from route parameters.

For example:

/app/candidates/:candidateId

does not mean the frontend may assume that the candidate belongs to the current company.

The backend must verify:

candidate.companyId
        ===
currentUser.companyId

where applicable.

16. Super Admin Route Architecture

Super Admin functionality should be separated from normal company application routes.

Recommended:

/platform
├── dashboard
├── companies
├── users
├── ai-usage
├── system-health
└── audit-logs

This separation makes it clear that:

/app/*

represents normal ATS application functionality.

While:

/platform/*

represents platform administration.

17. Super Admin Routes

Recommended routes:

/platform/dashboard
/platform/companies
/platform/companies/:companyId
/platform/users
/platform/ai-usage
/platform/system-health
/platform/audit-logs
/platform/settings

Access:

SUPER_ADMIN only

No other role should be allowed to enter these routes.

18. Company Admin Routes

Company Admin routes primarily exist under:

/app/*

Examples:

/app/dashboard
/app/candidates
/app/jobs
/app/applications
/app/interviews
/app/offers
/app/departments
/app/recruiters
/app/ai/*
/app/reports
/app/settings

The backend remains responsible for company isolation.

19. Recruiter Routes

Recruiters use:

/app/dashboard
/app/candidates
/app/jobs
/app/applications
/app/interviews
/app/offers
/app/ai/*
/app/reports
/app/settings/profile

Recruiter access must respect existing backend assignment rules.

For example, a recruiter may only access a job if the backend authorizes that recruiter for the job.

20. Candidate Routes

Candidate routes should be clearly separated from recruiter/company management functionality.

Recommended:

/app/dashboard
/app/profile
/app/resume
/app/my-applications
/app/my-interviews
/app/my-offers
/app/ai/ats-score
/app/ai/matching
/app/ai/recommendations
/app/ai/interview-assistant
/app/settings

Candidate routes must be self-scoped.

21. AI Routes

AI functionality belongs under:

/app/ai

Recommended structure:

/app/ai
├── ats-score
├── matching
├── recommendations
├── interview-assistant
└── insights

Role access must follow the existing backend AI API contracts.

22. AI Role Access

Based on Phase 2 backend functionality:

ATS Score

Accessible according to backend-supported candidate/company/recruiter permissions.

Job Matching

Accessible according to backend-supported permissions.

Resume Recommendations

Accessible according to backend-supported permissions.

Interview Assistant

Accessible according to backend-supported permissions.

AI Insights

Currently intended for:

COMPANY_ADMIN
RECRUITER

The frontend must not expose AI Insights to candidates unless the backend contract is later expanded.

23. AI Detail Routes

Where individual evaluation details are displayed, route parameters may be used.

Examples:

/app/ai/ats-score/:id
/app/ai/matching/:id
/app/ai/recommendations/:id
/app/ai/interview-assistant/:id
/app/ai/insights/:id

The frontend must not assume that the ID is accessible.

The backend must verify authorization.

24. Candidate Resource Routes

Recommended candidate routes:

/app/candidates
/app/candidates/new
/app/candidates/:candidateId
/app/candidates/:candidateId/edit

Candidate details may contain:

Profile
Resume
Applications
Interviews
Offers
AI Evaluations

Visibility depends on role and backend authorization.

25. Job Resource Routes

Recommended:

/app/jobs
/app/jobs/new
/app/jobs/:jobId
/app/jobs/:jobId/edit

Possible nested sections:

/app/jobs/:jobId
/app/jobs/:jobId/applications
/app/jobs/:jobId/interviews
/app/jobs/:jobId/recruiters
/app/jobs/:jobId/ai

These routes must respect recruiter assignment and company isolation.

26. Application Routes

Recommended:

/app/applications
/app/applications/:applicationId

Candidate-specific view:

/app/my-applications
/app/my-applications/:applicationId

If the backend uses a shared application endpoint, frontend route naming may still remain role-oriented.

27. Interview Routes

Recommended:

/app/interviews
/app/interviews/new
/app/interviews/:interviewId
/app/interviews/:interviewId/edit

Candidate view:

/app/my-interviews
/app/my-interviews/:interviewId

The backend determines whether the authenticated user can access the interview.

28. Offer Routes

Recommended:

/app/offers
/app/offers/new
/app/offers/:offerId

Candidate:

/app/my-offers
/app/my-offers/:offerId
29. Department Routes

Company administration:

/app/departments
/app/departments/:departmentId
/app/departments/:departmentId/edit

Access:

COMPANY_ADMIN

unless backend requirements later allow additional roles.

30. Recruiter Management Routes

Company Admin:

/app/recruiters
/app/recruiters/new
/app/recruiters/:recruiterId
/app/recruiters/:recruiterId/edit

Recruiters must not access recruiter-management routes.

31. Reports Routes

Recommended:

/app/reports
/app/reports/recruitment
/app/reports/ai

Reports must be scoped by backend authorization.

Potential future routes:

/app/reports/applications
/app/reports/hiring
/app/reports/interviews
/app/reports/ai

These should only be implemented when the backend/reporting APIs exist.

32. Settings Routes

Common:

/app/settings
/app/settings/profile
/app/settings/account
/app/settings/security

Company Admin may additionally have:

/app/settings/company

Super Admin settings belong under:

/platform/settings
33. Navigation Configuration

Navigation must be centralized.

Recommended:

src/routes/navigation/navigation.config.ts

Conceptual structure:

{
  label: "Candidates",
  path: "/app/candidates",
  icon: Users,
  allowedRoles: [
    "SUPER_ADMIN",
    "COMPANY_ADMIN",
    "RECRUITER"
  ],
  section: "recruitment"
}

The navigation renderer should consume this configuration.

Do not hard-code navigation in Sidebar.tsx.

34. Navigation Sections

Recommended sections:

Dashboard

Recruitment
├── Candidates
├── Jobs
├── Applications
├── Interviews
└── Offers

AI
├── ATS Score
├── Job Matching
├── Recommendations
├── Interview Assistant
└── AI Insights

Organization
├── Departments
└── Recruiters

Reports

Settings

Super Admin uses:

Dashboard

Platform
├── Companies
├── Users
└── Settings

Monitoring
├── AI Usage
├── System Health
└── Audit Logs
35. Navigation Visibility

Navigation visibility should be calculated from:

authenticatedUser.role
+
route metadata

Example:

Candidate
   ↓
Filter navigation
   ↓
Candidate-compatible items

However, hidden navigation does not guarantee backend access.

36. Active Navigation State

The navigation must correctly identify the active route.

Example:

/app/jobs
/app/jobs/123
/app/jobs/123/edit

All should highlight:

Jobs

Similarly:

/app/ai/interview-assistant
/app/ai/interview-assistant/123

should highlight:

Interview Assistant
37. Breadcrumb Configuration

Breadcrumbs should be centralized.

Recommended:

src/routes/navigation/breadcrumbs.config.ts

Example:

Dashboard
  >
Jobs
  >
Job Details

Dynamic resources should use resource names when available.

Example:

Dashboard
  >
Jobs
  >
Senior Backend Developer

The route itself must not expose unauthorized resource names before backend authorization succeeds.

38. Redirect Strategy

The application should use predictable redirects.

Unauthenticated protected route
/app/jobs
      ↓
/login?returnUrl=/app/jobs

After successful authentication:

/login
      ↓
/app/jobs

If preserving the requested route is not appropriate for a specific authentication flow, redirect to:

/app/dashboard
39. Authenticated User Visiting Login

If already authenticated:

/login
      ↓
/app/dashboard

Do not display the login page unnecessarily.

40. Role-Based Dashboard Redirect

After login:

Authenticated
      ↓
Role
      │
      ├── SUPER_ADMIN
      │       ↓
      │  /platform/dashboard
      │
      ├── COMPANY_ADMIN
      │       ↓
      │  /app/dashboard
      │
      ├── RECRUITER
      │       ↓
      │  /app/dashboard
      │
      └── CANDIDATE
              ↓
         /app/dashboard

The dashboard itself then renders the appropriate role-specific content.

41. 401 Unauthorized

A 401 generally means:

Authentication missing
OR
Authentication expired
OR
Authentication invalid

Frontend behavior:

401
 ↓
Clear invalid authentication state
 ↓
Redirect to /login

Where appropriate, preserve the original route for post-login redirection.

42. 403 Forbidden

A 403 means:

Authenticated
+
Not authorized

Frontend behavior:

403
 ↓
/403

Example:

Access Denied

You do not have permission to access this resource.

[ Return to Dashboard ]

Do not redirect every 403 to login.

The user may be correctly authenticated but simply lack permission.

43. 404 Not Found

Unknown routes should render:

/404

Example:

404

Page Not Found

The page you're looking for does not exist.

[ Return to Dashboard ]

Resource-level 404 responses from the backend should also use a controlled not-found experience.

44. 409 Conflict

For business conflicts:

409

the frontend should display a contextual error.

Examples:

This job cannot be modified in its current state.

or:

The recruiter assignment has changed.
Please refresh and try again.

Do not expose raw backend exception messages without normalization.

45. 422 Validation Errors

Validation errors should be mapped to the relevant form fields.

Example:

POST /jobs

422
 ↓
title → "Title is required"
location → "Invalid location"

The form should display field-level errors where possible.

46. 429 Rate Limiting

If the backend returns:

429 Too Many Requests

the frontend should display:

Too many requests.

Please wait a moment and try again.

AI-heavy operations should provide clear feedback if rate-limited.

47. 500 / 503 Errors
500

Display:

Something went wrong.

Please try again.
503

Display:

The service is temporarily unavailable.

Please try again later.

Do not display:

Stack traces
Database messages
Internal server paths
LLM infrastructure details
48. Route-Level Loading

Lazy-loaded routes should display a global route loading state.

Example:

Loading page...

or a page skeleton.

Route loading must not cause the entire application shell to disappear unnecessarily.

Preferred:

AppShell
 ├── Header
 ├── Sidebar
 └── Page Loading State

rather than:

Blank Screen
49. Lazy Loading

Feature pages should be lazy-loaded where appropriate.

Conceptually:

AppShell
   ↓
Route
   ↓
Lazy Feature
   ↓
Feature Page

Large feature modules such as:

AI
Reports
Platform Administration

are good candidates for route-level code splitting.

50. Navigation and Browser History

The frontend should correctly support:

Back
Forward
Refresh
Deep links
Direct resource URLs
Authenticated route restoration

Refreshing:

/app/jobs/123

must not automatically redirect to the dashboard if the user remains authenticated and authorized.

51. Deep Linking

Every valid frontend route must support direct navigation.

Example:

https://host/app/jobs/123

The frontend must:

Load application shell.
Restore authentication state.
Validate route access.
Load job resource.
Render page.
Display 404 or 403 appropriately.
52. Route Parameters

Dynamic parameters include:

:candidateId
:jobId
:applicationId
:interviewId
:offerId
:departmentId
:recruiterId
:id

The frontend should treat route parameters as untrusted input.

Do not assume:

/job/abc

is a valid resource.

Backend validation remains authoritative.

53. Query Parameters

Query parameters may be used for:

Search
Filtering
Sorting
Pagination
Tabs
Return URLs

Examples:

/app/candidates?page=2&search=john
/app/jobs?status=PUBLISHED
/app/applications?sort=createdAt&order=desc

Query parameters must be validated and normalized before being sent to APIs.

54. Route State vs Server State

Routing state should contain navigation information.

Server data should remain managed by the API/state layer.

Avoid putting large API responses into route state.

Bad:

navigate("/candidate/123", {
  state: {
    completeCandidateObject
  }
})

Preferred:

navigate("/candidate/123")

Then fetch:

GET /candidate/123
55. Route Metadata

Every significant route should have metadata.

Conceptual:

{
  path: "/app/jobs",
  title: "Jobs",
  requiresAuth: true,
  allowedRoles: [
    "COMPANY_ADMIN",
    "RECRUITER"
  ],
  breadcrumb: "Jobs"
}

This metadata can support:

Authorization
Navigation
Breadcrumbs
Page titles
Analytics
Code splitting
56. Recommended Route Configuration

Recommended file:

src/routes/routeConfig.ts

Conceptual structure:

export const routes = {
  public: {},
  auth: {},
  application: {},
  platform: {},
  error: {}
};

The implementation should remain strongly typed.

57. Recommended Folder Structure
src/
└── routes/
    ├── AppRouter.tsx
    ├── routeConfig.ts
    │
    ├── guards/
    │   ├── ProtectedRoute.tsx
    │   ├── RoleRoute.tsx
    │   └── PublicRoute.tsx
    │
    ├── navigation/
    │   ├── navigation.config.ts
    │   └── breadcrumbs.config.ts
    │
    └── errors/
        ├── ForbiddenPage.tsx
        └── NotFoundPage.tsx
58. Route Ownership

Routes should map clearly to features.

routes
   ↓
feature pages
   ↓
feature hooks
   ↓
API service
   ↓
backend

Routes should not contain:

Database logic
AI logic
Business rules
Complex API transformation
Authentication implementation
59. Navigation Ownership

Navigation configuration belongs to the routing/navigation layer.

The sidebar should consume:

navigation.config.ts

It should not contain:

if role === "RECRUITER"

logic repeated for every item.

Instead:

Navigation Config
        ↓
Role Filter
        ↓
Sidebar
60. Role Navigation Matrix
Navigation	SUPER_ADMIN	COMPANY_ADMIN	RECRUITER	CANDIDATE
Dashboard	✅	✅	✅	✅
Candidates	Backend scope	✅	✅	❌
Jobs	Backend scope	✅	✅	❌
Applications	Backend scope	✅	✅	Own applications where supported
Interviews	Backend scope	✅	✅	Own interviews
Offers	Backend scope	✅	✅	Own offers
Departments	Platform/company scope	✅	❌	❌
Recruiters	Platform/company scope	✅	❌	❌
ATS Score	Backend scope	✅	✅	Supported candidate view
Job Matching	Backend scope	✅	✅	Supported candidate view
Recommendations	Backend scope	✅	✅	Supported candidate view
Interview Assistant	Backend scope	✅	✅	Supported candidate view
AI Insights	Backend scope	✅	✅	❌
Reports	Platform scope	✅	Backend scope	❌
Platform Companies	✅	❌	❌	❌
Platform Users	✅	❌	❌	❌
AI Usage	✅	Backend scope	Backend scope	❌
System Health	✅	❌	❌	❌
Audit Logs	✅	Backend scope	Backend scope	❌
Settings	✅	✅	Profile/security	Profile/security

The actual availability must always match the backend implementation.

61. Cross-Tenant Navigation

A user must never be able to navigate to another company's resource simply by changing a URL parameter.

Example:

/app/jobs/company-B-job-id

If the current user belongs to Company A:

Backend
   ↓
Authorization
   ↓
403 / 404

The frontend must display the appropriate controlled error state.

62. Super Admin and Tenant Context

Super Admin navigation must not accidentally inherit company context from a previous session.

When switching:

Company User
     ↓
Logout
     ↓
Super Admin Login

the frontend must clear user/company-specific cached state.

Similarly:

Super Admin
     ↓
Company User Login

must not reuse Super Admin data.

63. Logout Navigation

After logout:

Any protected route
       ↓
Logout
       ↓
Clear auth state
       ↓
Clear user-specific cache
       ↓
/login

Browser back navigation must not reveal protected application data.

64. Session Expiration Navigation

If a session expires while the user is inside:

/app/jobs

the expected flow is:

API request
    ↓
401
    ↓
Central auth handler
    ↓
Clear authentication
    ↓
/login?returnUrl=/app/jobs

After successful reauthentication:

/login
    ↓
/app/jobs

when safe and supported.

65. Unauthorized Navigation Attempt

Example:

Recruiter
   ↓
/platform/companies

Expected:

RoleRoute
   ↓
403

The frontend should not render the platform page even briefly.

The backend must also reject any API request attempting to access platform resources.

66. Not Found Navigation Attempt

Example:

/app/unknown-feature

Expected:

404 Page

No API request should be required merely to determine that the frontend route itself does not exist.

67. Resource Not Found

Example:

/app/jobs/clinvalid

If the route exists but the backend returns:

404

the page should display a resource-level not-found state.

Example:

Job Not Found

The job may have been removed or you may not have access to it.

[ Back to Jobs ]

Do not reveal whether a resource exists in another tenant.

68. Route Security Checklist

Every protected route must verify:

 Authentication required
 Allowed role defined
 Backend API authorization exists
 Tenant isolation remains backend-controlled
 Unauthorized route displays 403
 Expired session displays login
 Unknown route displays 404
 Dynamic IDs treated as untrusted
 Sensitive data not embedded in URL unnecessarily
69. Navigation UX Checklist

The navigation must:

 Highlight active route
 Support nested routes
 Support mobile
 Support collapsed sidebar
 Preserve browser history
 Support direct URLs
 Support keyboard navigation
 Show only role-appropriate links
 Not expose inaccessible features unnecessarily
70. Implementation Order

Routing should be implemented in this order:

Step 1

Create:

routeConfig.ts
Step 2

Create:

ProtectedRoute.tsx
PublicRoute.tsx
RoleRoute.tsx
Step 3

Create:

AppRouter.tsx
Step 4

Add public authentication routes.

Step 5

Add protected /app routes.

Step 6

Add /platform Super Admin routes.

Step 7

Add role-aware navigation configuration.

Step 8

Add breadcrumbs.

Step 9

Add 403 and 404 pages.

Step 10

Add lazy loading.

Step 11

Add centralized error redirects.

Step 12

Verify every role.

71. Verification Matrix

The following must be tested before routing is considered complete.

Authentication
 Unauthenticated user cannot access /app/*
 Unauthenticated user cannot access /platform/*
 Authenticated user cannot remain on /login
 Logout redirects to login
 Expired session redirects to login
 Return URL works where supported
Super Admin
 Can access /platform/*
 Cannot accidentally receive company-user navigation
 Company routes follow backend authorization
 Platform routes reject other roles
Company Admin
 Can access company dashboard
 Can access authorized recruitment routes
 Cannot access Super Admin routes
 Company isolation is preserved
Recruiter
 Can access recruiter dashboard
 Can access assigned recruitment resources
 Cannot access recruiter-management routes
 Cannot access Super Admin routes
 Backend assignment restrictions remain effective
Candidate
 Can access candidate dashboard
 Can access own resources
 Cannot access recruiter/company administration
 Cannot access AI Insights if backend restricts it
 Cannot access Super Admin routes
Errors
 401 handled
 403 handled
 404 handled
 409 handled
 422 handled
 429 handled
 500 handled
 503 handled
72. Definition of Done

Frontend Routing & Navigation is complete when:

Routing
 Public routes implemented
 Authentication routes implemented
 Protected routes implemented
 Super Admin routes implemented
 Role-specific routing implemented
 Dynamic resource routes implemented
 AI routes implemented
Guards
 PublicRoute
 ProtectedRoute
 RoleRoute
 Authentication expiration handling
Navigation
 Central navigation configuration
 Role-based navigation filtering
 Active route handling
 Nested navigation
 Mobile navigation
Errors
 401 handling
 403 page
 404 page
 Resource-level 404
 API error redirect handling
UX
 Browser back/forward works
 Refresh works
 Deep links work
 Lazy loading works
 Loading states work
Security
 Frontend never replaces backend authorization
 Cross-company access remains blocked
 Super Admin routes are isolated
 Candidate routes remain self-scoped
 Recruiter routes respect assignment rules
 Authenticated cache is cleared on logout
73. Final Routing Architecture
                         HireStack Frontend
                                │
                                ▼
                         Authentication
                                │
                    ┌───────────┴───────────┐
                    │                       │
              Unauthenticated          Authenticated
                    │                       │
                    ▼                       ▼
               Public Routes           Route Guards
                                            │
                                  ┌─────────┴─────────┐
                                  │                   │
                              SUPER_ADMIN       Other Roles
                                  │                   │
                                  ▼                   ▼
                            /platform              /app
                                  │                   │
                    ┌─────────────┼───────┐     ┌─────┴──────────┐
                    │             │       │     │                │
                Companies      Users   Monitoring  Dashboard   Features
                                                    │                │
                                                    │       ┌────────┼─────────┐
                                                    │       │        │         │
                                                Candidates  Jobs     AI      Reports
                                                    │       │        │
                                                    └───────┴────────┘
                                                            │
                                                            ▼
                                                    Backend API
                                                            │
                                                            ▼
                                                   Authorization
                                                            │
                                                            ▼
                                                       Database
74. Final Principle

The routing layer exists to provide a clean and predictable user experience.

It must never become a replacement for backend authorization.

The correct security model is:

Frontend
│
├── Route protection
├── Role-aware navigation
├── UX redirects
└── Error handling
        │
        ▼
Backend
│
├── Authentication
├── Authorization
├── Tenant isolation
├── Business rules
└── Data access

Frontend routing controls what the user can navigate to.
Backend authorization controls what the user is actually allowed to access.

This separation must remain intact throughout Phase 3.