# 27. Jobs Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Jobs |
| Folder | `src/modules/jobs` |
| Priority | Critical |
| Architecture | Controller → Service → Repository |
| Depends On | Authentication, Users, Companies, Departments, Recruiters |
| Database Models | Job, JobRecruiter, Skill, JobSkill |
| Related Models | Company, Department, User |
| Future Models | Application, Interview, Offer, AuditLog, Notification |

---

# Module Purpose

The Jobs module is responsible for managing the complete lifecycle of job requisitions within HireStack.

It enables Company Admins and Recruiters to create, manage, publish, assign, pause, reopen, close, archive and search job postings while enforcing strict company isolation, department ownership and recruiter assignment.

The Jobs module serves as the central entity of the recruitment workflow and acts as the parent module for Applications, Interviews, Offers, Analytics and Reporting.

This module is responsible only for job management and does not manage candidates, interviews or offers.

---

# Module Scope

The Jobs module owns:

- Job creation
- Job updates
- Job lifecycle
- Recruiter assignment
- Department association
- Skill mapping
- Search
- Filtering
- Pagination
- Sorting
- Job visibility
- Job publication
- Job archiving
- Job restoration
- Soft deletion

This module does NOT own:

- Candidate management
- Applications
- Interviews
- Offers
- Notifications
- Authentication
- Company management
- Department management
- Recruiter management
- Resume parsing
- Analytics

These modules integrate with Jobs through relationships.

---

# Responsibilities

The Jobs module is responsible for:

### Job Management

- Create Job
- View Job
- Update Job
- Soft Delete Job
- Restore Job

### Lifecycle Management

- Save Draft
- Publish Job
- Open Job
- Pause Job
- Reopen Job
- Close Job
- Archive Job

### Recruiter Management

- Assign Recruiters
- Remove Recruiters
- View Assigned Recruiters

### Department Management

- Associate Department
- Change Department
- Validate Department Ownership

### Skills

- Associate Skills
- Remove Skills
- Retrieve Job Skills

### Search

- Keyword Search
- Filtering
- Pagination
- Sorting

### Future Integrations

The module exposes relationships for:

- Applications
- Interviews
- Offers
- Audit Logs
- Notifications
- Analytics

---

# Folder Structure

```text
src/
└── modules/
    └── jobs/
        ├── job.controller.ts
        ├── job.service.ts
        ├── job.repository.ts
        ├── job.routes.ts
        ├── job.validation.ts
        ├── job.types.ts
        ├── job.constants.ts
        └── index.ts
```

---

# File Responsibilities

## job.controller.ts

Responsibilities

- Receive HTTP requests
- Validate request payloads
- Call service layer
- Return standardized API responses

Must NOT

- Access Prisma directly
- Implement business logic
- Perform authorization logic

---

## job.service.ts

Responsibilities

- Business rules
- Job lifecycle management
- Publish validation
- Department validation
- Recruiter assignment
- Company ownership validation
- Status transition validation
- Permission validation
- Search orchestration
- Filtering logic

Must NOT

- Execute raw Prisma queries

---

## job.repository.ts

Responsibilities

- Prisma queries
- CRUD operations
- Pagination
- Search queries
- Filtering
- Database transactions

Repository contains NO business logic.

---

## job.validation.ts

Contains Zod schemas for:

- Create Job
- Update Job
- Publish Job
- Pause Job
- Close Job
- Archive Job
- Restore Job
- Assign Recruiters
- Remove Recruiters
- Search
- Filtering
- Pagination

---

## job.routes.ts

Contains

- Express Router
- Route definitions
- Middleware registration

---

## job.types.ts

Contains

- DTOs
- Request Types
- Response Types
- Interfaces
- Enum exports

---

## job.constants.ts

Contains

- Employment Types
- Workplace Types
- Job Status
- Visibility
- Pagination Defaults
- Validation Limits
- Error Messages

---

# Database Models

## Primary Models

- Job
- JobRecruiter
- Skill
- JobSkill

---

## Related Models

- Company
- Department
- User

---

## Future Models

- Application
- Interview
- Offer
- AuditLog
- Notification

---

# Database Relationships

```text
Company
    │
    ▼
Department
    │
    ▼
Job
├──────────────┐
│              │
▼              ▼
JobRecruiter   JobSkill
│              │
▼              ▼
User         Skill

Future

Job
│
├── Applications
├── Interviews
├── Offers
├── Notifications
├── Audit Logs
└── Analytics
```

