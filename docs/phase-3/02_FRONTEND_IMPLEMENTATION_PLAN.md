# HireStack ATS — Frontend Implementation Plan

**Phase:** 3  
**Version:** 1.0  
**Status:** Planned  
**Backend Baseline:** ATS Backend v2.0.0  
**Frontend:** React + TypeScript  
**Document:** Frontend Implementation Plan

---

# 1. Purpose

This document defines the implementation plan for the HireStack ATS frontend.

Phase 3 introduces the complete web interface for the ATS platform and integrates it with the stable backend released in Phase 2.

The frontend must provide:

- Role-based dashboards
- Authentication
- Company administration
- Recruiter workflows
- Candidate workflows
- Job management
- Application management
- Interview management
- Hiring pipeline
- Offer management
- AI feature integration
- API integration
- Responsive UI
- Permission-aware navigation
- Error and loading handling
- Production-ready frontend architecture

The frontend must consume the existing backend APIs rather than duplicating backend business logic.

---

# 2. Phase 3 Objectives

The primary objectives are:

1. Build the React frontend.
2. Establish a scalable frontend architecture.
3. Integrate the frontend with the existing backend API.
4. Implement role-based access control at the UI level.
5. Build dashboards for all supported roles.
6. Implement all existing ATS workflows.
7. Integrate all Phase 2 AI capabilities.
8. Provide consistent loading, error, validation, and empty states.
9. Make the application responsive.
10. Prepare the frontend for production deployment.

---

# 3. Backend Baseline

The frontend implementation must target the released backend.

## Backend Release

