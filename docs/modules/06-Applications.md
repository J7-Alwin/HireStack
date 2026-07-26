# 28. Applications Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Applications |
| Folder | src/modules/applications |
| Priority | Critical |
| Version | 1.0 |
| Depends On | Authentication, Users, Companies, Departments, Recruiters, Jobs, Candidates, Shared |
| Database Models | Application, Candidate, Job, Company, User, CandidateDocument (Reference Only), Skill (Reference Only) |

---

# Module Purpose

The Applications module manages the complete recruitment lifecycle of a candidate for a specific job within HireStack.

It acts as the transactional bridge between the Jobs and Candidates modules by creating and managing applications throughout the hiring process.

Each application represents a single candidate applying for a specific job within a company and tracks the recruitment workflow from application creation through hiring, rejection, or withdrawal.

Unlike the Candidate module, which stores permanent candidate information, the Applications module stores recruitment-specific information for a particular job.

---

# Objectives

The Applications module is designed to:

- Connect Candidates with Jobs.
- Manage recruitment progress through configurable application stages.
- Maintain the current lifecycle status of every application.
- Enforce company-level data isolation.
- Prevent duplicate active applications.
- Support recruiter assignment and ownership.
- Provide efficient searching, filtering, sorting, and pagination.
- Maintain a scalable architecture for future Interview, Offer, and Hiring Pipeline modules.

---

# Scope

### Included in Version 1

- Create Application
- View Applications
- View Application Details
- Update Application
- Assign Recruiter
- Update Application Stage
- Update Application Status
- Reject Application
- Record Candidate Withdrawal
- Search Applications
- Filter Applications
- Pagination
- Soft Delete
- Restore Application (Administrative)

---

### Out of Scope (Version 2)

The following capabilities will be implemented in future modules:

- Interview Scheduling
- Interview Feedback
- Interview Panels
- Offer Management
- Offer Approval Workflow
- Hiring Pipeline Configuration
- Application Timeline
- Status History
- Email Communication
- Notifications
- Audit Logs
- Analytics Dashboard
- AI Resume Matching
- Candidate Ranking
- Resume Parsing
- Bulk Operations
- Internal Comments

---

# Design Principles

The Applications module follows the core architectural principles adopted across the HireStack platform.

## Separation of Concerns

- Controllers handle HTTP requests and responses.
- Services implement business rules.
- Repositories perform all database operations.
- Validation is handled using Zod schemas.

---

## Single Responsibility

Each application represents exactly one candidate applying for one specific job.

An Application is not responsible for:

- Candidate profile management
- Job management
- Interview management
- Offer management

These responsibilities belong to their respective modules.

---

## Multi-Tenant Architecture

Every application belongs to exactly one company.

All database queries must be scoped by the authenticated user's company.

Applications cannot reference Candidates or Jobs belonging to another company.

---

## Data Integrity

The module enforces:

- Immutable Candidate assignment
- Immutable Job assignment
- Immutable Application Code
- Duplicate application prevention
- Transaction-safe writes
- Soft delete strategy

---

## Scalability

The architecture is designed so that future modules such as Interviews, Offers, Hiring Pipeline, and Analytics can integrate without requiring breaking schema changes.

---

# Module Overview

The Applications module represents the operational recruitment process within HireStack.

It links together:

Company

↓

Job

↓

Candidate

↓

Application

↓

Assigned Recruiter

Every Application records the recruitment progress of a Candidate for a specific Job while maintaining complete company isolation and enforcing business rules.

The module stores recruitment-specific information only.

Permanent candidate information remains within the Candidate module.

Job information remains within the Jobs module.

---

# Responsibilities

The Applications module is responsible for:

### Application Management

- Create Application
- View Application
- Update Application
- Soft Delete Application
- Restore Application

---

### Recruiter Assignment

- Assign Recruiter
- Reassign Recruiter
- Validate Recruiter Ownership

---

### Stage Management

- Move Application between stages
- Validate allowed stage transitions
- Prevent invalid transitions

---

### Status Management

