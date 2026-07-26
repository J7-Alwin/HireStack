# 32. Interviews Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Interviews |
| Folder | src/modules/interviews |
| Priority | Critical |
| Depends On | Authentication, Applications, Users, Recruiters |
| Database Models | Interview, Application, User, RecruiterProfile, Company, Notification |

---

# Module Purpose

The Interviews module manages the complete interview lifecycle within HireStack.

It enables recruiters to schedule interviews with candidates, update interview details, record interview outcomes, collect feedback, and manage interview statuses.

Candidates can view their scheduled interviews, join online interviews through meeting links, confirm attendance, and receive notifications.

This module integrates closely with Applications, Notifications, Calendar integrations, and future video meeting providers.

---

# Responsibilities

The Interviews module is responsible for:

- Schedule Interview
- Update Interview
- Cancel Interview
- Reschedule Interview
- Confirm Interview
- Complete Interview
- Interview Feedback
- Interview Evaluation
- Interview Timeline
- Interview Notifications
- Calendar Integration (Future)
- Video Meeting Integration (Future)

---

# Folder Structure

```text
src/
└── modules/
    └── interviews/
        ├── interview.controller.ts
        ├── interview.service.ts
        ├── interview.repository.ts
        ├── interview.routes.ts
        ├── interview.validation.ts
        ├── interview.types.ts
        ├── interview.constants.ts
        └── index.ts
```

---

# File Responsibilities

## interview.controller.ts

Responsibilities

- Handle HTTP requests
- Validate requests
- Call service layer
- Return standardized API responses

Must NOT

- Query Prisma
- Contain business logic

---

## interview.service.ts

Responsibilities

- Schedule interviews
- Validate recruiter ownership
- Validate application status
- Manage interview lifecycle
- Generate notifications
- Manage interview feedback

---

## interview.repository.ts

Responsibilities

- CRUD operations
- Search interviews
- Statistics
- Pagination
- Filtering

Only Prisma operations.

---

## interview.validation.ts

Contains

Zod Schemas

- Schedule Interview
- Update Interview
- Cancel Interview
- Feedback
- Pagination

---

## interview.routes.ts

Contains

Express Routes

---

## interview.types.ts

Contains

Interfaces

DTOs

Enums

Response Types

---

## interview.constants.ts

Contains

Interview Types

Interview Status

Result Types

Validation Limits

---

# Database Models Used

Primary

Interview

Related

Application

User

RecruiterProfile

Company

Notification

AuditLog

---

# Interview Information

Each interview stores

- Application
- Candidate
- Recruiter
- Company
- Interview Title
- Interview Type
- Scheduled Date
- Duration
- Timezone
- Meeting Link
- Physical Location
- Notes
- Feedback
- Rating
- Interview Result
- Status
- Created Date
- Updated Date

---

# Interview Types

ONLINE

ONSITE

PHONE

TECHNICAL

HR

PANEL

FINAL

---

# Interview Status

SCHEDULED

CONFIRMED

RESCHEDULED

COMPLETED

CANCELLED

NO_SHOW

---

# Interview Results

PENDING

PASSED

FAILED

ON_HOLD

SELECTED

REJECTED

---

# Candidate Permissions

Candidates may

- View interviews
- Confirm attendance
- View meeting links
- View interview details

Candidates may NOT

- Modify interviews
- Delete interviews
- Edit recruiter feedback

---

# Recruiter Permissions

Recruiters may

- Schedule interviews
- Update interviews
- Cancel interviews
- Record feedback
- Update interview results

Recruiters may only manage interviews belonging to their company.

---

# Interview Workflow

Application Shortlisted

↓

Schedule Interview

↓

Candidate Notified

↓

Candidate Confirms

↓

Interview Conducted

↓

Feedback Submitted

↓

Result Recorded

↓

Application Updated

---

# API Endpoints

## POST

/interviews

Purpose

Schedule Interview

Authentication

Recruiter

---

## GET

/interviews

Purpose

Retrieve Interviews

Supports

Pagination

Filtering

Sorting

---

## GET

/interviews/:id

Purpose

Interview Details

---

## PATCH

/interviews/:id

Purpose

Update Interview

Recruiter

---

## PATCH

/interviews/:id/confirm

Purpose

Candidate Confirmation

Candidate

---

## PATCH

/interviews/:id/cancel

Purpose

Cancel Interview

Recruiter

---

## PATCH

/interviews/:id/feedback

Purpose

Submit Interview Feedback

Recruiter

---

## PATCH

/interviews/:id/result

Purpose

Update Interview Result

Recruiter

---

## GET

/interviews/calendar

Purpose

Upcoming Interviews

Authenticated

---

# Search & Filtering

Filters

- Status
- Interview Type
- Recruiter
- Candidate
- Company
- Date Range

Sorting

- Latest
- Oldest
- Upcoming

Pagination Required

---

# Validation Rules

Interview Title

Required

Maximum

150 Characters

Duration

Minimum

15 Minutes

Maximum

480 Minutes

Meeting Link

Valid URL

Notes

Maximum

3000 Characters

Feedback

Maximum

5000 Characters

Interview Date

Must be a future date

---

# Business Rules

Only shortlisted candidates can receive interview invitations.

Recruiters may only schedule interviews for their company's applications.

Cancelled interviews remain in history.

Completed interviews cannot be modified.

Interview feedback is visible only to recruiters and administrators.

Interview results automatically update the linked application status.

Every interview generates candidate notifications.

---

# Interview Statistics

Statistics include

- Scheduled Interviews
- Completed Interviews
- Cancelled Interviews
- No Shows
- Pass Rate
- Recruiter Success Rate

---

# Error Handling

400

Validation Error

401

Unauthorized

403

Forbidden

404

Interview Not Found

409

Interview Conflict

422

Invalid Interview State

500

Internal Server Error

Never expose database errors.

---

# Security Requirements

Authentication required.

Ownership validation required.

Meeting links should never be publicly exposed.

Candidates access only their interviews.

Recruiters access only company interviews.

Feedback is restricted.

---

# Dependencies

Authentication Middleware

Authorization Middleware

Applications Module

Notifications Module

Users Module

Recruiters Module

Prisma

Zod

Shared Error Handler

Shared Response Formatter

---

# Future Enhancements

Google Calendar Integration

Microsoft Outlook Integration

Zoom Integration

Google Meet Integration

Microsoft Teams Integration

Automatic Reminders

Interview Recording

AI Interview Notes

AI Interview Scoring

Interview Templates

Panel Interviews

Interview Availability Management

Calendar Synchronization

---

# Coding Notes for AI Agent

Before implementation, read:

- 10-System-Architecture.md
- 12-Database-Schema-Specification.md
- 13-API-Standards.md
- 15-Backend-Folder-Architecture.md
- 17-Security-Specification.md
- 18-Coding-Standards-Git-Workflow.md

Implementation Rules

- Follow Controller → Service → Repository architecture.
- Repository contains all Prisma operations.
- Services implement business logic.
- Validate every request using Zod.
- Enforce recruiter ownership.
- Automatically synchronize application status after interview results.
- Generate notifications for every interview event.
- Support pagination, filtering and sorting.
- Return standardized API responses.
- Generate production-ready code only.

---