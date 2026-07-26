# 33. Audit Logs Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Audit Logs |
| Folder | src/modules/audit |
| Priority | Critical |
| Depends On | Authentication, Users |
| Database Models | AuditLog, User |

---

# Module Purpose

The Audit Logs module is responsible for recording every important action performed throughout the HireStack platform.

It provides a permanent, tamper-resistant history of security events, administrative actions, recruiter activities, candidate actions, authentication events, and system operations.

Audit logs are essential for:

- Security
- Compliance
- Debugging
- Incident Investigation
- Monitoring
- User Activity Tracking

Audit logs are append-only and must never be edited or deleted through the application.

---

# Responsibilities

The Audit module is responsible for:

- Record Audit Events
- Retrieve Audit Logs
- Search Audit Logs
- Filter Audit Logs
- User Activity History
- Security Event Logging
- Admin Activity Logging
- Authentication Event Logging
- Export Audit Logs (Future)
- Archive Audit Logs (Future)

---

# Folder Structure

```text
src/
└── modules/
    └── audit/
        ├── audit.controller.ts
        ├── audit.service.ts
        ├── audit.repository.ts
        ├── audit.routes.ts
        ├── audit.validation.ts
        ├── audit.types.ts
        ├── audit.constants.ts
        └── index.ts
```

---

# File Responsibilities

## audit.controller.ts

Responsibilities

- Handle HTTP requests
- Validate requests
- Call service layer
- Return standardized API responses

Must NOT

- Query Prisma
- Implement business logic

---

## audit.service.ts

Responsibilities

- Record audit entries
- Search audit history
- User activity timeline
- Security event aggregation
- Audit filtering
- Export preparation

---

## audit.repository.ts

Responsibilities

- Prisma CRUD operations
- Search queries
- Pagination
- Filtering
- Statistics

Only database operations.

---

## audit.validation.ts

Contains

Zod Schemas

- Search Audit Logs
- Pagination
- Filters

---

## audit.routes.ts

Contains

Express Routes

Admin Protected

---

## audit.types.ts

Contains

Interfaces

DTOs

Enums

Response Types

---

## audit.constants.ts

Contains

Audit Actions

Audit Categories

Severity Levels

Retention Constants

---

# Database Models Used

Primary

AuditLog

Related

User

Company

RecruiterProfile

CandidateProfile

Job

Application

Interview

Resume

Notification

---

# Audit Log Information

Each audit record stores

- Audit ID
- User ID
- User Role
- User Email
- Action
- Category
- Resource Type
- Resource ID
- Description
- Severity
- IP Address
- User Agent
- Request Method
- Request Path
- Response Status
- Metadata (JSON)
- Created Date

---

# Audit Categories

AUTHENTICATION

USER

COMPANY

RECRUITER

JOB

APPLICATION

INTERVIEW

RESUME

NOTIFICATION

SECURITY

SYSTEM

ADMIN

DATABASE

API

---

# Audit Severity

INFO

LOW

MEDIUM

HIGH

CRITICAL

---

# Actions Logged

Authentication

- Login Success
- Login Failed
- Logout
- Password Changed
- Password Reset
- Email Verified

Users

- User Created
- User Updated
- User Deleted
- User Suspended
- Profile Updated

Companies

- Company Created
- Company Updated
- Company Verified
- Company Suspended

Recruiters

- Recruiter Added
- Recruiter Removed
- Recruiter Updated

Jobs

- Job Created
- Job Published
- Job Updated
- Job Archived
- Job Deleted

Applications

- Applied
- Withdrawn
- Shortlisted
- Rejected
- Hired

Interviews

- Scheduled
- Updated
- Completed
- Cancelled

Resumes

- Resume Created
- Resume Updated
- Resume Deleted
- Resume Downloaded

Administration

- User Suspended
- Company Removed
- Broadcast Notification
- Settings Changed

Security

- Unauthorized Access
- Permission Denied
- Rate Limit Triggered
- Suspicious Activity

---

# Automatic Audit Logging

Audit entries should automatically be created after successful completion of important business actions.

Examples

Authentication Module

- Login
- Logout
- Password Reset

Jobs Module

- Create Job
- Publish Job
- Archive Job

Applications Module

- Apply
- Reject
- Hire

Interview Module

- Schedule
- Complete

Admin Module

- Suspend User
- Verify Company
- Delete Resource

---

# API Endpoints

## GET

/audit

Purpose

Retrieve Audit Logs

Authentication

Super Admin

Supports

Pagination

Filtering

Sorting

---

## GET

/audit/:id

Purpose

Retrieve Audit Details

Authentication

Super Admin

---

## GET

/audit/user/:userId

Purpose

Retrieve User Activity

Authentication

Super Admin

---

## GET

/audit/statistics

Purpose

Audit Analytics

Authentication

Super Admin

---

## GET

/audit/security

Purpose

Security Events

Authentication

Super Admin

---

## GET

/audit/export

Purpose

Export Logs

Future

---

# Search & Filtering

Search

- User
- Email
- Action
- Resource
- Description

Filters

- Category
- Severity
- User
- Date Range
- HTTP Method
- Status Code

Sorting

- Latest
- Oldest
- Severity

Pagination Required

---

# Business Rules

Audit logs are immutable.

Audit records cannot be edited.

Audit records cannot be deleted through application APIs.

Every sensitive action must create exactly one audit entry.

Background jobs may generate audit logs.

System-generated actions should use a System User identifier.

Audit logging failures must never block business operations.

Audit creation should be asynchronous whenever possible.

---

# Audit Retention

Development

30 Days

Staging

90 Days

Production

365 Days Minimum

Future

Configurable retention policies

Archive older logs

---

# Audit Statistics

Statistics include

- Total Events
- Authentication Events
- Failed Logins
- Security Events
- Admin Actions
- Recruiter Actions
- Candidate Actions
- Daily Activity
- Most Active Users
- High Severity Events

---

# Error Handling

400

Validation Error

401

Unauthorized

403

Forbidden

404

Audit Record Not Found

500

Internal Server Error

Never expose internal metadata.

---

# Security Requirements

Only SUPER_ADMIN may access audit APIs.

Audit records are read-only.

Sensitive metadata should be sanitized.

Personally identifiable information should be minimized where possible.

Never expose password hashes, access tokens, refresh tokens, or secrets.

Record client IP and User-Agent for security-related events.

---

# Dependencies

Authentication Middleware

Authorization Middleware

Users Module

Prisma

Zod

Logger Service

Shared Error Handler

Shared Response Formatter

---

# Future Enhancements

CSV Export

Excel Export

PDF Reports

Real-Time Audit Stream

SIEM Integration

Webhook Forwarding

Security Dashboard

Anomaly Detection

Geo-location Tracking

Risk Scoring

Audit Archiving

Immutable Storage

Cloud Audit Integration

OpenTelemetry Support

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
- Repository contains only Prisma operations.
- Services implement business logic.
- Automatically generate audit entries from all critical modules.
- Support pagination, filtering, and advanced search.
- Audit records are append-only and immutable.
- Never allow update or delete operations through public APIs.
- Support asynchronous audit creation where possible.
- Return standardized API responses.
- Generate production-ready code only.

---