# Database Schema Specification

Project: HireStack

Version: 1.0

Status: Final

Document ID: DB-001

---

# Purpose

This document defines the complete relational database design for HireStack.

The schema follows Third Normal Form (3NF), ensuring data integrity, scalability, and maintainability.

Database Engine:
PostgreSQL

ORM:
Prisma ORM

---

# Entity Relationship Overview

Platform Admin
        │
        ▼
Companies
        │
        ▼
Recruiters
        │
        ▼
Jobs
        │
        ▼
Applications
        │
        ▼
Candidates

---

# Tables

Version 1 contains the following tables.

1. users

2. companies

3. jobs

4. applications

5. resumes

6. password_reset_tokens

7. refresh_tokens

8. audit_logs

---

# Table 1 — users

Purpose

Stores every authenticated user.

User Types

• ADMIN

• RECRUITER

• CANDIDATE

Columns

------------------------------------------------------------

id

UUID

Primary Key

------------------------------------------------------------

first_name

VARCHAR(100)

Required

------------------------------------------------------------

last_name

VARCHAR(100)

Required

------------------------------------------------------------

email

VARCHAR(255)

Unique

------------------------------------------------------------

password

TEXT

Hashed

------------------------------------------------------------

role

ENUM

ADMIN

RECRUITER

CANDIDATE

------------------------------------------------------------

company_id

UUID

Nullable

FK → companies.id

Only Recruiters belong to companies.

------------------------------------------------------------

phone

VARCHAR(20)

Nullable

------------------------------------------------------------

profile_image

TEXT

Nullable

------------------------------------------------------------

is_verified

BOOLEAN

Default false

------------------------------------------------------------

is_active

BOOLEAN

Default true

------------------------------------------------------------

created_at

TIMESTAMP

------------------------------------------------------------

updated_at

TIMESTAMP

------------------------------------------------------------

Indexes

email

role

company_id

---

# Table 2 — companies

Purpose

Stores companies using HireStack.

Columns

id

UUID

Primary Key

---

name

VARCHAR(255)

Required

---

website

TEXT

Nullable

---

industry

VARCHAR(100)

Nullable

---

size

ENUM

Startup

Small

Medium

Large

---

description

TEXT

Nullable

---

logo

TEXT

Nullable

---

location

VARCHAR(255)

---

created_at

TIMESTAMP

---

updated_at

TIMESTAMP

---

Indexes

name

industry

---

# Table 3 — jobs

Purpose

Stores published jobs.

Columns

id

UUID

PK

---

company_id

FK

companies.id

---

created_by

FK

users.id

Recruiter

---

title

VARCHAR(255)

---

department

VARCHAR(100)

---

employment_type

ENUM

Full Time

Part Time

Internship

Contract

---

experience_level

ENUM

Fresher

Junior

Mid

Senior

---

location

VARCHAR(255)

---

work_mode

ENUM

Remote

Hybrid

Onsite

---

salary_min

INTEGER

Nullable

---

salary_max

INTEGER

Nullable

---

description

TEXT

---

requirements

TEXT

---

responsibilities

TEXT

---

status

ENUM

Draft

Published

Closed

Archived

---

application_deadline

DATE

Nullable

---

created_at

TIMESTAMP

updated_at

TIMESTAMP

---

Indexes

company_id

status

title

location

employment_type

---

# Table 4 — applications

Purpose

Stores job applications.

Columns

id

UUID

PK

---

job_id

FK

jobs.id

---

candidate_id

FK

users.id

---

resume_id

FK

resumes.id

---

status

ENUM

Applied

In Review

Shortlisted

Interview

Selected

Rejected

Withdrawn

---

cover_letter

TEXT

Nullable

---

applied_at

TIMESTAMP

---

updated_at

TIMESTAMP

---

Constraints

One candidate can apply only once per job.

UNIQUE

(candidate_id, job_id)

---

Indexes

job_id

candidate_id

status

---

# Table 5 — resumes

Purpose

Stores uploaded resumes.

Columns

id

UUID

PK

---

candidate_id

FK

users.id

---

file_name

TEXT

---

cloudinary_url

TEXT

---

file_size

INTEGER

---

mime_type

VARCHAR(100)

---

uploaded_at

TIMESTAMP

---

Indexes

candidate_id

---

# Table 6 — refresh_tokens

Purpose

Stores refresh tokens.

Columns

id

UUID

PK

user_id

FK

token

expires_at

revoked

created_at

---

# Table 7 — password_reset_tokens

Purpose

Stores reset requests.

Columns

id

UUID

PK

user_id

FK

token

expires_at

used

created_at

---

# Table 8 — audit_logs

Purpose

Tracks important system activities.

Columns

id

UUID

PK

user_id

FK

action

entity

entity_id

ip_address

user_agent

created_at

---

# Relationships

Company

1

↓

Many Recruiters

---

Company

1

↓

Many Jobs

---

Recruiter

1

↓

Many Jobs

---

Candidate

1

↓

Many Applications

---

Job

1

↓

Many Applications

---

Candidate

1

↓

Many Resumes

---

Application

1

↓

One Resume

---

# Indexing Strategy

Indexed Columns

users.email

users.role

companies.name

jobs.status

jobs.company_id

jobs.title

applications.status

applications.job_id

applications.candidate_id

---

# Future Tables

Interview

Notification

Activity Feed

Saved Jobs

Messages

AI Analysis

Interview Feedback

Calendar

Organization Settings

Permissions

These tables are intentionally excluded from Version 1.

---

End of Document