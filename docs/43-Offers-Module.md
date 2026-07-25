# HireStack ATS

# Product Requirements Document (PRD)

# Module 12 – Offers

## Part 1 – Module Foundation

---

# Document Information

| Item | Value |
|------|-------|
| Module | Offers |
| Version | 1.0 |
| Status | Architecture Frozen |
| Priority | High |
| Dependencies | Shared, Authentication, Users, Companies, Recruiters, Jobs, Candidates, Applications, Interview Management |
| Next Module | Hiring Pipeline |

---

# 1. Purpose

The **Offers Module** manages the complete employment offer lifecycle after a candidate successfully completes the recruitment process.

It serves as the bridge between **Interview Management** and the **Hiring Pipeline**, ensuring offers are created, approved, delivered, tracked, accepted, declined, or withdrawn in a controlled and auditable manner.

The module centralizes all offer-related information while maintaining strict company isolation, role-based access control, version history, and data integrity.

---

# 2. Objectives

The Offers module aims to:

- Create employment offers.
- Maintain multiple offer revisions.
- Prevent duplicate active offers.
- Support draft and approval workflows.
- Deliver offer letters.
- Track offer lifecycle.
- Record candidate responses.
- Preserve historical offer versions.
- Support future PDF generation.
- Support future email integration.
- Integrate seamlessly with Hiring Pipeline.

---

# 3. Scope

## Included

- Offer creation
- Offer revisions
- Offer approval
- Offer sending
- Candidate acceptance
- Candidate rejection
- Offer withdrawal
- Offer expiry
- Offer version history
- Offer letter metadata
- Compensation details
- Search
- Filtering
- Sorting
- Pagination
- Soft delete

---

## Excluded (Version 1)

The following belong to future modules:

- Employee onboarding
- HR documentation
- Payroll integration
- Digital signatures
- Email delivery engine
- Notification engine
- Calendar integration
- Audit timeline
- AI salary recommendation
- Counter-offer negotiation
- Multi-level approval workflow

---

# 4. Design Principles

The Offers module follows the same architectural principles as the previous HireStack modules.

## 4.1 Single Responsibility

The module only manages employment offers.

It does **not** manage:

- Interviews
- Hiring decisions
- Employee onboarding
- Notifications

---

## 4.2 Separation of Concerns

```text
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
Database
```

Each layer has a single responsibility.

---

## 4.3 Repository Pattern

Repositories own all database access.

Services must never execute:

```ts
prisma.offer.findMany()

prisma.offer.create()

prisma.offer.update()
```

Repositories expose business-oriented methods such as:

- createOffer()
- updateOffer()
- approveOffer()
- sendOffer()
- acceptOffer()
- declineOffer()
- withdrawOffer()
- findOfferById()
- findActiveOfferByApplication()
- searchOffers()

---

## 4.4 Transaction Safety

All state-changing operations must execute inside Prisma transactions.

Including:

- Create Offer
- Create Revision
- Approve
- Send
- Accept
- Decline
- Withdraw

---

## 4.5 Multi-Tenant Isolation

Every query must be scoped to:

```text
companyId
```

Users must never access offers from another company.

---

## 4.6 Soft Delete

Offers are never physically removed.

Use:

```text
deletedAt
```

Deleted offers remain available for future audit modules.

---

## 4.7 Immutable History

Offer revisions must never overwrite previous versions.

Every revision creates a new Offer record while preserving earlier versions.

---

# 5. Module Overview

The module begins after a candidate successfully completes the interview process.

Typical workflow:

```text
Job
      │
      ▼
Application
      │
      ▼
Interview Management
      │
      ▼
Offer Draft
      │
      ▼
Approval
      │
      ▼
Offer Sent
      │
      ▼
Candidate Response
      │
      ├──────────────┐
      ▼              ▼
Accepted        Declined
      │
      ▼
Hiring Pipeline
```

---

# 6. Responsibilities

The module is responsible for:

- Creating offers
- Updating drafts
- Managing revisions
- Approving offers
- Sending offers
- Tracking status
- Recording acceptance
- Recording rejection
- Recording withdrawal
- Recording expiry
- Maintaining version history
- Validating business rules
- Enforcing permissions
- Maintaining company isolation

---

# 7. Module Dependencies

The Offers module depends on the following completed modules.

| Module | Purpose |
|---------|----------|
| Shared | Utilities, constants, responses |
| Authentication | JWT authentication |
| Users | Company users |
| Companies | Tenant isolation |
| Recruiters | Assigned recruiter ownership |
| Jobs | Offer job reference |
| Candidates | Candidate details |
| Applications | Parent entity |
| Interview Management | Interview completion validation |