- Mark Application as Active
- Reject Application
- Record Candidate Withdrawal
- Mark Candidate as Hired
- Archive Application

---

### Search & Discovery

Support searching by:

- Application Code
- Candidate Name
- Candidate Code
- Job Title
- Job Code
- Recruiter Name

---

### Filtering

Support filtering by:

- Stage
- Status
- Recruiter
- Candidate
- Job
- Source
- Applied Date
- Created Date

---

### Pagination

Support standard shared pagination for all listing endpoints.

---

# Module Dependencies

The Applications module depends on the following completed modules:

- Authentication
- Users
- Companies
- Departments
- Recruiters
- Jobs
- Candidates
- Shared

These modules provide authentication, authorization, company isolation, recruiter management, candidate management, job management, shared utilities, response formatting, validation, and common middleware.

---

# Architecture

The Applications module follows the standard HireStack layered architecture.

Controller

↓

Service

↓

Repository

↓

Prisma ORM

↓

PostgreSQL

Each layer has a clearly defined responsibility.

Controllers never access Prisma directly.

Repositories contain all database operations.

Services implement business logic and coordinate transactions.

---

# Folder Structure

```text
src/
└── modules/
    └── applications/
        ├── application.controller.ts
        ├── application.service.ts
        ├── application.repository.ts
        ├── application.routes.ts
        ├── application.validation.ts
        ├── application.types.ts
        ├── application.constants.ts
        └── index.ts
```

---

# File Responsibilities

## application.controller.ts

Responsibilities

- Receive HTTP requests.
- Validate requests.
- Invoke service methods.
- Return standardized API responses.

Must NOT

- Access Prisma directly.
- Implement business rules.
- Perform complex validation.

---

## application.service.ts

Responsibilities

- Application lifecycle management.
- Business rule enforcement.
- Duplicate application prevention.
- Recruiter assignment.
- Stage transition validation.
- Status transition validation.
- Company isolation checks.
- Transaction coordination.

Must NOT

- Execute raw database queries.

---

## application.repository.ts

Responsibilities

- Prisma CRUD operations.
- Search queries.
- Filtering.
- Pagination.
- Transaction-aware database access.

Must NOT

- Contain business logic.

---

## application.validation.ts

Contains Zod validation schemas for:

- Create Application
- Update Application
- Assign Recruiter
- Update Stage
- Update Status
- Reject Application
- Withdraw Application
- Search
- Filtering
- Pagination

---

## application.routes.ts

Contains all Express route definitions and middleware bindings for the Applications module.

---

## application.types.ts

Contains:

- Interfaces
- DTOs
- Request Types
- Response Types
- Shared Type Definitions

---

## application.constants.ts

Contains:

- Stage Constants
- Status Constants
- Validation Limits
- Pagination Defaults
- Business Rule Constants
- Error Messages
---

# Database Design

The Applications module is centered around the **Application** entity.

Each Application represents a single Candidate applying for a single Job within a Company.

An Application is an immutable relationship between a Candidate and a Job. Once created, the Candidate and Job references cannot be modified.

---

# Entity Relationships

```
Company
   │
   ├──────────────┐
   │              │
Candidate       Job
   │              │
   └──────┬───────┘
          │
     Application
          │
          │
Assigned Recruiter
```

Relationship Summary

```
Company
    │
    ├── Jobs
    ├── Candidates
    └── Applications

Candidate 1 ─────── N Applications

Job 1 ───────────── N Applications

Recruiter 1 ─────── N Applications
```

---

# Application Model

Each Application stores the recruitment-specific information for one Candidate applying to one Job.

## Core Fields

