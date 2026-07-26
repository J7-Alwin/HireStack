# 29. Interview Management Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Interview Management |
| Version | 1.0 |
| Priority | Core |
| Depends On | Shared, Authentication, Users, Companies, Recruiters, Jobs, Candidates, Applications |
| Primary Users | Company Admin, Assigned Recruiter |

---

# Module Purpose

The Interview Management module manages the complete interview lifecycle for candidate applications.

It enables authorized users to schedule interviews, assign interviewers, manage interview execution, record interview outcomes, and maintain interview history while enforcing company isolation and standardized recruitment workflows.

This module bridges the Applications module with future Offer Management and Hiring Pipeline modules without directly making hiring decisions.

---

# Objectives

The Interview Management module aims to:

- Schedule interviews for applications.
- Support multiple interviews for a single application.
- Assign one or more interviewers.
- Manage interview status throughout its lifecycle.
- Record interview outcomes and recruiter result notes.
- Support interview rescheduling and cancellation.
- Prevent interviewer scheduling conflicts.
- Enforce company-level data isolation.
- Provide searchable and filterable interview records.
- Maintain compatibility with future ATS modules.

---

# Scope

## Included

- Interview scheduling
- Interview updates
- Interview cancellation
- Interview rescheduling
- Interview status management
- Interview outcome recording
- Recruiter result notes
- Interviewer assignment
- Search
- Filtering
- Sorting
- Pagination
- Soft delete
- Company isolation
- Role-based authorization

---

## Excluded

The following capabilities are intentionally excluded from Version 1:

- Calendar integrations
- Email notifications
- SMS notifications
- Video meeting integrations
- Interview feedback forms
- Individual interviewer scoring
- AI interview evaluation
- Audit history
- Activity timeline
- Offer generation
- Hiring decisions

These capabilities will be introduced in future modules without requiring architectural changes.

---

# Design Principles

The Interview Management module follows the core HireStack architectural principles.

## Single Responsibility

The module manages interview scheduling and execution only.

Hiring decisions remain outside this module.

---

## Separation of Concerns

### Controllers

- Handle HTTP requests.
- Validate input.
- Invoke services.
- Return standardized responses.

### Services

- Implement business rules.
- Validate interview workflow.
- Manage authorization.
- Coordinate Prisma transactions.

### Repositories

- Perform all Prisma database operations.
- Handle searching, filtering, and pagination.

---

## Multi-Tenant Isolation

Every Interview belongs to a single Company through its parent Application.

Every request must be scoped to the authenticated Company.

Cross-company access is strictly prohibited.

---

## Scalability

The architecture supports future integration with:

- Offer Management
- Hiring Pipeline
- Calendar
- Notifications
- Analytics
- Audit Logs
- Activity Timeline
- AI Interview Evaluation

without requiring breaking API or database changes.

---

# Module Overview

An Interview represents a single scheduled interview event for an Application.

Each Interview contains:

- Business classification (Interview Type)
- Interview round
- Scheduling information
- Assigned interviewers
- Interview mode
- Current status
- Final outcome
- Recruiter result notes
- Administrative notes

One Application may contain multiple Interview records.

---

# Responsibilities

The Interview Management module is responsible for:

- Scheduling interviews.
- Updating interview schedules.
- Managing interview lifecycle.
- Assigning interviewers.
- Recording interview outcomes.
- Recording recruiter result notes.
- Cancelling interviews.
- Rescheduling interviews.
- Preventing interviewer scheduling conflicts.
- Providing interview search and filtering.
- Enforcing company isolation.

The module is not responsible for:

- Offer creation
- Candidate hiring
- Calendar synchronization
- Notifications
- Interview scoring
- AI recommendations

---

# Module Dependencies

The Interview Management module depends on:

- Shared
- Authentication
- Users
- Companies
- Recruiters
- Jobs
- Candidates
- Applications

No dependency exists on future modules.

---

# Architecture

