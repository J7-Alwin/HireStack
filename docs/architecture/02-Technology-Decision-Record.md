# Technology Decision Record (TDR)

Project: HireStack

Version: 1.0

Status: Final

---

# Purpose

This document records the key technical decisions made during the design of HireStack and explains why they were chosen.

---

## Decision 1

Database

Chosen

PostgreSQL

Alternatives

MongoDB

MySQL

Reason

- Relational data fits recruitment workflows.
- Strong support for joins and constraints.
- Excellent performance.
- Industry adoption.
- Better learning value.

Decision

Approved

---

## Decision 2

ORM

Chosen

Prisma

Alternatives

Drizzle ORM

Sequelize

TypeORM

Reason

- Excellent TypeScript support.
- Type-safe queries.
- Great developer experience.
- Modern ecosystem.

Decision

Approved

---

## Decision 3

Backend Framework

Chosen

Express.js

Alternative

NestJS

Reason

- Easier to understand request lifecycle.
- Faster MVP development.
- Better for learning backend fundamentals.

Future

NestJS may be explored after MVP completion.

---

## Decision 4

Frontend

Chosen

React + Vite

Alternative

Next.js

Reason

- Faster development.
- Simpler deployment.
- Clear separation between frontend and backend.
- Easier to learn routing and API communication.

---

## Decision 5

Authentication

Chosen

JWT

Alternative

Sessions

Reason

- Stateless architecture.
- Easy frontend integration.
- Suitable for REST APIs.
- Common startup practice.

---

## Decision 6

State Management

Chosen

Zustand

Alternative

Redux Toolkit

Reason

- Lightweight.
- Less boilerplate.
- Easy to understand.
- Ideal for MVP.

---

## Decision 7

Data Fetching

Chosen

TanStack Query

Alternative

Axios only

Reason

- Built-in caching.
- Automatic refetching.
- Loading state management.
- Better scalability.

---

## Decision 8

CSS Framework

Chosen

Tailwind CSS

Alternative

Bootstrap

Material UI

Reason

- Utility-first.
- Fully customizable.
- Industry adoption.
- Excellent with shadcn/ui.

---

## Decision 9

Component Library

Chosen

shadcn/ui

Alternative

Material UI

Ant Design

Reason

- Accessible components.
- Customizable.
- Clean code.
- Modern design.

---

## Decision 10

Deployment

Frontend

Vercel

Backend

Render

Database

Neon

Storage

Cloudinary

Reason

All provide reliable free tiers suitable for portfolio projects.

---

End of Document