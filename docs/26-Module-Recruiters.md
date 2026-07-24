# 26. Recruiters Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Recruiters |
| Folder | `src/modules/recruiters` |
| Priority | High |
| Module Type | Business Management Module |
| Depends On | Authentication, Users, Companies, Departments |
| Used By | Jobs, Applications, Interviews (Future) |
| Primary Database Model | User |
| Related Database Models | Company, Department |
| Future Related Models | Job, Application, Interview, Notification, AuditLog |

---

# Module Purpose

The Recruiters module manages recruiter accounts within HireStack.

A recruiter is **not a separate entity or authentication model**.

A recruiter is a standard **User** whose role is set to **RECRUITER**.

This module is responsible for managing recruiter-specific business operations including:

- Recruiter creation
- Recruiter management
- Department assignment
- Company membership
- Recruiter activation
- Recruiter deactivation
- Soft deletion
- Recruiter restoration

Authentication, authorization, passwords, login sessions, and user identity are handled by the Authentication and Users modules.

This module focuses exclusively on recruiter business management.

---

# Module Goals

The Recruiters module aims to provide:

- Centralized recruiter management
- Secure multi-tenant recruiter administration
- Department-based recruiter organization
- Company isolation
- Future compatibility with Jobs, Applications, Interviews, Analytics, and Notifications
- Production-ready architecture

---

# Module Responsibilities

The Recruiters module is responsible for:

## Recruiter Management

- Create Recruiter
- View Recruiter
- Update Recruiter
- Activate Recruiter
- Deactivate Recruiter
- Soft Delete Recruiter
- Restore Recruiter

---

## Recruiter Organization

- Assign recruiter to a department
- Change recruiter department
- Validate department ownership
- Validate department status

---

## Recruiter Listing

- Retrieve recruiter details
- List recruiters
- Search recruiters
- Filter recruiters
- Sort recruiters
- Pagination

---

## Company Isolation

- Restrict recruiter access to their company
- Prevent cross-company recruiter management
- Validate company ownership on every operation

---

# Module Does NOT Manage

This module does **NOT** manage:

- Authentication
- Login
- Password hashing
- Password reset
- Password change
- User registration
- Company creation
- Department management
- Job management
- Candidate management
- Application management
- Interview management
- Email delivery
- Notifications
- Analytics
- Audit logging

These responsibilities belong to their respective modules.

---

# Folder Structure

```text
src/
└── modules/
    └── recruiters/
        ├── recruiter.controller.ts
        ├── recruiter.service.ts
        ├── recruiter.repository.ts
        ├── recruiter.routes.ts
        ├── recruiter.validation.ts
        ├── recruiter.types.ts
        ├── recruiter.constants.ts
        └── index.ts
```

---

# File Responsibilities

## recruiter.controller.ts

### Responsibilities

- Receive HTTP requests
- Parse request data
- Validate requests
- Call service layer
- Return standardized API responses

### Must NOT

- Access Prisma directly
- Contain business logic
- Perform authorization decisions
- Handle database transactions

---

## recruiter.service.ts

### Responsibilities

- Recruiter business logic
- Company ownership validation
- Department validation
- Recruiter creation
- Recruiter updates
- Recruiter activation
- Recruiter deactivation
- Recruiter restoration
- Soft deletion
- Business rule enforcement

### Must NOT

- Access Express Request or Response objects
- Execute raw database queries

---

## recruiter.repository.ts

### Responsibilities

- Prisma database operations
- CRUD operations
- Search queries
- Pagination queries
- Filtering queries
- Sorting queries

### Must NOT

- Contain business logic
- Perform authorization checks

---

## recruiter.validation.ts

Contains Zod validation schemas for:

- Create Recruiter
- Update Recruiter
- Recruiter Search
- Recruiter Filters
- Recruiter Status Updates
- Department Assignment

---

## recruiter.routes.ts

Contains:

- Express Router
- Route definitions
- Authentication middleware
- Authorization middleware
- Validation middleware

