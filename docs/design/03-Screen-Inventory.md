# Screen Inventory

Project: HireStack

Version: 1.0

Status: Final

Document ID: UI-001

---

# Purpose

This document lists every screen that will exist in HireStack Version 1 (MVP).

Each screen has a clear purpose, target users, and primary actions.

---

# Public Screens

| Screen | Route | Users | Purpose |
|---------|-------|-------|---------|
| Landing Page | / | Everyone | Introduce HireStack |
| Login | /login | All | User authentication |
| Register | /register | Candidate | Create account |
| Forgot Password | /forgot-password | All | Reset password request |
| Reset Password | /reset-password/:token | All | Set a new password |
| Job Listings | /jobs | Everyone | Browse published jobs |
| Job Details | /jobs/:id | Everyone | View full job description |

---

# Candidate Screens

| Screen | Route | Purpose |
|---------|-------|---------|
| Dashboard | /candidate/dashboard | Candidate overview |
| My Profile | /candidate/profile | Manage personal details |
| Resume | /candidate/resume | Upload/manage resume |
| My Applications | /candidate/applications | Track applications |
| Application Details | /candidate/applications/:id | View application status |
| Settings | /candidate/settings | Account settings |

---

# Recruiter Screens

| Screen | Route | Purpose |
|---------|-------|---------|
| Dashboard | /recruiter/dashboard | Recruitment overview |
| Company Profile | /recruiter/company | Manage company profile |
| Jobs | /recruiter/jobs | View all jobs |
| Create Job | /recruiter/jobs/create | Create a new job |
| Edit Job | /recruiter/jobs/:id/edit | Edit job posting |
| Applicants | /recruiter/jobs/:id/applicants | Manage applicants |
| Recruiter Settings | /recruiter/settings | Account settings |

---

# Admin Screens

| Screen | Route | Purpose |
|---------|-------|---------|
| Dashboard | /admin/dashboard | Platform overview |
| Companies | /admin/companies | Manage companies |
| Users | /admin/users | Manage users |
| Analytics | /admin/analytics | Platform metrics |
| Audit Logs | /admin/audit-logs | Security logs |
| Admin Settings | /admin/settings | Platform configuration |

---

# Shared Screens

| Screen | Purpose |
|---------|---------|
| 403 Forbidden | Unauthorized access |
| 404 Not Found | Invalid routes |
| 500 Server Error | Unexpected server error |
| Loading | Data loading state |
| Maintenance | Future maintenance page |

---

# MVP Summary

Public Screens: 7

Candidate Screens: 6

Recruiter Screens: 7

Admin Screens: 6

Shared Screens: 5

Total Screens: 31

---

End of Document