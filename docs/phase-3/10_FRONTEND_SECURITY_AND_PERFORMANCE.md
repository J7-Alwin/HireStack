# HireStack ATS — Frontend Security & Performance Architecture

**Phase:** 3 — Frontend  
**Document:** 10  
**Status:** Planned  
**Version:** 1.0.0

---

# 1. Purpose

This document defines the security and performance requirements for the HireStack ATS frontend.

The frontend must be designed to:

- Protect authenticated sessions
- Prevent accidental exposure of sensitive data
- Respect backend authorization
- Safely communicate with the backend
- Handle untrusted API and AI responses
- Protect file-upload workflows
- Minimize unnecessary network requests
- Maintain responsive UI performance
- Support large ATS datasets
- Load quickly
- Remain stable under slow networks
- Avoid unnecessary client-side computation
- Provide a production-ready security and performance baseline

---

# 2. Core Principle

The frontend is a **trusted user interface, not the security boundary**.

The backend remains authoritative for:

- Authentication
- Authorization
- Tenant isolation
- Business rules
- Data validation
- State transitions
- File validation
- AI authorization
- Sensitive data access

Frontend security exists to:

```text
Prevent accidental exposure
+
Improve user experience
+
Reduce attack surface
+
Protect client-side state
+
Handle unsafe responses safely

It must never be treated as a replacement for backend security.

3. Security Architecture

The security flow should follow:

                    Browser
                       │
                       ▼
                Frontend Application
                       │
              ┌────────┴────────┐
              │                 │
         Auth State         UI/RBAC
              │                 │
              └────────┬────────┘
                       │
                       ▼
                 API Client
                       │
                       ▼
                Backend API
                       │
              Authentication
                       │
              Authorization
                       │
              Tenant Isolation
                       │
                       ▼
                   Database

The frontend must never bypass the API layer to access protected backend data.

4. Authentication

Authentication must use the backend authentication contract established in Phase 1.

The frontend must:

Authenticate through the backend API
Maintain authenticated session state
Restore session safely where supported
Detect expired authentication
Handle logout
Clear sensitive client state on logout
Redirect unauthenticated users appropriately
5. Token Handling

The exact token-storage mechanism must follow the backend authentication contract and the selected frontend architecture.

Do not store authentication tokens in arbitrary application state merely for convenience.

If tokens are stored client-side, the implementation must consider:

XSS exposure
Token lifetime
Refresh behavior
Logout
Session expiration
Cross-tab behavior

If the backend uses secure HTTP-only cookies, the frontend must not attempt to manually access those cookies.

6. Token Security Rules

Never:

Log access tokens
Log refresh tokens
Display tokens in UI
Store tokens in URLs
Include tokens in analytics events
Include tokens in error messages
Commit tokens to source control

Tokens must only be transmitted through the approved authentication mechanism.

7. Authentication Expiration

When an authenticated API request returns:

401 Unauthorized

the frontend should:

1. Stop treating the user as authenticated
2. Clear invalid client authentication state
3. Clear protected server-state where appropriate
4. Redirect to login or invoke the approved refresh flow
5. Avoid infinite retry loops
8. Logout

Logout must clear relevant client state.

At minimum:

Authentication state
Current-user state
Protected query/cache state
Sensitive temporary data

The application must not leave sensitive candidate, job, or AI data visible after logout.

9. Multi-Tab Authentication

If multiple browser tabs are supported, authentication state should remain consistent.

Example:

Tab A
User logs out
        ↓
Tab B
Protected session becomes invalid
        ↓
Tab B
Redirects to login

The exact synchronization mechanism should be selected during implementation.

10. RBAC

The frontend must respect the backend role model.

Supported roles include:

SUPER_ADMIN
COMPANY_ADMIN
RECRUITER
CANDIDATE

Role information should be centralized rather than repeatedly checked through ad-hoc conditions.

11. Permission Architecture

Use a centralized permission abstraction.

Conceptually:

can(user, permission)

or:

hasPermission(user, "jobs.create")

Avoid scattering raw role comparisons throughout the application.

Bad:

if (user.role === "RECRUITER") {
   ...
}

throughout dozens of components.

Prefer centralized permission rules.

12. Frontend Authorization

The frontend may:

Hide unavailable navigation
Hide unavailable actions
Disable unavailable controls
Redirect from protected routes
Display permission messages

But it must never assume that this prevents unauthorized API access.

Every protected API operation must still be authorized by the backend.

13. Route Protection

Protected routes must verify authentication before rendering protected content.

Example:

/dashboard
/candidates
/jobs
/applications
/interviews
/offers
/ai/*

Expected behavior:

Unauthenticated
        ↓
Login
14. Role-Protected Routes

Role-specific routes should enforce frontend route guards.

Example:

/platform/*
    → SUPER_ADMIN

/company/*
    → COMPANY_ADMIN / permitted company roles

/recruiter/*
    → RECRUITER

/candidate/*
    → CANDIDATE

Exact route structure follows:

06_FRONTEND_ROUTING_AND_NAVIGATION.md

15. Direct URL Access

Users must not gain UI access simply by manually entering a URL.

Example:

/recruiter/admin/settings

If the user lacks permission:

→ Permission denied

or an appropriate safe redirect.

16. Sensitive Data

The frontend should only request data required for the current screen.

Avoid fetching large protected datasets and merely hiding most fields.

Bad:

Fetch entire candidate database
→ Hide unauthorized candidates

Good:

Request authorized candidate data
→ Render returned data
17. Data Minimization

Frontend API requests should request only the data needed by the current workflow.

Examples:

Candidate list
→ Summary fields

Candidate details
→ Detailed fields

AI history
→ History fields

AI details
→ Full authorized evaluation

Avoid unnecessary data transfer.

18. Sensitive Data in URLs

Do not place sensitive information in query strings or URL paths unless required by the API contract.

Never place:

Passwords
Tokens
Resume text
AI prompts
Sensitive personal information

in URLs.

URLs may be stored in:

Browser history
Proxy logs
Analytics
Server logs
19. XSS Protection

Never inject untrusted strings into the DOM as raw HTML.

Avoid unsafe rendering of:

Candidate input
Job descriptions
Resume content
AI-generated content
API error messages

Use the framework's safe rendering mechanisms.

20. HTML Sanitization

If the product intentionally supports rich HTML content, such as formatted job descriptions, the frontend must sanitize untrusted HTML before rendering.

Do not assume that:

"HTML from our API"

is automatically safe.

API data remains untrusted at the rendering boundary.

21. AI Output Safety

AI output must be treated as untrusted data.

This applies to:

ATS Score
Job Matching
Resume Recommendations
Interview Assistant
AI Insights

AI responses must not be rendered as executable HTML.

22. AI Prompt Safety

The frontend must never expose internal system prompts unnecessarily.

Do not render:

System prompts
Internal instructions
Private evaluation context
Raw prompt templates

unless explicitly required by the product.

23. AI Output Rendering

AI results should be rendered through structured response schemas.

Example:

overallInsight
strengths[]
weaknesses[]
skillGaps[]
hiringRisks[]
recommendation

Avoid blindly rendering arbitrary AI response objects.

24. AI Disclaimer

Where appropriate, the UI should communicate:

AI-generated assessment. Review the underlying candidate information before making hiring decisions.

AI should be presented as decision-support functionality.

25. AI Error Handling

Never expose:

Stack traces
Ollama errors
Internal service URLs
Prompt contents
Filesystem paths
Raw infrastructure errors

Use safe user-facing messages.

Example:

AI analysis unavailable.

Please try again later.
26. API Security

All protected API requests must use the centralized API client.

Components should not independently implement authentication headers, token handling, or error normalization.

Preferred:

Component
   ↓
Feature Hook
   ↓
API Service
   ↓
API Client
   ↓
Backend
27. API Client Security

The centralized API client should handle:

Authentication
Base URL
Headers
Request serialization
Response parsing
Error normalization
401 handling
Timeout behavior
Request cancellation
28. HTTPS

Production API communication must use HTTPS.

The frontend must never intentionally send sensitive production data over plain HTTP.

29. Environment Variables

Environment variables must be separated by environment.

Example:

.env.local
.env.development
.env.test
.env.production

Only public frontend configuration may be exposed to browser code.

30. Secrets

Never expose:

Database credentials
Private API keys
JWT signing secrets
Backend secrets
AI provider private credentials
Cloud provider secrets

inside frontend environment variables.

If a secret is required by the browser, it is not actually secret.

31. Source Control

Never commit:

.env
.env.production
API secrets
Private keys
Tokens
Credentials

Use:

.env.example

for documented configuration names.

32. Dependency Security

Frontend dependencies must be reviewed regularly.

Recommended checks:

npm audit
Dependency update review
Lockfile review
Known vulnerability scanning

Do not automatically upgrade major dependencies without testing compatibility.

33. Third-Party Scripts

Third-party scripts should be minimized.

Before adding one, evaluate:

Why is it required?
What data does it receive?
Does it track users?
Does it add security risk?
Does it affect performance?

Avoid unnecessary tracking scripts.

34. Content Security Policy

Where supported by the deployment architecture, use a Content Security Policy.

The policy should restrict:

Scripts
Styles
Images
Connections
Frames
Fonts

to approved sources.

CSP configuration should be finalized during deployment architecture.

35. Clickjacking Protection

Production deployment should use appropriate browser security headers to prevent unauthorized framing where applicable.

The frontend deployment layer should coordinate with backend/infrastructure configuration.

36. CSRF

If authentication uses cookies, CSRF protection must follow the backend's security contract.

The frontend must correctly include any required CSRF token/header.

If bearer authentication is used without cookie-based authentication, the CSRF model differs.

Do not invent a frontend-only CSRF solution without aligning it with the backend.

37. File Upload Security

File upload UI must validate basic constraints before sending.

Examples:

Allowed type
Maximum size
Required file

However, frontend validation is only an early UX check.

The backend must independently validate:

MIME type
File content
Size
Extension
Storage rules
Security
38. Resume Upload Security

Resume uploads should:

Validate client-side file type
Validate size
Display upload progress
Handle failures
Avoid exposing filesystem paths
Avoid rendering unsafe content

The frontend must not assume that a .pdf extension guarantees a valid PDF.

39. File Preview

Only preview files using safe browser mechanisms.

Do not inject arbitrary file content into the DOM.

For unsupported or unsafe files:

Show file metadata
Provide approved download/open action
40. Error Logging

Frontend logs must never include:

Passwords
Tokens
Resume text
Candidate PII
AI prompts
Raw AI responses
Authorization headers
Private URLs
41. Production Logging

Production logging should be minimal and useful.

Safe examples:

Route
Request category
UI error type
HTTP status
Feature
Performance duration

Avoid dumping complete objects to the console.

42. Console Cleanup

Before production release:

Remove debug console.log statements
Remove temporary debugging
Remove test credentials
Remove mock data
Remove development-only overlays

Critical errors may be reported through the approved error-monitoring mechanism.

43. Error Monitoring

If an error-monitoring platform is introduced, it must be configured to avoid capturing sensitive information.

Before enabling it, review:

Request headers
Cookies
URL parameters
User data
Form fields
AI responses
Resume content

Sensitive fields must be filtered.

44. Performance Architecture

Frontend performance follows:

Fast initial load
+
Efficient rendering
+
Efficient API usage
+
Efficient state management
+
Lazy loading
+
Code splitting
+
Optimized assets
45. Performance Budget

Performance budgets should be established during implementation.

Track:

JavaScript bundle size
Initial page load
Largest contentful paint
Interaction responsiveness
Network requests
Image size
Route loading time

Exact numeric thresholds may be adjusted after measuring the real application.

46. Code Splitting

Large feature areas should be lazy-loaded when appropriate.

Potential candidates:

Dashboards
AI modules
Charts
Reports
Admin tools
Large settings sections

Example architecture:

Application Shell
      │
      ├── Core UI
      │
      ├── Candidate Module
      │
      ├── Jobs Module
      │
      └── AI Module
             ↓
        Lazy Loaded
47. Route-Level Lazy Loading

Pages that are not required immediately should not unnecessarily increase the initial bundle.

Example:

Login
   ↓
Dashboard
   ↓
Candidate module loaded when visited
48. Component-Level Lazy Loading

Heavy components may be lazy-loaded.

Candidates:

Charts
PDF viewer
Large rich-text editor
Advanced data visualization
AI visualization

Do not lazy-load tiny components unnecessarily.

49. API Request Optimization

Avoid duplicate API requests.

Example:

Dashboard
   ↓
Request candidate count
Request candidate list
Request candidate count again

should be avoided where possible.

Use centralized server-state management and query caching.

50. Request Deduplication

Identical concurrent frontend requests should be deduplicated where the state-management/query library supports it.

Example:

Component A ─┐
             ├── GET /candidates → One request
Component B ─┘
51. Server-State Caching

Cache appropriate read-heavy API responses.

Examples:

Candidate lists
Job lists
Department lists
Current user
Dashboard summaries
AI history

Caching rules must account for:

Freshness
Permissions
Tenant
Filters
Pagination
Mutation invalidation
52. Sensitive Data Caching

Sensitive server data must not be cached indefinitely.

When authentication changes:

Logout
   ↓
Clear protected query state

When tenant/user context changes:

Tenant/user change
   ↓
Invalidate protected queries
53. Query Invalidation

After mutations:

Create
Update
Delete

invalidate or update relevant cached queries.

Example:

Create Candidate
      ↓
Invalidate Candidate List
      ↓
Refetch / update list
54. Pagination

Large datasets must be paginated.

Do not load:

10,000 candidates

into the browser unnecessarily.

Use backend pagination.

55. Server-Side Filtering

Filtering large datasets should generally happen server-side.

Avoid:

Download all candidates
→ Filter in browser

Prefer:

GET /candidates?search=john&status=ACTIVE
56. Server-Side Sorting

Large tables should use backend sorting where supported.

Avoid sorting thousands of records in the browser when the API already supports sorting.

57. Search Debouncing

Search fields should use debouncing where requests are triggered automatically.

Example:

User types:
j
jo
joh
john

Instead of four API requests:

Wait briefly
→ Request "john"
58. Request Cancellation

Stale requests should be cancelled or ignored.

Example:

Search A
   ↓
Search B
   ↓
Search C

The result for:

Search C

must not be overwritten by an older request.

59. Large Table Performance

For large datasets:

Server pagination
+
Server filtering
+
Server sorting
+
Virtualization where necessary

should be used.

60. Virtualization

Virtualization should be considered for very large lists.

Potential examples:

Candidate list
Application list
Activity feed
Large AI history

Do not introduce virtualization for small datasets without a performance reason.

61. Dashboard Performance

Dashboards should avoid requesting every dataset independently if a suitable aggregated backend endpoint exists.

Prefer:

Dashboard API
→ Aggregated metrics

over:

Request 15 unrelated endpoints

when backend architecture supports aggregation.

62. Chart Performance

Charts should:

Render only visible data
Avoid unnecessarily large datasets
Lazy-load heavy chart libraries
Avoid rerendering unnecessarily
Use server aggregation where appropriate
63. Image Optimization

Images should be optimized.

Use:

Appropriate dimensions
Modern formats where supported
Lazy loading
Responsive sizing

Avoid loading full-resolution images when a thumbnail is sufficient.

64. Avatar Optimization

Candidate/recruiter avatars should use appropriately sized assets.

Avoid downloading multi-megapixel images for a 40px avatar.

65. Resume Preview Performance

PDF preview can be expensive.

Consider:

Lazy loading
Page-level rendering
Preview only when requested
Download instead of rendering entire document

Do not render large PDFs unnecessarily on page load.

66. Font Optimization

Fonts should be loaded efficiently.

Avoid:

Many font families
Many unused weights
Large external font dependencies

Use a small, intentional typography system.

67. CSS Performance

Avoid excessive global CSS and deeply nested selectors.

Prefer:

Component-level styles
Design tokens
Reusable utilities
68. React Rendering Performance

Components should avoid unnecessary rerenders.

Potential techniques:

Memoization
Stable callbacks
Derived state minimization
Query selectors
Component splitting

Use optimization only where profiling shows value.

69. State Management Performance

Do not place every piece of UI state into global state.

Use:

Local state

for:

Modal open
Input value
Dropdown state
Temporary UI state

Use global state for truly shared state.

70. Server vs Client State

Separate:

Server State

from:

Client UI State

Server state includes:

Candidates
Jobs
Applications
Interviews
AI results

Client state includes:

Modal
Sidebar
Selected tab
Temporary form state

This separation reduces unnecessary complexity.

71. AI Performance

AI operations may be slow and expensive.

The frontend should:

Prevent duplicate generation
Show clear loading state
Disable duplicate actions
Allow safe cancellation where supported
Cache results when appropriate
Display previous results where appropriate
Handle timeout gracefully
72. AI Polling

If an AI operation becomes asynchronous in the future, polling must be controlled.

Avoid aggressive:

100ms polling

Prefer a controlled strategy appropriate to backend job processing.

73. AI Result Rendering Performance

Large AI responses should be rendered efficiently.

For long interview kits or insight reports:

Section rendering
Collapsible sections
Lazy rendering where appropriate

may be used.

74. Navigation Performance

Route transitions should avoid unnecessary full-page reloads.

Use client-side navigation where supported.

The app shell should remain mounted where possible.

75. App Shell Performance

The following should load early:

Authentication state
Navigation
Basic layout
Current user

Heavy feature modules should load when needed.

76. Loading UX

Performance is also perceived performance.

Use:

Skeletons
Progress indicators
Optimistic UI where safe
Immediate button feedback
Streaming where supported

Do not show a blank screen while waiting for data.

77. Optimistic Updates

Optimistic updates may be used for low-risk actions.

Good candidates:

Toggle setting
Mark notification read
Simple UI preference

Use caution for business-critical operations:

Hiring state
Offer state
Application stage
Interview status

These should normally wait for backend confirmation.

78. Network Failure UX

When network connectivity fails:

Show clear error
Preserve user input where possible
Allow retry
Avoid duplicate requests

Do not silently discard form input.

79. Offline Behavior

Full offline ATS functionality is not required unless explicitly introduced later.

However, the application should fail gracefully when offline.

Example:

You're offline.

Reconnect to continue.
80. Performance Monitoring

Production performance should eventually monitor:

Page load
Route transition
API latency
Frontend errors
Large bundle detection
Core Web Vitals

Monitoring must avoid collecting sensitive candidate or AI data.

81. Core Web Vitals

The frontend should monitor appropriate Web Vitals, including:

LCP
INP
CLS

Targets should follow modern web performance guidance and be refined using real production measurements.

82. Bundle Analysis

A bundle analyzer should be used during optimization to identify:

Large dependencies
Duplicate dependencies
Unused libraries
Heavy charting packages
Large PDF libraries

Do not optimize blindly.

83. Dependency Optimization

Before adding a dependency, evaluate:

Bundle size
Maintenance
Security
Browser compatibility
Feature overlap
License

Avoid adding a large dependency for a small feature that can be implemented with existing tooling.

84. Performance Regression Testing

Performance regressions should be detected before release when practical.

Monitor:

Bundle size
Initial load
Largest routes
Large tables
Dashboard rendering
AI pages
85. Security + Performance Tradeoffs

Security takes priority over minor performance gains.

Do not:

Disable authentication
Expose sensitive data
Skip authorization
Cache private data incorrectly
Remove validation

for performance.

86. Security + Performance Checklist

Before frontend release:

[ ] HTTPS configured
[ ] Authentication flow verified
[ ] Logout clears protected state
[ ] 401 handling verified
[ ] 403 handling verified
[ ] RBAC verified
[ ] Protected routes verified
[ ] No secrets in frontend bundle
[ ] No tokens in logs
[ ] No sensitive data in URLs
[ ] AI output safely rendered
[ ] File uploads safely handled
[ ] Production console cleaned
[ ] Dependency audit completed
[ ] API caching reviewed
[ ] Query invalidation verified
[ ] Large lists paginated
[ ] Search debounced
[ ] Duplicate requests prevented
[ ] Heavy modules lazy-loaded
[ ] Bundle analyzed
[ ] Responsive performance checked
[ ] Production error monitoring reviewed
87. Production Performance Checklist
[ ] Initial bundle reviewed
[ ] Route-level code splitting implemented
[ ] Heavy libraries lazy-loaded
[ ] Images optimized
[ ] Fonts optimized
[ ] Large tables optimized
[ ] Server-side pagination enabled
[ ] Server-side filtering enabled
[ ] Server-side sorting enabled
[ ] Search debouncing enabled
[ ] Duplicate API requests minimized
[ ] Query caching configured
[ ] Query invalidation verified
[ ] AI operations protected from duplicate execution
[ ] Dashboard API usage optimized
[ ] Charts optimized
[ ] PDF rendering optimized
[ ] Core Web Vitals monitored
88. Production Security Checklist
[ ] No secrets committed
[ ] No production credentials in frontend
[ ] No tokens logged
[ ] No sensitive data logged
[ ] No unsafe HTML rendering
[ ] AI output treated as untrusted
[ ] File uploads validated client-side
[ ] Backend validation remains authoritative
[ ] Route protection implemented
[ ] RBAC implemented
[ ] Protected query cache cleared on logout
[ ] Tenant/user context changes invalidate protected state
[ ] HTTPS enforced
[ ] Security headers configured at deployment
[ ] CSP reviewed where applicable
[ ] Third-party scripts reviewed
[ ] Dependency vulnerabilities reviewed
89. Definition of Done

Frontend security and performance architecture is complete when:

 Authentication security defined
 Token strategy defined
 Logout behavior defined
 Route protection defined
 RBAC strategy defined
 API security defined
 XSS strategy defined
 CSRF strategy aligned with backend
 AI output safety defined
 File upload security defined
 Environment variable strategy defined
 Secret handling defined
 Logging policy defined
 Dependency security defined
 Performance architecture defined
 Code splitting strategy defined
 Lazy loading strategy defined
 API caching strategy defined
 Large dataset strategy defined
 Search optimization defined
 Dashboard optimization defined
 AI performance strategy defined
 Bundle optimization defined
 Performance monitoring defined
 Production security checklist defined
 Production performance checklist defined
90. Final Architecture Principle

HireStack frontend performance and security must follow:

                    FRONTEND
                       │
          ┌────────────┴────────────┐
          │                         │
       SECURITY                 PERFORMANCE
          │                         │
    ┌─────┴─────┐             ┌─────┴─────┐
    │           │             │           │
  Auth        RBAC         Rendering    Network
    │           │             │           │
  Tokens     Routes       Components    API
    │           │             │           │
    └─────┬─────┘             └─────┬─────┘
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
                  API CLIENT
                       │
                       ▼
                  BACKEND API
                       │
          ┌────────────┴────────────┐
          │                         │
   Authorization             Business Rules
   Tenant Isolation          Validation
   Data Security             Database

The frontend must remain:

Secure
+
Fast
+
Responsive
+
Accessible
+
Observable
+
Maintainable

without compromising backend security or correctness.

This document establishes the security and performance baseline that every Phase 3 frontend feature must follow.