---

# 8. Entity Relationships

```text
Company
   │
   ├──────────────┐
   │              │
Recruiter      Candidate
        │          │
        └────┐     │
             ▼     ▼
         Application
               │
               │ 1
               │
               ▼
           Offer (v1)
               │
               ▼
           Offer (v2)
               │
               ▼
           Offer (v3)
```

One application may contain multiple offer versions.

Only one offer can remain active at any time.

---

# 9. Offer Lifecycle

```text
Create Draft
        │
        ▼
Pending Approval
        │
        ▼
Approved
        │
        ▼
Sent
        │
        ▼
Viewed
        │
 ┌──────┴────────┐
 ▼               ▼
Accepted     Declined
 │
 ▼
Hiring Pipeline
```

Alternative terminal paths:

```text
Sent
 │
 ▼
Expired
```

```text
Approved
 │
 ▼
Withdrawn
```

---

# 10. Permission Model

## Company Admin

Can:

- Create offers
- Edit drafts
- Approve offers
- Send offers
- Withdraw offers
- View all company offers

---

## Assigned Recruiter

Can:

- Create draft offers
- Edit draft offers
- View assigned offers

Cannot:

- Approve
- Send
- Withdraw after approval

---

## Other Recruiters

View-only access (subject to company visibility rules).

Cannot modify offers.

---

## Super Admin

No operational permissions for Offer Management.

Can only access system-level administrative capabilities outside normal business operations.

---

# 11. Folder Structure

```text
modules/
└── offers/
    ├── constants/
    ├── controllers/
    ├── repositories/
    ├── routes/
    ├── services/
    ├── types/
    ├── validation/
    ├── index.ts
    └── README.md
```

This mirrors the architecture of previous modules for consistency.

---

# 12. File Responsibilities

| Folder/File | Responsibility |
|--------------|---------------|
| controllers | Handle HTTP requests and responses |
| services | Business logic and transaction orchestration |
| repositories | Prisma database operations |
| validation | Zod request validation |
| constants | Offer enums and constants |
| types | DTOs and TypeScript interfaces |
| routes | API route definitions |
| index.ts | Module registration |
| README.md | Module documentation |

---

# 13. Security Principles

The module must enforce:

- JWT authentication
- Role-based authorization
- Company isolation
- Input validation
- Soft delete
- Immutable offer history
- Transaction safety
- Least-privilege access

---

# 14. Future Compatibility

The architecture is designed to integrate with future modules without breaking changes:

- Hiring Pipeline
- Notifications
- Email Service
- PDF Generation
- Audit Logs
- Activity Timeline
- Employee Onboarding
- Analytics
- AI Salary Recommendation

These integrations should be achievable by extending the module rather than redesigning it.

---

# 15. Acceptance Criteria (Part 1)

The module foundation will be considered complete when:

- ✅ Purpose and scope are defined.
- ✅ Responsibilities are documented.
- ✅ Dependencies are identified.
- ✅ Entity relationships are established.
- ✅ Offer lifecycle is defined.
- ✅ Permission model is finalized.
- ✅ Folder structure matches project standards.
- ✅ Security principles are documented.
- ✅ Future extensibility is considered.

---

## End of PRD – Part 1

This completes the architectural foundation for the Offers module.

**Next:** **Offers PRD – Part 2 (Database Design, Offer Entity, Versioning, Lifecycle, and API Design)**.
---

# Part 2 – Database Design, Offer Entity, Lifecycle & API Design

---

# 16. Database Design

The Offers module stores all employment offers created for successful applications.

Each offer belongs to exactly one application.

An application may have multiple offer revisions, but only one active offer at any given time.

The Offer entity is immutable after acceptance, decline, withdrawal, or expiry.

---

# 17. Entity Relationships

```
Company
   │
   ├────────────┐
   │            │
Recruiter   Candidate
      │          │
      └────┐     │
           ▼     ▼
       Application
             │
             │ 1
             ▼
          Offer
```

Relationships

| Entity | Relationship |
|---------|--------------|
| Company | One Company has many Offers |
| Recruiter | One Recruiter creates many Offers |
| Candidate | Candidate receives many Offer versions |
| Application | One Application has many Offer versions |
| Offer | Belongs to one Application |

---

# 18. Offer Entity