---

# Job Entity

Each Job stores:

- Company
- Department
- Job Code
- Title
- Description
- Responsibilities
- Requirements
- Benefits
- Employment Type
- Workplace Type
- Minimum Experience
- Maximum Experience
- Salary Minimum
- Salary Maximum
- Currency
- Location
- Number of Openings
- Visibility
- Status
- Closing Date
- Published Date
- Archived Date
- Created By
- Created Date
- Updated Date
- Soft Delete Timestamp

---

# Supporting Models

## JobRecruiter

Maps recruiters to jobs.

Purpose

- Multiple recruiters per job
- Multiple jobs per recruiter

Stores

- Job
- Recruiter
- Assigned By
- Assigned Date

---

## Skill

Stores reusable skills.

Examples

- Java
- React
- Node.js
- PostgreSQL
- Docker

---

## JobSkill

Maps skills to jobs.

Supports

- Skill filtering
- Candidate matching
- Analytics
- AI recommendations

---

# Enumerations

## Employment Type

- FULL_TIME
- PART_TIME
- CONTRACT
- INTERNSHIP
- TEMPORARY
- FREELANCE

---

## Workplace Type

- ONSITE
- REMOTE
- HYBRID

---

## Job Status

- DRAFT
- PUBLISHED
- OPEN
- PAUSED
- CLOSED
- ARCHIVED

---

## Visibility

- INTERNAL
- PUBLIC
- PRIVATE

---

# Design Principles

The Jobs module follows these architectural principles:

- Company isolation
- Department ownership
- Multi-recruiter support
- Soft delete only
- Future-ready schema
- Normalized database design
- Controller → Service → Repository architecture
- Business logic isolated in services
- Repository layer contains only Prisma operations
- Zod validation for every request
- Standardized API responses
- Production-ready coding standards

---
# API Endpoints

All endpoints follow the project's API standards.

Base URL

```
/api/v1/jobs
```

All recruiter and company admin endpoints require authentication.

Company isolation is enforced automatically using the authenticated user's company.

The client must never send or modify `companyId`.

---

# Create Job

## POST

```
POST /jobs
```

Purpose

Create a new job in **Draft** status.

Authentication

- Company Admin
- Recruiter

Request Body

```ts
{
  title: string;
  departmentId: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location?: string;
  openings: number;
  visibility?: Visibility;
  closingDate?: Date;
  recruiterIds?: string[];
  skillIds?: string[];
}
```

Response

```
201 Created
```

Creates the job in **DRAFT** status.

---

# Get Jobs

## GET

```
GET /jobs
```

Purpose

Retrieve jobs with search, filtering, pagination and sorting.

Authentication

- Company Admin
- Recruiter

Supports

- Search
- Filters
- Sorting
- Pagination

---

# Get Job By ID

## GET

```
GET /jobs/:id
```

Purpose

Retrieve complete job details.

Authentication

- Company Admin
- Recruiter

Returns

- Job
- Department
- Assigned Recruiters
- Skills

---

# Update Job

## PATCH

```
PATCH /jobs/:id
```

Purpose

Update editable job information.

Authentication

- Company Admin
- Assigned Recruiter

Editable Fields

- Title
- Description
- Requirements
- Responsibilities
- Benefits
- Employment Type
- Workplace Type
- Salary
- Experience
- Department
- Skills
- Recruiters
- Closing Date

---

# Publish Job

## PATCH

```
PATCH /jobs/:id/publish
```

Purpose

Publish a draft job.

Authentication

- Company Admin
- Assigned Recruiter

Validation

Publishing succeeds only if mandatory fields are complete.

---

# Open Job

## PATCH

```
PATCH /jobs/:id/open
```

Purpose

Move a published job into OPEN status.

Authentication

- Company Admin
- Assigned Recruiter

---

# Pause Job

## PATCH

```
PATCH /jobs/:id/pause
```

Purpose

Temporarily stop accepting applications.

Authentication

- Company Admin
- Assigned Recruiter

---

# Reopen Job

## PATCH

```
PATCH /jobs/:id/reopen
```

Purpose

Reopen a paused job.

Authentication

- Company Admin
- Assigned Recruiter

---

# Close Job

## PATCH

```
PATCH /jobs/:id/close
```

Purpose

Close a job permanently.

