# HireStack ATS — Frontend Authentication & RBAC

**Phase:** 3 — Frontend  
**Module:** Authentication & Role-Based Access Control  
**Status:** Implementation Specification  
**Version:** 1.0.0  
**Backend Compatibility:** Backend v2.0.0

---

## 1. Purpose

This document defines the frontend authentication, authorization, role-based access control (RBAC), protected routing, session handling, and navigation rules for the HireStack ATS frontend.

The frontend must consume the existing backend authentication and authorization system rather than creating a second authorization model.

The backend remains the final authority for all permissions.

The frontend RBAC layer exists to:

- Control access to pages and UI features.
- Prevent unauthorized navigation.
- Display role-appropriate dashboards.
- Hide actions the current role cannot perform.
- Maintain authenticated user state.
- Handle expired or invalid sessions.
- Provide a consistent authorization experience.

---

# 2. Supported Roles

HireStack currently supports the following application roles:

```text
SUPER_ADMIN
COMPANY_ADMIN
RECRUITER
CANDIDATE

These roles have different scopes and responsibilities.

2.1 SUPER_ADMIN

The Super Admin operates at the platform level.

Scope
Platform-wide
Responsibilities
Manage companies.
View platform-level information.
Manage platform configuration where supported.
Monitor platform-wide activity.
Access Super Admin dashboard.
Perform platform-level administrative operations.
Important Rule

SUPER_ADMIN is NOT a normal company-scoped user.

The frontend must not treat Super Admin as belonging to the same permission scope as:

COMPANY_ADMIN
RECRUITER
CANDIDATE
3. COMPANY_ADMIN

Company Admin operates within one company/tenant.

Scope
Single Company
Responsibilities
Manage company users.
Manage recruiters.
Manage candidates.
Manage jobs.
Manage applications.
Manage interviews.
Manage offers.
View company-level AI features.
Access company dashboard.
View company analytics when available.
4. RECRUITER

Recruiters operate within their assigned company and recruiter permissions.

Scope
Company + assigned jobs
Responsibilities
Manage assigned jobs.
View eligible candidates.
Manage applications.
Conduct interviews.
Manage hiring pipeline.
Access permitted AI evaluation features.
View recruiter-specific dashboard.
Important Rule

Recruiters must NOT receive unrestricted company-wide access merely because they belong to a company.

The frontend must respect recruiter assignment restrictions returned/enforced by the backend.

5. CANDIDATE

Candidates operate on their own candidate account.

Scope
Own candidate profile
Responsibilities
Manage own profile.
Upload/manage resume where supported.
Browse available jobs.
Apply for jobs.
Track applications.
View interviews.
View permitted AI-generated candidate information.
Important Rule

A candidate must never be allowed to access another candidate's:

Profile
Resume
Applications
Interviews
AI evaluations
Personal information

The backend must enforce this even if frontend restrictions are bypassed.

6. Authentication Architecture

The frontend authentication flow is:

User
  │
  ▼
Login Page
  │
  ▼
POST /auth/login
  │
  ▼
Backend Authentication
  │
  ├── Invalid credentials ──► 401
  │
  └── Valid credentials
          │
          ▼
     Authentication Data
          │
          ▼
     Frontend Auth Store
          │
          ▼
     Role Resolution
          │
          ▼
     Protected Router
          │
          ▼
     Role Dashboard
7. Authentication State

The frontend must maintain a centralized authentication state.

Recommended state:

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  companyId?: string | null;
  isActive: boolean;
}

Authentication state should contain:

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
8. Auth Store

Authentication state must not be duplicated across individual pages.

Use one centralized auth store.

Recommended location:

src/
└── features/
    └── auth/
        ├── api/
        ├── components/
        ├── hooks/
        ├── pages/
        ├── store/
        ├── types/
        └── validation/

The exact state-management library must follow the frontend architecture defined in:

01_FRONTEND_ARCHITECTURE.md
9. Login Flow
Step 1

User opens:

/login
Step 2

User enters:

email
password
Step 3

Frontend validates basic input.

Example:

Email required
Password required
Valid email format
Step 4

Frontend calls backend login endpoint.

POST /api/v1/auth/login
Step 5

Backend validates:

User exists.
Password is correct.
User is active.
Account rules are satisfied.
Step 6

Backend returns authentication information.

Step 7

Frontend stores the authenticated session according to the security strategy defined by the project.

Step 8

Frontend determines the user's role.

Step 9

User is redirected to the appropriate dashboard.

10. Dashboard Routing

After successful login:

SUPER_ADMIN
    ↓
/super-admin/dashboard


COMPANY_ADMIN
    ↓
/admin/dashboard


RECRUITER
    ↓
/recruiter/dashboard


CANDIDATE
    ↓
/candidate/dashboard

The exact dashboard URLs should remain centralized in the route configuration.

Do not hard-code dashboard paths throughout components.

11. Route Configuration

Routes should be centralized.

Example:

const ROUTES = {
  public: {
    login: "/login",
    unauthorized: "/unauthorized",
  },


  superAdmin: {
    dashboard: "/super-admin/dashboard",
  },


  companyAdmin: {
    dashboard: "/admin/dashboard",
  },


  recruiter: {
    dashboard: "/recruiter/dashboard",
  },


  candidate: {
    dashboard: "/candidate/dashboard",
  },
};

All navigation should use these route constants.

12. Public Routes

Public routes are accessible without authentication.

Initial public routes:

/login
/unauthorized

Additional public pages may be added later if required.

13. Protected Routes

Protected routes require an authenticated user.

Example:

/admin/*
/recruiter/*
/candidate/*
/super-admin/*

Unauthenticated users attempting to access protected routes must be redirected to:

/login
14. Role-Protected Routes

Authentication alone is not sufficient.

A user must also have the required role.

Example:

/admin/users

Allowed:

COMPANY_ADMIN

Denied:

SUPER_ADMIN
RECRUITER
CANDIDATE

unless the backend/API contract explicitly defines otherwise.

15. Route Guard Architecture

Use layered route protection.

ProtectedRoute
      │
      ▼
Is authenticated?
      │
 ┌────┴────┐
 NO        YES
 │          │
 ▼          ▼
Login    RoleGuard
             │
             ▼
       Correct role?
          │
      ┌───┴───┐
     NO       YES
      │         │
      ▼         ▼
Unauthorized  Page
16. ProtectedRoute

Responsibilities:

Check authentication state.
Display loading state while auth is being restored.
Redirect unauthenticated users.
Allow authenticated users to continue.

Pseudo-interface:

interface ProtectedRouteProps {
  children: React.ReactNode;
}
17. RoleGuard

Responsibilities:

Read authenticated user's role.
Compare against required roles.
Prevent unauthorized page access.
Redirect unauthorized users to /unauthorized.

Example:

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

Usage:

<RoleGuard allowedRoles={["COMPANY_ADMIN"]}>
  <CompanyAdminPage />
</RoleGuard>
18. Multi-Role Routes

Some pages may be accessible by multiple roles.

Example:

AI Insights

could be accessible to:

COMPANY_ADMIN
RECRUITER

The route configuration should express this explicitly:

allowedRoles: [
  "COMPANY_ADMIN",
  "RECRUITER",
]

Do not create separate duplicate pages merely because multiple roles access the same feature.

19. Permission vs Role

Role is not always equivalent to permission.

Example:

RECRUITER

does not automatically mean:

Can access every company job

The frontend should therefore distinguish between:

Role-level authorization
Can this role access the feature?

and:

Resource-level authorization
Can this user access this particular resource?

Resource-level authorization must ultimately be enforced by the backend.

20. Backend as Final Authorization Authority

Frontend authorization is a UX/security boundary, not the final security boundary.

Never rely exclusively on:

if (user.role === "RECRUITER")

to protect sensitive resources.

The backend must validate:

User identity.
Company ownership.
Candidate ownership.
Recruiter assignment.
Job ownership.
Application relationships.
Resource permissions.
21. API Authorization Errors

The API client must handle authentication/authorization errors centrally.

401 Unauthorized

Usually means:

Missing/invalid/expired authentication

Frontend behavior:

Clear invalid auth state
Redirect to /login
403 Forbidden

Means:

Authenticated but not allowed

Frontend behavior:

Show unauthorized/forbidden UI

Do NOT automatically log the user out on every 403.

22. 404 Handling

If a backend returns:

404 Not Found

the frontend should display the appropriate resource-not-found state.

Do not automatically interpret every 404 as an authentication problem.

23. Session Restoration

When the application starts:

App starts
   ↓
Auth store initializes
   ↓
Restore authentication/session
   ↓
Validate current user/session
   ↓
Set auth state
   ↓
Render router

The application must avoid briefly rendering protected pages before authentication state is resolved.

24. Authentication Loading State

During authentication restoration:

isLoading = true

The application should display a lightweight application loading screen.

It must not:

Render dashboard content.
Redirect prematurely.
Flash the login page.
Flash unauthorized content.
25. Logout

Logout flow:

User clicks Logout
      ↓
Call backend logout if required
      ↓
Clear authentication state
      ↓
Clear sensitive client state
      ↓
Redirect /login

Sensitive cached user data must not remain available after logout.

26. Logout Cleanup

Logout should clear:

Auth state
User state
Role state
Protected query cache
Sensitive feature state
Temporary session data

Do not clear public/static application configuration unnecessarily.

27. Expired Session

If a session expires during API usage:

API request
   ↓
401
   ↓
Central API interceptor
   ↓
Clear auth
   ↓
Redirect /login

Avoid multiple simultaneous redirects.

28. Login Redirect Behavior

If a user accesses a protected URL while logged out:

/admin/jobs

they should be redirected to:

/login

After successful login, the application may return them to:

/admin/jobs

provided the authenticated role is authorized to access it.

29. Unauthorized Page

Create:

/unauthorized

Purpose:

Authenticated user
+
Insufficient permissions

Example message:

You don't have permission to access this page.

Provide:

Go to Dashboard

Do not expose internal authorization details.

30. Navigation RBAC

Sidebar/navigation items must be role-aware.

Example:

SUPER_ADMIN
├── Dashboard
├── Companies
└── Platform Settings


COMPANY_ADMIN
├── Dashboard
├── Recruiters
├── Candidates
├── Jobs
├── Applications
├── Interviews
├── Offers
└── AI


RECRUITER
├── Dashboard
├── My Jobs
├── Candidates
├── Applications
├── Interviews
└── AI


CANDIDATE
├── Dashboard
├── Profile
├── Jobs
├── Applications
└── Interviews

This is an initial navigation model.

The actual navigation must match the implemented backend API and later frontend module specifications.

31. Navigation Filtering

Navigation configuration should define role visibility.

Example:

interface NavigationItem {
  label: string;
  path: string;
  allowedRoles: UserRole[];
}

Then filter:

const visibleItems = navigationItems.filter(
  item => item.allowedRoles.includes(user.role)
);

Do not duplicate sidebar implementations for every role.

32. UI Action Authorization

Buttons and actions should also respect permissions.

Example:

Create Job
Edit Job
Delete Job
Assign Recruiter
Generate AI Evaluation

A user should only see actions appropriate to their role and resource context.

However:

Hiding a button is not authorization.

The API must still reject unauthorized operations.

33. Resource-Level UI Example

Recruiter sees:

Job A

because they are assigned.

They should see:

Edit
View Candidates
Applications
Interview

for Job A.

For an unassigned Job B:

Job B

should not be accessible through recruiter navigation or direct resource URLs.

If an API request is still attempted manually:

GET /jobs/job-B

the backend must reject it.

34. Candidate Self-Scoping

Candidate pages must automatically operate against the authenticated candidate.

The frontend should not allow a candidate to freely provide another candidate ID to retrieve:

/profile/:candidateId

unless the backend explicitly provides such functionality.

Preferred pattern:

GET /candidates/me

if supported by the backend.

Otherwise, the frontend must use authenticated identity information and rely on backend ownership checks.

35. Company Scoping

Company Admin and Recruiter pages must not assume that a company ID supplied by the browser is trusted.

For example, do not rely on:

/company/:companyId/candidates

as the security boundary.

Backend authorization remains authoritative.

36. Super Admin Isolation

Super Admin routes must be clearly separated from company routes.

Recommended:

/super-admin/*

instead of:

/admin/*

This prevents confusion between:

Platform Admin

and:

Company Admin
37. Super Admin Dashboard

The frontend architecture must include a dedicated Super Admin dashboard.

Initial sections:

Dashboard
Companies
Platform Overview
System Status

Additional sections should only be added when their backend functionality exists.

Super Admin UI must not expose company-admin functionality merely because both roles are called "admin".

38. Company Admin Dashboard

Initial sections:

Dashboard
Recruiters
Candidates
Jobs
Applications
Interviews
Offers
AI

Exact modules should follow the existing backend feature set and subsequent frontend implementation specifications.

39. Recruiter Dashboard

Initial sections:

Dashboard
My Jobs
Candidates
Applications
Interviews
AI

Resource access must respect recruiter assignment.

40. Candidate Dashboard

Initial sections:

Dashboard
Profile
Jobs
Applications
Interviews

Candidate-specific AI features should only be shown when supported by the backend/API contract.

41. Auth API Layer

Authentication requests should be isolated from UI components.

Recommended:

features/auth/api/
    auth.api.ts

Example operations:

login()
logout()
getCurrentUser()

Components should not directly call HTTP clients.

Bad:

axios.post("/auth/login", data);

inside a page component.

Preferred:

authApi.login(data);
42. Auth Hooks

Provide reusable hooks.

Example:

useAuth()
useCurrentUser()
useRole()
useLogout()

Possible usage:

const { user, isAuthenticated, isLoading } = useAuth();
43. Role Helper

Centralize role checks.

Example:

hasRole("COMPANY_ADMIN")

or:

hasAnyRole([
  "COMPANY_ADMIN",
  "RECRUITER",
])

Avoid repeatedly writing raw role comparisons throughout the application.

44. Role Type

Create a single frontend role definition.

Example:

export type UserRole =
  | "SUPER_ADMIN"
  | "COMPANY_ADMIN"
  | "RECRUITER"
  | "CANDIDATE";

If the backend already exposes/generated these values, prefer using the shared/generated representation rather than maintaining incompatible duplicate enums.

45. Security Requirements

The frontend must never:

Store passwords.
Log passwords.
Display tokens unnecessarily.
Put sensitive information into URLs without backend justification.
Trust client-side role checks as authorization.
Expose another user's data.
Persist sensitive API responses longer than necessary.
Log authentication headers.
Log full API responses containing personal information.
46. Token Handling

Token handling must follow the security architecture selected for the project.

If the backend uses secure HTTP-only cookies:

Frontend does not directly access the token.

If bearer tokens are explicitly required by the existing backend contract:

Central API client handles authentication.

Do not independently implement token storage in multiple modules.

47. API Client Integration

All authenticated requests should pass through the centralized API client.

Recommended:

src/
└── shared/
    └── api/
        ├── client.ts
        ├── interceptors.ts
        └── errors.ts

Responsibilities:

API client
├── Base URL
├── Authentication
├── Request configuration
├── Response parsing
├── 401 handling
├── Error normalization
└── Request cancellation where required
48. Error Normalization

Backend errors should be converted into a predictable frontend format.

Example:

interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

UI components should not need to understand raw Axios/fetch errors.

49. Authentication Boundaries

The frontend architecture must maintain the following boundary:

UI
 ↓
Feature Hook
 ↓
Feature API
 ↓
Central API Client
 ↓
Backend API
 ↓
Backend Authorization
 ↓
Database

Never:

UI
 ↓
Database

and never:

UI role check
 ↓
Assume authorization
50. Testing Requirements

Authentication/RBAC must have automated tests.

Minimum coverage:

Authentication
Login success.
Invalid credentials.
Inactive user.
Session restoration.
Logout.
Expired session.
401 handling.
RBAC
Super Admin access.
Company Admin access.
Recruiter access.
Candidate access.
Unauthorized role rejection.
Resource Scoping
Company isolation.
Candidate self-scoping.
Recruiter job assignment.
Cross-company access rejection.
Navigation
Role-specific sidebar.
Unauthorized links hidden.
Dashboard redirect.
51. Route Matrix
Route Area	SUPER_ADMIN	COMPANY_ADMIN	RECRUITER	CANDIDATE
Super Admin	✅	❌	❌	❌
Company Admin	❌*	✅	❌	❌
Recruiter	❌	❌/shared	✅	❌
Candidate	❌	❌	❌	✅
Public	✅	✅	✅	✅

* Any Super Admin access to company-level pages must be explicitly defined by the backend/API contract. Do not automatically assume inherited company-admin permissions.

52. Authorization Decision Matrix
Operation	SUPER_ADMIN	COMPANY_ADMIN	RECRUITER	CANDIDATE
Platform management	✅	❌	❌	❌
Company management	✅	Own company	❌	❌
Recruiter management	Platform/company scope	Own company	❌	❌
Candidate management	Platform/company scope	Own company	Assigned scope	Own profile
Job management	Platform/company scope	Own company	Assigned jobs	View/apply
Applications	Platform/company scope	Own company	Assigned jobs	Own applications
Interviews	Platform/company scope	Own company	Assigned jobs	Own interviews
AI features	Platform/company scope	Own company	Assigned scope	Only explicitly permitted features

The backend remains authoritative for every operation.

53. Authentication UX

The login page should provide:

Email
Password
Sign In

Optional functionality should only be added when supported by the backend:

Forgot Password
Password Reset
Remember Me

Do not implement frontend flows for backend functionality that does not exist.

54. Loading and Error States

Authentication components must support:

Idle
Loading
Success
Validation Error
Authentication Error
Network Error
Session Expired

Avoid blank screens.

55. Accessibility

Authentication and authorization UI must support:

Keyboard navigation.
Visible focus states.
Proper labels.
Accessible form errors.
Screen-reader-friendly status messages.
Appropriate button states.
56. Performance

Authentication state should initialize once.

Avoid:

Every page → fetch current user

when a centralized session state already exists.

Prefer:

Application bootstrap
       ↓
Auth initialization
       ↓
Shared auth state
       ↓
All protected pages
57. Implementation Order

Implement authentication/RBAC in this order:

1. UserRole type
       ↓
2. Auth API
       ↓
3. Auth store
       ↓
4. Auth initialization
       ↓
5. Login page
       ↓
6. Central API client
       ↓
7. 401/403 handling
       ↓
8. ProtectedRoute
       ↓
9. RoleGuard
       ↓
10. Dashboard redirects
       ↓
11. Role-based navigation
       ↓
12. Super Admin isolation
       ↓
13. Resource-level UI guards
       ↓
14. Authentication tests
       ↓
15. RBAC tests
58. Definition of Done

Authentication and RBAC are considered complete only when:

 Login works against the real backend.
 Authentication state is centralized.
 Session restoration works.
 Logout works.
 Expired authentication is handled.
 401 responses are handled globally.
 403 responses display appropriate UI.
 Protected routes work.
 Role guards work.
 Super Admin routes are isolated.
 Company Admin routes are isolated.
 Recruiter routes are isolated.
 Candidate routes are isolated.
 Role-based navigation works.
 Candidate self-scoping is respected.
 Recruiter assignment boundaries are respected.
 Company boundaries are respected.
 Unauthorized direct navigation is blocked by the frontend.
 Backend remains the final authorization authority.
 No credentials or sensitive authentication information are logged.
 Automated authentication tests pass.
 Automated RBAC tests pass.
 Type checking passes.
 Lint passes.
 Production build passes.

 59. Final Security Principle

The HireStack frontend follows this rule:

Frontend RBAC controls visibility and navigation. Backend authorization controls actual access.

Therefore:

Hidden button
    ≠
Security

and:

Protected route
    ≠
Backend authorization

The complete security model is:

Authentication
      +
Frontend RBAC
      +
Resource-level backend authorization
      +
Company/tenant isolation
      =
Secure HireStack frontend