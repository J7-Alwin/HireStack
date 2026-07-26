# HireStack ATS

# Candidate Module

## Product Requirements Document (PRD)

---

| Document Information | |
|----------------------|------------------------------------------------|
| Module | Candidate Management |
| Document Title | Candidate Module Product Requirements Document |
| Version | 1.0 |
| Status | Final |
| Project | HireStack ATS |
| Architecture | Multi-Tenant SaaS |
| Technology Stack | Express 5, TypeScript, Prisma ORM, PostgreSQL (Neon), JWT, Zod |
| Database | PostgreSQL |
| Prepared For | HireStack Development Team |
| Document Type | Product Requirements Document |
| Last Updated | TBD |

---

# 1. Introduction

The Candidate Module serves as the central repository for candidate information within the HireStack Applicant Tracking System (ATS). It is designed to maintain a comprehensive, structured, and searchable profile for every candidate belonging to a company.

This module acts as the single source of truth for candidate-related information and is intentionally separated from recruitment workflow modules such as Applications, Interviews, Offers, and Hiring Pipeline. This separation ensures a clean architecture, minimizes data duplication, and enables candidates to participate in multiple recruitment processes simultaneously.

The module is built following HireStack's standardized architecture and development guidelines to ensure consistency, scalability, maintainability, and future extensibility.

---

# 2. Purpose

The purpose of the Candidate Module is to provide organizations with a centralized location for managing candidate information throughout the recruitment lifecycle.

The module allows recruiters and company administrators to:

- Create and maintain candidate profiles.
- Manage professional and contact information.
- Upload and maintain candidate resumes.
- Record education and work experience.
- Maintain candidate skills.
- Organize candidates using tags.
- Store recruiter notes.
- Search and filter candidates efficiently.
- Maintain historical candidate records through soft deletion.

The module does **not** manage job applications or interview processes. Instead, it provides the foundational data that other recruitment modules reference.

---

# 3. Objectives

The Candidate Module has the following primary objectives:

## 3.1 Centralized Candidate Repository

Maintain a single authoritative profile for every candidate within a company.

---

## 3.2 Eliminate Data Duplication

Ensure candidate information is stored only once regardless of the number of job applications associated with that candidate.

---

## 3.3 Multi-Tenant Isolation

Guarantee complete data isolation between companies.

Every candidate belongs exclusively to one company and cannot be accessed by another tenant.

---

## 3.4 Recruiter Collaboration

Allow multiple recruiters within the same company to access candidate profiles while maintaining a primary recruiter assignment for ownership and accountability.

---

## 3.5 Scalability

Support organizations managing hundreds of thousands of candidate records without requiring architectural changes.

---

## 3.6 Extensibility

Provide a flexible architecture capable of supporting future modules including:

- Applications
- Interview Management
- Offers
- Hiring Pipeline
- Resume Parsing
- AI Candidate Matching
- Activity Timeline
- Notifications
- Analytics
- Audit Logs

without requiring major database redesign.

---

# 4. Scope

## 4.1 In Scope

Version 1.0 of the Candidate Module includes the following functionality.

### Candidate Profile

- Create Candidate
- View Candidate
- Update Candidate
- Archive Candidate
- Restore Candidate
- Soft Delete Candidate

### Contact Information

- Email
- Phone Number
- Alternate Phone Number
- Address Information

### Professional Information

- Current Company
- Current Designation
- Years of Experience
- Expected Salary
- Current Salary
- Notice Period
- Employment Status

### Resume Management

- Upload Resume
- Replace Resume
- Download Resume
- Resume Metadata Management

### Skills

- Add Skills
- Remove Skills
- Skill Proficiency
- Years of Experience Per Skill

### Education

- Multiple Education Records

### Experience

- Multiple Employment Records

### Documents

- Resume
- Cover Letter
- Certificates
- Portfolio
- Additional Documents

### Notes

Recruiter-specific candidate notes.

### Tags

Custom candidate categorization using reusable tags.

### Search

Global candidate search.

### Filtering

Advanced filtering based on candidate attributes.

### Pagination

