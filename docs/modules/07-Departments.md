# PRD 41 — Departments Module

**Project:** HireStack  
**Module:** Departments  
**Version:** 1.1  
**Status:** Final  
**Priority:** High  
**Owner:** Backend Team

---

# 1. Overview

The Departments module provides the organizational structure for every company within HireStack.

Departments allow organizations to group recruiters and jobs into logical business units such as Engineering, Human Resources, Finance, Sales, Marketing, Operations, Customer Success, and others.

Each company maintains complete ownership of its own departments. Departments are fully tenant-isolated and cannot be accessed by users outside their company unless they are Super Administrators.

The Departments module acts as the organizational foundation for the Recruiters and Jobs modules.

Without departments, recruiters and jobs cannot be properly organized.

---

# 2. Objectives

The Departments module shall:

- Allow every company to create unlimited departments.
- Organize recruiters into departments.
- Organize jobs into departments.
- Prevent duplicate department names inside a company.
- Allow different companies to use identical department names.
- Support searching.
- Support filtering.
- Support pagination.
- Support sorting.
- Support activation/deactivation.
- Support soft deletion.
- Support restoration.
- Maintain complete tenant isolation.

---

# 3. Scope

## In Scope

The module is responsible for:

- Department CRUD
- Search
- Filtering
- Pagination
- Sorting
- Activation
- Deactivation
- Soft Delete
- Restore
- Validation
- Authorization
- Company Isolation

---

## Out of Scope

The following are NOT included in Version 1.

- Department hierarchy
- Parent departments
- Child departments
- Department managers
- Department budget
- Department analytics
- Department KPIs
- Team management
- Internal messaging
- Recruiter assignment logic
- Job assignment logic
- Approval workflows

These features may be introduced in Version 2 or later.

---

# 4. Dependencies

The Departments module depends on:

- Shared Module
- Middleware Module
- Authentication Module
- Users Module
- Companies Module

---

# 5. Modules Depending on Departments

The following future modules require Departments.

- Recruiters
- Jobs
- Applications
- Interviews
- Reports
- Analytics

Departments must therefore be completed before Recruiters and Jobs.

---

# 6. User Roles

## Super Admin

The Super Admin has unrestricted access across every company.

Permissions:

- Create Department
- View Department
- Update Department
- Activate Department
- Deactivate Department
- Delete Department
- Restore Department

Across all tenants.

---

## Company Admin

Company Admins manage departments only inside their own company.

Permissions:

- Create Department
- View Department
- Update Department
- Activate Department
- Deactivate Department
- Delete Department
- Restore Department

Company Admins cannot access departments belonging to other companies.

---

## Recruiter

Recruiters have read-only access.

Permissions:

- View Departments
- Search Departments

Recruiters cannot:

- Create
- Edit
- Delete
- Restore
- Activate
- Deactivate

---

# 7. Department Lifecycle

A department follows the lifecycle below.

ACTIVE

↓

INACTIVE

↓

SOFT DELETED

↓

RESTORED

A deleted department is never permanently removed from the database.

---

# 8. Functional Requirements

## 8.1 Create Department

Authorized users can create new departments.

Required field

- Name

Optional field

- Description

The system shall automatically:

- Associate the department with the creator's company.
- Mark the department as Active.
- Record timestamps.
- Record audit events.

---

## 8.2 View Department

Authorized users can retrieve:

- A single department
- A paginated list of departments

Recruiters have read-only access.

---

## 8.3 Update Department

Editable fields

- Name
- Description

The following fields cannot be modified.

- Company
- Created Date
- Created By

---

## 8.4 Activate Department

An inactive department may be activated.

Once activated:

- Recruiters may again be assigned.
- Jobs may again be assigned.

---

## 8.5 Deactivate Department

An active department may be deactivated.

A deactivated department:

- Remains visible.
- Cannot receive new recruiters.
- Cannot receive new jobs.
- Existing recruiter assignments remain unchanged.
- Existing job assignments remain unchanged.

