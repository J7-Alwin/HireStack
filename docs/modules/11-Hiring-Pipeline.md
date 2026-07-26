# Hiring Pipeline Module PRD
## Part 1 – Foundation & Architecture

---

# Document Information

| Field | Value |
|--------|--------|
| Module | Hiring Pipeline |
| Document | PRD |
| Version | 1.0 |
| Status | Final |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT |
| Validation | Zod |

---

# Purpose

The Hiring Pipeline module provides a centralized workflow for tracking every candidate throughout the recruitment lifecycle.

Rather than storing recruitment progress across multiple modules, the Hiring Pipeline acts as the single source of truth for candidate progression.

It aggregates information from:

- Applications
- Interviews
- Offers
- Recruiters
- Candidates
- Jobs

into one unified workflow.

The pipeline enables recruiters, hiring managers, and company administrators to monitor recruitment progress in real time while maintaining a complete audit trail.

---

# Objectives

The Hiring Pipeline module aims to:

- Track candidate progression.
- Maintain current hiring stage.
- Record historical stage changes.
- Provide recruiter dashboards.
- Generate hiring metrics.
- Support reporting.
- Enable future analytics.
- Integrate with notifications.
- Integrate with audit logs.
- Support future AI recommendations.

---

# Scope

The module includes:

- Pipeline stages
- Candidate stage movement
- Stage history
- Recruiter dashboard
- Company dashboard
- Hiring analytics
- Activity timeline
- Search
- Filters
- Sorting
- Pagination
- Business rules
- Security
- Dashboard APIs

---

# Out of Scope

The following belong to other modules:

- Interview scheduling
- Offer generation
- Candidate profile editing
- Job management
- Notification delivery
- Email sending
- Employee onboarding

---

# Design Principles

The module must be:

- Scalable
- Transaction-safe
- Event-driven ready
- Company isolated
- Audit-friendly
- Analytics-friendly
- Read optimized
- Maintainable

---

# High-Level Architecture

```
Candidate

↓

Application

↓

Hiring Pipeline

↓

Interview Module

↓

Offer Module

↓

Hired / Rejected / Withdrawn
```

The Hiring Pipeline is the orchestration layer connecting all recruitment modules.

---

# Responsibilities

The module is responsible for:

- Tracking current stage
- Recording stage history
- Recording recruiter actions
- Maintaining timelines
- Computing metrics
- Exposing dashboard APIs
- Providing search capabilities

---

# Module Dependencies

The Hiring Pipeline depends on:

### Authentication Module

- JWT
- RBAC

### Company Module

- Company isolation

### Recruiter Module

- Recruiter ownership

### Candidate Module

- Candidate information

### Job Module

- Job information

### Application Module

- Application lifecycle

### Interview Module

- Interview events

### Offer Module

- Offer lifecycle

---

# Module Consumers

Primary consumers:

- Recruiters
- Company Admins
- Hiring Managers

Future consumers:

- Notification Module
- Reporting Module
- Analytics Module
- Audit Module
- AI Recommendation Engine

---

# Entity Relationships

```
Company

│

├── Recruiter

│

├── Job

│

├── Candidate

│

└── Application

↓

Hiring Pipeline

↓

Pipeline History

↓

Activity Timeline

↓

Dashboard Metrics
```

---

# Core Concepts

## Pipeline

Represents the current recruitment progress for a candidate application.

One Application has one Pipeline.

---

## Stage

Represents the current hiring position.

Examples:

- Applied
- Screening
- Interview
- Technical Interview
- HR Interview
- Offer
- Hired
- Rejected
- Withdrawn

---

## Stage History

Every stage movement creates an immutable history record.

History must never be modified.

---

## Timeline

A chronological activity feed combining:

- Application events
- Interview events
- Offer events
- Manual recruiter actions

---

## Dashboard

Aggregated hiring statistics.

Examples:

- Active candidates
- Interviews today
- Offers pending
- Offers accepted
- Candidates hired

---

# Pipeline Ownership

Each pipeline belongs to:

- One company
- One application
- One candidate
- One job
- One recruiter

---

# Permission Model

## Company Admin

Can:

- View all pipelines
- Move candidates
- Override stages
- View analytics
- View recruiter dashboards

