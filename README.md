<div align="center">

# HireStack

### Modern Recruitment & Hiring Management Platform

A scalable, secure, and modular recruitment management platform built with **Node.js**, **Express.js**, and **MongoDB**, designed to streamline the complete hiring lifecycle—from company onboarding to candidate recruitment, interviews, offers, and hiring.

---

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-v1.0.0-success?style=for-the-badge)

</div>

---

# Table of Contents

- [Overview](#overview)
- [Why HireStack](#why-hirestack)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Modules](#modules)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

# Overview

HireStack is a modern Recruitment Management System (RMS) developed to simplify and automate the complete hiring process for organizations.

The platform provides secure authentication, recruiter management, company management, candidate tracking, job posting, interview scheduling, offer management, notifications, and audit logging through a modular REST API architecture.

The project follows industry-standard software engineering practices including:

- Layered Architecture
- Modular Design
- RESTful API Development
- JWT Authentication
- Role-Based Access Control (RBAC)
- MongoDB Data Modeling
- Clean Folder Structure
- Secure Password Management
- API Versioning
- Production-Ready Backend Practices

---

# Why HireStack?

Modern recruitment involves multiple stakeholders, complex workflows, and large volumes of candidate data. HireStack centralizes these processes into a secure, scalable platform that improves efficiency while maintaining a clean separation of responsibilities.

The platform is designed with extensibility in mind, allowing future enhancements such as AI-powered resume parsing, analytics dashboards, and third-party integrations without major architectural changes.

---

# Core Features

## Authentication & Security

- Secure JWT Authentication
- Refresh Token Support
- Role-Based Access Control
- Password Encryption using bcrypt
- Password History Enforcement
- Password Expiry Policies
- Login Attempt Limiting
- Session Management

---

## Recruitment Management

- Company Management
- Department Management
- Recruiter Management
- Candidate Management
- Job Posting
- Job Applications
- Interview Scheduling
- Offer Management
- Hiring Pipeline
- Recruitment Dashboard

---

## Administration

- Administrative Dashboard
- User Management
- Audit Logs
- Email Notifications
- File Storage
- Activity Monitoring
- System Configuration

---

# Feature Matrix

| Module | Status |
|---------|:------:|
| Authentication | ✅ |
| Users | ✅ |
| Companies | ✅ |
| Departments | ✅ |
| Recruiters | ✅ |
| Candidates | ✅ |
| Jobs | ✅ |
| Applications | ✅ |
| Interview Management | ✅ |
| Offers | ✅ |
| Hiring Pipeline | ✅ |
| Notifications | ✅ |
| Dashboard | ✅ |
| Audit Logs | ✅ |
| File Storage | ✅ |
| Email Services | ✅ |

---

# Technology Stack

## Backend

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript Runtime |
| Express.js | REST API Framework |
| MongoDB | NoSQL Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password Security |
| Multer | File Uploads |
| Nodemailer | Email Service |

---

## Development Tools

| Tool | Usage |
|------|------|
| Git | Version Control |
| GitHub | Source Code Hosting |
| Postman | API Testing |
| VS Code | Development |
| ESLint | Code Quality |
| Prettier | Code Formatting |
| Nodemon | Development Server |

---

# Design Principles

HireStack has been built following modern backend engineering principles.

- Modular Architecture
- Separation of Concerns
- REST API Best Practices
- Scalable Folder Structure
- Secure Authentication
- Maintainable Codebase
- Reusable Components
- Extensible Business Logic
- Production-Oriented Development

---

# Highlights

- Modular Backend Architecture
- Enterprise-Ready Authentication
- RESTful API Design
- Secure Password Policies
- Centralized Error Handling
- Request Validation
- Activity Logging
- Clean Code Standards
- Future AI Integration Ready
- Easy Deployment
- Comprehensive Documentation
---

# System Architecture

HireStack follows a layered, modular architecture that separates responsibilities into clearly defined components. This approach improves maintainability, scalability, and testability while supporting future feature expansion.

```
                    +---------------------------+
                    |       Client Apps         |
                    | Web • Mobile • Postman    |
                    +------------+--------------+
                                 |
                                 v
                    +---------------------------+
                    |      Express REST API     |
                    +------------+--------------+
                                 |
         +-----------------------+-----------------------+
         |                       |                       |
         v                       v                       v
+----------------+      +----------------+      +----------------+
| Authentication |      | Business Logic |      |  File Uploads  |
| Authorization  |      | Controllers    |      | Notifications  |
+----------------+      +----------------+      +----------------+
         |                       |                       |
         +-----------+-----------+-----------------------+
                     |
                     v
             +--------------------+
             | Service Layer      |
             | Validation         |
             | Utilities          |
             +---------+----------+
                       |
                       v
              +-------------------+
              | MongoDB Database  |
              | (Mongoose ODM)    |
              +-------------------+
```

---

# Project Structure

```
HireStack/
│
├── .github/
│
├── docs/
│   ├── architecture/
│   ├── development/
│   ├── design/
│   ├── modules/
│   ├── project/
│   └── releases/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   └── app.js
│
├── tests/
│
├── uploads/
│
├── package.json
├── README.md
└── LICENSE
```

---

# Backend Layers

| Layer | Responsibility |
|--------|----------------|
| Routes | Define API endpoints |
| Controllers | Handle HTTP requests and responses |
| Services | Business logic |
| Repositories | Database interactions |
| Models | MongoDB schemas |
| Middleware | Authentication, validation, logging |
| Utilities | Shared helper functions |
| Validators | Request validation |
| Config | Application configuration |

---

# Business Modules

## Authentication

- Login
- Logout
- Refresh Tokens
- Password Change
- Password Reset
- Password Expiry
- Session Management

---

## User Management

- User Profiles
- User Roles
- Permissions
- Account Status
- User Activity

---

## Company Management

- Company Registration
- Company Details
- Company Status
- Recruiter Assignment

---

## Department Management

- Department Creation
- Department Updates
- Department Assignment

---

## Recruiter Management

- Recruiter Accounts
- Profile Management
- Job Assignment
- Recruiter Status

---

## Candidate Management

- Candidate Profiles
- Resume Management
- Candidate Status
- Candidate History

---

## Job Management

- Job Creation
- Job Publishing
- Job Updates
- Job Closing
- Job Search

---

## Application Management

- Candidate Applications
- Application Tracking
- Application Status
- Resume Review

---

## Interview Management

- Interview Scheduling
- Interview Stages
- Interview Feedback
- Interview Results

---

## Offer Management

- Offer Creation
- Offer Approval
- Offer Acceptance
- Offer Rejection

---

## Hiring Pipeline

- Candidate Progress
- Hiring Stages
- Pipeline Monitoring
- Recruitment Workflow

---

## Notification System

- Email Notifications
- System Notifications
- Event Triggers
- Status Updates

---

## Dashboard

- Recruitment Metrics
- Hiring Statistics
- Activity Overview
- Performance Indicators

---

## Audit Logs

- Login History
- User Actions
- Administrative Changes
- Security Events

---

## File Storage

- Resume Uploads
- Candidate Documents
- Company Files
- File Validation

---

# API Design Principles

HireStack follows REST architectural principles for consistency and maintainability.

### API Standards

- RESTful Endpoints
- JSON Request/Response
- Standard HTTP Status Codes
- JWT Authentication
- Consistent Error Responses
- Input Validation
- Pagination Support
- Filtering Support
- Sorting Support

---

# Request Lifecycle

```
Client
   │
   ▼
Routes
   │
   ▼
Authentication Middleware
   │
   ▼
Validation Middleware
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
MongoDB
   │
   ▼
Response
```

---

# Documentation

The project includes comprehensive documentation for every major component.

| Documentation | Description |
|---------------|-------------|
| Project | Business requirements and planning |
| Architecture | Technical architecture and design |
| Modules | Detailed module specifications |
| Development | Setup, testing, coding standards |
| Design | UI/UX references and assets |
| Releases | Version history and release notes |

For complete documentation, refer to the `docs/` directory.

---

# Database Overview

The backend is powered by MongoDB using Mongoose ODM.

Primary collections include:

- Users
- Companies
- Departments
- Recruiters
- Candidates
- Jobs
- Applications
- Interviews
- Offers
- Notifications
- Audit Logs

The database schema is designed to support scalability while maintaining clear relationships between recruitment entities.

---

# Getting Started

Follow these steps to set up HireStack in your local development environment.

## Prerequisites

Ensure the following software is installed before starting.

| Software | Recommended Version |
|-----------|--------------------|
| Node.js | 20.x or later |
| npm | 10.x or later |
| MongoDB | 8.x |
| Git | Latest |
| VS Code | Latest (Recommended) |
| Postman | Latest (Optional) |

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/<your-github-username>/HireStack.git

cd HireStack
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file in the project root.

Example:

```env
NODE_ENV=development

PORT=5000

MONGO_URI=mongodb://localhost:27017/hirestack

JWT_SECRET=your_super_secret_key

JWT_EXPIRES_IN=1d

REFRESH_TOKEN_SECRET=your_refresh_secret

REFRESH_TOKEN_EXPIRES_IN=7d

EMAIL_HOST=smtp.example.com

EMAIL_PORT=587

EMAIL_USER=your_email@example.com

EMAIL_PASSWORD=your_password

FRONTEND_URL=http://localhost:3000
```

> Never commit your `.env` file to version control.

---

# Running the Application

## Development Mode

```bash
npm run dev
```

The development server will automatically restart whenever source files change.

---

## Production Mode

```bash
npm start
```

---

# API Overview

The backend exposes RESTful APIs grouped by business module.

| Module | Base Endpoint |
|----------|----------------|
| Authentication | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Companies | `/api/v1/companies` |
| Departments | `/api/v1/departments` |
| Recruiters | `/api/v1/recruiters` |
| Candidates | `/api/v1/candidates` |
| Jobs | `/api/v1/jobs` |
| Applications | `/api/v1/applications` |
| Interviews | `/api/v1/interviews` |
| Offers | `/api/v1/offers` |
| Notifications | `/api/v1/notifications` |
| Dashboard | `/api/v1/dashboard` |
| Audit Logs | `/api/v1/audit-logs` |

---

# Authentication

Most endpoints require authentication.

Include the JWT access token in every protected request.

Example:

```http
Authorization: Bearer <access_token>
```

---

# API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

---

### Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

---

# Error Handling

The API returns meaningful HTTP status codes.

| Status Code | Meaning |
|-------------|----------|
| 200 | Success |
| 201 | Resource Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

# Testing

The project has been designed with testing and maintainability in mind.

Recommended testing strategy:

- Unit Testing
- Integration Testing
- API Testing
- Authentication Testing
- Validation Testing
- Security Testing

Example:

```bash
npm test
```

---

# Logging

The backend records important system events including:

- User Authentication
- Administrative Actions
- Security Events
- Failed Login Attempts
- System Errors
- Audit Trail Activities

---

# File Uploads

Supported upload types include:

- Candidate Resumes
- Profile Images
- Company Documents
- Offer Attachments

All uploads are validated before being stored.

---

# Deployment

HireStack can be deployed to a variety of hosting platforms.

Supported deployment options include:

- Docker
- VPS (Ubuntu/Linux)
- AWS EC2
- Microsoft Azure
- Render
- Railway
- DigitalOcean

A dedicated deployment guide is available in the project documentation.

---

# Performance Considerations

The backend has been structured for scalability.

Key practices include:

- Modular Architecture
- Efficient MongoDB Queries
- Indexed Collections
- JWT Authentication
- Reusable Services
- Centralized Error Handling
- Input Validation
- Secure Password Storage

---

# Security Features

Security has been integrated throughout the application.

Implemented features include:

- Password Hashing (bcrypt)
- JWT Authentication
- Role-Based Access Control (RBAC)
- Password History
- Password Expiration
- Login Attempt Limiting
- Input Validation
- Secure Environment Variables
- Protected API Routes
- Audit Logging

---

# Documentation

Comprehensive project documentation is available in the `docs/` directory.

| Directory | Description |
|-----------|-------------|
| `docs/project/` | Project overview, vision, requirements, roadmap, milestones |
| `docs/architecture/` | System architecture, database schema, API standards, security |
| `docs/modules/` | Functional specifications for every backend module |
| `docs/development/` | Development setup, coding standards, testing, deployment |
| `docs/design/` | Design assets, diagrams, screenshots, wireframes |
| `docs/releases/` | Release notes and version history |

---

# Coding Standards

The project follows modern backend development practices.

- RESTful API Design
- Clean Architecture
- Modular Folder Structure
- Consistent Naming Conventions
- Environment-Based Configuration
- Reusable Business Logic
- Input Validation
- Secure Authentication
- Centralized Error Handling
- Comprehensive Documentation

---

# Roadmap

## Version 1.0.0 (Completed)

- ✅ Authentication & Authorization
- ✅ User Management
- ✅ Company Management
- ✅ Department Management
- ✅ Recruiter Management
- ✅ Candidate Management
- ✅ Job Management
- ✅ Application Management
- ✅ Interview Management
- ✅ Offer Management
- ✅ Hiring Pipeline
- ✅ Dashboard
- ✅ Notifications
- ✅ Audit Logs
- ✅ File Storage
- ✅ Email Services
- ✅ Comprehensive Documentation

---

## Future Enhancements

### Version 1.1

- Swagger / OpenAPI Documentation
- Docker Support
- CI/CD Pipeline
- Automated Testing
- API Rate Limiting
- Health Check Endpoints

---

### Version 2.0

- Frontend Web Application
- AI Resume Parsing
- Resume Ranking
- Candidate Recommendation Engine
- Calendar Integration
- Analytics Dashboard
- Multi-Tenant Support
- Advanced Reporting
- Third-Party Integrations
- Mobile Application

---

# Contributing

Contributions are welcome.

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

Please read the project's `CONTRIBUTING.md` before submitting changes.

---

# Reporting Issues

If you discover a bug or have a feature request:

- Check existing issues before creating a new one.
- Provide clear reproduction steps.
- Include logs or screenshots where applicable.

---

# Branch Strategy

| Branch | Purpose |
|---------|---------|
| `main` | Stable production-ready code |
| `develop` | Active development |
| `feature/*` | New features |
| `bugfix/*` | Bug fixes |
| `release/*` | Release preparation |
| `hotfix/*` | Critical production fixes |

---

# Versioning

This project follows **Semantic Versioning**.

```
MAJOR.MINOR.PATCH
```

Example:

```
v1.0.0
```

---

# License

This project is licensed under the **MIT License**.

See the `LICENSE` file for complete details.

---

# Acknowledgements

Special thanks to the open-source community and the maintainers of the technologies that power this project.

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcrypt
- Nodemailer
- Git & GitHub

---

# Author

**Alwin James**

Master of Computer Applications (MCA)

Backend Developer • AI Enthusiast • Software Engineer

---

# Repository Status

| Item | Status |
|------|:------:|
| Backend | ✅ Production Ready |
| Documentation | ✅ Complete |
| Authentication | ✅ Complete |
| Database | ✅ Complete |
| Security | ✅ Complete |
| REST API | ✅ Complete |
| Testing Strategy | ✅ Complete |
| Deployment Guide | ✅ Complete |
| Release Notes | ✅ Complete |

---

<div align="center">

## HireStack

**A Secure, Scalable, and Modern Recruitment Management Platform**

Built with ❤️ using Node.js, Express.js, and MongoDB.

⭐ If you find this project useful, consider giving it a star on GitHub.

</div>