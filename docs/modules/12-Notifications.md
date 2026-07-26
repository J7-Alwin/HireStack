# 30. Notifications Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Notifications |
| Folder | src/modules/notifications |
| Priority | Medium |
| Depends On | Authentication, Users |
| Database Models | Notification, User, Job, Application, Interview |

---

# Module Purpose

The Notifications module is responsible for delivering real-time and scheduled notifications across the HireStack platform.

Notifications inform users about important activities such as job applications, interview schedules, recruiter actions, account updates, security alerts, and system announcements.

This module serves Candidates, Recruiters, Companies, and Administrators.

---

# Responsibilities

The Notifications module is responsible for:

- Create Notifications
- Read Notifications
- Mark Notification as Read
- Mark All as Read
- Delete Notification
- Notification Preferences
- System Announcements
- Email Notifications
- Push Notifications (Future)
- In-App Notifications
- Notification History
- Scheduled Notifications (Future)

---

# Folder Structure

```text
src/
└── modules/
    └── notifications/
        ├── notification.controller.ts
        ├── notification.service.ts
        ├── notification.repository.ts
        ├── notification.routes.ts
        ├── notification.validation.ts
        ├── notification.types.ts
        ├── notification.constants.ts
        └── index.ts
```

---

# File Responsibilities

## notification.controller.ts

Responsibilities

- Receive HTTP requests
- Validate requests
- Call service layer
- Return standardized API responses

Must NOT

- Access Prisma
- Contain business logic

---

## notification.service.ts

Responsibilities

- Notification business logic
- Generate notifications
- Mark notifications as read
- Send email notifications
- Handle notification preferences

---

## notification.repository.ts

Responsibilities

- CRUD operations
- Notification retrieval
- Notification statistics

Only Prisma operations.

---

## notification.validation.ts

Contains

Zod Schemas

- Notification Filters
- Mark Read
- Delete Notification

---

## notification.routes.ts

Contains

Express Routes

---

## notification.types.ts

Contains

Interfaces

DTOs

Enums

Response Types

---

## notification.constants.ts

Contains

Notification Types

Priority Levels

Default Pagination

---

# Database Models Used

Primary

Notification

Related

User

Job

Application

Interview

Company

AuditLog

---

# Notification Information

Each notification stores

- Recipient
- Sender
- Title
- Message
- Type
- Priority
- Status
- Related Resource
- Related Resource ID
- Created Date
- Read Date
- Expiration Date (Future)

---

# Notification Types

ACCOUNT

APPLICATION

JOB

INTERVIEW

MESSAGE (Future)

SYSTEM

SECURITY

COMPANY

ADMIN

---

# Priority Levels

LOW

NORMAL

HIGH

URGENT

---

# Notification Status

UNREAD

READ

ARCHIVED

DELETED

---

# Notification Sources

Notifications may be generated from

- User Registration
- Job Published
- Job Application
- Candidate Shortlisted
- Candidate Rejected
- Interview Scheduled
- Interview Updated
- Offer Sent
- Password Changed
- Email Verified
- Admin Announcement
- System Maintenance

---

# API Endpoints

## GET

/notifications

Purpose

Retrieve notifications

Authentication

Required

Supports

Pagination

Filtering

Sorting

---

## GET

/notifications/unread

Purpose

Retrieve unread notifications

---

## PATCH

/notifications/:id/read

Purpose

Mark notification as read

---

## PATCH

/notifications/read-all

Purpose

Mark all notifications as read

---

## DELETE

/notifications/:id

Purpose

Delete notification

---

## GET

/notifications/preferences

Purpose

Retrieve notification preferences

---

## PATCH

/notifications/preferences

Purpose

Update notification preferences

Future

---

# Search & Filtering

Filters

- Type
- Status
- Priority
- Date

Sorting

- Latest
- Oldest
- Priority

Pagination Required

---

# Business Rules

Notifications belong to exactly one user.

Users may only access their own notifications.

Unread count must be updated automatically.

Deleting notifications performs soft delete.

Important notifications cannot be permanently removed.

Notifications should be ordered by newest first.

---

# Notification Preferences

Future support

Users may configure

- Email Notifications
- Push Notifications
- SMS Notifications
- Marketing Notifications
- Interview Notifications
- Application Updates
- Security Alerts

---

# Notification Delivery

Current

In-App Notifications

Future

Email

Push Notifications

SMS

Web Push

Slack

Microsoft Teams

---

# Error Handling

400

Validation Error

401

Unauthorized

403

Forbidden

404

Notification Not Found

500

Internal Server Error

Never expose internal database errors.

---

# Security Requirements

Authentication required.

Ownership validation required.

Users may never access another user's notifications.

Sensitive notifications must be encrypted if required.

Notification content should be sanitized before display.

---

# Dependencies

Authentication Middleware

Authorization Middleware

Users Module

Applications Module

Jobs Module

Interviews Module

Prisma

Zod

Email Service (Future)

Queue System (Future)

Shared Error Handler

Shared Response Formatter

---

# Future Enhancements

Real-Time Notifications

WebSockets

Server-Sent Events

Firebase Cloud Messaging

Notification Scheduling

Notification Templates

Notification Categories

Notification Analytics

Notification Digest Emails

AI Notification Prioritization

Bulk Notifications

Admin Broadcast Messages

Multi-language Notifications

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
- Enforce notification ownership.
- Support pagination, filtering and sorting.
- Return standardized API responses.
- Generate production-ready code only.

---