| Field | Description |
|--------|-------------|
| id | UUID Primary Key |
| applicationCode | Human-readable unique application code |
| companyId | Owning company |
| candidateId | Candidate reference (Immutable) |
| jobId | Job reference (Immutable) |
| assignedRecruiterId | Recruiter responsible for the application |
| stage | Current recruitment stage |
| status | Current application lifecycle status |
| source | Source of the application |
| remarks | Internal remarks |
| rejectionReasonCode | Standard rejection reason |
| rejectionReasonNote | Optional rejection remarks |
| withdrawalReasonCode | Standard withdrawal reason |
| withdrawalReasonNote | Optional withdrawal remarks |
| appliedAt | Application creation date |
| createdBy | User who created the application |
| updatedBy | Last user who modified the application |
| createdAt | Record creation timestamp |
| updatedAt | Last update timestamp |
| deletedAt | Soft delete timestamp |

---

# Immutable Fields

The following fields cannot be modified after creation:

- applicationCode
- companyId
- candidateId
- jobId
- appliedAt
- createdAt

Only business workflow fields may be updated.

---

# Application Code

Every Application receives a unique business identifier.

Format

```
APP-000001

APP-000002

APP-000003
```

Rules

- Unique within a company
- Generated automatically
- Immutable
- Safe under concurrent requests using transactional sequence generation

---

# Application Stage

Application Stage represents **where** an application currently is in the recruitment workflow.

## Supported Stages

```
APPLIED

↓

SCREENING

↓

SHORTLISTED

↓

INTERVIEW

↓

OFFER
```

The stage reflects recruitment progress only.

---

# Application Status

Application Status represents the overall lifecycle state of an application.

Supported Statuses

```
ACTIVE

HIRED

REJECTED

WITHDRAWN

ARCHIVED
```

Status and Stage are independent concepts.

Example

```
Stage

INTERVIEW

Status

ACTIVE
```

Another example

```
Stage

OFFER

Status

HIRED
```

---

# Why Stage and Status are Separate

Stage indicates the current recruitment workflow.

Status indicates whether the application is still active.

Example

```
Stage

SHORTLISTED

Status

ACTIVE
```

Later

```
Stage

SHORTLISTED

Status

REJECTED
```

This separation provides cleaner reporting, analytics, and future Hiring Pipeline integration.

---

# Ownership Model

Every Application belongs to exactly:

```
One Company

↓

One Candidate

↓

One Job

↓

One Assigned Recruiter
```

Ownership Rules

- Company owns the application.
- Candidate owns the profile.
- Recruiter manages the recruitment workflow.
- Administrators may reassign recruiters.

---

# Recruiter Assignment

Each Application has one assigned recruiter.

Rules

- Assigned during application creation.
- Can be reassigned by Company Admin.
- Recruiters cannot assign applications outside their company.
- Assignment changes do not modify application history.

---

# Stage Transition Rules

Only the following transitions are allowed.

| Current Stage | Allowed Next Stage |
|---------------|-------------------|
| APPLIED | SCREENING |
| SCREENING | SHORTLISTED, REJECTED |
| SHORTLISTED | INTERVIEW, REJECTED |
| INTERVIEW | OFFER, REJECTED |
| OFFER | HIRED, REJECTED |

Invalid transitions must return:

```
422 Unprocessable Entity
```

Examples

Invalid

```
APPLIED

↓

INTERVIEW
```

Invalid

```
HIRED

↓

SCREENING
```

---

# Status Transition Rules

Supported lifecycle transitions.

| Current Status | Allowed Next Status |
|----------------|--------------------|
| ACTIVE | HIRED |
| ACTIVE | REJECTED |
| ACTIVE | WITHDRAWN |
| ACTIVE | ARCHIVED |

Terminal states

- HIRED
- REJECTED
- WITHDRAWN
- ARCHIVED

Terminal states cannot transition back to ACTIVE.

---

# Permissions

## Company Admin

May

- Create Applications
- Update Applications
- Assign Recruiters
- Change Stage
- Change Status
- Reject Applications
- Record Withdrawals
- Archive Applications
- Restore Applications

---

## Recruiter

May

- Create Applications
- View Company Applications
- Update Assigned Applications
- Move Stages
- Reject Candidates
- Record Candidate Withdrawals
- Update Remarks

Cannot

- Access another company's applications
- Modify immutable fields

---

## Super Admin

Super Admin cannot create, update, or manage Applications.

