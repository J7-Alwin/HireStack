# Authentication & Authorization Flow

Project: HireStack

Version: 1.0

Status: Final

Document ID: AUTH-001

---

# Purpose

This document defines how authentication, authorization, session management, and user access control work within HireStack.

The objective is to ensure the application remains secure while providing a seamless user experience.

---

# Authentication Method

Authentication Type

JWT (JSON Web Token)

Session Type

Stateless Authentication

Password Hashing

bcrypt

Access Token

Short-lived

Refresh Token

Long-lived

---

# Authentication Workflow

Candidate Login

Email + Password

↓

Backend Validation

↓

Password Verification (bcrypt)

↓

Generate Access Token

↓

Generate Refresh Token

↓

Store Refresh Token in Database

↓

Return Tokens

↓

Frontend Stores Tokens

↓

Authenticated Session Begins

---

# Token Strategy

Access Token

Purpose

Authorize API requests

Validity

15 Minutes

Storage

Memory (Preferred) or Secure Cookie

Contains

- User ID
- Role
- Company ID (if recruiter)
- Token Version

---

Refresh Token

Purpose

Generate new Access Tokens

Validity

7 Days

Stored In

Database (hashed)

Revocable

Yes

Rotated

Every refresh request

---

# Logout Flow

User clicks Logout

↓

Refresh Token deleted/revoked

↓

Frontend clears Access Token

↓

User redirected to Login

---

# Forgot Password Flow

User enters Email

↓

Generate Secure Random Token

↓

Store Hashed Token

↓

Email Reset Link

↓

User Sets New Password

↓

Invalidate Reset Token

↓

Require Login Again

---

# Authorization (Role-Based Access Control)

Roles

- Platform Admin
- Recruiter
- Candidate

Each protected endpoint verifies:

1. Valid JWT
2. User exists
3. User is active
4. User has required role

---

# Permission Matrix

| Action | Admin | Recruiter | Candidate |
|----------|:----:|:---------:|:---------:|
| Login | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ |
| Manage Companies | ✅ | ❌ | ❌ |
| Manage Recruiters | ✅ | ❌ | ❌ |
| Create Jobs | ❌ | ✅ | ❌ |
| Edit Jobs | ❌ | ✅ | ❌ |
| Publish Jobs | ❌ | ✅ | ❌ |
| View Applicants | ✅ | ✅ | ❌ |
| Apply Jobs | ❌ | ❌ | ✅ |
| Upload Resume | ❌ | ❌ | ✅ |

---

# Middleware Flow

Incoming Request

↓

JWT Middleware

↓

Verify Token

↓

Extract User

↓

Role Middleware

↓

Permission Check

↓

Controller

↓

Business Logic

↓

Database

↓

Response

---

# Security Rules

Passwords are never stored.

Tokens are signed using environment secrets.

Refresh Tokens are hashed before storage.

Inactive users cannot login.

Revoked Refresh Tokens become invalid immediately.

---

# Failure Responses

401 Unauthorized

- Invalid Token
- Missing Token
- Expired Token

403 Forbidden

- Valid Login
- Insufficient Permissions

---

# Future Improvements

- Multi-Factor Authentication (MFA)
- Google Login
- GitHub Login
- Microsoft Login
- Organization SSO

---

End of Document