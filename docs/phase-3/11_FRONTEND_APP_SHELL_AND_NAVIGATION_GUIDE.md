# HireStack ATS — Frontend App Shell & Navigation Guide

## 1. Overview

This document describes the architecture, component structure, role-aware navigation, and layout systems built for the HireStack ATS Application Shell in **Phase 3 — Stage 5**.

The Application Shell (`AppShell`) provides the persistent, responsive, accessible UI frame for all authenticated experiences across the platform:
- **Super Admin** (Platform administration & system settings)
- **Company Admin** (Company workspace & tenant administration)
- **Recruiter** (Talent recruitment & hiring pipeline)
- **Candidate** (Applicant self-service portal)

---

## 2. Layout Architecture

```
                               ┌────────────────────────────────┐
                               │       ProtectedRoute (/app)    │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │            AppShell            │
                               └───────────────┬────────────────┘
                                               │
        ┌──────────────────────────────────────┴──────────────────────────────────────┐
        │                                                                             │
┌───────▼──────────────┐                                                    ┌─────────▼───────────┐
│       Sidebar        │ (Desktop, 1024px+)                                 │  MobileNavigation   │ (Mobile Drawer)
│ ──────────────────── │                                                    │ ─────────────────── │
│  - Branding (H Logo) │                                                    │  - Backdrop Overlay │
│  - Collapse Toggle   │                                                    │  - Escape Listener  │
│  - SidebarNavigation │                                                    │  - SidebarNavigation│
└──────────────────────┘                                                    └─────────────────────┘
        │
        │                               ┌─────────────────────────┐
        └──────────────────────────────►│        Main Area        │
                                        └────────────┬────────────┘
                                                     │
                                   ┌─────────────────┴─────────────────┐
                                   │                                   │
                         ┌─────────▼─────────┐               ┌─────────▼─────────┐
                         │      Topbar       │               │   PageContainer   │
                         │ ───────────────── │               │ ───────────────── │
                         │  - Mobile Trigger │               │  - Max-width scale│
                         │  - Breadcrumbs    │               │  - Outlet Content │
                         │  - CompanyContext │               │  - Responsive Pad │
                         │  - Search / Bell  │               └───────────────────┘
                         │  - UserMenu       │
                         └───────────────────┘
```

---

## 3. Component Reference

### 3.1 `AppShell` (`src/components/layout/AppShell.tsx`)
- Orchestrates the persistent desktop sidebar, mobile navigation drawer, topbar, and main content area.
- Renders `<Outlet />` inside the main content region for nested application routes.
- Integrates seamlessly with `useUiStore` for sidebar and mobile drawer state.

### 3.2 `Sidebar` (`src/components/layout/Sidebar.tsx`)
- Desktop sidebar styled with charcoal surface (`#2B2B2B`) and crisp white/lime accents.
- Responsive width:
  - **Expanded**: `260px` (Full labels + badges)
  - **Collapsed**: `72px` (Icon-only mode with accessible `Tooltip` floating helpers)
- Collapse/expand toggle button with proper `aria-expanded` and `aria-label` attributes.

### 3.3 `SidebarNavigation` (`src/components/layout/SidebarNavigation.tsx`)
- Semantic `<nav aria-label="Main Navigation">`.
- Grouped by logical sections (e.g., *Platform*, *Workspace*, *Administration*, *My Career*).
- Active item highlighting with subtle lime accent indicator and `aria-current="page"`.
- Uses centralized `getNavigationForUser()` for role-based access filtering.

### 3.4 `MobileNavigation` (`src/components/layout/MobileNavigation.tsx`)
- Slide-in sheet drawer for viewports under `1024px`.
- Backdrop overlay that blocks background interactions.
- Full keyboard accessibility:
  - Closes on `Escape` key press.
  - Automatically restores body scroll when closed.
  - Auto-closes when a navigation item is selected.

