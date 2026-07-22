# 26. Recruiters Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Recruiters |
| Folder | src/modules/recruiters |
| Priority | High |
| Depends On | Authentication, Users, Companies |
| Database Models | RecruiterProfile, User, Company, Job, Application, Interview |

---

# Module Purpose

The Recruiters module manages recruiter accounts within HireStack.

Recruiters are responsible for managing company job postings, reviewing candidate applications, scheduling interviews, and collaborating with their company team.

Every recruiter belongs to a company.

Recruiters cannot exist independently without an associated company.

---

# Responsibilities

The Recruiters module is responsible for:

- Recruiter Profile Management
- Recruiter Dashboard
- Recruiter Assignment
- Recruiter Company Membership
- Recruiter Permissions
- Recruiter Activity
- Recruiter Statistics
- Recruiter Search
- Recruiter Status Management

This module does not manage authentication or company creation.

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

Responsibilities

- Receive HTTP requests
- Validate requests
- Call service layer
- Return standardized responses

Must NOT

- Access Prisma directly
- Contain business logic

---

## recruiter.service.ts

Responsibilities

- Recruiter business logic
- Company membership validation
- Recruiter permission checks
- Recruiter statistics
- Dashboard summary

---

## recruiter.repository.ts

Responsibilities

- Prisma database queries
- CRUD operations
- Statistics queries
- Search operations

---

## recruiter.validation.ts

Contains

Zod Schemas

- Update Recruiter
- Recruiter Search
- Recruiter Status

---

## recruiter.routes.ts

Contains

Express Routes

---

## recruiter.types.ts

Contains

Interfaces

DTOs

Request Types

Response Types

---

## recruiter.constants.ts

Contains

Default Values

Business Constants

Validation Limits

---

# Database Models Used

Primary

RecruiterProfile

Related

User

Company

Job

Application

Interview

Notification

AuditLog

---

# Recruiter Profile

Each recruiter stores

- User ID
- Company ID
- Designation
- Department
- Work Email
- Phone Number
- Bio
- Experience
- Profile Image
- Status
- Joined Date
- Updated Date

---

# Recruiter Roles

Supported Roles

Company Admin

Senior Recruiter

Recruiter

Hiring Manager (Future)

Different roles determine available permissions inside the company.

---

# Recruiter Status

Supported Status

ACTIVE

INACTIVE

SUSPENDED

Status determines platform access.

---

# Recruiter Permissions

Recruiters may

- View Company Jobs
- Create Jobs
- Edit Jobs
- Archive Jobs
- View Applications
- Review Candidates
- Schedule Interviews
- Send Notifications

Recruiters may NOT

- Modify another company's data
- Access Super Admin features
- Change company ownership

---

# Recruiter Dashboard

Dashboard includes

- Active Jobs
- Draft Jobs
- Applications Received
- Interviews Scheduled
- Shortlisted Candidates
- Offers Sent
- Hiring Statistics

---

# API Endpoints

## GET

/recruiters/me

Purpose

Retrieve recruiter profile.

Authentication Required

Yes

---

## PATCH

/recruiters/me

Purpose

Update recruiter profile.

---

## GET

/recruiters/company

Purpose

Retrieve all recruiters within current company.

Authentication Required

Yes

Company Admin Only

---

## GET

/recruiters/:id

Purpose

Retrieve recruiter details.

Restricted

---

## PATCH

/recruiters/:id/status

Purpose

Update recruiter status.

Company Admin

Super Admin

---

## GET

/recruiters/dashboard

Purpose

Retrieve recruiter dashboard summary.

---

## GET

/recruiters/statistics

Purpose

Recruiter analytics.

---

# Validation Rules

Designation

Required

Maximum

100 Characters

Department

Maximum

100 Characters

Phone

Valid Phone Number

Bio

Maximum

2000 Characters

Experience

Must be positive

---

# Business Rules

Every recruiter must belong to one company.

Recruiters cannot manage jobs outside their company.

Inactive recruiters cannot create jobs.

Suspended recruiters cannot access protected APIs.

Deleting a recruiter performs a soft delete.

Company Admins manage recruiter permissions.

---

# Recruiter Statistics

Statistics include

- Jobs Posted
- Active Jobs
- Closed Jobs
- Total Applications
- Candidates Shortlisted
- Interviews Scheduled
- Offers Extended
- Hires Completed

---

# Search & Filtering

Supported Filters

- Department
- Designation
- Status
- Company

Sorting

- Newest
- Oldest
- Name
- Most Jobs

Pagination Required

---

# Error Handling

400

Validation Error

401

Unauthorized

403

Forbidden

404

Recruiter Not Found

409

Recruiter Already Exists

500

Internal Server Error

Never expose internal database errors.

---

# Security Requirements

Authentication required for all endpoints except explicitly public endpoints.

Validate recruiter ownership before updates.

Company Admin privileges must be verified.

Never expose sensitive user information.

All permission checks must occur in the service layer.

---

# Dependencies

Authentication Middleware

Authorization Middleware

Companies Module

Users Module

Prisma

Zod

Shared Error Handler

Shared Response Formatter

---

# Future Enhancements

Recruiter Teams

Department Management

Performance Analytics

Recruiter Leaderboard

Hiring Targets

Recruiter Notes

Internal Messaging

AI Candidate Ranking

AI Resume Matching

Recruiter Calendar Integration

Google Calendar Sync

Outlook Calendar Sync

Recruiter Activity Timeline

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
- Repository communicates only with Prisma.
- Services implement business logic.
- Validate every request using Zod.
- Support pagination and filtering.
- Enforce company ownership checks.
- Return standardized API responses.
- Generate production-ready code only.

---