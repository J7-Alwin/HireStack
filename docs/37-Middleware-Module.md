# 37. Middleware Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Middleware |
| Folder | src/middleware |
| Priority | Critical |
| Depends On | Shared Module, Authentication |
| Used By | Every Route |

---

# Module Purpose

The Middleware module provides reusable request-processing components that execute before controllers.

Middleware is responsible for authentication, authorization, request validation, security, logging, rate limiting, error handling, request parsing, and application-wide protections.

Every HTTP request should pass through one or more middleware before reaching the controller.

Middleware should never contain business logic.

---

# Responsibilities

The Middleware module is responsible for

- Authentication
- Authorization
- Request Validation
- Error Handling
- Rate Limiting
- Request Logging
- Security Headers
- CORS
- Request Parsing
- File Upload Validation
- Not Found Handling
- Request Timing
- API Version Validation (Future)

---

# Folder Structure

```text
src/
└── middleware/
    ├── auth.middleware.ts
    ├── role.middleware.ts
    ├── permission.middleware.ts
    ├── validation.middleware.ts
    ├── error.middleware.ts
    ├── async.middleware.ts
    ├── rate-limit.middleware.ts
    ├── cors.middleware.ts
    ├── helmet.middleware.ts
    ├── request-logger.middleware.ts
    ├── request-id.middleware.ts
    ├── request-time.middleware.ts
    ├── upload.middleware.ts
    ├── not-found.middleware.ts
    ├── maintenance.middleware.ts
    └── index.ts
```

---

# File Responsibilities

## auth.middleware.ts

Responsibilities

- Verify JWT
- Decode Token
- Load Current User
- Attach User to Request

Reject

- Missing Token
- Invalid Token
- Expired Token
- Suspended User
- Inactive User

---

## role.middleware.ts

Responsibilities

Restrict routes by role.

Examples

```ts
authorize(Role.SUPER_ADMIN)

authorize(Role.RECRUITER)

authorize(Role.CANDIDATE)
```

Supports multiple roles.

---

## permission.middleware.ts

Responsibilities

Resource-level authorization.

Examples

- Company Ownership
- Recruiter Ownership
- Resume Ownership
- Job Ownership
- Application Ownership

---

## validation.middleware.ts

Responsibilities

Validate

- Request Body
- Query
- Params

Uses Zod.

Automatically returns validation errors.

Controllers should never validate manually.

---

## error.middleware.ts

Global error handler.

Responsibilities

- Catch Errors
- Format Responses
- Log Errors

Never expose

- Stack traces (production)
- Prisma errors
- Internal secrets

---

## async.middleware.ts

Wrapper for async controllers.

Example

```ts
asyncHandler(controller)
```

Removes repetitive try/catch blocks.

---

## rate-limit.middleware.ts

Protect APIs.

Examples

Authentication

```
5 requests/minute
```

Password Reset

```
3 requests/hour
```

General APIs

```
100 requests/minute
```

Uses

express-rate-limit

Future

Redis Rate Limiting

---

## cors.middleware.ts

Configure

Allowed Origins

Allowed Methods

Allowed Headers

Credentials

Development

Allow localhost

Production

Whitelist CLIENT_URL

---

## helmet.middleware.ts

Adds security headers.

Examples

- XSS Protection
- CSP
- HSTS
- Frame Protection
- Content Type Protection

Uses Helmet.

---

## request-logger.middleware.ts

Logs

Method

URL

Response Status

Execution Time

IP

User Agent

Authenticated User

Never logs

Passwords

JWT

Secrets

---

## request-id.middleware.ts

Generate unique request IDs.

Every request receives

```text
X-Request-ID
```

Useful for

Debugging

Tracing

Logging

---

## request-time.middleware.ts

Records

Request Start

Request End

Execution Time

Response Time

Future

Performance Metrics

---

## upload.middleware.ts

Responsibilities

Configure Multer

Validate

- File Type
- Size
- Extension

Reject invalid uploads before controller.

---

## not-found.middleware.ts

Handles unknown routes.

Returns

404

Standardized response.

---

## maintenance.middleware.ts

Future

Blocks requests while maintenance mode is enabled.

Allow

Health endpoints

Admin routes

---

# Middleware Execution Order

Incoming Request

↓

Request ID

↓

Request Logger

↓

Helmet

↓

CORS

↓

Rate Limiter

↓

Authentication

↓

Authorization

↓

Validation

↓

Controller

↓

Error Middleware

↓

Response

---

# Authentication Flow

Authorization Header

↓

Extract Bearer Token

↓

Verify JWT

↓

Load User

↓

Check Status

↓

Attach Request User

↓

Next()

---

# Authorization Flow

Authenticated User

↓

Required Role

↓

Permission Check

↓

Allow

OR

403 Forbidden

---

# Validation Flow

Receive Request

↓

Validate Zod Schema

↓

Success

↓

Controller

OR

↓

Validation Error

---

# Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

Development may include stack.

Production never includes stack.

---

# Request User Object

Attached to

```ts
req.user
```

Contains

```ts
id

email

role

status

companyId

recruiterId
```

Never attach password.

---

# Security Requirements

Every protected endpoint requires authentication.

Role middleware must execute after authentication.

Validation occurs before controller execution.

Rate limiter executes before authentication.

Never expose internal errors.

Sanitize request data.

Validate uploaded files.

---

# Error Codes

400

Validation Error

401

Unauthorized

403

Forbidden

404

Not Found

409

Conflict

413

Payload Too Large

415

Unsupported Media Type

429

Too Many Requests

500

Internal Server Error

---

# Dependencies

express-rate-limit

helmet

cors

multer

zod

jsonwebtoken

bcrypt

uuid

Prisma

Shared Module

---

# Future Enhancements

Redis Rate Limiting

Distributed Request IDs

OpenTelemetry

API Version Middleware

Feature Flags

Maintenance Dashboard

Geo Blocking

IP Whitelisting

Bot Detection

Request Replay Protection

Circuit Breaker

Security Event Monitoring

---

# Coding Notes for AI Agent

Before implementation, read

- 13-API-Standards.md
- 15-Backend-Folder-Architecture.md
- 17-Security-Specification.md
- 36-Shared-Module.md

Implementation Rules

- Middleware must never contain business logic.
- Every middleware should have a single responsibility.
- Export middleware through barrel files.
- Use strict TypeScript types.
- Authentication must always execute before authorization.
- Validation should use reusable Zod middleware.
- Global error middleware must be registered last.
- Logging must never expose sensitive information.
- Generate production-ready code only.

---