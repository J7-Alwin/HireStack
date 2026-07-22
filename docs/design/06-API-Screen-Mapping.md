# API ↔ Screen Mapping

Project: HireStack

Version: 1.0

Status: Final

Document ID: MAP-001

---

# Purpose

This document maps frontend screens to backend API endpoints.

It ensures every screen has a clearly defined backend dependency.

---

# Public Pages

## Landing Page

API

None

---

## Login

POST

/api/v1/auth/login

---

## Register

POST

/api/v1/auth/register

---

## Forgot Password

POST

/api/v1/auth/forgot-password

---

## Jobs

GET

/api/v1/jobs

---

## Job Details

GET

/api/v1/jobs/:id

---

# Candidate

Dashboard

GET

/api/v1/dashboard/candidate

---

Profile

GET

/api/v1/users/profile

PATCH

/api/v1/users/profile

---

Resume

POST

/api/v1/resumes

GET

/api/v1/resumes

DELETE

/api/v1/resumes/:id

---

Applications

GET

/api/v1/applications

POST

/api/v1/applications

GET

/api/v1/applications/:id

---

# Recruiter

Dashboard

GET

/api/v1/dashboard/recruiter

---

Jobs

GET

/api/v1/jobs

POST

/api/v1/jobs

PATCH

/api/v1/jobs/:id

DELETE

/api/v1/jobs/:id

---

Applicants

GET

/api/v1/jobs/:id/applicants

PATCH

/api/v1/applications/:id/status

---

Company

GET

/api/v1/companies/me

PATCH

/api/v1/companies/me

---

# Admin

Dashboard

GET

/api/v1/dashboard/admin

---

Users

GET

/api/v1/users

PATCH

/api/v1/users/:id

---

Companies

GET

/api/v1/companies

POST

/api/v1/companies

PATCH

/api/v1/companies/:id

DELETE

/api/v1/companies/:id

---

Analytics

GET

/api/v1/dashboard/analytics

---

Audit Logs

GET

/api/v1/audit-logs

---

End of Document