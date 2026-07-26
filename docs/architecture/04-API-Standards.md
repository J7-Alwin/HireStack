# API Standards

Project: HireStack

Version: 1.0

Status: Final

Document ID: API-001

---

# Purpose

This document defines the standards for designing and implementing REST APIs in HireStack.

Following consistent API standards improves maintainability, readability, and developer experience.

---

# Base URL

Development:
http://localhost:5000/api/v1

Production:
https://api.hirestack.app/api/v1

---

# API Versioning

All endpoints must include a version prefix.

Example:

/api/v1/auth/login

/api/v1/jobs

/api/v1/applications

Future versions:

/api/v2/...

---

# HTTP Methods

GET

Retrieve data.

POST

Create resources.

PUT

Replace entire resource.

PATCH

Partially update resource.

DELETE

Soft delete where applicable.

---

# Response Format

Every API response follows a consistent structure.

Success

{
  "success": true,
  "message": "Job created successfully.",
  "data": { }
}

Error

{
  "success": false,
  "message": "Validation failed.",
  "errors": [ ]
}

---

# HTTP Status Codes

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Unprocessable Entity

429 Too Many Requests

500 Internal Server Error

---

# Naming Conventions

Use plural nouns.

Good

/users

/jobs

/companies

/applications

Avoid

/getJobs

/createUser

/deleteApplication

---

# Query Parameters

Examples

/jobs?page=1&limit=10

/jobs?status=published

/jobs?location=Kochi

/jobs?keyword=React

---

# Authentication

Protected routes require:

Authorization: Bearer <access_token>

---

# Pagination Format

{
  "page": 1,
  "limit": 10,
  "total": 125,
  "totalPages": 13
}

---

# Error Handling

Errors must include:

Status Code

Message

Optional Validation Errors

Example

{
  "success": false,
  "message": "Email already exists."
}

---

# Validation

All incoming requests must be validated before reaching business logic.

Validation failures return:

422 Unprocessable Entity

---

# File Upload

Resume uploads use:

multipart/form-data

Supported Formats

PDF

DOCX

Maximum Size

5 MB

---

# Security Standards

JWT Authentication

Role-Based Authorization

Rate Limiting

Helmet

CORS

Input Validation

Password Hashing

Secure Environment Variables

---

# Logging

Log:

Authentication events

Errors

Job creation

Application submission

Admin actions

Exclude:

Passwords

JWT Tokens

Sensitive user information

---

End of Document