Standardized pagination.

---

## 4.2 Out of Scope

The following features are intentionally excluded from Version 1.0.

### Recruitment Workflow

- Job Applications
- Screening Workflow
- Interview Scheduling
- Interview Feedback
- Offer Management
- Hiring Pipeline

### Communication

- Email Communication
- SMS
- WhatsApp Integration

### AI Features

- Resume Parsing
- Candidate Ranking
- AI Matching
- Resume Scoring

### Calendar Integration

- Google Calendar
- Outlook Calendar

### Reporting

- Analytics Dashboard
- Hiring Reports
- Candidate Funnel Reports

These capabilities will be implemented as dedicated modules in future releases.

---

# 5. Design Principles

The Candidate Module is designed using the following architectural principles.

## 5.1 Single Source of Truth

Each candidate exists only once within a company.

Applications, interviews, offers, and hiring activities reference the candidate profile rather than duplicating candidate information.

---

## 5.2 Separation of Concerns

Candidate information remains independent from recruitment workflows.

This separation simplifies maintenance and improves long-term scalability.

---

## 5.3 Company Isolation

Every operation performed within the Candidate Module is restricted to the authenticated company.

Cross-company access is strictly prohibited.

---

## 5.4 Scalability

The module is designed to efficiently support organizations ranging from small businesses to enterprise customers with very large candidate databases.

---

## 5.5 Extensibility

Future modules should integrate with the Candidate Module without requiring modifications to existing database structures whenever possible.

---

## 5.6 Consistency

The Candidate Module follows the same architectural standards established throughout the HireStack platform:

- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- Repository Pattern
- Service Layer
- Controller Layer
- Shared Error Handling
- Shared Response Format
- JWT Authentication
- Zod Validation

---

# 6. Module Overview

The Candidate Module represents the master profile of every candidate within the HireStack ecosystem.

It is responsible only for maintaining candidate information and related metadata.

The module intentionally excludes job-specific recruitment activities.

Future modules will establish relationships with the Candidate Module instead of storing duplicate candidate information.

This architecture enables a single candidate to participate in multiple recruitment processes while maintaining one authoritative profile.
# 7. Module Dependencies

The Candidate Module depends on several core modules within the HireStack ecosystem. These modules provide authentication, authorization, company isolation, and reusable master data.

## 7.1 Authentication Module

The Authentication Module is responsible for:

- User authentication using JWT.
- Token validation.
- User session management.
- Identity verification.

All Candidate APIs require an authenticated user.

---

## 7.2 Users Module

The Users Module provides:

- User information.
- User roles.
- User identity.
- CreatedBy / UpdatedBy references.
- Recruiter references.

Candidate ownership references users from this module.

---

## 7.3 Companies Module

Every candidate belongs to exactly one company.

The Companies Module provides:

- Company identification.
- Tenant isolation.
- Company configuration.
- Company-level access restrictions.

Every Candidate query must automatically be scoped by Company ID.

---

## 7.4 Recruiters Module

Recruiters are responsible for candidate management.

The Recruiters Module provides:

- Primary recruiter assignment.
- Recruiter ownership.
- Recruiter permissions.
- Candidate assignment.

---

## 7.5 Jobs Module

The Candidate Module shares the Skill master table with the Jobs Module.

Relationship:

Job
↓

JobSkill

↓

Skill

↓

CandidateSkill

↓

Candidate

Using a shared Skill catalogue ensures:

- Standardized skill names.
- Better search.
- AI compatibility.
- Matching between jobs and candidates.

---

## 7.6 Shared Module

The Shared Module provides reusable functionality including:

- API response builders.
- Pagination.
- Error handling.
- Constants.
- Utilities.
- Validation helpers.
- Common middleware.

The Candidate Module should not duplicate these utilities.

---

# 8. Module Responsibilities

The Candidate Module is responsible for maintaining the complete profile of a candidate throughout their lifecycle within the organization.

Its responsibilities include:

- Candidate profile management.
- Contact information management.
- Professional information.
- Resume management.
- Skills management.
- Education management.
- Experience management.
- Candidate documents.
- Recruiter notes.
- Candidate tags.
- Candidate search.
- Candidate filtering.
- Candidate archival.
- Candidate restoration.

The module is NOT responsible for:

- Job applications.
- Interview scheduling.
- Interview feedback.
- Offers.
- Hiring decisions.
- Recruitment pipeline.

Those responsibilities belong to their respective modules.

---

# 9. Candidate Lifecycle

A candidate profile progresses through multiple lifecycle states during its existence.

Unlike Applications, these states describe the overall availability and usability of the candidate profile rather than the recruitment stage.

## Candidate Lifecycle

ACTIVE

↓

PASSIVE

↓

ON_HOLD

↓

BLACKLISTED

↓

ARCHIVED

### ACTIVE

The candidate is available for recruitment activities.

Characteristics:

- Searchable.
- Assignable.
- Eligible for applications.
- Visible to recruiters.

---

### PASSIVE

The candidate is not actively looking for opportunities but remains available within the talent pool.

Characteristics:

- Searchable.
- Contactable.
- Can participate in future hiring.

---

### ON_HOLD

Recruitment activities are temporarily paused.

Examples:

- Candidate requested delayed communication.
- Internal hold.
- Awaiting documentation.

---

### BLACKLISTED

Candidate is restricted from participating in recruitment.

Examples:

- Fraudulent information.
- Policy violations.
- Permanent rejection.

Blacklisted candidates remain in the database for historical purposes.

---

### ARCHIVED

Candidate profile is no longer active.

Examples:

- Long-term inactivity.
- Duplicate merged profile.
- Data retention policy.

Archived candidates remain recoverable through the Restore operation.

---

# 10. High-Level System Architecture

The Candidate Module follows the same layered architecture used throughout HireStack.

Presentation Layer

↓

Routes

↓

Controller

↓

Service

↓

Repository

↓

Prisma ORM

↓

PostgreSQL

## Route Layer

Responsibilities:

- Route registration.
- Authentication middleware.
- Authorization middleware.
- Validation middleware.

Routes should contain no business logic.

---

## Controller Layer

Responsibilities:

- Receive HTTP requests.
- Invoke services.
- Return standardized API responses.
- Handle exceptions.

Controllers should remain thin.

---

## Service Layer

Responsibilities:

- Business rules.
- Validation beyond schema validation.
- Duplicate detection.
- Transactions.
- Permission verification.
- Domain logic.

All business logic belongs here.

---

## Repository Layer

Responsibilities:

- Database operations.
- Prisma queries.
- Data retrieval.
- Persistence.

Repositories should not contain business rules.

---

## Database Layer

PostgreSQL stores:

- Candidate profiles.
- Skills.
- Education.
- Experience.
- Documents.
- Notes.
- Tags.

Prisma ORM manages all persistence.

---

# 11. Ownership Model

Candidate ownership ensures accountability while allowing collaboration.

Every candidate belongs to:

One Company

↓

One Primary Recruiter

The Company owns the candidate profile.

The Primary Recruiter is responsible for managing the candidate.

Other recruiters within the same company may view or collaborate based on permissions, but ownership remains assigned to one recruiter.

---

## Company Ownership

A candidate cannot exist without a company.

Every candidate record references:

- Company ID

The Company ID is derived from the authenticated user's context and must never be supplied directly by the client.

---

## Primary Recruiter

Each candidate has exactly one Primary Recruiter.

Responsibilities include:

- Profile maintenance.
- Resume updates.
- Candidate communication.
- Internal ownership.

Company Administrators may reassign candidates between recruiters.

Recruiters cannot assign candidates to other recruiters.

---

# 12. Candidate Assignment

Candidate assignment establishes ownership within an organization.

Assignment occurs:

- During candidate creation.
- During reassignment by Company Admin.

Assignment does not change:

- Company ownership.
- Candidate history.
- Candidate applications.

Only ownership responsibility changes.

Future versions may include assignment history for audit purposes.

---

# 13. Candidate Status Management

Candidate status controls the availability of a candidate profile.

Allowed statuses:

- ACTIVE
- PASSIVE
- ON_HOLD
- BLACKLISTED
- ARCHIVED

Status changes must follow business rules.

Examples:

ACTIVE → PASSIVE

ACTIVE → ON_HOLD

ON_HOLD → ACTIVE

PASSIVE → ACTIVE

ACTIVE → ARCHIVED

BLACKLISTED candidates require explicit administrator action before becoming ACTIVE again.

ARCHIVED candidates are restored through the Restore operation rather than direct status modification.

Candidate status must never represent interview stages or hiring progress.
# 14. Business Rules

The following business rules govern the behavior of the Candidate Module. These rules must be enforced consistently across all APIs and service operations.

---

## 14.1 Candidate Creation

### Authorized Roles

- Company Admin
- Recruiter

### Required Information

A candidate must contain:

- First Name
- Last Name
- Email OR Phone Number
- Primary Recruiter

All remaining fields are optional during creation.

This allows recruiters to quickly register candidates while collecting additional information later.

---

## 14.2 Candidate Update

Candidate information may be updated whenever new information becomes available.

Updates include:

- Personal Information
- Contact Information
- Professional Information
- Resume
- Skills
- Education
- Experience
- Tags
- Notes

Updates must never overwrite another company's data.

---

## 14.3 Duplicate Detection

Before creating a candidate, the system must verify whether the candidate already exists within the same company.

Duplicate checks include:

- Email Address
- Phone Number

If a duplicate is found:

- Return HTTP 409 Conflict
- Do not create another profile
- Return the existing candidate reference

Duplicate detection is company-specific.

Candidates belonging to different companies are considered independent records.

---

## 14.4 Company Isolation

Every Candidate operation is restricted to the authenticated company.

The client must never provide Company ID.

Company ID is always derived from the authenticated user's JWT.

Every database query must automatically include Company ID filtering.

Cross-company access is prohibited.

---

## 14.5 Recruiter Assignment

Each candidate has exactly one Primary Recruiter.

Company Admin responsibilities:

- Assign Recruiter
- Reassign Recruiter

Recruiter responsibilities:

- Manage assigned candidates
- Update candidate profiles

Recruiters cannot assign candidates to another recruiter.

---

## 14.6 Resume Management

Version 1 supports one active resume.

Allowed operations:

- Upload
- Replace
- Download
- View metadata

Supported formats:

- PDF
- DOC
- DOCX

Resume replacement deactivates the previous resume while preserving historical metadata.

---

## 14.7 Skills Management

Candidate skills reference the shared Skill master table.

Duplicate skills are not permitted.

Each skill stores:

- Skill
- Proficiency
- Experience Years
- Experience Months
- Primary Skill Flag

---

## 14.8 Education Management

Candidates may have multiple education records.

Each education record contains:

- Degree
- Specialization
- Institution
- University
- Start Date
- End Date
- Graduation Year
- Grade
- Highest Qualification Flag

---

## 14.9 Experience Management

Candidates may have multiple employment records.

Each experience contains:

- Company
- Designation
- Employment Type
- Start Date
- End Date
- Current Employer Flag
- Description

---

## 14.10 Candidate Documents

Supported document types:

- Resume
- Cover Letter
- Certificate
- Portfolio
- Other

Only metadata is stored in the database.

Actual files are managed by the storage layer.

---

## 14.11 Candidate Notes

Recruiters may create notes for candidates.

Each note stores:

- Author
- Timestamp
- Content

Notes provide collaboration between recruiters without modifying the candidate profile.

---

## 14.12 Candidate Tags

Tags provide custom categorization.

Examples:

- Java
- Remote
- Immediate Joiner
- Senior
- React

Tags are reusable within the same company.

---

## 14.13 Soft Delete

Deleting a candidate performs a Soft Delete.

The candidate remains in the database but is excluded from normal queries.

Associated information remains available for future recovery.

---

## 14.14 Restore

Company Administrators may restore soft-deleted candidates.

Restoring a candidate:

- Clears DeletedAt
- Restores profile visibility
- Restores associated relationships

---

