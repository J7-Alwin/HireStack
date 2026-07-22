# 24. Users Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Users |
| Folder | src/modules/users |
| Priority | High |
| Depends On | Authentication |
| Database Models | User, CandidateProfile, RecruiterProfile, Company (Relationship), Resume (Relationship) |

---

# Module Purpose

The Users module manages all user-related operations after authentication.

It provides APIs for retrieving, updating, and managing user accounts while ensuring data integrity, security, and role-based access.

This module is responsible only for user account information.

Recruitment, jobs, resumes, interviews, and companies belong to their own modules.

---

# Responsibilities

The Users module is responsible for:

- Retrieve Current User
- Retrieve User by ID
- Update User Profile
- Update Personal Information
- Change Profile Picture
- View Public Profile
- View Private Profile
- Manage Profile Completion
- Soft Delete Account
- Activate/Deactivate Account (Admin)
- Account Status Management

This module must never handle login or token generation.

---

# Folder Structure

```text
src/
└── modules/
    └── users/
        ├── users.controller.ts
        ├── users.service.ts
        ├── users.repository.ts
        ├── users.routes.ts
        ├── users.validation.ts
        ├── users.types.ts
        ├── users.constants.ts
        └── index.ts
```

---

# File Responsibilities

## users.controller.ts

Responsibilities

- Handle HTTP requests
- Validate input
- Call service layer
- Return API responses

Must NOT

- Query Prisma
- Implement business logic

---

## users.service.ts

Responsibilities

- User business logic
- Profile updates
- Permission checks
- Data transformation
- Profile completion calculation

---

## users.repository.ts

Responsibilities

- Query User table
- Update User
- Retrieve User
- Soft delete account

Only database access.

---

## users.validation.ts

Contains

Zod validation schemas

- Update Profile
- Update Avatar
- User Search
- User ID validation

---

## users.routes.ts

Contains Express routes.

---

## users.types.ts

Contains

Interfaces

DTOs

Request Types

Response Types

---

## users.constants.ts

Contains

Default values

Maximum lengths

Validation constants

---

# Database Models Used

Primary

User

Related

CandidateProfile

RecruiterProfile

Resume

Company

Notification

Application

Relationships must use Prisma relations.

---

# User Roles

Supported Roles

SUPER_ADMIN

RECRUITER

CANDIDATE

Role determines accessible endpoints.

---

# User Profile

Every user contains

- ID
- Email
- Full Name
- Phone Number
- Profile Image
- Role
- Status
- Email Verification Status
- Created Date
- Updated Date

Passwords must never be returned.

JWT tokens must never be returned.

---

# Public Profile

Visible Fields

- Name
- Profile Image
- Headline
- Skills (Future)
- Experience Summary
- Education Summary

Hidden Fields

- Email
- Password
- Internal Status
- JWT Information
- Audit Data

---

# Private Profile

Owner can access

Everything except

- Password Hash

Admin can access

All fields except password hash.

---

# API Endpoints

## GET

/users/me

Purpose

Return logged-in user.

Authentication Required

Yes

---

## GET

/users/:id

Return public profile.

Authentication

Optional (based on business rules).

---

## PATCH

/users/me

Update own profile.

Authentication Required

Yes

---

## PATCH

/users/avatar

Update profile image.

Authentication Required

Yes

---

## DELETE

/users/me

Soft delete account.

Authentication Required

Yes

---

## GET

/users

Admin only.

Return paginated user list.

---

## PATCH

/users/:id/status

Admin only.

Update account status.

---

# Validation Rules

Name

- Required
- Maximum length 100

Phone

- Optional
- Valid format

Profile Image

- Valid URL or uploaded file reference

Email

- Cannot be changed without verification process (Future)

---

# Business Rules

A user may update only their own profile.

Admins may update account status.

Passwords are handled only by Authentication module.

Deleting an account performs a soft delete.

Deleted users cannot authenticate.

Inactive users cannot perform protected actions.

Public APIs never expose sensitive information.

---

# Profile Completion

The system calculates profile completion based on available information.

Possible factors

- Name
- Phone
- Avatar
- Resume
- Skills
- Experience
- Education

Completion percentage is used throughout the platform.

---

# Error Handling

400

Validation Error

401

Unauthorized

403

Forbidden

404

User Not Found

409

Duplicate Email (Future)

500

Internal Server Error

Never expose internal database errors.

---

# Security Requirements

Only authenticated users may update their profile.

Only admins may manage account status.

Always validate ownership before updates.

Never expose password hashes.

Never expose authentication secrets.

Always sanitize user output.

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

Username support

Multiple profile pictures

Profile themes

Social links

Portfolio

Personal website

Two-factor verification status

Privacy settings

Language preferences

Notification preferences

Dark mode preferences

Public profile sharing

Account export

Account recovery

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

- Use strict TypeScript.
- Use Controller → Service → Repository architecture.
- Repository handles Prisma only.
- Validate every request using Zod.
- Return standardized API responses.
- Do not expose sensitive fields.
- Use authentication middleware for protected routes.
- Generate production-ready code only.

---