Super Admin access is restricted to platform administration only.

---

# API Endpoints

## POST

```
/applications
```

Create Application

---

## GET

```
/applications
```

Retrieve paginated applications.

Supports searching, filtering, and sorting.

---

## GET

```
/applications/:id
```

Retrieve application details.

---

## PATCH

```
/applications/:id
```

Update editable application information.

---

## PATCH

```
/applications/:id/stage
```

Update application stage.

---

## PATCH

```
/applications/:id/status
```

Update application status.

---

## PATCH

```
/applications/:id/assign
```

Assign or reassign recruiter.

---

## PATCH

```
/applications/:id/reject
```

Reject application.

---

## PATCH

```
/applications/:id/withdraw
```

Record candidate withdrawal.

---

## DELETE

```
/applications/:id
```

Soft delete application.

---

# Business Rules

The Applications module enforces the following business rules to ensure data consistency and maintain recruitment workflow integrity.

## Application Creation

- Every Application must belong to exactly one Company.
- Every Application must reference exactly one Candidate.
- Every Application must reference exactly one Job.
- Every Application must have one assigned Recruiter.
- Every Application receives a unique Application Code during creation.
- Application Codes are immutable.

---

## Candidate Eligibility

A Candidate may receive a new Application only if:

- Candidate belongs to the authenticated Company.
- Candidate is not Archived.
- Candidate is not Blacklisted.
- Candidate exists and has not been soft deleted.

---

## Job Eligibility

Applications may only be created if:

- Job belongs to the authenticated Company.
- Job status is **OPEN**.
- Job has not been soft deleted.

Applications cannot be created for:

- Draft Jobs
- Published Jobs
- Paused Jobs
- Closed Jobs
- Archived Jobs

---

## Duplicate Prevention

Only one active Application may exist for the same:

- Candidate
- Job
- Company

Attempting to create a duplicate active Application must return:

```
409 Conflict
```

---

## Immutable Fields

The following fields cannot be modified after Application creation:

- applicationCode
- companyId
- candidateId
- jobId
- appliedAt
- createdAt

---

## Recruiter Assignment

- Applications are assigned to one Recruiter.
- Company Administrators may reassign Recruiters.
- Recruiters cannot assign Applications outside their Company.
- Assignment updates do not modify ownership history.

---

## Stage Management

Application stages must follow the approved transition matrix.

Invalid transitions must be rejected.

Example

Invalid

```
APPLIED

↓

INTERVIEW
```

Returns

```
422 Unprocessable Entity
```

---

## Status Management

Status updates must follow lifecycle rules.

Terminal statuses cannot transition back to ACTIVE.

Terminal statuses include:

- HIRED
- REJECTED
- WITHDRAWN
- ARCHIVED

---

## Soft Delete

Applications use soft deletion.

Deleting an Application sets:

```
deletedAt
```

No permanent deletion is performed through public APIs.

---

# Validation Rules

All incoming requests must be validated using Zod.

## Create Application

Required

- candidateId
- jobId
- assignedRecruiterId

Optional

- source
- remarks

---

## Update Application

Editable fields only.

Immutable fields must never be accepted.

---

## Stage Update

Must contain:

- valid stage

Must follow transition rules.

---

## Status Update

Must contain:

- valid status

Must follow lifecycle rules.

---

## Reject Application

Required

- rejectionReasonCode

Optional

- rejectionReasonNote

---

## Withdraw Application

Required

- withdrawalReasonCode

Optional

- withdrawalReasonNote

---

## Validation Limits

Remarks

Maximum

```
3000 characters
```

Reason Notes

Maximum

```
1000 characters
```

Search Text

Maximum

```
100 characters
```

---

# Search

Applications support searching by:

- Application Code
- Candidate Name
- Candidate Code
- Job Title
- Job Code
- Recruiter Name

Search should be case-insensitive.

---

# Filtering

Applications support filtering by:

- Stage
- Status
- Recruiter
- Candidate
- Job
- Source
- Applied Date
- Created Date

Multiple filters may be combined.