```
Company
    │
Application
    │
Interview
    │
InterviewInterviewer
    │
User
```

Relationship Summary

```
Company
    │
Application
    │
Interviews (Multiple)
    │
InterviewInterviewer (Multiple)
    │
Users
```

One Application may contain multiple Interviews.

Each Interview may contain one or more Interviewers.

---

# Permission Model

## Company Admin

May:

- Schedule interviews
- Update interviews
- Reschedule interviews
- Cancel interviews
- Assign interviewers
- Record interview outcomes
- Record recruiter result notes
- View all company interviews

---

## Assigned Recruiter

May:

- Schedule interviews
- Update interviews
- Reschedule interviews
- Cancel interviews
- Assign interviewers
- Record interview outcomes
- Record recruiter result notes
- View interviews for assigned applications

---

## Other Recruiters

May:

- View interviews according to company visibility rules

Cannot:

- Schedule interviews
- Update interviews
- Cancel interviews
- Record outcomes
- Assign interviewers

---

## Super Admin

Super Admin has no Interview Management permissions.

Platform administration remains completely separate from recruitment operations.

---

# Folder Structure

```
src/modules/interviews/

├── controller/
├── service/
├── repository/
├── routes/
├── validation/
├── dto/
├── constants/
├── types/
├── utils/
└── index.ts
```

---

# File Responsibilities

## Controller

- Handle HTTP requests.
- Validate incoming payloads.
- Invoke Services.
- Return standardized API responses.

---

## Service

- Schedule interviews.
- Validate interview lifecycle.
- Validate interviewer availability.
- Apply authorization rules.
- Manage transactions.
- Record interview outcomes.

---

## Repository

- Perform all Prisma operations.
- Handle searching.
- Handle filtering.
- Handle pagination.
- Execute transaction-aware database operations.

---

## Validation

Contains:

- Zod request schemas
- Query validation
- Business validation helpers

---

## Constants

Store:

- Interview Types
- Interview Rounds
- Interview Statuses
- Interview Modes
- Interview Outcomes
- Error Messages

---

## Utils

Utility helpers for:

- Date validation
- Time validation
- Scheduling validation
- Interview overlap detection
- Future calendar integration

---
---

# Database Design

The Interview Management module is centered around the **Interview** entity.

Each Interview represents one scheduled interview event for one Application.

An Application may have multiple Interviews throughout its recruitment lifecycle.

---

# Entity Relationships

```
Company
   │
Application
   │
Interview
   │
InterviewInterviewer
   │
User
```

Relationship Summary

```
Company
    │
    └── Applications

Application 1 ───────────── N Interviews

Interview 1 ─────────────── N InterviewInterviewers

User 1 ──────────────────── N InterviewInterviewers
```

---

# Primary Entity

## Interview

The Interview entity stores scheduling, execution, and outcome information for a single interview event.

---

# Core Fields

| Field | Description |
|--------|-------------|
| id | UUID Primary Key |
| interviewCode | Human-readable interview identifier |
| companyId | Owning company |
| applicationId | Parent application |
| interviewType | Business classification of the interview |
| round | Interview round |
| status | Interview lifecycle status |
| outcome | Final interview result |
| mode | Interview mode |
| scheduledDate | Interview date |
| startTime | Scheduled start time |
| endTime | Scheduled end time |
| timeZone | Interview time zone |
| meetingLink | Online meeting URL |
| location | Physical interview location |
| notes | Internal scheduling notes |
| resultNotes | Recruiter's summary of interviewer feedback |
| cancellationReason | Reason for cancellation |
| cancelledAt | Cancellation timestamp |
| cancelledBy | User who cancelled the interview |
| completedAt | Completion timestamp |
| createdBy | User who scheduled the interview |
| updatedBy | Last user who modified the interview |
| createdAt | Record creation timestamp |
| updatedAt | Last update timestamp |
| deletedAt | Soft delete timestamp |

---

# Immutable Fields

