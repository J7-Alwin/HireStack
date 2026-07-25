# Offers Module

The **Offers Module** manages the complete employment offer lifecycle from draft creation, approval workflow, sending, marking viewed, candidate decision tracking (acceptance, decline), through withdrawal, revision, and soft deletion.

## Architecture

Follows the standard HireStack ATS multi-tier architecture:
- **Routes**: Direct HTTP requests to controllers and apply auth/RBAC.
- **Controllers**: Handle HTTP serialization/deserialization.
- **Services**: Enforce domain validation, state transitions, version control, and operational logging.
- **Repositories**: Execute database queries using reusable Prisma selects.

## Features

- **Create Offer**: Creates an offer draft sequentially (`OFF-000001`).
- **Submit for Approval**: Progresses state from `DRAFT` to `PENDING_APPROVAL`.
- **Approve Offer**: Transitions from `PENDING_APPROVAL` to `APPROVED` (Company Admin only).
- **Send Offer**: Transitions from `APPROVED` to `SENT` (Company Admin only).
- **Mark Viewed**: Transitions from `SENT` to `VIEWED`.
- **Accept/Decline**: Final candidate response states.
- **Withdraw Offer**: Withdraws active offer (Company Admin only).
- **Create Offer Revision**: Generates a new version under the same code, setting the old version to superseded (`WITHDRAWN`).
- **Soft Delete**: Non-destructive deletion of non-accepted records.