---

## recruiter.types.ts

Contains:

- Interfaces
- DTOs
- Request types
- Response types
- Search filter types
- Pagination types

---

## recruiter.constants.ts

Contains:

- Business constants
- Validation limits
- Default pagination
- Default sorting
- Recruiter configuration constants

---

## index.ts

Exports all recruiter module components.

---

# Database Models

## Primary Model

User

---

## Related Models

Company

Department

---

## Future Related Models

Job

Application

Interview

Notification

AuditLog

---

# Recruiter Data Model

Recruiters use the existing **User** model.

There is **NO separate RecruiterProfile model**.

Recruiter-specific data is stored within the User entity.

Relevant recruiter fields include:

- role
- companyId
- departmentId
- designation
- experience
- mustChangePassword
- isActive
- deletedAt

The following information is inherited directly from the User model:

- First Name
- Last Name
- Email
- Phone
- Profile Image
- Password
- Created At
- Updated At

This avoids data duplication and maintains a single source of truth for user identity.

---

# Recruiter Architecture

HireStack uses a **single User model** for every authenticated account.

Recruiters are identified by:

```text
role = RECRUITER
```

No separate recruiter authentication system exists.

No recruiter profile table exists.

Authentication is handled by the Authentication module.

User identity is managed by the Users module.

Recruiter management is handled exclusively by this module.

---

# Recruiter Hierarchy

```text
SUPER_ADMIN
      │
      ▼
COMPANY
      │
      ▼
COMPANY_ADMIN
      │
      ▼
RECRUITER
```

Only Company Admins and Super Admins can manage recruiter accounts.

Recruiters cannot manage recruiter accounts.

---

# Recruiter Lifecycle

```text
Super Admin
      │
Create Company
      │
Create Company Admin
      │
Company Admin Login
      │
Create Department
      │
Create Recruiter
      │
Generate Temporary Password
      │
Recruiter Login
      │
Force Password Change
      │
Recruiter Active
```

---

# Recruiter Creation Flow

## Step 1

Company Admin logs in.

The authenticated JWT contains:

- User ID
- Role
- Company ID

---

## Step 2

Company Admin submits recruiter information.

Example:

- First Name
- Last Name
- Email
- Phone
- Designation
- Department
- Experience

The client never sends the company ID.

---

## Step 3

Backend derives the company ID from the authenticated user.

```text
companyId = authenticatedUser.companyId
```

This prevents cross-company recruiter creation.

---

## Step 4

Backend validates:

- Company exists
- Department exists
- Department belongs to the same company
- Department is active
- Email is unique

---

## Step 5

System generates a temporary password.

Password is securely hashed before storage.

---

## Step 6

A new User record is created.

```text
role = RECRUITER

companyId = authenticated company

departmentId = selected department

mustChangePassword = true

isActive = true
```

---

## Step 7

Recruiter logs in.

If:

```text
mustChangePassword = true
```

The user must change the password before accessing protected resources.

---

# Entity Relationships

```text
Company
    │
    ├───────────────┐
    │               │
Departments      Users
                    │
          role = RECRUITER
                    │
     ┌──────────────┼──────────────┐
     │              │              │
   Jobs       Applications    Interviews
```

Future modules reference the recruiter through the User model.

No additional recruiter entity is required.

---

# Core Business Concepts

The Recruiters module is built on the following architectural principles:

- Recruiters are Users.
- Authentication is centralized.
- Every recruiter belongs to exactly one company.
- Every recruiter belongs to exactly one department.
- Company ownership is immutable after creation.
- Department assignment is mandatory.
- Recruiters are managed only by authorized administrators.
- Multi-tenant isolation is enforced on every request.
- Business logic resides only in the service layer.
- Database operations reside only in the repository layer.

---

# End of Part 1
# 26. Recruiters Module Specification

# Part 2 — Business Rules, Permissions, Validation & API Specification

---

# Recruiter Roles

HireStack currently supports the following system roles.