The following fields cannot be modified after creation:

- interviewCode
- companyId
- applicationId
- createdAt

---

# Interview Code

Every Interview receives a unique business identifier.

Format

```
INT-000001

INT-000002

INT-000003
```

Rules

- Generated automatically.
- Immutable.
- Unique within a company.
- Generated using a transaction-safe mechanism.
- Must never use record counting.

---

# Interview Type

Interview Type identifies the business classification of the interview.

Supported Types

```
INTERNAL

CLIENT

CAMPUS

WALK_IN

OTHER
```

Interview Type is independent of the Interview Round.

Examples

```
Interview Type : CLIENT

Interview Round : TECHNICAL
```

```
Interview Type : INTERNAL

Interview Round : HR
```

---

# Interview Round

Interview Round identifies the candidate's stage within the interview process.

Supported Rounds

```
SCREENING

TECHNICAL

MANAGERIAL

HR

FINAL
```

Rounds are fixed in Version 1.

---

# Interview Round vs Interview Type

Interview Round defines **where** the candidate is within the interview process.

Examples

- SCREENING
- TECHNICAL
- MANAGERIAL
- HR
- FINAL

Interview Type defines **what kind of interview** is being conducted.

Examples

- INTERNAL
- CLIENT
- CAMPUS
- WALK_IN
- OTHER

These two fields are intentionally independent.

This separation improves reporting, analytics, and future workflow flexibility.

---

# Interview Status

Interview Status tracks the execution state of the interview.

Supported Statuses

```
SCHEDULED

CONFIRMED

IN_PROGRESS

COMPLETED

CANCELLED

NO_SHOW
```

Interview Status is independent of the Application Stage and Application Status.

---

# Interview Outcome

Interview Outcome is recorded only after the interview has been completed.

Supported Outcomes

```
PASS

FAIL

ON_HOLD

RECOMMENDED

STRONG_RECOMMEND

NOT_RECOMMENDED
```

Outcome remains NULL until the Interview reaches COMPLETED.

---

# Interview Mode

Supported Modes

```
ONLINE

ONSITE

PHONE
```

Additional Rules

ONLINE

- meetingLink is mandatory.

ONSITE

- location is mandatory.

PHONE

- meetingLink optional.
- location optional.

---

# Scheduling Information

Each Interview stores:

- Scheduled Date
- Start Time
- End Time
- Time Zone
- Interview Mode
- Meeting Link
- Location
- Notes

Scheduling information may be updated through rescheduling.

---

# Interviewers

Each Interview may contain one or more Interviewers.

Relationship

```
Interview

↓

InterviewInterviewer

↓

User
```

Version 1

Interviewers do not interact with HireStack.

The Assigned Recruiter or Company Admin collects interviewer feedback externally and records the outcome within the system.

---

# InterviewInterviewer Entity

Stores interviewer assignments.

## Core Fields

| Field | Description |
|--------|-------------|
| id | UUID Primary Key |
| interviewId | Interview reference |
| interviewerId | User reference |
| createdAt | Assignment timestamp |

Rules

- One Interview may have multiple Interviewers.
- One User may participate in multiple Interviews.
- Duplicate interviewer assignments are prohibited.

---

# Ownership Model

Every Interview belongs to:

```
One Company

↓

One Application

↓

One or More Interviewers
```

Scheduling Permissions

Company Admin

- Schedule
- Update
- Reschedule
- Cancel
- Assign Interviewers
- Record Outcome
- Record Result Notes

Assigned Recruiter

- Schedule
- Update
- Reschedule
- Cancel
- Assign Interviewers
- Record Outcome
- Record Result Notes

Other Recruiters

- View only (subject to company visibility rules)

Super Admin

- No Interview Management permissions.

---

# Interview Lifecycle

```
SCHEDULED

↓

CONFIRMED

↓

IN_PROGRESS

↓

COMPLETED
```

Alternative terminal paths

```
SCHEDULED

↓

CANCELLED
```