Authentication

- Company Admin
- Assigned Recruiter

---

# Archive Job

## PATCH

```
PATCH /jobs/:id/archive
```

Purpose

Archive a closed job.

Authentication

- Company Admin
- Assigned Recruiter

---

# Restore Job

## PATCH

```
PATCH /jobs/:id/restore
```

Purpose

Restore a soft deleted job.

Authentication

- Company Admin

---

# Delete Job

## DELETE

```
DELETE /jobs/:id
```

Purpose

Soft delete a job.

Authentication

- Company Admin

Deletes by setting:

- deletedAt
- isActive = false

---

# Assign Recruiters

## POST

```
POST /jobs/:id/recruiters
```

Purpose

Assign one or more recruiters.

Authentication

- Company Admin

Body

```ts
{
    recruiterIds: string[];
}
```

---

# Remove Recruiter

## DELETE

```
DELETE /jobs/:id/recruiters/:recruiterId
```

Purpose

Remove recruiter assignment.

Authentication

- Company Admin

---

# Search & Filtering

Supported Search Fields

- Job Title
- Job Code

Supported Filters

- Status
- Department
- Employment Type
- Workplace Type
- Recruiter
- Created Date
- Closing Date

Sorting

- Latest
- Oldest
- Recently Updated
- Closing Soon

Pagination

Required

Default pagination values are defined in
`job.constants.ts`.

---

# Validation Rules

## Title

Required

Minimum

3 characters

Maximum

150 characters

---

## Description

Required

Maximum

10,000 characters

---

## Responsibilities

Optional

Maximum

10,000 characters

---

## Requirements

Optional

Maximum

10,000 characters

---

## Benefits

Optional

Maximum

5,000 characters

---

## Department

Required

Must belong to authenticated company.

---

## Employment Type

Required

Must be valid enum.

---

## Workplace Type

Required

Must be valid enum.

---

## Experience

Minimum Experience

Cannot be negative.

Maximum Experience

Cannot be less than minimum.

---

## Salary

Minimum Salary

Cannot be negative.

Maximum Salary

Must be greater than or equal to minimum.

Currency

Must be valid ISO currency code.

---

## Openings

Required

Minimum

```
1
```

---

## Recruiters

Every assigned recruiter

- must exist
- must belong to the same company
- must have RECRUITER role

---

## Skills

Every skill must exist.

Duplicate skills are ignored.

---

## Closing Date

Optional.

If provided,

Must be a future date.

---

# Business Rules

## Company Isolation

Every job belongs to exactly one company.

Company cannot be changed after creation.

Company is inferred from authentication.

---

## Department Ownership

Every job belongs to one department.

Department must belong to the same company.

Department can be changed later.

---

## Recruiter Assignment

A recruiter may manage multiple jobs.

A job may have multiple recruiters.

Publishing requires at least one assigned recruiter.

---

## Job Lifecycle

Jobs follow this lifecycle

```
DRAFT
   ↓
PUBLISHED
   ↓
OPEN
 ├────► PAUSED
 │         │
 └─────────┘
     ↓
CLOSED
     ↓
ARCHIVED
```

Allowed transitions

| Current | Next |
|----------|------|
| DRAFT | PUBLISHED |
| PUBLISHED | OPEN |
| OPEN | PAUSED, CLOSED |
| PAUSED | OPEN, CLOSED |
| CLOSED | ARCHIVED |
| ARCHIVED | None |

Invalid transitions must be rejected.

---

## Publishing Rules

A job cannot be published unless:

- Title exists
- Department exists
- Description exists
- Employment Type exists
- Workplace Type exists
- At least one recruiter assigned
- Openings > 0

---

## Pause Rules

Paused jobs

- stop accepting applications
- keep existing applications
- keep interviews

---

## Close Rules

Closed jobs

- reject new applications
- preserve historical data
- remain visible internally

---

## Archive Rules

Archived jobs

- become read-only
- cannot be edited
- cannot receive applications

---

## Soft Delete Rules

Deleting a job

- sets deletedAt
- sets isActive = false

No hard delete is permitted.

---

# Permission Matrix

