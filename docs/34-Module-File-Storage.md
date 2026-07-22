# 34. File Storage Module Specification

---

# Module Information

| Property | Value |
|----------|-------|
| Module Name | File Storage |
| Folder | src/modules/storage |
| Priority | Critical |
| Depends On | Authentication, Users |
| Database Models | File, User |

---

# Module Purpose

The File Storage module is responsible for securely uploading, storing, retrieving, and deleting files across the HireStack platform.

It provides a unified storage abstraction so the application can work with different storage providers without changing business logic.

Initially the system should support Local Storage for development and Cloudinary for production. The architecture must allow future migration to AWS S3, Azure Blob Storage, or Google Cloud Storage with minimal changes.

Files managed by this module include:

- Resume PDFs
- Profile Pictures
- Company Logos
- Company Cover Images
- Certificates
- Attachments (Future)
- Offer Letters (Future)
- Interview Documents (Future)

---

# Responsibilities

The Storage module is responsible for:

- Upload Files
- Retrieve Files
- Download Files
- Delete Files
- Update Files
- Validate Uploads
- File Metadata
- Storage Provider Abstraction
- File Access Control
- Temporary URLs
- Image Optimization (Future)
- Virus Scan Integration (Future)

---

# Folder Structure

```text
src/
└── modules/
    └── storage/
        ├── storage.controller.ts
        ├── storage.service.ts
        ├── storage.repository.ts
        ├── storage.routes.ts
        ├── storage.validation.ts
        ├── storage.types.ts
        ├── storage.constants.ts
        ├── providers/
        │      ├── local.provider.ts
        │      ├── cloudinary.provider.ts
        │      ├── s3.provider.ts
        │      └── provider.interface.ts
        └── index.ts
```

---

# File Responsibilities

## storage.controller.ts

Responsibilities

- Handle uploads
- Handle downloads
- Validate requests
- Return API responses

Must NOT

- Contain upload logic
- Access Prisma directly

---

## storage.service.ts

Responsibilities

- Upload files
- Delete files
- Generate URLs
- Provider selection
- Access validation
- Metadata generation

---

## storage.repository.ts

Responsibilities

- Store metadata
- Retrieve metadata
- Delete metadata

Only Prisma operations.

---

## storage.validation.ts

Contains

Zod Schemas

- Upload File
- Delete File

---

## storage.routes.ts

Contains

Express Routes

---

## storage.types.ts

Contains

Interfaces

Enums

DTOs

Provider Contracts

---

## storage.constants.ts

Contains

Allowed MIME Types

Maximum File Sizes

Storage Providers

Folder Names

---

# Database Models Used

Primary

File

Related

User

Resume

Company

Application

---

# File Metadata

Each file stores

- File ID
- Original Name
- Storage Name
- Extension
- MIME Type
- Size
- Storage Provider
- Folder
- Public URL
- Owner
- Uploaded Date
- Updated Date

---

# Supported File Types

Documents

- PDF

Images

- JPG
- JPEG
- PNG
- WEBP

Future

- DOCX
- PPTX
- XLSX

---

# Maximum Upload Sizes

Resume PDF

10 MB

Profile Image

5 MB

Company Logo

5 MB

Company Banner

10 MB

Future Attachments

25 MB

---

# Storage Providers

Development

Local Storage

Production

Cloudinary

Future

AWS S3

Azure Blob Storage

Google Cloud Storage

---

# Upload Flow

Client

↓

Authentication

↓

Validation

↓

Multer Upload

↓

Storage Provider

↓

Metadata Saved

↓

Return File URL

---

# API Endpoints

## POST

/storage/upload

Purpose

Upload File

Authentication

Required

---

## GET

/storage/:id

Purpose

Retrieve File Metadata

---

## GET

/storage/:id/download

Purpose

Download File

---

## DELETE

/storage/:id

Purpose

Delete File

---

## GET

/storage/me

Purpose

Retrieve My Files

---

# Validation Rules

Validate

- MIME Type
- File Size
- File Extension
- Ownership

Reject

- Empty Files
- Executables
- Unknown MIME Types

---

# Business Rules

Users may only access their own private files.

Company logos may be publicly accessible.

Resume files require authentication.

Deleting a resource should optionally remove associated files.

Metadata should always remain synchronized with storage.

Soft delete metadata before permanent removal.

---

# Security Requirements

Validate every upload.

Sanitize filenames.

Generate unique filenames.

Never trust client MIME types.

Prevent directory traversal attacks.

Store secrets in environment variables.

Support signed URLs for private files.

Future virus scanning support.

---

# Error Handling

400

Invalid File

401

Unauthorized

403

Forbidden

404

File Not Found

413

File Too Large

415

Unsupported Media Type

500

Storage Error

---

# Dependencies

Authentication Middleware

Multer

Prisma

Zod

Cloudinary SDK

Node File System

Shared Error Handler

Shared Response Formatter

---

# Future Enhancements

Image Compression

Image Cropping

Thumbnail Generation

Virus Scanning

CDN Integration

Chunk Upload

Resumable Upload

Encrypted Storage

File Versioning

Signed Download URLs

Automatic Cleanup

Storage Analytics

Multi-Cloud Storage

---

# Coding Notes for AI Agent

Before implementation, read:

- 10-System-Architecture.md
- 12-Database-Schema-Specification.md
- 13-API-Standards.md
- 15-Backend-Folder-Architecture.md
- 17-Security-Specification.md
- 18-Coding-Standards-Git-Workflow.md

Implementation Rules

- Follow Controller → Service → Repository architecture.
- Abstract storage providers behind a common interface.
- Repository only manages metadata.
- Services handle upload logic.
- Support Local Storage and Cloudinary initially.
- Validate every upload.
- Generate unique filenames.
- Return standardized API responses.
- Generate production-ready code only.

---