```
CONFIRMED

↓

NO_SHOW
```

---

# Status Transition Rules

| Current Status | Allowed Next Status |
|----------------|--------------------|
| SCHEDULED | CONFIRMED, CANCELLED |
| CONFIRMED | IN_PROGRESS, CANCELLED, NO_SHOW |
| IN_PROGRESS | COMPLETED |
| COMPLETED | Terminal |
| CANCELLED | Terminal |
| NO_SHOW | Terminal |

Invalid transitions must return:

```
422 Unprocessable Entity
```

---

# Recording Outcome

Interview Outcome may only be recorded when:

Status

```
COMPLETED
```

Recording an outcome may include:

- outcome
- resultNotes

Result Notes are optional and represent the recruiter's summary of interviewer feedback.

Outcome and Result Notes cannot be recorded for:

- SCHEDULED
- CONFIRMED
- IN_PROGRESS
- CANCELLED
- NO_SHOW

---

# Rescheduling

Rescheduling may update:

- Scheduled Date
- Start Time
- End Time
- Time Zone
- Meeting Link
- Location
- Notes

Rescheduling updates the existing Interview record.

It does not create a new Interview.

---

# Cancellation

Cancellation records:

- cancellationReason
- cancelledBy
- cancelledAt

Status becomes:

```
CANCELLED
```

Cancelled Interviews remain searchable and reportable.

---

# API Endpoints

## POST

```
/interviews
```

Schedule Interview.

---

## GET

```
/interviews
```

Retrieve paginated interviews.

Supports searching, filtering, and sorting.

---

## GET

```
/interviews/:id
```

Retrieve interview details.

---

## PATCH

```
/interviews/:id
```

Update editable interview information.

---

## PATCH

```
/interviews/:id/status
```

Update interview status.

---

## PATCH

```
/interviews/:id/reschedule
```

Reschedule interview.

---

## PATCH

```
/interviews/:id/cancel
```

Cancel interview.

---

## PATCH

```
/interviews/:id/outcome
```

Record interview outcome and recruiter result notes.

---

## PATCH

```
/interviews/:id/interviewers
```

Assign or update interviewers.

---

## DELETE

```
/interviews/:id
```

Soft delete interview.
---

# Business Rules

The Interview Management module enforces the following business rules to ensure scheduling consistency, workflow integrity, and multi-tenant security.

## Interview Creation

Every Interview must:

- Belong to exactly one Company.
- Belong to exactly one Application.
- Have at least one assigned Interviewer.
- Have one Interview Type.
- Have one Interview Round.
- Have one Interview Mode.
- Receive a unique Interview Code during creation.

Interview Codes are immutable.

---

## Application Eligibility

An Interview may only be scheduled if the parent Application:

- Belongs to the authenticated Company.
- Is not soft deleted.
- Has status **ACTIVE**.

Interviews cannot be scheduled when the Application status is:

- HIRED
- REJECTED
- WITHDRAWN
- ARCHIVED

Attempting to schedule an Interview for a terminal Application must return:

```
409 Conflict
```

---

## Scheduling Validation

Every Interview must contain:

- Scheduled Date
- Start Time
- End Time
- Time Zone
- Interview Mode
- Interview Type
- Interview Round

Additional validation

ONLINE

- meetingLink is required.

ONSITE

- location is required.

PHONE

- meetingLink is optional.
- location is optional.

---

## Time Validation

Scheduling must satisfy the following conditions:

- Start Time must be before End Time.
- Scheduled Date cannot be in the past.
- Duration must be greater than zero.

Invalid schedules must return:

```
400 Bad Request
```

---

## Interviewer Availability

Before scheduling or rescheduling an Interview, the system must verify interviewer availability.

An Interviewer cannot be assigned to multiple Interviews whose scheduled time overlaps.

Overlap validation must consider:

- Scheduled Date
- Start Time
- End Time

Attempting to double-book an Interviewer must return:

```
409 Conflict
```

---

## Duplicate Interview Prevention

The system should prevent duplicate scheduling of the same Interview Round for the same Application while another Interview of that round is still active.

Example

```
Application

↓

Technical Interview

↓

Technical Interview
```

This is not permitted unless the previous Technical Interview has been cancelled.

---

## Interviewer Assignment

Rules

- At least one Interviewer is required.
- Duplicate Interviewer assignments are prohibited.
- Assigned Interviewers must belong to the authenticated Company.
- Only Company Admin or the Assigned Recruiter may assign or modify Interviewers.

---

## Immutable Fields

The following fields cannot be modified after creation:

- interviewCode
- companyId
- applicationId
- createdAt

---

## Status Management

Status transitions must follow the approved lifecycle.

Terminal statuses:

- COMPLETED
- CANCELLED
- NO_SHOW

Terminal Interviews cannot transition back to an earlier status.

Invalid transitions return:

```
422 Unprocessable Entity
```

---

## Outcome Recording

Interview Outcome and Result Notes may only be recorded when:

Status

```
COMPLETED
```

Outcome cannot be recorded for:

- SCHEDULED
- CONFIRMED
- IN_PROGRESS
- CANCELLED
- NO_SHOW

---

## Rescheduling

Rescheduling may update:

- Scheduled Date
- Start Time
- End Time
- Time Zone
- Meeting Link
- Location
- Notes

Rescheduling must also:

- Revalidate interviewer availability.
- Prevent scheduling conflicts.
- Respect Application eligibility rules.

A reschedule updates the existing Interview record.

It does not create a new Interview.

---

## Cancellation

Cancelling an Interview records:

- cancellationReason
- cancelledBy
- cancelledAt

Status becomes:

```
CANCELLED
```

Cancelled Interviews remain searchable and reportable.

---

## Soft Delete

Interview records use soft deletion.

Deleting an Interview sets:

```
deletedAt
```

No permanent deletion is performed through public APIs.

---

# Validation Rules

All incoming requests must be validated using Zod.

## Schedule Interview

Required

- applicationId
- interviewType
- round
- mode
- scheduledDate
- startTime
- endTime
- timeZone
- interviewers

Conditional

ONLINE

- meetingLink

ONSITE

- location

Optional

- notes

---

## Update Interview

Editable fields only.

Immutable fields must never be accepted.

---

## Update Status

Must contain:

- valid Interview Status

Must follow lifecycle rules.

---

## Record Outcome

Required

- outcome

Optional

- resultNotes

Allowed only when Interview status is COMPLETED.

---

## Cancel Interview

Required

- cancellationReason

---

## Reschedule Interview

Required

- scheduledDate
- startTime
- endTime
- timeZone

Conditional

ONLINE

- meetingLink

ONSITE

- location

---

## Validation Limits

Notes

Maximum

```
3000 characters
```

Result Notes

Maximum

```
3000 characters
```

Cancellation Reason

Maximum

```
1000 characters
```

Meeting Link

Maximum

```
2048 characters
```

Location

Maximum

```
500 characters
```

Search Text

Maximum

```
100 characters
```

---

# Search

Support searching by:

- Interview Code
- Candidate Name
- Candidate Code
- Job Title
- Recruiter Name
- Interviewer Name
- Interview Type

Search must be case-insensitive.

---

# Filtering

Support filtering by:

- Interview Type
- Interview Round
- Interview Status
- Interview Outcome
- Interview Mode
- Recruiter
- Interviewer
- Scheduled Date
- Created Date

Multiple filters may be combined.

---

# Sorting

Support sorting by:

- Scheduled Date
- Start Time
- Created Date
- Updated Date
- Interview Type
- Interview Round
- Interview Status

Default

Upcoming interviews first.

---

# Pagination

All list endpoints use the shared pagination implementation.

Support:

- page
- limit
- totalItems
- totalPages
- hasNextPage
- hasPreviousPage