---

# Sorting

Supported sorting:

- Applied Date
- Created Date
- Updated Date
- Candidate Name
- Job Title
- Stage
- Status

Default

Newest Applications first.

---

# Pagination

All list endpoints use the shared pagination standard.

Support:

- page
- limit
- totalItems
- totalPages
- hasNextPage
- hasPreviousPage

Pagination defaults are provided by the Shared module.

---

# Error Handling

The module returns standardized API responses.

## 400

Validation Error

---

## 401

Unauthorized

---

## 403

Forbidden

---

## 404

Application Not Found

---

## 409

Duplicate Application

---

## 409

Candidate already has an active Application for this Job.

---

## 422

Invalid Stage Transition

---

## 422

Invalid Status Transition

---

## 500

Internal Server Error

Internal implementation details such as Prisma errors must never be exposed.

---

# Security

The Applications module follows HireStack security standards.

## Authentication

All endpoints require authenticated users.

---

## Authorization

Company Administrators

- Full Application management.

Recruiters

- Manage Applications within their Company.

Super Admin

- No Application management permissions.

---

## Company Isolation

Every query must be scoped using the authenticated user's Company.

Cross-company access is strictly prohibited.

---

## Data Protection

The module must never expose:

- Internal database identifiers unnecessarily
- Deleted records
- Private recruiter remarks to unauthorized users

---

# Transactions

Multi-step operations must execute within Prisma transactions.

Examples include:

- Create Application
- Assign Recruiter
- Stage updates involving multiple writes
- Status updates involving multiple writes

Partial writes are not permitted.

---

# Performance

Repositories should:

- Select only required fields.
- Avoid unnecessary joins.
- Support efficient pagination.
- Reuse shared query utilities where appropriate.
- Use indexed fields for search and filtering.

Future optimization may include PostgreSQL full-text search.

---

# Future Compatibility

The architecture is intentionally designed for seamless integration with future modules.

Future integrations include:

- Application Timeline
- Status History
- Interview Management
- Offer Management
- Hiring Pipeline
- Notifications
- Audit Logs
- Analytics Dashboard
- AI Resume Matching
- AI Candidate Ranking
- Bulk Operations
- Data Export

These capabilities should be added without breaking existing APIs or database relationships.

---

# Acceptance Criteria

The Applications module is considered complete when:

- Applications can be created successfully.
- Duplicate active Applications are prevented.
- Company isolation is enforced.
- Stage transitions follow business rules.
- Status transitions follow lifecycle rules.
- Immutable fields cannot be modified.
- Search, filtering, sorting, and pagination work correctly.
- Soft delete functions correctly.
- Authorization rules are enforced.
- Repository pattern is maintained.
- All validation uses Zod.
- Multi-step operations use Prisma transactions.
- Standardized API responses are returned.

---

# Coding Notes for AI Agent

Before implementation, review the following project documents:

- 10-System-Architecture.md
- 12-Database-Schema-Specification.md
- 13-API-Standards.md
- 15-Backend-Folder-Architecture.md
- 17-Security-Specification.md
- 18-Coding-Standards-Git-Workflow.md

Implementation Requirements

- Follow Controller → Service → Repository architecture.
- Repository layer contains all Prisma operations.
- Services implement business rules.
- Validate every request using Zod.
- Enforce company isolation.
- Prevent duplicate active Applications.
- Enforce Stage and Status transition rules.
- Use Prisma transactions for all multi-step operations.
- Maintain immutable fields.
- Implement soft delete.
- Support searching, filtering, sorting, and pagination.
- Return standardized API responses.
- Generate production-ready, maintainable code.

---

# Conclusion

The Applications module serves as the operational core of the HireStack recruitment workflow.

It connects Candidates, Jobs, Recruiters, and Companies while maintaining strict business rules, multi-tenant isolation, and a scalable architecture.

The module establishes the foundation for future Interview Management, Offer Management, and Hiring Pipeline modules without requiring breaking architectural changes, ensuring HireStack remains maintainable, extensible, and production-ready.