| Action | Super Admin | Company Admin | Recruiter |
|----------|:----------:|:-------------:|:---------:|
| View Jobs | ✅ | ✅ | ✅ (assigned/company scope) |
| Create Job | ❌ | ✅ | ✅ |
| Update Job | ❌ | ✅ | ✅ (assigned only) |
| Publish Job | ❌ | ✅ | ✅ (assigned only) |
| Open Job | ❌ | ✅ | ✅ (assigned only) |
| Pause Job | ❌ | ✅ | ✅ (assigned only) |
| Close Job | ❌ | ✅ | ✅ (assigned only) |
| Archive Job | ❌ | ✅ | ✅ (assigned only) |
| Delete Job | ❌ | ✅ | ❌ |
| Restore Job | ❌ | ✅ | ❌ |
| Assign Recruiters | ❌ | ✅ | ❌ |
| Remove Recruiters | ❌ | ✅ | ❌ |

---

# Error Handling

Return standardized API responses.

Common Status Codes

| Status | Meaning |
|---------|---------|
| 400 | Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Job Not Found |
| 409 | Business Rule Violation |
| 422 | Invalid Status Transition |
| 500 | Internal Server Error |

Never expose

- Prisma errors
- SQL errors
- Internal stack traces

---

# Security Requirements

The Jobs module must enforce:

- Authentication
- Role-based authorization
- Company isolation
- Department ownership validation
- Recruiter ownership validation
- Status transition validation
- Soft delete filtering
- Request validation using Zod
- Service-layer permission checks
- Repository layer limited to database operations

The client must never send or modify:

- companyId
- createdBy
- publishedAt
- archivedAt
- deletedAt

These values are managed internally by the application.

# Dependencies

The Jobs module depends on the following modules and shared components.

---

## Internal Module Dependencies

### Authentication Module

Responsibilities

- Authenticate requests
- Validate JWT tokens
- Populate authenticated user context

---

### Users Module

Used for

- Job creator
- Recruiter information
- Recruiter assignment
- Permission checks

---

### Companies Module

Used for

- Company ownership
- Company isolation
- Company validation

---

### Departments Module

Used for

- Department ownership
- Department validation
- Department assignment

---

### Recruiters Module

Used for

- Recruiter validation
- Recruiter assignment
- Recruiter permissions

---

## Shared Components

The Jobs module uses

- Authentication Middleware
- Authorization Middleware
- Zod Validation
- Shared Response Formatter
- Shared Error Handler
- Pagination Utility
- Prisma Client
- Logger
- Constants
- Utility Functions

---

# Future Integrations

The Jobs module is designed to integrate seamlessly with future HireStack modules.

---

## Applications Module

Relationship

```
Job (1)
    │
    ▼
Applications (*)
```

Future Features

- Apply to Job
- Withdraw Application
- Track Application Status
- Candidate Pipeline

---

## Interviews Module

Relationship

```
Job
   │
Applications
   │
Interviews
```

Future Features

- Schedule Interview
- Interview Feedback
- Interview Stages

---

## Offers Module

Relationship

```
Job
    │
Application
    │
Offer
```

Future Features

- Offer Creation
- Offer Approval
- Offer Acceptance
- Offer Rejection

---

## Analytics Module

Future Metrics

- Active Jobs
- Closed Jobs
- Average Hiring Time
- Applications Per Job
- Recruiter Performance
- Department Performance
- Hiring Funnel

---

## Notification Module

The Jobs module should emit notification events.

Examples

- Job Created
- Job Published
- Recruiter Assigned
- Recruiter Removed
- Job Closed
- Job Archived
- Closing Date Reminder

The Notification module will handle event delivery.

---

## Audit Log Module

Every important action should generate an audit event.

Audit Events

- Job Created
- Job Updated
- Job Published
- Job Opened
- Job Paused
- Job Reopened
- Job Closed
- Job Archived
- Job Deleted
- Job Restored
- Recruiter Assigned
- Recruiter Removed
- Department Changed
- Skills Updated

Each audit record should contain

- Action
- Entity
- Entity ID
- User ID
- Company ID
- Timestamp
- Metadata (if applicable)

---

# Performance Considerations

The Jobs module must remain performant as the number of jobs grows.

Recommended Indexes

Job

- companyId
- departmentId
- status
- title
- jobCode
- createdBy
- deletedAt

JobRecruiter

- recruiterId
- jobId

JobSkill

- jobId
- skillId

General Guidelines

- Always paginate list endpoints.
- Never load unnecessary relations.
- Use Prisma `select` where possible instead of returning full records.
- Avoid N+1 query problems.
- Filter soft-deleted records by default.

