# System Architecture

Project: HireStack

Version: 1.0

Status: Final

Document ID: ARCH-001

---

# Overview

HireStack follows a modern three-tier architecture designed for scalability, maintainability, and security.

The architecture separates the application into independent layers, allowing each layer to evolve without affecting others.

---

# Architecture Layers

┌──────────────────────────────┐
│        Frontend (React)       │
└──────────────┬───────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────┐
│      Express REST API         │
└──────────────┬───────────────┘
               │
     Authentication Middleware
               │
               ▼
┌──────────────────────────────┐
│     Business Logic Layer      │
│        (Services)             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Prisma ORM Layer         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PostgreSQL Database (Neon)    │
└──────────────────────────────┘

---

# Frontend Responsibilities

The frontend is responsible for:

- Authentication
- Routing
- UI Rendering
- Form Validation
- API Communication
- State Management
- Dashboard Rendering

Technologies

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Zustand
- React Hook Form
- Zod

---

# Backend Responsibilities

The backend handles:

- Authentication
- Authorization
- Business Logic
- Database Operations
- Email Services
- File Uploads
- Validation
- Logging

Technologies

- Node.js
- Express
- TypeScript
- Prisma

---

# Database Layer

Responsibilities

- Store Users
- Companies
- Jobs
- Applications
- Resumes
- Audit Logs

Database

PostgreSQL

Hosted on Neon.

---

# External Services

Cloudinary

Purpose

Resume Storage

---

Nodemailer

Purpose

Emails

- Welcome Email
- Password Reset
- Verification

---

Deployment

Frontend

Vercel

Backend

Render

Database

Neon PostgreSQL

Storage

Cloudinary

---

# Design Principles

The architecture follows:

✓ Separation of Concerns

✓ Feature-Based Development

✓ Modular Design

✓ RESTful APIs

✓ Stateless Authentication

✓ Scalability

✓ Security First

---

# Future Extensions

Future architecture additions include:

Redis

Socket.IO

Docker

CI/CD

AWS

Queue Processing

Microservices (Optional)

---

End of Document