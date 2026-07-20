# Design System

Project: HireStack

Version: 1.0

Status: Final

Document ID: DS-001

---

# Purpose

This document defines the visual language for HireStack.

The design system ensures consistency across the entire application by standardizing colors, typography, spacing, components, layouts, accessibility, and interaction patterns.

Every screen, component, and feature must follow this design system.

---

# Design Philosophy

HireStack is designed as a modern SaaS recruitment platform.

Core Principles

- Modern
- Clean
- Professional
- Friendly
- Minimal
- Accessible
- Responsive
- Consistent

Our goal is to provide a pleasant user experience without unnecessary visual clutter.

---

# Brand Identity

Brand Name

HireStack

Tagline

Modern Recruitment Made Simple

Brand Personality

- Professional
- Trustworthy
- Fresh
- Modern
- Friendly
- Efficient
- Minimal

Brand Feeling

Users should feel that HireStack is:

- Easy to use
- Fast
- Reliable
- Organized
- Professional

---

# Color Palette

## Primary Brand Color

Emerald Green

Hex

#10B981

Usage

- Primary Buttons
- Active Navigation
- Links
- Primary Actions
- Selected Items
- Focus States

---

## Primary Hover

Emerald Dark

Hex

#059669

Usage

- Button Hover
- Active Button
- Active Menu
- Hover States

---

## Primary Light

Mint Green

Hex

#D1FAE5

Usage

- Selected Cards
- Active Sidebar
- Highlights
- Selection Background

---

## Primary Soft

Pale Mint

Hex

#ECFDF5

Usage

- Dashboard Cards
- Section Backgrounds
- Empty States
- Statistics Cards

---

## Accent Color

Soft Pink

Hex

#F9A8D4

Usage

- Feature Highlights
- Special Badges
- Promotional Cards
- Empty State Illustrations

---

## Accent Background

Blush Pink

Hex

#FCE7F3

Usage

- Light Background Sections
- Welcome Cards
- Information Panels

---

## Secondary Accent

Lavender

Hex

#DDD6FE

Usage

- Analytics
- Charts
- Reports
- Data Visualization

---

## Background

Warm White

Hex

#F8FAFC

Usage

Entire Application Background

---

## Surface

White

Hex

#FFFFFF

Usage

- Cards
- Tables
- Sidebar
- Navbar
- Forms
- Dialogs

---

## Border

Soft Gray

Hex

#E5E7EB

Usage

- Cards
- Tables
- Inputs
- Dividers

---

## Text Colors

Primary Text

#0F172A

Secondary Text

#64748B

Muted Text

#94A3B8

Disabled Text

#CBD5E1

---

# Status Colors

## Success

Green

#22C55E

Used For

- Success Messages
- Completed Status
- Approved Applications

---

## Warning

Amber

#F59E0B

Used For

- Pending Status
- Warnings
- Draft Jobs

---

## Error

Red

#EF4444

Used For

- Validation Errors
- Failed Operations
- Rejected Applications

---

## Info

Sky Blue

#38BDF8

Used For

- Information Alerts
- Tips
- Notifications

---

# Typography

Primary Font

Inter

Fallback Fonts

system-ui

Segoe UI

Roboto

Arial

sans-serif

---

# Font Sizes

Heading 1

36px

Heading 2

30px

Heading 3

24px

Heading 4

20px

Body

16px

Small

14px

Caption

12px

---

# Font Weight

Regular

400

Medium

500

Semi Bold

600

Bold

700

---

# Line Height

Headings

1.2

Body

1.6

Small Text

1.5

---

# Spacing System

Base Unit

4px

Spacing Scale

4px

8px

12px

16px

20px

24px

32px

40px

48px

64px

80px

96px

---

# Border Radius

Buttons

8px

Inputs

8px

Cards

12px

Dropdowns

12px

Dialogs

16px

Badges

999px

---

# Shadows

Small

Cards

Medium

Dropdowns

Large

Dialogs

Extra Large

Feature Cards

---

# Buttons

## Primary Button

Background

#10B981

Text

White

Hover

#059669

Radius

8px

---

## Secondary Button

Background

White

Border

#10B981

Text

#10B981

Hover

#ECFDF5

---

## Outline Button

Background

Transparent

Border

Gray

Text

Primary Text

---

## Danger Button

Background

#EF4444

Text

White

---

## Ghost Button

Transparent

No Border

Used for icon buttons and secondary actions.

---

# Inputs

Rounded

8px

Border

#E5E7EB

Focus Border

#10B981

Focus Ring

Mint Green

Placeholder

#94A3B8

Error Border

#EF4444

Disabled Background

#F1F5F9

---

# Cards

Background

White

Border

#E5E7EB

Border Radius

12px

Padding

24px

Shadow

Soft

Cards should have generous whitespace.

---

# Tables

White Background

Sticky Header

Hover Row

Pagination

Sorting

Filtering

Responsive

Rounded Container

---

# Navigation

Navbar

White

Sidebar

White

Active Menu

Mint Green

Active Text

Emerald Green

Hover Background

#ECFDF5

Hover Text

#059669

---

# Dashboard Cards

Statistics

#ECFDF5

Jobs

#F0FDF4

Applicants

#FCE7F3

Analytics

#EEF2FF

Recent Activity

White

Quick Actions

White

---

# Icons

Library

Lucide React

Sizes

16px

20px

24px

32px

Icon Style

Outline Icons

---

# Images

Company Logos

User Avatars

Illustrations

No stock images inside authenticated dashboard pages.

---

# Responsive Design

Mobile

Below 640px

Tablet

640px – 1023px

Desktop

1024px – 1439px

Large Desktop

1440px and above

The application should be mobile-friendly and fully responsive.

---

# Accessibility

WCAG AA Compliant

Keyboard Navigation

Required

Visible Focus States

Required

ARIA Labels

Required

Semantic HTML

Required

Minimum Contrast Ratio

4.5:1

---

# Animations

Animation Style

Subtle

Duration

150ms–250ms

Allowed Animations

- Hover
- Fade
- Dropdown
- Modal
- Loading
- Toast Notification

Avoid excessive animations.

---

# Dark Mode

Current Version

Not Included

Future Version

Supported

The design system should be structured so dark mode can be added without major redesign.

---

# Color Usage Rules

Use colors intentionally.

Recommended Distribution

70%

Neutral Colors

- White
- Warm White
- Gray

20%

Primary Green

- Buttons
- Links
- Navigation
- Active States

10%

Accent Colors

- Pink
- Lavender

Accent colors should support the interface, not dominate it.

---

# Tailwind CSS Color Mapping

Primary

emerald-500

Primary Hover

emerald-600

Primary Light

emerald-100

Primary Soft

emerald-50

Accent

pink-300

Accent Background

pink-100

Secondary Accent

violet-200

Background

slate-50

Surface

white

Border

gray-200

Primary Text

slate-900

Secondary Text

slate-500

Muted Text

slate-400

Success

green-500

Warning

amber-500

Error

red-500

Info

sky-400

---

# UI Principles

- Maintain generous whitespace.
- Keep layouts clean and uncluttered.
- Use one primary action per screen.
- Use consistent spacing throughout the application.
- Avoid unnecessary visual effects.
- Ensure every component is reusable.
- Prioritize readability over decoration.
- Maintain visual hierarchy using typography and spacing.
- Keep interactions simple and intuitive.

---

# End of Document