# 15. Search, Filtering and Pagination

## Global Search

Search supports:

- Candidate Code
- First Name
- Last Name
- Email
- Phone
- Current Company
- Current Designation
- Skills
- Tags

Search is always scoped to the authenticated company.

---

## Filtering

Supported filters include:

- Candidate Status
- Recruiter
- Skills
- Experience
- Employment Status
- Source
- Tags
- Created Date

Filters may be combined.

---

## Sorting

Supported sorting:

- Candidate Code
- First Name
- Last Name
- Created Date
- Updated Date
- Experience
- Current Company

Default sorting:

Newest First

---

## Pagination

The Candidate Module follows the shared pagination standard.

Example:

GET /candidates?page=1&limit=20

The response includes:

- Current Page
- Page Size
- Total Records
- Total Pages

---

# 16. Security Requirements

The Candidate Module follows HireStack security standards.

Security includes:

- JWT Authentication
- Role-Based Authorization
- Company Isolation
- Input Validation
- SQL Injection Protection
- Centralized Error Handling
- Secure File Validation

Sensitive operations require authenticated users.

Unauthorized access returns appropriate HTTP status codes.

---

# 17. Error Handling

The module follows standardized API responses.

Typical responses include:

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

Business errors must return meaningful messages.

---

# 18. Performance Requirements

The Candidate Module must support:

- Large candidate databases
- Fast search
- Efficient filtering
- Indexed lookups
- Optimized joins
- Lazy loading of related entities where appropriate

Frequently searched fields must be indexed.

---

# 19. Future Compatibility

The Candidate Module has been designed for future expansion without requiring structural redesign.

Future integrations include:

- Applications
- Interview Management
- Hiring Pipeline
- Offers
- Resume Parsing
- AI Candidate Matching
- Activity Timeline
- Notifications
- Analytics
- Reports
- Audit Logs

These modules will reference Candidate rather than duplicate candidate information.

---

# 20. Acceptance Criteria

The Candidate Module is considered complete when all of the following conditions are satisfied.

## Functional Requirements

- Candidate CRUD operations function correctly.
- Company isolation is enforced.
- Recruiter assignment functions correctly.
- Resume upload and replacement work.
- Skills management works.
- Education management works.
- Experience management works.
- Document management works.
- Notes management works.
- Tag management works.
- Search functions correctly.
- Filtering functions correctly.
- Pagination functions correctly.
- Sorting functions correctly.
- Duplicate detection prevents duplicate candidates.
- Soft Delete works.
- Restore works.

---

## Technical Requirements

- Express 5 architecture followed.
- TypeScript strict mode passes.
- Prisma schema validated.
- Zod validation implemented.
- Repository pattern followed.
- Service layer contains business logic.
- Controllers remain thin.
- Shared response format used.
- Centralized error handling used.
- No linting errors.
- No TypeScript errors.
- Production-ready code quality maintained.

---

## Security Requirements

- Authentication enforced.
- Authorization enforced.
- Company isolation enforced.
- Input validation enforced.
- File validation enforced.

---

# 21. Implementation Standards

Implementation must comply with HireStack development standards.

Technology Stack

- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- Zod Validation

Architecture

Route

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

Coding Standards

- Modular architecture
- Single Responsibility Principle
- Clean code
- Reusable utilities
- Shared constants
- Consistent naming conventions
- Comprehensive error handling

---

# 22. Conclusion

The Candidate Module serves as the foundational profile management system for HireStack ATS. It establishes a centralized, scalable, and maintainable repository for candidate information while remaining independent from recruitment workflows such as applications, interviews, offers, and hiring pipelines.

By separating candidate profile management from recruitment processes, the module provides a clean architecture that minimizes data duplication, improves maintainability, and enables future expansion. The design supports enterprise-scale deployments through strict multi-tenant isolation, standardized business rules, reusable master data, and a layered architecture built on Express 5, TypeScript, Prisma ORM, and PostgreSQL.

This document represents the complete functional and technical specification for the Candidate Module Version 1.0 and serves as the authoritative reference for implementation, code review, testing, and future enhancements.