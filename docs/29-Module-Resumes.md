# 29. Resumes Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | Resumes |
| Folder | src/modules/resumes |
| Priority | Critical |
| Depends On | Authentication, Users |
| Database Models | Resume, ResumeVersion, User, Skill, Education, Experience, Project, Certification, Language |

---

# Module Purpose

The Resumes module manages candidate resumes within HireStack.

It allows candidates to create, update, organize, and publish professional resumes that can be used while applying for jobs.

A candidate may maintain multiple resumes but only one resume can be marked as the default resume for job applications.

This module will also power future AI features such as Resume Parsing, Resume Scoring, Resume Optimization, and AI Resume Builder.

---

# Responsibilities

The Resumes module is responsible for:

- Create Resume
- Update Resume
- Delete Resume
- Duplicate Resume
- Resume Versioning
- Set Default Resume
- Upload Resume PDF
- Download Resume
- Resume Preview
- Resume Sharing
- Resume Visibility
- Resume Statistics
- Resume Parsing (Future)
- AI Resume Optimization (Future)

---

# Folder Structure

```text
src/
└── modules/
    └── resumes/
        ├── resume.controller.ts
        ├── resume.service.ts
        ├── resume.repository.ts
        ├── resume.routes.ts
        ├── resume.validation.ts
        ├── resume.types.ts
        ├── resume.constants.ts
        └── index.ts
```

---

# File Responsibilities

## resume.controller.ts

Responsibilities

- Handle HTTP requests
- Validate requests
- Call service layer
- Return standardized responses

Must NOT

- Query Prisma
- Implement business logic

---

## resume.service.ts

Responsibilities

- Resume business logic
- Resume versioning
- Resume visibility
- Resume sharing
- Default resume management
- Resume validation

---

## resume.repository.ts

Responsibilities

- CRUD operations
- Resume retrieval
- Version management
- Statistics queries

Only database access.

---

## resume.validation.ts

Contains

Zod Schemas

- Create Resume
- Update Resume
- Upload Resume
- Set Default Resume

---

## resume.routes.ts

Contains

Express Routes

---

## resume.types.ts

Contains

Interfaces

DTOs

Enums

Response Types

---

## resume.constants.ts

Contains

Visibility Types

Resume Status

Validation Constants

---

# Database Models Used

Primary

Resume

Related

ResumeVersion

User

Skill

Education

Experience

Project

Certification

Language

Application

AuditLog

---

# Resume Information

Each resume stores

- Resume Title
- Candidate
- Summary
- Skills
- Education
- Experience
- Projects
- Certifications
- Languages
- Resume PDF
- Resume Template
- Visibility
- Default Status
- Created Date
- Updated Date

---

# Resume Status

Supported Status

DRAFT

PUBLISHED

ARCHIVED

DELETED

Only published resumes are available for job applications.

---

# Resume Visibility

PRIVATE

PUBLIC

RECRUITERS_ONLY

LINK_ONLY (Future)

Visibility determines who can access the resume.

---

# Resume Sections

A resume may contain

- Personal Information
- Professional Summary
- Work Experience
- Education
- Skills
- Certifications
- Projects
- Achievements
- Languages
- Interests (Optional)
- References (Optional)

---

# Resume Versioning

Every significant update creates a new version.

Previous versions remain available.

Candidates may restore previous versions.

Version history cannot be modified.

---

# Resume Templates

Future support

- Classic
- Modern
- Minimal
- Professional
- Creative

Candidates may switch templates without changing data.

---

# Candidate Permissions

Candidates may

- Create Resume
- Edit Resume
- Delete Resume
- Download Resume
- Duplicate Resume
- Share Resume
- Set Default Resume

Candidates may NOT

- Modify another candidate's resume

---

# Recruiter Permissions

Recruiters may

- View shared resumes
- View resumes attached to applications

Recruiters may NOT

- Edit resumes
- Delete resumes

---

# API Endpoints

## POST

/resumes

Purpose

Create Resume

Authentication

Candidate

---

## GET

/resumes

Purpose

Retrieve candidate resumes

Authentication

Candidate

---

## GET

/resumes/:id

Purpose

Retrieve Resume

Restricted

---

## PATCH

/resumes/:id

Purpose

Update Resume

Candidate

---

## DELETE

/resumes/:id

Purpose

Soft Delete Resume

Candidate

---

## PATCH

/resumes/:id/default

Purpose

Set Default Resume

Candidate

---

## GET

/resumes/:id/download

Purpose

Download Resume

Candidate

Recruiter (if permitted)

---

## GET

/resumes/:id/share

Purpose

Generate Shareable Link

Future

---

## GET

/resumes/:id/versions

Purpose

Retrieve Resume Versions

Candidate

---

# Validation Rules

Resume Title

Required

Maximum

150 Characters

Summary

Maximum

3000 Characters

Skills

Minimum

1 Skill

Maximum

100 Skills

Education

Minimum

0

Experience

Minimum

0

Projects

Optional

Resume PDF

Maximum

10 MB

Allowed Types

PDF

---

# Business Rules

Each candidate may own multiple resumes.

Only one resume can be the default.

Deleted resumes use soft delete.

Resume versions are immutable.

Applications always reference a specific resume version.

Recruiters cannot edit candidate resumes.

Resume visibility controls access.

---

# Resume Statistics

Statistics include

- Profile Views
- Recruiter Views
- Downloads
- Shares
- Applications Using Resume

Future

- AI Resume Score
- ATS Score
- Keyword Match Score

---

# Error Handling

400

Validation Error

401

Unauthorized

403

Forbidden

404

Resume Not Found

409

Default Resume Conflict

422

Invalid Resume State

500

Internal Server Error

Never expose internal database errors.

---

# Security Requirements

Authentication required.

Ownership validation required.

Private resumes must never be publicly accessible.

Uploaded files must be validated.

Resume download authorization required.

Sanitize all uploaded content.

---

# Dependencies

Authentication Middleware

Authorization Middleware

Applications Module

Users Module

Prisma

Zod

File Upload Service

Shared Error Handler

Shared Response Formatter

---

# Future Enhancements

AI Resume Builder

AI Resume Optimization

Resume Parser

LinkedIn Import

GitHub Import

Portfolio Integration

Multiple Templates

ATS Optimization

Resume Comparison

Resume Analytics

Resume Translation

Resume Watermarking

Digital Signature

PDF Generation

DOCX Export

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
- Services implement business logic.
- Validate every request using Zod.
- Support resume versioning.
- Enforce ownership validation.
- Allow only one default resume.
- Support secure file uploads.
- Return standardized API responses.
- Generate production-ready code only.

---