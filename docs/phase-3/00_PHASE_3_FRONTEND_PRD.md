# HireStack — Phase 3 Frontend PRD

**Project:** HireStack ATS  
**Phase:** Phase 3 — React Frontend  
**Backend Version:** v2.0.0  
**Status:** Draft / Planning  
**Document Version:** 1.0.0

---

# 1. Overview

Phase 3 introduces the complete React frontend for HireStack ATS.

The backend platform is already stable and released as v2.0.0. It provides the complete ATS backend together with the AI platform.

Phase 3 will build the user-facing web application that consumes these backend APIs.

The frontend must provide:

- Professional ATS user experience
- Role-based interfaces
- Secure authentication
- Candidate management
- Job management
- Application management
- Interview management
- Offer and hiring pipeline management
- Resume management
- AI-powered recruitment features
- Search, filtering, sorting and pagination
- Responsive layouts
- Proper loading, error and empty states
- Secure API communication

The frontend must consume the existing backend APIs rather than duplicating backend business logic.

---

# 2. Phase 3 Objective

The primary objective is to transform the existing HireStack backend platform into a complete production-quality web application.

The frontend must allow authorized users to interact with the ATS and AI functionality through a consistent and intuitive interface.

The frontend must preserve all backend authorization and business rules.

The frontend is a presentation and interaction layer.

Backend remains the source of truth for:

- Authentication
- Authorization
- Business rules
- Validation
- Data persistence
- AI execution
- Tenant isolation
- State transitions

---

# 3. Current System State

Before Phase 3:

## Backend

Released:

**HireStack Backend v2.0.0**

The backend contains:

### Core ATS

- Authentication
- Authorization
- Company Management
- Department Management
- Recruiter Management
- Candidate Management
- Job Management
- Application Management
- Interview Management
- Offer Management
- Hiring Pipeline
- Role Based Access Control
- Validation
- Pagination
- Filtering
- Sorting
- Search
- Business Rules
- State Machines
- Swagger
- Transactions
- Logging
- Audit hooks

### AI Platform

- AI Resume Parser
- ATS Score
- AI Job Matching
- AI Resume Recommendations
- AI Interview Assistant
- AI Insights
- AI Optimization

---

# 4. Frontend Technology

The frontend will use:

- React
- TypeScript
- Vite
- React Router
- Axios or equivalent HTTP client
- Zod for frontend validation where appropriate
- A centralized API layer
- Centralized authentication state
- Reusable UI components

Additional libraries may be introduced only when they provide clear architectural value.

Avoid unnecessary dependencies.

---

# 5. Frontend Architecture Principles

The frontend must follow:

- Component-based architecture
- Feature/module-based organization
- Strong TypeScript typing
- Reusable components
- Centralized API communication
- Centralized authentication handling
- Separation of UI and business logic
- Clear separation between pages and reusable components
- Consistent error handling
- Consistent loading states
- Consistent form handling
- Responsive design
- Accessibility-aware implementation
- Secure handling of authentication state

---

# 6. User Roles

The frontend must support the existing backend roles.

## Company Admin

Company Admin can access company-scoped administrative functionality.

Expected areas:

- Dashboard
- Recruiters
- Departments
- Candidates
- Jobs
- Applications
- Interviews
- Offers
- Hiring Pipeline
- AI evaluations
- Company-level information

---

## Recruiter

Recruiters operate within their assigned company and job permissions.

Expected areas:

- Dashboard
- Candidates
- Assigned Jobs
- Applications
- Interviews
- Offers
- Hiring Pipeline
- AI evaluations
- Candidate analysis

Recruiter access must follow backend authorization and job assignment rules.

---

## Candidate

Candidate-facing functionality must respect backend candidate permissions.

Expected areas include:

- Candidate profile
- Resume
- Applications
- Application status
- Interviews
- Relevant AI features exposed to candidates

Candidate access must remain strictly self-scoped.

---

# 7. Authentication

The frontend must integrate with the existing backend JWT authentication system.

Requirements:

- Login page
- Logout
- Authentication state
- Protected routes
- Role-aware routes
- Unauthorized handling
- Session expiration handling
- API authentication headers
- Automatic handling of authentication failures

The frontend must never bypass backend authorization.

