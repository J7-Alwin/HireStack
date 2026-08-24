# HireStack ATS — UI Design System & Component Architecture

**Phase:** 3 — Frontend  
**Document:** 08  
**Status:** Planned  
**Version:** 1.0.0

---

## 1. Purpose

This document defines the UI design system and reusable component architecture for the HireStack ATS frontend.

The goal is to ensure that the entire application has:

- Consistent visual language
- Consistent spacing
- Consistent typography
- Consistent colors
- Reusable components
- Accessible interactions
- Responsive layouts
- Consistent forms
- Consistent tables
- Consistent dashboards
- Consistent loading and error states
- Consistent AI result presentation

The frontend must be built as a reusable design system rather than a collection of independently styled pages.

---

# 2. Design Principles

The HireStack frontend follows these principles:

### 2.1 Consistency

The same UI pattern should look and behave the same everywhere.

Example:

```text
Candidate Search
Job Search
Recruiter Search

should use the same search component.

2.2 Reusability

If a component appears in multiple places, create one reusable component.

Avoid:

CandidateTable.tsx
JobTable.tsx
ApplicationTable.tsx

implementing three different pagination patterns.

Instead, build reusable primitives:

DataTable
Pagination
SearchInput
FilterBar

and compose them.

2.3 Accessibility

All interactive UI must be accessible.

Requirements include:

Keyboard navigation
Visible focus states
Proper labels
Semantic HTML
Accessible dialogs
Accessible dropdowns
Accessible tables
Accessible form errors
Appropriate ARIA attributes

Accessibility must not be added as an afterthought.

2.4 Responsive Design

The application must work across:

Desktop
Tablet
Mobile

The primary ATS experience is desktop-oriented, but mobile users must still be able to:

Navigate
View records
Review applications
View dashboards
Read AI results
Perform essential actions
2.5 Progressive Complexity

Basic screens should remain visually simple.

Do not expose every available action simultaneously.

Prefer:

Primary Action
Secondary Actions
More Actions

rather than a toolbar containing 15 buttons.

3. Visual Direction

HireStack should use a modern professional SaaS visual language.

The design should feel:

Professional
Clean
Trustworthy
Modern
Focused
Data-oriented
Enterprise-ready

Avoid:

Overly decorative UI
Excessive gradients
Excessive animation
Crowded dashboards
Unnecessary glass effects
Large decorative illustrations
Inconsistent shadows

The application should prioritize usability over visual effects.

4. Design Tokens

The design system must use centralized design tokens.

Tokens should cover:

Colors
Typography
Spacing
Border radius
Borders
Shadows
Transitions
Breakpoints
Z-index
Component dimensions

Do not hard-code arbitrary values repeatedly throughout components.

5. Color System

The application should define semantic colors rather than using raw colors throughout components.

Example semantic tokens:

primary
primaryForeground

secondary
secondaryForeground

background
foreground

muted
mutedForeground

border
input

success
successForeground

warning
warningForeground

destructive
destructiveForeground

info
infoForeground

Components should consume semantic tokens.

Example:

bg-primary
text-primary-foreground
border-border
text-muted-foreground

rather than arbitrary color values.

6. Brand Color

The HireStack brand color should be centralized.

Example conceptual token:

--color-brand

The actual value should be defined once in the design system.

Do not duplicate the brand hex value throughout the application.

7. Dark Mode

The architecture should support dark mode if included in the project requirements.

If implemented:

Light Theme
Dark Theme

must use semantic tokens.

Do not create separate hard-coded dark-mode versions of every component.

Example:

background
foreground
card
border
muted

should automatically resolve according to the active theme.

8. Typography

Typography should be centralized.

Recommended hierarchy:

Display
H1
H2
H3
H4
Body
Body Small
Caption
Label

Example:

Page Title
Section Title
Card Title
Body Text
Supporting Text

Use a limited number of font sizes and weights.

Avoid arbitrary typography such as:

font-size: 17px
font-size: 19px
font-size: 23px

unless explicitly justified.

9. Typography Hierarchy

Example:

Page Title
  ↓
Section Heading
  ↓
Card Heading
  ↓
Body
  ↓
Secondary Text
  ↓
Caption

The visual hierarchy should make it immediately clear:

What page the user is on
What section they are viewing
What action is available
What information is primary
What information is secondary
10. Spacing System

Spacing should use a consistent scale.

Example conceptual system:

4
8
12
16
20
24
32
40
48
64

Components should use spacing tokens rather than arbitrary values.

Example:

gap-2
gap-4
gap-6
p-4
p-6

rather than repeatedly inventing custom spacing.

11. Border Radius

Use a consistent radius system.

Example:

small
medium
large
full

Typical usage:

Inputs       → medium
Cards        → medium/large
Buttons      → medium
Badges       → full
Avatars      → full

Avoid excessive rounded elements that make the enterprise UI feel playful.

12. Shadows

Shadows should communicate elevation.

Use limited levels:

none
small
medium
large

Typical usage:

Card       → subtle
Dropdown   → medium
Modal      → large
Tooltip    → medium

Avoid heavy shadows throughout the application.

13. Icons

Use one consistent icon library.

Do not mix multiple unrelated icon styles.

Icons must:

Have consistent stroke weight
Have consistent sizing
Be aligned correctly
Include accessible labels when necessary

Examples:

Search
Filter
Plus
Edit
Delete
More
Chevron
Calendar
User
Briefcase
Bell
Settings
14. Icon Sizes

Recommended hierarchy:

Small      → 14–16px
Default    → 18–20px
Large      → 24px
Hero       → 32px+

The exact values should follow the selected component library.

15. Button System

Buttons must use reusable variants.

Minimum variants:

Primary
Secondary
Outline
Ghost
Destructive
Link

Example:

Primary
[ Create Job ]

Secondary
[ Cancel ]

Destructive
[ Delete ]

Ghost
[ More ]
16. Button States

Every button must support:

Default
Hover
Focus
Active
Disabled
Loading

Loading state example:

[ Creating... ]

instead of allowing duplicate clicks.

17. Button Hierarchy

A page should normally have one visually dominant primary action.

Example:

Jobs

[ Create Job ]    [ Import ]    [ More ]

Avoid multiple competing primary buttons.

18. Inputs

Inputs must use a reusable input component.

Supported states:

Default
Focus
Disabled
Read-only
Error
Success

Each input should support:

Label
Input
Helper text
Error message

Example:

Job Title
[ Senior Backend Engineer        ]

Required position title
19. Form Labels

Every form field must have an accessible label.

Do not rely on placeholder text as the only label.

Bad:

[ Enter candidate email ]

Good:

Email
[ candidate@example.com ]
20. Form Validation

Validation should clearly communicate:

What is wrong
Where it is wrong
How to fix it

Example:

Email
[ invalid@email ]

Please enter a valid email address.

Backend validation errors must also be displayed when returned by the API.

21. Select

Select components should be consistent across the application.

Examples:

Status
Department
Recruiter
Job
Interview Type
Application Stage

Support:

Label
Placeholder
Options
Disabled
Error
Searchable mode where required
22. Combobox

Use a searchable combobox for large datasets.

Examples:

Select Candidate
Select Recruiter
Select Job
Select Department

Do not load thousands of records into a basic dropdown unnecessarily.

23. Checkbox

Checkboxes are appropriate for:

Boolean settings
Multi-select filters
Permission configuration

Each checkbox requires an accessible label.

24. Radio Groups

Radio groups are appropriate when exactly one option must be selected.

Examples:

Interview Type
Evaluation Mode
Visibility
25. Switch

Switches should represent immediate boolean settings.

Examples:

Email Notifications
AI Features
Active Status

Do not use switches for multi-step business-state transitions.

26. Textarea

Textareas should be used for:

Description
Notes
Feedback
Comments
AI instructions where applicable

Support:

Character count
Validation
Minimum/maximum length
27. Search Input

Create one reusable search component.

Example:

[ 🔍 Search candidates... ]

Features:

Debounced input
Clear button
Keyboard support
Accessible label
Loading state when appropriate
28. Filter Bar

List pages should use a consistent filter system.

Example:

Search
Status
Department
Recruiter
Date
[ Filters ]

For mobile:

[ Search ]
[ Filters ]

with filters opening in a drawer/dialog.

29. Data Table

The data table is one of the most important ATS components.

It must support:

Columns
Sorting
Pagination
Selection
Row actions
Loading
Empty state
Error state
Responsive behavior
30. Table Structure

Example:

Candidate
Email
Department
Status
Applied
Actions

Use consistent:

Header height
Row height
Cell padding
Alignment
Typography
Action placement
31. Table Loading

Do not show a blank table during loading.

Use skeleton rows:

████████
██████
██████████

The table structure should remain visible where practical.

32. Table Empty State

Example:

No candidates found

Try adjusting your filters or search criteria.

[ Clear Filters ]

Empty states should explain what happened and what the user can do next.

33. Table Error State

Example:

Unable to load candidates.

[ Try Again ]

Do not display raw API errors.

34. Pagination

Pagination should be standardized.

Example:

Showing 21–40 of 248

[ Previous ]  1  2  3  ...  13  [ Next ]

The pagination component should be reusable across:

Candidates
Jobs
Applications
Interviews
Offers
Recruiters
35. Cards

Cards should be used for grouped information.

Examples:

Dashboard statistics
Candidate summary
Job summary
AI result sections
Recent activity

Avoid wrapping every small UI element in a card.

36. Statistic Cards

Dashboard statistic cards should have:

Label
Primary value
Optional trend
Optional supporting text

Example:

Active Jobs

24

+8% this month

Do not overload statistic cards with too much information.

37. Status Badges

Use standardized status badges.

Examples:

ACTIVE
INACTIVE
PUBLISHED
DRAFT
CLOSED
REJECTED
HIRED
PENDING

Semantic colors should communicate state consistently.

38. Status Color Rules

Recommended semantic meaning:

Success → Positive/completed
Warning → Needs attention
Destructive → Failed/rejected/danger
Info → Informational
Neutral → Unknown/inactive

The exact color palette must come from design tokens.

Do not rely on color alone to communicate meaning.

39. Avatar

Avatar component should support:

Image
Initials
Fallback

Examples:

Candidate
Recruiter
Company Admin
Super Admin

Use consistent sizing.

40. Breadcrumbs

Breadcrumbs should be used on deep pages.

Example:

Candidates / John Doe / Applications

They should help users understand where they are.

41. Tabs

Tabs should be used for related sections.

Candidate example:

Overview
Resume
Applications
Interviews
AI Analysis
Activity

Tabs should not become a replacement for navigation.

42. Modal

Use modals for focused actions.

Examples:

Delete Candidate
Create Department
Assign Recruiter
Schedule Interview

Modal requirements:

Focus trap
Escape support
Accessible title
Accessible description
Clear primary action
Clear cancel action
43. Drawer

Use drawers for secondary workflows that benefit from preserving page context.

Examples:

Filters
Candidate quick view
Job quick view
Notifications
Mobile navigation
44. Confirmation Dialog

Destructive actions require confirmation when appropriate.

Example:

Delete Candidate?

This action cannot be undone.

[ Cancel ] [ Delete Candidate ]

Avoid confirmation dialogs for every harmless action.

45. Toasts

Use toast notifications for short-lived feedback.

Examples:

Candidate created successfully.
Job updated successfully.
Interview scheduled.

Do not use toasts for critical information that users need to read carefully.

46. Notifications

Persistent notifications should use a notification center where appropriate.

Examples:

Interview scheduled
Application status changed
New candidate assigned
AI analysis completed
47. Tooltip

Tooltips should explain unfamiliar controls.

Do not use tooltips for information that is essential to completing a task.

Example:

[ ⋮ ]

Tooltip:

More actions
48. Skeletons

Skeleton components should exist for major content types.

Examples:

CardSkeleton
TableSkeleton
ProfileSkeleton
DashboardSkeleton
DetailSkeleton

Use skeletons when the content structure is predictable.

49. Spinner

Spinners are appropriate for short actions.

Examples:

Saving...
Deleting...
Refreshing...

For longer AI operations, use a more informative loading state.

50. AI Loading Components

AI operations should have dedicated UI.

Example:

Generating AI Analysis

Analyzing the candidate profile and job requirements...

[ Progress indicator ]

Do not imply that AI is thinking in a way that exposes internal model reasoning.

Use simple operational language.

51. AI Result Components

AI results should have reusable presentation components.

Examples:

AISummaryCard
AIInsightCard
StrengthList
WeaknessList
SkillGapList
HiringRiskCard
RecommendationCard
InterviewQuestionList
52. AI Confidence Display

If the backend returns a confidence score:

Hiring Confidence

82%

Use both:

Numeric value
Visual indicator

but do not imply that the number is a scientifically calibrated probability unless the backend explicitly defines it that way.

53. AI Recommendation Display

Recommendations should clearly distinguish:

Recommendation
Supporting observations
Evidence

Do not visually present AI output as an authoritative hiring decision.

The UI should communicate that AI assists recruiters.

54. AI Disclaimer

Where appropriate, display a subtle contextual message:

AI-generated assessment. Review the underlying candidate information before making hiring decisions.

This should not obstruct normal workflows.

55. AI Error Components

Use a standardized component:

AIAnalysisError

Example:

AI analysis unavailable

We couldn't complete this analysis right now.

[ Try Again ]

Avoid exposing infrastructure details.

56. Candidate Profile Components

Candidate pages should use reusable sections:

CandidateHeader
CandidateSummary
CandidateContactInfo
ResumeViewer
ExperienceTimeline
EducationList
SkillsList
ApplicationHistory
InterviewHistory
AIAnalysisPanel
57. Job Components

Job pages should use:

JobHeader
JobSummary
JobDescription
JobRequirements
RecruiterAssignment
ApplicationStats
JobApplications
JobActions
58. Application Components

Applications should use:

ApplicationStatusBadge
ApplicationTimeline
ApplicationCandidateCard
ApplicationJobCard
ApplicationStageControl
ApplicationActions

The backend remains responsible for valid state transitions.

59. Interview Components

Use:

InterviewCard
InterviewCalendar
InterviewStatusBadge
InterviewDetails
InterviewParticipants
InterviewFeedback
60. Offer Components

Use:

OfferCard
OfferSummary
OfferStatusBadge
OfferDetails
OfferTimeline
OfferActions
61. Dashboard Components

Shared dashboard primitives:

DashboardHeader
StatCard
MetricCard
ChartCard
RecentActivity
QuickActions
DataSummary

Role-specific dashboards can compose these components.

62. Super Admin Components

Super Admin is a platform-level role and requires separate dashboard patterns.

Components may include:

PlatformStatCard
CompanyTable
PlatformUserTable
SystemHealthCard
AIUsageCard
PlatformActivity
TenantSummary

Super Admin UI must not be confused with company-admin UI.

63. Navigation Components

Reusable navigation components:

AppSidebar
MobileSidebar
Topbar
Breadcrumbs
UserMenu
NotificationMenu
WorkspaceSwitcher

Visibility should be controlled by RBAC.

64. Responsive Layout

Primary breakpoints should be centralized.

Conceptually:

Mobile
Tablet
Desktop
Large Desktop

Components should adapt rather than simply shrink.

Example:

Desktop:

Sidebar | Main Content

Mobile:

Topbar
Main Content
65. Mobile Tables

Large tables should not simply overflow indefinitely.

Possible approaches:

Horizontal scrolling
Responsive column reduction
Card transformation
Priority columns

The correct strategy should be chosen based on the specific data.

66. Responsive Forms

Forms should change from:

Two-column desktop

to:

Single-column mobile

without losing field order or validation context.

67. Responsive Modals

Large desktop dialogs may become full-screen or bottom sheets on mobile.

The interaction must remain accessible.

68. Component Variants

Reusable components should expose controlled variants.

Example:

<Button variant="primary" />
<Button variant="secondary" />
<Button variant="destructive" />

Avoid component-specific arbitrary styling APIs.

69. Component Composition

Prefer composition over huge configurable components.

Bad:

MegaTable
  100 props

Better:

DataTable
  + Column definitions
  + Pagination
  + FilterBar
  + RowActions
70. Component Naming

Use descriptive names.

Good:

CandidateCard
CandidateTable
JobStatusBadge
InterviewTimeline
AIInsightCard

Avoid:

Box1
Card2
Thing
Widget
71. Component Organization

Recommended structure:

src/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   ├── feedback/
│   ├── navigation/
│   ├── layout/
│   └── ai/
│
└── features/
    ├── candidates/
    ├── jobs/
    ├── applications/
    ├── interviews/
    ├── offers/
    ├── dashboards/
    └── ai/
72. UI vs Feature Components

Generic:

Button
Modal
Input
Table
Badge
Card

belong in:

components/ui/

Domain-specific:

CandidateCard
JobApplicationTimeline
AIInsightCard

belong within their feature or domain component directory.

73. Styling Rules

Components should use the project's chosen styling system consistently.

Do not mix:

Tailwind
CSS modules
Inline styles
Styled-components
Random global CSS

without an architectural reason.

One primary styling approach should be selected during implementation.

74. Global CSS

Global CSS should be limited to:

Reset
Typography defaults
Theme tokens
Base styles
Accessibility utilities
Global layout primitives

Feature-specific styling should remain close to the feature.

75. Animation

Animation should be subtle and purposeful.

Appropriate:

Modal enter/exit
Drawer
Dropdown
Toast
Loading transitions
Hover states

Avoid:

Large page animations
Constant motion
Decorative animations
Long transitions
76. Reduced Motion

Respect:

prefers-reduced-motion

Users who prefer reduced motion should not receive unnecessary animations.

77. Focus Management

Interactive elements must have visible focus states.

Dialogs must:

Trap focus
Restore focus
Support Escape

Navigation must be keyboard accessible.

78. Accessibility

Target:

WCAG 2.1 AA

where practical.

Requirements:

Sufficient contrast
Keyboard access
Screen-reader labels
Form labels
Focus indicators
Semantic HTML
Accessible dialogs
Accessible tables
Accessible error messages
79. Color Accessibility

Never rely only on color.

Bad:

Green = hired
Red = rejected

Better:

[✓ Hired]
[✕ Rejected]

with semantic colors as additional visual cues.

80. Empty States

Every major data page must have a meaningful empty state.

Examples:

No candidates yet
No jobs found
No applications
No interviews scheduled
No AI analyses available

Where appropriate, provide an action:

[ Add Candidate ]
81. Error States

Major pages should have reusable error states.

Example:

Something went wrong.

We couldn't load this information.

[ Try Again ]

Do not display stack traces.

82. Permission States

When the user lacks access:

You don't have permission to view this page.

Do not render sensitive data and then hide individual fields.

RBAC must be applied before rendering protected content.

83. Not Found States

Example:

Candidate not found

The candidate may have been removed or you may no longer have access.

Avoid revealing whether a protected resource exists when the backend intentionally returns a generic not-found response.

84. Loading + Error + Empty Pattern

Every server-driven page should consider:

Loading
Success
Empty
Error
Permission denied
Not found

Do not implement only the success state.

85. Data Visualization

Charts should be used when they improve understanding.

Good:

Applications by stage
Hiring funnel
Time-to-hire
Candidate source distribution
AI usage

Avoid charts for simple numbers that can be communicated through a statistic card.

86. Chart Accessibility

Charts should provide:

Labels
Legends where needed
Tooltips
Accessible summaries
Text alternatives where appropriate

Do not rely exclusively on color.

87. Design System Documentation

Every reusable component should document:

Purpose
Props
Variants
States
Accessibility
Usage examples

The component documentation should remain synchronized with implementation.

88. Storybook / Component Playground

If the project uses Storybook or an equivalent component playground, reusable UI components should be demonstrated there.

Priority components:

Button
Input
Select
Modal
Table
Badge
Card
Tabs
Toast
Skeleton
AI components
89. Testing Requirements

Reusable components should have tests for:

Rendering
Variants
Interaction
Keyboard behavior
Accessibility
Loading
Error
Disabled states

Critical components should have stronger coverage.

90. Visual Regression

Where tooling supports it, visual regression should be used for the core design system.

Priority:

Buttons
Forms
Tables
Dialogs
Navigation
Dashboard cards
AI result cards
91. Performance

Components should avoid unnecessary rerenders.

Important considerations:

Memoize expensive components where justified
Avoid unnecessary global state subscriptions
Virtualize very large lists
Lazy-load heavy charting/AI components
Optimize images
Avoid rendering hidden large datasets

Do not optimize prematurely.

92. Security

UI components must never be treated as the security boundary.

For example:

Hidden Delete Button

does not equal:

Delete Permission

The backend remains responsible for authorization.

The frontend only improves the user experience by hiding unavailable actions.

93. Component Definition of Done

A reusable component is complete when:

 Has a clear responsibility
 Uses design tokens
 Supports required states
 Is responsive where applicable
 Is keyboard accessible
 Has accessible labels
 Has no unnecessary business logic
 Has TypeScript types
 Has tests where appropriate
 Follows naming conventions
 Does not duplicate an existing component
94. Page Definition of Done

A page is complete when:

 Uses the design system
 Has consistent layout
 Has loading state
 Has empty state
 Has error state
 Has permission state where required
 Is responsive
 Is keyboard accessible
 Uses reusable components
 Does not contain duplicated UI primitives
 Uses API hooks instead of direct HTTP calls
95. Design System Final Architecture
src/
│
├── components/
│   │
│   ├── ui/
│   │   ├── Button
│   │   ├── Input
│   │   ├── Select
│   │   ├── Checkbox
│   │   ├── Switch
│   │   ├── Card
│   │   ├── Badge
│   │   ├── Avatar
│   │   ├── Tabs
│   │   └── Tooltip
│   │
│   ├── forms/
│   │   ├── FormField
│   │   ├── SearchInput
│   │   ├── FilterBar
│   │   └── FormActions
│   │
│   ├── tables/
│   │   ├── DataTable
│   │   ├── TableSkeleton
│   │   └── Pagination
│   │
│   ├── feedback/
│   │   ├── Toast
│   │   ├── Alert
│   │   ├── EmptyState
│   │   ├── ErrorState
│   │   ├── LoadingState
│   │   └── Skeleton
│   │
│   ├── navigation/
│   │   ├── Sidebar
│   │   ├── Topbar
│   │   ├── Breadcrumbs
│   │   ├── UserMenu
│   │   └── NotificationMenu
│   │
│   ├── layout/
│   │   ├── PageContainer
│   │   ├── PageHeader
│   │   ├── Section
│   │   └── DashboardGrid
│   │
│   └── ai/
│       ├── AIResultCard
│       ├── AISummary
│       ├── AIConfidence
│       ├── AIError
│       ├── AILoading
│       └── AIHistory
│
└── features/
    ├── candidates/
    ├── jobs/
    ├── applications/
    ├── interviews/
    ├── offers/
    ├── recruiters/
    ├── departments/
    ├── dashboards/
    └── ai/
96. Final UI Architecture

The final frontend UI should follow:

                     APPLICATION
                          │
                          ▼
                     APP SHELL
                          │
              ┌───────────┴───────────┐
              │                       │
          Navigation               Content
                                      │
                                      ▼
                                Page Layout
                                      │
                       ┌──────────────┴──────────────┐
                       │                             │
                  Feature UI                    Shared UI
                       │                             │
             ┌─────────┴─────────┐          ┌──────┴──────┐
             │                   │          │             │
          Domain             Feature     Forms         Tables
        Components          Components   Cards         Feedback
             │                   │          │             │
             └───────────────────┴──────────┴─────────────┘
                                      │
                                      ▼
                              Design Tokens
97. Core Rules
Rule 1

Build reusable components before duplicating UI.

Rule 2

Use semantic design tokens.

Rule 3

Keep domain components separate from generic UI primitives.

Rule 4

Every server-driven page handles loading, empty, error, permission, and not-found states.

Rule 5

Accessibility is mandatory.

Rule 6

Responsive behavior is part of component design.

Rule 7

The backend remains the security boundary.

Rule 8

AI results must be presented as decision-support information, not authoritative hiring decisions.

Rule 9

Avoid unnecessary visual complexity.

Rule 10

Do not duplicate existing components.

98. Completion Criteria

The UI Design System stage is considered complete when:

 Design tokens defined
 Typography system defined
 Color system defined
 Spacing system defined
 Button system defined
 Form system defined
 Table system defined
 Modal/dialog system defined
 Navigation components defined
 Feedback components defined
 Responsive behavior defined
 Accessibility rules defined
 AI components defined
 Dashboard components defined
 Super Admin components defined
 Component folder architecture finalized
 Testing strategy defined
 No duplicated UI primitives
99. Final Principle

HireStack should feel like one product, not a collection of unrelated pages.

Every screen must use the same:

Design language
+
Spacing system
+
Typography
+
Components
+
Interaction patterns
+
Loading states
+
Error states
+
Accessibility rules

The design system becomes the foundation for the implementation of every Phase 3 frontend module.