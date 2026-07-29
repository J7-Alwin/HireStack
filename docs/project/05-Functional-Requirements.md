# Functional Requirements

Project: HireStack

Version: 1.0

Status: Final

---

# Overview

This document defines the functional behavior of HireStack.

Each requirement represents functionality the system must provide.

---

# Authentication Module

FR-001

The system shall allow candidates to register.

---

FR-002

The system shall allow registered users to log in.

---

FR-003

The system shall support secure password hashing.

---

FR-004

The system shall support password reset.

---

FR-005

The system shall verify user identity using JWT authentication.

---

# Candidate Module

FR-101

Candidates shall be able to:

- Create profile
- Update profile
- Upload resume
- Browse jobs
- Search jobs
- Filter jobs
- Apply for jobs
- View application history

---

FR-102

The system shall prevent duplicate applications.

---

FR-103

The system shall validate uploaded resumes.

---

# Recruiter Module

FR-201

Recruiters shall create job postings.

---

FR-202

Recruiters shall edit jobs.

---

FR-203

Recruiters shall archive or close jobs.

---

FR-204

Recruiters shall review applicants.

---

FR-205

Recruiters shall update application status.

---

FR-206

Recruiters shall search applicants.

---

FR-207

Recruiters shall download resumes.

---

# Administrator Module

FR-301

Administrators shall create recruiter accounts.

---

FR-302

Administrators shall activate or deactivate users.

---

FR-303

Administrators shall view platform analytics.

---

FR-304

Administrators shall manage companies.

---

# Dashboard Module

FR-401

Dashboard shall display:

- Total jobs
- Active jobs
- Applications
- Hiring status
- Recent activity

---

# Search Module

FR-501

The system shall support keyword search.

---

FR-502

The system shall support filtering by:

- Location
- Employment Type
- Experience
- Remote / Hybrid / On-site

---

FR-503

Search results shall support pagination.

---

# Notification Module (MVP)

FR-601

The system shall send email notifications for:

- Account verification
- Password reset
- Application submitted

---

# Security Module

FR-701

Protected routes shall require authentication.

---

FR-702

Users shall only access resources based on their roles.

---

FR-703

Sensitive data shall never be exposed in API responses.

---

# Audit Module

FR-801

The system shall log important events such as:

- Login
- Job creation
- Application submission
- Status changes

---

End of Document