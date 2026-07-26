# 31. Administration Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Administration |
| Folder | src/modules/admin |
| Priority | Critical |
| Depends On | All Modules |
| Database Models | User, Company, RecruiterProfile, CandidateProfile, Job, Application, Notification, AuditLog |

---

# Module Purpose

The Administration module is responsible for platform-wide management and governance within HireStack.

It provides Super Administrators with complete visibility and control over users, companies, recruiters, jobs, applications, platform settings, security, analytics, and moderation.

Only users with the **SUPER_ADMIN** role may access this module.

---

# Responsibilities

The Administration module is responsible for:

- Platform Dashboard
- User Management
- Company Management
- Recruiter Management
- Candidate Management
- Job Moderation
- Application Monitoring
- Notification Broadcast
- Audit Logs
- Platform Settings
- Role Management
- System Health Monitoring
- Platform Analytics
- Security Management
- Feature Flags (Future)

---

# Folder Structure

```text
src/
└── modules/
    └── admin/
        ├── admin.controller.ts
        ├── admin.service.ts
        ├── admin.repository.ts
        ├── admin.routes.ts
        ├── admin.validation.ts
        ├── admin.types.ts
        ├── admin.constants.ts
        └── index.ts
```

---

# File Responsibilities

## admin.controller.ts

Responsibilities

- Receive HTTP requests
- Validate requests
- Call service layer
- Return standardized API responses

Must NOT

- Access Prisma directly
- Implement business logic

---

## admin.service.ts

Responsibilities

- Business logic
- Permission validation
- Platform administration
- Moderation
- Analytics aggregation
- Dashboard generation

---

## admin.repository.ts

Responsibilities

- Prisma queries
- Platform statistics
- CRUD operations
- Reports

Only database access.

---

## admin.validation.ts

Contains

Zod Schemas

- Update Status
- Search
- Pagination
- Broadcast Notification

---

## admin.routes.ts

Contains

Express Routes

Protected by Super Admin authorization.

---

## admin.types.ts

Contains

Interfaces

DTOs

Enums

Response Types

---

## admin.constants.ts

Contains

System Constants

Dashboard Constants

Pagination Defaults

---

# Database Models Used

Primary

User

Company

RecruiterProfile

CandidateProfile

Job

Application

Notification

AuditLog

Future

SystemSetting

FeatureFlag

Subscription

---

# Admin Permissions

Super Admin may

- View all users
- View all companies
- View all recruiters
- View all candidates
- View all jobs
- View all applications
- Suspend users
- Suspend companies
- Delete content
- Broadcast notifications
- Manage platform settings
- View analytics
- Access audit logs

No other role may access admin APIs.

---

# Platform Dashboard

Dashboard displays

- Total Users
- Active Users
- Total Recruiters
- Total Candidates
- Total Companies
- Total Jobs
- Active Jobs
- Applications Today
- Total Applications
- Interviews Scheduled
- Platform Growth
- System Health

---

# User Management

Admin may

- Search Users
- View User Profile
- Suspend User
- Activate User
- Soft Delete User
- Restore User
- View User Activity

Admin may NOT

- View passwords
- View password hashes

---

# Company Management

Admin may

- Verify Companies
- Suspend Companies
- Activate Companies
- Delete Companies
- Review Company Information

---

# Recruiter Management

Admin may

- View Recruiters
- Suspend Recruiters
- Restore Recruiters
- View Recruiter Statistics

---

# Candidate Management

Admin may

- View Candidate Profiles
- Suspend Candidate
- Restore Candidate
- Review Activity

---

# Job Moderation

Admin may

- Remove Fraudulent Jobs
- Archive Jobs
- Restore Jobs
- Review Reported Jobs

---

# Application Monitoring

Admin may

- View Platform Applications
- Review Hiring Metrics
- Monitor Recruiter Activity

Admin does not participate in recruitment decisions.

---

# Notification Management

Admin may

- Broadcast Notifications
- Send Maintenance Alerts
- Publish Announcements

Future

Targeted Notifications

---

# Platform Settings

Future support

- Maintenance Mode
- Feature Flags
- Email Templates
- System Messages
- Branding
- Platform Limits

---

# API Endpoints

## GET

/admin/dashboard

Purpose

Retrieve platform dashboard

Authentication

Super Admin

---

## GET

/admin/users

Purpose

Retrieve users

Supports

Pagination

Filtering

Sorting

---

## PATCH

/admin/users/:id/status

Purpose

Update user status

---

## GET

/admin/companies

Purpose

Retrieve companies

---

## PATCH

/admin/companies/:id/status

Purpose

Update company status

---

## GET

/admin/jobs

Purpose

Retrieve jobs

---

## PATCH

/admin/jobs/:id/status

Purpose

Moderate jobs

---

## GET

/admin/applications

Purpose

Retrieve applications

---

## POST

/admin/notifications

Purpose

Broadcast notification

---

## GET

/admin/audit-logs

Purpose

Retrieve audit logs

Future

---

# Search & Filtering

Supported Filters

Users

Companies

Recruiters

Candidates

Jobs

Applications

Sorting

Latest

Oldest

Name

Status

Pagination Required

---

# Business Rules

Only SUPER_ADMIN may access this module.

Every administrative action must be recorded in Audit Logs.

Soft delete preferred over permanent deletion.

Platform statistics are read-only.

Moderation actions require proper authorization.

Admin actions must be traceable.

---

# Audit Logging

Every administrative action should generate an audit record.

Examples

- User Suspended
- Company Verified
- Job Archived
- Broadcast Sent
- Platform Settings Changed

Audit logs cannot be modified.

---

# Error Handling

400

Validation Error

401

Unauthorized

403

Forbidden

404

Resource Not Found

500

Internal Server Error

Never expose internal errors.

---

# Security Requirements

Require authentication.

Require SUPER_ADMIN authorization.

Log every sensitive action.

Never expose secrets.

Never expose password hashes.

Protect all admin endpoints.

---

# Dependencies

Authentication Middleware

Authorization Middleware

Audit Module

Notification Module

Users Module

Companies Module

Recruiters Module

Jobs Module

Applications Module

Prisma

Zod

Shared Error Handler

Shared Response Formatter

---

# Future Enhancements

Feature Flags

Subscription Management

Tenant Management

Billing Dashboard

AI Moderation

Fraud Detection

Spam Detection

Security Center

Usage Analytics

System Monitoring

Background Jobs Dashboard

Queue Monitoring

Platform Backups

Database Monitoring

Health Checks

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
- Protect every endpoint using SUPER_ADMIN authorization.
- Record all administrative actions in Audit Logs.
- Support pagination, filtering and sorting.
- Return standardized API responses.
- Generate production-ready code only.

---