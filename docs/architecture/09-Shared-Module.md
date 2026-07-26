# 36. Shared Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Shared |
| Folder | src/shared |
| Priority | Critical |
| Depends On | None |
| Used By | Every Module |

---

# Module Purpose

The Shared module provides reusable infrastructure used throughout the entire HireStack backend.

It contains common utilities, helpers, middleware support, response formatting, logging, pagination, validation helpers, constants, permissions, authentication helpers, cryptography utilities, date utilities, and reusable business logic.

No feature module should duplicate functionality that belongs inside the Shared module.

The Shared module should have zero business logic related to jobs, users, recruiters, companies, or applications.

It only contains reusable platform utilities.

---

# Responsibilities

The Shared module is responsible for:

- Standard API Responses
- Error Handling
- Async Handler
- Pagination
- Query Builder
- Filtering
- Sorting
- Logger
- JWT Utilities
- Password Utilities
- Crypto Utilities
- Date Utilities
- Validation Helpers
- Constants
- Enums
- Permission Helpers
- Upload Helpers
- Environment Helpers
- String Utilities
- Number Utilities
- Array Utilities
- File Utilities

---

# Folder Structure

```text
src/
└── shared/
    ├── constants/
    │      ├── api.constants.ts
    │      ├── auth.constants.ts
    │      ├── pagination.constants.ts
    │      ├── validation.constants.ts
    │      ├── upload.constants.ts
    │      ├── regex.constants.ts
    │      └── index.ts
    │
    ├── enums/
    │      ├── role.enum.ts
    │      ├── status.enum.ts
    │      ├── sort.enum.ts
    │      ├── order.enum.ts
    │      └── index.ts
    │
    ├── errors/
    │      ├── ApiError.ts
    │      ├── NotFoundError.ts
    │      ├── UnauthorizedError.ts
    │      ├── ForbiddenError.ts
    │      ├── ConflictError.ts
    │      ├── ValidationError.ts
    │      └── index.ts
    │
    ├── responses/
    │      ├── success.response.ts
    │      ├── error.response.ts
    │      └── pagination.response.ts
    │
    ├── logger/
    │      ├── logger.ts
    │      ├── request.logger.ts
    │      └── audit.logger.ts
    │
    ├── jwt/
    │      ├── jwt.ts
    │      ├── access-token.ts
    │      ├── refresh-token.ts
    │      └── token.types.ts
    │
    ├── password/
    │      ├── hash.ts
    │      ├── compare.ts
    │      └── password.helper.ts
    │
    ├── pagination/
    │      ├── pagination.ts
    │      ├── pagination.helper.ts
    │      └── pagination.types.ts
    │
    ├── query/
    │      ├── query-builder.ts
    │      ├── filters.ts
    │      ├── sorting.ts
    │      └── search.ts
    │
    ├── permissions/
    │      ├── permissions.ts
    │      ├── roles.ts
    │      └── access.ts
    │
    ├── validators/
    │      ├── common.validator.ts
    │      ├── file.validator.ts
    │      ├── password.validator.ts
    │      ├── email.validator.ts
    │      └── index.ts
    │
    ├── utils/
    │      ├── async-handler.ts
    │      ├── crypto.ts
    │      ├── date.ts
    │      ├── slug.ts
    │      ├── uuid.ts
    │      ├── random.ts
    │      ├── string.ts
    │      ├── number.ts
    │      ├── object.ts
    │      ├── array.ts
    │      ├── sleep.ts
    │      └── index.ts
    │
    ├── upload/
    │      ├── multer.ts
    │      ├── upload.helper.ts
    │      └── mime.types.ts
    │
    ├── types/
    │      ├── api.types.ts
    │      ├── pagination.types.ts
    │      ├── common.types.ts
    │      └── index.ts
    │
    └── index.ts
```

---

# Folder Responsibilities

---

## constants/

Contains reusable application constants.

Examples

