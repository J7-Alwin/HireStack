# User Personas

Project: HireStack

Version: 1.0

Status: Final

---

# Introduction

HireStack is designed for three primary user groups:

1. Administrator
2. Recruiter
3. Candidate

Each user has different goals, permissions, workflows, and system access.

Understanding these personas ensures that every feature is built with a clear purpose and user experience in mind.

---

# Persona 1 — Administrator

## Overview

The Administrator manages the overall platform and ensures smooth operation of the recruitment system.

Administrators have full system privileges but are not directly involved in the recruitment process.

---

## Responsibilities

- Manage recruiters
- Manage candidates (limited administrative actions)
- View platform analytics
- Manage platform settings
- Monitor system health
- Handle reported issues

---

## Goals

- Maintain platform stability
- Manage user accounts
- Monitor recruitment activities
- Generate reports
- Ensure platform security

---

## Pain Points

- Difficult to manage many users manually
- Lack of visibility into platform usage
- Security concerns
- User management complexity

---

## Permissions

Can:

✓ View all users

✓ Create recruiters

✓ Activate / Deactivate users

✓ View analytics

✓ View all jobs

✓ View all applications

✓ Manage system settings

Cannot:

✗ Apply for jobs

✗ Submit resumes

---

# Persona 2 — Recruiter

## Overview

Recruiters represent companies using HireStack to manage their hiring process.

They interact with the platform daily.

---

## Responsibilities

- Create job openings
- Edit jobs
- Close jobs
- View applications
- Review resumes
- Shortlist candidates
- Reject candidates
- Update hiring status

---

## Goals

- Hire qualified candidates quickly
- Organize applications
- Reduce manual work
- Track recruitment progress

---

## Pain Points

- Too many resumes
- Manual tracking
- Candidate communication
- Poor organization

---

## Permissions

Can:

✓ Create jobs

✓ Edit jobs

✓ Delete jobs

✓ View applicants

✓ Download resumes

✓ Change application status

✓ View dashboard

Cannot:

✗ Manage platform users

✗ Access system settings

---

# Persona 3 — Candidate

## Overview

Candidates use HireStack to discover opportunities and apply for jobs.

They expect a fast and transparent application experience.

---

## Responsibilities

- Maintain profile
- Upload resume
- Browse jobs
- Apply for jobs
- Track applications

---

## Goals

- Find relevant jobs
- Apply quickly
- Track application progress
- Maintain professional profile

---

## Pain Points

- Long application forms
- No status updates
- Duplicate applications
- Difficult profile management

---

## Permissions

Can:

✓ Register

✓ Login

✓ Update profile

✓ Upload resume

✓ Browse jobs

✓ Apply for jobs

✓ View application history

Cannot:

✗ Create jobs

✗ View other candidates

✗ Access recruiter dashboard

✗ Access admin panel

---

# Permission Matrix

| Feature | Admin | Recruiter | Candidate |
|----------|-------|-----------|-----------|
| Register | No | No | Yes |
| Login | Yes | Yes | Yes |
| Dashboard | Yes | Yes | Yes |
| Manage Users | Yes | No | No |
| Create Recruiter | Yes | No | No |
| Create Job | No | Yes | No |
| Edit Job | No | Yes | No |
| Delete Job | No | Yes | No |
| Browse Jobs | Yes | Yes | Yes |
| Apply Job | No | No | Yes |
| Upload Resume | No | No | Yes |
| View Applicants | Yes | Yes | No |
| Update Application Status | Yes | Yes | No |
| Analytics | Yes | Yes | No |
| System Settings | Yes | No | No |

---

# User Priorities

Administrator

1. Security
2. User Management
3. Analytics

---

Recruiter

1. Hiring Workflow
2. Resume Management
3. Candidate Tracking

---

Candidate

1. Easy Registration
2. Job Search
3. Application Tracking

---

# Design Considerations

The interface should adapt based on user role.

Each user should only see features relevant to their responsibilities.

This reduces complexity and improves usability.

---

# Future Personas

Future versions may introduce:

- Hiring Manager
- Interviewer
- HR Manager
- Company Owner
- Team Lead
- External Recruiter

These roles are intentionally excluded from Version 1 to maintain MVP simplicity.

---

End of Document