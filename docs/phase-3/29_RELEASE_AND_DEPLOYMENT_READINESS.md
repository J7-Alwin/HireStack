# HireStack ATS — Stage 11: Release Preparation, Deployment Readiness & Final Product Smoke QA

**Document ID:** `29_RELEASE_AND_DEPLOYMENT_READINESS.md`  
**Phase:** Phase 3 — Frontend Implementation  
**Stage:** Stage 11 — Release Preparation & Deployment Readiness  
**Target Application:** HireStack Applicant Tracking System (ATS)  
**Branch:** `feature/frontend-foundation`  
**Status:** PASS  

---

## 1. Release Overview

Stage 11 represents the final release readiness and deployment qualification gate for the HireStack ATS frontend. The application is built on React 19, TypeScript, and Vite 8, backed by TanStack React Query v5, Zustand state management, and a centralized `ApiClient` architecture.

This stage establishes that:
- The frontend codebase is production-ready, type-safe, linted, and fully tested.
- Zero backend files were modified; backend REST OpenAPI contracts remain authoritative.
- Environment variables are isolated, validated, and free of sensitive server-side secrets.
- Single-page application (SPA) client-side routing fallback requirements are documented.
- All core ATS workflows (Candidates → Jobs → Applications → Interviews → Offers → Pipeline → Dashboards) and 7 AI capabilities have passed automated and smoke validation.
- The build produces optimized chunks with zero bundle warnings.

---

## 2. Current Branch & Git State

- **Active Branch:** `feature/frontend-foundation`
- **Git State:** Clean working tree. No reset, rebase, branch creation, merge, or force push operations performed.
- **Git History Integrity:** Preserved without alteration.

---

## 3. Current Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                   │
│   (AppShell, Router, ProtectedRoute, ErrorBoundary)    │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌────────────────────────┐  ┌────────────────────────────┐
│      Zustand Store     │  │    TanStack React Query    │
│  (Auth, UI, Modals)    │  │ (Cache, Targeted Mutations)│
└────────────┬───────────┘  └────────────┬───────────────┘
             │                           │
             └─────────────┬─────────────┘
                           ▼
              ┌────────────────────────┐
              │  Centralized ApiClient │
              │(Tokens, Timeout, Errs) │
              └────────────┬───────────┘
                           ▼
              ┌────────────────────────┐
              │    Backend REST API    │
              │ (Authoritative Server) │
              └────────────────────────┘
```

- **Runtime Core:** React 19 SPA with React Router v7 (`createBrowserRouter`).
- **Data Fetching:** TanStack React Query v5 with targeted invalidation and automated query cache clearing on session teardown.
- **Client State:** Zustand (`useAuthStore` for session state; `useUiStore` for sidebar/notifications).
- **Design System:** Custom CSS design system using native CSS variables, typography tokens, glassmorphism accents, and accessible dialogs.
- **API Gateway:** Centralized [ApiClient](file:///c:/Projects/HireStack/frontend/src/services/api/api-client.ts) managing Bearer authentication headers, timeout aborts, request IDs, and normalized [ApiError](file:///c:/Projects/HireStack/frontend/src/services/api/api-error.ts) handling.

---

## 4. Environment Variables

| Variable | Scope | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Client (Browser) | Yes | Base URL of the HireStack backend REST API | `https://api.hirestack.io/api/v1` |

> [!IMPORTANT]
> Because `VITE_*` variables are embedded into the client bundle at build time, **never** place server-only secrets (such as JWT signing secrets, database credentials, AI provider keys, or OAuth client secrets) into frontend environment files.

