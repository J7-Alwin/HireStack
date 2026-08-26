import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import { Building2, ShieldCheck, User } from 'lucide-react'

export function CompanyContext() {
  const { user } = useAuth()

  if (!user) return null

  if (user.role === Role.SUPER_ADMIN) {
    return (
      <div
        data-testid="company-context-platform"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: 'var(--color-warm-white-subtle)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-pill)',
          fontSize: 'var(--text-caption)',
          fontWeight: 600,
          color: 'var(--color-charcoal)',
        }}
      >
        <ShieldCheck size={14} style={{ color: 'var(--color-accent-hover)' }} aria-hidden="true" />
        <span>Platform Admin</span>
      </div>
    )
  }

  if (user.role === Role.CANDIDATE) {
    return (
      <div
        data-testid="company-context-candidate"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: 'var(--color-warm-white-subtle)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-pill)',
          fontSize: 'var(--text-caption)',
          fontWeight: 600,
          color: 'var(--color-charcoal)',
        }}
      >
        <User size={14} aria-hidden="true" />
        <span>Candidate Portal</span>
      </div>
    )
  }

  return (
    <div
      data-testid="company-context-tenant"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        backgroundColor: 'var(--color-warm-white-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--text-caption)',
        fontWeight: 600,
        color: 'var(--color-charcoal)',
      }}
    >
      <Building2 size={14} aria-hidden="true" />
      <span>{user.companyId ? `Company Workspace (${user.companyId})` : 'Company Workspace'}</span>
    </div>
  )
}
