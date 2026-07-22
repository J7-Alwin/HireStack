# 27. Jobs Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Jobs |
| Folder | src/modules/jobs |
| Priority | Critical |
| Depends On | Authentication, Users, Companies, Recruiters |
| Database Models | Job, Company, RecruiterProfile, User, Application, Bookmark (Future), Skill (Future) |

---

# Module Purpose

The Jobs module is responsible for managing all job postings within HireStack.

This module allows recruiters to create, publish, update, archive, and close job postings while allowing candidates to browse, search, filter, bookmark, and apply for jobs.

The Jobs module is one of the core modules of the platform.

---

# Responsibilities

The Jobs module is responsible for:

- Create Job
- Update Job
- Delete Job (Soft Delete)
- Publish Job
- Archive Job
- Close Job
- Reopen Job
- Search Jobs
- Filter Jobs
- Job Details
- Job Statistics
- Featured Jobs
- Latest Jobs
- Recommended Jobs (Future)
- AI Job Matching (Future)

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

- Handle HTTP requests
- Validate request
- Call service layer
- Return standardized responses

Must NOT

- Query Prisma
- Contain business logic

---

## job.service.ts

Responsibilities

- Business logic
- Permission validation
- Company ownership verification
- Publish jobs
- Archive jobs
- Close jobs
- Search logic
- Filtering logic

---

## job.repository.ts

Responsibilities

- Database queries
- CRUD operations
- Pagination
- Search
- Filtering

Only Prisma operations.

---

## job.validation.ts

Contains

Zod Schemas

- Create Job
- Update Job
- Search
- Filters
- Pagination

---

## job.routes.ts

Contains

Express Routes

---

## job.types.ts

Contains

Interfaces

DTOs

Enums

Response Types

---

## job.constants.ts

Contains

Employment Types

Experience Levels

Default Pagination

Validation Limits

---

# Database Models Used

Primary

Job

Related

Company

RecruiterProfile

Application

User

Bookmark (Future)

Skill (Future)

AuditLog

Notification

---

# Job Information

Each job stores

- Title
- Slug
- Description
- Responsibilities
- Requirements
- Skills
- Experience Level
- Employment Type
- Workplace Type
- Salary Range
- Currency
- Benefits
- Location
- Company
- Recruiter
- Number of Vacancies
- Application Deadline
- Status
- Published Date
- Created Date
- Updated Date

---

# Employment Types

- Full Time
- Part Time
- Internship
- Contract
- Temporary
- Freelance

---

# Workplace Types

- Onsite
- Remote
- Hybrid

---

# Experience Levels

- Fresher
- Junior
- Mid-Level
- Senior
- Lead
- Manager

---

# Job Status

Supported Status

DRAFT

PUBLISHED

CLOSED

ARCHIVED

EXPIRED

DELETED

Only published jobs are visible to candidates.

---

# Recruiter Permissions

Recruiters may

- Create Jobs
- Edit Their Company's Jobs
- Publish Jobs
- Archive Jobs
- Close Jobs

Recruiters may NOT

- Modify another company's jobs
- Publish jobs for another company

---

# Candidate Permissions

Candidates may

- Search Jobs
- View Jobs
- Apply
- Bookmark (Future)
- Share Job

Candidates may NOT

- Edit Jobs
- Delete Jobs
- Publish Jobs

---

# API Endpoints

## POST

/jobs

Purpose

Create Job

Authentication

Recruiter

---

## GET

/jobs

Purpose

Search Jobs

Supports

- Pagination
- Search
- Filters
- Sorting

Public Endpoint

---

## GET

/jobs/:id

Purpose

Retrieve Job Details

Public Endpoint

---

## PATCH

/jobs/:id

Purpose

Update Job

Recruiter

---

## PATCH

/jobs/:id/publish

Purpose

Publish Job

Recruiter

---

## PATCH

/jobs/:id/archive

Purpose

Archive Job

Recruiter

---

## PATCH

/jobs/:id/close

Purpose

Close Job

Recruiter

---

## DELETE

/jobs/:id

Purpose

Soft Delete

Recruiter

---

## GET

/jobs/company/:companyId

Purpose

Retrieve Company Jobs

Public

---

## GET

/jobs/recruiter/me

Purpose

Retrieve Recruiter's Jobs

Authenticated

---

# Search & Filtering

Search

- Job Title
- Company
- Skills
- Description

Filters

- Experience Level
- Employment Type
- Workplace Type
- Salary
- Location
- Company
- Posted Date

Sorting

- Latest
- Oldest
- Highest Salary
- Lowest Salary
- Most Applications

Pagination Required

---

# Validation Rules

Job Title

Required

Maximum

150 Characters

Description

Required

Maximum

10000 Characters

Responsibilities

Required

Requirements

Required

Skills

Minimum

1 Skill

Maximum

20 Skills

Vacancies

Minimum

1

Salary

Minimum

0

Application Deadline

Must be a future date

---

# Business Rules

Only recruiters can create jobs.

Recruiters can only manage jobs belonging to their company.

Draft jobs are invisible.

Archived jobs cannot receive applications.

Closed jobs cannot receive applications.

Expired jobs automatically close.

Deleted jobs use soft delete.

Every job belongs to exactly one company.

Every job has one owner recruiter.

---

# Job Statistics

Statistics include

- Total Views
- Total Applications
- Shortlisted Candidates
- Interviewed Candidates
- Hired Candidates
- Rejected Candidates

Future

- AI Match Score
- Candidate Quality Score

---

# Error Handling

400

Validation Error

401

Unauthorized

403

Forbidden

404

Job Not Found

409

Duplicate Job

500

Internal Server Error

Never expose database errors.

---

# Security Requirements

Authentication required for recruiter endpoints.

Ownership validation required before modifications.

Public APIs return only published jobs.

Never expose internal recruiter information.

Always validate permissions in the service layer.

---

# Dependencies

Authentication Middleware

Authorization Middleware

Companies Module

Recruiters Module

Applications Module

Prisma

Zod

Shared Error Handler

Shared Response Formatter

---

# Future Enhancements

AI Job Description Generator

AI Salary Recommendation

AI Candidate Matching

Featured Jobs

Urgent Hiring

Premium Jobs

Job Templates

Job Approval Workflow

Auto Expiration

Job Boosting

Saved Jobs

Job Sharing

SEO Friendly URLs

Multi-language Jobs

Duplicate Detection

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
- Implement pagination, filtering and sorting.
- Enforce recruiter ownership before modification.
- Use soft delete.
- Return standardized API responses.
- Generate production-ready code only.

---