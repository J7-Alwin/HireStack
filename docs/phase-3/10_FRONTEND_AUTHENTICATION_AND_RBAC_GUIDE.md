# HireStack ATS — Frontend Authentication & RBAC Guide

## 1. Overview

This document describes the frontend authentication and Role-Based Access Control (RBAC) architecture for HireStack ATS, built in Phase 3 Stage 4.

The implementation is contract-first, based directly on the backend Swagger/OpenAPI specifications and Express middleware contracts without modifying backend source code.

---

## 2. Backend Swagger Contract Reference

The frontend authentication layer integrates with the following backend endpoints:

| Endpoint | Method | Request Schema | Response Schema | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | `{ email, password }` | `{ success, message, data: { user, accessToken, refreshToken } }` | Authenticates user with credentials |
| `/auth/logout` | `POST` | `{ refreshToken }` | `{ success, message }` | Invalidates session and revokes refresh token |
| `/auth/refresh-token` | `POST` | `{ refreshToken }` | `{ success, message, data: { accessToken, refreshToken } }` | Rotates expired access token |
| `/auth/me` | `GET` | *(Bearer Token)* | `{ success, message, data: { user } }` | Retrieves current authenticated profile |
| `/auth/change-password` | `POST` | `{ currentPassword, newPassword, confirmPassword }` | `{ success, message }` | Updates user password |
| `/auth/forgot-password` | `POST` | `{ email }` | `{ success, message }` | Sends password reset email |
| `/auth/reset-password` | `POST` | `{ token, newPassword, confirmPassword }` | `{ success, message }` | Completes password reset |
| `/auth/verify-email` | `POST` | `{ token }` | `{ success, message }` | Verifies user email |
| `/auth/resend-verification` | `POST` | *(Bearer Token)* | `{ success, message }` | Resends verification email |

### Supported Roles
- `SUPER_ADMIN` — Platform-level administrator
- `COMPANY_ADMIN` — Company-scoped tenant administrator
- `RECRUITER` — Company-scoped recruiter / talent specialist
- `CANDIDATE` — External applicant

### Account Statuses
- `ACTIVE` — Normal active account
- `INACTIVE` — Disabled account
- `SUSPENDED` — Temporarily suspended account
- `PENDING` — Pending account verification

---

## 3. Architecture & Data Flow

```
Backend Swagger / Express API
             ↓
     Auth API Service (authService)
             ↓
     AuthTokenStorage (In-memory & Web Storage encapsulation)
             ↓
     AuthTokenProvider ──> ApiClient (Authorization: Bearer <token>)
             ↓
     useAuthStore & AuthProvider (State & Lifecycle)
             ↓
     RBAC Model (hasRole, hasAnyRole, canAccess)
             ↓
     Route Guards (<ProtectedRoute />, <PublicRoute />, <RoleGuard />)
             ↓
     Pages (LoginPage, ForbiddenPage, Future App Shell)
```

---

## 4. Key Components

### 4.1 Token Storage (`auth-token.storage.ts`)
- Encapsulates `accessToken` and `refreshToken`.
- Zero token logging or leaking into errors/URLs.
- Provides `getAccessToken()`, `getRefreshToken()`, `setTokens()`, `clearTokens()`, `hasTokens()`.

### 4.2 Auth Service (`auth.service.ts`)
- Standardized API calls using `ApiClient`.
- Automatically synchronizes tokens with `authTokenStorage`.

### 4.3 Centralized Auth State (`auth.store.ts` & `auth-context.tsx`)
- Zustand store manages safe UI state: `user`, `status` (`INITIALIZING` | `AUTHENTICATED` | `UNAUTHENTICATED`), `isAuthenticated`, `isLoading`, `error`.
- `AuthProvider` handles startup session restoration via `/auth/me`, token registration with `apiClient`, and 401 callback handling.

### 4.4 RBAC & Permissions (`permissions.ts` & `RoleGuard.tsx`)
- Centralized role verification: `hasRole`, `hasAnyRole`, `canAccess`, `isSuperAdmin`, `isCompanyAdmin`, `isRecruiter`, `isCandidate`.
- `<RoleGuard roles={[Role.RECRUITER]} fallback={<CustomFallback />} />` for conditional UI elements.

### 4.5 Route Guards & Pages
- `<ProtectedRoute allowedRoles={[...]}>`:
  - Displays centered loading spinner during `INITIALIZING`.
  - Redirects unauthenticated users to `/login` with `returnTo` state.
  - Renders `<ForbiddenPage />` (403 experience) when role is insufficient.
- `<PublicRoute>`: Redirects already-authenticated users to home.
- `<ForbiddenPage />`: Branded 403 Forbidden page styled with Stage 2 components.
- `<LoginPage />`: Accessible, branded HireStack login interface with validation and error alerts.

---

## 5. Error & Session Lifecycle Handling

### 5.1 401 Unauthorized
1. `ApiClient` detects `401 Unauthorized` and executes `tokenProvider.onUnauthorized()`.
2. `onUnauthorized` clears token storage, wipes `queryClient` cache, and transitions `useAuthStore` to `UNAUTHENTICATED`.
3. User is cleanly redirected to `/login` without infinite loops.

### 5.2 403 Forbidden
1. The user is authenticated but lacks required role authorization.
2. The user's active session is preserved.
3. `<ForbiddenPage />` renders with options to go back, return home, or logout.

### 5.3 Logout & Cache Clearing
1. `authService.logout()` invokes `POST /auth/logout` with the active refresh token.
2. `authTokenStorage.clearTokens()` clears all stored tokens.
3. `queryClient.clear()` destroys all cached server data (jobs, candidates, applications) to prevent cross-session leakage.
4. `useAuthStore.setUnauthenticated()` resets global state.

---

## 6. Security Checklist

- [x] Tokens are never printed, logged, or exposed in UI state.
- [x] Passwords are never logged or stored in global stores.
- [x] Bearer token header injected automatically by `ApiClient`.
- [x] Query cache is completely wiped on logout and on 401 session expiry.
- [x] Distinct handling for 401 (invalid/expired session) and 403 (insufficient permissions).
- [x] Client-side permissions remain subordinate to backend authority.