---

## 8.6 Delete Department

Departments use soft deletion.

The system shall never permanently delete department records.

Deletion is allowed only when:

- No active recruiters belong to the department.
- No active jobs belong to the department.

If dependencies exist, deletion must fail.

The client shall first reassign recruiters and jobs.

---

## 8.7 Restore Department

A deleted department may be restored.

Restoration succeeds only if:

- The company still exists.
- No department with the same name already exists within the company.

Otherwise, the request returns Conflict (409).

---

# 9. Validation Rules

## Name

Required.

Validation:

- Trim whitespace.
- Minimum length: 2 characters.
- Maximum length: 100 characters.
- Case-insensitive uniqueness within the same company.

Examples

Valid

Engineering

Human Resources

Finance

Invalid

""

"A"

Engineering

engineering

ENGINEERING

(duplicate within same company)

---

## Description

Optional.

Maximum length:

500 characters.

Leading and trailing whitespace shall be trimmed.

---

# 10. Business Rules

## Rule 1

A company may create unlimited departments.

---

## Rule 2

Department names are unique only inside a company.

Example

Company A

Engineering

HR

Finance

Company B

Engineering

HR

Finance

This is allowed.

---

## Rule 3

Duplicate names inside one company are prohibited.

Engineering

engineering

ENGINEERING

All represent the same department.

---

## Rule 4

Departments are tenant isolated.

Users may never access departments from another company.

Exception:

Super Admin.

---

## Rule 5

Soft deletion is mandatory.

Departments remain stored permanently for:

- Historical reports
- Audit logs
- Future analytics

---

## Rule 6

Inactive departments cannot receive:

- New recruiters
- New jobs

Existing assignments remain unchanged.

---

## Rule 7

A recruiter must belong to exactly one department.

A department may contain zero or more recruiters.

---

## Rule 8

A job must belong to exactly one department.

A department may contain zero or more jobs.

---

## Rule 9

Departments cannot be deleted while active recruiters or active jobs are assigned.

Recruiters and jobs must first be reassigned to another department.

---

# 11. Permission Matrix

| Operation | Super Admin | Company Admin | Recruiter |
|------------|-------------|---------------|-----------|
| Create | ✅ | ✅ | ❌ |
| View | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ❌ |
| Activate | ✅ | ✅ | ❌ |
| Deactivate | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ |
| Restore | ✅ | ✅ | ❌ |

---
# 12. API Endpoints

The Departments module follows the standard REST API conventions used throughout HireStack.

---

## 12.1 Create Department

POST /departments

### Authorization

- Super Admin
- Company Admin

### Request

```json
{
  "name": "Engineering",
  "description": "Software engineering department"
}
```

### Success Response

201 Created

```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": "...",
    "name": "Engineering"
  }
}
```

---

## 12.2 List Departments

GET /departments

### Authorization

- Super Admin
- Company Admin
- Recruiter

### Query Parameters

page

limit

search

status

sortBy

sortOrder

---

## 12.3 Get Department

GET /departments/:id

### Authorization

- Super Admin
- Company Admin
- Recruiter

---

## 12.4 Update Department

PATCH /departments/:id

### Authorization

- Super Admin
- Company Admin

Editable fields

- name
- description

---

## 12.5 Change Department Status

PATCH /departments/:id/status

### Authorization

- Super Admin
- Company Admin

Request

```json
{
    "isActive": false
}
```

---

## 12.6 Delete Department

DELETE /departments/:id

### Authorization

- Super Admin
- Company Admin

Soft delete only.

---

## 12.7 Restore Department

PATCH /departments/:id/restore

### Authorization

- Super Admin
- Company Admin

---

# 13. Search

Search shall support

- Department Name
- Description

Search is

- Case insensitive
- Partial match
- Trim whitespace

Examples

Engineering

Engineer

engine

All return Engineering.

---

# 14. Filtering

