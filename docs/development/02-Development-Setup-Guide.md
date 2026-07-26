# Development Setup & Environment Guide

Project: HireStack

Version: 1.0

Status: Final

Document ID: DEV-002

---

# Purpose

This guide explains how to set up HireStack for local development.

---

# Required Software

- Node.js (LTS)
- npm
- Git
- VS Code
- PostgreSQL (Neon for cloud)
- Postman
- Docker (Future)

---

# Recommended VS Code Extensions

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens
- Error Lens

---

# Repository Structure

hirestack/

├── backend/

├── frontend/

├── docs/

└── README.md

---

# Environment Variables

Backend

```
DATABASE_URL=

JWT_ACCESS_SECRET=

JWT_REFRESH_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

SMTP_HOST=

SMTP_PORT=

SMTP_USER=

SMTP_PASS=

PORT=
```

Frontend

```
VITE_API_URL=
```

---

# Install Steps

Backend

```
npm install
```

Frontend

```
npm install
```

---

# Run Commands

Backend

```
npm run dev
```

Frontend

```
npm run dev
```

---

# Database

Generate Prisma Client

```
npx prisma generate
```

Run Migrations

```
npx prisma migrate dev
```

Seed Database

```
npm run seed
```

---

# Development Rules

- Never commit `.env`.
- Use feature branches.
- Run lint before commit.
- Keep dependencies updated.

---

# Troubleshooting

## Database Connection

- Verify `DATABASE_URL`.
- Check Neon status.
- Run migrations.

## API Errors

- Check backend server.
- Verify environment variables.

## Prisma Errors

- Regenerate Prisma Client.
- Check schema changes.

---

End of Document