---

# Coding Standards

Implementation must follow the project architecture.

## Controller Layer

Responsible for

- HTTP request handling
- Request validation
- Calling services
- Returning standardized responses

Must NOT

- Query Prisma
- Contain business logic

---

## Service Layer

Responsible for

- Business logic
- Permission checks
- Lifecycle validation
- Company ownership validation
- Department validation
- Recruiter assignment
- Status transition validation

Must NOT

- Execute raw Prisma queries

---

## Repository Layer

Responsible for

- Database operations
- Prisma queries
- Transactions
- Search queries

Must NOT

- Implement business logic

---

# Validation Standards

Every incoming request must be validated using Zod.

Validation should include

- Required fields
- Enum validation
- UUID validation
- Date validation
- Numeric limits
- String length limits
- Cross-field validation (e.g. salaryMin ≤ salaryMax)

Business validations belong in the Service layer.

---

# API Standards

All responses must use the shared response formatter.

Example Success Response

```json
{
  "success": true,
  "message": "Job created successfully.",
  "data": {}
}
```

Example Error Response

```json
{
  "success": false,
  "message": "Unable to publish job.",
  "errors": []
}
```

---

# Logging

Log meaningful events only.

Recommended Logs

- Job created
- Job updated
- Publish attempt
- Status transition
- Recruiter assignment
- Permission failure
- Validation failure

Do not log

- Passwords
- JWT tokens
- Sensitive personal information

---

# Testing Requirements

Implementation should include tests for

## Unit Tests

- Service methods
- Validation logic
- Status transitions
- Permission checks

---

## Integration Tests

- API endpoints
- Authentication
- Authorization
- Database operations

---

## Edge Cases

- Invalid department
- Invalid recruiter
- Cross-company access
- Duplicate recruiter assignment
- Publishing incomplete job
- Invalid status transition
- Soft-deleted job access
- Invalid experience range
- Invalid salary range

---

# Future Enhancements

The architecture intentionally supports future features without schema redesign.

Potential Enhancements

- AI Job Description Generator
- AI Salary Recommendation
- AI Candidate Matching
- Job Templates
- Job Approval Workflow
- Auto Expiration Scheduler
- Multi-language Jobs
- Candidate Recommendation Engine
- Internal Hiring Workflows
- Bulk Job Import
- Bulk Job Export
- Duplicate Job Detection
- Hiring Campaigns
- Advanced Reporting
- Custom Hiring Pipelines

---

# AI Coding Notes

Before implementation, review the following project documentation:

- `10-System-Architecture.md`
- `12-Database-Schema-Specification.md`
- `13-API-Standards.md`
- `15-Backend-Folder-Architecture.md`
- `17-Security-Specification.md`
- `18-Coding-Standards-Git-Workflow.md`

Implementation Rules

- Follow Controller → Service → Repository architecture.
- Repository layer contains only Prisma operations.
- Services contain all business logic.
- Validate every request using Zod.
- Enforce company isolation.
- Enforce department ownership.
- Enforce recruiter ownership where applicable.
- Validate all lifecycle transitions.
- Use soft delete (`deletedAt`) instead of hard delete.
- Return standardized API responses.
- Keep controllers thin.
- Write clean, production-ready TypeScript.
- Follow project ESLint and Prettier rules.
- Reuse shared utilities wherever possible.
- Avoid code duplication.

---

# Acceptance Criteria

The Jobs module is considered complete when:

- Job CRUD operations are fully implemented.
- Job lifecycle transitions follow the approved workflow.
- Recruiter assignment works correctly.
- Department ownership is enforced.
- Company isolation is enforced.
- Search, filtering, sorting and pagination work correctly.
- Validation rules are enforced.
- Permission checks are implemented.
- Soft delete is implemented.
- API responses follow project standards.
- Repository layer contains only database logic.
- Service layer contains all business logic.
- Code passes linting and formatting.
- Tests pass successfully.

---

# Final Development Notes

The Jobs module is the foundation of the HireStack recruitment engine.

Future modules—including Applications, Interviews, Offers, Analytics and Notifications—will rely on the relationships and business rules defined here.

Developers must avoid introducing business logic into controllers or repositories and should preserve the separation of concerns established across the project.

Any future enhancements should extend the module through new relationships and services rather than modifying the core Job entity unless a documented architectural review approves the change.

---

# End of Jobs Module Specification