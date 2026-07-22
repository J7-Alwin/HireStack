# 28. Applications Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Applications |
| Folder | src/modules/applications |
| Priority | Critical |
| Depends On | Authentication, Users, Jobs, Recruiters |
| Database Models | Application, Job, User, Resume, RecruiterProfile, Interview, Notification |

---

# Module Purpose

The Applications module manages the complete job application lifecycle within HireStack.

It connects candidates with recruiters by allowing candidates to apply for jobs while enabling recruiters to review, manage, shortlist, reject, and hire applicants.

This module acts as the central workflow between Jobs, Candidates, Recruiters, and Interviews.

---

# Responsibilities

The Applications module is responsible for:

- Apply for Job
- Withdraw Application
- View Candidate Applications
- View Job Applicants
- Shortlist Candidate
- Reject Candidate
- Mark Under Review
- Move Candidate Between Stages
- Hire Candidate
- Track Application Status
- Application Timeline
- Recruiter Notes
- Candidate Notes (Future)

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

- Receive HTTP requests
- Validate request
- Call service layer
- Return standardized API responses

Must NOT

- Query Prisma
- Implement business logic

---

## application.service.ts

Responsibilities

- Business logic
- Application workflow
- Candidate eligibility
- Duplicate application checks
- Recruiter actions
- Status transitions

---

## application.repository.ts

Responsibilities

- Prisma CRUD operations
- Application queries
- Statistics
- Filtering
- Pagination

Only database access.

---

## application.validation.ts

Contains

Zod Schemas

- Apply Job
- Withdraw Application
- Update Status
- Search
- Pagination

---

## application.routes.ts

Contains

Express Routes

---

## application.types.ts

Contains

Interfaces

DTOs

Enums

Response Types

---

## application.constants.ts

Contains

Application Status

Validation Limits

Default Pagination

---

# Database Models Used

Primary

Application

Related

User

Resume

Job

RecruiterProfile

Interview

Notification

AuditLog

---

# Application Information

Each application stores

- Candidate
- Job
- Resume
- Cover Letter
- Current Status
- Applied Date
- Last Updated
- Recruiter Notes
- Candidate Notes (Future)
- Rejection Reason
- Hired Date
- Withdrawn Date

---

# Application Status

Supported Status

APPLIED

UNDER_REVIEW

SHORTLISTED

INTERVIEW_SCHEDULED

INTERVIEW_COMPLETED

OFFER_SENT

HIRED

REJECTED

WITHDRAWN

Status transitions must follow business rules.

---

# Candidate Permissions

Candidates may

- Apply
- Withdraw Application
- View Own Applications
- Track Status
- View Timeline

Candidates may NOT

- Modify recruiter decisions
- Apply multiple times for the same job
- View other candidates

---

# Recruiter Permissions

Recruiters may

- View Applicants
- Shortlist
- Reject
- Hire
- Add Notes
- Schedule Interviews
- Move Application Stages

Recruiters may NOT

- Manage another company's applications

---

# Application Flow

Candidate

↓

Apply

↓

APPLIED

↓

UNDER_REVIEW

↓

SHORTLISTED

↓

INTERVIEW_SCHEDULED

↓

INTERVIEW_COMPLETED

↓

OFFER_SENT

↓

HIRED

OR

↓

REJECTED

Candidate may withdraw before hiring.

---

# API Endpoints

## POST

/applications

Purpose

Apply for Job

Authentication

Candidate

---

## GET

/applications/me

Purpose

Retrieve Candidate Applications

Authentication

Candidate

---

## GET

/applications/job/:jobId

Purpose

Retrieve Job Applicants

Authentication

Recruiter

---

## GET

/applications/:id

Purpose

Retrieve Application Details

Restricted

---

## PATCH

/applications/:id/status

Purpose

Update Application Status

Recruiter

---

## PATCH

/applications/:id/withdraw

Purpose

Withdraw Application

Candidate

---

## PATCH

/applications/:id/notes

Purpose

Update Recruiter Notes

Recruiter

---

## GET

/applications/statistics

Purpose

Application Statistics

Recruiter

Admin

---

# Search & Filtering

Search

- Candidate Name
- Job Title

Filters

- Status
- Job
- Recruiter
- Company
- Applied Date

Sorting

- Latest
- Oldest
- Status

Pagination Required

---

# Validation Rules

Resume

Required

Job ID

Required

Cover Letter

Optional

Maximum

5000 Characters

Status

Must be valid enum

Notes

Maximum

3000 Characters

---

# Business Rules

Candidate cannot apply twice for the same job.

Candidate cannot apply to archived jobs.

Candidate cannot apply to closed jobs.

Candidate must upload a resume before applying.

Recruiters can only manage applications belonging to their company.

Only recruiters may update application status.

Application history must be preserved.

Every status change updates the timeline.

---

# Timeline

Each application maintains

- Applied
- Reviewed
- Shortlisted
- Interview Scheduled
- Interview Completed
- Offer Sent
- Rejected
- Hired
- Withdrawn

Timeline is immutable.

---

# Application Statistics

Statistics include

- Total Applications
- Under Review
- Shortlisted
- Interviews
- Offers
- Hired
- Rejected
- Withdrawn

---

# Error Handling

400

Validation Error

401

Unauthorized

403

Forbidden

404

Application Not Found

409

Duplicate Application

422

Invalid Status Transition

500

Internal Server Error

Never expose Prisma errors.

---

# Security Requirements

Authentication required.

Ownership validation required.

Candidate accesses only own applications.

Recruiters access only company applications.

Status updates require recruiter authorization.

Never expose internal recruiter notes to candidates.

---

# Dependencies

Authentication Middleware

Authorization Middleware

Jobs Module

Recruiters Module

Users Module

Prisma

Zod

Notification Module

Shared Error Handler

Shared Response Formatter

---

# Future Enhancements

AI Resume Matching

AI Candidate Score

AI Recruiter Recommendation

Candidate Ranking

Bulk Status Update

Bulk Email

Candidate Comparison

Application Labels

Internal Comments

Interview Feedback Integration

Application Export

Application Analytics

Resume Parsing

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
- Services implement business rules.
- Validate every request using Zod.
- Prevent duplicate applications.
- Enforce valid status transitions.
- Maintain immutable application timeline.
- Support pagination, filtering and sorting.
- Return standardized API responses.
- Generate production-ready code only.

---