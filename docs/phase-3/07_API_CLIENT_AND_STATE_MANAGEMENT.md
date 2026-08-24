# HireStack ATS — API Client & State Management

**Phase:** 3 — Frontend  
**Document:** 07  
**Status:** Planned  
**Version:** 1.0.0

---

## 1. Purpose

This document defines the frontend data-access and state-management architecture for HireStack ATS.

The objective is to establish one consistent way for React components to communicate with the HireStack backend.

This document covers:

- Central API client
- Environment configuration
- Authentication integration
- Request/response handling
- Error normalization
- API service organization
- Server-state management
- Client-state management
- Query caching
- Query invalidation
- Mutation handling
- Pagination
- Filtering
- Sorting
- Search
- AI API integration
- File uploads
- Logout/cache cleanup
- Type safety
- Loading and error states
- Performance and security requirements

The frontend must not implement business logic that belongs to the backend.

---

# 2. Core Architecture

All frontend backend communication must follow this architecture:

```text
React Component
      ↓
Feature Hook
      ↓
Feature API Service
      ↓
Central API Client
      ↓
HTTP
      ↓
HireStack Backend

Example:

CandidateListPage
      ↓
useCandidates()
      ↓
candidateApi.list()
      ↓
apiClient.get()
      ↓
GET /api/v1/candidates

Components should never contain repeated raw HTTP calls.

3. State Categories

Frontend state is divided into three major categories.

Frontend State
│
├── Server State
│   ├── Candidates
│   ├── Jobs
│   ├── Applications
│   ├── Interviews
│   ├── Offers
│   ├── AI evaluations
│   └── Dashboard data
│
├── Client/UI State
│   ├── Sidebar open/closed
│   ├── Modal visibility
│   ├── Selected tabs
│   ├── Form state
│   └── UI preferences
│
└── Authentication State
    ├── Current user
    ├── Authentication status
    └── Session information

These states should not be mixed unnecessarily.

4. Server State

Server state represents data owned by the backend.

Examples:

Candidate records
Job records
Application records
Interview records
Offer records
Recruiter records
Department records
AI evaluations
Dashboard statistics
Reports

Server state should be managed through a dedicated server-state solution.

The preferred architecture is React Query / TanStack Query or the equivalent selected during implementation.

5. Client State

Client state represents temporary UI state.

Examples:

Sidebar collapsed
Modal open
Selected candidate
Active tab
Filter drawer open
Theme preference
Current form step

Client state should not be persisted to the backend unless explicitly required.

6. Authentication State

Authentication state must be managed separately from general application data.

Conceptually:

AuthProvider
    ↓
Authentication State
    ├── isAuthenticated
    ├── currentUser
    └── session status

The authentication implementation must follow:

04_AUTHENTICATION_AND_RBAC.md

Do not create a second authentication mechanism in the API layer.

7. Recommended Folder Structure

The frontend data layer should follow a feature-oriented structure.

src/
├── api/
│   ├── client.ts
│   ├── errors.ts
│   ├── types.ts
│   └── interceptors.ts
│
├── hooks/
│   └── api/
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── queries/
│   │
│   ├── candidates/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── queries/
│   │
│   ├── jobs/
│   ├── applications/
│   ├── interviews/
│   ├── offers/
│   ├── recruiters/
│   ├── departments/
│   ├── ai/
│   ├── reports/
│   └── dashboards/
│
└── state/
    ├── auth/
    └── ui/

The exact directory names may be adjusted to match the frontend project structure, but the separation of responsibilities must remain.

8. Central API Client

All HTTP requests must pass through one centralized API client.

Recommended:

src/api/client.ts

Responsibilities:

Base URL
Default headers
Authentication integration
Request serialization
Response parsing
Error normalization
Timeout configuration
Request cancellation
Common request behavior

Example conceptual API:

apiClient.get<T>()
apiClient.post<T>()
apiClient.put<T>()
apiClient.patch<T>()
apiClient.delete<T>()
9. No Direct HTTP Calls in Components

Do not write:

fetch("/api/v1/jobs")

inside React components.

Do not write:

axios.get(...)

inside pages.

Instead:

Component
   ↓
Hook
   ↓
API service
   ↓
apiClient

This keeps HTTP behavior centralized and testable.

10. Environment Configuration

Backend API configuration must come from environment variables.

Example:

VITE_API_BASE_URL=http://localhost:5000/api/v1

Production:

VITE_API_BASE_URL=https://api.example.com/api/v1

Do not hard-code production URLs in source code.

11. Environment Separation

At minimum:

.env
.env.development
.env.production

Sensitive secrets must never be stored in frontend environment variables.

Frontend environment variables are public after the application is built.

Never put:

DATABASE_PASSWORD
JWT_SECRET
API_PRIVATE_KEY
OLLAMA_SECRET

in frontend environment configuration.

12. Base URL

The API client should use one configured base URL.

Example:

VITE_API_BASE_URL
        ↓
apiClient
        ↓
/auth
/candidates
/jobs
/applications
/ai

Feature services should not independently define backend host URLs.

13. Request Headers

Standard requests should include:

Content-Type: application/json

where appropriate.

Authentication headers must be attached according to the authentication strategy defined in the authentication architecture.

For bearer authentication:

Authorization: Bearer <token>

The exact token-storage and refresh strategy must follow 04_AUTHENTICATION_AND_RBAC.md.

14. Authentication Integration

The API client should obtain authentication information from the centralized authentication layer.

Conceptually:

API Request
    ↓
Auth State
    ↓
Authentication Credential
    ↓
Request Header

Do not duplicate token management across individual feature services.

15. Request Interceptor

If the selected HTTP library supports interceptors, request processing should occur centrally.

Responsibilities may include:

Adding authentication headers
Adding request IDs if required
Adding content headers
Normalizing request configuration

Do not place business logic in the interceptor.

16. Response Interceptor

Response handling should be centralized.

The response layer should identify:

2xx
4xx
5xx

and convert backend responses into predictable frontend structures.

17. Error Normalization

Create a standardized frontend error type.

Conceptual:

interface ApiError {
  status: number;
  code?: string;
  message: string;
  fieldErrors?: Record<string, string>;
  details?: unknown;
}

The UI should consume normalized errors rather than raw HTTP-library exceptions.

18. HTTP Error Mapping

Recommended behavior:

Status	Meaning	Frontend handling
400	Bad request	Show normalized error
401	Unauthorized	Authentication/session handling
403	Forbidden	Forbidden UI
404	Not found	Not-found UI
409	Conflict	Business conflict message
422	Validation	Field-level errors
429	Rate limited	Retry/wait message
500	Server error	Generic server error
503	Service unavailable	Service unavailable message
19. 401 Handling

A 401 response indicates that authentication is unavailable or invalid.

The centralized API layer should:

401
 ↓
Authentication Handler
 ↓
Attempt supported session/refresh handling
 ↓
If authentication cannot be restored
 ↓
Clear auth state
 ↓
Redirect to /login

The exact refresh behavior must match the authentication design.

Do not implement an independent token refresh mechanism here.

20. 403 Handling

A 403 response means:

Authenticated
+
Not Authorized

The API client should normalize the error.

The routing/UI layer should then display:

Access Denied

Do not automatically redirect every 403 to login.

21. 404 Handling

The API layer should return a normalized not-found error.

The feature/page decides whether to render:

Candidate Not Found

or:

Job Not Found

or another appropriate resource-specific state.

22. Validation Errors

Backend validation responses should be mapped into field errors where possible.

Example:

{
  "status": 422,
  "errors": {
    "title": "Title is required",
    "location": "Invalid location"
  }
}

The frontend form should map these to the corresponding fields.

23. React Query / Server-State Strategy

Server data should use a centralized query system.

Recommended:

TanStack Query

Conceptually:

useCandidates()
        ↓
Query Cache
        ↓
candidateApi.list()
        ↓
apiClient

Benefits:

Caching
Request deduplication
Background refetching
Mutation invalidation
Loading states
Error states
Pagination
Query cancellation
24. Query Key Architecture

Query keys must be deterministic.

Example:

["candidates", companyId, filters]

Job:

["jobs", companyId, filters]

Candidate detail:

["candidate", companyId, candidateId]

AI evaluation:

["ai", "ats-score", companyId, candidateId, jobId]
25. User and Tenant Cache Isolation

Client-side caches must not leak data between users or companies.

Query keys should include the relevant identity context where appropriate.

Example:

Company A
["jobs", "company-A"]

Company B
["jobs", "company-B"]

When the authenticated identity changes, authenticated query state must be cleared or correctly invalidated.

26. Logout Cache Cleanup

Logout must clear user-specific server state.

Conceptually:

Logout
 ↓
Clear auth state
 ↓
Clear query cache
 ↓
Redirect to login

This prevents:

User A logs out
        ↓
User B logs in
        ↓
User A's cached data appears
27. Query Defaults

Global query defaults should be conservative.

Recommended principles:

Do not aggressively refetch every request.
Cache data where appropriate.
Refetch stale data when needed.
Retry only safe/read operations by default.
Do not automatically retry authorization failures.
Do not automatically retry validation failures.

AI operations require special handling described later in this document.

28. Query Retry Policy

Recommended:

Network failure
    ↓
Limited retry

401
    ↓
No generic retry

403
    ↓
No retry

404
    ↓
No retry

422
    ↓
No retry

429
    ↓
Controlled retry if server provides appropriate retry information

500/503
    ↓
Limited retry

The frontend retry policy must not conflict with backend Stage 8 AI retry behavior.

29. Important AI Retry Rule

Phase 2 introduced backend AI optimization with:

Retry
Timeout
Cache
Deduplication

Therefore:

The frontend must not implement aggressive duplicate retries for AI generation operations.

Otherwise:

Frontend retry
       +
Backend retry
       +
User clicking again
       =
Excessive AI requests

AI mutations should be carefully controlled.

30. Mutations

Create/update/delete operations should use mutations.

Examples:

createCandidate
updateCandidate
deleteCandidate

createJob
updateJob
publishJob

createInterview
updateInterview

generateATSScore
generateJobMatch
generateRecommendation
generateInterviewAssistant
generateAIInsights
31. Mutation Flow

Recommended:

User Action
    ↓
Mutation
    ↓
API Service
    ↓
apiClient
    ↓
Backend
    ↓
Success / Error
    ↓
Invalidate affected queries
32. Query Invalidation

After a mutation, only affected queries should be invalidated.

Example:

Create Job
    ↓
Invalidate:
["jobs", companyId]
["dashboard", companyId]

Do not invalidate the entire application cache unnecessarily.

33. Candidate Mutation Example
Update Candidate
       ↓
PATCH /candidates/:id
       ↓
Success
       ↓
Invalidate:
["candidate", companyId, candidateId]
["candidates", companyId, filters]
34. Job Mutation Example
Publish Job
       ↓
PATCH /jobs/:id
       ↓
Success
       ↓
Invalidate:
["job", companyId, jobId]
["jobs", companyId, filters]
["dashboard", companyId]
35. Delete Operations

Deletion mutations must handle backend behavior correctly.

The frontend must not assume that a resource has been deleted simply because a button was clicked.

Correct flow:

Delete
 ↓
Backend
 ↓
Success
 ↓
Invalidate / update cache

If the backend rejects deletion:

Delete
 ↓
Backend
 ↓
409 / 403 / 422
 ↓
Keep resource visible
 ↓
Show normalized error
36. Pagination State

List pages should keep pagination state separate from resource data.

Example:

/app/candidates?page=2&limit=20

Query key:

["candidates", companyId, {
  page: 2,
  limit: 20
}]

The backend remains responsible for pagination correctness.

37. Filtering

Filters should be represented as structured query parameters.

Example:

/app/jobs?
status=PUBLISHED
&departmentId=123
&page=1

Do not create separate API methods for every filter combination.

Prefer:

jobApi.list(filters)
38. Sorting

Sorting should be represented explicitly.

Example:

sort=createdAt
order=desc

Query key must include sorting state.

["jobs", companyId, {
  page,
  filters,
  sort,
  order
}]

Changing sorting should create a new query state.

39. Search

Search should use the backend search functionality.

Example:

GET /candidates?search=john

Do not load the entire candidate database into the browser and filter locally.

Server-side search is required for scalable datasets.

40. Search Debouncing

Search inputs should use controlled debouncing.

Example:

User types:
J
Jo
Joh
John

Frontend waits briefly

GET /candidates?search=John

This prevents excessive API requests.

41. URL State

Where appropriate, list state should be reflected in the URL.

Examples:

?page=2
?search=john
?status=ACTIVE
?sort=createdAt

Benefits:

Refresh persistence
Shareable URLs
Browser history
Deep linking
42. Form State

Form state should remain local to the form unless there is a strong reason otherwise.

Examples:

Candidate form
Job form
Interview form
Offer form
Settings form

Do not put every form field into global state.

43. Modal State

Modal visibility is UI state.

Examples:

isDeleteModalOpen
isCreateJobModalOpen
isAssignRecruiterModalOpen

This should remain local to the relevant feature/page where possible.

44. Global UI State

Global state should be limited to genuinely global concerns.

Examples:

Sidebar state
Global notification state
Authentication state
Theme/preferences if required

Do not create global state for every server resource.

45. API Service Structure

Each feature should have a dedicated API service.

Example:

src/features/candidates/api/candidate.api.ts
src/features/jobs/api/job.api.ts
src/features/applications/api/application.api.ts
src/features/interviews/api/interview.api.ts
src/features/offers/api/offer.api.ts

AI:

src/features/ai/api/
├── ats-score.api.ts
├── job-matching.api.ts
├── recommendations.api.ts
├── interview-assistant.api.ts
└── insights.api.ts
46. API Service Responsibilities

API services should:

Define backend endpoint calls
Pass typed parameters
Return typed responses
Use the centralized API client
Remain free from React-specific state

API services should not:

Render UI
Display toast messages
Manipulate components
Perform authorization decisions
47. Feature Hooks

Hooks connect API services to React components.

Example:

useCandidates()
useCandidate(id)

useJobs()
useJob(id)

useApplications()
useApplication(id)

AI:

useATSScore()
useJobMatching()
useRecommendations()
useInterviewAssistant()
useAIInsights()
48. Query Hook Pattern

Conceptual:

Component
    ↓
useCandidates()
    ↓
Query
    ↓
candidateApi.list()
    ↓
apiClient

The component should receive:

data
isLoading
isFetching
error
refetch

rather than manually managing request state.

49. Mutation Hook Pattern

Conceptual:

Component
    ↓
useCreateJob()
    ↓
Mutation
    ↓
jobApi.create()
    ↓
apiClient

The hook handles:

Loading state
Success
Error
Cache invalidation
50. Type Safety

API services and hooks must use TypeScript types.

Example:

interface Candidate {
  id: string;
  name: string;
  email: string;
}

Avoid:

any

for API responses.

If backend response types are generated or shared, use the project's selected strategy consistently.

51. Backend Contract Alignment

The frontend API layer must follow the backend contracts.

Do not invent endpoints.

For example, if backend provides:

POST /api/v1/ai/interview

the frontend must call the existing endpoint.

Do not create:

POST /api/v1/ai/interview/generate

unless the backend actually supports it.

52. API Response Envelope

If the backend uses a standard response envelope, the API client should normalize it consistently.

Conceptual:

{
  "success": true,
  "data": {},
  "message": "..."
}

The feature service should expose the useful data to the hook rather than forcing every component to understand the transport envelope.

53. API Error Envelope

If backend errors follow a standard format, normalize them once.

Example:

{
  "success": false,
  "message": "Candidate not found",
  "error": {
    "code": "NOT_FOUND"
  }
}

The frontend should convert this into:

ApiError

rather than duplicating parsing logic.

54. Request Cancellation

Long-running requests should support cancellation where appropriate.

Examples:

Search requests
Navigation-away requests
Large list requests
AI requests where cancellation is safely supported

Use:

AbortController

or the equivalent HTTP-library mechanism.

Cancellation must not leave UI state permanently stuck in loading.

55. AI API Architecture

AI APIs follow:

AI Page
   ↓
AI Hook
   ↓
AI Feature API
   ↓
Central API Client
   ↓
Phase 2 AI Backend

The frontend must not call Ollama or any LLM provider directly.

56. AI Generation Flow

Example:

User
 ↓
Generate ATS Score
 ↓
Frontend mutation
 ↓
POST /api/v1/ai/ats-score
 ↓
Backend AI Optimization
 ├── Cache
 ├── Deduplication
 ├── Retry
 └── LLM
 ↓
Response
 ↓
Frontend
 ↓
Display result
57. AI Loading State

AI generation may take longer than normal CRUD requests.

Use a dedicated state:

Generating AI analysis...

This may take a few moments.

Avoid showing an indefinite spinner with no context.

58. AI Failure State

Example:

AI analysis could not be completed.

Please try again.

Do not expose:

Ollama connection refused

or:

LLM timeout after 60000ms

unless explicitly intended for an internal administrative interface.

59. AI Duplicate Submission Protection

The frontend should disable or protect generation actions while a request is active.

Example:

[ Generating... ]

instead of:

[ Generate ]
[ Generate ]
[ Generate ]

This complements backend request deduplication.

It does not replace it.

60. AI Result Caching

Frontend query caching may cache AI result retrieval.

However, frontend caching must not replace backend AI caching.

The backend remains the source of truth for:

AI cache identity
Tenant isolation
Prompt version
Model
Temperature
Evaluation validity
61. AI History Queries

AI history should be represented as server state.

Example:

["ai", "insights", "history", companyId, candidateId]

When a new AI evaluation is created:

Generate
 ↓
Success
 ↓
Invalidate history query
62. AI Detail Queries

AI details should use stable query keys.

Example:

[
  "ai",
  "insights",
  "detail",
  companyId,
  insightId
]

The frontend must not assume the detail belongs to the current company.

The backend must authorize it.

63. AI Mutation Error Handling

AI generation failures should:

Stop loading state.
Preserve the existing page state.
Display a user-friendly error.
Avoid inserting fake results.
Avoid invalidating unrelated resources.
64. File Upload Architecture

File uploads should use the API client.

Example:

Resume Upload
    ↓
FormData
    ↓
candidateApi.uploadResume()
    ↓
apiClient
    ↓
Backend

Do not convert files into huge JSON strings unless the backend explicitly requires it.

65. Multipart Requests

For multipart uploads:

Content-Type: multipart/form-data

The HTTP client should allow the browser/runtime to set the appropriate boundary.

Do not manually hard-code multipart boundaries.

66. Upload Progress

If supported by the HTTP client, upload progress may be exposed through:

0%
25%
50%
75%
100%

UI:

Uploading resume...

████████████░░░░ 75%

The progress indicator must not imply backend processing completion.

67. File Upload Errors

Possible states:

Invalid file type
File too large
Upload failed
Authentication expired
Permission denied
Server unavailable

Each should use normalized errors.

68. Dashboard API State

Dashboard data should use the same server-state architecture.

Example:

useCompanyDashboard()
useRecruiterDashboard()
useCandidateDashboard()
useSuperAdminDashboard()

Each hook should use centralized API services.

69. Dashboard Query Keys

Example:

["dashboard", "company", companyId]
["dashboard", "recruiter", companyId, recruiterId]
["dashboard", "candidate", candidateId]
["dashboard", "platform"]

Super Admin dashboard data must not accidentally share cache keys with company dashboards.

70. Prefetching

Prefetching may be used for predictable navigation.

Example:

Candidate List
      ↓
Hover candidate
      ↓
Prefetch candidate details
      ↓
Open candidate
      ↓
Details available faster

Do not prefetch large or sensitive datasets unnecessarily.

71. Optimistic Updates

Optimistic updates may be used only where the state transition is simple and reversible.

Good candidates:

Toggle UI preference
Mark notification read

Use caution for:

Job publishing
Application status transitions
Offers
Interviews
Candidate deletion
AI generation

These should generally wait for backend confirmation.

72. Business State Machines

The frontend must not independently implement backend state-machine rules.

For example:

APPLICATION
APPLIED
SCREENING
INTERVIEW
OFFER
HIRED
REJECTED

The backend determines whether a transition is valid.

Frontend should:

Request transition
      ↓
Backend validates
      ↓
Success / Conflict
73. Stale Data

The UI should distinguish:

isLoading

from:

isFetching

Initial load:

Loading candidates...

Background refresh:

Existing data
+
small refresh indicator

Do not replace valid existing content with a blank loading screen during every refetch.

74. Offline Behavior

The application should not assume full offline functionality unless explicitly required.

At minimum, network failures should produce a controlled message:

Unable to connect to the server.

Check your connection and try again.

Do not silently display stale sensitive recruitment data as if it were current.

75. Global Notifications

Success/error notifications should be centralized.

Examples:

Candidate created successfully.
Job published successfully.
Interview updated successfully.

Errors:

Unable to create candidate.

The API service should not directly invoke UI notifications.

The hook/page layer should decide when user-facing notifications are appropriate.

76. Logging

Frontend logging must not expose sensitive information.

Never log:

Access tokens
Refresh tokens
Passwords
Resume text
Candidate private information
Full AI prompts
Full AI responses
Backend secrets

Development logging may be more verbose but must still avoid secrets.

77. API Request IDs

If the backend supports request IDs/correlation IDs, the frontend may preserve them for debugging.

Example:

Request ID: abc123

This should be useful for support/debugging without exposing sensitive data.

78. Performance Requirements

The API/state layer should:

Avoid duplicate requests
Cache appropriate data
Deduplicate concurrent queries
Cancel obsolete searches
Debounce search
Avoid unnecessary invalidation
Lazy-load large features
Avoid loading entire datasets
Paginate large lists
79. Security Requirements

The API/state layer must:

Never expose secrets
Never trust client-side authorization
Never bypass backend permissions
Clear user-specific cache on logout
Avoid cross-user cache reuse
Avoid cross-company cache reuse
Avoid persisting sensitive data unnecessarily
Never call AI providers directly
80. Request Lifecycle

Standard request lifecycle:

Component
   ↓
Hook
   ↓
API Service
   ↓
API Client
   ↓
Request Interceptor
   ↓
HTTP
   ↓
Backend
   ↓
Response
   ↓
Response Normalizer
   ↓
Hook
   ↓
Component

Error:

Backend
   ↓
HTTP Error
   ↓
Response Normalizer
   ↓
ApiError
   ↓
Hook
   ↓
UI
81. Recommended API Layer
src/
└── api/
    ├── client.ts
    ├── errors.ts
    ├── interceptors.ts
    ├── types.ts
    └── index.ts
82. Recommended Feature API Layer
src/features/
├── candidates/
│   ├── api/
│   │   └── candidate.api.ts
│   └── hooks/
│       ├── useCandidates.ts
│       ├── useCandidate.ts
│       ├── useCreateCandidate.ts
│       └── useUpdateCandidate.ts
│
├── jobs/
│   ├── api/
│   │   └── job.api.ts
│   └── hooks/
│
├── applications/
│   ├── api/
│   └── hooks/
│
├── interviews/
│   ├── api/
│   └── hooks/
│
├── offers/
│   ├── api/
│   └── hooks/
│
└── ai/
    ├── api/
    │   ├── ats-score.api.ts
    │   ├── job-matching.api.ts
    │   ├── recommendations.api.ts
    │   ├── interview-assistant.api.ts
    │   └── insights.api.ts
    │
    └── hooks/
        ├── useATSScore.ts
        ├── useJobMatching.ts
        ├── useRecommendations.ts
        ├── useInterviewAssistant.ts
        └── useAIInsights.ts
83. Recommended State Layer
src/
└── state/
    ├── auth/
    │   ├── auth.store.ts
    │   └── auth.types.ts
    │
    └── ui/
        ├── ui.store.ts
        └── ui.types.ts

Do not create stores for every backend entity.

Server data belongs in server-state management.

84. API Contract Testing

API services should eventually be tested for:

Correct endpoint
Correct HTTP method
Correct parameters
Correct request body
Correct response parsing
Correct error normalization

Feature hooks should be tested for:

Loading state
Success state
Error state
Cache invalidation
Mutation behavior
85. Integration Testing

The frontend integration layer should verify:

Authentication
     ↓
API Client
     ↓
Backend
     ↓
Response
     ↓
Query Cache
     ↓
UI

Important scenarios:

Login
Logout
Expired authentication
Candidate list
Candidate details
Job list
Job details
Application list
Interview list
AI generation
AI history
File upload
Permission denial
Cross-company denial
86. Definition of Done

The API Client & State Management stage is complete when:

API Client
 Central API client implemented
 Base URL configured through environment
 Request handling centralized
 Response handling centralized
 Error normalization implemented
 Authentication integration implemented
 Request cancellation supported where required
Authentication
 401 handling implemented
 Session expiration handled
 Logout clears authentication state
 Logout clears user-specific query/cache state
Server State
 Query library configured
 Query keys standardized
 Cache isolation implemented
 Query invalidation implemented
 Mutation handling implemented
 Pagination supported
 Filtering supported
 Sorting supported
 Search supported
Client State
 UI state separated from server state
 Global state kept minimal
 Form state remains local where appropriate
 Modal state remains local where appropriate
AI
 All AI APIs use central API client
 AI generation mutations protected against duplicate clicks
 AI loading states implemented
 AI error states implemented
 AI history queries implemented
 AI detail queries implemented
 Frontend does not call LLM providers directly
 Frontend does not duplicate backend retry logic
Files
 File upload uses centralized API client
 Multipart requests supported
 Upload errors normalized
 Sensitive file data not logged
Security
 No secrets exposed
 No raw tokens logged
 No PII logged unnecessarily
 No cross-user cache leakage
 No cross-company cache leakage
 Backend remains authorization authority
Quality
 TypeScript passes
 ESLint passes
 Production build passes
 API layer tests pass
 Authentication tests pass
 Query/mutation tests pass
 AI integration tests pass
87. Final Architecture

The completed frontend data architecture should be:

                         React Application
                                │
                                ▼
                         Feature Component
                                │
                                ▼
                           Feature Hook
                                │
                    ┌───────────┴───────────┐
                    │                       │
               Query / Mutation          UI State
                    │                       │
                    ▼                       ▼
              Feature API              UI Store
                    │
                    ▼
              Central API Client
                    │
          ┌─────────┴──────────┐
          │                    │
    Request Handler       Response Handler
          │                    │
          └─────────┬──────────┘
                    │
                    ▼
              HireStack API
                    │
                    ▼
            Backend Authorization
                    │
                    ▼
                Database
88. Final Principles

The frontend data layer must follow these rules:

Rule 1

One centralized API client.

Rule 2

Feature API services own endpoint definitions.

Rule 3

Hooks connect API services to React.

Rule 4

Server state belongs in server-state management.

Rule 5

UI state belongs in client state.

Rule 6

Authentication state is handled centrally.

Rule 7

The backend remains the authorization authority.

Rule 8

AI requests must not be aggressively retried by the frontend.

Rule 9

User/company identity must be respected by client-side caching.

Rule 10

Logout must clear user-specific cached data.

Rule 11

No feature should bypass the central API client.

Rule 12

No frontend code should directly communicate with Ollama or another LLM provider.

89. Final Data Flow
                    USER ACTION
                         │
                         ▼
                  React Component
                         │
                         ▼
                    Feature Hook
                         │
                 ┌───────┴────────┐
                 │                │
              Query           Mutation
                 │                │
                 └───────┬────────┘
                         ▼
                   Feature API
                         │
                         ▼
                  Central API Client
                         │
                         ▼
                  HireStack Backend
                         │
              ┌──────────┴──────────┐
              │                     │
        Authorization          Business Logic
              │                     │
              └──────────┬──────────┘
                         ▼
                       Data
                         │
                         ▼
                  API Response
                         │
                         ▼
                   Query Cache
                         │
                         ▼
                  React Component
                         │
                         ▼
                         UI

The frontend should remain a consumer of the HireStack backend, not a second backend.