- Default Pagination
- JWT Constants
- Validation Limits
- Upload Limits
- Regular Expressions
- HTTP Status Codes
- API Messages

Must never contain business logic.

---

## enums/

Contains global enums.

Examples

- Roles
- Account Status
- Sort Order
- Gender
- File Type
- Employment Type (if globally reused)

---

## errors/

Contains reusable custom error classes.

Examples

- ApiError
- ValidationError
- UnauthorizedError
- ForbiddenError
- ConflictError
- NotFoundError

Every custom error extends ApiError.

---

## responses/

Provides standardized API responses.

Every API should return the same structure.

Success

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {},
  "meta": {}
}
```

Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [],
  "stack": null
}
```

Development mode may include stack traces.

Production must never expose stack traces.

---

## logger/

Provides centralized logging.

Responsible for

- API Logs
- Error Logs
- Database Logs
- Request Logs
- Audit Logs

Future

- Winston
- Pino
- OpenTelemetry

---

## jwt/

Responsible for

- Generate Access Token
- Generate Refresh Token
- Verify Token
- Decode Token

No business logic.

---

## password/

Responsible for

- Hash Password
- Compare Password
- Password Validation
- Password Strength

Uses bcrypt.

---

## pagination/

Responsible for

- Page
- Limit
- Skip
- Offset
- Meta Generation

Standard pagination response

```json
{
  "page": 1,
  "limit": 10,
  "total": 250,
  "totalPages": 25
}
```

---

## query/

Reusable Prisma query builders.

Supports

- Search
- Filtering
- Sorting
- Pagination

Should prevent duplicated query logic across modules.

---

## permissions/

Contains permission helpers.

Examples

- hasRole()

- canManageCompany()

- canEditJob()

- isCompanyOwner()

Future

Permission Matrix

RBAC

ABAC

---

## validators/

Reusable validators.

Examples

Email

Password

Phone

URL

Slug

UUID

File

Color

Country

---

## utils/

General reusable utilities.

Examples

Date Formatting

Slug Generation

Random Strings

UUID

Sleep

Deep Clone

Currency Formatting

Sanitization

---

## upload/

Contains reusable upload configuration.

Responsible for

- Multer Configuration
- File Filters
- Upload Limits

---

## types/

Reusable TypeScript interfaces.

Examples

Pagination

API Response

JWT Payload

Request User

Common DTOs

---

# Shared Coding Standards

Every utility must

- Have unit tests
- Be reusable
- Be documented
- Be independent
- Avoid circular dependencies

---

# API Response Standard

Every endpoint returns

```ts
{
  success: boolean;

  message: string;

  data?: object;

  meta?: object;

  errors?: object[];
}
```

Never return inconsistent structures.

---

# Error Handling Standard

Throw only custom errors.

Never throw raw strings.

Never expose Prisma errors.

Map all errors to standardized responses.

---

# Logging Standard

Log

- Request
- Response
- Error
- Authentication
- Authorization
- Audit
- Database

Never log

- Passwords
- JWT Secrets
- Refresh Tokens
- Sensitive Personal Data

---

# Security Standards

Never expose

- Secrets
- Password Hashes
- JWT Secrets
- Internal Errors

Always sanitize

- User Input
- Query Parameters
- File Names

---

# Dependencies

bcrypt

jsonwebtoken

zod

multer

uuid

dayjs

dotenv

Prisma

---

# Future Enhancements

Redis Cache Helpers

Rate Limit Helpers

Event Bus

Feature Flags

OpenTelemetry

Metrics

Tracing

Health Check Helpers

Localization

Caching Layer

Encryption Helpers

Background Tasks

---

# Coding Notes for AI Agent

Implementation Rules

- Shared module must have zero business logic.
- Every helper must be reusable.
- Every utility must be independently testable.
- Avoid circular imports.
- Export everything through barrel files.
- Use strict TypeScript typing.
- Follow single responsibility principle.
- All feature modules must consume shared utilities instead of implementing duplicates.
- Generate production-ready code only.

---