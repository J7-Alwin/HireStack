# 23. Authentication Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Authentication |
| Folder | src/modules/auth |
| Priority | High |
| Depends On | User Module |
| Database Models | User, RefreshToken (Future), Session (Future), AuditLog (Future) |

---

# Module Purpose

The Authentication module is responsible for identifying users, verifying credentials, generating secure access tokens, maintaining authenticated sessions, protecting APIs, and enforcing authorization based on user roles.

This module is the entry point for all secured parts of the application.

Every authenticated request must pass through this module.

---

# Responsibilities

The Authentication module is responsible for:

- User Login
- User Logout
- Refresh Token Generation
- Access Token Generation
- Password Hashing
- Password Verification
- Authentication Middleware
- Authorization Middleware
- JWT Validation
- Current User Retrieval
- Password Change
- Password Reset (Future)
- Email Verification (Future)
- OTP Verification (Future)
- Session Management (Future)

This module must never contain unrelated business logic.

---

# Folder Structure

```text
src/
└── modules/
    └── auth/
        ├── auth.controller.ts
        ├── auth.service.ts
        ├── auth.repository.ts
        ├── auth.routes.ts
        ├── auth.validation.ts
        ├── auth.types.ts
        ├── auth.middleware.ts
        ├── auth.constants.ts
        └── index.ts
```

---

# File Responsibilities

## auth.controller.ts

Responsibilities

- Receive HTTP requests
- Validate request
- Call services
- Return standardized API responses

Must NOT

- Hash passwords
- Generate JWT
- Query Prisma directly
- Contain business logic

---

## auth.service.ts

Responsibilities

- Authenticate users
- Verify passwords
- Generate JWT tokens
- Validate JWT
- Change password
- Coordinate repositories
- Apply business rules

Must NOT

- Receive Express Request objects
- Return HTTP responses

---

## auth.repository.ts

Responsibilities

- Query User table
- Update password
- Read user by email
- Read user by ID

Must NOT

- Hash passwords
- Generate JWT
- Validate requests

---

## auth.validation.ts

Contains

Zod schemas for

- Login
- Change Password
- Refresh Token

---

## auth.routes.ts

Contains

Express routes

No business logic.

---

## auth.middleware.ts

Contains

Authentication Middleware

Authorization Middleware

---

## auth.types.ts

Contains

Interfaces

DTOs

Request Types

JWT Payload Types

---

## auth.constants.ts

Contains

Constants used by Auth module

Example

Token names

Cookie names

Header names

---

# Database Models Used

Current

User

Future

RefreshToken

Session

AuditLog

PasswordReset

EmailVerification

OTP

---

# Authentication Flow

User

↓

POST /auth/login

↓

Validation

↓

Service

↓

Repository

↓

Prisma

↓

Verify Password

↓

Generate JWT

↓

Return Access Token

↓

Frontend stores token securely

---

# JWT Strategy

Authentication uses

Access Token

Refresh Token

Access Token

Purpose

API Authentication

Lifetime

15 minutes

Refresh Token

Purpose

Generate new Access Token

Lifetime

7 days

Algorithm

HS256

Secrets stored in

Environment Variables

Never hardcode secrets.

---

# Password Strategy

Algorithm

bcrypt

Salt Rounds

Environment Variable

Passwords are never stored as plain text.

Passwords are always hashed before saving.

Passwords are compared using bcrypt.compare().

---

# Authentication Middleware

Responsibilities

- Read Authorization Header
- Validate JWT
- Extract User ID
- Extract Role
- Attach User to Request
- Reject Invalid Tokens

Authorization Header

Bearer <token>

Reject

401 Unauthorized

When

- Missing Token
- Invalid Token
- Expired Token

---

# Authorization Middleware

Responsible for

Role Based Access

Supported Roles

SUPER_ADMIN

RECRUITER

CANDIDATE

Example

Require Role

SUPER_ADMIN

↓

Admin Route

Otherwise

403 Forbidden

---

# API Endpoints

## POST

/auth/login

Purpose

Authenticate User

Request

Email

Password

Response

Access Token

Refresh Token

User Information

---

## POST

/auth/logout

Invalidate Session

(Current implementation may simply instruct the client to discard tokens. Future versions may revoke refresh tokens.)

---

## POST

/auth/refresh

Generate New Access Token

Requires

Refresh Token

---

## GET

/auth/me

Return Current Logged User

---

## PATCH

/auth/change-password

Requires Authentication

Old Password

New Password

---

# Validation Rules

Login

Email

- Required
- Valid Email

Password

- Required
- Minimum Length

Change Password

Old Password

Required

New Password

Minimum

8 Characters

Maximum

128 Characters

Must differ from Old Password

---

# Business Rules

A user cannot login with invalid credentials.

Inactive users cannot login.

Suspended users cannot login.

Passwords must always be hashed.

JWT secrets must come from environment variables.

Controllers never communicate with Prisma.

Repositories never generate JWT.

Services never return Express Response objects.

Authentication middleware must protect private APIs.

Authorization middleware must enforce role permissions.

---

# Error Handling

Return standardized API responses.

Common Errors

400

Validation Error

401

Invalid Credentials

401

Expired Token

401

Missing Token

403

Access Denied

404

User Not Found

500

Internal Server Error

Never expose

- Stack traces
- Prisma errors
- JWT secrets
- Password hashes

---

# Security Requirements

Always use HTTPS in production.

Hash passwords.

Validate JWT signature.

Use environment variables for secrets.

Do not log passwords.

Do not log JWT secrets.

Never expose sensitive user information.

Reject malformed tokens.

Reject expired tokens.

---

# Dependencies

bcrypt

jsonwebtoken

zod

Prisma

Express

Environment Configuration

Shared Error Handler

---

# Future Enhancements

Email Verification

Forgot Password

OTP Login

Google OAuth

GitHub OAuth

LinkedIn OAuth

Multi-Factor Authentication

Device Management

Session Revocation

Remember Me

Refresh Token Rotation

Account Lockout

Login Attempt Rate Limiting

Audit Logs

---

# Coding Notes for AI Agent

Before implementing this module, the coding agent MUST read:

- 10-System-Architecture.md
- 12-Database-Schema-Specification.md
- 13-API-Standards.md
- 14-Authentication-Authorization-Flow.md
- 15-Backend-Folder-Architecture.md
- 17-Security-Specification.md
- 18-Coding-Standards-Git-Workflow.md

Implementation Rules

- Use strict TypeScript.
- Follow Controller → Service → Repository architecture.
- Use Prisma only inside repositories.
- Use Zod for validation.
- Use bcrypt for password hashing.
- Use JWT for authentication.
- Do not generate placeholder code.
- Do not leave TODO comments.
- Return production-ready code only.
- Follow project naming conventions exactly.

---