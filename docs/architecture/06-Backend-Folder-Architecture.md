# Backend Folder Architecture

Project: HireStack

Version: 1.0

Status: Final

Document ID: ARCH-002

---

# Purpose

This document defines the backend folder structure, coding organization, and module boundaries.

The architecture follows a Feature-Based Modular Design to improve scalability and maintainability.

---

# Backend Structure

backend/

├── src/
│
├── config/
│   ├── database.ts
│   ├── env.ts
│   ├── logger.ts
│   └── cloudinary.ts
│
├── modules/
│   │
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.validation.ts
│   │   └── auth.types.ts
│   │
│   ├── users/
│   ├── companies/
│   ├── recruiters/
│   ├── candidates/
│   ├── jobs/
│   ├── applications/
│   ├── resumes/
│   └── dashboard/
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── role.middleware.ts
│   ├── validation.middleware.ts
│   ├── error.middleware.ts
│   └── upload.middleware.ts
│
├── services/
│   ├── email.service.ts
│   ├── cloudinary.service.ts
│   └── token.service.ts
│
├── utils/
│   ├── ApiError.ts
│   ├── ApiResponse.ts
│   ├── logger.ts
│   ├── pagination.ts
│   └── constants.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── types/
│
├── app.ts
│
└── server.ts

---

# Module Responsibilities

Auth

Handles:

- Register
- Login
- Logout
- Refresh Token
- Forgot Password
- Reset Password

---

Users

Handles:

- User Profile
- Update Profile
- User Search

---

Companies

Handles:

- Company CRUD
- Company Details

---

Recruiters

Handles:

- Recruiter Management
- Recruiter Dashboard

---

Candidates

Handles:

- Candidate Dashboard
- Candidate Profile

---

Jobs

Handles:

- Job CRUD
- Job Search
- Job Filters

---

Applications

Handles:

- Apply Job
- Update Status
- Application History

---

Resumes

Handles:

- Upload
- Download
- Validation

---

Dashboard

Handles:

- Analytics
- Statistics
- Recent Activity

---

# Shared Services

Email Service

Responsible for:

- Welcome Email
- Password Reset
- Verification Email

---

Cloudinary Service

Responsible for:

- Resume Upload
- Resume Delete

---

Token Service

Responsible for:

- JWT Generation
- Refresh Tokens
- Verification

---

# Middleware Pipeline

Incoming Request

↓

Rate Limiter

↓

Helmet

↓

CORS

↓

Authentication

↓

Authorization

↓

Validation

↓

Controller

↓

Service

↓

Prisma

↓

Database

↓

Response Formatter

---

# Coding Principles

One Controller per Module

One Service per Module

Controllers contain no business logic.

Business logic belongs only in Services.

Database access only through Prisma.

Utilities remain reusable.

Avoid circular dependencies.

---

# Folder Naming Rules

Use lowercase.

Use singular file names.

Use descriptive names.

Avoid abbreviations.

Examples

Good

jobs.service.ts

Bad

jobSrv.ts

---

# Future Modules

notifications/

chat/

interviews/

calendar/

analytics/

ai/

payments/

---

End of Document