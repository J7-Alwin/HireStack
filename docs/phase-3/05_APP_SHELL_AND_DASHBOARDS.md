# HireStack ATS — App Shell & Dashboards

**Phase:** 3 — Frontend  
**Document:** 05  
**Status:** Planned  
**Version:** 1.0.0

---

## 1. Purpose

This document defines the frontend application shell and dashboard architecture for HireStack ATS.

The App Shell provides the common authenticated UI structure used throughout the application, while dashboards provide role-specific entry points and summaries.

The frontend must support the following roles:

- SUPER_ADMIN
- COMPANY_ADMIN
- RECRUITER
- CANDIDATE

The shell must enforce frontend role visibility while the backend remains the final authority for authentication and authorization.

---

# 2. App Shell

The authenticated application uses a common application shell.

```text
┌──────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ Logo | Search | Notifications | User Menu                  │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│ Sidebar       │ Main Content                                 │
│               │                                              │
│ Dashboard     │ Page                                         │
│ Candidates    │                                              │
│ Jobs          │                                              │
│ Applications  │                                              │
│ Interviews    │                                              │
│ Offers        │                                              │
│ AI            │                                              │
│ Reports       │                                              │
│ Settings      │                                              │
│               │                                              │
├───────────────┴──────────────────────────────────────────────┤
│ Footer / Application Information                             │
└──────────────────────────────────────────────────────────────┘

3. Shell Components

The application shell should be divided into reusable components.

src/
└── components/
    └── layout/
        ├── AppShell.tsx
        ├── Header.tsx
        ├── Sidebar.tsx
        ├── SidebarItem.tsx
        ├── Breadcrumbs.tsx
        ├── UserMenu.tsx
        ├── NotificationMenu.tsx
        ├── PageContainer.tsx
        └── MobileNavigation.tsx

These components should not contain business-specific logic.

Business logic belongs to feature modules.

4. AppShell Responsibilities

AppShell is responsible for:

Rendering the authenticated application layout
Rendering the sidebar
Rendering the header
Rendering breadcrumbs where required
Rendering the authenticated page content
Handling responsive layout
Handling sidebar collapse/expand state
Providing common layout context

It must not:

Perform API business operations
Implement role authorization rules
Contain feature-specific UI
Directly manipulate feature data
5. Header

The header contains global application controls.

Desktop
┌──────────────────────────────────────────────────────────────┐
│ HireStack       Search...       🔔       User ▼              │
└──────────────────────────────────────────────────────────────┘
Header responsibilities
Application branding
Global search entry point
Notification access
Current user information
Profile menu
Logout action
Responsive navigation trigger
6. Sidebar

The sidebar displays navigation according to the authenticated user's role.

Example:

Dashboard


Recruitment
  Candidates
  Jobs
  Applications
  Interviews
  Offers


AI
  ATS Score
  Job Matching
  Recommendations
  Interview Assistant
  AI Insights


Administration
  Companies
  Departments
  Recruiters
  Settings

The exact navigation displayed must be generated from a centralized role-aware navigation configuration.

Do not duplicate navigation rules across components.

7. Navigation Configuration

Navigation should use a centralized configuration.

Example conceptual structure:

{
  label: "Candidates",
  path: "/candidates",
  icon: Users,
  allowedRoles: [
    "SUPER_ADMIN",
    "COMPANY_ADMIN",
    "RECRUITER"
  ]
}

The frontend should filter navigation items using the authenticated user's role.

However:

Hiding a navigation item is not authorization.

Every protected operation must still be authorized by the backend.

8. Role-Based Navigation
SUPER_ADMIN

Primary navigation:

Dashboard


Platform
  Companies
  Users
  System Overview


Monitoring
  AI Usage
  System Health
  Audit Logs


Settings

The Super Admin dashboard is platform-level.

It must not be treated as a normal company dashboard.

COMPANY_ADMIN

Primary navigation:

Dashboard


Recruitment
  Candidates
  Jobs
  Applications
  Interviews
  Offers


Organization
  Departments
  Recruiters


AI
  ATS Score
  Job Matching
  Recommendations
  Interview Assistant
  AI Insights


Reports
  Recruitment Reports
  AI Reports


Settings

Company Admin is restricted to the authenticated company.

RECRUITER

Primary navigation:

Dashboard


Recruitment
  Candidates
  Jobs
  Applications
  Interviews
  Offers


AI
  ATS Score
  Job Matching
  Recommendations
  Interview Assistant
  AI Insights


Reports


Profile

Recruiter visibility is further restricted by backend authorization and job assignment rules.

CANDIDATE

Primary navigation:

Dashboard


My Profile
  Profile
  Resume


My Applications


My Interviews


My Offers


AI
  ATS Score
  Job Matching
  Recommendations
  Interview Assistant


Settings

Candidate-specific routes must never expose recruiter/company administration functionality.

9. Dashboard Architecture

Each role receives a different dashboard.

/dashboard

The dashboard rendered after login depends on the authenticated user's role.

Conceptually:

SUPER_ADMIN
    ↓
SuperAdminDashboard


COMPANY_ADMIN
    ↓
CompanyAdminDashboard


RECRUITER
    ↓
RecruiterDashboard


CANDIDATE
    ↓
CandidateDashboard
10. Super Admin Dashboard

The Super Admin dashboard provides platform-level visibility.

Main sections
Platform Overview


┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Companies    │ │ Candidates   │ │ Recruiters   │
│ Total        │ │ Total        │ │ Total        │
└──────────────┘ └──────────────┘ └──────────────┘


┌──────────────┐ ┌──────────────┐
│ Active Jobs  │ │ Applications │
│              │ │              │
└──────────────┘ └──────────────┘


System Activity


AI Usage


Recent Companies


System Health
Important restriction

Super Admin functionality must follow the backend's existing authorization model.

The dashboard must not assume access to company-owned candidate/job data unless the backend explicitly provides such access.

11. Company Admin Dashboard

The Company Admin dashboard provides organization-level recruitment visibility.

Main sections
Company Overview


┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Candidates   │ │ Active Jobs  │ │ Applications │
└──────────────┘ └──────────────┘ └──────────────┘


┌──────────────┐ ┌──────────────┐
│ Interviews   │ │ Offers       │
└──────────────┘ └──────────────┘


Recruitment Pipeline


Recent Applications


Upcoming Interviews


AI Evaluation Summary


Recent Activity

Data must be requested using the authenticated user's company context.

12. Recruiter Dashboard

The Recruiter dashboard focuses on assigned recruitment work.

Main sections
Recruitment Overview


┌──────────────┐ ┌──────────────┐
│ Assigned Jobs│ │ Candidates   │
└──────────────┘ └──────────────┘


┌──────────────┐ ┌──────────────┐
│ Applications │ │ Interviews   │
└──────────────┘ └──────────────┘


Candidate Pipeline


Upcoming Interviews


Recent Applications


AI Evaluation Activity

Recruiters must only receive data permitted by backend recruiter assignment rules.

The frontend must not attempt to derive assignment permissions locally.

13. Candidate Dashboard

The Candidate dashboard is personal and self-scoped.

Main sections
Welcome / Profile Completion


┌────────────────────┐
│ Profile Completion │
└────────────────────┘


My Applications


Application Status


Upcoming Interviews


My Offers


AI Career Assistance


  ATS Score
  Job Matching
  Resume Recommendations
  Interview Assistant

Candidate dashboard data must always be scoped to the authenticated candidate.

14. Dashboard Cards

Dashboard cards should be reusable.

Recommended component:

src/components/dashboard/
├── StatCard.tsx
├── ActivityCard.tsx
├── StatusCard.tsx
├── ChartCard.tsx
├── QuickActionCard.tsx
└── EmptyState.tsx

Cards should support:

Loading state
Error state
Empty state
Data state
Optional action
Responsive rendering
15. Loading States

Dashboard pages must not appear broken while API requests are running.

Use skeleton loaders where appropriate.

Example:

┌────────────────────┐
│ ████████████       │
│ ████████           │
└────────────────────┘

Avoid displaying fake statistics while data is loading.

16. Error States

API failures should produce a controlled UI.

Example:

Unable to load dashboard data.


Please try again.


[ Retry ]

Do not expose:

Stack traces
Database errors
Internal server paths
JWT details
Raw backend exceptions
17. Empty States

Empty resources should have meaningful messages.

Example:

No active jobs yet.


Create your first job to start recruiting.


[ Create Job ]

Avoid generic empty screens.

18. Responsive Behavior

The application must support:

Desktop
Laptop
Tablet
Mobile

Desktop:

Sidebar + Header + Content

Tablet:

Collapsed Sidebar + Header + Content

Mobile:

Header
   ↓
Content
   ↓
Mobile Navigation

The exact responsive implementation will be defined during frontend development.

19. Route Structure

The authenticated route hierarchy should follow role-independent resource routes where possible.

Example:

/
├── login
├── forgot-password
├── reset-password
│
└── app
    ├── dashboard
    │
    ├── candidates
    ├── jobs
    ├── applications
    ├── interviews
    ├── offers
    │
    ├── ai
    │   ├── ats-score
    │   ├── matching
    │   ├── recommendations
    │   ├── interview-assistant
    │   └── insights
    │
    ├── departments
    ├── recruiters
    ├── reports
    └── settings

Super Admin platform routes should remain clearly separated where appropriate.

Example:

/app/platform
├── companies
├── users
├── ai-usage
├── system-health
└── audit-logs
20. Route Protection

Frontend route protection must operate in layers.

Request
   ↓
Authentication Check
   ↓
Authenticated?
   ├── NO → Login
   │
   └── YES
        ↓
Role Check
        ↓
Allowed?
   ├── NO → Forbidden
   │
   └── YES
        ↓
Render Page

Backend authorization remains authoritative.

21. Forbidden Page

Unauthorized frontend navigation should display a dedicated page.

403


Access Denied


You do not have permission to access this page.


[ Return to Dashboard ]

Do not redirect unauthorized users silently unless the routing strategy explicitly requires it.

22. Session Expiration

If the backend returns an authentication/session expiration response:

API Request
    ↓
401
    ↓
Authentication Handler
    ↓
Refresh / Logout Strategy

The frontend must use the authentication strategy defined in:

04_AUTHENTICATION_AND_RBAC.md

Do not create a second independent authentication mechanism.

23. API Data Loading

Dashboards should consume backend APIs through the centralized API client.

Do not make direct fetch() calls throughout dashboard components.

Preferred architecture:

Dashboard
    ↓
Feature Hook
    ↓
Feature API Service
    ↓
Central API Client
    ↓
Backend

Example:

CompanyAdminDashboard
        ↓
useCompanyDashboard()
        ↓
companyDashboardApi
        ↓
apiClient
24. Dashboard Data Boundaries

The frontend must not calculate authorization from dashboard data.

For example:

❌ Wrong


if (job.recruiterId === currentUser.id) {
   allow access
}

Instead:

Frontend
    ↓
Request resource
    ↓
Backend authorization
    ↓
Allowed / Forbidden

Frontend role information is primarily for UI and routing.

Backend authorization is the security boundary.

25. AI Dashboard Integration

AI functionality belongs inside the existing AI feature structure.

AI
├── ATS Score
├── Job Matching
├── Resume Recommendations
├── Interview Assistant
└── AI Insights

The frontend must consume the existing Phase 2 backend APIs.

No AI business logic should be recreated in React.

The frontend should:

Request AI evaluation
Display loading state
Display evaluation results
Display errors
Display historical evaluations
Respect backend authorization
Never expose internal AI implementation details
26. AI Optimization Transparency

The frontend does not need to expose:

Cache keys
Internal retry counts
Deduplication locks
Internal model infrastructure
Server-side execution metadata

These are backend infrastructure concerns.

The frontend may display user-facing information such as:

AI analysis completed

or:

AI analysis is currently unavailable.
27. Global Error Handling

The frontend should provide centralized error handling.

API Error
    ↓
API Client
    ↓
Error Normalizer
    ↓
UI Error Handler
    ↓
Toast / Inline Error / Error Page

Expected mappings:

HTTP	Frontend behavior
400	Validation message
401	Authentication/session handling
403	Forbidden UI
404	Not-found UI
409	Conflict message
422	Validation message
429	Rate-limit message
500	Generic server error
503	Service unavailable

Never display raw backend error objects directly.

28. Global UI States

The application should standardize:

Loading
Error
Empty
Success
Forbidden
Not Found

Reusable components should be created for these states rather than implementing them repeatedly.

29. Breadcrumbs

Breadcrumbs should be generated from route metadata where possible.

Example:

Dashboard
  >
Candidates
  >
Candidate Details

Breadcrumbs should reflect the current route and not expose inaccessible parent resources.

30. User Menu

The authenticated user menu should contain:

Profile
Settings
Change Password
Logout

Additional options may be shown according to role.

Super Admin:

Profile
Settings
System Settings
Logout

Candidate:

Profile
Resume
Settings
Logout
31. Logout

Logout must:

Clear frontend authentication state.
Clear stored authentication credentials according to the auth strategy.
Clear user-specific cached frontend data.
Redirect to login.
Prevent access to previously authenticated routes through browser history.
32. Frontend Cache Isolation

Client-side query/cache libraries must not allow one user's data to appear for another user after login/logout.

User/company identity should form part of relevant cache keys.

At minimum, clear or invalidate authenticated query state on logout.

33. Dashboard Performance

Dashboard implementation should avoid unnecessary API requests.

Prefer:

One dashboard API
        ↓
Dashboard-specific aggregated response

when an appropriate backend endpoint exists.

Do not automatically create multiple APIs merely to populate separate cards if existing backend APIs can provide the required information efficiently.

Performance optimization must not weaken authorization boundaries.

34. Dashboard Accessibility

The dashboard must support:

Keyboard navigation
Visible focus states
Semantic buttons and links
Accessible labels
Appropriate heading hierarchy
Screen-reader friendly navigation
Sufficient contrast
Accessible loading/error states
35. Mobile Navigation

On smaller screens:

┌─────────────────────────────┐
│ ☰  HireStack       🔔  👤  │
├─────────────────────────────┤
│                             │
│         Page Content        │
│                             │
└─────────────────────────────┘

The sidebar should become a drawer or equivalent mobile navigation.

36. Dashboard Component Boundaries

Recommended structure:

src/
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── navigation/
│   └── ui/
│
├── features/
│   ├── super-admin/
│   │   └── dashboard/
│   │
│   ├── company/
│   │   └── dashboard/
│   │
│   ├── recruiter/
│   │   └── dashboard/
│   │
│   └── candidate/
│       └── dashboard/

Shared layout components must remain role-neutral.

Role-specific dashboard components belong inside their respective feature areas.

37. Dashboard Security Rules

The frontend must never:

Trust role information from local storage alone.
Treat hidden navigation as authorization.
Expose another company's data.
Construct privileged API requests based only on frontend checks.
Store sensitive backend responses unnecessarily.
Display unauthorized cached data after account switching.

The backend remains the security authority.

38. Dashboard Development Order

Implementation should proceed in this order:

Step 1

Build shared:

AppShell
Header
Sidebar
PageContainer
UserMenu
Step 2

Implement route protection.

Step 3

Implement role-aware navigation.

Step 4

Implement Super Admin dashboard.

Step 5

Implement Company Admin dashboard.

Step 6

Implement Recruiter dashboard.

Step 7

Implement Candidate dashboard.

Step 8

Add loading/error/empty states.

Step 9

Add responsive behavior.

Step 10

Integrate dashboard APIs.

Step 11

Run role-based verification.

39. Role Verification Matrix

The frontend implementation must eventually verify:

Feature	Super Admin	Company Admin	Recruiter	Candidate
Platform Dashboard	✅	❌	❌	❌
Company Dashboard	❌	✅	✅*	❌
Recruiter Dashboard	❌	❌	✅	❌
Candidate Dashboard	❌	❌	❌	✅
Candidates	Based on backend scope	✅	Assigned scope	❌
Jobs	Based on backend scope	✅	Assigned scope	❌
Applications	Based on backend scope	✅	Assigned scope	Own only where supported
Interviews	Based on backend scope	✅	Assigned scope	Own
Offers	Based on backend scope	✅	Assigned scope	Own
AI Features	Backend-defined	✅	✅	Candidate-supported AI only
Company Management	✅	❌	❌	❌
Recruiter Management	✅ / platform scope	✅	❌	❌
Departments	Platform/company scope	✅	View as permitted	❌
System Settings	✅	❌	❌	❌

* Recruiter dashboard is recruiter-specific and must remain scoped to recruiter permissions.

The backend remains authoritative for every row.

40. Definition of Done

The App Shell and Dashboard stage is complete only when:

App Shell
 Header implemented
 Sidebar implemented
 Mobile navigation implemented
 User menu implemented
 Breadcrumb system implemented
 Responsive layout verified
Authentication
 Protected routes implemented
 Session expiration handled
 Logout implemented
 Authenticated cache cleared on logout
RBAC
 Role-aware navigation implemented
 Role-aware route guards implemented
 Forbidden page implemented
 Backend remains authorization authority
Dashboards
 Super Admin dashboard implemented
 Company Admin dashboard implemented
 Recruiter dashboard implemented
 Candidate dashboard implemented
UX
 Loading states
 Error states
 Empty states
 Responsive behavior
 Accessibility checks
Integration
 Dashboard APIs connected
 AI APIs connected where applicable
 API errors normalized
 No unauthorized data displayed
Verification
 Super Admin access verified
 Company Admin access verified
 Recruiter access verified
 Candidate access verified
 Cross-company access verified through backend
 Logout/session behavior verified
 Mobile layout verified
 Production build passes
41. Final Architecture

The completed frontend shell should follow:

                    ┌────────────────────┐
                    │   Authentication   │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │   Route Guards     │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │     AppShell       │
                    │                    │
                    │ Header + Sidebar   │
                    └─────────┬──────────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
       Super Admin      Company Admin      Recruiter
       Dashboard        Dashboard          Dashboard
             │                │                │
             └────────────────┼────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Feature Modules    │
                    │                    │
                    │ Candidates         │
                    │ Jobs               │
                    │ Applications       │
                    │ Interviews         │
                    │ Offers             │
                    │ AI                 │
                    │ Reports            │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Central API Client │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ HireStack Backend  │
                    └────────────────────┘
Final Principle

The frontend is responsible for presentation, navigation, user experience, and client-side route protection.

The backend remains responsible for authentication, authorization, tenant isolation, business rules, AI execution, and data security.

No frontend implementation should weaken or duplicate the backend's security boundary.