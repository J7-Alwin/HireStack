# Coding Standards & Git Workflow

Project: HireStack

Version: 1.0

Status: Final

Document ID: DEV-001

---

# Purpose

This document defines coding conventions, naming standards, project organization, and Git workflow for HireStack.

The goal is to maintain a clean, consistent, and maintainable codebase.

---

# General Principles

- Write readable code over clever code.
- Prefer simplicity.
- Avoid duplication (DRY).
- Keep functions small and focused.
- Separate business logic from controllers.
- Use TypeScript types wherever possible.
- Never commit commented-out code.

---

# Naming Conventions

## Variables

camelCase

Example

```
userProfile
jobApplication
```

---

## Functions

camelCase

```
createJob()
updateApplicationStatus()
```

---

## Components

PascalCase

```
LoginForm.tsx
JobCard.tsx
CandidateDashboard.tsx
```

---

## Interfaces

Prefix with "I"

```
IUser
IJob
```

---

## Enums

PascalCase

```
UserRole
ApplicationStatus
```

---

## Constants

UPPER_SNAKE_CASE

```
MAX_FILE_SIZE
DEFAULT_PAGE_SIZE
```

---

## Files

Use kebab-case or feature naming consistently.

Examples

```
auth.service.ts
job.controller.ts
application.routes.ts
```

---

# Folder Rules

One responsibility per folder.

No deeply nested folders.

Shared utilities belong in `/shared`.

---

# Error Handling

Always throw custom application errors.

Never expose stack traces to users.

Log errors using Winston.

---

# API Rules

Always return standardized responses.

Use proper HTTP status codes.

Validate all incoming requests.

---

# Git Branch Strategy

main

Production-ready code.

develop

Integration branch.

feature/<feature-name>

New features.

bugfix/<bug-name>

Bug fixes.

hotfix/<issue>

Critical production fixes.

---

# Commit Message Format

Use Conventional Commits.

Examples

```
feat(auth): implement JWT login

fix(jobs): resolve pagination issue

refactor(users): simplify profile update logic

docs(api): add authentication endpoints

test(applications): add unit tests
```

---

# Pull Request Checklist

- Code builds successfully.
- Lint passes.
- Tests pass.
- Documentation updated.
- No unnecessary files.
- Reviewer approval.

---

# Code Review Checklist

- Readability
- Performance
- Security
- Naming
- Error Handling
- Logging
- Documentation

---

# Future Standards

- Husky Git Hooks
- CommitLint
- Semantic Versioning
- Automated Releases

---

End of Document