Supported filters

Status

```text
ACTIVE

INACTIVE
```

Deleted

```text
true

false
```

Company

Available only for Super Admin.

---

# 15. Sorting

Supported sort fields

- Name
- Created Date
- Updated Date

Supported order

ASC

DESC

Default

Created Date DESC

---

# 16. Pagination

Every list endpoint must support pagination.

Parameters

page

limit

Defaults

page = 1

limit = 10

Maximum

limit = 100

Pagination response

```json
{
  "page": 1,
  "limit": 10,
  "total": 50,
  "totalPages": 5
}
```

---

# 17. Database Design

## Prisma Model

```prisma
model Department {
  id          String    @id @default(cuid())
  companyId   String
  name        String
  description String?
  isActive    Boolean   @default(true)
  deletedAt   DateTime?

  company      Company   @relation(fields: [companyId], references: [id])
  recruiters   User[]
  jobs         Job[]

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@unique([companyId, name])
  @@index([companyId])
  @@index([isActive])
}
```

---

## Relationships

Company

1

↓

Many

Departments

Department

1

↓

Many

Recruiters

Department

1

↓

Many

Jobs

---

# 18. Validation

Name

Required

2–100 characters

Trim whitespace

Case-insensitive unique

Description

Optional

Maximum 500 characters

Trim whitespace

---

# 19. Error Handling

## 400 Bad Request

Validation failure

Invalid request body

---

## 401 Unauthorized

Authentication required

---

## 403 Forbidden

Insufficient permissions

---

## 404 Not Found

Department not found

---

## 409 Conflict

Duplicate department name

Department already exists

Restore conflict

---

## 422 Unprocessable Entity

Department contains active recruiters

Department contains active jobs

Inactive department assignment

Business rule violation

---

## 500 Internal Server Error

Unexpected server error

---

# 20. Security Requirements

The module shall enforce

- Authentication
- Authorization
- Tenant Isolation
- Input Validation
- Soft Delete Enforcement

Prisma shall be used for all database operations.

Raw SQL is prohibited.

Every endpoint must validate user permissions before database access.

Company Admins may never access another company's departments.

Recruiters have read-only access.

---

# 21. Performance Requirements

The module shall

- Use indexed queries.
- Use pagination on all list endpoints.
- Avoid N+1 queries.
- Use Prisma select statements.
- Minimize unnecessary joins.

The module must scale to thousands of departments per company.

---

# 22. Audit Logging

The following actions shall generate audit events.

- Department Created
- Department Updated
- Department Activated
- Department Deactivated
- Department Deleted
- Department Restored

Future modules will also log

- Recruiter Assigned
- Recruiter Reassigned
- Job Assigned
- Job Reassigned

---
# 23. Edge Cases

The system shall correctly handle the following scenarios.

---

## Duplicate Department Name

A department name must be unique within the same company.

Examples

Engineering

engineering

ENGINEERING

All are considered duplicates.

Result:

409 Conflict

---

## Duplicate Department Across Different Companies

Company A

Engineering

Company B

Engineering

Result:

Allowed.

---

## Restore Name Conflict

Scenario

Department "Engineering" is deleted.

A new department named "Engineering" is created.

Attempt to restore the deleted department.

Result

409 Conflict

---

## Delete Department With Active Recruiters

Scenario

Engineering Department

↓

Recruiter A

Recruiter B

Attempt to delete Engineering.

Result

422 Unprocessable Entity

The recruiters must first be reassigned.

---

## Delete Department With Active Jobs

Scenario

Engineering

↓

Backend Developer

↓

Frontend Developer

Attempt to delete Engineering.

Result

422 Unprocessable Entity

Jobs must first be reassigned.

---

## Assign Recruiter To Inactive Department

Scenario

Department

Status = INACTIVE

Attempt to assign recruiter.

Result

Rejected.

---

## Create Job In Inactive Department

Scenario

Department

Status = INACTIVE