| Role | Description |
|------|-------------|
| SUPER_ADMIN | Platform administrator |
| COMPANY_ADMIN | Company administrator |
| RECRUITER | Company recruiter |

Future roles may be introduced through the RBAC module without modifying the Recruiters module.

---

# Recruiter Permissions

## SUPER_ADMIN

Can:

- View recruiters across all companies
- Create recruiters
- Update recruiters
- Activate recruiters
- Deactivate recruiters
- Soft delete recruiters
- Restore recruiters
- View recruiter details

Cannot:

- Bypass authentication
- Modify protected system records directly

---

## COMPANY_ADMIN

Can:

- Create recruiters
- View company recruiters
- Search recruiters
- Update recruiters
- Assign departments
- Change recruiter department
- Activate recruiters
- Deactivate recruiters
- Soft delete recruiters
- Restore recruiters

Restrictions:

- Cannot manage recruiters from another company.
- Cannot modify Super Admin accounts.
- Cannot modify Company Admin accounts unless permitted by future Administration module.

---

## RECRUITER

Can:

- View own profile
- Update own profile (through Users module)
- Perform recruitment activities in future modules

Cannot:

- Create recruiters
- Delete recruiters
- Restore recruiters
- Assign departments
- Change recruiter roles
- Manage recruiter accounts

---

# Recruiter Status

Recruiter lifecycle is managed using the existing User model.

Status fields:

```text
isActive

deletedAt
```

Business Rules:

| State | Meaning |
|--------|----------|
| isActive = true | Recruiter can access the platform |
| isActive = false | Recruiter cannot authenticate |
| deletedAt != null | Recruiter is soft deleted |

No additional recruiter status values are used.

The Recruiters module does not introduce:

- ACTIVE
- INACTIVE
- SUSPENDED

These are represented using existing User fields.

---

# Company Ownership Rules

Every recruiter belongs to exactly one company.

Rules:

- Company is assigned during recruiter creation.
- Company ID is derived from the authenticated Company Admin.
- Client requests never provide companyId.
- Company ID cannot be modified after recruiter creation.
- Recruiters cannot move between companies.

If a recruiter joins another company:

A completely new recruiter account must be created.

---

# Department Assignment Rules

Every recruiter must belong to exactly one department.

Department assignment is mandatory.

Before assignment, the system validates:

- Department exists.
- Department belongs to the same company.
- Department is active.
- Department is not soft deleted.

Department changes are allowed only by:

- SUPER_ADMIN
- COMPANY_ADMIN

Recruiters cannot change their own department.

---

# Recruiter Creation Rules

Only:

- SUPER_ADMIN
- COMPANY_ADMIN

may create recruiters.

Recruiter creation process:

1. Validate authentication.
2. Validate authorization.
3. Validate department.
4. Validate email uniqueness.
5. Generate temporary password.
6. Hash password.
7. Create User.
8. Set role = RECRUITER.
9. Set mustChangePassword = true.
10. Return standardized response.

---

# Temporary Password Rules

Every newly created recruiter receives a temporary password.

Business Rules:

- Password is randomly generated.
- Password is securely hashed.
- Plain password is never stored.
- mustChangePassword is enabled.
- Recruiter must change password during first login.

---

# Recruiter Update Rules

Recruiters may update:

- First Name
- Last Name
- Phone
- Designation
- Experience
- Profile Image

Company Admin may additionally update:

- Department
- Active status

The following fields cannot be modified:

- Company
- Role
- Created Date

---

# Recruiter Activation Rules

Only:

- SUPER_ADMIN
- COMPANY_ADMIN

may activate recruiters.

Activation Rules:

- Recruiter must not be soft deleted.
- Company must remain active.
- Department must remain active.

Result:

```text
isActive = true
```

---

# Recruiter Deactivation Rules

Only:

- SUPER_ADMIN
- COMPANY_ADMIN

may deactivate recruiters.

Result:

```text
isActive = false
```

Effects:

- Recruiter cannot log in.
- Existing assignments remain.
- Future assignments are blocked.