---

## Recruiter

Can:

- View assigned pipelines
- Move assigned candidates
- View own dashboard
- Add notes

Cannot:

- Access pipelines from other companies
- Modify unassigned pipelines

---

## Hiring Manager (Future)

Can:

- View assigned candidates
- View interview progress
- View offers

Cannot:

- Modify pipeline

---

# Folder Structure

```
pipeline/

├── controllers/
├── services/
├── repositories/
├── routes/
├── validation/
├── constants/
├── helpers/
├── types/
├── dto/
├── mappers/
├── timeline/
├── analytics/
├── dashboard/
├── history/
├── README.md
└── index.ts
```

---

# Security Principles

Every request must enforce:

- JWT authentication
- RBAC authorization
- Company isolation
- Recruiter ownership
- Soft delete filtering

---

# Future Compatibility

The module should support future integration with:

- Notifications
- Audit Logs
- AI Hiring Recommendations
- Reporting Engine
- Employee Onboarding
- Workflow Automation

No redesign should be required.

---

# Acceptance Criteria

The module shall:

- Track every application.
- Maintain current stage.
- Record complete history.
- Expose recruiter dashboards.
- Support analytics.
- Provide secure APIs.
- Support search and filtering.
- Scale for enterprise hiring.

---

**End of Part 1**

The next section (**Part 2**) will define:

- Database Schema
- Prisma Models
- Pipeline Entity
- Pipeline History Entity
- Timeline Entity
- Dashboard Metrics
- Stage Definitions
- Lifecycle
- API Design
# Part 2 – Database Design, Pipeline Lifecycle & API Design

---

# Database Design

The Hiring Pipeline module maintains the real-time recruitment state of every application.

Unlike the Application module, which records the candidate's submission, the Pipeline module records where the candidate currently is within the hiring process.

Every application must have exactly one active pipeline.

Every stage movement is permanently recorded in Pipeline History.

---

# Database Relationships

```
Company

│

├── Recruiter

│

├── Candidate

│

├── Job

│

└── Application

        │

        ▼

 HiringPipeline

        │

        ├──────────────┐

        ▼              ▼

PipelineHistory   PipelineTimeline
```

---

# Entity Relationships

One Company

↓

Many Recruiters

↓

Many Jobs

↓

Many Applications

↓

One Hiring Pipeline

↓

Many History Records

↓

Many Timeline Events

---

# Hiring Pipeline Entity

## Purpose

Represents the current hiring state of an application.

Only one active pipeline exists for each application.

---

## Fields

| Field | Type | Description |
|---------|------|-------------|
| id | UUID | Primary Key |
| companyId | UUID | Company |
| applicationId | UUID | Application |
| candidateId | UUID | Candidate |
| recruiterId | UUID | Assigned Recruiter |
| jobId | UUID | Job |
| currentStage | Enum | Current pipeline stage |
| previousStage | Enum | Previous stage |
| stageChangedAt | DateTime | Last movement |
| stageOrder | Integer | Current stage order |
| notes | Text | Internal recruiter notes |
| isCompleted | Boolean | Pipeline completed |
| completedReason | Enum | Hired / Rejected / Withdrawn |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Update timestamp |
| deletedAt | DateTime | Soft delete |

---

# Pipeline History Entity

Every stage movement creates one immutable history record.

History records can never be updated.

---

## Fields

| Field | Type |
|---------|------|
| id | UUID |
| pipelineId | UUID |
| fromStage | Enum |
| toStage | Enum |
| movedBy | UUID |
| reason | String |
| comments | Text |
| movedAt | DateTime |

---

# Pipeline Timeline Entity

Provides a unified activity feed.

Timeline combines activities from:

- Application Module
- Interview Module
- Offer Module
- Recruiter Actions

---

## Fields

| Field | Type |
|---------|------|
| id | UUID |
| pipelineId | UUID |
| eventType | Enum |
| eventSource | Enum |
| title | String |
| description | Text |
| createdBy | UUID |
| createdAt | DateTime |

---

# Dashboard Metrics Entity (Virtual)

Dashboard metrics are generated dynamically.

No separate table is required.

Examples:

- Active Candidates
- Interviews Scheduled
- Offers Pending
- Offers Accepted
- Candidates Hired
- Rejections
- Withdrawals

---

# Pipeline Stage Enum

```
APPLIED

SCREENING

SHORTLISTED

HR_INTERVIEW

TECHNICAL_INTERVIEW

FINAL_INTERVIEW

OFFER_PENDING

OFFER_SENT

OFFER_ACCEPTED

HIRED

REJECTED

WITHDRAWN
```

---

# Stage Order

| Stage | Order |
|---------|-------|
| Applied | 1 |
| Screening | 2 |
| Shortlisted | 3 |
| HR Interview | 4 |
| Technical Interview | 5 |
| Final Interview | 6 |
| Offer Pending | 7 |
| Offer Sent | 8 |
| Offer Accepted | 9 |
| Hired | 10 |

Terminal stages:

- Rejected
- Withdrawn

---

# Pipeline Lifecycle

```
Application Created

↓

Applied

↓

Screening

↓

Shortlisted

↓

HR Interview

↓

Technical Interview

↓

Final Interview

↓

Offer Pending

↓

Offer Sent

↓

Offer Accepted

↓

Hired
```

Alternative endings:

```
Rejected

Withdrawn
```

---

# Stage Movement Rules

Every movement:

Updates

- currentStage
- previousStage
- stageOrder
- stageChangedAt

Creates

- Pipeline History Record

Creates

- Timeline Event

Updates dashboard metrics.

---

# Automatic Stage Updates

The following modules automatically update the pipeline.

## Application Module

Application Created

↓

Stage = APPLIED

---

## Interview Module

Interview Scheduled

↓

HR_INTERVIEW

or

TECHNICAL_INTERVIEW

or

FINAL_INTERVIEW

depending on interview type.

---

## Offer Module

Offer Approved

↓

OFFER_PENDING

Offer Sent

↓

OFFER_SENT

Offer Accepted

↓

OFFER_ACCEPTED

---

## Hiring Decision

Accepted Candidate

↓

HIRED

Rejected Candidate

↓

REJECTED

Candidate Withdraws

↓

WITHDRAWN

---

# Allowed Stage Transitions

```
APPLIED

↓

SCREENING

↓

SHORTLISTED

↓

HR_INTERVIEW

↓

TECHNICAL_INTERVIEW

↓

FINAL_INTERVIEW

↓

OFFER_PENDING

↓

OFFER_SENT

↓

OFFER_ACCEPTED

↓

HIRED
```

Terminal:

```
REJECTED

WITHDRAWN
```

Invalid transitions return:

```
422 Unprocessable Entity
```

---

# REST API Design

## Create Pipeline

```
POST /pipeline
```

Automatically created when an application is submitted.

Normally internal only.

---

## Get Pipeline

```
GET /pipeline/:id
```

Returns full pipeline.

---

## List Pipelines

```
GET /pipeline
```

Supports filtering.

---

## Move Stage

```
PATCH /pipeline/:id/stage
```

Moves candidate to the next stage.

Creates history.

Creates timeline event.

---

## Add Notes

```
POST /pipeline/:id/notes
```

Internal recruiter notes.

---

## Get History

```
GET /pipeline/:id/history
```

Returns all stage movements.

---

## Get Timeline

```
GET /pipeline/:id/timeline
```

Returns chronological activity feed.

---

## Dashboard Summary

```
GET /pipeline/dashboard
```

Returns recruiter dashboard.

---

## Company Dashboard

```
GET /pipeline/dashboard/company
```

Returns organisation-wide hiring statistics.

---

## Recruiter Dashboard

```
GET /pipeline/dashboard/recruiter
```

Returns recruiter-specific metrics.

---

# Standard Response

```json
{
  "success": true,
  "message": "Pipeline updated successfully.",
  "data": {}
}
```

---

# Repository Responsibilities

Repository layer must:

- Read pipeline
- Update stage
- Save history
- Save timeline
- Aggregate dashboard data
- Perform search
- Perform filtering
- Handle pagination

No business rules belong in repositories.

---

# Service Responsibilities

Services handle:

- Stage validation
- Transition rules
- Automatic updates
- Dashboard calculations
- Timeline generation
- History creation
- Permission checks