## Core Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary Key |
| offerCode | String | Yes | Unique Offer Code |
| companyId | UUID | Yes | Tenant Isolation |
| applicationId | UUID | Yes | Parent Application |
| candidateId | UUID | Yes | Candidate Reference |
| recruiterId | UUID | Yes | Offer Creator |
| version | Integer | Yes | Offer Revision Number |
| status | Enum | Yes | Current Offer Status |
| salary | Decimal | Yes | Offered Salary |
| currency | Enum | Yes | Salary Currency |
| employmentType | Enum | Yes | Employment Type |
| joiningDate | Date | Yes | Expected Joining Date |
| expiryDate | Date | Yes | Offer Expiry Date |
| benefits | Text | No | Benefits Description |
| notes | Text | No | Internal Notes |
| offerLetterUrl | String | No | Uploaded or Generated Offer Letter |
| offerLetterFileName | String | No | Original File Name |
| approvedBy | UUID | No | Company Admin |
| approvedAt | DateTime | No | Approval Timestamp |
| sentAt | DateTime | No | Offer Sent Time |
| viewedAt | DateTime | No | Candidate Viewed Time |
| respondedAt | DateTime | No | Candidate Response Time |
| createdAt | DateTime | Yes | Record Creation |
| updatedAt | DateTime | Yes | Last Update |
| deletedAt | DateTime | No | Soft Delete |

---

# 19. Offer Code

Offer codes are generated automatically.

Format

```
OFF-000001
OFF-000002
OFF-000003
```

Rules

- Unique
- Immutable
- Sequential
- Transaction-safe
- Never generated using record count

---

# 20. Offer Versioning

The module supports multiple offer revisions.

Example

```
Application

│

├── Offer Version 1

│

├── Offer Version 2

│

└── Offer Version 3
```

Each revision creates a completely new Offer record.

Previous versions remain read-only.

Only one offer may remain active.

---

# 21. Offer Status

## Enum

```
DRAFT

PENDING_APPROVAL

APPROVED

SENT

VIEWED

ACCEPTED

DECLINED

EXPIRED

WITHDRAWN
```

---

# 22. Status Definitions

## DRAFT

Offer is being prepared.

Editable.

---

## PENDING_APPROVAL

Waiting for Company Admin approval.

Recruiter cannot edit unless returned.

---

## APPROVED

Approved for sending.

Can be sent.

---

## SENT

Delivered to candidate.

Waiting for response.

---

## VIEWED

Candidate opened the offer.

Waiting for decision.

---

## ACCEPTED

Candidate accepted.

Final state.

Immutable.

---

## DECLINED

Candidate declined.

Final state.

Immutable.

---

## EXPIRED

Candidate failed to respond before expiry.

Final state.

Immutable.

---

## WITHDRAWN

Company cancelled the offer.

Final state.

Immutable.

---

# 23. Offer Lifecycle

```
Create Draft

↓

Pending Approval

↓

Approved

↓

Sent

↓

Viewed

↓

Accepted
```

Alternative paths

```
Viewed

↓

Declined
```

```
Sent

↓

Expired
```

```
Approved

↓

Withdrawn
```

---

# 24. Allowed Status Transitions

| Current | Allowed Next |
|-----------|--------------|
| DRAFT | PENDING_APPROVAL |
| PENDING_APPROVAL | APPROVED |
| APPROVED | SENT, WITHDRAWN |
| SENT | VIEWED, EXPIRED |
| VIEWED | ACCEPTED, DECLINED |
| ACCEPTED | None |
| DECLINED | None |
| EXPIRED | None |
| WITHDRAWN | None |

Invalid transitions return

```
422 Unprocessable Entity
```

---

# 25. Approval Workflow

Recruiter creates:

```
DRAFT
```

↓

Company Admin reviews

↓

```
APPROVED
```

↓

Company Admin sends

↓

```
SENT
```

No multi-level approval in Version 1.

---

# 26. Candidate Response

Candidate may:

- Accept
- Decline

No negotiation workflow.

No counter offers.

No edit capability.

---

# 27. Compensation Details

Offer includes

- Salary
- Currency
- Employment Type
- Joining Date
- Benefits
- Notes

Benefits remain optional.

---

# 28. Offer Letter

Supported

- Uploaded PDF
- Generated PDF (future)
- External URL

Stored Fields

- offerLetterUrl
- offerLetterFileName

Generation is outside Version 1 scope.

---

# 29. API Endpoints

## Create Offer

```
POST /offers
```

---

## Update Draft

```
PUT /offers/:id
```

---

## Submit for Approval

```
POST /offers/:id/submit
```

---

## Approve Offer

```
POST /offers/:id/approve
```

---

## Send Offer

```
POST /offers/:id/send
```

---

## Mark Viewed

```
POST /offers/:id/view
```