---

# Recruiter Soft Delete Rules

Recruiters are never permanently deleted.

Delete operation performs:

```text
deletedAt = currentTimestamp
```

Effects:

- Hidden from default listings.
- Cannot authenticate.
- Historical references remain intact.
- Jobs retain recruiter references.
- Applications retain recruiter references.
- Interviews retain recruiter references.

---

# Recruiter Restore Rules

Restore operation performs:

```text
deletedAt = null
```

Business Rules:

- Original company remains.
- Original department remains.
- Original role remains.
- Original permissions remain.

---

# Validation Rules

## Create Recruiter

Required:

- First Name
- Last Name
- Email
- Department
- Designation

Optional:

- Phone
- Experience
- Avatar

---

## Name

Required

Maximum Length:

100 characters

Whitespace trimmed.

---

## Email

Required

Must:

- be valid
- be unique
- not already exist

---

## Phone

Optional

Must follow supported phone number format.

---

## Designation

Required

Maximum Length:

100 characters

---

## Experience

Optional

Must be:

Positive number.

---

## Department

Required

Rules:

- Must exist.
- Must belong to authenticated company.
- Must be active.
- Must not be soft deleted.

---

# Search

Keyword search supports:

- First Name
- Last Name
- Email
- Designation

---

# Filtering

Supported Filters

- Department
- Designation
- Active Status
- Deleted Status

Company filtering is intentionally not supported because every Company Admin is already restricted to their own tenant.

---

# Sorting

Supported Sorting

- Name
- Created Date
- Updated Date
- Department

Default:

Newest First

---

# Pagination

Pagination is mandatory.

Supported Parameters:

```text
page

limit

sortBy

sortOrder
```

Default page size should use the shared pagination constants.

---

# API Endpoints

## GET /recruiters

Description

Retrieve recruiters.

Authentication

Required.

Authorization

SUPER_ADMIN

COMPANY_ADMIN

Supports:

- Search
- Filter
- Sorting
- Pagination

---

## GET /recruiters/:id

Retrieve recruiter details.

Authorization:

SUPER_ADMIN

COMPANY_ADMIN

---

## POST /recruiters

Create recruiter.

Authorization:

SUPER_ADMIN

COMPANY_ADMIN

---

## PATCH /recruiters/:id

Update recruiter.

Authorization:

SUPER_ADMIN

COMPANY_ADMIN

---

## PATCH /recruiters/:id/department

Change recruiter department.

Authorization:

SUPER_ADMIN

COMPANY_ADMIN

---

## PATCH /recruiters/:id/activate

Activate recruiter.

Authorization:

SUPER_ADMIN

COMPANY_ADMIN

---

## PATCH /recruiters/:id/deactivate

Deactivate recruiter.

Authorization:

SUPER_ADMIN

COMPANY_ADMIN

---

## DELETE /recruiters/:id

Soft delete recruiter.

Authorization:

SUPER_ADMIN

COMPANY_ADMIN

---

## PATCH /recruiters/:id/restore

Restore recruiter.

Authorization:

SUPER_ADMIN

COMPANY_ADMIN

---

# Standard Response Format

Every endpoint must return standardized API responses.

Success:

- success
- message
- data
- meta (when paginated)

Error:

- success
- message
- error

Use the shared response formatter.

---

# Error Handling

| HTTP Code | Description |
|-----------|-------------|
| 400 | Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Recruiter Not Found |
| 409 | Email Already Exists |
| 422 | Invalid Department Assignment |
| 500 | Internal Server Error |

Internal database errors must never be exposed.

---

# End of Part 2
# 26. Recruiters Module Specification

# Part 3 — Security, Dependencies, Future Enhancements & AI Implementation Guide

---

# Security Requirements

Security is a core requirement of the Recruiters module.

Every operation must enforce authentication, authorization, validation, and tenant isolation.

---

# Authentication

All recruiter endpoints require authentication.

Authentication is handled by the Authentication module using JWT.