Attempt to create job.

Result

Rejected.

---

## Cross Company Access

Company A Admin

Attempts to access

Company B Department

Result

403 Forbidden

---

## Invalid Pagination

Examples

page = -1

limit = -50

Result

400 Bad Request

---

## Empty Search Result

Search

"Nuclear Engineering"

No departments found.

Result

200 OK

Empty data array returned.

---

# 24. Testing Requirements

The module must include automated tests covering:

## Unit Tests

- Validation
- Service layer
- Repository layer

---

## Integration Tests

- Create department
- Update department
- Search
- Pagination
- Filtering
- Delete
- Restore
- Authorization
- Company isolation

---

## Negative Tests

- Duplicate names
- Invalid IDs
- Unauthorized users
- Forbidden operations
- Delete with active recruiters
- Delete with active jobs
- Restore conflicts
- Validation failures

---

# 25. Acceptance Criteria

The Departments module shall be considered complete only if all of the following are satisfied.

## Functional

✓ Department can be created.

✓ Department can be viewed.

✓ Department can be updated.

✓ Department can be activated.

✓ Department can be deactivated.

✓ Department can be soft deleted.

✓ Department can be restored.

✓ Search works.

✓ Filtering works.

✓ Pagination works.

✓ Sorting works.

---

## Validation

✓ Name validation enforced.

✓ Duplicate detection enforced.

✓ Description validation enforced.

✓ Trim whitespace.

✓ Case-insensitive uniqueness.

---

## Security

✓ Authentication enforced.

✓ Authorization enforced.

✓ Company isolation enforced.

✓ Recruiters cannot modify departments.

✓ Company Admin cannot access another company's departments.

---

## Business Rules

✓ Unlimited departments.

✓ Soft delete only.

✓ Restore works.

✓ Delete prevented when active recruiters exist.

✓ Delete prevented when active jobs exist.

✓ Inactive departments reject new assignments.

---

## Performance

✓ Indexed queries.

✓ Pagination mandatory.

✓ No N+1 queries.

✓ Optimized Prisma selects.

---

## Quality

✓ Passes TypeScript compilation.

✓ Passes ESLint.

✓ Passes Build.

✓ Production review completed.

✓ Production polish completed.

---

# 26. Non-Functional Requirements

The Departments module shall be:

- Scalable
- Maintainable
- Extensible
- Secure
- Testable
- Production-ready

Implementation shall follow:

- Repository Pattern
- Service Layer Pattern
- Thin Controllers
- Zod Validation
- Shared Response Utilities
- Shared Error Handling
- Existing Project Standards

---

# 27. Future Compatibility

The module is designed to support future functionality without schema redesign.

Future modules include:

- Recruiters
- Jobs
- Applications
- Interviews
- Reports
- Analytics
- Hiring Dashboards
- Department Metrics
- AI Hiring Insights
- Workforce Planning

No breaking database changes should be required.

---

# 28. Implementation Guidelines

The implementation must:

- Follow all existing architecture documents.
- Reuse shared middleware and utilities.
- Reuse existing pagination helpers.
- Reuse response helpers.
- Reuse validation patterns.
- Keep controllers thin.
- Keep business logic inside services.
- Keep repositories database-only.
- Use Prisma transactions where appropriate.
- Use centralized constants and types.
- Follow the same coding conventions as Shared, Users, and Companies modules.

No architectural deviations are permitted unless explicitly approved.

---

# 29. Definition of Done

The Departments module is complete only when:

- All PRD requirements are implemented.
- All business rules are enforced.
- All validations pass.
- All permissions are enforced.
- Company isolation is verified.
- Audit logging is implemented.
- API documentation is complete.
- TypeScript compilation succeeds.
- ESLint reports zero errors.
- Production build succeeds.
- Code review is completed.
- Production polish is completed.
- The module is merged into the main branch.

---

# End of PRD

Version: 1.1

Status: FINAL

Approved For Implementation