---

# 8. Application Shell

Create a reusable application shell containing:

- Sidebar/navigation
- Header
- User information
- Role information
- Main content area
- Breadcrumbs where appropriate
- Notifications area where supported
- Responsive navigation

Navigation must be role-aware.

Users should only see navigation options relevant to their role.

---

# 9. Dashboard

Create role-aware dashboards.

## Company Admin Dashboard

Possible information:

- Candidate count
- Active jobs
- Applications
- Interviews
- Hiring pipeline overview
- Recruiter activity
- AI evaluation summaries

## Recruiter Dashboard

Possible information:

- Assigned jobs
- Active applications
- Candidates
- Upcoming interviews
- Hiring pipeline
- AI evaluation activity

## Candidate Dashboard

Possible information:

- Profile completion
- Resume status
- Applications
- Interview status
- Relevant AI feedback

Dashboard data must come from backend APIs.

Do not fabricate statistics on the frontend.

---

# 10. Core ATS Modules

The frontend must expose the existing backend ATS modules.

## 10.1 Companies

For authorized users:

- Company information
- Company details
- Company settings where supported

---

## 10.2 Departments

Provide:

- Department list
- Department creation
- Department editing
- Department details
- Department deletion where permitted

---

## 10.3 Recruiters

Provide:

- Recruiter list
- Recruiter creation
- Recruiter details
- Recruiter status
- Recruiter management
- Role-aware actions

---

## 10.4 Candidates

Provide:

- Candidate list
- Candidate search
- Candidate filtering
- Candidate sorting
- Candidate details
- Candidate profile
- Resume information
- Application history
- Interview history
- AI evaluation history

---

## 10.5 Jobs

Provide:

- Job list
- Job creation
- Job editing
- Job details
- Job status
- Recruiter assignment
- Candidate/application information
- Search
- Filtering
- Sorting
- Pagination

---

## 10.6 Applications

Provide:

- Application list
- Application details
- Candidate information
- Job information
- Application status
- Status transitions allowed by backend
- Filtering
- Sorting
- Search

The frontend must not implement its own state machine.

---

## 10.7 Interviews

Provide:

- Interview list
- Interview details
- Scheduling UI where supported
- Candidate information
- Job information
- Interview status
- Interview history

---

## 10.8 Offers

Provide:

- Offer list
- Offer details
- Candidate information
- Job information
- Offer status
- Offer actions allowed by backend

---

## 10.9 Hiring Pipeline

Provide a visual representation of the hiring pipeline.

Requirements:

- Pipeline stages
- Candidate/application cards
- Stage movement where supported
- Backend validation of transitions
- Search/filter support where appropriate

Frontend must never directly manipulate state without backend validation.

---

# 11. Candidate & Resume Experience

The frontend must provide a complete candidate resume experience.

Requirements:

- Candidate profile
- Resume information
- Resume upload integration when supported by backend
- Resume status
- Resume parsing results
- Resume-derived information
- Resume history where supported

The frontend must never parse or invent resume data independently when the backend AI Resume Parser is the source of truth.

---

# 12. AI Integration

Phase 3 must expose the AI capabilities already implemented in backend v2.0.0.

---

## 12.1 AI Resume Parser

Frontend should provide:

- Resume upload/selection
- Parsing action
- Parsing progress/loading state
- Parsed resume display
- Error handling
- Re-analysis where supported

---

## 12.2 ATS Score

Provide an ATS evaluation interface.

Display:

- Overall score
- Category scores
- Strengths
- Weaknesses
- Missing skills
- Recommendations
- Evaluation metadata
- Evaluation history

The frontend must consume the structured backend response.

---

## 12.3 AI Job Matching

Display:

- Match score
- Matching skills
- Missing skills
- Strengths
- Gaps
- Explanation
- Matching history where available

---

## 12.4 AI Resume Recommendations

Display:

- Recommendation summary
- Resume improvement areas
- Missing skills
- Suggested improvements
- Job-specific recommendations where applicable
- Evaluation history

---

## 12.5 AI Interview Assistant

Provide:

- Generate general interview
- Generate job-specific interview
- Interview question list
- Categories
- Difficulty
- Reasons
- Follow-up questions
- Interview history
- Interview details

