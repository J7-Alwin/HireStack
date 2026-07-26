# Frontend Folder Architecture

Project: HireStack

Version: 1.0

Status: Final

Document ID: FE-001

---

# Purpose

This document defines the frontend architecture for HireStack.

The frontend follows a Feature-Based Architecture to improve scalability, code reuse, and maintainability.

Built With

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Router
- React Hook Form
- Zod

---

# Folder Structure

frontend/

├── src/
│
├── assets/
│
├── components/
│   ├── ui/
│   ├── common/
│   ├── layout/
│   └── charts/
│
├── features/
│   ├── auth/
│   ├── users/
│   ├── companies/
│   ├── jobs/
│   ├── applications/
│   ├── dashboards/
│   └── uploads/
│
├── hooks/
│
├── layouts/
│
├── pages/
│   ├── public/
│   ├── candidate/
│   ├── recruiter/
│   └── admin/
│
├── routes/
│
├── services/
│
├── store/
│
├── types/
│
├── utils/
│
├── constants/
│
├── styles/
│
├── App.tsx
│
└── main.tsx

---

# Components

## UI Components

Reusable components from shadcn/ui.

Examples

Button

Input

Dialog

Dropdown

Card

Table

Badge

Tooltip

---

## Common Components

Shared application components.

Navbar

Sidebar

Footer

Loading Spinner

Empty State

Pagination

Search Bar

Confirmation Modal

---

## Layout Components

Public Layout

Candidate Layout

Recruiter Layout

Admin Layout

---

# Pages

Public

Landing

Login

Register

Forgot Password

Reset Password

Jobs

---

Candidate

Dashboard

Profile

Applications

Resume

Settings

---

Recruiter

Dashboard

Manage Jobs

Applicants

Company Profile

Settings

---

Admin

Dashboard

Companies

Users

Recruiters

Platform Analytics

Settings

---

# State Management

Global State

Zustand

Used For

Authentication

Current User

Theme

Notifications

Sidebar State

---

Server State

TanStack Query

Used For

Jobs

Applications

Dashboard Data

Users

Companies

---

# Routing

React Router

Route Protection

Public Routes

Protected Routes

Role-Based Routes

404 Route

---

# Form Management

React Hook Form

Validation

Zod

Features

Client-side validation

Error messages

Type-safe forms

---

# API Layer

Axios Instance

Request Interceptors

Response Interceptors

Automatic Token Refresh

Error Handling

---

# Styling Standards

Tailwind CSS

Utility-first approach

Design Tokens

Spacing System

Typography Scale

Consistent Colors

Responsive Breakpoints

---

# Performance

Lazy Loading

Code Splitting

Image Optimization

Memoization

Skeleton Loading

---

End of Document