---

# Acceptance Criteria

The module shall:

- Maintain one pipeline per application.
- Record every stage movement.
- Prevent invalid transitions.
- Automatically update from Interview and Offer modules.
- Maintain a complete timeline.
- Provide dashboard APIs.
- Support enterprise-scale reporting.

---

**End of Part 2**

Part 3 will cover:

- Business Rules
- Validation
- Search
- Filtering
- Sorting
- Pagination
- Transactions
- Security
- Performance
- Error Handling
- Acceptance Criteria
- Coding Notes
# Part 3 – Business Rules, Validation, Security & Implementation Guidelines

---

# Business Rules

The Hiring Pipeline module is the authoritative source for a candidate's hiring progress.

Every application must always have one active pipeline.

The pipeline automatically synchronizes with the Application, Interview, and Offer modules while also supporting controlled manual stage movements.

---

# General Rules

## One Pipeline Per Application

Each application can only have one pipeline.

Attempting to create another active pipeline for the same application shall return:

```
409 Conflict
```

---

## Automatic Pipeline Creation

Whenever an application is successfully submitted:

```
Application Created

↓

Automatically Create Pipeline

↓

Stage = APPLIED
```

This process must occur inside a single database transaction.

---

## Stage Movement Rules

Every movement must:

- Validate current stage
- Validate next stage
- Verify recruiter permissions
- Verify company ownership
- Record history
- Create timeline event
- Update current stage
- Update previous stage
- Update stage order
- Update stageChangedAt

All operations must succeed together or roll back together.

---

## Terminal Stages

The following stages are terminal:

- HIRED
- REJECTED
- WITHDRAWN

After entering a terminal stage:

- Pipeline becomes completed
- No further movement is allowed

Attempting another movement returns:

```
422 Unprocessable Entity
```

---

## Manual Stage Override

Only Company Admins may manually override stages.

Requirements:

- Override reason is mandatory
- History record must be created
- Timeline event must be created
- Override must be auditable

---

## Recruiter Restrictions

Recruiters may:

- Move assigned candidates
- View assigned pipelines
- Add notes

Recruiters may not:

- Modify another recruiter's pipeline
- Override stages
- Reopen completed pipelines

---

## Notes

Notes are:

- Internal only
- Not visible to candidates
- Stored permanently
- Included in audit history

---

## Timeline Rules

Every significant action creates a timeline event.

Examples:

- Application Submitted
- Candidate Shortlisted
- Interview Scheduled
- Interview Completed
- Offer Approved
- Offer Sent
- Offer Accepted
- Candidate Rejected
- Candidate Withdrawn
- Candidate Hired
- Recruiter Added Note

Timeline events are immutable.

---

# Validation Rules

Validation shall be implemented using Zod.

---

## Stage Validation

Only valid enum values are accepted.

Invalid values return:

```
400 Bad Request
```

---

## Notes Validation

Requirements:

- Optional
- Maximum 2,000 characters
- Automatically trimmed

---

## Override Reason

Required only for manual overrides.

Minimum:

```
10 characters
```

Maximum:

```
500 characters
```

---

## Stage Transition Validation

Only allowed transitions may occur.

Example:

```
APPLIED

↓

SCREENING

↓

SHORTLISTED
```

Invalid examples:

```
APPLIED

↓

OFFER_SENT
```

Return:

```
422 Unprocessable Entity
```

---

# Search

Support searching by:

- Candidate Name
- Candidate Code
- Application Number
- Job Title
- Recruiter Name
- Recruiter Email
- Pipeline Stage

Search must be:

- Case insensitive
- Partial matching
- Company isolated

---

# Filtering

Supported filters:

- Current Stage
- Recruiter
- Department
- Job
- Candidate
- Application Status
- Completed
- Active
- Hired
- Rejected
- Withdrawn
- Date Range

Filters may be combined.

---

# Sorting

Support sorting by:

- Candidate Name
- Job Title
- Recruiter
- Stage
- Stage Changed Date
- Created Date
- Updated Date

Ascending

Descending

---

# Pagination

Every list endpoint must support:

```
page

limit

sortBy

sortOrder
```

Default:

```
page = 1

limit = 20
```

