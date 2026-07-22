# 25. Companies Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Companies |
| Folder | src/modules/companies |
| Priority | High |
| Depends On | Authentication, Users |
| Database Models | Company, RecruiterProfile, Job, CompanyMember (Future), CompanyInvitation (Future) |

---

# Module Purpose

The Companies module manages all company-related information within HireStack.

A company represents an organization that recruits candidates through the platform.

This module allows companies to create profiles, manage branding, assign recruiters, publish company information, and maintain company settings.

The Companies module is the owner of company data.

---

# Responsibilities

The Companies module is responsible for:

- Company Registration
- Company Profile Management
- Company Branding
- Company Verification
- Company Settings
- Company Recruiter Management
- Company Statistics
- Company Status Management
- Public Company Profiles
- Company Search

This module must not handle authentication or job applications.

---

# Folder Structure

```text
src/
└── modules/
    └── companies/
        ├── company.controller.ts
        ├── company.service.ts
        ├── company.repository.ts
        ├── company.routes.ts
        ├── company.validation.ts
        ├── company.types.ts
        ├── company.constants.ts
        └── index.ts
```

---

# File Responsibilities

## company.controller.ts

Responsibilities

- Receive requests
- Validate requests
- Call service layer
- Return standardized responses

Must NOT

- Access Prisma directly
- Contain business logic

---

## company.service.ts

Responsibilities

- Company business logic
- Permission checks
- Company creation
- Company updates
- Recruiter assignment
- Verification workflow

---

## company.repository.ts

Responsibilities

- Prisma queries only
- CRUD operations
- Company search
- Company statistics queries

---

## company.validation.ts

Contains

Zod Schemas

- Create Company
- Update Company
- Company Search
- Company Settings

---

## company.routes.ts

Contains

Express Routes

---

## company.types.ts

Contains

Interfaces

DTOs

Response Types

---

## company.constants.ts

Contains

Validation Constants

Business Constants

Default Values

---

# Database Models Used

Primary

Company

Related

RecruiterProfile

Job

User

Notification

AuditLog

Future

CompanyInvitation

CompanyMember

Subscription

---

# Company Information

Each company stores

- Company Name
- Company Logo
- Cover Image
- Description
- Industry
- Website
- Email
- Phone
- Headquarters
- Founded Year
- Company Size
- LinkedIn
- Twitter
- Facebook
- Instagram
- Verification Status
- Company Status
- Created Date
- Updated Date

---

# Company Status

Supported Status

ACTIVE

INACTIVE

SUSPENDED

PENDING_VERIFICATION

VERIFIED

Status controls platform permissions.

---

# Company Verification

Future implementation

Verification may require

- Business Registration Number
- GST Number
- Official Email
- Domain Verification
- Manual Admin Approval

Only verified companies receive verification badges.

---

# Recruiter Association

A company may have multiple recruiters.

A recruiter belongs to one company.

Company administrators manage recruiter access.

Future support may include:

- Invitations
- Roles
- Departments
- Teams

---

# Public Company Profile

Visible Information

- Company Name
- Logo
- Cover Image
- Description
- Industry
- Website
- Office Location
- Open Jobs
- Company Size
- Social Links
- Verification Badge

Hidden Information

- Internal Notes
- Verification Documents
- Billing
- Subscription
- Recruiter Emails
- Audit Information

---

# API Endpoints

## POST

/companies

Purpose

Create Company

Authentication Required

Recruiter

Admin

---

## GET

/companies

Purpose

Search Companies

Supports

Pagination

Filtering

Sorting

---

## GET

/companies/:id

Purpose

Retrieve Company Profile

Public Endpoint

---

## PATCH

/companies/:id

Purpose

Update Company

Only Company Admin

---

## DELETE

/companies/:id

Purpose

Soft Delete Company

Admin Only

---

## GET

/companies/:id/jobs

Purpose

Retrieve Company Jobs

Public Endpoint

---

## GET

/companies/:id/recruiters

Purpose

Retrieve Recruiters

Restricted

---

## PATCH

/companies/:id/status

Purpose

Update Company Status

Super Admin Only

---

# Validation Rules

Company Name

Required

Maximum

150 Characters

Website

Valid URL

Phone

Valid Phone Number

Email

Valid Email

Industry

Required

Company Size

Must match predefined values

Description

Maximum

5000 Characters

---

# Business Rules

Company name should be unique.

A recruiter cannot create duplicate companies.

Deleted companies cannot publish jobs.

Only company admins may update company information.

Only Super Admin can suspend companies.

Company deletion performs soft delete.

Public endpoints never expose internal data.

---

# Search & Filtering

Supported Filters

- Industry
- Company Size
- Verification Status
- Location

Sorting

- Newest
- Oldest
- Most Jobs
- Alphabetical

Pagination Required

---

# Company Statistics

Future Statistics

- Active Jobs
- Total Applications
- Total Recruiters
- Total Candidates Hired
- Company Followers
- Profile Views

---

# Error Handling

400

Validation Error

401

Unauthorized

403

Forbidden

404

Company Not Found

409

Company Already Exists

500

Internal Server Error

Never expose Prisma errors.

---

# Security Requirements

Authentication required for all modification endpoints.

Only company administrators may edit company information.

Only Super Admin may change company status.

Always validate ownership before updates.

Never expose internal company data.

---

# Dependencies

Authentication Middleware

Authorization Middleware

Prisma

Zod

Shared Error Handler

Shared Response Formatter

---

# Future Enhancements

Company Reviews

Company Ratings

Office Locations

Departments

Recruiter Invitations

Organization Hierarchy

Subscription Plans

Billing

Analytics Dashboard

AI Company Summary

Company Followers

Media Gallery

Career Pages

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
- Validate requests using Zod.
- Use authentication and authorization middleware.
- Return standardized API responses.
- Support pagination for listing endpoints.
- Implement production-ready code only.

---