---

## 12.6 AI Insights

Provide:

- Overall insight
- Strengths
- Weaknesses
- Skill gaps
- Experience concerns
- Hiring risks
- Hiring confidence
- Job-fit observations
- Recruiter focus areas
- Recommendation
- Historical insight records

---

## 12.7 AI Optimization

AI Optimization is primarily backend infrastructure.

The frontend must not expose internal optimization mechanisms such as:

- Cache keys
- Retry internals
- Deduplication locks
- Internal execution metadata

The frontend should only surface appropriate user-facing states such as:

- Loading
- Processing
- Temporary failure
- Retry available
- Evaluation completed

---

# 13. API Integration

All frontend backend communication must use a centralized API layer.

Do not place raw HTTP requests throughout components.

Recommended structure:

```text
src/
└── services/
    ├── apiClient.ts
    ├── auth.api.ts
    ├── candidates.api.ts
    ├── jobs.api.ts
    ├── applications.api.ts
    ├── interviews.api.ts
    ├── offers.api.ts
    ├── recruiters.api.ts
    ├── departments.api.ts
    └── ai/
        ├── resume-parser.api.ts
        ├── ats-score.api.ts
        ├── job-matching.api.ts
        ├── recommendations.api.ts
        ├── interview.api.ts
        └── insights.api.ts


The exact structure may be refined during architecture design.

14. API Contract Rule

Backend Swagger/OpenAPI documentation is the source of truth for API contracts.

Frontend implementation must not invent:

Endpoint paths
Request fields
Response fields
Role permissions
Status values
Business rules

If a frontend requirement conflicts with the backend API, stop and resolve the contract rather than silently implementing a workaround.

15. State Management

Use centralized state only where necessary.

State categories:

Authentication State
Current user
Role
Authentication status
Server State
Candidates
Jobs
Applications
Interviews
Offers
AI evaluations
UI State
Modal state
Sidebar state
Filters
Local form state
Loading states

Avoid putting all application data into one global store unnecessarily.

16. Forms & Validation

Forms must:

Validate required fields
Display useful errors
Match backend validation rules
Prevent obvious invalid requests
Preserve server-side validation as the final authority

Frontend validation must improve UX but must not replace backend validation.

17. Loading States

Every asynchronous operation must have an appropriate loading state.

Examples:

Initial page loading
Table loading
Form submission
AI generation
Resume parsing
Search
Pagination
Status transitions

Avoid blank screens during network operations.

18. Error Handling

Implement centralized API error handling.

Handle:

400 Validation errors
401 Authentication errors
403 Authorization errors
404 Not found
409 Business conflicts
429 Rate limiting where applicable
500 Server errors
Network failures
AI failures/timeouts

Errors should be displayed in user-friendly language.

Do not expose internal stack traces or sensitive backend details.

19. Empty States

Every list/table must have a meaningful empty state.

Examples:

No candidates
No jobs
No applications
No interviews
No AI evaluations
No search results

Empty states should distinguish between:

No data exists
Search returned no results
User does not have access
Data failed to load
20. Search, Filtering & Pagination

Frontend must consume backend-supported:

Search
Filtering
Sorting
Pagination

Requirements:

URL/state synchronization where useful
Debounced search where appropriate
Consistent filter controls
Pagination controls
Clear/reset filters

Do not load an entire large dataset merely to filter it locally when backend filtering exists.

21. Security Requirements

Frontend security requirements include:

Protected routes
Role-aware navigation
Secure API authentication
No sensitive information in local storage unless explicitly justified
No API secrets in frontend code
No hardcoded credentials
No trust in client-side role checks
Proper unauthorized handling
Safe error messages
No exposure of raw AI prompts
No exposure of raw resume content in logs

Backend remains authoritative for all authorization.

22. Responsive Design

The frontend must work across:

Desktop
Laptop
Tablet
Mobile

Primary ATS workflows should remain usable on smaller screens.

Tables may use responsive alternatives where necessary.

23. Accessibility

Frontend should follow accessibility best practices:

Semantic HTML
Keyboard navigation
Accessible form labels
Focus management
Proper button/link semantics
Useful error messages
Sufficient visual hierarchy
Accessible dialogs/modals
24. Performance

Frontend performance requirements:

Lazy-load large feature areas where appropriate
Avoid unnecessary API calls
Avoid unnecessary re-renders
Paginate large datasets
Cache server state appropriately
Optimize large lists
Avoid loading AI data until needed
Use code splitting where beneficial

Do not prematurely optimize without evidence.

25. Testing Strategy

Testing will include:

Unit Tests

For:

Utility functions
Validation
Data transformations
Important reusable components
Component Tests

For:

Forms
Tables
Modals
AI result displays
Navigation
Integration Tests

For:

Authentication
API interaction
Role-based UI
Core workflows
AI workflows
End-to-End Tests

For critical workflows:

Login
Candidate creation
Job creation
Application workflow
Interview workflow
AI evaluation workflow
26. Frontend Folder Structure

The final architecture will be established before implementation.

Initial target:

frontend/
├── public/
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── utils/
│   └── main.tsx
├── tests/
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts

This structure is provisional and will be finalized during the architecture stage.

27. Development Stages

Phase 3 will be implemented in controlled stages.

Stage 1 — Frontend Foundation
React + TypeScript + Vite
Project structure
Environment configuration
Routing foundation
API client
Base UI system
Global error handling
Base layouts
Stage 2 — Authentication & Authorization UI
Login
Logout
Auth state
Protected routes
Role-based routing
Session handling
Stage 3 — Application Shell & Dashboard
Sidebar
Header
Navigation
Dashboard layouts
Role-aware dashboards
Stage 4 — Core ATS Modules
Companies
Departments
Recruiters
Candidates
Jobs
Applications
Interviews
Offers
Hiring Pipeline
Stage 5 — Candidate & Resume
Candidate profile
Resume interface
Resume parsing
Resume information
Stage 6 — AI Integration
ATS Score
Job Matching
Resume Recommendations
Interview Assistant
AI Insights
Stage 7 — UX & Advanced Interaction
Search
Filtering
Sorting
Pagination
Responsive improvements
Empty states
Loading states
Error states
Stage 8 — Security & Quality
Permission verification
Error handling
Accessibility
Security review
API contract review
Stage 9 — Testing
Unit tests
Component tests
Integration tests
E2E tests
Regression testing
Stage 10 — Production Readiness
Build verification
Environment configuration
Performance review
Security review
Final API compatibility review
Production documentation
Release preparation
28. Versioning

Backend:

v2.0.0

Phase 3 frontend development will initially remain under development versions.

The final frontend release version will be determined after production-readiness verification.

29. Definition of Done

Phase 3 is complete only when:

All required frontend modules are implemented
Authentication works
Role-based navigation works
Backend APIs are integrated
Core ATS workflows work
AI features work
Error states are handled
Loading states are handled
Empty states are handled
Responsive layouts work
Security review passes
API contracts match Swagger
Tests pass
Production build succeeds
No critical lint/type errors remain
No critical security issues remain
Frontend production-readiness review passes
30. Non-Goals

Phase 3 will NOT:

Rewrite backend business logic
Duplicate backend authorization
Replace backend validation
Move AI execution into the browser
Expose Ollama directly to the browser
Store sensitive AI configuration in frontend code
Implement unnecessary backend changes
Introduce unrelated product features
31. Success Criteria

Phase 3 succeeds when a user can open HireStack and perform the complete recruitment workflow through the web interface.

For example:

Login
  ↓
Dashboard
  ↓
Create / View Job
  ↓
View Candidates
  ↓
Review Candidate
  ↓
Review Resume
  ↓
Run AI Evaluation
  ↓
View ATS Score
  ↓
View Job Match
  ↓
View Recommendations
  ↓
Generate Interview
  ↓
View AI Insights
  ↓
Move Candidate Through Hiring Pipeline
  ↓
Interview
  ↓
Offer

All operations must be governed by the existing backend authorization and business rules.

32. Phase 3 Completion Statement

Phase 3 will transform HireStack from a backend-first ATS and AI platform into a complete user-facing recruitment application.

The frontend will consume the stable HireStack Backend v2.0.0 APIs and expose the ATS and AI capabilities through a professional, secure, responsive and maintainable React application.

Phase 3 starts with Frontend Foundation and ends with a production-ready web application.