```text
ATS Backend v2.0.0

The backend includes:

Core ATS
Authentication
Authorization
Company Management
Department Management
Recruiter Management
Candidate Management
Job Management
Application Management
Interview Management
Offer Management
Hiring Pipeline
RBAC
Validation
Pagination
Filtering
Sorting
Search
Soft Delete
Business Rules
State Machines
Swagger
Transactions
Audit Hooks
Logging
AI
AI Resume Parser
ATS Score
AI Job Matching
AI Resume Recommendations
AI Interview Assistant
AI Insights
AI Optimization

The frontend must use the backend API contracts as the source of truth.

4. Frontend Technology Direction

The frontend will use:

React
TypeScript
React Router
API client layer
Zod where frontend validation is appropriate
Component-based UI architecture
Role-aware route protection
Centralized authentication state
Centralized API error handling
Reusable UI components

The exact supporting libraries should be selected during the frontend setup stage and documented before implementation.

Do not introduce unnecessary dependencies.

5. Frontend Architecture Principles

The frontend must follow these principles:

5.1 Feature-Based Architecture

Frontend code should be organized by business domain rather than placing all components into a single global folder.

Example:

features/
├── auth/
├── companies/
├── departments/
├── recruiters/
├── candidates/
├── jobs/
├── applications/
├── interviews/
├── offers/
├── hiring-pipeline/
└── ai/
5.2 Separation of Responsibilities

The frontend should separate:

UI
↓
Pages
↓
Feature Logic
↓
API Services
↓
Backend

Components must not contain large amounts of API/business logic.

5.3 Backend Remains Source of Truth

The frontend must not recreate backend business rules.

Examples:

Hiring state transitions
Permission enforcement
Candidate ownership
Recruiter assignment
Company isolation
Application restrictions
AI evaluation logic

The frontend may hide or disable UI actions based on role, but the backend remains responsible for enforcing authorization.

5.4 Reusable Components

Common UI elements must be reusable:

Buttons
Inputs
Selects
Modals
Dialogs
Tables
Pagination
Search
Filters
Badges
Cards
Tabs
Dropdowns
Toasts
Confirmation dialogs
Loading states
Empty states
Error states
6. Role Architecture

The frontend must support four major application roles:

SUPER_ADMIN
COMPANY_ADMIN
RECRUITER
CANDIDATE

Role permissions must be represented centrally.

Example:

SUPER_ADMIN
    ↓
Platform-level administration


COMPANY_ADMIN
    ↓
Company-level administration


RECRUITER
    ↓
Recruitment operations


CANDIDATE
    ↓
Candidate self-service
7. Super Admin Dashboard

Super Admin must be treated as a first-class frontend role.

The Super Admin operates at the platform level rather than inside a single company.

Responsibilities

The dashboard should provide platform-level visibility such as:

Platform overview
Company management
Company status
User/platform statistics
System health indicators
AI usage overview
Platform-level monitoring
Administrative controls supported by the backend

Super Admin must not accidentally inherit Company Admin tenant restrictions when accessing platform-level functionality.

However, the frontend must never bypass backend authorization.

8. Company Admin Dashboard

The Company Admin dashboard provides company-level administration.

Expected areas include:

Company overview
Recruiters
Departments
Candidates
Jobs
Applications
Interviews
Offers
Hiring pipeline
AI evaluation access
Company-level statistics

All data must remain scoped to the authenticated company.

9. Recruiter Dashboard

The Recruiter dashboard focuses on recruitment operations.

Expected areas:

Assigned jobs
Candidates
Applications
Interview schedules
Hiring pipeline
Offers
Candidate evaluation
AI tools
Recruitment activity

Recruiters must only see jobs and resources they are authorized to access.

10. Candidate Dashboard

The Candidate dashboard provides candidate self-service functionality.

Expected areas:

Candidate profile
Resume
Applications
Application status
Interviews
Offers where applicable
AI resume analysis where permitted
ATS score where permitted
Job matching where permitted
Resume recommendations
Interview Assistant where permitted

Candidates must only access their own resources.

11. Authentication Implementation

Authentication will be implemented before protected application features.

Required flows:

Login
Login
 ↓
Backend authentication
 ↓
Authenticated session
 ↓
Resolve user role
 ↓
Redirect to role dashboard
Logout
Logout
 ↓
Clear authentication state
 ↓
Clear protected client state
 ↓
Redirect to login
Protected Routes

Unauthenticated users must not access protected application routes.

Role-restricted routes must verify the authenticated role before rendering.

12. Route Architecture

Routes should be separated into:

Public Routes
Protected Routes
Role-Protected Routes

Example:

/
├── login
├── unauthorized
│
├── super-admin
│   ├── dashboard
│   ├── companies
│   └── ...
│
├── admin
│   ├── dashboard
│   ├── recruiters
│   ├── departments
│   ├── candidates
│   ├── jobs
│   └── ...
│
├── recruiter
│   ├── dashboard
│   ├── jobs
│   ├── candidates
│   ├── applications
│   └── ...
│
└── candidate
    ├── dashboard
    ├── profile
    ├── resume
    ├── applications
    ├── interviews
    └── ...

Exact route names must be finalized during implementation without breaking backend API contracts.

13. API Integration Layer

All backend communication should go through a centralized API layer.

Example:

src/
└── api/
    ├── client.ts
    ├── auth.api.ts
    ├── companies.api.ts
    ├── departments.api.ts
    ├── recruiters.api.ts
    ├── candidates.api.ts
    ├── jobs.api.ts
    ├── applications.api.ts
    ├── interviews.api.ts
    ├── offers.api.ts
    └── ai.api.ts

Components should not directly construct HTTP requests.

14. API Error Handling

The frontend must consistently handle:

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Rate Limit
500 Server Error

The API layer should normalize backend errors into a predictable frontend error structure.

15. Loading States

Every asynchronous operation must have an appropriate loading state.

Examples:

Page loading
Table loading
Button loading
Modal loading
AI generation loading
File processing loading

The UI must prevent duplicate submissions where appropriate.

16. Empty States

Every list-based feature must define an empty state.

Examples:

No candidates found.
No jobs available.
No applications found.
No interviews scheduled.
No AI evaluations available.

Empty states should distinguish between:

No data
No search results
No permission
Loading
Failed request
17. Form Validation

Frontend forms should validate obvious input errors before API submission.

Validation should include:

Required fields
Format validation
Length constraints
Numeric constraints
Date validation
File validation where applicable

Backend validation remains authoritative.

18. Core ATS Implementation Order

The recommended implementation sequence is:

Stage 1 — Foundation
React project setup
TypeScript configuration
Environment configuration
Routing
API client
Authentication state
Global error handling
UI foundation
Layout system
Stage 2 — Authentication

Implement:

Login
Logout
Session handling
Protected routes
Role resolution
Unauthorized page
Stage 3 — Super Admin

Implement:

Super Admin layout
Dashboard
Company listing
Company details
Company management
Platform-level overview
Stage 4 — Company Admin

Implement:

Admin dashboard
Company overview
Departments
Recruiters
Candidates
Jobs
Applications
Interviews
Offers
Hiring pipeline
Stage 5 — Recruiter

Implement:

Recruiter dashboard
Assigned jobs
Candidate management
Applications
Interviews
Hiring pipeline
Offers
Candidate evaluation
Stage 6 — Candidate

Implement:

Candidate dashboard
Profile
Resume
Applications
Application status
Interviews
Offers
Candidate-facing AI features
19. AI Frontend Integration

All Phase 2 AI modules must be integrated into the frontend.

19.1 AI Resume Parser

UI should allow authorized users to:

Upload/select resume
Trigger parsing where supported
View extracted information
Display parsing status/errors
19.2 ATS Score

Display:

ATS score
Score details
Evaluation metadata
Relevant feedback

Do not recreate the score calculation in the frontend.

19.3 AI Job Matching

Display:

Matching score
Matching observations
Candidate/job relationship
Relevant evaluation details
19.4 AI Resume Recommendations

Display:

Recommendations
Strengths
Improvement areas
Suggested actions
Evaluation history where supported
19.5 AI Interview Assistant

Display:

Interview mode
Generated questions
Question category
Difficulty
Reason
Follow-up questions
Interview history
Interview details
19.6 AI Insights

Display:

Overall insight
Strengths
Weaknesses
Skill gaps
Experience concerns
Hiring risks
Hiring confidence
Job-fit observations
Recruiter focus areas
Recommendation
Evaluation history

AI Insights are primarily recruiter/company-admin facing according to the backend authorization model.

20. AI UX Requirements

AI operations may take longer than normal API requests.

Therefore the frontend must provide:

Clear loading indicators
AI processing messages
Prevent duplicate requests
Error recovery
Retry action where appropriate
Clear distinction between loading and failed states

The frontend must never display fabricated AI data when an API request fails.

21. Dashboard Strategy

Dashboards should not become giant components.

Use:

Dashboard
├── Summary Cards
├── Charts
├── Recent Activity
├── Pending Actions
└── Quick Actions

Each section should be independently reusable.

Initially prioritize functional dashboard information over complex visualizations.

Advanced analytics are planned for a later phase.

22. Tables

Management-heavy areas should use reusable data-table components.

Required capabilities where supported by backend:

Pagination
Search
Sorting
Filtering
Row actions
Status badges
Empty state
Loading state
Error state

Do not implement client-side pagination when the backend already provides server-side pagination.

23. Hiring Pipeline UI

The hiring pipeline should visually represent candidate progression.

Example:

APPLIED
   ↓
SCREENING
   ↓
SHORTLISTED
   ↓
INTERVIEW
   ↓
OFFER
   ↓
HIRED

The frontend should request state changes through backend APIs.

It must not directly manipulate pipeline state locally without backend confirmation.

24. Interview UI

Interview functionality should support the existing backend interview module.

Expected functionality:

Interview listing
Interview details
Candidate information
Job information
Interview status
Scheduling information
Interview workflow actions supported by backend

AI Interview Assistant should remain a separate AI capability integrated into the interview experience where appropriate.

25. Offer UI

Offer functionality should support:

Offer listing
Offer details
Candidate information
Job information
Offer status
Offer workflow actions supported by backend

Business rules remain backend-controlled.

26. Permission-Aware UI

The frontend should hide or disable actions that the current user cannot perform.

Examples:

SUPER_ADMIN
→ Platform administration


COMPANY_ADMIN
→ Company administration


RECRUITER
→ Assigned recruitment resources


CANDIDATE
→ Own candidate resources

However:

UI permissions are for user experience only.

Every sensitive operation must still be authorized by the backend.

27. State Management

State should be divided into:

Server State

Examples:

Candidates
Jobs
Applications
Interviews
AI evaluations
Client State

Examples:

Authentication state
UI state
Modal state
Filters
Temporary form state

Avoid storing large amounts of server data in global state unnecessarily.

28. File Handling

Phase 3 should integrate with backend file APIs where available.

Potential frontend requirements:

Resume upload
File selection
File validation
Upload progress where supported
Upload error handling
File metadata display

Do not expose internal server filesystem paths.

29. Security Requirements

The frontend must:

Never hard-code secrets
Never expose backend credentials
Never trust role information from untrusted client state
Never bypass API authorization
Never expose sensitive API responses unnecessarily
Avoid storing sensitive data unnecessarily
Handle expired sessions
Handle unauthorized responses
Avoid exposing internal errors to end users

Environment variables must be used for frontend configuration.

30. Responsive Design

The frontend must support:

Desktop
Tablet
Mobile

Priority:

Desktop
↓
Tablet
↓
Mobile

Management tables may require responsive alternatives rather than simply shrinking desktop tables.

31. Accessibility

The frontend should follow basic accessibility principles:

Semantic HTML
Keyboard navigation
Form labels
Accessible buttons
Focus handling
Sufficient contrast
Accessible dialogs
Meaningful error messages
Screen-reader-friendly status messages

Accessibility should be considered during component creation rather than added at the end.

32. Testing Strategy

Testing should be introduced progressively.

Unit Tests

For:

Utility functions
Permission helpers
Validation helpers
State transformations
Component Tests

For:

Forms
Tables
Modals
Protected components
Loading/error states
Integration Tests

For:

Authentication
API integration
Role-based navigation
CRUD workflows
AI workflows
End-to-End Tests

Critical flows should eventually include:

Login
→ Dashboard
→ Create Job
→ View Candidate
→ Application
→ Interview
→ AI Evaluation
→ Hiring Pipeline
33. Frontend Implementation Milestones
Milestone 1 — Project Foundation

Deliver:

React application
TypeScript
Routing
API client
UI foundation
Environment configuration
Authentication architecture
Milestone 2 — Authentication & RBAC

Deliver:

Login
Logout
Session handling
Protected routes
Role routing
Unauthorized page
Milestone 3 — Super Admin

Deliver:

Super Admin layout
Dashboard
Company management
Platform overview
Milestone 4 — Company Admin

Deliver:

Admin dashboard
Departments
Recruiters
Candidates
Jobs
Applications
Interviews
Offers
Hiring pipeline
Milestone 5 — Recruiter

Deliver:

Recruiter dashboard
Assigned jobs
Candidate workflows
Applications
Interviews
Offers
Pipeline
Milestone 6 — Candidate

Deliver:

Candidate dashboard
Profile
Resume
Applications
Interviews
Offers
Milestone 7 — AI Integration

Deliver:

Resume Parser
ATS Score
Job Matching
Resume Recommendations
Interview Assistant
AI Insights
Milestone 8 — UX Hardening

Deliver:

Loading states
Error states
Empty states
Validation
Toasts
Confirmation dialogs
Responsive UI
Accessibility improvements
Milestone 9 — Testing

Deliver:

Unit tests
Component tests
Integration tests
Critical E2E tests
Regression testing
Milestone 10 — Production Preparation

Deliver:

Production build
Environment configuration
API configuration
Security review
Performance review
Deployment preparation
34. Definition of Done

A frontend feature is considered complete only when:

UI is implemented
API integration is complete
Loading state exists
Error state exists
Empty state exists where applicable
Validation exists where applicable
Permission behavior is implemented
Responsive behavior is checked
Backend authorization is respected
Tests are added where appropriate
No TypeScript errors
No lint errors
Production build succeeds
35. Phase 3 Verification Checklist

Before Phase 3 is considered complete:

Architecture
 Feature-based architecture implemented
 Shared components established
 API layer established
 Authentication state established
 Role system established
Roles
 Super Admin
 Company Admin
 Recruiter
 Candidate
Core ATS
 Companies
 Departments
 Recruiters
 Candidates
 Jobs
 Applications
 Interviews
 Offers
 Hiring Pipeline
AI
 Resume Parser
 ATS Score
 Job Matching
 Resume Recommendations
 Interview Assistant
 AI Insights
Quality
 Loading states
 Error states
 Empty states
 Validation
 Responsive design
 Accessibility
 Permission-aware UI
 Testing
 Production build
36. Implementation Rules

The following rules apply throughout Phase 3:

Do not modify backend business logic merely to simplify frontend implementation.
Do not duplicate backend validation unnecessarily.
Do not bypass backend authorization.
Do not hard-code API URLs.
Do not hard-code user roles throughout components.
Keep permissions centralized.
Keep API calls outside presentation components.
Reuse shared components.
Avoid unnecessary dependencies.
Do not introduce database changes unless a genuine backend requirement is identified.
Preserve existing backend API contracts.
Do not break existing AI functionality.
Every AI feature must consume the existing backend AI APIs.
Do not expose sensitive backend implementation details in the UI.
Maintain strict tenant isolation.
Treat Super Admin as a platform-level role.
Keep Company Admin, Recruiter, and Candidate scopes separate.
Prefer server-side filtering, pagination, and sorting where supported.
Handle API failures gracefully.
Run regression checks after major feature groups.
37. Recommended Implementation Order

The actual implementation should follow this sequence:

PHASE 3
│
├── 01. Frontend Foundation
│
├── 02. Authentication
│
├── 03. RBAC & Route Protection
│
├── 04. Shared UI / Design System
│
├── 05. Super Admin
│
├── 06. Company Admin
│
├── 07. Recruiter
│
├── 08. Candidate
│
├── 09. Core ATS Workflows
│
├── 10. AI Integration
│
├── 11. Responsive & Accessibility
│
├── 12. Testing
│
└── 13. Production Preparation
38. Next Implementation Step

After this planning document is finalized, implementation begins with:

Frontend Foundation

The first implementation task should establish:

React project structure
TypeScript configuration
Environment configuration
Routing foundation
API client foundation
Authentication architecture
Shared UI foundation
Global error handling
Initial application layout

No business module should be implemented before the foundation is stable.

39. Phase 3 Completion Goal

At the end of Phase 3, HireStack ATS should have:

                    HIRESTACK ATS
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   SUPER ADMIN      COMPANY ADMIN      CANDIDATE
        │                │                │
   Platform          Company          Self-Service
   Management        Management
                         │
                      RECRUITER
                         │
                 Recruitment Operations
                         │
        ┌────────────────┼────────────────┐
        │                │                │
      ATS              AI              Workflow
        │                │                │
   Jobs/Candidates   AI Features     Applications
   Applications       Insights        Interviews
   Interviews         Matching        Offers
   Offers             Scoring         Pipeline

The frontend should provide a unified, role-aware, responsive interface over the existing HireStack ATS backend and Phase 2 AI capabilities.