- Configuration is strongly typed and validated in [env.ts](file:///c:/Projects/HireStack/frontend/src/config/env.ts).
- Default `.env.example` provides clean, non-sensitive configuration placeholders.

---

## 5. Production Build Instructions

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Step-by-Step Build Commands
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm ci

# 3. Validate TypeScript type safety
npm run type-check

# 4. Run Oxlint static analysis
npm run lint

# 5. Run full Vitest regression suite
npm run test -- --run

# 6. Execute Vite production build
npm run build
```

### Build Output Distribution
The production artifacts are written to `frontend/dist/`:
- `dist/index.html`: Main HTML entrypoint (0.82 kB)
- `dist/assets/index-*.css`: Consolidated design system styles (5.28 kB)
- `dist/assets/vendor-react-*.js`: React, ReactDOM, React Router (~305 kB / 97 kB gzip)
- `dist/assets/vendor-query-*.js`: TanStack Query (~32 kB / 9 kB gzip)
- `dist/assets/index-*.js`: Application code & UI components (~385 kB / 72 kB gzip)

---

## 6. SPA Routing Requirements

The HireStack frontend is a client-side single-page application using HTML5 `pushState` routing. When deploying to any production static file host, reverse proxy, or CDN:

> [!CAUTION]
> All incoming browser requests for non-file paths (such as `/login`, `/app`, `/app/candidates`, `/app/jobs/123`, `/app/pipeline`) **must** be rewritten to return `/index.html` with an HTTP 200 status. Failure to configure this fallback will result in HTTP 404 errors on browser page reloads or direct link sharing.

### Example Server Rewrite Configurations:

#### Nginx
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Caddy
```caddy
try_files {path} /index.html
```

#### Netlify (`_redirects`)
```text
/*    /index.html   200
```

#### Vercel (`vercel.json`)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 7. Authentication Requirements

- **Supported Modes:** Bearer token authentication over HTTP `Authorization: Bearer <token>`.
- **Token Storage:** In-memory with `localStorage` persistence managed strictly via [auth-token.storage.ts](file:///c:/Projects/HireStack/frontend/src/services/auth/auth-token.storage.ts).
- **Session Expiration:** When an API request receives HTTP `401 Unauthorized`, `tokenProvider.onUnauthorized()` automatically clears tokens, purges the TanStack Query cache, and transitions the auth store to `UNAUTHENTICATED`.
- **Protected Route Guards:** Unauthenticated users attempting to access `/app/*` routes are redirected to `/login` with return destination tracking (`state.returnTo`).

---

## 8. Backend / API Requirements

- Backend must expose REST API endpoints conforming to the verified Swagger/OpenAPI specification under `/api/v1/*`.
- CORS must be configured on the backend server to allow `Origin`, `Authorization`, `Content-Type`, and `x-request-id` headers from the frontend domain.
- Backend authorization is authoritative; frontend role checks act as defense-in-depth UI enforcement.

---

## 9. Role & RBAC Matrix

| Feature / Route | SUPER_ADMIN | COMPANY_ADMIN | RECRUITER | CANDIDATE |
| :--- | :---: | :---: | :---: | :---: |
| `/app` Dashboard | Platform Overview | Company Pipeline KPIs | Recruiter Pipeline & Interviews | Personal Application Status |
| `/app/candidates/*` | ❌ Forbidden | ✅ Full Access | ✅ Full Access | ❌ Forbidden |
| `/app/jobs/*` | ❌ Forbidden | ✅ Full Access | ✅ Full Access | ❌ Forbidden |
| `/app/applications/*`| ❌ Forbidden | ✅ Full Access | ✅ Full Access | ❌ Forbidden |
| `/app/interviews/*` | ❌ Forbidden | ✅ Full Access | ✅ Full Access | ❌ Forbidden |
| `/app/offers/*` | ❌ Forbidden | ✅ Full Access | ✅ Full Access | ❌ Forbidden |
| `/app/pipeline` | ❌ Forbidden | ✅ Full (with Override) | ✅ Sequential Movement | ❌ Forbidden |
| AI Recruiter Modules | ❌ Forbidden | ✅ Full Access | ✅ Full Access | ❌ Forbidden |

---

## 10. ATS Workflow Smoke Checklist

- [x] **Candidate Creation & Detail:** Create candidate → view candidate detail → pre-populate into new application.
- [x] **Job Creation & Detail:** Create job requisition → view job detail → filter pipeline by `jobId` → pre-populate applicant.
- [x] **Application Management:** Create application linking candidate and job → transition stages → view status badge.
- [x] **Interview Scheduling:** Schedule interview from application detail → validate start/end time → assign interviewer.
- [x] **Offer Drafting & Revision:** Create offer with salary, currency, joining/expiry dates → view offer detail.
- [x] **Pipeline Board:** Visual Kanban board with stage columns → drag/move candidates → sequential validation vs admin override.
- [x] **Role Dashboards:** Role-specific KPI metrics, charts, tables, and quick action cards.

---

## 11. AI Workflow Smoke Checklist

- [x] **Resume Parsing:** Upload resume file or raw text → trigger parse on explicit user click → populate candidate form fields.
- [x] **ATS Compatibility Scoring:** Calculate score for candidate against job on demand → view match score, missing skills, and keywords.
- [x] **Resume Recommendations:** Generate targeted resume improvement recommendations on explicit request.
- [x] **Candidate AI Insights:** Generate structured recruiter insights on demand with strengths, risks, and interview topics.
- [x] **Job Applicant Matching:** Rank candidate applications for a requisition with granular multidimensional scores.
- [x] **Interview Assistant:** Generate role-specific interview kits, question recommendations, and scorecards on demand.
- [x] **Recruiter Workflow Intelligence:** Executive requisition summaries, candidate pipeline digests, and bottleneck identification.
- [x] **AI Trust & Safety:** Advisory disclaimers rendered on all AI outputs; zero autonomous ATS mutations.

---

## 12. Security Checklist

- [x] Zero plain-text passwords or secret keys stored in source code.
- [x] Tokens stored securely via encapsulated `AuthTokenStorage`.
- [x] Zero token leakage in logs or URL parameters.
- [x] Logout purges both authentication tokens and TanStack Query cache.
- [x] Frontend defense-in-depth role guards active on all `/app/*` subroutes.
- [x] Error messages sanitized to prevent leaking stack traces or internal server error details.

---

## 13. Privacy Checklist

- [x] Candidate PII (phone, email, address) only visible to authenticated `COMPANY_ADMIN` and `RECRUITER` roles.
- [x] Resume content and internal recruiter notes are never exposed in query parameters or public endpoints.
- [x] AI prompt payloads and outputs are strictly scoped to tenant data.

---

## 14. Accessibility Checklist

- [x] Modal dialogs implement full focus trapping, Tab/Shift-Tab cycling, and Escape key dismissal.
- [x] All interactive elements have descriptive accessible names and ARIA attributes (`aria-expanded`, `aria-busy`, `aria-disabled`, `role="dialog"`, `role="menu"`).
- [x] Color contrast across all badge variants, buttons, and text meets WCAG AA standards.
- [x] All forms feature explicit label-input associations and error announcements.

---

## 15. Responsive Checklist

- [x] Mobile viewport (`320px` - `375px`): Single-column stacking, mobile navigation drawer, horizontally scrollable data tables.
- [x] Tablet viewport (`768px` - `1024px`): Responsive 2-column grids, collapsible sidebar.
- [x] Desktop viewport (`1280px` - `1440px+`): Full multi-column layout, sticky headers, optimized data density.

---

## 16. Browser QA Checklist

- [x] Modern Chromium (Chrome, Edge, Brave, Opera)
- [x] Mozilla Firefox
- [x] Apple WebKit / Safari
- [x] Mobile browsers (iOS Safari, Android Chrome)

---

## 17. Deployment Checklist

Before deploying the build artifacts to production:
- [x] Build executed cleanly with `npm run build`.
- [x] `VITE_API_BASE_URL` points to production API domain.
- [x] Static hosting server configured for SPA fallback (`/*` -> `/index.html`).
- [x] HTTPS enabled on production domain.
- [x] Backend CORS origin matches frontend production domain.

---

## 18. Rollback Considerations

- If a deployment issue occurs, the static assets in `dist/` can be rolled back instantly to the prior build artifact without database migrations on the frontend.
- TanStack Query cache is client-side and ephemeral; a browser reload or session clear resets client state immediately.

---

## 19. Known Limitations

- **Browser Environment:** Requires JavaScript-enabled modern evergreen browsers (ES2022+).
- **Offline Mode:** The frontend requires an active network connection to interact with the backend REST API; offline mutation queuing is not supported in Phase 3.

---

## 20. Final Verification Matrix

| Verification Gate | Command | Result | Notes |
| :--- | :--- | :--- | :--- |
| **TypeScript Compilation** | `npm run type-check` | **PASS** | 0 errors across 464 TypeScript files |
| **Oxlint Static Analysis** | `npm run lint` | **PASS** | 0 warnings and 0 errors |
| **Vitest Automated Suite** | `npm run test -- --run` | **PASS** | 129 test files / 480 tests passing (100%) |
| **Vite Production Build** | `npm run build` | **PASS** | Built in 1.23s; zero chunk size warnings |
| **Backend Non-Modification** | `git status` inspection | **PASS** | 0 files in `backend/` modified |
| **Git Branch Verification** | `git branch --show-current`| **PASS** | On `feature/frontend-foundation` |