### 3.5 `Topbar` (`src/components/layout/Topbar.tsx`)
- Sticky header bar (`64px`) containing:
  - Mobile hamburger menu button.
  - `Breadcrumbs` navigation.
  - `CompanyContext` tenant/platform badge.
  - Global search trigger foundation (`⌘K` shortcut indicator).
  - Notification trigger foundation (bell icon with unread indicator).
  - `UserMenu` dropdown.

### 3.6 `UserMenu` (`src/components/layout/UserMenu.tsx`)
- Displays user avatar with initials, email, and human-friendly role badge.
- Provides accessible dropdown menu with:
  - Account Details foundation link.
  - Sign Out button wired to Stage 4 `useAuth().logout()`, automatically clearing server query cache and resetting auth state.

### 3.7 `CompanyContext` (`src/components/layout/CompanyContext.tsx`)
- Authoritative, read-only tenant display:
  - `SUPER_ADMIN` → **Platform Admin** badge.
  - `COMPANY_ADMIN` / `RECRUITER` → **Company Workspace** (`companyId`) badge.
  - `CANDIDATE` → **Candidate Portal** badge.
- Does not invent client-side company switching API.

### 3.8 `Breadcrumbs` (`src/components/layout/Breadcrumbs.tsx`)
- Semantic `<nav aria-label="Breadcrumb">` with `<ol>` and `<li>`.
- Automatically maps URL route segments or accepts explicit `items` array.
- Accessible chevron separators and `aria-current="page"` on current terminal segment.

### 3.9 `PageContainer` (`src/components/layout/PageContainer.tsx`)
- Content wrapper with configurable constraints:
  - `maxWidth`: `'sm'` (768px), `'md'` (1024px), `'lg'` (1280px), `'xl'` (1440px), `'full'` (100%).
  - `padding`: `'none'`, `'sm'` (16px), `'md'` (24px), `'lg'` (32px).

---

## 4. Centralized Navigation Configuration

Navigation items are defined in `src/config/navigation.config.ts`.

### Navigation Item Structure
```typescript
export interface NavigationItem {
  readonly id: string
  readonly label: string
  readonly path: string
  readonly icon: ComponentType<{ size?: number; className?: string }>
  readonly allowedRoles: readonly Role[]
  readonly badge?: string | number
  readonly enabled?: boolean
  readonly children?: readonly NavigationItem[]
}
```

### Role-Based Navigation Matrix

| Role | Sections | Primary Navigation Items |
| :--- | :--- | :--- |
| **SUPER_ADMIN** | Platform, System | Overview, Companies, Users, Audit Logs, System Settings |
| **COMPANY_ADMIN** | Workspace, Administration | Overview, Jobs, Candidates, Applications, Interviews, Team Members, Settings |
| **RECRUITER** | Workspace | Overview, Jobs, Candidates, Applications, Interviews |
| **CANDIDATE** | My Career | Dashboard, My Applications, Interviews, Profile |

---

## 5. Routing Architecture

Public routes (like `/login` and `/`) remain strictly outside the authenticated `AppShell`.

Protected application routes mount `AppShell` under `ProtectedRoute`:

```tsx
// src/routes/router.tsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <FoundationRoot />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/forbidden',
    element: <ForbiddenPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <PageContainer>
            <FoundationRoot />
          </PageContainer>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
```

---

## 6. Accessibility & Responsive Design

- **Responsive Breakpoint**: `1024px` separates desktop persistent sidebar from mobile slide-out drawer.
- **Accessible Landmarks**: `<aside aria-label="Sidebar">`, `<nav aria-label="Main Navigation">`, `<header aria-label="Application Header">`, `<main>`.
- **Keyboard Navigation**:
  - Full tab order across navigation items.
  - `Escape` key dismisses mobile drawer and user menu.
  - Visible focus indicators (`:focus-visible`) styled according to Stage 2 tokens.
- **Reduced Motion**: All animations and transitions respect `prefers-reduced-motion: reduce`.