---

# Error Handling

Return standardized API responses.

## 400

Validation Error

Invalid schedule

Invalid interview duration

---

## 401

Unauthorized

---

## 403

Forbidden

---

## 404

Interview Not Found

---

## 409

Application not eligible

Interviewer scheduling conflict

Duplicate interview round

---

## 422

Invalid status transition

Invalid outcome recording

---

## 500

Internal Server Error

Database implementation details must never be exposed.

---

# Security

The Interview Management module follows HireStack security standards.

## Authentication

All endpoints require authenticated users.

---

## Authorization

### Company Admin

- Full interview management.

### Assigned Recruiter

- Full interview management for assigned Applications.

### Other Recruiters

- View-only access according to company visibility rules.
- Cannot schedule, cancel, reschedule, assign interviewers, or record outcomes.

### Super Admin

- No Interview Management permissions.

---

## Company Isolation

Every Interview query must be scoped to the authenticated Company.

Cross-company access is prohibited.

---

# Transactions

The following operations must execute inside Prisma transactions:

- Schedule Interview
- Reschedule Interview
- Cancel Interview
- Record Outcome
- Assign Interviewers
- Update Interviewers

Partial writes are not permitted.

---

# Performance

Repositories should:

- Select only required fields.
- Avoid unnecessary joins.
- Use indexed fields.
- Support efficient searching and pagination.

Future optimization may include calendar indexing and interviewer availability caching.

---

# Future Compatibility

The architecture is intentionally designed for future integration with:

- Offer Management
- Hiring Pipeline
- Calendar Integration
- Notifications
- Audit Logs
- Activity Timeline
- Analytics Dashboard
- AI Interview Evaluation
- Interview Feedback Forms
- Individual Interviewer Scoring

These features should be implemented without breaking existing APIs or database relationships.

---

# Acceptance Criteria

The Interview Management module is considered complete when:

- Interviews can be scheduled successfully.
- Multiple Interviews per Application are supported.
- Company isolation is enforced.
- Interviewer scheduling conflicts are prevented.
- Terminal Applications cannot receive new Interviews.
- Interview Type is validated correctly.
- Interview status transitions follow lifecycle rules.
- Outcomes and Result Notes are recorded only after Interview completion.
- Search, filtering, sorting, and pagination work correctly.
- Soft delete functions correctly.
- Authorization rules are enforced.
- Repository pattern is maintained.
- All validation uses Zod.
- Multi-step operations use Prisma transactions.
- Standardized API responses are returned.

---

# Coding Notes for AI Agent

Before implementation, review:

- 10-System-Architecture.md
- 12-Database-Schema-Specification.md
- 13-API-Standards.md
- 15-Backend-Folder-Architecture.md
- 17-Security-Specification.md
- 18-Coding-Standards-Git-Workflow.md
- 28-Applications-Module-Specification.md

Implementation Requirements

- Follow Controller → Service → Repository architecture.
- Repository layer contains all Prisma operations.
- Services implement business rules.
- Validate every request using Zod.
- Enforce company isolation.
- Prevent interviewer scheduling conflicts.
- Prevent Interview creation for terminal Applications.
- Validate Interview Type.
- Enforce Interview status transitions.
- Validate Interview mode requirements.
- Support Result Notes after Interview completion.
- Use Prisma transactions for all multi-step operations.
- Maintain immutable fields.
- Implement soft delete.
- Support searching, filtering, sorting, and pagination.
- Return standardized API responses.
- Generate production-ready, maintainable code.

---

# Conclusion

The Interview Management module provides a robust, scalable foundation for managing the interview lifecycle within HireStack.

It enables structured scheduling, execution, interviewer assignment, and outcome tracking while enforcing strict business rules, company isolation, and production-grade architecture.

By supporting multiple interviews per Application and remaining independent of future Offer Management and Hiring Pipeline logic, the module ensures long-term extensibility without requiring breaking architectural changes.