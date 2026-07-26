# 35. Email Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Email |
| Folder | src/modules/email |
| Priority | Critical |
| Depends On | Authentication, Users, Notifications |
| Database Models | EmailLog, User, Notification |

---

# Module Purpose

The Email module is responsible for sending all transactional emails throughout the HireStack platform.

It provides a centralized email service that supports reusable templates, email providers, logging, retries, scheduling, and future queue processing.

All emails should be sent through this module. Other modules must never communicate directly with email providers.

Initially, emails will be sent synchronously during development and asynchronously through a queue in production.

---

# Responsibilities

The Email module is responsible for:

- Send Transactional Emails
- Email Verification
- Password Reset Emails
- Welcome Emails
- Recruiter Invitations
- Company Invitations
- Interview Invitations
- Interview Reminder Emails
- Application Status Emails
- Offer Emails
- Notification Emails
- Email Logging
- Email Retry
- Email Templates
- Provider Abstraction

---

# Folder Structure

```text
src/
└── modules/
    └── email/
        ├── email.controller.ts
        ├── email.service.ts
        ├── email.repository.ts
        ├── email.routes.ts
        ├── email.validation.ts
        ├── email.types.ts
        ├── email.constants.ts
        ├── templates/
        │      ├── welcome.template.ts
        │      ├── verify-email.template.ts
        │      ├── reset-password.template.ts
        │      ├── recruiter-invitation.template.ts
        │      ├── interview.template.ts
        │      ├── application-status.template.ts
        │      └── offer.template.ts
        ├── providers/
        │      ├── nodemailer.provider.ts
        │      ├── resend.provider.ts
        │      ├── sendgrid.provider.ts
        │      └── provider.interface.ts
        └── index.ts
```

---

# File Responsibilities

## email.controller.ts

Responsibilities

- Testing endpoints
- Preview email templates
- Admin email utilities

Must NOT

- Send emails directly

---

## email.service.ts

Responsibilities

- Send emails
- Select provider
- Select template
- Retry failed emails
- Queue integration
- Template rendering

---

## email.repository.ts

Responsibilities

- Email logs
- Delivery status
- Retry history

Only Prisma operations.

---

## email.validation.ts

Contains

Zod Schemas

- Send Email
- Preview Email
- Email Validation

---

## email.routes.ts

Contains

Express Routes

Mostly Admin Protected

---

## email.types.ts

Contains

Interfaces

DTOs

Provider Contracts

Enums

---

## email.constants.ts

Contains

Providers

Templates

Retry Limits

Timeouts

---

# Database Models Used

Primary

EmailLog

Related

User

Notification

Application

Interview

Company

---

# Email Providers

Development

Nodemailer

Production

Resend

Future

SendGrid

Amazon SES

Mailgun

Postmark

---

# Email Templates

Welcome Email

Email Verification

Password Reset

Recruiter Invitation

Company Invitation

Interview Invitation

Interview Reminder

Application Received

Application Shortlisted

Application Rejected

Offer Letter

Account Suspended

Security Alert

System Announcement

Maintenance Notice

---

# Email Information

Each email stores

- Email ID
- Recipient
- Subject
- Template
- Variables
- Provider
- Status
- Retry Count
- Sent Time
- Delivered Time
- Failed Reason

---

# Email Status

PENDING

PROCESSING

SENT

DELIVERED

FAILED

RETRYING

CANCELLED

---

# Email Workflow

Module Requests Email

↓

Validate Request

↓

Select Template

↓

Render HTML

↓

Select Provider

↓

Send Email

↓

Save Email Log

↓

Return Result

---

# API Endpoints

## POST

/email/send

Purpose

Manual Email Sending

Admin

Development

---

## GET

/email/templates

Purpose

Retrieve Available Templates

Admin

---

## POST

/email/preview

Purpose

Preview Email Template

Admin

---

## GET

/email/logs

Purpose

Retrieve Email Logs

Admin

---

## GET

/email/statistics

Purpose

Email Statistics

Admin

---

# Validation Rules

Recipient

Valid Email Address

Subject

Maximum

255 Characters

Template

Must Exist

Variables

JSON Object

Maximum Size

100 KB

---

# Business Rules

Only verified email addresses receive verification-sensitive emails.

Every sent email should generate an EmailLog entry.

Failed emails should retry automatically.

Retry limit should be configurable.

Sensitive information should never be stored inside templates.

Templates should support localization in the future.

---

# Retry Policy

Maximum Retries

3

Retry Delays

1 Minute

5 Minutes

15 Minutes

Future

Exponential Backoff

---

# Email Statistics

Statistics include

- Emails Sent
- Failed Emails
- Delivered Emails
- Pending Emails
- Retry Count
- Provider Usage
- Daily Volume

---

# Error Handling

400

Invalid Email

401

Unauthorized

403

Forbidden

404

Template Not Found

429

Rate Limited

500

Email Provider Error

Never expose provider secrets.

---

# Security Requirements

Validate email addresses.

Escape template variables.

Protect against HTML injection.

Store provider credentials securely.

Log failures without exposing secrets.

Rate limit manual email APIs.

---

# Dependencies

Authentication Middleware

Notification Module

Prisma

Zod

Nodemailer

Resend SDK

Shared Logger

Shared Error Handler

Shared Response Formatter

---

# Future Enhancements

Queue Processing

Redis Queue

Bulk Emails

Email Scheduling

Email Campaigns

Multi-language Templates

Dark Mode Templates

Open Tracking

Click Tracking

Bounce Detection

Spam Detection

Webhook Events

Email Preferences

Template Builder

A/B Testing

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
- Repository manages email logs only.
- Services send emails through provider abstraction.
- Support Nodemailer for development and Resend for production.
- Never hardcode HTML inside services.
- Use reusable template files.
- Implement configurable retry policies.
- Support future queue integration without changing service APIs.
- Return standardized API responses.
- Generate production-ready code only.

---