---

## Accept Offer

```
POST /offers/:id/accept
```

---

## Decline Offer

```
POST /offers/:id/decline
```

---

## Withdraw Offer

```
POST /offers/:id/withdraw
```

---

## Create Offer Revision

```
POST /offers/:id/revision
```

---

## Get Offer

```
GET /offers/:id
```

---

## List Offers

```
GET /offers
```

---

## Soft Delete

```
DELETE /offers/:id
```

---

# 30. Request DTOs

## Create Offer

Required

- applicationId
- salary
- currency
- employmentType
- joiningDate
- expiryDate

Optional

- benefits
- notes
- offerLetterUrl
- offerLetterFileName

---

## Update Draft

Editable

- salary
- joiningDate
- expiryDate
- benefits
- notes
- offerLetter

Only while status is DRAFT.

---

## Approve Offer

Requires

- approvedBy

---

## Candidate Response

Requires

- response

Enum

```
ACCEPT

DECLINE
```

---

# 31. Response Model

Every API returns the standard HireStack response.

```
{
  success,
  message,
  data
}
```

Errors follow the shared error response format used across all modules.

---

# End of PRD – Part 2

This section finalizes the Offer entity, lifecycle, status management, versioning, approval workflow, and REST API design.

**Next:** **Part 3 – Business Rules, Validation, Transactions, Security, Search, Filtering, Pagination, Acceptance Criteria & Coding Notes**

---

# Part 3 – Business Rules, Validation, Transactions, Security & Acceptance Criteria

---

# 32. Business Rules

The Offers module enforces the following business rules to ensure data integrity and a consistent recruitment workflow.

---

## 32.1 Application Eligibility

An offer may only be created if:

- The application exists.
- The application belongs to the same company.
- The application is active.
- The application has successfully completed the interview process.
- The application has not already been hired.

Offers cannot be created for applications in the following states:

- REJECTED
- WITHDRAWN
- ARCHIVED
- HIRED

Return

```
409 Conflict
```

if an application is not eligible.

---

## 32.2 Active Offer Rule

Each application may contain multiple offer versions.

However,

**only one active offer** may exist at any time.

Active statuses include:

```
DRAFT
PENDING_APPROVAL
APPROVED
SENT
VIEWED
```

Attempting to create another active offer returns

```
409 Conflict
```

unless it is created as a revision.

---

## 32.3 Offer Revision Rules

A revision creates a completely new Offer record.

Previous versions:

- remain immutable
- remain searchable
- remain visible in history

The newest revision becomes the active version.

Previous active version is automatically superseded.

---

## 32.4 Draft Rules

Only Draft offers may be edited.

Editable fields:

- salary
- currency
- employmentType
- joiningDate
- expiryDate
- benefits
- notes
- offerLetterUrl
- offerLetterFileName

Once submitted for approval, editing is no longer permitted.

---

## 32.5 Approval Rules

Only Company Admin may approve offers.

Assigned Recruiters cannot approve.

Approval records:

- approvedBy
- approvedAt

Approving an already approved offer returns

```
409 Conflict
```

---

## 32.6 Send Rules

Only approved offers may be sent.

Sending records:

- sentAt

Sending changes status:

```
APPROVED

↓

SENT
```

---

## 32.7 Candidate Response Rules

Candidates may respond only to

```
SENT

or

VIEWED
```

Allowed responses:

- ACCEPT
- DECLINE

Responses automatically record

```
respondedAt
```

---

## 32.8 Accepted Offer Rules

Accepted offers become immutable.

No updates.

No withdrawal.

No revisions.

No deletion.

Hiring Pipeline becomes responsible for the next stage.

---

## 32.9 Declined Offer Rules

Declined offers become immutable.

Recruiters may create a new revision if business policy allows.

Original declined offer remains in history.

---

## 32.10 Expiry Rules

If

```
Current Date > expiryDate
```

Status automatically becomes

```
EXPIRED
```

Expired offers cannot be accepted.

---

## 32.11 Withdraw Rules

Only Company Admin may withdraw an offer.

Withdrawal records:

- updatedAt

Status becomes

```
WITHDRAWN
```

Withdrawn offers cannot be accepted.

---

# 33. Validation Rules

Validation is implemented using Zod.

---

## Required Fields

- applicationId
- salary
- currency
- employmentType
- joiningDate
- expiryDate

---

## Salary

Must be:

- positive
- greater than zero

---

## Joining Date

Must not be in the past.

---

## Expiry Date

Must be after today's date.

Must also be before joining date.

---

## Benefits

Optional