Maximum:

```
limit = 100
```

---

# Transactions

The following workflows must execute inside a single Prisma transaction:

- Automatic Pipeline Creation
- Stage Movement
- Manual Override
- History Creation
- Timeline Creation
- Completion (Hired)
- Completion (Rejected)
- Completion (Withdrawn)

Rollback on any failure.

---

# Soft Delete

Pipelines shall use soft delete.

```
deletedAt
```

Default queries exclude deleted pipelines.

---

# Security

Every endpoint must enforce:

- JWT Authentication
- RBAC
- Company Isolation
- Recruiter Ownership
- Soft Delete Filtering

---

# Permission Matrix

| Operation | Recruiter | Company Admin |
|------------|-----------|---------------|
| View Assigned Pipeline | ✓ | ✓ |
| View All Pipelines | ✗ | ✓ |
| Move Candidate | ✓ | ✓ |
| Override Stage | ✗ | ✓ |
| Add Notes | ✓ | ✓ |
| View Dashboard | Own | All |
| View Analytics | Own | All |

---

# Error Handling

Standard HTTP responses:

| Code | Meaning |
|------|----------|
| 400 | Validation Error |
| 401 | Authentication Required |
| 403 | Permission Denied |
| 404 | Pipeline Not Found |
| 409 | Duplicate Pipeline |
| 422 | Invalid Stage Transition |
| 500 | Internal Server Error |

Internal database errors must never be exposed.

---

# Performance Requirements

Repository queries should:

- Use explicit Prisma `select`
- Reuse shared select objects
- Avoid N+1 queries
- Support pagination
- Reuse query builders
- Use indexed fields

Dashboard endpoints should rely on database aggregation where practical.

---

# Logging

Log every important action.

Examples:

- Pipeline Created
- Stage Changed
- Stage Overridden
- Candidate Hired
- Candidate Rejected
- Candidate Withdrawn
- Recruiter Added Note

Structured logging should include:

- pipelineId
- applicationId
- companyId
- recruiterId
- userId
- action
- previousStage
- currentStage
- timestamp

---

# Future Integration Points

The module should expose extension points for:

- Notification Module
- Audit Module
- Reporting Module
- Analytics Module
- Employee Onboarding Module
- AI Candidate Insights

These integrations should not require redesign of the module.

---

# Coding Guidelines

Follow the established HireStack backend architecture:

```
Routes

↓

Controllers

↓

Services

↓

Repositories

↓

Prisma

↓

PostgreSQL
```

Controllers

- Thin
- No business logic

Services

- Business rules
- Stage validation
- Transactions
- Permission checks

Repositories

- Prisma queries only
- No business logic

Validation

- Zod schemas only

Utilities

- Shared query builders
- Shared Prisma select objects
- Shared pagination
- Shared response helpers
- Shared logger
- Shared error classes

---

# Testing Requirements

Implement tests for:

- Automatic pipeline creation
- Duplicate pipeline prevention
- Valid stage movement
- Invalid stage movement
- Manual override
- Timeline creation
- History creation
- Search
- Filtering
- Sorting
- Pagination
- RBAC
- Company isolation
- Soft delete
- Transaction rollback
- Dashboard aggregation

---

# Acceptance Criteria

The Hiring Pipeline module shall:

- Maintain exactly one active pipeline per application.
- Track every hiring stage.
- Record immutable history.
- Generate a unified activity timeline.
- Synchronize automatically with Application, Interview, and Offer modules.
- Enforce secure stage transitions.
- Provide recruiter and company dashboards.
- Support enterprise search, filtering, sorting, and pagination.
- Be fully transaction-safe.
- Follow the established HireStack architecture.
- Be production-ready for enterprise-scale Applicant Tracking Systems.

---

# Module Completion

The Hiring Pipeline module is now considered functionally complete.

Deliverables include:

- Foundation & Architecture
- Database Design
- Entity Definitions
- Pipeline Lifecycle
- Business Rules
- Validation
- Security
- API Design
- Dashboard Design
- Performance Guidelines
- Testing Requirements
- Acceptance Criteria

This document serves as the authoritative specification for implementing the Hiring Pipeline module.

**End of PRD – Hiring Pipeline Module**