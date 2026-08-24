# HireStack ATS — Frontend API & State Architecture Guide

This document outlines the frontend data layer and state management architecture established in **Phase 3 — Stage 3**.

---

## 1. Architecture Overview

The frontend follows a clean unidirectional data flow:

```
UI Components (Stage 2)
       ↓
Custom Hooks / URL State (`src/hooks/`)
       ↓
Feature Services & React Query (`@tanstack/react-query`)
       ↓
Central ApiClient (`src/services/api/api-client.ts`)
       ↓
HireStack Express Backend (`http://localhost:5000/api/v1`)
```

---

## 2. Server State vs. Client State

To prevent cache synchronization issues and state bloat, state is strictly divided:

| State Type | Management Solution | Examples |
| :--- | :--- | :--- |
| **Server State** | TanStack Query (`@tanstack/react-query`) | Candidates, Jobs, Applications, Metrics, AI Results |
| **Client State** | Zustand (`useUiStore`) | Sidebar collapsed, modal open/close, table density |
| **URL State** | `react-router-dom` (`useQueryParams`) | Page numbers, active filters, search query, sorting |
| **Local State** | React `useState` / `useReducer` | Form inputs, popover open state, component transient state |

> [!IMPORTANT]
> **Never duplicate server data in Zustand stores.** Server data belongs strictly in the React Query cache.

---

## 3. Centralized API Client

The application uses **one** central API client: [src/services/api/api-client.ts](file:///c:/Projects/HireStack/frontend/src/services/api/api-client.ts).

### Usage Example:
```typescript
import { apiClient } from '@/services/api'
import type { CandidateListResponse, CreateCandidateInput } from '@/types'

// GET request
const response = await apiClient.get<CandidateListResponse>('/candidates', {
  params: { page: 1, limit: 20, status: 'ACTIVE' },
  signal: abortSignal,
})

// POST request
const newCandidate = await apiClient.post<Candidate>('/candidates', candidateInput)
```

### Features:
- **Automatic Header Injection**: `Content-Type: application/json`, `Accept: application/json`, and dynamic `Authorization: Bearer <token>`.
- **Query Parameter Serialization**: Flattens nested arrays (`status=OPEN&status=PENDING`), numbers, and booleans cleanly.
- **Request Cancellation**: Fully integrated with standard browser `AbortSignal`.
- **Error Normalization**: Normalizes backend `ApiError` responses, Zod validation errors, network failures, and cancellations into structured `ApiError` instances.

---

## 4. Error Normalization (`ApiError`)

Every thrown error in the data layer is an instance of `ApiError` ([src/services/api/api-error.ts](file:///c:/Projects/HireStack/frontend/src/services/api/api-error.ts)).

```typescript
try {
  await apiClient.get('/candidates/999')
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isNotFound) {
      // Handle 404
    } else if (error.isValidationError) {
      console.error('Validation errors:', error.errors)
    }
    toast.error(error.getUserFriendlyMessage())
  }
}
```

### Properties & Helper Getters:
- `status`: HTTP status code (or `0` for network failures/cancellations)
- `code`: Categorized error code (`'UNAUTHORIZED'`, `'FORBIDDEN'`, `'VALIDATION_FAILED'`, `'NOT_FOUND'`, `'RATE_LIMITED'`, `'INTERNAL_SERVER_ERROR'`, `'NETWORK_ERROR'`, `'ABORTED'`)
- `errors`: Field-level validation issues from backend Zod schemas
- `requestId`: Tracing ID from the backend `X-Request-ID` header
- `isUnauthorized`, `isForbidden`, `isNotFound`, `isValidationError`, `isConflict`, `isRateLimited`, `isServerError`, `isNetworkError`, `isAborted`
- `getUserFriendlyMessage()`: Sanitized, user-safe string that prevents leakage of server internals or database errors to the UI.

---

## 5. Query Key Factory Pattern

Use `createEntityQueryKeys` from [src/services/api/query-keys.ts](file:///c:/Projects/HireStack/frontend/src/services/api/query-keys.ts) to define hierarchical query keys.

```typescript
import { createEntityQueryKeys } from '@/services/api'
import type { PaginationParams } from '@/types'

export const candidateKeys = createEntityQueryKeys<PaginationParams>('candidates')

// Generated Keys:
candidateKeys.all              // ['candidates']
candidateKeys.lists()          // ['candidates', 'list']
candidateKeys.list({ page: 1 }) // ['candidates', 'list', { page: 1 }]
candidateKeys.details()        // ['candidates', 'detail']
candidateKeys.detail('c-101')  // ['candidates', 'detail', 'c-101']
```

---

## 6. Caching & Invalidation Strategy

### Conservative Defaults:
- **Default Stale Time**: 2 minutes (`staleTime: 1000 * 60 * 2`).
- **Garbage Collection Time**: 10 minutes (`gcTime: 1000 * 60 * 10`).
- **Retry Policy**: Never retries 4xx client errors (400, 401, 403, 404, 409, 422) or aborted requests. Allows up to 2 retries for transient 5xx errors and network drops.
- **Window Focus Refetch**: Disabled by default (`refetchOnWindowFocus: false`) to avoid interrupting recruiter workflows.

### Mutation Invalidation Guidelines:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { candidateKeys, apiClient } from '@/services/api'

export function useCreateCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newCandidateData) => apiClient.post('/candidates', newCandidateData),
    onSuccess: () => {
      // Invalidate all candidate lists so the table refreshes
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() })
    },
  })
}
```

---

## 7. Authentication Readiness (Stage 4 Preparation)

The `ApiClient` contains a decoupled token provider slot:

```typescript
export interface AuthTokenProvider {
  getAccessToken: () => string | null | Promise<string | null>
  onUnauthorized?: () => void
}

// Stage 4 will register:
apiClient.setTokenProvider({
  getAccessToken: () => authStore.getAccessToken(),
  onUnauthorized: () => authStore.handleSessionExpired(),
})
```

- Zero direct dependencies on auth storage inside feature services.
- Never logs tokens or credentials.
- Sanitizes headers and handles 401 responses via `onUnauthorized`.