Maximum:

```
5000 characters
```

---

## Notes

Optional

Maximum:

```
3000 characters
```

Trim whitespace before validation.

---

## Offer Letter URL

Optional

Must be a valid URL if provided.

---

## Currency

Allowed values

```
INR
USD
EUR
GBP
AED
SGD
```

Future currencies may be added.

---

## Employment Type

```
FULL_TIME

PART_TIME

CONTRACT

INTERNSHIP

TEMPORARY
```

---

# 34. Search

Supported search fields

- Offer Code
- Candidate Name
- Candidate Code
- Job Title
- Recruiter Name

Case-insensitive.

---

# 35. Filtering

Support filters for:

- Status
- Currency
- Employment Type
- Recruiter
- Created Date
- Joining Date
- Expiry Date

Filters may be combined.

---

# 36. Sorting

Supported sorting

- Created Date
- Updated Date
- Salary
- Joining Date
- Expiry Date

Ascending

Descending

---

# 37. Pagination

Support

```
page

limit
```

Validation

```
page >= 1

limit >= 1
```

Maximum limit follows shared pagination configuration.

---

# 38. Transactions

The following operations must execute inside Prisma transactions.

- Create Offer
- Create Revision
- Approve Offer
- Send Offer
- Accept Offer
- Decline Offer
- Withdraw Offer
- Soft Delete

Transactions guarantee consistency.

---

# 39. Soft Delete

Offers are never permanently removed.

Use

```
deletedAt
```

Deleted offers:

- excluded from normal queries
- remain available for future audit functionality

---

# 40. Security

Every endpoint requires

JWT Authentication

Role-based Authorization

Company Isolation

Offer ownership validation

Soft Delete filtering

Least-Privilege Access

---

# 41. Error Handling

Standard HireStack responses.

Examples

```
400 Bad Request
```

Validation failure.

---

```
401 Unauthorized
```

Authentication failure.

---

```
403 Forbidden
```

Permission denied.

---

```
404 Not Found
```

Offer not found.

---

```
409 Conflict
```

Business rule violation.

Examples

- Active offer already exists
- Invalid approval
- Offer already accepted

---

```
422 Unprocessable Entity
```

Invalid lifecycle transition.

---

```
500 Internal Server Error
```

Unexpected failure.

---

# 42. Performance

Repository layer should

- use indexes
- paginate results
- avoid N+1 queries
- use reusable Prisma select objects

Future improvements

- Full-text search
- Caching
- Analytics

---

# 43. Future Compatibility

Designed for seamless integration with

- Hiring Pipeline
- Email Service
- Notifications
- Audit Logs
- Activity Timeline
- PDF Generation
- Employee Onboarding
- AI Salary Recommendation

No schema redesign should be required.

---

# 44. Acceptance Criteria

The Offers module is complete when:

- ✅ Offer creation works.
- ✅ Draft editing works.
- ✅ Approval workflow works.
- ✅ Offer sending works.
- ✅ Candidate acceptance works.
- ✅ Candidate decline works.
- ✅ Offer withdrawal works.
- ✅ Offer expiry works.
- ✅ Version history is maintained.
- ✅ One active offer per application is enforced.
- ✅ Company isolation is enforced.
- ✅ Role permissions are enforced.
- ✅ Validation is complete.
- ✅ Transactions protect critical operations.
- ✅ Search works.
- ✅ Filtering works.
- ✅ Sorting works.
- ✅ Pagination works.
- ✅ Soft delete works.
- ✅ Repository architecture is maintained.
- ✅ Standard API responses are returned.

---

# 45. Coding Notes

The implementation must follow the HireStack backend architecture.

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

Requirements:

- Controllers remain thin.
- Services contain business logic only.
- Repositories own all Prisma operations.
- Zod performs request validation.
- Transactions protect state-changing operations.
- Prisma queries remain inside repositories.
- Use shared response utilities.
- Use shared error handling.
- Use reusable validation helpers.
- Use reusable Prisma select objects.
- Maintain complete TypeScript typing.

---

# 46. Conclusion

The Offers module completes the employment offer lifecycle within HireStack Version 1.

It provides:

- Secure offer creation
- Approval workflow
- Version management
- Candidate response tracking
- Company isolation
- Transaction safety
- Enterprise-grade validation
- Future-ready architecture

The module is designed to integrate directly with the Hiring Pipeline module, enabling a smooth transition from candidate acceptance to the final hiring process.

---

# End of Module 12 – Offers

**Document Status:** ✅ Frozen

**Version:** 1.0

**Next Module:** **Hiring Pipeline**