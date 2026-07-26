# Security Specification

Project: HireStack

Version: 1.0

Status: Final

Document ID: SEC-001

---

# Purpose

This document defines the security standards followed throughout HireStack.

Security is considered at every layer of the application.

---

# Authentication

JWT Access Tokens

JWT Refresh Tokens

bcrypt Password Hashing

Password Reset Tokens

Role-Based Authorization

---

# Password Policy

Minimum Length

8 Characters

Required

Uppercase Letter

Lowercase Letter

Number

Special Character

Passwords stored only as bcrypt hashes.

---

# Authorization

Every protected endpoint verifies

User Exists

User Active

Role Allowed

Permission Granted

---

# API Security

Helmet

Rate Limiting

CORS

Input Validation

Request Size Limits

HTTP Security Headers

---

# File Upload Security

Allowed Formats

PDF

DOCX

Maximum Size

5 MB

Virus Scan (Future)

Store Outside Application Server

Cloudinary Storage

---

# Environment Variables

Secrets never committed to Git.

Environment Variables

DATABASE_URL

JWT_ACCESS_SECRET

JWT_REFRESH_SECRET

CLOUDINARY_URL

EMAIL_USER

EMAIL_PASSWORD

---

# Database Security

Parameterized Queries (Prisma)

Foreign Keys

Unique Constraints

Transactions

Soft Deletes (where applicable)

---

# Logging

Log

Successful Login

Failed Login

Password Reset

Job Creation

Application Submission

Role Changes

Do Not Log

Passwords

JWT Tokens

Refresh Tokens

Personal Documents

---

# Error Handling

Production

Generic Error Messages

Development

Detailed Stack Trace

---

# Rate Limiting

Authentication APIs

5 Requests / Minute

General APIs

100 Requests / 15 Minutes

---

# CORS Policy

Allow

Frontend Domain

Development Domain

Reject Unknown Origins

---

# HTTPS

Production

HTTPS Only

Secure Cookies

Future HSTS Support

---

# Security Headers

Helmet Enabled

XSS Protection

Frame Guard

Content Security Policy (Future)

---

# Future Security

Google OAuth

GitHub OAuth

MFA

Session Monitoring

Audit Dashboard

Account Lockout

Device Tracking

---

End of Document