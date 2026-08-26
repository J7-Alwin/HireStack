import type { ComponentType } from 'react'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Building2,
  Shield,
  Settings,
  UserCheck,
  Activity,
  User,
} from 'lucide-react'
import { Role, type AuthUser } from '@/types'
import { hasAnyRole } from '@/features/auth/rbac/permissions'

export interface NavigationItem {
  readonly id: string
  readonly label: string
  readonly path: string
  readonly icon: ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  readonly allowedRoles: readonly Role[]
  readonly badge?: string | number
  readonly enabled?: boolean
  readonly children?: readonly NavigationItem[]
}

export interface NavigationSection {
  readonly id: string
  readonly title: string
  readonly items: readonly NavigationItem[]
}

/**
 * Super Admin Navigation Structure (Platform Level)
 */
export const SUPER_ADMIN_NAV_SECTIONS: readonly NavigationSection[] = [
  {
    id: 'platform',
    title: 'Platform',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        path: '/app',
        icon: LayoutDashboard,
        allowedRoles: [Role.SUPER_ADMIN],
        enabled: true,
      },
      {
        id: 'companies',
        label: 'Companies',
        path: '/app/companies',
        icon: Building2,
        allowedRoles: [Role.SUPER_ADMIN],
        enabled: false, // Future Phase module
      },
      {
        id: 'users',
        label: 'Users',
        path: '/app/users',
        icon: Users,
        allowedRoles: [Role.SUPER_ADMIN],
        enabled: false,
      },
    ],
  },
  {
    id: 'system',
    title: 'System',
    items: [
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        path: '/app/audit-logs',
        icon: Activity,
        allowedRoles: [Role.SUPER_ADMIN],
        enabled: false,
      },
      {
        id: 'system-settings',
        label: 'System Settings',
        path: '/app/system',
        icon: Shield,
        allowedRoles: [Role.SUPER_ADMIN],
        enabled: false,
      },
    ],
  },
]

/**
 * Company Admin & Recruiter Navigation Structure (Tenant Level)
 */
export const COMPANY_NAV_SECTIONS: readonly NavigationSection[] = [
  {
    id: 'main',
    title: 'Workspace',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        path: '/app',
        icon: LayoutDashboard,
        allowedRoles: [Role.COMPANY_ADMIN, Role.RECRUITER],
        enabled: true,
      },
      {
        id: 'jobs',
        label: 'Jobs',
        path: '/app/jobs',
        icon: Briefcase,
        allowedRoles: [Role.COMPANY_ADMIN, Role.RECRUITER],
        enabled: false,
      },
      {
        id: 'candidates',
        label: 'Candidates',
        path: '/app/candidates',
        icon: Users,
        allowedRoles: [Role.COMPANY_ADMIN, Role.RECRUITER],
        enabled: false,
      },
      {
        id: 'applications',
        label: 'Applications',
        path: '/app/applications',
        icon: FileText,
        allowedRoles: [Role.COMPANY_ADMIN, Role.RECRUITER],
        enabled: false,
      },
      {
        id: 'interviews',
        label: 'Interviews',
        path: '/app/interviews',
        icon: Calendar,
        allowedRoles: [Role.COMPANY_ADMIN, Role.RECRUITER],
        enabled: false,
      },
    ],
  },
  {
    id: 'admin',
    title: 'Administration',
    items: [
      {
        id: 'team',
        label: 'Team Members',
        path: '/app/team',
        icon: UserCheck,
        allowedRoles: [Role.COMPANY_ADMIN],
        enabled: false,
      },
      {
        id: 'company-settings',
        label: 'Settings',
        path: '/app/settings',
        icon: Settings,
        allowedRoles: [Role.COMPANY_ADMIN],
        enabled: false,
      },
    ],
  },
]

/**
 * Candidate Navigation Structure (Applicant Portal Level)
 */
export const CANDIDATE_NAV_SECTIONS: readonly NavigationSection[] = [
  {
    id: 'candidate',
    title: 'My Career',
    items: [
      {
        id: 'overview',
        label: 'Dashboard',
        path: '/app',
        icon: LayoutDashboard,
        allowedRoles: [Role.CANDIDATE],
        enabled: true,
      },
      {
        id: 'my-applications',
        label: 'My Applications',
        path: '/app/my-applications',
        icon: FileText,
        allowedRoles: [Role.CANDIDATE],
        enabled: false,
      },
      {
        id: 'my-interviews',
        label: 'Interviews',
        path: '/app/my-interviews',
        icon: Calendar,
        allowedRoles: [Role.CANDIDATE],
        enabled: false,
      },
      {
        id: 'profile',
        label: 'Profile',
        path: '/app/profile',
        icon: User,
        allowedRoles: [Role.CANDIDATE],
        enabled: false,
      },
    ],
  },
]

/**
 * Retrieves the role-filtered navigation sections for the active authenticated user.
 */
export function getNavigationForUser(user: AuthUser | null): NavigationSection[] {
  if (!user) return []

  let rawSections: readonly NavigationSection[] = []

  switch (user.role) {
    case Role.SUPER_ADMIN:
      rawSections = SUPER_ADMIN_NAV_SECTIONS
      break
    case Role.COMPANY_ADMIN:
    case Role.RECRUITER:
      rawSections = COMPANY_NAV_SECTIONS
      break
    case Role.CANDIDATE:
      rawSections = CANDIDATE_NAV_SECTIONS
      break
  }

  return rawSections
    .map((section) => {
      const filteredItems = section.items.filter(
        (item) => hasAnyRole(user, item.allowedRoles)
      )
      return {
        ...section,
        items: filteredItems,
      }
    })
    .filter((section) => section.items.length > 0)
}