Every authenticated request must contain a valid access token.

Unauthenticated requests must return:

```text
401 Unauthorized
```

---

# Authorization

Role-based authorization must be enforced on every protected endpoint.

## SUPER_ADMIN

May perform all recruiter management operations across every company.

---

## COMPANY_ADMIN

May manage recruiters only within their own company.

Cannot perform operations on recruiters belonging to another company.

---

## RECRUITER

Cannot perform recruiter management operations.

May only access recruiter functionality explicitly granted by future modules.

---

# Multi-Tenant Isolation

HireStack is a multi-tenant platform.

Every recruiter operation must enforce strict tenant isolation.

The authenticated user's company determines accessible data.

Company ownership must never be supplied by the client.

Correct:

```text
companyId = authenticatedUser.companyId
```

Incorrect:

```text
companyId = request.body.companyId
```

Client-supplied company IDs must always be ignored.

---

# Company Ownership Validation

Before any recruiter operation, validate:

- Recruiter exists.
- Recruiter belongs to authenticated company.
- Company is active.
- Recruiter is not permanently unavailable.

If validation fails:

```text
403 Forbidden
```

---

# Department Validation

Before assigning or changing a department:

Validate:

- Department exists.
- Department belongs to authenticated company.
- Department is active.
- Department is not soft deleted.

Reject invalid assignments.

---

# Data Protection

Sensitive information must never be exposed.

Never return:

- Password
- Password Hash
- Refresh Tokens
- Internal Authentication Fields
- Security Metadata

API responses must expose only public recruiter information.

---

# Input Validation

Every request must be validated using Zod.

Validation occurs before entering the service layer.

Reject:

- Unknown fields
- Invalid data types
- Invalid UUIDs
- Invalid emails
- Invalid phone numbers

---

# Business Rule Enforcement

Business rules belong exclusively in the Service layer.

Examples:

- Company ownership
- Department validation
- Recruiter creation rules
- Recruiter activation rules
- Soft delete rules

Repositories must never implement business logic.

---

# Repository Rules

Repositories communicate only with Prisma.

Repositories must:

- Execute database queries
- Return database models
- Never perform authorization
- Never validate permissions
- Never contain business rules

---

# Controller Rules

Controllers must remain thin.

Controllers are responsible for:

- Receiving HTTP requests
- Calling validation
- Invoking service methods
- Returning standardized responses

Controllers must never:

- Access Prisma
- Implement business logic
- Handle authorization decisions

---

# Service Rules

Services are responsible for:

- Business logic
- Validation orchestration
- Authorization checks
- Company ownership validation
- Department validation
- Recruiter lifecycle management

Services must never access Express Request or Response objects.

---

# Logging

Unexpected failures should be logged using the shared logging infrastructure.

Do not expose stack traces to API consumers.

Production responses should contain generic error messages.

---

# Audit Logging (Future)

Recruiter operations should support future audit logging.

Examples:

- Recruiter created
- Recruiter updated
- Department changed
- Recruiter activated
- Recruiter deactivated
- Recruiter deleted
- Recruiter restored

Audit logging implementation belongs to the future Audit module.

---

# Dependencies

The Recruiters module depends on:

## Internal Modules

- Authentication
- Users
- Companies
- Departments
- Shared

---

## Middleware

- Authentication Middleware
- Authorization Middleware
- Validation Middleware
- Error Handler

---

## Shared Utilities

- Response Formatter
- Pagination Utility
- Error Classes
- Logger
- Constants

---

## External Libraries

- Prisma
- PostgreSQL
- Zod
- Express
- TypeScript

---

# Performance Guidelines

Repositories should:

- Use Prisma `select` instead of `include` unless related data is required.
- Avoid unnecessary nested queries.
- Support pagination for list endpoints.
- Filter data at the database level.
- Return only required fields.

Avoid N+1 query problems.

---

# Future Compatibility

This architecture is intentionally designed to support future modules without requiring schema redesign.

Future integrations include:

## Jobs Module

Recruiters create and manage job postings.

Relationship:

```text
Job
──────────────
assignedRecruiterId

↓

User.id
```

---

## Applications Module

Applications may be assigned to recruiters.

Relationship:

```text
Application
──────────────────
assignedRecruiterId

↓

User.id
```

---

## Interviews Module

Recruiters schedule and conduct interviews.

Relationship:

```text
Interview
────────────────
recruiterId

↓

User.id
```

---

## Notifications Module

Recruiters receive:

- Job notifications
- Candidate updates
- Interview reminders
- System alerts

---

## Audit Module

All recruiter operations should generate audit events.

---

## Analytics Module

Future recruiter analytics may include:

- Jobs Managed
- Applications Reviewed
- Interviews Conducted
- Hiring Success Rate
- Average Time-to-Hire
- Recruiter Performance Metrics

Analytics should consume recruiter data.

The Recruiters module should not calculate analytics directly.

---

# Future Enhancements

Potential future improvements include:

- Recruiter Teams
- Team Leads
- Recruiter Notes
- Recruiter Activity Timeline
- Internal Messaging
- Recruiter Workload Distribution
- Recruiter Performance Dashboard
- Hiring Targets
- Bulk Recruiter Import
- Bulk Recruiter Export

These enhancements should remain backward compatible with the existing architecture.

---

# Coding Notes for AI Agent

Before implementation, review:

- 10-System-Architecture.md
- 12-Database-Schema-Specification.md
- 13-API-Standards.md
- 15-Backend-Folder-Architecture.md
- 17-Security-Specification.md
- 18-Coding-Standards-Git-Workflow.md

---

# Implementation Rules

The implementation must follow these principles:

- Use Controller → Service → Repository architecture.
- Repository communicates only with Prisma.
- Services contain all business logic.
- Controllers remain thin.
- Validate every request using Zod.
- Enforce tenant isolation.
- Never trust client-supplied companyId.
- Validate department ownership.
- Support pagination.
- Support filtering.
- Support sorting.
- Use standardized API responses.
- Throw shared application errors.
- Use existing shared middleware.
- Follow existing project coding standards.
- Generate production-ready code only.

---

# Module Completion Checklist

Before marking the Recruiters module complete, verify:

- Recruiter creation works.
- Recruiter update works.
- Recruiter listing supports pagination.
- Search works.
- Filters work.
- Sorting works.
- Department assignment is validated.
- Company isolation is enforced.
- Soft delete works.
- Restore works.
- Activate works.
- Deactivate works.
- Validation is complete.
- Authorization is complete.
- Error handling is standardized.
- API responses follow shared format.
- Repository contains no business logic.
- Service contains all business logic.
- Controllers remain thin.
- No duplicate recruiter data exists.
- No separate RecruiterProfile model exists.

---

# Final Architecture Summary

The Recruiters module is a business management module.

A recruiter is **not** a separate database entity.

A recruiter is a standard **User** whose role is:

```text
RECRUITER
```

Authentication is handled by the Authentication module.

Identity is managed by the Users module.

Recruiter management is handled by this module.

Departments organize recruiters within a company.

Jobs, Applications, and Interviews reference recruiters through the User model.

This architecture provides:

- Single source of truth
- Clean separation of concerns
- Multi-tenant security
- Scalability
- Maintainability
- Future compatibility

without requiring schema redesign.

---

# Review Status

| Category | Status |
|----------|--------|
| Architecture | ✅ Approved |
| Business Rules | ✅ Approved |
| Database Design | ✅ Approved |
| API Design | ✅ Approved |
| Security | ✅ Approved |
| Multi-Tenant Design | ✅ Approved |
| Future Compatibility | ✅ Approved |
| Production Readiness | ✅ Approved |

---

# Recruiters Module Status

```text
Architecture      ✅ Finalized
PRD               ✅ Finalized
Review            ✅ Completed
Ready for Coding  ✅ Yes
```

---

**End of Recruiters Module Specification**