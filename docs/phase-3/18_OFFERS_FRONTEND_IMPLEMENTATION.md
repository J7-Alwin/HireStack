# Phase 3 — Stage 7F: Offers Module Frontend Implementation

## 1. Overview
The **Offers Module** provides a complete, production-grade frontend interface for authorized ATS users (`COMPANY_ADMIN` and `RECRUITER`) to manage the candidate offer lifecycle in HireStack ATS.

The ATS domain hierarchy is strictly maintained:
$$\text{Candidate} \longrightarrow \text{Application} \longrightarrow \text{Job} \longrightarrow \text{Interview} \longrightarrow \text{Offer}$$

The implementation is strictly aligned with the backend OpenAPI specification (`backend/src/swagger/paths/offers.paths.ts`, `backend/src/swagger/schemas/offer.schema.ts`) and backend controller logic (`backend/src/modules/offers/`).

---

## 2. Supported Backend Operations & State Machine

### 2.1 Backend Operations
1. `GET /offers`: Paginated offer list with search, status, currency, employment type filters, sorting, and pagination.
2. `GET /offers/:id`: Single offer details with related candidate, job requisition, application, recruiter, and approver details.
3. `POST /offers`: Create draft offer linked to an active candidate application.
4. `PUT /offers/:id`: Update draft offer compensation, dates, benefits, letter, and notes.
5. `POST /offers/:id/submit`: Submit draft offer for company administrator review and approval.
6. `POST /offers/:id/approve`: Approve submitted offer (*Company Admin only*).
7. `POST /offers/:id/send`: Send approved offer to candidate (*Company Admin only*).
8. `POST /offers/:id/view`: Mark offer as viewed by candidate.
9. `POST /offers/:id/accept`: Record candidate acceptance.
10. `POST /offers/:id/decline`: Record candidate decline.
11. `POST /offers/:id/withdraw`: Withdraw active offer (*Company Admin only*).
12. `POST /offers/:id/revision`: Create revision version (version $V+1$) under the same offer code.
13. `DELETE /offers/:id`: Soft-delete offer record (*Company Admin only*, non-accepted offers).

### 2.2 Offer State Machine
- `DRAFT` $\longrightarrow$ `PENDING_APPROVAL`
- `PENDING_APPROVAL` $\longrightarrow$ `APPROVED`
- `APPROVED` $\longrightarrow$ `SENT` | `WITHDRAWN`
- `SENT` $\longrightarrow$ `VIEWED` | `EXPIRED` | `WITHDRAWN`
- `VIEWED` $\longrightarrow$ `ACCEPTED` | `DECLINED` | `WITHDRAWN`
- **Terminal States**: `ACCEPTED`, `DECLINED`, `EXPIRED`, `WITHDRAWN`

---

## 3. Architecture & File Structure

```
frontend/src/features/offers/
├── types/
│   └── offers.types.ts             # Domain models, enums, inputs, and responses
├── utils/
│   └── offer-helpers.ts            # Salary formatters, date formatters, badges, transition rules
├── services/
│   └── offers.service.ts           # ApiClient wrappers for all 13 backend operations
├── hooks/
│   ├── offer-query-keys.ts         # Query key factory
│   ├── useOffers.ts                # Paginated list query hook
│   ├── useOffer.ts                 # Detail query hook
│   ├── useCreateOffer.ts           # Create draft mutation
│   ├── useUpdateOffer.ts           # Update draft mutation
│   ├── useDeleteOffer.ts           # Soft-delete mutation
│   ├── useOfferActions.ts          # Submit, Approve, Send, View, Accept, Decline, Withdraw, Revision mutations
│   └── index.ts                    # Hooks barrel export
├── components/
│   ├── OfferStatusBadge.tsx        # Status badge
│   ├── OfferFilters.tsx            # AtsFilterBar integration
│   ├── OfferTable.tsx              # DataTable presentation with role-based actions
│   ├── OfferForm.tsx               # Create / Edit / Revision form with validation
│   ├── OfferSummary.tsx            # Offer overview card
│   ├── OfferCompensation.tsx       # Salary & benefits breakdown
│   ├── OfferCandidate.tsx          # Candidate relation card with router link
│   ├── OfferJob.tsx                # Job relation card with router link
│   ├── OfferApplication.tsx        # Application relation card with router link
│   ├── OfferActions.tsx            # Lifecycle action bar and confirmation modals
│   └── index.ts                    # Components barrel export
├── pages/
│   ├── OffersPage.tsx              # /app/offers list page
│   ├── OfferDetailPage.tsx         # /app/offers/:offerId detail page
│   ├── OfferCreatePage.tsx         # /app/offers/new create page
│   ├── OfferEditPage.tsx           # /app/offers/:offerId/edit edit & revision page
│   └── index.ts                    # Pages barrel export
└── index.ts                        # Feature root barrel export
```

---

## 4. Route & Navigation Configuration

### 4.1 Routes (`src/routes/router.tsx`)
- `/app/offers`: `OffersPage` (allowed roles: `COMPANY_ADMIN`, `RECRUITER`)
- `/app/offers/new`: `OfferCreatePage` (allowed roles: `COMPANY_ADMIN`, `RECRUITER`)
- `/app/offers/:offerId`: `OfferDetailPage` (allowed roles: `COMPANY_ADMIN`, `RECRUITER`)
- `/app/offers/:offerId/edit`: `OfferEditPage` (allowed roles: `COMPANY_ADMIN`, `RECRUITER`)

### 4.2 Navigation Item (`src/config/navigation.config.ts`)
- Added `offers` under `COMPANY_NAV_SECTIONS` recruitment section with `FileCheck` icon, enabled for `COMPANY_ADMIN` and `RECRUITER`.

---

## 5. Verification & Test Coverage

### Test Suites (`frontend/tests/offers/`)
1. `tests/offers/offers.service.test.ts`: 13/13 tests passing (all API endpoints mapped and verified).
2. `tests/offers/offers.hooks.test.tsx`: 7/7 tests passing (query keys, list/detail queries, mutations, cache invalidations).
3. `tests/offers/OffersPage.test.tsx`: 3/3 tests passing (list rendering, empty state, error state).
4. `tests/offers/OfferDetailPage.test.tsx`: 2/2 tests passing (detail sections, relation cards, not found state).
5. `tests/offers/OfferForm.test.tsx`: 3/3 tests passing (create form, validation, submission, edit mode).
6. `tests/offers/OfferRBAC.test.tsx`: 4/4 tests passing (role gating for approve/send/delete, navigation permissions).
7. `tests/offers/offer-relationships.test.tsx`: 4/4 tests passing (links to candidate, job, application, empty fallbacks).
8. `tests/offers/offer-money-date.test.ts`: 6/6 tests passing (currency formatting, date formatters, state machine helpers).

**Offers Test Summary**: 8 test files, 42 tests passing.  
**Full Test Suite**: 101 test files, 330 tests passing.  
**Type Check**: `tsc -b` exited with 0 errors.  
**Linter**: `oxlint` exited with 0 warnings, 0 errors across 379 files.  
**Production Build**: `vite build` completed successfully.
